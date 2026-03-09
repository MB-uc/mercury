# Claim enforcement tests — Mercury vNext

These tests prove behavioural enforcement, not just schema structure. Each test defines
an input, an expected outcome, and the rule being tested. A passing implementation must
produce the expected outcome; a failing implementation produces the "old behaviour" outcome.

---

## Test 1: Claim construction from evidence

**Rule tested:** Phase B step 6 — claims are built from evidence before findings.

**Input:**
```json
{
  "evidence_items": [
    {
      "id": "E-001",
      "type": "web_page",
      "url": "https://www.company.com/investors",
      "tool_used": "web_fetch",
      "content_summary": "IR landing page — navigation, key links, three upcoming results dates"
    }
  ]
}
```

**Expected outcome:**
- A claim `C-001` is constructed with:
  - `statement`: "The IR landing page lists three upcoming results dates"
  - `scope`: "IR landing page only"
  - `certainty`: "confirmed"
  - `evidence_ids`: ["E-001"]
  - `status`: "active"
- The claim exists in `claims[]` **before** any finding references it
- Finding `F-001` includes `claim_ids: ["C-001"]`

**Failure mode:** Finding `F-001` exists without a corresponding claim in `claims[]`.

---

## Test 2: Rejection of unsupported site-wide claims

**Rule tested:** Claim builder Rule 2 — site-wide claims require ≥2 distinct evidence sections.

**Input:**
```json
{
  "evidence_items": [
    {
      "id": "E-010",
      "type": "web_page",
      "url": "https://www.company.com/investors",
      "tool_used": "web_fetch",
      "content_summary": "IR landing page — no investment case page link found"
    }
  ]
}
```

**Candidate claim:**
```json
{
  "statement": "There is no investment case page on the site",
  "scope": "company.com",
  "certainty": "confirmed",
  "evidence_ids": ["E-010"]
}
```

**Expected outcome:**
- Claim is **rejected** at construction time
- Rejection recorded in `claim_builder_errors[]` with:
  - `rejection_reason`: "unsupported_site_wide_claim"
  - `suggested_revision`: "No dedicated investment case page was identified in the reviewed IR pages"
  - `suggested_scope`: "reviewed IR pages"
- The rejected claim **does not appear** in `claims[]`

**Failure mode:** Claim enters `claims[]` with site-wide scope despite single-section evidence.

---

## Test 3: Negative claim scope preservation

**Rule tested:** Claim builder Rule 3 — negative claims must remain bounded through rendering.

**Input:**
```json
{
  "claims": [
    {
      "claim_id": "C-010",
      "statement": "No dedicated investment case page was identified in the reviewed IR pages",
      "scope": "reviewed IR pages",
      "certainty": "observed",
      "claim_type": "gap"
    }
  ]
}
```

**Expected outcome (rendered prose):**
```
No dedicated investment case page was identified in the reviewed IR pages.
```

**Failure mode (rendered prose):**
```
There is no investment case page on the site.
```

**Verification:** The rendered text must contain the phrase "reviewed IR pages" (or the
claim's actual scope). It must not contain "on the site", "anywhere on the site", or
equivalent unbounded language.

---

## Test 4: Renderer cannot overstate bounded claims

**Rule tested:** Renderer scope guard — output text must not exceed claim scope.

**Input:**
```json
{
  "claims": [
    {
      "claim_id": "C-020",
      "statement": "The about us page contains a board of directors listing",
      "scope": "about us page only",
      "certainty": "confirmed",
      "claim_type": "fact"
    }
  ],
  "findings": [
    {
      "id": "F-020",
      "claim": "Board of directors listing is present",
      "claim_ids": ["C-020"],
      "section": "website_assessment"
    }
  ]
}
```

**Expected outcome (rendered prose):**
```
The about us page contains a board of directors listing. [FACT — ref 1]
```

**Failure mode (rendered prose):**
```
The site features comprehensive governance content including board listings. [FACT — ref 1]
```

**Verification:** Prose must reference "about us page" (claim scope), not "the site".

---

## Test 5: Stage 4 reads claims from prior artefacts

**Rule tested:** Stage 4 step 1b — claims are the primary knowledge layer for synthesis.

**Input:**
```json
{
  "stage": "brief",
  "claims": [
    {
      "claim_id": "C-001",
      "statement": "The IR landing page lists three upcoming results dates",
      "scope": "IR landing page only",
      "certainty": "confirmed",
      "status": "active"
    },
    {
      "claim_id": "C-010",
      "statement": "No dedicated investment case page was identified in the reviewed IR pages",
      "scope": "reviewed IR pages",
      "certainty": "observed",
      "status": "active"
    }
  ]
}
```

**Expected outcome (meeting pre-read):**
- Pre-read references C-001 and C-010 by scope
- Pre-read says "in the reviewed IR pages", not "on the site"
- Meeting artefact contains carried-forward claims with `method: "prior_stage_artefact"`

**Failure mode:**
- Pre-read synthesises from `findings[]` prose without checking claim scope
- Pre-read inflates "reviewed IR pages" to "the site"

---

## Test 6: Legacy compatibility produces provisional_legacy claims

**Rule tested:** Legacy compatibility shim — artefacts without `claims[]` get derived claims.

**Input (legacy artefact without claims):**
```json
{
  "company": "Legacy Corp",
  "stage": "brief",
  "findings": [
    {
      "id": "F-001",
      "classification": "FACT",
      "claim": "The IR landing page lists three upcoming results dates",
      "evidence": ["E-001"]
    }
  ]
}
```

**Expected outcome:**
- Derived claim created:
  ```json
  {
    "claim_id": "C-L001",
    "statement": "The IR landing page lists three upcoming results dates",
    "status": "provisional_legacy",
    "scope": "legacy artefact — scope unknown",
    "certainty": "inferred"
  }
  ```
- Logged in `claim_builder_errors[]` with `rejection_reason: "legacy_artefact_derivation"`
- Provisional legacy claims **cannot** support:
  - `certainty: "confirmed"` rendering
  - Site-wide claims
  - Universal absence statements

**Failure mode:** Legacy artefact is silently treated as if it had native claims with full
rendering power.

---

## Test 7: Compliance catches residual unsupported language

**Rule tested:** Compliance checks J–N as backstop.

**Input (artefact with a finding that escaped claim builder):**
```json
{
  "claims": [
    {
      "claim_id": "C-030",
      "statement": "No ESG report link found on the sustainability landing page",
      "scope": "sustainability landing page",
      "certainty": "observed"
    }
  ],
  "findings": [
    {
      "id": "F-030",
      "claim": "The company has no ESG reporting anywhere on the site",
      "claim_ids": ["C-030"]
    }
  ]
}
```

**Expected outcome:**
- Compliance check K (Negative scope integrity) **fails**
- Reason: Finding text "anywhere on the site" exceeds claim scope "sustainability landing page"
- Repair: Narrow finding to "No ESG report link found on the sustainability landing page"

**Failure mode:** Compliance check passes despite scope inflation from claim to finding.

---

## Summary: What each test proves

| Test | Rule | What it proves |
|------|------|----------------|
| 1 | Claim construction | Claims are built before findings |
| 2 | Site-wide rejection | Invalid claims are rejected at construction, not flagged later |
| 3 | Negative scope | Bounded negative claims stay bounded through rendering |
| 4 | Scope guard | Renderer cannot inflate scope beyond claim boundary |
| 5 | Stage 4 synthesis | Stage 4 reads claims, not prose, as primary knowledge |
| 6 | Legacy shim | Legacy artefacts get restricted provisional claims |
| 7 | Compliance backstop | Residual scope inflation caught by checks J–N |

---

## Running these tests

These tests are specification-level behavioural tests. They do not require a test runner.
To verify compliance:

1. For tests 1, 2, 6: Inspect a generated artefact JSON and verify `claims[]`,
   `claim_builder_errors[]`, and `claim_ids` on findings
2. For tests 3, 4: Inspect rendered markdown/Word output and verify scope language
3. For test 5: Run Stage 4 against a Stage 1 artefact and inspect the meeting pre-read
4. For test 7: Inspect the `compliance` object in the artefact JSON

A post-run review checklist:

- [ ] `claims[]` array exists and is populated before `findings[]` references
- [ ] `claim_builder_errors[]` contains at least one rejection (if test 2 scenario applies)
- [ ] No finding lacks `claim_ids`
- [ ] No rendered prose uses "the site" when its source claim scope is narrower
- [ ] No rendered prose uses "confirmed" language for `provisional_legacy` claims
- [ ] Stage 4 pre-read scopes match source claim scopes
- [ ] Compliance object shows checks J–N were run
