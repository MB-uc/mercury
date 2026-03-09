#!/usr/bin/env python3
"""
Tests for Mercury artefact validator.

Run with:
    cd mercury
    python -m pytest tests/test_validate_artefact.py -v

Or without pytest:
    python tests/test_validate_artefact.py
"""

import json
import sys
import unittest
from pathlib import Path

# Add validators to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "validators"))

from validate_artefact import ArtefactValidator

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def load_fixture(name: str) -> dict:
    with open(FIXTURES / name) as f:
        return json.load(f)


class TestValidArtefact(unittest.TestCase):
    """Valid artefact should PASS with no errors."""

    def setUp(self):
        self.artefact = load_fixture("valid_brief_artefact.json")
        self.result = ArtefactValidator(self.artefact).validate()

    def test_passes(self):
        self.assertEqual(self.result["status"], "PASS")

    def test_no_errors(self):
        self.assertEqual(self.result["summary"]["errors"], 0)

    def test_claims_checked(self):
        self.assertEqual(self.result["summary"]["claims_checked"], 3)

    def test_findings_checked(self):
        self.assertEqual(self.result["summary"]["findings_checked"], 2)

    def test_rendered_units_checked(self):
        self.assertEqual(self.result["summary"]["rendered_units_checked"], 3)


class TestSiteWideClaim(unittest.TestCase):
    """Artefact with site-wide claims from single-section evidence should FAIL."""

    def setUp(self):
        self.artefact = load_fixture("invalid_sitewide_claim_artefact.json")
        self.result = ArtefactValidator(self.artefact).validate()

    def test_fails(self):
        self.assertEqual(self.result["status"], "FAIL")

    def test_v005_duplicate_claim_id(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V005_DUPLICATE_CLAIM_ID", codes)

    def test_v003_invalid_certainty(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V003_INVALID_CERTAINTY", codes)

    def test_v004_invalid_status(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V004_INVALID_STATUS", codes)

    def test_v006_unscoped_negative(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V006_UNSCOPED_NEGATIVE", codes)

    def test_v007_unsupported_site_wide(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V007_UNSUPPORTED_SITE_WIDE_CLAIM", codes)

    def test_v009_finding_without_claims(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V009_FINDING_WITHOUT_CLAIMS", codes)

    def test_v010_recommendation_without_claims(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V010_RECOMMENDATION_WITHOUT_CLAIMS", codes)

    def test_v012_render_scope_exceeded(self):
        codes = [e["code"] for e in self.result["errors"]]
        self.assertIn("V012_RENDER_SCOPE_EXCEEDED", codes)


class TestRenderScopeExceeded(unittest.TestCase):
    """Artefact with rendered text exceeding claim scope should FAIL."""

    def setUp(self):
        self.artefact = load_fixture("invalid_render_scope_artefact.json")
        self.result = ArtefactValidator(self.artefact).validate()

    def test_fails(self):
        self.assertEqual(self.result["status"], "FAIL")

    def test_ru020_scope_inflation(self):
        """RU-020: 'across the entire site' exceeds claim scope 'about us page only'."""
        scope_errors = [
            e for e in self.result["errors"]
            if e["code"] == "V012_RENDER_SCOPE_EXCEEDED"
            and e.get("location") == "rendered_units[0]"
        ]
        self.assertGreater(len(scope_errors), 0,
                           "Expected scope inflation error for RU-020 (rendered_units[0])")

    def test_ru021_negative_inflation(self):
        """RU-021: 'anywhere on the site' exceeds claim scope 'sustainability landing page'."""
        scope_errors = [
            e for e in self.result["errors"]
            if e["code"] == "V012_RENDER_SCOPE_EXCEEDED"
            and e.get("location") == "rendered_units[1]"
        ]
        self.assertGreater(len(scope_errors), 0,
                           "Expected negative scope inflation error for RU-021 (rendered_units[1])")

    def test_ru022_legacy_high_certainty(self):
        """RU-022: 'definitively' with provisional_legacy claims."""
        scope_errors = [
            e for e in self.result["errors"]
            if e["code"] == "V012_RENDER_SCOPE_EXCEEDED"
            and e.get("location") == "rendered_units[2]"
        ]
        self.assertGreater(len(scope_errors), 0,
                           "Expected high-certainty language error for provisional_legacy RU-022 (rendered_units[2])")

    def test_ru023_superseded_only(self):
        """RU-023 references only a superseded claim."""
        superseded_errors = [
            e for e in self.result["errors"]
            if e["code"] == "V013_SUPERSEDED_CLAIM_RENDERED"
            and e.get("location") == "rendered_units[3]"
        ]
        self.assertGreater(len(superseded_errors), 0,
                           "Expected superseded claim rendering error for RU-023 (rendered_units[3])")

    def test_provisional_legacy_warning(self):
        """C-L001 should trigger a provisional_legacy warning."""
        warn_codes = [w["code"] for w in self.result["warnings"]]
        self.assertIn("V008_PROVISIONAL_LEGACY_PRESENT", warn_codes)


class TestMinimalArtefact(unittest.TestCase):
    """An artefact with no claims should fail V001 for missing recommended fields
    but findings without claim_ids should also fail."""

    def test_empty_claims_still_validates_structure(self):
        artefact = {
            "stage": "brief",
            "entity": "Test Corp",
            "domain": "test.com",
            "claims": [],
            "findings": [
                {"id": "F-001", "classification": "FACT", "claim": "Test"}
            ],
        }
        result = ArtefactValidator(artefact).validate()
        self.assertEqual(result["status"], "FAIL")
        codes = [e["code"] for e in result["errors"]]
        self.assertIn("V009_FINDING_WITHOUT_CLAIMS", codes)

    def test_missing_required_top_level(self):
        artefact = {"stage": "brief"}
        result = ArtefactValidator(artefact).validate()
        self.assertEqual(result["status"], "FAIL")
        codes = [e["code"] for e in result["errors"]]
        self.assertIn("V001_MISSING_TOP_LEVEL_FIELD", codes)


if __name__ == "__main__":
    unittest.main()
