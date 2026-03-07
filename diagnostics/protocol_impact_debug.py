#!/usr/bin/env python3
"""
Protocol Impact Debug Mode — main entry point.

Generates a side-by-side contrast view showing what a completed Mercury
artefact would look like WITHOUT protocol governance. Uses deterministic
P1-P5 transformations (no actual bypass of constraints).

Dual-gated:
  1. Feature flag:  MERCURY_PROTOCOL_DEBUG_ENABLED=true
  2. Rotatable token: MERCURY_PROTOCOL_DEBUG_TOKEN must match supplied token

Usage:
    python protocol_impact_debug.py <artefact.json> --token <TOKEN>
    python protocol_impact_debug.py <artefact.json> --token <TOKEN> --json
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import asdict, dataclass, field
from typing import Any

from transformations import simulate_unguided


# ── Gating ──────────────────────────────────────────────────────────

class GatingError(Exception):
    """Raised when dual-gate check fails."""


def check_gates(supplied_token: str) -> None:
    """Verify both gates are satisfied. Raises GatingError on failure."""
    flag = os.environ.get("MERCURY_PROTOCOL_DEBUG_ENABLED", "").lower()
    if flag != "true":
        raise GatingError(
            "MERCURY_PROTOCOL_DEBUG_ENABLED is not set to 'true'. "
            "Protocol impact debug mode is disabled."
        )

    expected_token = os.environ.get("MERCURY_PROTOCOL_DEBUG_TOKEN", "")
    if not expected_token:
        raise GatingError(
            "MERCURY_PROTOCOL_DEBUG_TOKEN is not configured. "
            "Set a rotatable token in the environment."
        )

    if supplied_token != expected_token:
        raise GatingError(
            "Supplied token does not match MERCURY_PROTOCOL_DEBUG_TOKEN."
        )


# ── Contrast pair ───────────────────────────────────────────────────

@dataclass
class ContrastPair:
    """A single governed vs simulated-unguided comparison."""
    unit_id: str
    section: str
    governed_text: str
    simulated_text: str
    rule_applied: str
    claim_ids: list[str] = field(default_factory=list)
    changed: bool = True


# ── Report generation ──────────────────────────────────────────────

def generate_contrast_report(artefact: dict[str, Any]) -> dict[str, Any]:
    """
    Process a validated Mercury artefact and produce contrast pairs
    for every rendered unit.

    Returns a structured report with metadata and contrast_pairs[].
    """
    rendered_units = artefact.get("rendered_units", [])
    claims = artefact.get("claims", [])
    claim_builder_errors = artefact.get("claim_builder_errors", [])

    # Build claim index
    claim_index: dict[str, dict] = {}
    for c in claims:
        if isinstance(c, dict) and "claim_id" in c:
            claim_index[c["claim_id"]] = c

    pairs: list[ContrastPair] = []
    transformations_applied = 0

    for ru in rendered_units:
        unit_id = ru.get("unit_id", "unknown")
        governed_text = ru.get("text", "")
        section = ru.get("section", "")
        claim_ids = ru.get("claim_ids", [])

        # Find the first matching claim for context
        claim = None
        for cid in claim_ids:
            if cid in claim_index:
                claim = claim_index[cid]
                break

        simulated, rule = simulate_unguided(
            governed_text,
            claim=claim,
            claim_builder_errors=claim_builder_errors,
        )

        changed = simulated != governed_text
        if changed:
            transformations_applied += 1

        pairs.append(ContrastPair(
            unit_id=unit_id,
            section=section,
            governed_text=governed_text,
            simulated_text=simulated,
            rule_applied=rule,
            claim_ids=claim_ids,
            changed=changed,
        ))

    return {
        "mode": "protocol_impact_debug",
        "entity": artefact.get("entity", ""),
        "domain": artefact.get("domain", ""),
        "stage": artefact.get("stage", ""),
        "rendered_units_processed": len(rendered_units),
        "transformations_applied": transformations_applied,
        "unchanged_units": len(rendered_units) - transformations_applied,
        "disclaimer": (
            "This is a SIMULATED view using deterministic text transformations. "
            "No unconstrained generation was performed. The 'simulated' column "
            "shows common patterns that Mercury protocols are designed to prevent."
        ),
        "contrast_pairs": [asdict(p) for p in pairs],
    }


# ── Markdown rendering ─────────────────────────────────────────────

def render_markdown(report: dict[str, Any]) -> str:
    """Render the contrast report as a readable markdown document."""
    lines = [
        "# Protocol Impact Debug Report",
        "",
        f"**Entity:** {report['entity']}",
        f"**Domain:** {report['domain']}",
        f"**Stage:** {report['stage']}",
        "",
        f"> {report['disclaimer']}",
        "",
        f"**Units processed:** {report['rendered_units_processed']}  ",
        f"**Transformations applied:** {report['transformations_applied']}  ",
        f"**Unchanged:** {report['unchanged_units']}",
        "",
        "---",
        "",
    ]

    for pair in report["contrast_pairs"]:
        status = "CHANGED" if pair["changed"] else "UNCHANGED"
        lines.append(f"## {pair['unit_id']} [{status}]")
        lines.append("")
        if pair["claim_ids"]:
            lines.append(f"**Claims:** {', '.join(pair['claim_ids'])}")
        if pair["section"]:
            lines.append(f"**Section:** {pair['section']}")
        lines.append(f"**Rule:** `{pair['rule_applied']}`")
        lines.append("")
        lines.append("| Governed (Mercury) | Simulated (Unguided) |")
        lines.append("|---|---|")
        gov = pair["governed_text"].replace("|", "\\|")
        sim = pair["simulated_text"].replace("|", "\\|")
        lines.append(f"| {gov} | {sim} |")
        lines.append("")

    return "\n".join(lines)


# ── CLI ─────────────────────────────────────────────────────────────

def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Usage: python protocol_impact_debug.py <artefact.json> "
            "--token <TOKEN> [--json]",
            file=sys.stderr,
        )
        return 2

    artefact_path = sys.argv[1]
    json_output = "--json" in sys.argv

    # Extract token
    token = ""
    if "--token" in sys.argv:
        idx = sys.argv.index("--token")
        if idx + 1 < len(sys.argv):
            token = sys.argv[idx + 1]

    # Gate check
    try:
        check_gates(token)
    except GatingError as e:
        print(f"ACCESS DENIED: {e}", file=sys.stderr)
        return 3

    # Load artefact
    try:
        with open(artefact_path) as f:
            artefact = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading artefact: {e}", file=sys.stderr)
        return 2

    report = generate_contrast_report(artefact)

    if json_output:
        print(json.dumps(report, indent=2))
    else:
        print(render_markdown(report))

    return 0


if __name__ == "__main__":
    sys.exit(main())
