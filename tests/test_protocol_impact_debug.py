#!/usr/bin/env python3
"""
Tests for Protocol Impact Debug Mode.

Run with:
    cd mercury
    python -m pytest tests/test_protocol_impact_debug.py -v

Or without pytest:
    python tests/test_protocol_impact_debug.py
"""

import json
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

# Add diagnostics to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "diagnostics"))

from protocol_impact_debug import (
    GatingError,
    check_gates,
    generate_contrast_report,
    render_markdown,
)
from transformations import (
    p1_remove_bounded_scope,
    p2_inflate_to_site_level,
    p3_strengthen_language,
    p4_match_rejected_to_claim,
    simulate_unguided,
)

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def load_fixture(name: str) -> dict:
    with open(FIXTURES / name) as f:
        return json.load(f)


# ── Gate tests ──────────────────────────────────────────────────────

class TestGating(unittest.TestCase):
    """Dual-gate (feature flag + token) must both pass."""

    def test_gate_rejects_when_flag_not_set(self):
        """T1: No feature flag → GatingError."""
        env = {"MERCURY_PROTOCOL_DEBUG_TOKEN": "secret123"}
        with patch.dict(os.environ, env, clear=True):
            with self.assertRaises(GatingError) as ctx:
                check_gates("secret123")
            self.assertIn("not set", str(ctx.exception))

    def test_gate_rejects_when_token_not_configured(self):
        """T2: Flag set but no token configured → GatingError."""
        env = {"MERCURY_PROTOCOL_DEBUG_ENABLED": "true"}
        with patch.dict(os.environ, env, clear=True):
            with self.assertRaises(GatingError) as ctx:
                check_gates("anything")
            self.assertIn("not configured", str(ctx.exception))

    def test_gate_rejects_wrong_token(self):
        """T3: Flag set, token configured, but wrong token supplied → GatingError."""
        env = {
            "MERCURY_PROTOCOL_DEBUG_ENABLED": "true",
            "MERCURY_PROTOCOL_DEBUG_TOKEN": "correct-token",
        }
        with patch.dict(os.environ, env, clear=True):
            with self.assertRaises(GatingError) as ctx:
                check_gates("wrong-token")
            self.assertIn("does not match", str(ctx.exception))

    def test_gate_passes_when_both_gates_satisfied(self):
        """T4: Both gates satisfied → no error."""
        env = {
            "MERCURY_PROTOCOL_DEBUG_ENABLED": "true",
            "MERCURY_PROTOCOL_DEBUG_TOKEN": "correct-token",
        }
        with patch.dict(os.environ, env, clear=True):
            check_gates("correct-token")  # Should not raise


# ── P1 transformation tests ────────────────────────────────────────

class TestP1RemoveBoundedScope(unittest.TestCase):
    """P1: Remove bounded scope from negative claims."""

    def test_negative_reframe(self):
        text = "No dedicated investment case page was identified in the reviewed IR pages"
        result = p1_remove_bounded_scope(text)
        self.assertEqual(result, "There is no investment case page on the site.")

    def test_bounded_scope_pattern(self):
        text = "No data was found in the reviewed IR material"
        result = p1_remove_bounded_scope(text)
        self.assertIn("on the site", result)

    def test_no_change_when_no_scope(self):
        text = "The company has strong governance"
        result = p1_remove_bounded_scope(text)
        self.assertEqual(result, text)


# ── P2 transformation tests ────────────────────────────────────────

class TestP2InflateToSiteLevel(unittest.TestCase):
    """P2: Inflate page-level statements to site-level."""

    def test_page_contains_to_site_features(self):
        text = "The IR landing page contains three upcoming dates"
        result = p2_inflate_to_site_level(text)
        self.assertIn("site", result.lower())
        self.assertNotIn("IR landing page", result)

    def test_no_change_when_already_site_level(self):
        text = "The site features comprehensive reporting"
        result = p2_inflate_to_site_level(text)
        self.assertEqual(result, text)


# ── P3 transformation tests ────────────────────────────────────────

class TestP3StrengthenLanguage(unittest.TestCase):
    """P3: Replace hedged language with categorical assertions."""

    def test_appears_to(self):
        self.assertEqual(p3_strengthen_language("It appears to work"), "It is work")

    def test_may_be(self):
        self.assertEqual(p3_strengthen_language("This may be outdated"), "This is outdated")

    def test_based_on_evidence(self):
        result = p3_strengthen_language("Based on available evidence, the page is current")
        self.assertNotIn("Based on available evidence", result)
        self.assertIn("the page is current", result)

    def test_no_change_when_no_hedging(self):
        text = "The page is current"
        self.assertEqual(p3_strengthen_language(text), text)


# ── P4 transformation tests ────────────────────────────────────────

class TestP4RejectedCandidates(unittest.TestCase):
    """P4: Surface rejected candidates from claim_builder_errors."""

    def test_match_by_suggested_revision(self):
        errors = [
            {
                "candidate_statement": "The company has world-class ESG reporting",
                "suggested_revision": "The IR page includes an ESG section",
            }
        ]
        result = p4_match_rejected_to_claim("The IR page includes an ESG section", errors)
        self.assertEqual(result, "The company has world-class ESG reporting")

    def test_no_match(self):
        errors = [
            {
                "candidate_statement": "Unrelated claim",
                "suggested_revision": "Something else entirely",
            }
        ]
        result = p4_match_rejected_to_claim("The IR page includes an ESG section", errors)
        self.assertIsNone(result)


# ── Composite simulate_unguided tests ──────────────────────────────

class TestSimulateUnguided(unittest.TestCase):
    """End-to-end composite transformation."""

    def test_p4_takes_priority(self):
        claim = {"statement": "The IR page includes an ESG section"}
        errors = [
            {
                "candidate_statement": "Industry-leading ESG practices",
                "suggested_revision": "The IR page includes an ESG section",
            }
        ]
        result, rule = simulate_unguided(
            "The IR page includes an ESG section",
            claim=claim,
            claim_builder_errors=errors,
        )
        self.assertEqual(rule, "P4_rejected_candidate_surfaced")
        self.assertEqual(result, "Industry-leading ESG practices")

    def test_p1_applied(self):
        result, rule = simulate_unguided(
            "No dedicated page was identified in the reviewed IR pages"
        )
        self.assertEqual(rule, "P1_bounded_scope_removed")
        self.assertIn("on the site", result)

    def test_no_transformation(self):
        result, rule = simulate_unguided("The site has a clear layout")
        self.assertEqual(rule, "no_transformation")
        self.assertEqual(result, "The site has a clear layout")


# ── Contrast report tests ──────────────────────────────────────────

class TestContrastReport(unittest.TestCase):
    """Test full contrast report generation against fixture data."""

    def setUp(self):
        self.artefact = load_fixture("valid_brief_artefact.json")
        self.report = generate_contrast_report(self.artefact)

    def test_report_has_required_keys(self):
        for key in [
            "mode", "entity", "domain", "stage",
            "rendered_units_processed", "transformations_applied",
            "unchanged_units", "disclaimer", "contrast_pairs",
        ]:
            self.assertIn(key, self.report, f"Missing key: {key}")

    def test_mode_is_protocol_impact_debug(self):
        self.assertEqual(self.report["mode"], "protocol_impact_debug")

    def test_contrast_pairs_match_rendered_units(self):
        expected = len(self.artefact.get("rendered_units", []))
        self.assertEqual(len(self.report["contrast_pairs"]), expected)

    def test_each_pair_has_required_fields(self):
        for pair in self.report["contrast_pairs"]:
            for key in ["unit_id", "governed_text", "simulated_text",
                        "rule_applied", "changed"]:
                self.assertIn(key, pair)

    def test_ru003_negative_scope_transformed(self):
        """RU-003 has bounded negative — P1 should fire."""
        ru003 = [p for p in self.report["contrast_pairs"]
                 if p["unit_id"] == "RU-003"]
        self.assertEqual(len(ru003), 1)
        pair = ru003[0]
        self.assertTrue(pair["changed"])
        self.assertEqual(pair["rule_applied"], "P1_bounded_scope_removed")
        self.assertIn("on the site", pair["simulated_text"])

    def test_ru002_hedged_language_transformed(self):
        """RU-002 has 'appears to' — P3 should fire (after P2 check)."""
        ru002 = [p for p in self.report["contrast_pairs"]
                 if p["unit_id"] == "RU-002"]
        self.assertEqual(len(ru002), 1)
        pair = ru002[0]
        self.assertTrue(pair["changed"])

    def test_transformations_count(self):
        """At least some units should be transformed."""
        self.assertGreater(self.report["transformations_applied"], 0)


# ── Markdown rendering tests ───────────────────────────────────────

class TestMarkdownRendering(unittest.TestCase):
    """Test markdown output format."""

    def setUp(self):
        self.artefact = load_fixture("valid_brief_artefact.json")
        self.report = generate_contrast_report(self.artefact)
        self.markdown = render_markdown(self.report)

    def test_contains_title(self):
        self.assertIn("# Protocol Impact Debug Report", self.markdown)

    def test_contains_disclaimer(self):
        self.assertIn("SIMULATED", self.markdown)

    def test_contains_table_headers(self):
        self.assertIn("Governed (Mercury)", self.markdown)
        self.assertIn("Simulated (Unguided)", self.markdown)

    def test_contains_unit_ids(self):
        for ru in self.artefact.get("rendered_units", []):
            self.assertIn(ru["unit_id"], self.markdown)


if __name__ == "__main__":
    unittest.main()
