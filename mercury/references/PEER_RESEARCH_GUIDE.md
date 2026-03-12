# PEER_RESEARCH_GUIDE.md
# Mercury Strategy — Peer research methodology and feature matrix
# Version 0.1 | March 2026

---

## Purpose

This file governs how the ms-brief skill selects, researches, and
documents peers for the strategic context layer of a Mercury Strategy
engagement. It defines peer selection criteria, the feature matrix
schema, research scope, and the output format.

Peer research in Mercury Strategy is not a full parallel audit of each
competitor. It is a targeted, efficient pass that establishes where the
client sits relative to their market — sufficient to support archetype
matching, gap framing, and commercial recommendations in the findings.

---

## Role of peer research in Mercury Strategy

The peer set serves three functions:

1. **Calibration** — establishes what is normal for this company type,
   sector, and index. Gaps are only meaningful when framed against what
   peers are actually doing, not against generic best practice.

2. **Archetype evidence** — peer research can confirm or complicate
   archetype assignments. If the client has a document repository
   problem but so do all their peers, the strategic priority and the
   framing of the recommendation changes.

3. **Commercial signal** — specific named peer examples are more
   persuasive in pitch conversations than abstract criteria references.
   "Your peer X does this and you don't" is a more actionable observation
   than "best practice says you should."

Peer research findings feed into the evidence manifest alongside the
client crawl. They do not generate a separate deliverable — they are
context that enriches the main findings.

---

## Peer selection

### How many peers

Standard peer set: 4–5 companies.

Fewer than 4 provides insufficient calibration. More than 5 is rarely
necessary and increases research time significantly without proportional
insight gain. For focused or time-constrained engagements, a minimum
of 2 peers is acceptable.

### Primary selection filters

Apply all three. Every peer must meet all three.

**1. Sector alignment**
Same GICS sector or sub-industry as the client, or sufficiently close
that the same investor and stakeholder audiences would be evaluating
both. For diversified conglomerates, use the primary revenue segment
as the basis for sector alignment.

**2. Index membership**
Same index or one tier adjacent. FTSE 100 clients should be compared
against other FTSE 100 companies. FTSE 250 clients may be compared
against other FTSE 250 companies, or against FTSE 100 companies in the
same sector if FTSE 100 is the acknowledged aspiration. Available
indices: FTSE 100, FTSE 250, S&P 500, STOXX 50. Default to the
client's own index unless there is a specific reason to go cross-index.

**3. Comparable market capitalisation**
Peers should be broadly comparable in size. A 3–5x range around the
client's market cap is generally acceptable. Avoid comparing a
£500m company against a £50bn company — the website investment thesis
is materially different at different scales.

### Secondary selection considerations

After applying primary filters, use these to choose between eligible
candidates:

- **Direct competitive overlap** — companies competing for the same
  revenue pool are higher priority than those in adjacent categories.

- **Acknowledged benchmark** — if the client or their management team
  has explicitly named a peer as a reference point, include them.

- **Digital maturity contrast** — a range of digital maturity in the
  peer set is more useful than a homogeneous group. Include at least
  one peer that is stronger than the client digitally (to illustrate
  the gap) and one that is comparable or weaker (to calibrate the
  baseline).

- **Avoid related parties** — do not select a company that is a
  known M&A target, JV partner, or strategic alliance of the client
  unless the engagement specifically requires it.

### Presenting peers for consultant confirmation

Before running peer research, present the proposed peer set to the
consultant for confirmation. Use this format:

```
Proposed peer set for [Client]:

| Company | Sector | Index | Market cap | Rationale |
|---------|--------|-------|------------|-----------|
| [Name]  | [sector] | [index] | [cap] | [1 sentence] |
...

Confirm this set to proceed, or suggest replacements.
```

Do not begin peer research until confirmation is received.

---

## Research scope per peer

Peer research is deliberately lighter than the client crawl. The goal
is feature detection — whether a capability or content type is present
or absent — not deep content evaluation.

### What to collect per peer

For each peer, collect the following:

**1. Site structure**
Run `firecrawl_map` on the root domain. Record total URL count and
subdomains. Classify sections present using the rules in
`CLASSIFICATION_RULES.md`. This establishes the structural footprint.

**2. Feature matrix pass**
Scrape a targeted set of pages to complete the feature matrix (see
Feature matrix section below). This requires scraping 6–10 pages per
peer — homepage, IR landing, sustainability landing, careers landing,
newsroom, and any sections relevant to the specific archetypes being
investigated.

**3. Document checklist (abbreviated)**
Check for the presence of key documents — annual report, sustainability
report, results presentation, TCFD report. Do not run the full 130-item
document checklist. Check for the 8–10 documents most relevant to the
engagement focus.

**4. Notable features**
Record any features or capabilities that are notably stronger or weaker
than the client. These become named examples in the findings.

### What not to collect per peer

- Full content scraping of all pages — not required
- Playbook scoring — not required; feature presence/absence is sufficient
- Claim ledger entries — peer content does not generate claims in the
  client claim ledger
- Negative verification — run only for sections directly relevant to
  archetype matching

---

## Feature matrix

The feature matrix is the primary structured output of peer research.
It records feature presence or absence across the client and all peers
in a consistent format, enabling direct comparison.

### Feature matrix schema

```json
{
  "client": "[company name]",
  "peers": ["[peer 1]", "[peer 2]", "..."],
  "research_date": "[ISO 8601 date]",
  "features": [
    {
      "feature_id": "[F01]",
      "category": "[category]",
      "feature": "[feature name]",
      "description": "[what presence means]",
      "client": "present | present_thin | present_external | absent | not_assessed",
      "peers": {
        "[peer 1]": "present | present_thin | present_external | absent | not_assessed",
        "[peer 2]": "present | ...",
        "...": "..."
      },
      "notes": "[optional: named URL or notable observation]"
    }
  ]
}
```

### Feature matrix — standard feature set

The following features are assessed for every engagement. Features are
grouped by category. Record each as present, present_thin,
present_external, absent, or not_assessed.

#### Category: IR and investor content

| ID | Feature | What presence means |
|----|---------|-------------------|
| F01 | Investment case page | Dedicated page articulating the equity story |
| F02 | Results presentations (slides) | Downloadable slides for most recent results |
| F03 | Results webcast or video | Video or audio recording of most recent results |
| F04 | Financial calendar | Forward-looking calendar of IR events |
| F05 | Analyst consensus / coverage | List of covering analysts or consensus data tool |
| F06 | Share price tool | Live or delayed share price widget on IR pages |
| F07 | ESG / responsible investment section within IR | Dedicated content for ESG-focused investors |
| F08 | Reports archive (5+ years) | Historical results and reports accessible |
| F09 | AGM materials | AGM notice, proxy, and results available |
| F10 | IR contact details | Named IR contact with email or phone |

#### Category: Sustainability and ESG

| ID | Feature | What presence means |
|----|---------|-------------------|
| F11 | Sustainability strategy page | Dedicated strategy narrative beyond policy statements |
| F12 | Net zero / climate commitment | Specific target with scope and timeline |
| F13 | GHG data (scope 1, 2, 3) | Quantified emissions data on-site (not PDF only) |
| F14 | TCFD report | Dedicated TCFD report or aligned disclosure |
| F15 | Sustainability KPIs with targets | Trackable metrics with stated targets |
| F16 | Sustainability reporting centre | Single hub for all sustainability documents |
| F17 | ESG ratings disclosure | Own ESG rating scores or index membership listed |
| F18 | Supply chain / value chain content | Scope 3 or supply chain narrative present |

#### Category: Careers and employer brand

| ID | Feature | What presence means |
|----|---------|-------------------|
| F19 | Careers hub with role segmentation | Distinct pathways for graduates, experienced, exec |
| F20 | Employee stories (video or written) | Authentic first-person content from employees |
| F21 | EVP / why work here page | Articulated employer value proposition |
| F22 | Culture and values content | Culture narrative beyond the about page |
| F23 | Benefits and development content | Benefits, L&D, or progression content |
| F24 | On-domain careers platform | Careers content hosted on main domain (not ATS only) |
| F25 | Apprenticeship / early careers programme | Specific early careers content or landing page |

#### Category: Digital and content capability

| ID | Feature | What presence means |
|----|---------|-------------------|
| F26 | Insights / thought leadership section | Original content beyond press releases |
| F27 | Video content library | More than event recordings — explainers, stories |
| F28 | Newsroom with taxonomy | News filterable by category, year, or topic |
| F29 | Case studies or proof content | Named client or project examples |
| F30 | Structured data / schema markup | Detectable schema.org markup on key pages |
| F31 | AI-quotable content | Specific, citable claims that AI engines can extract |
| F32 | CMD or investor day content | Capital markets day materials accessible on-site |
| F33 | Interactive data tools | Any interactive visualisation or data explorer |

#### Category: Navigation and audience experience

| ID | Feature | What presence means |
|----|---------|-------------------|
| F34 | Audience-specific entry points in nav | Explicit Investors, Careers, or similar nav items |
| F35 | Search functionality | On-site search present and functional |
| F36 | Homepage stakeholder segmentation | Homepage routes multiple audiences, not one primary |
| F37 | Mobile-optimised navigation | Navigation usable on mobile without horizontal scroll |
| F38 | Cookie consent (GDPR-compliant) | Cookie consent banner present and functional |
| F39 | Accessibility statement | Dedicated accessibility statement page |

### Extending the feature matrix for focused engagements

For engagements with a specific focus (e.g. a client whose primary
brief is IR, or where AEO/AI visibility is the central theme), add
focus-specific features using the same schema. Assign IDs in the
FXX range starting from F50 to avoid collision with the standard set.

---

## Peer research output format

Peer research findings are recorded in two places:

### 1. Evidence manifest — peer context section

Add a `peer_context` block to the evidence manifest:

```json
{
  "peer_context": {
    "peers": [
      {
        "name": "[company]",
        "domain": "[domain]",
        "index": "[index]",
        "sector": "[sector]",
        "pages_discovered": N,
        "subdomains": [],
        "notable_features": ["..."],
        "notable_absences": ["..."]
      }
    ],
    "feature_matrix": { ... },
    "peer_patterns": [
      {
        "pattern": "[observation about what most or all peers do]",
        "client_position": "aligned | ahead | behind | not_assessed"
      }
    ]
  }
}
```

### 2. Findings — peer calibration section

The ms-findings skill uses the `peer_context` block to generate the
peer calibration section of the report. This section:

- States which peers were researched and why
- Identifies features present across most or all peers that the client
  lacks — these are baseline expectations, not aspirational targets
- Identifies features the client has that peers lack — these are
  potential strengths worth reinforcing
- Notes where the entire peer set has a gap — these are sector-wide
  issues, not client-specific ones, and should be framed accordingly

**Framing rule:** Peer gaps should be presented as "expected components
for companies of this type" rather than "your peers are doing this and
you are not." The benchmark framing is less adversarial and more
defensible.

---

## Peer research — graceful degradation

| Condition | Response |
|-----------|----------|
| Peer site blocks crawl | Record feature_matrix entries as not_assessed; note limitation |
| Peer site behind login | Note gate; record accessible sections only |
| Fewer than 4 peers confirmed | Proceed with available peers; note reduced calibration confidence |
| firecrawl_map returns <10 URLs | Mark structural footprint as not_assessed; proceed with scrape-only features |
| Peer domain redirects to different entity | Note redirect; assess whether the redirected entity is still a valid peer |

Peer research gaps do not block the main findings. Surface all
peer research limitations in the appendix, not in the main report body.

---

## Research efficiency — time and credit budget

Peer research should be efficient. The following budgets apply:

| Activity | Credit budget per peer |
|----------|----------------------|
| firecrawl_map | 1 credit |
| Homepage + 5 targeted page scrapes | 6 credits |
| Total per peer | ~7 credits |
| Total for 4-peer set | ~28 credits |

If the total peer research budget would exceed 35 credits, reduce the
number of pages scraped per peer rather than reducing the number of
peers. Feature detection from homepage + 3 targeted pages (IR landing,
sustainability landing, careers landing) is the minimum viable pass.

---

## Connect.IQ integration

Where Connect.IQ benchmark data is available for peers via BigQuery,
pull it to supplement the feature matrix. Connect.IQ scores provide
quantitative calibration that the feature matrix alone cannot:

```sql
SELECT company_name, overall_iq, ir_iq, sustainability_iq,
       careers_iq, media_iq, about_iq
FROM `diageo-rep-247.sector_intelligence.iq_benchmarks`
WHERE LOWER(company_name) IN ([peer names lower-cased])
AND dataset_year = 2024
```

If Connect.IQ data is not available for a peer (company not in the
benchmark universe), note this and rely solely on the feature matrix.
Do not estimate IQ scores for peers — only use confirmed data.

Connect.IQ scores for peers are recorded in the evidence manifest
`peer_context` block and surfaced in the findings appendix.
