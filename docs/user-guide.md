# Mercury User Guide

Mercury prepares IDX consultants for client engagements. It researches a company, audits their website against the IDX Corporate Website Playbook, benchmarks them against peers, and produces everything you need to walk into a meeting with confidence.

## The four stages

Mercury runs as a pipeline. Each stage builds on the last.

| Stage | Command | What you get | Time |
|-------|---------|-------------|------|
| 1. Briefing | `/mercury:brief Rolls-Royce` | Company profile, IQ benchmarks, situational awareness, website audit, gap framing | 10-15 min |
| 2. Competitive landscape | `/mercury:compete Rolls-Royce` | Peer comparison matrix, where client leads/lags, white space opportunities | 15-20 min |
| 3. Sitemap recommendation | `/mercury:sitemap Rolls-Royce` | Proposed information architecture with change rationale and priority tiers | 10-15 min |
| 4. Meeting pack | `/mercury:meeting Rolls-Royce` | 2-hour workshop agenda, client pre-read, facilitator guide | 5-10 min |

You can run them individually or use `/mercury:all Rolls-Royce` to run the full pipeline in one go.

---

## Running each command

### `/mercury:brief <company>`

This is the starting point. Type the company name as you'd say it in conversation:

```
/mercury:brief Rolls-Royce
/mercury:brief Inchcape
/mercury:brief London Stock Exchange Group
```

**What happens:** Mercury will confirm the company identity (legal name, listing, sector, URL), then work through the research — benchmarks, recent news, website audit, and document extraction. You'll see a capability declaration at the top showing which tools are available.

**What you get:**
- A markdown report with classified findings
- Company identification, IQ benchmark position, situational awareness, website assessment, gap framing, and case study matches
- Key document extractions (investor presentations, Annual Report) — Mercury will show you what it found and ask which documents to extract before spending credits
- Three files saved: evidence manifest, structured artefact, and the report

**Optional focus area:** You can narrow the scope by adding context:

```
/mercury:brief Rolls-Royce — focus on investor communications
/mercury:brief Inchcape — focus on sustainability reporting
```

### `/mercury:compete <company>`

**Prerequisite:** Run `/mercury:brief` first. Mercury needs the briefing artefact to know what it's comparing against. If you haven't run it, Mercury will ask you to.

**What happens:** Mercury suggests 4-5 sector peers and **waits for your confirmation** before doing any research. This is the only point in the pipeline where it pauses for input. You can:
- Accept the suggested peers
- Remove peers that aren't relevant
- Add specific competitors you want included
- Replace the entire set

Once confirmed, it researches each peer and builds a comparison.

**What you get:**
- Comparison matrix: client vs each peer vs sector median
- Where the client leads (with page-level evidence)
- Where the client lags (with peer URLs as evidence)
- White space opportunities no peer does well
- Connect.IQ scores side by side

### `/mercury:sitemap <company>`

**Prerequisite:** Briefing recommended. Competitive landscape recommended (gives peer evidence for "top performers do this").

**What happens:** Mercury takes the current website structure from the briefing, combines it with peer evidence from the competitive landscape, and proposes a new information architecture.

**What you get:**
- Current structure (as-is)
- Recommended structure (to-be) with change annotations
- Change rationale for every structural change — what's moving, why, which peer does it well, which Playbook criteria it addresses
- Priority tiers: Foundational (fix first), Enhancement (next phase), Aspirational (longer term)
- IDX service mapping: each change mapped to the IDX service that delivers it

### `/mercury:meeting <company>`

**Prerequisite:** Briefing is **required**. Mercury will not run this stage without it. Compete and sitemap are optional but enrich the output.

**What happens:** This is pure synthesis — Mercury reads the artefacts from previous stages and produces meeting materials. No new research.

**What you get:**
- 2-hour workshop agenda with time-boxed sections linked to source stages
- Client pre-read (2-3 pages, factual, no IDX pitch language — safe to send to the client)
- Facilitator guide with talking points, evidence references, and discussion questions

If stages 2 or 3 weren't run, the agenda contracts and reallocates time automatically.

### `/mercury:all <company>`

Runs all four stages in sequence. Each stage saves its files, and the next stage reads them automatically.

**Two pauses:** Stage 1 will stop and ask which documents to extract (if Firecrawl is available and PDFs were found). Stage 2 will stop and ask you to confirm the peer set. Everything else runs without intervention.

**After completion:** Mercury offers to generate an integrated Word document combining all stage reports with a cover page, table of contents, and merged citation register.

---

## Output files

Every stage produces three files (meeting produces four):

| File | What it is | Who it's for |
|------|-----------|-------------|
| `{company}-{stage}-evidence.json` | Raw evidence manifest — what was collected, how, when | Audit trail |
| `{company}-{stage}-artefact.json` | Structured findings with classifications, claims, and citations | Machine-readable, feeds next stage |
| `{company}-{stage}.md` | Human-readable markdown report | You — this is what you read |

These files appear in your working directory. The artefact JSON is the source of truth — the markdown report is rendered from it.

---

## Understanding the report

### Classification tags

Every finding in the report carries exactly one tag:

| Tag | What it means | Example |
|-----|-------------|---------|
| `[FACT]` | Directly verified from evidence | "The IR landing page lists three upcoming results dates" |
| `[INFERENCE]` | Reasonable conclusion from evidence | "Strategy content appears to pre-date the most recent results" |
| `[JUDGEMENT]` | Professional opinion or recommendation | "The IR section would benefit from a dedicated results snapshot" |

**`[JUDGEMENT]` only appears in the Synthesis section.** If you see it elsewhere, Mercury has wandered (see below).

### Confidence indicators

Every `[INFERENCE]` includes a confidence level:

| Level | What it means |
|-------|-------------|
| Multiple sources | Corroborated across 2+ pieces of evidence |
| Single source | Based on one piece of evidence |
| Limited sample | Based on partial evidence |
| Absence-based | Inferred from something not found |

Example: `[INFERENCE — single source, absence-based]`

### Capability declaration

At the top of every report you'll see a table showing which tools Mercury had access to. This matters because it determines what kinds of findings are permitted:

| Tool | What it enables |
|------|----------------|
| `web_search` | Recent news, situational awareness |
| `web_fetch` | Direct page content retrieval (free, no credits) |
| `firecrawl` | Site mapping, PDF/document extraction, browser sandbox for gated content |
| `idx_api` | Live IQ scores, client data |
| `bash` | File operations, offline benchmarks |

Mercury uses tools in cost order — free tools first (`web_fetch`), then paid tools (`firecrawl`) only when the free tool fails or the content requires it (e.g., PDFs, cookie walls, JavaScript-rendered pages).

If a tool is unavailable, Mercury uses fallbacks (e.g., offline benchmark data instead of live API) and honestly declares what it couldn't assess in the Limitations section.

### Document extraction

When Firecrawl is available, Mercury can extract content from PDFs, Word documents, and Excel files found on the company's website. During Stage 1, Mercury will identify key documents and ask you before extracting them:

```
## Documents found for extraction

| # | Document | Pages | Credits | Recommended depth |
|---|----------|-------|---------|-------------------|
| 1 | Capital Markets Day 2025 | ~85 slides | 85 | Full — primary strategy source |
| 2 | Annual Report 2025 | ~196 pages | 196 | Partial (first 40) — chair/CEO statement and strategy only |
| 3 | FY25 Results Presentation | ~42 slides | 42 | Full — recent performance narrative |

Extracting all recommended pages would use ~167 credits.
Which documents would you like me to extract, and to what depth?
```

**Why Mercury asks:** Document extraction costs Firecrawl credits (1 per page). An Annual Report can be 200+ pages. Mercury probes the first 5 pages to identify each document, then lets you decide how deep to go. You might say:

- "Extract all three as recommended"
- "Just the CMD deck and results presentation, skip the Annual Report"
- "Get the full Annual Report too — I need the detail"
- "Only the first 20 pages of each"

**Priority order:** Mercury prioritises Capital Markets Day or investor day presentations over Annual Reports. CMD decks are typically the richest source of strategy narrative and medium-term targets, and they tend to be more candid than the Annual Report.

### Citation register

Every report ends with a citations table. Every `[FACT]` must have a numbered citation. If you see a fact without a citation, Mercury has wandered.

---

## How to tell Mercury is wandering

Mercury follows a strict governance protocol. When it's working correctly, you'll see disciplined, evidence-backed output. Here's how to spot when it starts drifting.

### Red flags

| Sign | What's happening | What to do |
|------|-----------------|-----------|
| `[JUDGEMENT]` tags outside the Synthesis section | Mercury is opining where it should be reporting facts | Tell it: "Move judgements to synthesis only" |
| Statements about "the site" without evidence from multiple sections | Site-wide claims need evidence from 2+ sections | Tell it: "Narrow that claim to the pages you actually reviewed" |
| No citation numbers next to `[FACT]` statements | Mercury has stopped linking evidence | Tell it: "Add citations to all facts" |
| Finding types that exceed declared capabilities | e.g., visual/UX claims when screenshots aren't available | Tell it: "You can't make visual claims without screenshots" |
| Share prices, analyst opinions, or valuation multiples | Prohibited content has crept in | Tell it: "Remove financial market commentary" |
| Vague language like "best practice suggests" without a specific Playbook reference | Mercury is padding with generic advice | Tell it: "Cite the specific Playbook criterion" |
| Long prose paragraphs without classification tags | Mercury has dropped the protocol and is writing freely | Tell it: "Re-read the classification rules and tag every finding" |
| Scope creep — findings about areas you didn't ask about | The scope lock has slipped | Tell it: "Stay within the confirmed scope" |

### What causes wandering

Mercury is most likely to drift in these situations:

1. **Long reports** — the protocol rules fade from context after the first few sections. Mercury is designed to re-read the rules before each section, but sometimes skips this.
2. **Stage 4 (meeting)** — synthesis is where `[JUDGEMENT]` is permitted, so the boundary between disciplined output and free prose is thinnest here.
3. **Unfamiliar companies** — when evidence is thin, Mercury may fill gaps with inference presented as fact.

### Corrective prompts

If Mercury wanders, these prompts bring it back:

**Mild course correction:**
> "Re-read the classification rules before continuing."

**Stronger reset:**
> "Stop. Re-read SKILL.md classification rules and compliance checks A through N. Then resume from where you left off."

**Nuclear option (if output is badly off-protocol):**
> "Discard the current output and restart the reasoning phase from step 6. Re-read the claim builder rules first."

### Prevention

The best way to prevent wandering is to:
- **Lock scope clearly** at the start ("focus on investor communications" is better than a vague brief)
- **Confirm peer set promptly** in stage 2 — don't let Mercury pick and run without your input
- **Check the first few findings** before letting it finish — if the tags and citations are clean early on, they usually stay clean

---

## Tips for getting the best results

1. **Use the company's listed name** — "Rolls-Royce Holdings" is better than "Rolls Royce" or "RR"
2. **Run stages in order** — each stage feeds the next. Skipping stages works but produces thinner output
3. **Add a focus area when relevant** — narrowing scope produces deeper analysis
4. **Review the peer set carefully** — the competitive landscape is only as good as the comparators
5. **Read the Limitations section** — it tells you exactly what Mercury couldn't assess and why
6. **Use the Word document for clients** — run `/mercury:mercury-render` after the pipeline to produce branded deliverables

---

## Generating documents

After running any stage, you can produce branded IDX documents:

```
/mercury:mercury-render
```

This produces Word (.docx) and PowerPoint (.pptx) documents using IDX brand templates. The renderer reads from the artefact JSON files — it formats what Mercury found, it doesn't generate new content.
