# Connect.IQ criteria reference

Source: Connect.IQ 2024 dataset (747 companies across FTSE 100, FTSE 250, S&P 500, STOXX 50)
Framework owner: IDX
Total criteria: 356 binary (present/not present) evaluations
Live data: `sector_intelligence.iq_benchmarks` and `sector_intelligence.iq_criteria_detail` in BigQuery

This reference structures the Connect.IQ criteria for use during site analysis. Each criterion is binary: the element is either present (1) or absent (0) on the site. When BigQuery is available, actual scores and criteria detail are fetched directly. During crawl-based estimation (when BigQuery is unavailable), focus on criteria that are **observable from page content** — skip criteria requiring external tools (SEO metrics, social media stats) unless you have access to that data.

---

## FTSE 250 benchmark summary (offline reference)

> **Note:** These are static reference figures for the FTSE 250 subset. When BigQuery is
> available, query live index statistics directly — the full dataset covers 4 indices and
> 747 companies. Use these figures only as fallback context.

| Metric | Value |
|--------|-------|
| Companies assessed | 95 |
| Overall score range | 17.1 – 58.9 |
| Mean overall score | 38.5 |
| Median overall score | 38.6 |
| Standard deviation | 8.6 |

### Category averages (FTSE 250)

Use these to contextualise a company's performance in each area:

| Category | Description |
|----------|-------------|
| Overall | Composite weighted score across all categories |
| Company Narrative | Strength of corporate story (About, Strategy, Business Model) |
| Content Mix | Variety and depth of content types (video, reports, case studies) |
| Channel Mix | Presence and integration across digital channels |
| Optimisation | Technical quality (speed, accessibility, HTML validation) |
| Reach | SEO performance (domain authority, organic traffic, keywords) |
| About Us | Dedicated about section quality and completeness |
| IR | Investor relations section depth and functionality |
| Media | Newsroom/media centre quality |
| CSR | Sustainability/ESG content depth |
| Careers | Careers section quality and functionality |
| Reputational Resilience | Overall digital resilience and authority signals |

### Top 10 companies (2024)

| Rank | Company | Overall |
|------|---------|---------|
| 1 | Marks and Spencer | 58.9 |
| 2 | QinetiQ Group | 57.5 |
| 3 | John Wood Group | 55.0 |
| 4 | Balfour Beatty | 54.8 |
| 5 | Babcock | 54.8 |
| 6 | Serco Group | 54.3 |
| 7 | Rotork | 53.1 |
| 8 | Spirax Group | 52.7 |
| 9 | Renishaw | 51.7 |
| 10 | Weir Group | 51.4 |

### Bottom 5 companies (2024)

| Rank | Company | Overall |
|------|---------|---------|
| 91 | Auction Technology Group | 24.0 |
| 92 | F&C Investment Trust | 23.9 |
| 93 | ICG | 23.8 |
| 94 | HICL Infrastructure | 22.0 |
| 95 | Personal Assets Trust | 17.1 |

---

## About Us criteria (criteria 2-35)

These evaluate the company's About section, corporate identity, and business description.

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 2 | Dedicated "About Us" section | Top-level /about or /about-us section in navigation |
| 3 | Localised about us content | Separate about content on local/regional sites |
| 4 | Profile — Level 1 (Basic) | Company description present |
| 5 | Profile — Level 2 (Quantification) | Description includes specific numbers (revenue, employees, countries) |
| 6 | CEO statement | Statement, message, or video from the CEO |
| 7 | Strategy — Level 1 (Basic) | Strategy section or page exists |
| 8 | Strategy — Level 2 (Quantification) | Strategy includes specific targets or metrics |
| 9 | Business model — Level 1 (Basic) | Business model described |
| 10 | Business model — Level 2 (Quantification) | Model includes financial or operational metrics |
| 11 | Corporate video | Video content on about/corporate pages |
| 12 | Organisation — Level 1 (Basic) | Organisational structure described |
| 13 | Organisation — Level 2 (Business pages) | Dedicated pages for business divisions/units |
| 14 | History — Level 1 (Static) | Company history section (text/timeline) |
| 15 | History — Level 2 (Interactive) | Interactive timeline or rich media history |
| 16 | Market environment (Basic) | Description of market/industry context |
| 17 | Market environment (Quantification) | Market data with specific figures |
| 18 | Interactive map of operations | Interactive geographic map |
| 19 | Description of regional operations | Regional/country-level operation descriptions |
| 20 | Head office contact — Level 1 (Static) | Contact details present |
| 21 | Interactive map of offices | Interactive office locator with directions |
| 22 | CEO/senior management blog | Blog or regular content from leadership |
| 23 | Interactive animation or feature | Interactive content related to business/services |
| 24 | Company legal information | Legal entity details, registration numbers |
| 25 | Purpose, vision and mission — Level 1 | Purpose/vision/mission statement present |
| 26 | Purpose, vision and mission — Level 2 | Quantified or detailed purpose framework |
| 27 | What we do — Level 1 | Basic description of activities |
| 28 | What we do — Level 2 (Multiple pages) | Multiple pages describing different activities |
| 29 | What we do — Level 3 (Case studies) | Case studies illustrating activities |
| 30 | Innovation — Level 1 | Innovation mentioned or section exists |
| 31 | Innovation — Level 2 (Multiple pages) | Dedicated innovation content across pages |
| 32 | Innovation — Level 3 (Case studies) | Innovation case studies |
| 33 | Digitisation — Level 1 | Digital transformation mentioned |
| 34 | Digitisation — Level 2 (Multiple pages) | Dedicated digital content |
| 35 | Digitisation — Level 3 (Case studies) | Digital transformation case studies |

---

## Corporate Governance criteria (criteria 36-55)

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 36 | Dedicated "Corporate Governance" section | Governance section in navigation |
| 37 | Governance code compliance statement | Statement of compliance with UK Corporate Governance Code or equivalent |
| 38 | Governance statements (Basic) | General governance statements present |
| 39 | Governance statements (Detailed) | Detailed governance framework description |
| 40 | Articles of association | Constitutional documents available for download |
| 41 | Committees (Names and members) | Committee membership listed |
| 42 | Committees (Terms of reference) | ToR documents available |
| 43 | Executive board — Level 1 (Names) | List of executive directors |
| 44 | Executive board — Level 2 (Bios and photos) | Full bios with photographs |
| 45 | Non-executive board — Level 1 (Names) | List of NEDs |
| 46 | Non-executive board — Level 2 (Bios and photos) | NED bios with photographs |
| 47 | Senior management — Level 1 (Names) | Leadership team listed |
| 48 | Senior management — Level 2 (Bios) | Leadership bios |
| 49 | Directors' interests | Details of directors' share interests |
| 50 | Directors' dealings | Recent dealings disclosed |
| 51 | Role of board/NEDs | Description of board and NED roles |
| 52 | GDPR policy/page | Privacy policy or GDPR page |
| 53 | GDPR opt-in cookie consent | Cookie consent banner on first visit |
| 54 | Gender pay reporting | Gender pay gap data published |
| 55 | Risk management approach | Risk management framework described |

---

## Investor Relations criteria (criteria 56-115)

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 56 | Dedicated "Investor" section | Top-level IR section in navigation |
| 57 | Integrated IR content | IR content woven into other sections (not siloed) |
| 58 | Investment proposition explanation | Why invest / equity story page |
| 59 | Key financial data — Level 1 (Basic) | Basic financial figures present |
| 60 | Key financial data — Level 2 (Extended) | Extended financial data (5+ years, multiple metrics) |
| 61 | Financial/fundamental ratios | P/E, EV/EBITDA, or similar ratios shown |
| 62 | Business drivers and KPIs | Non-financial KPIs reported |
| 63 | Share ownership (Major shareholders) | Top shareholders listed |
| 64 | Share ownership (Further analysis) | Detailed ownership breakdown |
| 65 | Capital structure and debt | Debt/capital information |
| 66 | Corporate/financial factsheet | Standalone factsheet document |
| 67 | Principal risks | Key risks disclosed |
| 68 | Latest annual report (PDF) | Current year report downloadable |
| 69 | Reporting microsite | Separate annual report microsite |
| 70 | Embedded annual report (HTML) | HTML version within main site |
| 71 | Annual report includes video | Video content in/alongside report |
| 72 | 5-year archive of annual reports | At least 5 years of reports available |
| 73 | Latest quarterly/interim results | Most recent interim results available |
| 74 | ESEF downloadable | European Single Electronic Format available |
| 75 | ESEF with XBRL viewer | XBRL-tagged version with viewer |
| 76 | Most recent results — slides | Presentation slides downloadable |
| 77 | Most recent results — Webcast Level 1 | Audio webcast available |
| 78 | Most recent results — Webcast Level 2 | Video webcast with slides |
| 79 | Most recent results — transcript | Presentation transcript available |
| 80 | Results archive — slides (3+ years) | Historical presentation slides |
| 81 | Results archive — webcasts (3+ years) | Historical webcasts |
| 82 | Filmed statement on results/strategy | Video interview or statement |
| 83 | Motion graphics on results/strategy | Animated content explaining results |
| 84 | Content in MP3/podcast format | Audio content available |
| 85 | Non-results presentations (PPT) | Capital markets day, strategy presentations |
| 86 | Non-results presentations (Webcast) | Webcasts of non-results events |
| 87 | Named IR contact with email/phone | Specific IR person contactable |
| 88 | Analyst coverage list | List of covering analysts |
| 89 | Interactive data charting | Interactive financial data tool |
| 90 | Financial data downloadable (Excel) | Excel download of financial data |
| 91 | Analyst estimates | Consensus estimates shown |
| 92 | Regulatory news page | RNS/regulatory news feed |
| 93 | Regulatory news search | Searchable regulatory news archive |
| 94 | Share price — Level 1 (Delayed) | Delayed share price shown |
| 95 | Share price — Level 2 (Real time) | Real-time share price |
| 96 | Share price on homepage or IR page | Price visible on key pages |
| 97 | Detailed share price table | Extended price data table |
| 98 | Share chart — Level 1 (Basic) | Simple price chart |
| 99 | Share chart — Level 2 (Comparative) | Chart with index/peer comparison |
| 100 | Share chart social links | Shareable chart |
| 101 | Share price calculator | Investment return calculator |
| 102 | Share chart accessibility | Accessible chart (alt text, data table) |
| 103 | Share price alert | Price alert signup |
| 104 | Total shareholder return chart | TSR chart available |
| 105 | Share price history (Excel download) | Historical price data downloadable |
| 106 | AGM information (Basic) | AGM date and basic details |
| 107 | AGM (Detailed) | Full AGM materials, resolutions, voting |
| 108 | AGM webcast | AGM recorded/live webcast |
| 109 | AGM archive (1+ years) | Past AGM materials available |
| 110 | Online share register | Shareholder portal access |
| 111 | Registrar details and links | Share registrar information |
| 112 | Investor FAQ | Frequently asked questions page |
| 113 | Dividend information | Dividend policy, dates, history |
| 114 | Dividend calculator | Dividend calculation tool |
| 115 | Glossary | Industry/financial terminology glossary |

---

## Media / News criteria (criteria 116-142)

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 116 | Dedicated "Media" or "News" centre | Top-level news/media section |
| 117 | Integrated media content | Media content woven across sections |
| 118 | Evidence of authority in field | Thought leadership, industry commentary |
| 119 | Evidence of research sharing | Original research or data published |
| 120 | Ongoing research sharing (Annual) | Regular research/insight publishing |
| 121 | Press pack / key facts | Media-ready company facts/kit |
| 122 | Press releases — Level 1 (Basic) | Text-only press releases |
| 123 | Press releases — Level 2 (Rich) | Releases with images, multimedia |
| 124 | Press releases shareable on social | Share buttons on releases |
| 125 | Press release archive (4+ years) | Historical releases |
| 126 | Dedicated press release search | Search functionality for news |
| 127 | Email alerting service | News email subscription |
| 128 | Calendar of events — IR | Investor events calendar |
| 129 | Calendar of events — Industry | Industry event participation |
| 130 | Calendar of events — Corporate | Corporate events listed |
| 131 | Calendar reminder functionality | Add-to-calendar feature |
| 132 | Third-party news/comment | External media coverage |
| 133 | Whitepapers/articles by management | Leadership thought pieces |
| 134 | Content updates — Level 1 (Monthly) | At least 1 article per month |
| 135 | Content updates — Level 2 (3+/month) | 3 or more articles monthly |
| 136 | Image library — Level 1 (Basic) | Downloadable images available |
| 137 | Image library — Level 2 (Extended) | Comprehensive image library |
| 138 | Image library social links | Shareable images |
| 139 | Video gallery | Dedicated video content section |
| 140 | Brand assets and guidelines | Brand toolkit available |
| 141 | Named media spokesperson | Media contact with name and details |
| 142 | Feedback form / interactive chat | Contact or engagement mechanism |

---

## CSR / Sustainability criteria (criteria 143-188)

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 143 | Dedicated top-level sustainability section | Sustainability in main navigation |
| 144 | Integrated CSR content | ESG content woven across site |
| 145 | CEO/exec message — Level 1 (Basic) | Text message from leadership on ESG |
| 146 | CEO/exec message — Level 2 (Video) | Video message on sustainability |
| 147 | Strategy/approach — Basic | Sustainability approach described |
| 148 | Strategy/approach — Quantification | Strategy with specific targets |
| 149 | Stakeholder engagement | Evidence of stakeholder engagement process |
| 150 | Materiality assessment — Basic | Material topics identified |
| 151 | Materiality assessment — Quantified | Materiality matrix or scored assessment |
| 152 | Supply chain page | Supply chain sustainability content |
| 153 | CSR principles/policies statement | Policy framework stated |
| 154 | CSR press releases | Sustainability-specific news |
| 155 | CSR areas — Level 1 (Basic) | At least one ESG topic covered |
| 156 | CSR areas — Level 2 (3+ areas) | Three or more topics in depth |
| 157 | Climate change / carbon topic | Climate-specific content |
| 158 | Environment topic | Environmental content beyond climate |
| 159 | Employees topic | People/employee wellbeing content |
| 160 | Communities topic | Community engagement content |
| 161 | GHG — Level 1 (Scope 1) | Scope 1 emissions reported |
| 162 | GHG — Level 2 (Scope 1 & 2) | Scope 1 and 2 reported |
| 163 | GHG — Level 3 (Scope 1, 2 & 3) | All three scopes reported |
| 164 | Net zero roadmap | Net zero commitment with pathway |
| 165 | GRI reporting | GRI index or reference |
| 166 | SASB reporting | SASB disclosure |
| 167 | TCFD reporting | TCFD-aligned reporting |
| 168 | UN SDGs — Basic | SDGs referenced |
| 169 | UN SDGs — Quantified | SDG targets with specific metrics |
| 170 | CSR video | Sustainability video content |
| 171 | CSR KPIs — Level 1 (Basic) | Some ESG metrics reported |
| 172 | CSR KPIs — Level 2 (Advanced) | Comprehensive ESG data set |
| 173 | Sustainability report — PDF | Downloadable report |
| 174 | Sustainability report — Microsite | Dedicated report microsite |
| 175 | Sustainability report — Integrated | Report integrated into main site |
| 176 | Sustainability report — Multiple pages | Multi-page integrated content |
| 177 | Independent CSR rating | Third-party ESG rating cited |
| 178 | D&I page — Basic | Diversity content present |
| 179 | D&I page — Multiple pages | Extended D&I content |
| 180 | D&I page — Case studies | D&I case studies |
| 181 | D&I stories with video | Video D&I content |
| 182 | CSR case studies | ESG case studies |
| 183 | CSR case studies — Video | Video case studies |
| 184 | CSR case studies — Committed publisher | Regular new case studies |
| 185 | Interactive CSR data charting | Interactive ESG data tool |
| 186 | Interactive CSR animation/feature | Interactive sustainability content |
| 187 | Links to external CSR sites | Links to external ESG resources |
| 188 | Named CSR contact | Sustainability contact details |

---

## Careers criteria (criteria 189-220)

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 189 | Dedicated "Careers" section | Top-level careers in navigation |
| 190 | Integrated careers section | Careers content woven across site |
| 191 | Localised careers websites | Regional careers sites |
| 192 | School leavers / internships | Early careers content |
| 193 | Graduates | Graduate programme page |
| 194 | Experienced hires | Experienced professionals section |
| 195 | Role area pages | Pages by job function/area |
| 196 | Role area descriptions | Detailed role area content |
| 197 | Employee case studies (Text) | Written employee stories |
| 198 | Employee case studies (Video) | Video employee stories |
| 199 | Employee case studies — Committed publisher | Regular new stories |
| 200 | Statement of values/culture | Culture and values content |
| 201 | Culture case studies | Specific culture examples |
| 202 | Employment/recruitment policies | Recruitment policy stated |
| 203 | Employee blog | Employee-authored content |
| 204 | Recruitment FAQs | Application process FAQ |
| 205 | Career paths | Career progression information |
| 206 | Interactive recruitment feature | Interactive careers content |
| 207 | Recruitment video | Careers/culture video |
| 208 | ATS integration — Level 1 | Basic job listing from ATS |
| 209 | ATS integration — Level 2 | Filtered/searchable job listing |
| 210 | ATS integration — Level 3 | Full ATS integration with apply |
| 211 | Job opportunities | Active job listings present |
| 212 | Rewards and benefits | Benefits information |
| 213 | Training and development | L&D content |
| 214 | Job search | Search functionality for roles |
| 215 | Job alert | Job alert signup |
| 216 | Online application | Apply online capability |
| 217 | Online talent pool | Talent community registration |
| 218 | Recruitment chatbot | AI/chatbot recruitment tool |
| 219 | Recruitment events calendar | Careers events listed |
| 220 | HR contact details | Recruitment contact information |

---

## Technical / Optimisation criteria (criteria 221-246)

### Partially observable from crawl:

| # | Criterion | What to look for | Observable? |
|---|-----------|-----------------|-------------|
| 221 | Top-level navigation from all pages | Consistent main nav | Yes |
| 222 | Navigation highlights current position | Active nav state | Yes |
| 223 | Sub-navigation viewable from second level | Dropdown/flyout menus | Yes |
| 224 | Breadcrumb trail | Breadcrumbs present | Yes |
| 225 | Quick/related links | Related content links | Yes |
| 226 | "Back to top" links | Scroll-to-top feature | Yes |
| 227 | Sitemap page | HTML sitemap | Yes |
| 228 | Images have alt text | Alt attributes on images | Partial |
| 229-231 | HTML validation (3 levels) | Error count | No (needs tool) |
| 232 | Timestamped pages | Dates on content | Yes |
| 233 | Meta information on top-level pages | Meta tags present | Partial |
| 234 | HTTPS setup | Site uses HTTPS | Yes |
| 235 | Sitemap.xml setup | XML sitemap exists | Yes (check /sitemap.xml) |
| 236 | Robots.txt setup | Robots file exists | Yes (check /robots.txt) |
| 237-239 | Mobile site speed (3 levels) | Speed score | No (needs PageSpeed) |
| 240-242 | Desktop site speed (3 levels) | Speed score | No (needs PageSpeed) |
| 243 | Accessibility statement | Accessibility page | Yes |
| 244-246 | Accessibility score (3 levels) | Score | No (needs audit tool) |

---

## SEO criteria (criteria 247-270)

These require external SEO tools (Ahrefs, SEMrush) and are NOT observable from a crawl. Note them as requiring separate assessment.

| # | Category | Levels |
|---|----------|--------|
| 247-249 | Domain authority (DR) | 0-39 / 40-69 / 70-100 |
| 250-252 | Referring domains trend | Decrease / Stable / Increase |
| 253-255 | Site health % | 0-70% / 71-90% / 91-100% |
| 256-258 | Broken links | 500+ / 1-499 / 0 |
| 259-261 | Organic traffic trend | Decrease / Stable / Increase |
| 262-264 | Organic keywords trend | Decrease / Stable / Increase |
| 265-267 | Top-10 keywords trend | Decrease / Stable / Increase |
| 268-270 | Non-branded traffic % | 50-100% / 25-49% / 1-24% |

---

## Paid search criteria (criteria 271-279)

Not observable from crawl.

| # | Category | Levels |
|---|----------|--------|
| 271-273 | Paid keywords trend | Decrease / Stable / Increase |
| 274-276 | Paid traffic trend | Decrease / Stable / Increase |
| 277-279 | Paid budget trend | Decrease / Stable / Increase |

---

## Social media criteria (criteria 280-321)

Partially observable (presence of social links on site, but engagement metrics require external tools).

### Observable from crawl:

| # | Criterion | What to look for |
|---|-----------|-----------------|
| 280-281 | Facebook ads | Not observable |
| 282-284 | LinkedIn followers (3 levels) | Not observable (but LinkedIn link presence is) |
| 285 | Search functionality | On-site search works |
| 286 | Email a friend | Share-by-email feature |
| 287 | Print optimisation | Print-friendly option |
| 288 | RSS feeds | RSS available for news |
| 289-291 | Twitter/X account (3 levels) | Twitter link presence and prominence |
| 292-293 | Twitter engagement (2 levels) | Not observable |
| 294-296 | Facebook account (3 levels) | Facebook link presence and prominence |
| 297-298 | Facebook engagement (2 levels) | Not observable |
| 299-301 | YouTube account (3 levels) | YouTube link presence and prominence |
| 302-303 | YouTube engagement (2 levels) | Not observable |
| 304-306 | Instagram account (3 levels) | Instagram link presence and prominence |
| 307-308 | Instagram engagement (2 levels) | Not observable |
| 309-311 | LinkedIn account (3 levels) | LinkedIn link presence and prominence |
| 312-313 | LinkedIn engagement (2 levels) | Not observable |
| 314 | Social media page sharing | Share buttons on pages |
| 315 | Posting to social during events | Not observable |
| 316 | Social media gallery/page | Dedicated social content section |
| 317 | Embedded social media feed | Social feed widget on site |
| 318 | Careers social media channel | Dedicated careers social accounts |
| 319 | Homepage "follow us" links | Social links on homepage |
| 320 | Most pages "follow us" links | Social links across site |
| 321 | Video sharing on social | Not observable from crawl alone |

---

## Using this reference during analysis

### Quick audit (15-20 pages):
Focus on the **must-have criteria** for each Playbook page type found. Count observable IQ criteria in each section. Compare totals to FTSE 250 norms.

### Deep dive (40-50 pages):
Evaluate every criterion marked "Observable from crawl" across all sections found. Produce a section-by-section scorecard.

### When reporting:
- Always name-check the "IDX Corporate Website Playbook" for best-practice gaps
- Reference "Connect.IQ benchmarks" when comparing to peers (specify which index)
- If BigQuery is available and the company is in the dataset, cite actual scores as `[FACT]`
- If BigQuery is available but the company is NOT in the dataset, use index stats for context and estimate the company's position as `[INFERENCE]`
- If BigQuery is unavailable, estimate from observable criteria per `iq-scoring-model.json`

### Companies in the 2024 dataset:

The full dataset contains 747 companies (FTSE 100: 103, FTSE 250: 93, S&P 500: 501, STOXX 50: 50). Query BigQuery to check if a company is in the dataset. The FTSE 250 subset (listed below for offline reference) contains:

Marks and Spencer, QinetiQ Group, John Wood Group, Balfour Beatty, Babcock, Serco Group, Rotork, Spirax Group, Renishaw, Weir Group, Elementis, Britvic, Cranswick, Greggs, Genus, Spectris, Hunting, Diploma, Grafton Group, Marshalls, HomeServe, Chemring Group, Senior, Drax Group, Vesuvius, Coats Group, Howden Joinery, Victrex, Hill & Smith, Volution Group, Hyve Group, RHI Magnesita, TI Fluid Systems, Ibstock, Morgan Advanced Materials, Bodycote, Essentra, Devro, Savills, Dunelm Group, Inchcape, Oxford Instruments, Genuit Group, Mitie Group, Paragon Banking Group, PageGroup, RWS Holdings, Moonpig, Ascential, Pets at Home, Redde Northgate, Dr. Martens, Watches of Switzerland, Cairn Homes, Kainos Group, Computacenter, Softcat, Future, Bytes Technology, YouGov, Alpha Financial Markets Consulting, Ergomed, Keywords Studios, XPS Pensions Group, Restore, Learning Technologies Group, Boku, Kin and Carta, Trustpilot, Team17 Group, Gamma Communications, Auction Technology Group, FDM Group, TP ICAP Group, Investec, Jupiter Fund Management, Quilter, Man Group, Ashmore Group, Liontrust Asset Management, Ninety One, ICG, Scottish Mortgage Investment Trust, F&C Investment Trust, Polar Capital Holdings, Personal Assets Trust, Impax Asset Management, Greencoat UK Wind, HICL Infrastructure, Hipgnosis Songs Fund, Smiths News, Foresight Group, River and Mercantile Group, Gresham House
