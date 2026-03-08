# How Mercury Works

## What Mercury is

Mercury is a research assistant that prepares you for client meetings. You give it a company name, and it produces a structured briefing — just like you would if you had a few hours to research, audit a website, and write up your findings. Mercury does it in minutes.

It is not a database. It does not store client data. It does not have access to anything you wouldn't have access to yourself. It researches in real time using the same public sources you would use — company websites, search results, and IDX benchmark data.

## What it actually does

When you run a Mercury command, it follows a fixed two-phase process:

**Phase 1 — Collection.** Mercury visits the company's website, searches for recent news, and pulls benchmark data. It saves everything it finds as an evidence manifest — a timestamped record of exactly what it looked at, when, and how.

**Phase 2 — Reasoning.** Mercury analyses the evidence it collected and produces findings. Crucially, it does not go back to the internet during this phase. It works only with what it already gathered. This boundary exists so that every conclusion can be traced back to a specific piece of evidence.

That's it. Collect, then reason. No shortcuts, no mixing.

## How it stays honest

Mercury doesn't just produce findings — it classifies every single one:

- **[FACT]** — directly verified from evidence, with a citation you can check
- **[INFERENCE]** — a reasonable conclusion, with the reasoning stated and a confidence level attached
- **[JUDGEMENT]** — a professional opinion, only permitted in the synthesis section

This classification is not optional and it is not cosmetic. Every fact must have a citation. Every inference must state its confidence level. Every judgement must stay in the synthesis section. If any of these rules are broken, the report fails validation.

### What Mercury will not do

- Make claims about "the entire site" based on a few pages
- Present an inference as a fact
- Include share prices, analyst opinions, or market sentiment
- Generate findings about things it couldn't actually check
- Quietly skip over gaps — if it couldn't assess something, it says so explicitly

### The claim builder

Before Mercury writes any findings, it builds individual claims from the evidence. Each claim has a defined scope ("the IR landing page", not "the website"), a certainty level, and links to specific evidence items. Claims that break the rules — such as making site-wide assertions from a single page — are rejected before they ever reach the report. Rejected claims are logged so you can see what was caught.

## Security and data

### What Mercury can access

Mercury uses the same tools available to any Claude session:

| Tool | What it does | Where data comes from | Cost |
|------|-------------|----------------------|------|
| Web search | Finds recent news and public information | Public search results | Free |
| Web fetch | Reads web pages | Public websites | Free |
| Firecrawl scrape | Reads pages that resist normal fetching (cookie walls, JS rendering) and extracts content from PDFs, Word docs, and Excel files | Public websites | 1 credit per page |
| Firecrawl map | Discovers all URLs on a company's domain | Public websites | 1 credit |
| Firecrawl browser | Interactive browser for gated content (e.g., IR sections requiring terms acceptance) | Public websites | 1+ credits |
| IDX benchmarks (BigQuery) | Looks up Connect.IQ scores for 747 companies across FTSE 100, FTSE 250, S&P 500, and STOXX 50 | IDX's benchmark database | Free |

Mercury uses tools in cost order — free tools first, then paid tools only when needed. It will always try `web_fetch` before escalating to Firecrawl. For document extraction (PDFs), it asks you before extracting so you control the credit spend.

Mercury does not access internal systems, client databases, email, CRM, or anything behind a login. It works with publicly available information plus IDX's Connect.IQ benchmark data (accessed via BigQuery).

### What Mercury stores

Mercury saves files to your local working directory:

- **Evidence manifests** — what was collected, how, when
- **Artefact files** — structured findings in JSON format
- **Reports** — the markdown document you read

These files stay on your machine. Mercury does not send data to external services, store findings in a shared database, or transmit information between sessions. Each run is independent.

### What the AI model sees

Mercury runs on Claude (Anthropic's AI model). When you run a Mercury command, the conversation — including the company name, the web pages visited, and the analysis — is processed by Claude under Anthropic's standard data handling policies. This is the same as any other Claude conversation. Mercury does not add any additional data sharing.

### What Mercury does not do

- It does not store or remember previous sessions
- It does not share research between users
- It does not access internal IDX client data (GA4, Leadfeeder) — it treats all companies as prospects
- It does not train the AI model on your research

## How thorough is it?

Mercury is thorough within its declared scope, and honest about its limits.

**What it covers well:**
- Website structure and content against the IDX Playbook (100+ criteria)
- Benchmark positioning using Connect.IQ data
- Recent news and corporate events (6 months)
- Peer comparison across key website dimensions
- Document presence and content (annual reports, investor presentations, sustainability reports — extracted and analysed when Firecrawl is available)
- Site structure mapping (full URL discovery across a domain)

**What it acknowledges it can't do:**
- Visual and UX assessment (unless Firecrawl browser screenshots are available)
- Content behind logins requiring credentials Mercury doesn't have
- Internal client analytics (GA4, Leadfeeder) — not currently connected
- Exhaustive content analysis of very large documents (it asks you how deep to go)

Every report includes a **Limitations section** that lists exactly what couldn't be assessed and why. Every report includes a **Capability declaration** that shows which tools were available. These are not buried — they're prominent sections of every report.

### The difference between Mercury and doing it yourself

The research Mercury produces is comparable to what an experienced consultant would produce given a few hours. The difference is:

1. **Speed** — minutes instead of hours
2. **Consistency** — the same protocol every time, the same checks, the same structure
3. **Traceability** — every finding links to evidence with a citation you can verify
4. **Honesty about gaps** — Mercury explicitly flags what it couldn't check, rather than quietly omitting it

Mercury does not replace your judgement. It gives you a structured, evidence-backed starting point so you can walk into a meeting already informed.

## Questions consultants often ask

**"Can I trust the facts in the report?"**
Every `[FACT]` has a numbered citation linking to the source. You can check any fact by following the citation. If a fact doesn't have a citation, something has gone wrong — tell Mercury to add citations.

**"What if it gets something wrong?"**
Mercury can make mistakes, particularly with inferences. That's why every inference is labelled with its confidence level and reasoning. Treat `[INFERENCE — limited sample, absence-based]` differently from `[INFERENCE — multiple sources]`. The labels are there to help you calibrate.

**"Is the client pre-read safe to send externally?"**
The meeting pack pre-read is designed to be client-safe. It contains no IDX pitch language, no internal terminology, and no judgements — only factual context. However, always review it before sending.

**"Will Mercury make IDX look bad if the analysis is wrong?"**
Mercury's classification system exists precisely to prevent this. Facts are cited. Inferences are hedged. Judgements are contained. The risk of embarrassment comes from presenting inferences as facts — and Mercury's protocol is specifically designed to prevent that.

**"Does it work for private companies?"**
Yes, but with less data. There are no IQ benchmark scores for unlisted companies, and there may be less news coverage. Mercury adjusts — it uses whatever evidence is available and clearly states what's missing.

**"Can I run it on a company we're already working with?"**
Yes. Mercury treats all companies the same way — it uses public data plus IDX benchmark scores from BigQuery. Client analytics (GA4, Leadfeeder) are not currently connected.
