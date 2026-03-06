#!/usr/bin/env python3
"""
Mercury artefact validator.

Reads a stage artefact JSON and checks claim governance rules.
Returns PASS, PASS_WITH_WARNINGS, or FAIL.

Usage:
    python validate_artefact.py <artefact.json>
    python validate_artefact.py <artefact.json> --json       # machine-readable output
    python validate_artefact.py <artefact.json> --quiet      # exit code only
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

from rules import ALL_RULES


@dataclass
class ValidationMessage:
    code: str
    severity: str       # "error" or "warning"
    location: str
    message: str
    claim_id: str | None = None
    details: dict[str, Any] | None = None


class ArtefactValidator:
    def __init__(self, artefact: dict[str, Any], artefact_path: str = ""):
        self.artefact = artefact
        self.artefact_path = artefact_path
        self.errors: list[ValidationMessage] = []
        self.warnings: list[ValidationMessage] = []

        # Build claim index for lookups
        self.claim_index: dict[str, dict] = {}
        for c in artefact.get("claims", []):
            if isinstance(c, dict) and "claim_id" in c:
                self.claim_index[c["claim_id"]] = c

    def error(self, code: str, location: str, message: str, *,
              claim_id: str | None = None, details: dict | None = None) -> None:
        self.errors.append(ValidationMessage(
            code=code, severity="error", location=location,
            message=message, claim_id=claim_id, details=details,
        ))

    def warn(self, code: str, location: str, message: str, *,
             claim_id: str | None = None, details: dict | None = None) -> None:
        self.warnings.append(ValidationMessage(
            code=code, severity="warning", location=location,
            message=message, claim_id=claim_id, details=details,
        ))

    def validate(self) -> dict[str, Any]:
        for rule_fn in ALL_RULES:
            rule_fn(self)

        if self.errors:
            status = "FAIL"
        elif self.warnings:
            status = "PASS_WITH_WARNINGS"
        else:
            status = "PASS"

        return {
            "status": status,
            "artefact_path": self.artefact_path,
            "summary": {
                "errors": len(self.errors),
                "warnings": len(self.warnings),
                "claims_checked": len(self.artefact.get("claims", [])),
                "findings_checked": len(self.artefact.get("findings", [])),
                "recommendations_checked": len(
                    self.artefact.get("synthesis", {}).get("priorities", [])
                ),
                "rendered_units_checked": len(self.artefact.get("rendered_units", [])),
            },
            "errors": [asdict(e) for e in self.errors],
            "warnings": [asdict(w) for w in self.warnings],
        }


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python validate_artefact.py <artefact.json> [--json] [--quiet]",
              file=sys.stderr)
        return 2

    artefact_path = sys.argv[1]
    json_output = "--json" in sys.argv
    quiet = "--quiet" in sys.argv

    try:
        with open(artefact_path) as f:
            artefact = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading artefact: {e}", file=sys.stderr)
        return 2

    validator = ArtefactValidator(artefact, artefact_path)
    result = validator.validate()

    if json_output:
        print(json.dumps(result, indent=2))
    elif not quiet:
        status = result["status"]
        s = result["summary"]
        print(f"\n{'=' * 60}")
        print(f"Mercury Artefact Validator — {status}")
        print(f"{'=' * 60}")
        print(f"  Artefact:       {artefact_path}")
        print(f"  Claims:         {s['claims_checked']}")
        print(f"  Findings:       {s['findings_checked']}")
        print(f"  Recommendations:{s['recommendations_checked']}")
        print(f"  Rendered units: {s['rendered_units_checked']}")
        print(f"  Errors:         {s['errors']}")
        print(f"  Warnings:       {s['warnings']}")
        print()

        if result["errors"]:
            print("ERRORS:")
            for e in result["errors"]:
                print(f"  [{e['code']}] {e['location']}")
                print(f"    {e['message']}")
                if e.get("claim_id"):
                    print(f"    claim_id: {e['claim_id']}")
                if e.get("details"):
                    for k, val in e["details"].items():
                        print(f"    {k}: {val}")
                print()

        if result["warnings"]:
            print("WARNINGS:")
            for w in result["warnings"]:
                print(f"  [{w['code']}] {w['location']}")
                print(f"    {w['message']}")
                if w.get("claim_id"):
                    print(f"    claim_id: {w['claim_id']}")
                print()

    # Exit codes: 0 = PASS, 1 = FAIL, 0 = PASS_WITH_WARNINGS
    return 1 if result["status"] == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
