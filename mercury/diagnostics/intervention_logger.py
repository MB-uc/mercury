"""
Lightweight intervention logger for Mercury governance protocols.

Records when existing governance rules fire — claim rejections, scope
bounding, certainty downgrades, render modifications, legacy restrictions.

This is purely diagnostic. It does NOT alter reasoning logic.
It does NOT introduce new rules or bypass capabilities.

Usage:
    logger = InterventionLogger(stage="brief")
    logger.log_claim_rejected(
        original_candidate="There is no investment case page on the site",
        reason="Single-section evidence does not justify site-wide absence claim",
        protocol_rule="unsupported_site_wide_claim",
        evidence_ids=["E-010"],
    )
    interventions = logger.entries()
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


ALLOWED_PROTOCOL_RULES = {
    "unsupported_site_wide_claim",
    "invalid_certainty",
    "insufficient_evidence",
    "negative_scope_bounded",
    "certainty_downgraded",
    "render_scope_bounded",
    "certainty_language_adjusted",
    "validator_rule_failure",
    "provisional_legacy_restricted",
}

ALLOWED_ACTIONS = {
    "claim_rejected",
    "claim_scope_bounded",
    "certainty_downgraded",
    "render_scope_bounded",
    "render_language_weakened",
    "legacy_claim_restricted",
    "artefact_validation_failed",
}


class InterventionLogger:
    """Append-only log of protocol interventions for a single stage run."""

    def __init__(self, stage: str) -> None:
        self._stage = stage
        self._entries: list[dict[str, Any]] = []
        self._counter = 0

    def _next_id(self) -> str:
        self._counter += 1
        return f"PI-{self._counter:03d}"

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _append(
        self,
        protocol_rule: str,
        action: str,
        reason: str,
        *,
        claim_id: str | None = None,
        original_candidate: str | None = None,
        final_output: str | None = None,
        evidence_ids: list[str] | None = None,
        stage_override: str | None = None,
    ) -> dict[str, Any]:
        entry: dict[str, Any] = {
            "intervention_id": self._next_id(),
            "stage": stage_override or self._stage,
            "protocol_rule": protocol_rule,
            "action": action,
            "reason": reason,
            "timestamp": self._now(),
        }
        if claim_id is not None:
            entry["claim_id"] = claim_id
        if original_candidate is not None:
            entry["original_candidate"] = original_candidate
        if final_output is not None:
            entry["final_output"] = final_output
        if evidence_ids is not None:
            entry["evidence_ids"] = evidence_ids

        self._entries.append(entry)
        return entry

    # ── Convenience methods for common intervention types ───────────

    def log_claim_rejected(
        self,
        original_candidate: str,
        reason: str,
        protocol_rule: str = "unsupported_site_wide_claim",
        *,
        evidence_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        """Log a claim that was rejected at construction time."""
        return self._append(
            protocol_rule=protocol_rule,
            action="claim_rejected",
            reason=reason,
            original_candidate=original_candidate,
            evidence_ids=evidence_ids,
        )

    def log_scope_bounded(
        self,
        claim_id: str,
        original_candidate: str,
        final_output: str,
        reason: str,
    ) -> dict[str, Any]:
        """Log when a claim's scope was narrowed."""
        return self._append(
            protocol_rule="negative_scope_bounded",
            action="claim_scope_bounded",
            reason=reason,
            claim_id=claim_id,
            original_candidate=original_candidate,
            final_output=final_output,
        )

    def log_certainty_downgraded(
        self,
        claim_id: str,
        original_candidate: str,
        final_output: str,
        reason: str,
    ) -> dict[str, Any]:
        """Log when a claim's certainty was downgraded."""
        return self._append(
            protocol_rule="certainty_downgraded",
            action="certainty_downgraded",
            reason=reason,
            claim_id=claim_id,
            original_candidate=original_candidate,
            final_output=final_output,
        )

    def log_render_modification(
        self,
        claim_id: str,
        original_candidate: str,
        final_output: str,
        reason: str,
        protocol_rule: str = "render_scope_bounded",
    ) -> dict[str, Any]:
        """Log when rendered text was modified to stay within claim scope."""
        action = (
            "render_scope_bounded"
            if protocol_rule == "render_scope_bounded"
            else "render_language_weakened"
        )
        return self._append(
            protocol_rule=protocol_rule,
            action=action,
            reason=reason,
            claim_id=claim_id,
            original_candidate=original_candidate,
            final_output=final_output,
        )

    def log_legacy_restricted(
        self,
        claim_id: str,
        reason: str,
    ) -> dict[str, Any]:
        """Log when a provisional_legacy claim was restricted."""
        return self._append(
            protocol_rule="provisional_legacy_restricted",
            action="legacy_claim_restricted",
            reason=reason,
            claim_id=claim_id,
        )

    def log_validator_failure(
        self,
        reason: str,
        *,
        claim_id: str | None = None,
    ) -> dict[str, Any]:
        """Log when the artefact validator flagged a rule failure."""
        return self._append(
            protocol_rule="validator_rule_failure",
            action="artefact_validation_failed",
            reason=reason,
            claim_id=claim_id,
        )

    # ── Output ─────────────────────────────────────────────────────

    def entries(self) -> list[dict[str, Any]]:
        """Return a copy of all intervention entries."""
        return list(self._entries)

    def __len__(self) -> int:
        return len(self._entries)
