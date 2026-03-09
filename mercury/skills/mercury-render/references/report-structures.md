# Report structures

Section order and content guidance for each Mercury report type.

## Claim-backed rendering rules (vNext)

All report types must follow these rules when generating prose from structured data:

1. **Scope inheritance** — Every finding, gap, or talking point references `claim_ids`. The
   rendered prose must not exceed the scope of its source claims. If a claim is scoped to
   "reviewed IR pages", the prose says "in the reviewed IR pages", never "on the site".

2. **Negative statement rendering** — Gaps and absences render as bounded statements:
   - Allowed: "No dedicated investment case page was identified in the reviewed IR pages"
   - Rejected: "There is no investment case page on the site"
   The scope boundary comes from the claim, not from editorial judgement.

3. **Certainty-appropriate language** — Claims with `certainty: "inferred"` render with
   hedging ("appears to", "suggests", "based on available evidence"). Claims with
   `certainty: "confirmed"` can use direct assertions.

4. **Provisional legacy claims** — If the source artefact lacked native claims and claims
   were derived via the legacy shim (`status: "provisional_legacy"`), the prose must use
   hedged language throughout and cannot make site-wide or high-confidence assertions.

5. **No free prose** — The renderer builds output from claims and claim-backed findings.
   It does not generate prose and then check it against claims afterwards.

## Quick audit

A focused assessment of a single company's website. Typically 5-6 pages.

### Section order

1. **Cover page** — title: "Site audit", subtitle: company name, meta: sector, index, site URL, pages count, date
2. **Executive summary** — 2-3 paragraphs summarising overall impression, followed by a 4-column rating table (Overall, IR, Sustainability, Careers or other key sections) with qualitative ratings (Strong/Adequate/Weak)
3. **What they do well** — 3 numbered strengths, each with H3 heading and 1 paragraph of detail. Lead with the most impressive finding. Reference specific content observed on the site.
4. **Gaps versus best practice** — Priority table first (columns: Gap, Section, Priority), then each gap gets H3 heading + 1 paragraph of detail. Order: High priority first, then Medium.
5. **Connect.IQ benchmark context** — Table comparing company scores against index medians and percentiles. If actual scores available (BigQuery): show official IQ data. If estimated: show estimated scores with confidence level and criteria coverage, tagged as [INFERENCE]. 1 paragraph of interpretation below.
6. **Talking points** — 3 numbered points designed for pitch conversations. Each has a punchy H3 headline and 1 paragraph that frames the insight in commercial terms.
7. **Pages analysed** — Table listing all pages assessed (columns: Page type, URL, Assessment).
8. **Methodology** — 2-3 paragraphs in grey text explaining the audit approach, assessment levels, and data sources.

### Rating levels

| Level | Meaning | Colour |
|-------|---------|--------|
| Strong | Meets or exceeds best practice | MERCURY_ACCENT |
| Adequate | Functional but not standout | MED_AMBER |
| Weak | Present but insufficient | HIGH_RED |
| Absent | Missing entirely | HIGH_RED bold |

---

## Peer comparison

A side-by-side evaluation of two competing companies. Typically 8-10 pages.

### Section order

1. **Cover page** — title: "Peer comparison", subtitle: topic (e.g. "Civil aerospace product pages"), third line: "Company A vs Company B", meta: date, scope, pages counts, type
2. **Executive summary** — 2 paragraphs summarising the comparison, followed by a summary rating table (columns: Dimension, Company A, Company B, Edge) with 4-6 key dimensions
3. **Detailed comparison matrix** — Full-width table with all dimensions assessed (typically 7-10). Columns: Dimension, Company A assessment, Company B assessment, Edge. Use the `dataTable` helper with custom `cellOpts` to colour the Edge column.
4. **Where [Company A] leads** — 3 numbered findings, each with H2 heading and 1-2 paragraphs. Explain why A is stronger and what B could learn.
5. **Where [Company B] leads** — Same structure, 3 findings where B outperforms.
6. **Gaps versus best practice** — Gaps that apply to both or either company. Priority table then detail sections. Include an "Applies to" column (A, B, or Both).
7. **Connect.IQ benchmark context** — Side-by-side IQ scores for both companies. Table columns: Metric, Company A, Company B, Difference. Include index, overall score (actual or estimated with confidence), and 6-8 category scores. If estimated, note criteria coverage per company. 1 paragraph of interpretation.
8. **Talking points** — 3 points framed for pitch conversations, emphasising the consultancy opportunity created by the comparison.
9. **Pages analysed** — Two separate tables, one per company, with H2 subheadings.
10. **Methodology** — Same structure as quick audit, noting the peer comparison approach.

### Edge labels

- "[Company A] leads" — colour with Company A's colour (typically MERCURY_BLUE)
- "[Company B] leads" — colour with Company B's colour (typically MERCURY_ACCENT)
- "Even" — default DARK colour
- Split judgements like "A narrative, B data" — default DARK colour

---

## Deep dive

Comprehensive section-by-section analysis. Typically 12-20 pages.

### Section order

1. **Cover page** — title: "Deep dive", subtitle: company name
2. **Executive summary** — 3-4 paragraphs with overall IQ placement (actual or estimated with confidence) and key themes
3. **Section-by-section analysis** — Each website section gets its own H1 (e.g. "Investor relations", "Sustainability", "Careers"). Under each:
   - What they do well (H3 items)
   - Gaps vs Playbook criteria (H3 items with Playbook reference)
   - IQ category score (actual) or estimated category score with criteria coverage (e.g. "Estimated IR score: ~38% — 42/60 criteria assessed")
4. **Overall gaps** — Aggregated priority table across all sections
5. **Recommendations** — Prioritised action plan (H2 items with effort/impact ratings)
6. **Connect.IQ benchmark context** — Full benchmark table (actual or estimated with confidence band and criteria coverage summary)
7. **Talking points** — 4-5 points
8. **Pages analysed** — Full table
9. **Methodology** — Extended version noting the section-by-section approach

---

## Markdown templates

For markdown output, use the same section order and content as the corresponding Word document, but with standard markdown formatting:

- H1 (`#`) for main sections
- H2 (`##`) for subsections
- H3 (`###`) for individual findings
- Pipe tables for data tables
- Bold for emphasis, not italics
- Horizontal rules (`---`) between major sections
- No cover page — start directly with the title as H1
