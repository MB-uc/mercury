#!/usr/bin/env python3
"""
Tests for Protocol Intervention Log.

Verifies:
1. Claim rejection produces intervention log entry
2. Scope bounding produces intervention log entry
3. Rendering modification produces intervention log entry
4. Artefacts remain valid when protocol_interventions is absent
5. Intervention entries include required fields
6. Intervention logging does not change claim or finding outputs

Run with:
    cd mercury
    python -m unittest tests.test_intervention_log -v
"""

import json
import sys
import unittest
from copy import deepcopy
from pathlib import Path

# Add paths
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "validators"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "diagnostics"))

from validate_artefact import ArtefactValidator
from intervention_logger import InterventionLogger

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def load_fixture(name: str) -> dict:
    with open(FIXTURES / name) as f:
        return json.load(f)


# ── T1: Claim rejection produces intervention entry ────────────────

class TestClaimRejectionIntervention(unittest.TestCase):
    """T1: Logging a claim rejection produces a valid intervention entry."""

    def test_claim_rejected_entry(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_claim_rejected(
            original_candidate="There is no investment case page on the site",
            reason="Single-section evidence does not justify site-wide absence claim",
            protocol_rule="unsupported_site_wide_claim",
            evidence_ids=["E-010"],
        )
        self.assertEqual(entry["action"], "claim_rejected")
        self.assertEqual(entry["protocol_rule"], "unsupported_site_wide_claim")
        self.assertEqual(entry["stage"], "brief")
        self.assertIn("PI-", entry["intervention_id"])
        self.assertIn("E-010", entry["evidence_ids"])
        self.assertEqual(len(logger), 1)

    def test_multiple_rejections_get_unique_ids(self):
        logger = InterventionLogger(stage="brief")
        e1 = logger.log_claim_rejected("Claim A", "Reason A")
        e2 = logger.log_claim_rejected("Claim B", "Reason B")
        self.assertNotEqual(e1["intervention_id"], e2["intervention_id"])
        self.assertEqual(len(logger), 2)


# ── T2: Scope bounding produces intervention entry ────────────────

class TestScopeBoundingIntervention(unittest.TestCase):
    """T2: Logging a scope bounding produces a valid intervention entry."""

    def test_scope_bounded_entry(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_scope_bounded(
            claim_id="C-003",
            original_candidate="There is no investment case page on the site",
            final_output="No dedicated investment case page was identified in the reviewed IR pages",
            reason="Scope narrowed to match evidence boundary",
        )
        self.assertEqual(entry["action"], "claim_scope_bounded")
        self.assertEqual(entry["protocol_rule"], "negative_scope_bounded")
        self.assertEqual(entry["claim_id"], "C-003")
        self.assertIn("original_candidate", entry)
        self.assertIn("final_output", entry)


# ── T3: Rendering modification produces intervention entry ────────

class TestRenderModificationIntervention(unittest.TestCase):
    """T3: Logging a render modification produces a valid intervention entry."""

    def test_render_scope_bounded_entry(self):
        logger = InterventionLogger(stage="render")
        entry = logger.log_render_modification(
            claim_id="C-010",
            original_candidate="There is no investment case page anywhere on the site.",
            final_output="No dedicated investment case page was identified in the reviewed IR pages.",
            reason="Rendered text inflated bounded claim scope",
            protocol_rule="render_scope_bounded",
        )
        self.assertEqual(entry["action"], "render_scope_bounded")
        self.assertEqual(entry["stage"], "render")

    def test_certainty_language_adjusted_entry(self):
        logger = InterventionLogger(stage="render")
        entry = logger.log_render_modification(
            claim_id="C-L001",
            original_candidate="This definitively confirms job listings exist",
            final_output="The careers section includes job listings",
            reason="Provisional legacy claim cannot use high-certainty language",
            protocol_rule="certainty_language_adjusted",
        )
        self.assertEqual(entry["action"], "render_language_weakened")
        self.assertEqual(entry["protocol_rule"], "certainty_language_adjusted")


# ── T4: Artefacts valid without protocol_interventions ─────────────

class TestAbsenceIsValid(unittest.TestCase):
    """T4: Artefacts without protocol_interventions remain valid."""

    def test_valid_artefact_without_interventions(self):
        artefact = load_fixture("valid_brief_artefact.json")
        # Remove protocol_interventions to test absence
        artefact_no_pi = deepcopy(artefact)
        artefact_no_pi.pop("protocol_interventions", None)
        result = ArtefactValidator(artefact_no_pi).validate()
        self.assertEqual(result["status"], "PASS")

    def test_valid_artefact_with_interventions_still_passes(self):
        artefact = load_fixture("valid_brief_artefact.json")
        result = ArtefactValidator(artefact).validate()
        self.assertEqual(result["status"], "PASS")


# ── T5: Intervention entries include required fields ──────────────

class TestInterventionRequiredFields(unittest.TestCase):
    """T5: Every intervention entry has all required fields."""

    REQUIRED = {"intervention_id", "stage", "protocol_rule", "action", "reason", "timestamp"}

    def test_claim_rejected_has_required_fields(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_claim_rejected("Candidate text", "Rejection reason")
        self.assertTrue(self.REQUIRED.issubset(entry.keys()))

    def test_scope_bounded_has_required_fields(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_scope_bounded("C-001", "Before", "After", "Reason")
        self.assertTrue(self.REQUIRED.issubset(entry.keys()))

    def test_render_modification_has_required_fields(self):
        logger = InterventionLogger(stage="render")
        entry = logger.log_render_modification("C-001", "Before", "After", "Reason")
        self.assertTrue(self.REQUIRED.issubset(entry.keys()))

    def test_legacy_restricted_has_required_fields(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_legacy_restricted("C-L001", "Legacy claim restricted")
        self.assertTrue(self.REQUIRED.issubset(entry.keys()))

    def test_validator_failure_has_required_fields(self):
        logger = InterventionLogger(stage="brief")
        entry = logger.log_validator_failure("Artefact failed V006")
        self.assertTrue(self.REQUIRED.issubset(entry.keys()))

    def test_validator_catches_missing_fields(self):
        """V014 flags intervention entries with missing required fields."""
        artefact = load_fixture("valid_brief_artefact.json")
        artefact["protocol_interventions"] = [
            {"intervention_id": "PI-999"}  # Missing most required fields
        ]
        result = ArtefactValidator(artefact).validate()
        codes = [e["code"] for e in result["errors"]]
        self.assertIn("V014_INVALID_INTERVENTION_ENTRY", codes)

    def test_validator_catches_duplicate_ids(self):
        """V014 flags duplicate intervention IDs."""
        artefact = load_fixture("valid_brief_artefact.json")
        entry = {
            "intervention_id": "PI-001",
            "stage": "brief",
            "protocol_rule": "unsupported_site_wide_claim",
            "action": "claim_rejected",
            "reason": "Test",
            "timestamp": "2026-03-06T10:00:00Z",
        }
        artefact["protocol_interventions"] = [entry, deepcopy(entry)]
        result = ArtefactValidator(artefact).validate()
        codes = [e["code"] for e in result["errors"]]
        self.assertIn("V014_DUPLICATE_INTERVENTION_ID", codes)


# ── T6: Logging does not change claim or finding outputs ──────────

class TestNoSideEffects(unittest.TestCase):
    """T6: Intervention logging does not alter claims or findings."""

    def test_logger_does_not_modify_claims(self):
        artefact = load_fixture("valid_brief_artefact.json")
        claims_before = deepcopy(artefact["claims"])
        findings_before = deepcopy(artefact["findings"])

        # Simulate logging interventions
        logger = InterventionLogger(stage="brief")
        logger.log_claim_rejected("Candidate", "Reason")
        logger.log_scope_bounded("C-003", "Before", "After", "Reason")

        # Attach to artefact
        artefact["protocol_interventions"] = logger.entries()

        # Validate — claims and findings must be unchanged
        self.assertEqual(artefact["claims"], claims_before)
        self.assertEqual(artefact["findings"], findings_before)

    def test_validator_results_unchanged_by_interventions(self):
        """Adding valid interventions should not change PASS→FAIL or vice versa."""
        artefact = load_fixture("valid_brief_artefact.json")

        result_without = ArtefactValidator(deepcopy(artefact)).validate()

        logger = InterventionLogger(stage="brief")
        logger.log_claim_rejected("Test candidate", "Test reason")
        logger.log_scope_bounded("C-003", "Before", "After", "Reason")
        artefact["protocol_interventions"] = logger.entries()

        result_with = ArtefactValidator(artefact).validate()

        self.assertEqual(result_without["status"], result_with["status"])
        self.assertEqual(result_without["summary"]["errors"], result_with["summary"]["errors"])
        # Compare full error and warning outputs, not just counts
        self.assertEqual(result_without["errors"], result_with["errors"])
        self.assertEqual(result_without["warnings"], result_with["warnings"])


if __name__ == "__main__":
    unittest.main()
