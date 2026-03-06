# Mercury

A [Cowork](https://cowork.com) plugin for Claude that prepares IDX consultants for client engagements — from initial research through to structured stakeholder meetings.

## What it does

Mercury runs a four-stage pipeline that produces evidence-backed markdown reports, with optional export to Word and PowerPoint:

1. **Brief** — company research and consultant briefing
2. **Compete** — competitive landscape analysis
3. **Sitemap** — sitemap recommendation based on the IDX Corporate Website Playbook
4. **Meeting** — structured meeting pack with talking points

Each stage produces a standalone report with classified findings and a citation register. An integrated document can be generated at the end.

## Commands

| Command | Description |
|---------|-------------|
| `/mercury:brief` | Run stage 1 — consultant briefing |
| `/mercury:compete` | Run stage 2 — competitive landscape |
| `/mercury:sitemap` | Run stage 3 — sitemap recommendation |
| `/mercury:meeting` | Run stage 4 — meeting pack |
| `/mercury:all` | Run the full pipeline end-to-end |

## Skills

### mercury

Core analysis engine. Uses proprietary IDX data including the Corporate Website Playbook, Connect.IQ benchmarks, and a 130-item document type inventory to evaluate corporate websites in sector context.

### mercury-render

Document rendering layer. Takes structured audit findings and produces branded output in Word (.docx), PowerPoint (.pptx), or markdown formats.

## Project structure

```
.claude-plugin/
  plugin.json          # Plugin metadata (v3.0.0)
commands/              # Slash command definitions
skills/
  mercury/             # Core analysis skill
    references/        # Playbook, IQ criteria, document checklist, site configs
    data/benchmarks/   # Offline benchmark snapshots
  mercury-render/      # Document rendering skill
    references/        # Report structures, markdown templates
    scripts/           # Node.js rendering scripts
    assets/logos/      # IDX brand assets
```

## Installation

Install this plugin via the Cowork marketplace, or clone the repo and add it as a local plugin in Claude.

## Author

IDX
