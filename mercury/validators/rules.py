"""
Mercury artefact validation rules.

Each rule is a function that takes the validator instance and appends
errors/warnings. Rules are deterministic — no LLM inference, no fuzzy
matching beyond simple string containment.
"""

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from validate_artefact import ArtefactValidator

# ── Vocabulary constants ────────────────────────────────────────────

ALLOWED_CERTAINTY = {"confirmed", "observed", "inferred", "not_assessed"}
ALLOWED_STATUS = {"active", "superseded", "disputed", "withdrawn", "provisional_legacy"}
ALLOWED_CLAIM_TYPE = {"fact", "inference", "gap", "recommendation_support", "judgement_support"}
ALLOWED_METHOD = {"web_fetch", "web_search", "benchmark_snapshot", "prior_stage_artefact", "manual_override"}
ALLOWED_STAGE = {"brief", "compete", "sitemap", "meeting"}

REQUIRED_TOP_LEVEL = ["stage", "entity", "domain", "claims", "findings"]
RECOMMENDED_TOP_LEVEL = ["gap_analysis", "synthesis", "claim_builder_errors", "rendered_units"]

REQUIRED_CLAIM_FIELDS = [
    "claim_id", "entity", "domain", "stage", "statement",
    "claim_type", "scope", "certainty", "method", "status", "created_at",
]

# ── Negative / site-wide language patterns ──────────────────────────

NEGATIVE_PHRASES = [
    "no ", "not ", "absent", "missing", "did not reveal",
    "not identified", "not found", "does not have", "there is no",
]

SITE_WIDE_PHRASES = [
    "the site", "the company", "anywhere on the site",
    "across the site", "does not have", "there is no",
    "nowhere on", "site-wide", "the entire site",
]

# Scopes that are too broad to be valid for bounded negative claims
UNIVERSAL_SCOPES = {
    "", "site", "company", "the site", "the company",
    "company-wide", "site-wide", "entire site",
}


def _lower(text: str) -> str:
    return text.lower().strip()


def _contains_any(text: str, phrases: list[str]) -> bool:
    low = _lower(text)
    return any(p in low for p in phrases)


def _distinct_evidence_areas(validator: "ArtefactValidator", evidence_ids: list[str]) -> int:
    """Count distinct evidence areas/sections across the given evidence IDs."""
    evidence_items = validator.artefact.get("evidence_items", [])
    ei_index = {}
    for ei in evidence_items:
        eid = ei.get("evidence_id") or ei.get("id")
        if eid:
            ei_index[eid] = ei

    areas = set()
    for eid in evidence_ids:
        ei = ei_index.get(eid, {})
        area = ei.get("evidence_area") or ei.get("section") or ei.get("source_url", "")
        if area:
            areas.add(area)
    return len(areas)


# ── V001: Required top-level fields ────────────────────────────────

def v001_top_level_fields(v: "ArtefactValidator") -> None:
    for field in REQUIRED_TOP_LEVEL:
        if field not in v.artefact:
            v.error("V001_MISSING_TOP_LEVEL_FIELD", f"(root)", f"Required top-level field '{field}' is missing")
    for field in RECOMMENDED_TOP_LEVEL:
        if field not in v.artefact:
            v.warn("V001_MISSING_TOP_LEVEL_FIELD", f"(root)", f"Recommended top-level field '{field}' is missing")


# ── V002: Claim required fields ────────────────────────────────────

def v002_claim_required_fields(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        for field in REQUIRED_CLAIM_FIELDS:
            if field not in claim or claim[field] is None or claim[field] == "":
                v.error("V002_MISSING_CLAIM_FIELD", f"claims[{i}]",
                        f"Claim {cid} is missing required field '{field}'", claim_id=cid)

        # Evidence linkage: required unless method is prior_stage_artefact
        method = claim.get("method", "")
        evidence_ids = claim.get("evidence_ids", [])
        if method != "prior_stage_artefact" and not evidence_ids:
            v.error("V002_MISSING_CLAIM_FIELD", f"claims[{i}]",
                    f"Claim {cid} has no evidence_ids and method is '{method}' (not prior_stage_artefact)",
                    claim_id=cid)


# ── V003: Allowed certainty values ─────────────────────────────────

def v003_certainty_vocabulary(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        certainty = claim.get("certainty", "")
        if certainty and certainty not in ALLOWED_CERTAINTY:
            v.error("V003_INVALID_CERTAINTY", f"claims[{i}]",
                    f"Claim {cid} has invalid certainty '{certainty}'. Allowed: {sorted(ALLOWED_CERTAINTY)}",
                    claim_id=cid)


# ── V004: Allowed status values ────────────────────────────────────

def v004_status_vocabulary(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        status = claim.get("status", "")
        if status and status not in ALLOWED_STATUS:
            v.error("V004_INVALID_STATUS", f"claims[{i}]",
                    f"Claim {cid} has invalid status '{status}'. Allowed: {sorted(ALLOWED_STATUS)}",
                    claim_id=cid)


# ── V005: Unique claim IDs ─────────────────────────────────────────

def v005_unique_claim_ids(v: "ArtefactValidator") -> None:
    seen: dict[str, int] = {}
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", "")
        if cid in seen:
            v.error("V005_DUPLICATE_CLAIM_ID", f"claims[{i}]",
                    f"Duplicate claim_id '{cid}' (first seen at claims[{seen[cid]}])", claim_id=cid)
        else:
            seen[cid] = i


# ── V006: Negative claims must be explicitly bounded ───────────────

def v006_unscoped_negative(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        statement = claim.get("statement", "")
        scope = claim.get("scope", "")

        if not _contains_any(statement, NEGATIVE_PHRASES):
            continue

        # Scope must exist and not be universal
        if _lower(scope) in UNIVERSAL_SCOPES:
            v.error("V006_UNSCOPED_NEGATIVE", f"claims[{i}]",
                    f"Negative claim {cid} has universal or empty scope '{scope}'. "
                    f"Negative claims must be explicitly bounded.",
                    claim_id=cid,
                    details={"statement": statement, "scope": scope})


# ── V007: Unsupported site-wide claims forbidden ──────────────────

def v007_unsupported_site_wide(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        statement = claim.get("statement", "")
        evidence_ids = claim.get("evidence_ids", [])

        if not _contains_any(statement, SITE_WIDE_PHRASES):
            continue

        distinct = _distinct_evidence_areas(v, evidence_ids)
        if distinct < 2:
            v.error("V007_UNSUPPORTED_SITE_WIDE_CLAIM", f"claims[{i}]",
                    f"Site-wide claim {cid} requires evidence from at least two distinct "
                    f"sections or evidence areas (found {distinct})",
                    claim_id=cid,
                    details={
                        "statement": statement,
                        "evidence_ids": evidence_ids,
                        "distinct_evidence_areas": distinct,
                    })


# ── V008: Provisional legacy restrictions ──────────────────────────

def v008_provisional_legacy(v: "ArtefactValidator") -> None:
    for i, claim in enumerate(v.artefact.get("claims", [])):
        cid = claim.get("claim_id", f"claims[{i}]")
        if claim.get("status") != "provisional_legacy":
            continue

        # Warn on presence
        v.warn("V008_PROVISIONAL_LEGACY_PRESENT", f"claims[{i}]",
               f"Provisional legacy claim {cid} is present and has reduced trust semantics",
               claim_id=cid)

        # Fail if certainty is confirmed
        if claim.get("certainty") == "confirmed":
            v.error("V008_PROVISIONAL_LEGACY_OVERREACH", f"claims[{i}]",
                    f"Provisional legacy claim {cid} cannot have certainty 'confirmed'",
                    claim_id=cid)

        # Fail if scope is site-wide
        scope = claim.get("scope", "")
        if _lower(scope) in UNIVERSAL_SCOPES or _contains_any(scope, ["site", "company-wide"]):
            v.error("V008_PROVISIONAL_LEGACY_OVERREACH", f"claims[{i}]",
                    f"Provisional legacy claim {cid} cannot have site-wide scope '{scope}'",
                    claim_id=cid)

        # Fail if linked to a rendered unit with universal negative
        statement = claim.get("statement", "")
        if _contains_any(statement, SITE_WIDE_PHRASES) and _contains_any(statement, NEGATIVE_PHRASES):
            v.error("V008_PROVISIONAL_LEGACY_OVERREACH", f"claims[{i}]",
                    f"Provisional legacy claim {cid} makes a universal negative site-wide statement",
                    claim_id=cid,
                    details={"statement": statement})


# ── V009: Findings must map to claims ──────────────────────────────

def v009_finding_claims(v: "ArtefactValidator") -> None:
    for i, finding in enumerate(v.artefact.get("findings", [])):
        fid = finding.get("id", f"findings[{i}]")
        claim_ids = finding.get("claim_ids")

        if claim_ids is None or not isinstance(claim_ids, list):
            v.error("V009_FINDING_WITHOUT_CLAIMS", f"findings[{i}]",
                    f"Finding {fid} has no claim_ids field")
            continue

        if len(claim_ids) == 0:
            v.error("V009_FINDING_WITHOUT_CLAIMS", f"findings[{i}]",
                    f"Finding {fid} has empty claim_ids")
            continue

        for cid in claim_ids:
            if cid not in v.claim_index:
                v.error("V009_FINDING_WITHOUT_CLAIMS", f"findings[{i}]",
                        f"Finding {fid} references non-existent claim '{cid}'")


# ── V010: Recommendations must map to claims ───────────────────────

def v010_recommendation_claims(v: "ArtefactValidator") -> None:
    priorities = v.artefact.get("synthesis", {}).get("priorities", [])
    for i, rec in enumerate(priorities):
        claim_ids = rec.get("claim_ids")
        rec_desc = rec.get("recommendation", f"priorities[{i}]")

        if claim_ids is None or not isinstance(claim_ids, list):
            v.error("V010_RECOMMENDATION_WITHOUT_CLAIMS", f"synthesis.priorities[{i}]",
                    f"Recommendation '{rec_desc}' has no claim_ids field")
            continue

        if len(claim_ids) == 0:
            v.error("V010_RECOMMENDATION_WITHOUT_CLAIMS", f"synthesis.priorities[{i}]",
                    f"Recommendation '{rec_desc}' has empty claim_ids")
            continue

        for cid in claim_ids:
            if cid not in v.claim_index:
                v.error("V010_RECOMMENDATION_WITHOUT_CLAIMS", f"synthesis.priorities[{i}]",
                        f"Recommendation '{rec_desc}' references non-existent claim '{cid}'")


# ── V011: Rendered units must map to claims ────────────────────────

def v011_rendered_unit_claims(v: "ArtefactValidator") -> None:
    for i, ru in enumerate(v.artefact.get("rendered_units", [])):
        uid = ru.get("unit_id", f"rendered_units[{i}]")
        claim_ids = ru.get("claim_ids")

        if claim_ids is None or not isinstance(claim_ids, list):
            v.error("V011_RENDERED_UNIT_WITHOUT_CLAIMS", f"rendered_units[{i}]",
                    f"Rendered unit {uid} has no claim_ids field")
            continue

        if len(claim_ids) == 0:
            v.error("V011_RENDERED_UNIT_WITHOUT_CLAIMS", f"rendered_units[{i}]",
                    f"Rendered unit {uid} has empty claim_ids")
            continue

        for cid in claim_ids:
            if cid not in v.claim_index:
                v.error("V011_RENDERED_UNIT_WITHOUT_CLAIMS", f"rendered_units[{i}]",
                        f"Rendered unit {uid} references non-existent claim '{cid}'")


# ── V012: Rendered language must not exceed claim scope ────────────

def v012_render_scope_exceeded(v: "ArtefactValidator") -> None:
    for i, ru in enumerate(v.artefact.get("rendered_units", [])):
        uid = ru.get("unit_id", f"rendered_units[{i}]")
        text = ru.get("text", "")
        claim_ids = ru.get("claim_ids", [])
        if not claim_ids or not text:
            continue

        linked_claims = [v.claim_index[cid] for cid in claim_ids if cid in v.claim_index]
        if not linked_claims:
            continue

        # Check 1: If all linked claims are page/section-bounded, text must not
        # contain unscoped site-wide language
        all_bounded = all(
            _lower(c.get("scope", "")) not in UNIVERSAL_SCOPES
            for c in linked_claims
        )
        if all_bounded and _contains_any(text, SITE_WIDE_PHRASES):
            scopes = [c.get("scope", "") for c in linked_claims]
            v.error("V012_RENDER_SCOPE_EXCEEDED", f"rendered_units[{i}]",
                    f"Rendered unit {uid} uses site-wide language but linked claims are "
                    f"bounded to: {scopes}",
                    details={"text": text, "claim_scopes": scopes})

        # Check 2: If linked claims are negative and bounded, text must preserve
        # boundedness
        for claim in linked_claims:
            stmt = claim.get("statement", "")
            scope = claim.get("scope", "")
            if _contains_any(stmt, NEGATIVE_PHRASES) and scope:
                # The rendered text should contain some reference to the bounded scope
                # or at least not make a universal negative
                if _contains_any(text, ["the site", "anywhere on", "across the site"]):
                    if not _contains_any(text, [_lower(scope)]):
                        v.error("V012_RENDER_SCOPE_EXCEEDED", f"rendered_units[{i}]",
                                f"Rendered unit {uid} inflates bounded negative claim "
                                f"{claim.get('claim_id')} (scope: '{scope}') to site-wide language",
                                claim_id=claim.get("claim_id"),
                                details={"text": text, "claim_scope": scope})

        # Check 3: If all linked claims are provisional_legacy, text must not use
        # high-certainty language
        all_legacy = all(c.get("status") == "provisional_legacy" for c in linked_claims)
        if all_legacy:
            high_certainty_phrases = [
                "confirms", "definitively", "certainly", "clearly demonstrates",
                "proven", "established that", "undeniably",
            ]
            if _contains_any(text, high_certainty_phrases):
                v.error("V012_RENDER_SCOPE_EXCEEDED", f"rendered_units[{i}]",
                        f"Rendered unit {uid} uses high-certainty language but all linked "
                        f"claims are provisional_legacy",
                        details={"text": text})


# ── V013: Superseded claims should not drive active rendering ──────

def v013_superseded_rendered(v: "ArtefactValidator") -> None:
    dead_statuses = {"superseded", "withdrawn"}

    for i, ru in enumerate(v.artefact.get("rendered_units", [])):
        uid = ru.get("unit_id", f"rendered_units[{i}]")
        claim_ids = ru.get("claim_ids", [])
        if not claim_ids:
            continue

        linked_claims = [v.claim_index[cid] for cid in claim_ids if cid in v.claim_index]
        if not linked_claims:
            continue

        statuses = {c.get("status", "") for c in linked_claims}

        # All claims are dead
        if statuses.issubset(dead_statuses):
            v.error("V013_SUPERSEDED_CLAIM_RENDERED", f"rendered_units[{i}]",
                    f"Rendered unit {uid} references only superseded/withdrawn claims: "
                    f"{[c.get('claim_id') for c in linked_claims]}")
        # Mixed statuses
        elif statuses & dead_statuses:
            v.warn("V013_SUPERSEDED_CLAIM_RENDERED", f"rendered_units[{i}]",
                   f"Rendered unit {uid} references mixed claim statuses: {statuses}. "
                   f"Ensure active claims govern the rendering.")


# ── V014: Protocol interventions structural check ────────────────

_ALLOWED_INTERVENTION_RULES = {
    "unsupported_site_wide_claim", "invalid_certainty", "insufficient_evidence",
    "negative_scope_bounded", "certainty_downgraded", "render_scope_bounded",
    "certainty_language_adjusted", "validator_rule_failure",
    "provisional_legacy_restricted",
}

_ALLOWED_INTERVENTION_ACTIONS = {
    "claim_rejected", "claim_scope_bounded", "certainty_downgraded",
    "render_scope_bounded", "render_language_weakened",
    "legacy_claim_restricted", "artefact_validation_failed",
}

_REQUIRED_INTERVENTION_FIELDS = [
    "intervention_id", "stage", "protocol_rule", "action", "reason", "timestamp",
]


def v014_intervention_log(v: "ArtefactValidator") -> None:
    interventions = v.artefact.get("protocol_interventions")
    if interventions is None:
        return  # Field is optional — absence is valid

    if not isinstance(interventions, list):
        v.error("V014_INVALID_INTERVENTION_LOG", "(root)",
                "protocol_interventions must be an array")
        return

    seen_ids: dict[str, int] = {}
    for i, entry in enumerate(interventions):
        pid = entry.get("intervention_id", f"protocol_interventions[{i}]")

        # Required fields
        for field in _REQUIRED_INTERVENTION_FIELDS:
            if field not in entry or entry[field] is None or entry[field] == "":
                v.error("V014_INVALID_INTERVENTION_ENTRY", f"protocol_interventions[{i}]",
                        f"Intervention {pid} is missing required field '{field}'")

        # Unique IDs
        if pid in seen_ids:
            v.error("V014_DUPLICATE_INTERVENTION_ID", f"protocol_interventions[{i}]",
                    f"Duplicate intervention_id '{pid}' (first at [{seen_ids[pid]}])")
        else:
            seen_ids[pid] = i

        # Protocol rule vocabulary
        rule = entry.get("protocol_rule", "")
        if rule and rule not in _ALLOWED_INTERVENTION_RULES:
            v.warn("V014_UNKNOWN_PROTOCOL_RULE", f"protocol_interventions[{i}]",
                   f"Intervention {pid} has unrecognised protocol_rule '{rule}'")

        # Action vocabulary
        action = entry.get("action", "")
        if action and action not in _ALLOWED_INTERVENTION_ACTIONS:
            v.warn("V014_UNKNOWN_ACTION", f"protocol_interventions[{i}]",
                   f"Intervention {pid} has unrecognised action '{action}'")


# ── Rule registry ──────────────────────────────────────────────────

ALL_RULES = [
    v001_top_level_fields,
    v002_claim_required_fields,
    v003_certainty_vocabulary,
    v004_status_vocabulary,
    v005_unique_claim_ids,
    v006_unscoped_negative,
    v007_unsupported_site_wide,
    v008_provisional_legacy,
    v009_finding_claims,
    v010_recommendation_claims,
    v011_rendered_unit_claims,
    v012_render_scope_exceeded,
    v013_superseded_rendered,
    v014_intervention_log,
]
