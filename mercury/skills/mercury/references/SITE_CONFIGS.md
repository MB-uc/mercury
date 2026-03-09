# Site configurations — Firecrawl overrides

**Purpose**: Maps domains to Firecrawl scrape parameters that override defaults. Skills check this file before every scrape call. If a domain is listed, use its configuration instead of the standard `onlyMainContent: true`.

**Why this exists**: Some corporate websites use non-semantic HTML (divs with custom classes instead of `<nav>`, `<header>`, `<footer>` elements). Firecrawl's `onlyMainContent` heuristic fails on these sites, returning navigation bloat (often 10K+ characters of links) mixed into the page content.

**How skills use it**:
1. Before calling `firecrawl_scrape`, extract the domain from the target URL
2. Check if the domain appears in the configs below
3. If yes, use the specified `includeTags` / `excludeTags` instead of `onlyMainContent: true`
4. If no, use the standard approach: `onlyMainContent: true`

**Adding new entries**: When a scrape returns navigation bloat (symptoms: 200+ links in output, >60K chars for a single page, repeated nav items), investigate the DOM structure and add an entry here.

---

## Configured sites

### rolls-royce.com

**Problem**: Non-semantic HTML throughout. Navigation is in `<div class="header-outer">` (14K chars, 238 links) and `<div class="new-second-level-navigation">` (4K chars, 216 links). `onlyMainContent: true` does not strip these. `excludeTags: ["nav", "header", "footer"]` also fails because there are no semantic nav/header/footer elements.

**DOM structure**:
```
MainWrapper
├── div.header-outer          ← NAV BLOAT (14K, 238 links)
│   └── div.new-second-level-navigation  ← MORE NAV (4K, 216 links)
├── div.country-content-container
│   └── div#homewrapper       ← ACTUAL CONTENT ✓
└── div.footer-outer          ← FOOTER BLOAT
```

**Configuration**:
```json
{
  "domain": "rolls-royce.com",
  "includeTags": ["#homewrapper"],
  "onlyMainContent": false,
  "notes": "Content lives in div#homewrapper. Do not use onlyMainContent — it fails on this site's non-semantic HTML."
}
```

**Verified on**: Pearl 15 page (went from ~110K to clean content), Pearl 700 page (clean with minor nav duplication at tail).

---

## Template for new entries

```markdown
### [domain]

**Problem**: [Brief description of why onlyMainContent fails]

**DOM structure**:
```
[Simplified tree showing where content vs bloat lives]
```

**Configuration**:
```json
{
  "domain": "[domain]",
  "includeTags": ["[selector]"],
  "onlyMainContent": false,
  "notes": "[How to identify the content container]"
}
```

**Verified on**: [Which pages were tested]
```

---

## Quick reference table

| Domain | Content selector | Bloat source | Verified |
|--------|-----------------|--------------|----------|
| rolls-royce.com | `#homewrapper` | Non-semantic div navigation | Yes |
