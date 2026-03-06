# Markdown templates

Templates for producing Mercury reports in markdown format. Use the same section order as the corresponding Word document, but with standard markdown formatting.

## General rules

- H1 (`#`) for main sections
- H2 (`##`) for subsections
- H3 (`###`) for individual findings
- Pipe tables for data tables
- Bold for emphasis, not italics
- Horizontal rules (`---`) between major sections
- No cover page — start directly with the title as H1
- Include a metadata block immediately after the title

---

## Quick audit template

```markdown
# Site audit: {Company name}

| Field | Value |
|-------|-------|
| Sector | {sector} |
| Index | {index} |
| Site URL | {url} |
| Pages analysed | {count} key pages |
| Date | {date} |
| Prepared by | IDX using the Mercury platform |

---

## Executive summary

{2-3 paragraphs summarising overall impression}

| Area | Assessment |
|------|------------|
| Overall | {Strong/Adequate/Weak} |
| Investor relations | {rating} |
| Sustainability | {rating} |
| {Other key section} | {rating} |

---

## What they do well

### 1. {Strength title}

{1 paragraph of detail referencing specific content observed on the site.}

### 2. {Strength title}

{1 paragraph of detail.}

### 3. {Strength title}

{1 paragraph of detail.}

---

## Gaps versus best practice

| # | Gap | Section | Priority |
|---|-----|---------|----------|
| 1 | {gap description} | {section} | **High** |
| 2 | {gap description} | {section} | **High** |
| 3 | {gap description} | {section} | **Medium** |

### 1. {Gap title}

{1 paragraph explaining the gap and what best practice looks like.}

### 2. {Gap title}

{1 paragraph.}

### 3. {Gap title}

{1 paragraph.}

---

## Connect.IQ benchmark context

| Category | Index median | P75 | {Company} estimate | Assessment |
|----------|-------------|-----|-------------------|------------|
| Overall | {median}% | {p75}% | {estimate}% | {assessment} |
| Company narrative | {median}% | {p75}% | {estimate}% | {assessment} |
| IR | {median}% | {p75}% | {estimate}% | {assessment} |
| Sustainability | {median}% | {p75}% | {estimate}% | {assessment} |
| Careers | {median}% | {p75}% | {estimate}% | {assessment} |

{1 paragraph interpreting the benchmark position.}

---

## Talking points

### 1. {Punchy headline}

{1 paragraph framing the insight in commercial terms.}

### 2. {Punchy headline}

{1 paragraph.}

### 3. {Punchy headline}

{1 paragraph.}

---

## Pages analysed

| Page type | URL | Assessment |
|-----------|-----|------------|
| {type} | {url} | {Strong/Adequate/Weak} |

---

## Methodology

{2-3 paragraphs explaining the audit approach, assessment levels, and data sources. Use a lighter tone for this section.}
```

---

## Peer comparison template

```markdown
# Peer comparison: {Topic}

**{Company A} vs {Company B}**

| Field | Value |
|-------|-------|
| Scope | {description of what was compared} |
| Pages analysed | {count A} + {count B} key pages |
| Date | {date} |
| Prepared by | IDX using the Mercury platform |

---

## Executive summary

{2 paragraphs summarising the comparison.}

| Dimension | {Company A} | {Company B} | Edge |
|-----------|------------|------------|------|
| {dimension} | {assessment} | {assessment} | **{A/B/Even}** |

---

## Detailed comparison matrix

| Dimension | {Company A} | {Company B} | Edge |
|-----------|------------|------------|------|
| {dimension 1} | {assessment} | {assessment} | **{edge}** |
| {dimension 2} | {assessment} | {assessment} | **{edge}** |
| ... | ... | ... | ... |

---

## Where {Company A} leads

### 1. {Finding title}

{1-2 paragraphs explaining why A is stronger and what B could learn.}

### 2. {Finding title}

{1-2 paragraphs.}

### 3. {Finding title}

{1-2 paragraphs.}

---

## Where {Company B} leads

### 1. {Finding title}

{1-2 paragraphs explaining why B is stronger and what A could learn.}

### 2. {Finding title}

{1-2 paragraphs.}

### 3. {Finding title}

{1-2 paragraphs.}

---

## Gaps versus best practice

| # | Gap | Priority | Applies to |
|---|-----|----------|------------|
| 1 | {gap} | **High** | {A/B/Both} |
| 2 | {gap} | **High** | {A/B/Both} |
| 3 | {gap} | **Medium** | {A/B/Both} |

### 1. {Gap title}

{1 paragraph.}

---

## Connect.IQ benchmark context

| Metric | {Company A} | {Company B} | Difference |
|--------|------------|------------|------------|
| Index | {index A} | {index B} | — |
| Overall IQ | {score}% | {score}% | {diff} |
| Rank | {rank} | {rank} | — |
| Company narrative | {score}% | {score}% | {diff} |
| IR | {score}% | {score}% | {diff} |
| Sustainability | {score}% | {score}% | {diff} |

{1 paragraph of interpretation.}

---

## Talking points

### 1. {Headline}

{1 paragraph framed for pitch conversations.}

### 2. {Headline}

{1 paragraph.}

### 3. {Headline}

{1 paragraph.}

---

## Pages analysed

### {Company A}

| Page type | URL |
|-----------|-----|
| {type} | {url} |

### {Company B}

| Page type | URL |
|-----------|-----|
| {type} | {url} |

---

## Methodology

{2-3 paragraphs noting the peer comparison approach.}
```

---

## Deep dive template

```markdown
# Deep dive: {Company name}

| Field | Value |
|-------|-------|
| Sector | {sector} |
| Index | {index} |
| Site URL | {url} |
| Pages analysed | {count} pages across {N} sections |
| Date | {date} |
| Prepared by | IDX using the Mercury platform |

---

## Executive summary

{3-4 paragraphs with overall IQ placement and key themes.}

---

## {Section name} (e.g. Investor relations)

### What they do well

#### {Strength 1}

{Detail.}

#### {Strength 2}

{Detail.}

### Gaps versus Playbook criteria

#### {Gap 1} *(Playbook ref: {reference})*

{Detail.}

### Estimated IQ category score: {score}%

---

## {Next section name}

{Same structure as above, repeated for each website section.}

---

## Overall gaps

| # | Gap | Section | Priority |
|---|-----|---------|----------|
| 1 | {gap} | {section} | **High** |

---

## Recommendations

### 1. {Recommendation title}

**Effort:** {Low/Medium/High} | **Impact:** {Low/Medium/High}

{Detail.}

---

## Connect.IQ benchmark context

{Full benchmark table as in quick audit.}

---

## Talking points

### 1. {Headline}

{1 paragraph.}

---

## Pages analysed

| Page type | URL | Section | Assessment |
|-----------|-----|---------|------------|
| {type} | {url} | {section} | {rating} |

---

## Methodology

{Extended version noting the section-by-section approach.}
```

---

## Formatting notes

- **Priority labels**: Always bold — `**High**`, `**Medium**`, `**Low**`
- **Edge labels**: Always bold — `**{Company A} leads**`, `**Even**`
- **Ratings**: Use plain text in tables — Strong, Adequate, Weak, Absent
- **URLs**: Keep as plain text in tables (not hyperlinks) for clean formatting
- **Numbers**: Use `%` suffix for IQ scores, no decimal places unless < 1%
- **Paragraphs**: Keep to 2-4 sentences each for readability
