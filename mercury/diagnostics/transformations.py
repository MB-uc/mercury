"""
Deterministic transformation rules for protocol impact debug mode.

These rules simulate common unguided output patterns by mechanically
transforming governed Mercury wording. They do NOT run unconstrained
generation — they apply string-level transformations to existing
artefact data.

Rules:
  P1 — Remove bounded scope from negative claims
  P2 — Inflate page-level to site-level
  P3 — Strengthen hedged language to categorical
  P4 — Surface rejected candidates from claim_builder_errors
  P5 — (constraint) No invented facts
"""

from __future__ import annotations

import re
from typing import Any


# ── P1: Remove bounded scope from negative claims ──────────────────

# Patterns: "in the reviewed IR pages" → "on the site"
_BOUNDED_SCOPE_PATTERNS = [
    (r"\bin the reviewed [A-Za-z\s]+ pages\b", "on the site"),
    (r"\bin the reviewed [A-Za-z\s]+ material\b", "on the site"),
    (r"\bin the reviewed [A-Za-z\s]+ section\b", "on the site"),
    (r"\bon the [A-Za-z\s]+ landing page\b", "on the site"),
    (r"\bon the [A-Za-z\s]+ page\b", "on the site"),
    (r"\bin the [A-Za-z\s]+ section only\b", "across the site"),
    (r"\bin the [A-Za-z\s]+ section\b", "across the site"),
]

# "No dedicated X was identified in Y" → "There is no X on the site"
_NEGATIVE_REFRAME = re.compile(
    r"^No (?:dedicated )?(.+?) was (?:identified|found|observed) in .+$",
    re.IGNORECASE,
)


def p1_remove_bounded_scope(text: str) -> str:
    """Strip bounded scope qualifiers from negative claims."""
    # Try the structured reframe first
    m = _NEGATIVE_REFRAME.match(text.rstrip("."))
    if m:
        return f"There is no {m.group(1)} on the site."

    # Fall back to pattern replacement
    result = text
    for pattern, replacement in _BOUNDED_SCOPE_PATTERNS:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


# ── P2: Inflate page-level to site-level ───────────────────────────

_PAGE_TO_SITE = [
    (r"\bThe ([A-Za-z\s]+?) page contains\b", r"The site features"),
    (r"\bThe ([A-Za-z\s]+?) page includes\b", r"The site includes"),
    (r"\bThe ([A-Za-z\s]+?) page lists\b", r"The site lists"),
    (r"\bThe ([A-Za-z\s]+?) page provides\b", r"The site provides"),
    (r"\bThe ([A-Za-z\s]+?) page has\b", r"The site has"),
    (r"\bThe ([A-Za-z\s]+?) landing page\b", r"The site"),
    (r"\bon the ([A-Za-z\s]+?) page\b", r"on the site"),
    (r"\b([A-Za-z\s]+?) page only\b", r"the site"),
]


def p2_inflate_to_site_level(text: str) -> str:
    """Inflate page-level or section-level statements to site-level."""
    result = text
    for pattern, replacement in _PAGE_TO_SITE:
        result = re.sub(pattern, replacement, result, count=1, flags=re.IGNORECASE)
    return result


# ── P3: Strengthen hedged language to categorical ──────────────────

_HEDGE_TO_CATEGORICAL = [
    (r"\bappears to\b", "is"),
    (r"\bappear to\b", "are"),
    (r"\bsuggests that\b", "shows that"),
    (r"\bsuggesting\b", "showing"),
    (r"\bmay not have been\b", "has not been"),
    (r"\bmay be\b", "is"),
    (r"\bwas observed to\b", ""),
    (r"\bbased on available evidence,?\s*", ""),
    (r"\bin the material reviewed,?\s*", ""),
    (r"\bin the reviewed material,?\s*", ""),
]


def p3_strengthen_language(text: str) -> str:
    """Replace hedged/qualified language with categorical assertions."""
    result = text
    for pattern, replacement in _HEDGE_TO_CATEGORICAL:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    # Clean up double spaces
    result = re.sub(r"  +", " ", result).strip()
    return result


# ── P4: Surface rejected candidates ───────────────────────────────

def p4_get_rejected_candidate(
    claim_id: str,
    claim_builder_errors: list[dict[str, Any]],
) -> str | None:
    """Find a rejected candidate statement that matches this claim area."""
    for error in claim_builder_errors:
        # Match by suggested_revision (the governed version) to the claim
        suggested = error.get("suggested_revision", "")
        candidate = error.get("candidate_statement", "")
        if suggested and candidate:
            return candidate
    return None


def p4_match_rejected_to_claim(
    claim_statement: str,
    claim_builder_errors: list[dict[str, Any]],
) -> str | None:
    """Find a rejected candidate whose suggested_revision matches this claim."""
    claim_lower = claim_statement.lower().strip().rstrip(".")
    for error in claim_builder_errors:
        suggested = error.get("suggested_revision", "").lower().strip().rstrip(".")
        if suggested and suggested == claim_lower:
            return error.get("candidate_statement", "")
    return None


# ── Composite transformation ──────────────────────────────────────

def simulate_unguided(
    governed_text: str,
    claim: dict[str, Any] | None = None,
    claim_builder_errors: list[dict[str, Any]] | None = None,
) -> tuple[str, str]:
    """
    Apply P1-P5 transformations to produce simulated unguided text.

    Returns (simulated_text, primary_rule_applied).
    """
    errors = claim_builder_errors or []
    original = governed_text

    # P4 first: check if there's a rejected candidate for this claim
    if claim:
        statement = claim.get("statement", "")
        rejected = p4_match_rejected_to_claim(statement, errors)
        if rejected:
            return rejected, "P4_rejected_candidate_surfaced"

    # P1: negative scope removal
    result = p1_remove_bounded_scope(governed_text)
    if result != governed_text:
        # Also apply P3 to strengthen any remaining hedging
        result = p3_strengthen_language(result)
        return result, "P1_bounded_scope_removed"

    # P2: page-to-site inflation
    result = p2_inflate_to_site_level(governed_text)
    if result != governed_text:
        result = p3_strengthen_language(result)
        return result, "P2_inflated_to_site_level"

    # P3: strengthen hedged language
    result = p3_strengthen_language(governed_text)
    if result != governed_text:
        return result, "P3_hedged_language_strengthened"

    # No transformation applicable
    return governed_text, "no_transformation"
