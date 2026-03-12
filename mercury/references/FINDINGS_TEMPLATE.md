# FINDINGS_TEMPLATE.md
# Mercury Strategy — Findings skill template and rules
# Version 0.1 | March 2026

---

## Purpose

This file governs how the ms-findings skill synthesises crawl and
research evidence into a structured strategic report. It defines the
report structure, the elevation principle, archetype matching rules,
audience analysis rules, and output constraints.

The Findings skill does not generate observations from scratch. It
reasons over pre-collected evidence from the ms-brief and ms-crawl
artefacts. All claims in the output must be traceable to evidence
already in those artefacts.

---

## Core principle: elevation before prose

No criterion-level observation may appear in the main findings body
without first being elevated to a strategic implication.

Criterion evidence belongs in the appendix. The main report body
contains only implications — what the evidence means for the company's
ability to serve its audiences, compete in its market, or sustain
investor confidence.

**Correct sequence:**
1. Evidence collected (ms-crawl artefact)
2. Archetypes matched against evidence
3. High-confidence matches elevated to strategic implications
4. Implications written as prose in the report body
5. Supporting criteria listed in the appendix

**Forbidden sequence:**
1. Criteria observed
2. Criteria listed in the report body as findings
3. Strategic significance asserted afterwards

The test: if a finding could appear unchanged in a standard website
audit checklist, it has not been elevated. It belongs in the appendix.

**Example of a criterion observation (appendix only):**
"The IR landing page has no share price widget."

**Example of an elevated implication (report body):**
"The investor section is structured for visitors who already know
the company. There is no at-a-glance orientation layer — no headline
financial position, no share price signal, no quick-reference view
of current performance. First-time institutional visitors and analysts
doing pre-meeting research will find what they need eventually, but
the site makes them work for it."

---

## Two-layer output structure

Every Findings report has exactly two layers:

### Layer 1 — Main report body

Contains:
- Executive summary (3–5 sentences)
- Strategic implications (elevated from archetype matches)
- Audience analysis (which audience tiers are underserved and why)
- Commercial signal (which capability archetypes are implicated)
- Consultant notes (what to probe in the client conversation)

Does NOT contain:
- Individual criterion pass/fail observations
- Raw crawl data
- Checklist-style gap lists
- Percentage scores or IQ-style ratings

### Layer 2 — Appendix

Contains:
- Archetype evidence tables (criterion-level observations supporting
  each High or Medium-confidence archetype match)
- Audience failure signals (specific observations per audience tier)
- Document checklist results (from ms-crawl artefact)
- Full URL classification output (from ms-crawl artefact)

The appendix is for consultant use — it is the evidence base that
supports the main report body and enables confident client conversation.
It is not for client distribution in its current form.

---

## Archetype matching rules

### Step 1 — Load evidence manifest

Load the evidence manifest from the ms-crawl artefact. The manifest
contains:
- Crawled pages with classification and content summary
- Criterion observations keyed to playbook sections
- Document checklist results
- Negative verification results (pages checked and confirmed absent)

Do not begin archetype matching until the evidence manifest is fully
loaded. Do not generate new observations during the Findings stage —
reasoning over evidence only.

### Step 2 — Check each archetype

For each of the 13 archetypes in ARCHETYPE_LIBRARY.md, check every
criterion against the evidence manifest:

- Criterion met = supporting evidence exists in the manifest
- Criterion not met = no supporting evidence, or counter-evidence found
- Criterion not assessable = page type not crawled or not present

Count only met criteria toward the confidence threshold. Not-assessable
criteria do not count for or against.

### Step 3 — Assign confidence

| Count | Confidence | Action |
|-------|------------|--------|
| 3+ criteria met | High | Elevate to main report body |
| 2 criteria met | Medium | Include in appendix, flag for consultant |
| 1 criterion met | Low | Discard — do not surface |
| 0 criteria met | None | Discard |

If a page type required for multiple criteria was not crawled, note
this as an evidence gap in the appendix rather than assigning Medium
or Low confidence.

### Step 4 — Check for co-occurrence

After assigning confidence to all archetypes, check the co-occurrence
patterns from ARCHETYPE_LIBRARY.md. Where two co-occurring archetypes
are both High confidence, treat this as a systemic finding and frame
the implication at the systemic level rather than as two separate issues.

---

## Elevation rules

### What elevation means

Elevation is the act of interpreting what criterion evidence means for
a specific company in a specific context. It requires:

1. **Specificity** — the implication names the audience affected,
   the consequence of the gap, and the context that makes it significant
   for this company
2. **Causal reasoning** — the implication explains why the gap matters,
   not just that it exists
3. **Benchmark framing** — gaps are framed as "expected components for
   this page type" or "standard practice for a company of this type",
   not as "best practice says you should have X"

### Benchmark framing vs best-practice framing

**Best-practice framing (forbidden in main report body):**
"Best practice recommends an investment case page on IR sites."

**Benchmark framing (required):**
"For a FTSE 250 industrial company with an active investor relations
programme, an investment case page is a standard component. Peer
companies including [Peer A] and [Peer B] publish structured investment
cases. The absence of one here means analysts researching the company
digitally must construct the investment thesis from scattered content
rather than finding it packaged."

### Elevation test

Before including a finding in the main report body, apply this test:

1. Does it name a specific audience affected?
2. Does it explain the consequence for that audience?
3. Does it use benchmark framing rather than best-practice framing?
4. Is it grounded in evidence from the manifest (not inferred)?
5. Could it not appear unchanged in a generic website audit template?

If any answer is no, the finding belongs in the appendix, not the
main report body.

---

## Audience analysis rules

### Step 1 — Select relevant audience tiers

Based on the company profile established in the ms-brief artefact,
select the audience tiers from AUDIENCE_LIBRARY.md that are relevant
to this company type:

| Company type | Always include | Include if applicable |
|-------------|---------------|----------------------|
| Listed company (any) | Tiers 1, 2, 7 | Tier 10 |
| Large industrial / B2B | Tiers 3, 7 | Tiers 5, 9 |
| Agency / consultancy | Tier 4 | Tier 7 |
| Technology / SaaS | Tiers 8, 4 | Tiers 7, 10 |
| Any with active hiring | Tier 6 | — |
| Multi-market global | All selected tiers | Tier 9 |

Do not apply all 10 tiers to every company. Select the tiers relevant
to the company's profile and suppress the rest.

### Step 2 — Check access pattern support

For each selected audience tier, check whether the site supports the
access pattern described in AUDIENCE_LIBRARY.md:

- Does the site have the content this audience needs?
- Is the navigation pathway to that content accessible within 3 clicks?
- Are the failure signals for this audience present or absent?

### Step 3 — Classify each audience tier

| Classification | Meaning |
|---------------|---------|
| Served | Key content needs met, access pattern supported, no failure signals |
| Underserved | Some content present but access pattern incomplete or failure signals present |
| Absent | No content layer, pathway, or signals for this audience type |

### Step 4 — Surface in the audience analysis section

In the main report body, surface only Underserved and Absent tiers.
Served tiers go to the appendix as confirmation evidence.

For each Underserved or Absent tier, write one paragraph following
the elevation rules — naming the audience, explaining the consequence,
using benchmark framing.

---

## Capability signal rules

### When to surface a capability signal

Surface a capability signal from CAPABILITY_LIBRARY.md only when:
- The mapped website archetype is High confidence
- The implication has been elevated to the main report body
- The capability connection follows naturally from the diagnosis

Do not surface capabilities for Medium-confidence archetypes.
Do not surface more than four capability signals in a single report —
if more than four archetypes are High confidence, prioritise the ones
with the strongest evidence and the most direct commercial relevance
to this client.

### How to surface a capability signal

The capability connection is a consequence of the diagnosis, not a
separate recommendation section. It appears as the final sentence or
sentences of the relevant implication paragraph.

**Wrong (recommendation framing):**
"We recommend an investor content packaging programme to address this gap."

**Right (consequence framing):**
"This is the kind of gap where IDX's investor content packaging work
has materially shifted how institutional audiences engage with the
IR section — the Inchcape and ELC engagements both started from a
similar position."

The client should feel they are being diagnosed, not pitched.

### AEO/AI capability sequencing

Where both C09 (AEO audit) and C13 (AI readiness programme) are
implicated by A11 (the AI-invisible site), surface C09 first as
the logical diagnostic entry point. C13 appears as the follow-on
programme, not as an alternative.

---

## Report structure

### Section order (main report body)

```
1. Executive summary
2. Company and site context
3. Strategic implications  [elevated archetype findings]
4. Audience analysis       [underserved and absent tiers]
5. Commercial signal       [capability connections]
6. Consultant notes        [what to probe in the meeting]
```

### Section order (appendix)

```
A. Archetype evidence tables
B. Audience failure signals
C. Document checklist results
D. URL classification output
E. Evidence gaps and limitations
```

---

### Section 1 — Executive summary

3–5 sentences. Covers:
- What type of company this is and what the digital estate is trying to do
- The dominant pattern or patterns identified (archetype names not required
  here — describe the pattern in plain language)
- The primary audience impact
- One sentence on what addressing this would change

Do not list findings in bullet form. Write as continuous prose.

**Length:** 80–120 words.

---

### Section 2 — Company and site context

Brief contextual framing for a consultant who may not have run the
brief themselves. Covers:
- Company profile summary (sector, scale, listing status, key strategy signals)
- Site scope (pages crawled, sections present, notable absences)
- Material events context (recent events that affect how findings should
  be interpreted — e.g. a recent strategy launch, CEO change, or M&A)

This section is factual and descriptive. No implications yet.

**Length:** 100–150 words.

---

### Section 3 — Strategic implications

One subsection per High-confidence archetype, ordered by the number
of supporting criteria (strongest evidence first).

Each subsection:
- Heading: a plain-language description of the pattern (not the archetype
  code or name — those are internal labels)
- Body: 2–4 paragraphs following the elevation rules
- Benchmark reference: at least one reference to what peer companies
  or companies of this type typically do
- Audience named: at least one specific audience tier named by role
  (not just "investors" — "institutional investors conducting pre-meeting
  research" or "buy-side analysts updating their financial model")

**Length per subsection:** 150–250 words.
**Maximum subsections:** 5 (even if more archetypes are High confidence —
  apply the prioritisation rules above).

---

### Section 4 — Audience analysis

One paragraph per Underserved or Absent audience tier, ordered from
most critical to least critical based on the company's profile.

Each paragraph:
- Names the audience by role, not by tier number
- Describes the access pattern they bring to the site
- Identifies the specific gap in content or navigation
- States the consequence in terms of that audience's behaviour or
  decision-making

Do not include Served tiers here. Do not include all tiers — only
those relevant to this company type and classified as Underserved
or Absent.

**Length per paragraph:** 80–120 words.
**Maximum paragraphs:** 6.

---

### Section 5 — Commercial signal

Brief section — one paragraph per capability signal, maximum four.

Each paragraph:
- Opens with the diagnosis (what the evidence shows)
- Closes with the capability connection (what IDX has done in
  comparable situations)
- References a specific client outcome or named engagement where
  relevant
- Does not use the word "recommend" or any equivalent

This section is written for the consultant as a prompt for the
conversation, not as a client-facing recommendation list.

**Length per paragraph:** 60–100 words.
**Maximum paragraphs:** 4.

---

### Section 6 — Consultant notes

Bullet list of questions the consultant should probe in the client
meeting, derived from:
- Medium-confidence archetypes that need more information to confirm
  or discard
- Audience tiers that could not be fully assessed from crawl data alone
- Material events that may explain gaps (e.g. "the strategy page is
  stale — is a refresh planned following the new CEO's strategy review?")
- Evidence gaps where a page type was not crawled or was inaccessible

These are internal prompts — not for client distribution.

**Format:** 5–10 bullets, each a single question or observation.

---

## Output constraints

### Language

- British English spelling throughout
- Plain language — no jargon that a senior client would not use
- No mention of Firecrawl, BigQuery, APIs, or technical internals
- No mention of archetype codes (A01, C03 etc.) — these are internal
  labels only
- No percentage scores or IQ-style ratings in the main report body
- No phrases: "best practice", "you should", "we recommend" (in
  main body — consultant notes may use more direct language)

### Claims

- Every claim in the main report body must be traceable to evidence
  in the ms-crawl or ms-brief artefact
- Claims about what peer companies do must be grounded in data
  collected during the brief or crawl phase — do not invent peer
  comparisons
- Absence claims (e.g. "there is no investment case page") must be
  confirmed by the negative verification results in the evidence
  manifest — not assumed from failure to find the page during crawl

### Tone

The report is written for a senior IDX consultant preparing for a
client conversation. It is direct, specific, and evidence-grounded.
It does not soften findings with excessive hedging. It does not
overstate certainty beyond what the evidence supports.

The client-facing version of this report (if produced) would be
a consultant-edited derivative — not this document in its current form.

---

## Evidence gap handling

If a page type required for one or more archetype criteria was not
crawled or was inaccessible:

1. Note the gap in the appendix under Section E
2. Do not assign confidence to criteria that depend on that page
3. If the gap affects a High-confidence determination, downgrade to
   Medium and flag in the consultant notes for manual verification
4. If the gap is significant enough to materially affect the findings,
   note it in the executive summary

Common evidence gaps:
- Gated content (login required)
- JavaScript-rendered pages that Firecrawl could not extract
- Robots.txt exclusions
- Pages not discoverable from sitemap or internal links

---

## Self-check before output

Before producing the final report, run this internal checklist:

**Elevation check**
- [ ] No criterion-level observation appears in the main report body
- [ ] Every finding in the main body names a specific audience
- [ ] Every finding uses benchmark framing, not best-practice framing
- [ ] Every finding is traceable to the evidence manifest

**Archetype check**
- [ ] Only High-confidence archetypes appear in Section 3
- [ ] Medium-confidence archetypes are in the appendix only
- [ ] Co-occurrence patterns have been checked and applied where relevant
- [ ] Maximum 5 subsections in Section 3

**Audience check**
- [ ] Only relevant audience tiers selected for this company type
- [ ] Only Underserved and Absent tiers appear in Section 4
- [ ] Maximum 6 paragraphs in Section 4

**Capability check**
- [ ] Capability signals appear only for High-confidence archetypes
- [ ] Maximum 4 capability signals in Section 5
- [ ] No recommendation language used — consequence framing only
- [ ] AEO/AI capability sequencing followed where applicable (C09 before C13)

**Output constraints check**
- [ ] British English throughout
- [ ] No archetype codes in client-facing sections
- [ ] No percentage scores in main report body
- [ ] No mention of technical infrastructure
- [ ] All absence claims verified against negative verification results
