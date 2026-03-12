# ARCHETYPE_LIBRARY.md
# Mercury Strategy — Website archetype library
# Version 0.1 | March 2026

---

## Purpose

This library defines 13 named website archetypes — recurring structural
and strategic failure patterns observed across IDX client engagements.

The Findings skill uses this library to recognise patterns in crawl
evidence rather than synthesise themes from scratch. For each archetype,
the skill checks whether the required minimum of supporting criteria is
present before surfacing the archetype in the main report.

### Confidence thresholds

| Confidence | Criteria required | Where it appears |
|------------|-------------------|-----------------|
| High | 3 or more criteria met | Main findings body |
| Medium | 2 criteria met | Appendix, flagged for consultant review |
| Low | 1 criterion met | Not surfaced — discard |

### How to apply

1. After the crawl phase, load the claim evidence from the evidence manifest
2. For each archetype, check each criterion against collected evidence
3. Count supporting criteria and assign confidence level
4. High-confidence archetypes are elevated to strategic implications in the
   main report body; Medium go to appendix
5. Each High-confidence archetype triggers a capability archetype lookup
   in CAPABILITY_LIBRARY.md

---

## Archetype definitions

---

### A01 — The document repository

**Pattern:** The site functions as a static filing cabinet. Results,
reports, regulatory documents and service information are published but
never contextualised, packaged, or made accessible for any audience
beyond those already motivated to search.

**Primary audience affected:** Investors, analysts, and general users
seeking to evaluate or act on the company's offering.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A01-1 | IR landing page | No headline KPIs surfaced; results only accessible as raw PDF download with no accompanying snapshot or highlights |
| A01-2 | Investment case | No dedicated investment case page; financial narrative absent or confined to annual report |
| A01-3 | Results page | Results archive is an unsearchable list of documents; no key messages or CEO quote surfaced |
| A01-4 | Annual report page | Full report PDF present but no financial highlights, chapter navigation, or strategic summary |
| A01-5 | Sustainability reporting centre | ESG data available only inside PDF; no downloadable data pack, no structured on-page disclosure |
| A01-6 | Newsroom | News section is a flat chronological list of regulatory announcements with no editorial packaging |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals (from AUDIENCE_LIBRARY.md):**
Tiers 1.1–1.4 (institutional investors, buy-side and sell-side analysts)
are most acutely affected. ESG rating agencies (2.1) will mark data as
not disclosed rather than searching inside PDFs.

**Typical client profile:** Listed company with well-resourced IR
function that publishes diligently but has not invested in digital
packaging. Often mistakenly believes publication equals accessibility.

---

### A02 — The strategy announcement without follow-through

**Pattern:** A major strategy, transformation or brand promise is
launched — often with a dedicated page and leadership video — but the
site never evolves to show progress, proof points, or delivery
milestones, turning a live commitment into a stale campaign artefact.

**Primary audience affected:** Investors assessing delivery credibility;
prospective partners and employees evaluating organisational ambition.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A02-1 | Strategy page | Strategy page exists but content is more than 18 months old with no evidence of update |
| A02-2 | Strategy page | No medium-term targets stated, or targets present with no progress data against them |
| A02-3 | Investment case | Investment case exists but strategic narrative is disconnected from stated strategy elsewhere on site |
| A02-4 | Sustainability strategy | ESG commitments stated but no progress section, no KPIs with baseline and current data |
| A02-5 | Newsroom | No news or announcements linking corporate news back to strategic delivery milestones |
| A02-6 | IR landing page | Financial calendar is stale or events module shows only past events, signalling low maintenance investment |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Sell-side analysts (1.4) and responsible investment teams (2.2) are
specifically looking for delivery evidence, not just strategy
articulation. Buy-side analysts (1.3) will notice target disclosure
without progress data.

**Typical client profile:** Company that has communicated a significant
transformation but whose digital estate has not kept pace. Often
triggered by a change in CEO or brand repositioning.

---

### A03 — The invisible stakeholder

**Pattern:** The site attempts to serve multiple distinct audiences but
collapses them into a single undifferentiated experience that serves
none of them well, creating confusion, high bounce rates, and missed
conversion opportunities.

**Primary audience affected:** Whichever audience the site nominally
prioritises but practically fails — most commonly investors or
high-intent commercial visitors.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A03-1 | IR landing page | IR content not separated from general corporate content; no clear investor pathway from homepage |
| A03-2 | Careers hub | Careers section targets one audience type only (e.g. graduates) with no experienced hire pathway |
| A03-3 | Sustainability reporting centre | ESG disclosure mixed with sustainability narrative pages; rating agencies and retail investors served by same content with no differentiation |
| A03-4 | Homepage (universal) | Homepage navigation does not offer explicit audience entry points; no stakeholder-oriented quick links |
| A03-5 | Governance | Governance content not separated from About content; governance-focused visitors must navigate through general company pages |
| A03-6 | Stakeholder content priorities | Two or more high-priority audience tiers (from AUDIENCE_LIBRARY.md) have no dedicated pathway or content layer |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Any tier that has specific access patterns (see AUDIENCE_LIBRARY.md) is
at risk when navigation is undifferentiated. Most commonly affects
institutional investors (1.1–1.3), ESG rating agencies (2.1), and B2B
procurement (3.1–3.2).

**Typical client profile:** Company that has grown its digital estate
organically, adding sections as needs arose, without ever redesigning
around audience architecture. Navigation reflects internal org structure
rather than user intent.

---

### A04 — The broken conversion funnel

**Pattern:** Traffic is delivered — through SEO, paid media, content,
or brand awareness — but fails to convert because the receiving pages
are not optimised for the action: forms are buried, CTAs are weak or
misplaced, landing pages are generic, or the journey from entry to
action is fragmented.

**Primary audience affected:** High-intent users arriving via paid or
organic channels; leads and prospective customers.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A04-1 | IR landing page | IR contact absent or buried; no email alert signup visible; no clear CTA for next investor action |
| A04-2 | Careers hub | Job search absent or not ATS-integrated; application pathway requires multiple steps off-site |
| A04-3 | Newsroom | No email alerting service; no social sharing on press releases; no conversion route for engaged visitors |
| A04-4 | Universal — SEO/AEO | Pages lack meta descriptions, heading hierarchy, or schema markup, indicating low investment in organic conversion |
| A04-5 | Contact / services | No audience-specific contact routes; single generic form as only conversion mechanism across all audience types |
| A04-6 | Sustainability reporting centre | ESG data requires registration or multi-step navigation; rating agencies cannot access structured data efficiently |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Digital marketing managers (4.2) evaluating the agency's own site will
notice this immediately. For industrial B2B clients, senior procurement
directors (3.1) who never fill in a generic contact form represent a
significant lost conversion opportunity.

**Typical client profile:** Company with active inbound marketing or
paid media investment but low conversion rates. Often first identified
through GA4 data showing traffic that does not result in measurable
actions.

---

### A05 — The foundational-only site

**Pattern:** The site meets basic compliance and usability standards
but lacks any strategic content layer. It is functional but generates
no meaningful shift in audience perception, behaviour, or intent.

**Primary audience affected:** All external audiences; particularly
first-impression audiences (prospective investors, partners, talent)
and IR teams who compensate for site gaps through 1:1 outreach.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A05-1 | Investment case | No investment case page; investor value proposition absent from digital estate |
| A05-2 | Strategy page | Strategy page absent, or present as a single undifferentiated paragraph with no pillars or targets |
| A05-3 | Sustainability strategy | Sustainability content limited to a single page or PDF link; no topic pages, no data downloads |
| A05-4 | At a glance | No key facts page; company scale and profile not surfaced in scannable format |
| A05-5 | Newsroom | Newsroom absent or not updated within past 30 days; no thought leadership or authored content |
| A05-6 | Universal — content maintenance | Site does not meet quarterly update cadence for results, KPIs, or financial calendar |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Executive hires (6.3) assess the website itself as a proxy for
management's attention to corporate presentation. Sell-side analysts
(1.4) need a strategy narrative to work from. Marketing directors (4.1)
evaluating IDX as a consultancy will judge the consultancy's own site
by this standard.

**Typical client profile:** Company earlier in its digital maturity
journey, often privately owned or recently listed, where the website
has not been treated as a strategic asset. Sometimes accompanied by
genuinely good underlying content that is not being surfaced.

---

### A06 — The legacy platform trap

**Pattern:** Ageing infrastructure is the primary bottleneck. The
platform cannot handle traffic spikes, fails security requirements,
cannot support modern content formats, and cannot integrate with
analytics, ATS, or AI tools — making it impossible to improve content
quality without first resolving the platform.

**Primary audience affected:** All audiences — platform limitations
degrade every audience experience simultaneously.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A06-1 | Universal — design and accessibility | Site fails WCAG 2.1 AA; load speed exceeds 3 seconds; not mobile-first |
| A06-2 | Universal — SEO/AEO | No schema markup; non-descriptive URLs; no structured data; PDF documents not indexed |
| A06-3 | Results page | Webcasts or video content absent or hosted on deprecated platforms |
| A06-4 | Sustainability reporting centre | No interactive data tools; no downloadable data packs; PDFs only with no alternative formats |
| A06-5 | Careers hub | ATS integration absent; job search not functional; application journey routes off-site to a mismatched subdomain |
| A06-6 | IR landing page | Share price widget absent or non-functional; JavaScript-rendered content not crawlable |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
CIOs and CTOs (8.1) evaluating technology platforms will notice
platform symptoms immediately. ESG rating agencies (2.1) specifically
need machine-readable data that legacy platforms cannot provide.

**Typical client profile:** Large enterprise with a site built more
than five to seven years ago, maintained through incremental updates
rather than platform investment. Platform age is often a proxy for
accumulated technical debt across all digital channels.

---

### A07 — The invisible commercial audience

**Pattern:** High-intent B2B buyers are present in traffic but the
site is not structured to serve them. Commercial content is buried in
a corporate-first hierarchy, and the site architecture assumes a
general visitor rather than a procurement decision-maker.

**Primary audience affected:** B2B procurement decision-makers across
the customer's buying cycle; particularly senior procurement directors
and technical specification teams.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A07-1 | At a glance | Business model or commercial offering not described; site focuses on corporate story without addressing customer value |
| A07-2 | Strategy page | Strategy narrative is investor-oriented with no articulation of customer proposition or commercial differentiation |
| A07-3 | Newsroom | Case studies absent or confined to a single generic page with no sector, application, or outcome filtering |
| A07-4 | Universal — stakeholder content | No B2B audience pathway; commercial pages buried three or more levels below homepage |
| A07-5 | Contact | No named commercial contact; only a generic enquiry form with no routing by enquiry type |
| A07-6 | Careers hub | Site has a well-developed careers section but no equivalent investment in commercial audience content, indicating internal vs external priority imbalance |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Senior procurement directors (3.1) and engineering specification teams
(3.2) are the primary affected audiences. MRO buyers (3.3) will not
find aftermarket service content if the site is structured around
corporate narrative rather than customer need.

**Typical client profile:** Large industrial, engineering, or B2B
services company whose digital estate was designed for investors and
regulators rather than commercial audiences. Often accompanied by
strong IR and sustainability content alongside weak commercial pages.

---

### A08 — The fragmented global presence

**Pattern:** Country-specific pages or subsites proliferate without a
coherent global architecture. The experience is inconsistent by locale:
different navigation, different content depth, different design
language, and no clear relationship between global and local.

**Primary audience affected:** International visitors, procurement
teams evaluating a global supplier, and talent in non-home markets.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A08-1 | At a glance | Geographic footprint described in body text but not surfaced through structured navigation or locale-aware content |
| A08-2 | Careers hub | Country-specific careers pages exist as standalone subdomains or subsites with no consistent IA or employer brand alignment |
| A08-3 | Universal — design and accessibility | Visual design, navigation structure, or content depth is materially inconsistent across locale versions |
| A08-4 | Universal — SEO/AEO | Hreflang tags absent or incorrectly implemented; duplicate content across locale versions without canonical resolution |
| A08-5 | Newsroom | Press releases and news content exists only in one language; international stakeholders have no localised access to corporate updates |
| A08-6 | Strategy page | Global strategy is articulated centrally but regional market strategies or priorities are not represented on the site |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
International talent (6.1–6.2) in non-English first language markets
face accessibility barriers. Defence and government procurement teams
(3.4) in specific markets need to find locally relevant compliance and
contact information. ESG rating agencies (2.1) need consistent global
data, not a patchwork of market disclosures.

**Typical client profile:** Multinational that has grown through
acquisition or organic expansion, accumulating digital estates in each
market without a governance model for global IA. Often accompanied by
a strong central site and dramatically weaker market sites.

---

### A09 — The careers site as afterthought

**Pattern:** Employer brand and EVP exist as a defined internal
framework but the careers platform does not reflect them. The careers
section is hosted on a separate subdomain, uses a different design
system, and has received no equivalent investment to the corporate
site.

**Primary audience affected:** Graduate and early careers candidates,
experienced professional hires, and executive search firms conducting
initial research.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A09-1 | Careers hub | Careers section is a single page with a link to an external ATS; no dedicated careers hub with structured content |
| A09-2 | Careers hub | No employee case studies; culture content is generic values statement with no personalisation by audience type |
| A09-3 | Careers hub | Graduate programme information absent or thin (single paragraph without structure, rotations, or development detail) |
| A09-4 | Careers hub | No role area pages; all audiences directed to a single jobs list regardless of career stage or function |
| A09-5 | Universal — design and accessibility | Careers subdomain or section uses materially different design language, navigation, or branding from the main corporate site |
| A09-6 | At a glance / Strategy | Company articulates purpose, values, and culture in the About section but this content does not cross-reference or connect to the careers section |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Graduate candidates (6.1) are most acutely affected — they expect a
modern careers experience and will compare to Glassdoor and LinkedIn.
Experienced professional hires (6.2) cross-reference careers content
with strategy and leadership content; disconnection between the two is
a negative signal.

**Typical client profile:** Company with a defined employer value
proposition — often articulated in an internal document or recruitment
marketing — that has not translated that EVP into the digital careers
experience. Common where the careers site is owned by HR rather than
digital, with no shared platform or design system.

---

### A10 — The one-day website

**Pattern:** Investor or corporate events are treated as isolated
digital productions rather than persistent content assets. Landing
pages go live for an event and are archived or removed afterwards;
the content generated is not integrated into the permanent site.

**Primary audience affected:** Investors and analysts who access event
content after the live moment; media seeking post-event reference
material.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A10-1 | Results page | Webcasts from past events not archived or accessible; results archive lists document titles without associated media |
| A10-2 | IR landing page | No dedicated CMD or capital markets event section; past CMD materials not discoverable from IR hub |
| A10-3 | Newsroom | No post-event content atomisation; no highlight clips, quote graphics, or write-ups derived from events |
| A10-4 | Investment case | Investment case page does not reference or link to relevant CMD or strategic event materials |
| A10-5 | Strategy page | Strategy content is not updated following strategy events to reflect the communicated direction |
| A10-6 | Universal — content maintenance | Events section or financial calendar shows past events only, with no forward calendar or archive of past event materials |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Buy-side analysts (1.3) need CMD materials archived and accessible for
model updates. Sell-side analysts (1.4) reference CMD content when
writing research notes weeks after the event. Financial journalists
(7.1) on deadline need to access event quotes and materials without
calling IR.

**Typical client profile:** Company that invests significantly in
physical or virtual event production but treats the web as a broadcast
channel for the live moment only. Often discovered through a pattern
of strong event delivery but weak evergreen IR content depth.

---

### A11 — The AI-invisible site

**Pattern:** Content exists and is indexed for traditional search but
lacks the structured data, machine-readable formats, specificity, and
quotable evidence that AI answer engines require to cite the company
in generated responses.

**Primary audience affected:** Any audience that uses AI tools (ChatGPT,
Gemini, Perplexity) to research the company or its sector — increasingly
the majority of high-intent research journeys.

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A11-1 | Universal — SEO/AEO | Schema markup absent or minimal; no Organisation, Event, or FinancialProduct schema |
| A11-2 | Universal — SEO/AEO | Heading hierarchy not structured for snippet extraction; content is prose-dense without scannable H2/H3 structure |
| A11-3 | Investment case | Investment narrative uses qualitative language without quantified proof points; nothing quotable by an AI system |
| A11-4 | Sustainability strategy | ESG commitments stated in narrative form; no structured data, no machine-readable metrics, no FAQ schema |
| A11-5 | At a glance | Key facts not structured as discrete, citable data points; no clear factual statements an AI can extract and attribute |
| A11-6 | Strategy page | Strategic pillars not expressed as clear, attributed H2-level statements; content blends into undifferentiated narrative |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
This archetype affects all audiences indirectly — their first encounter
with the company may now be mediated through an AI-generated summary.
Industry analysts (10.2) doing pre-briefing research will rely on AI
tools. Sell-side analysts (1.4) increasingly use AI summarisation for
initial company orientation.

**Typical client profile:** Company with well-maintained traditional SEO
but no AEO awareness. Often discovered when benchmarking AI share of
voice against competitors who are already structured for LLM citation.

---

### A12 — The unintegrated multi-system estate

**Pattern:** Corporate site, careers/ATS, portals, and analytics are
siloed across separate platforms with no unified data layer, no consistent
brand experience, and no ability to measure end-to-end audience journeys.

**Primary audience affected:** All audiences — but most visibly talent
candidates (broken application journeys), IR teams (no unified audience
intelligence), and internal digital teams (no single source of truth
for performance data).

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A12-1 | Careers hub | ATS on a separate subdomain with different design; application journey exits the main site |
| A12-2 | Universal — design and accessibility | Visual design or navigation is materially inconsistent between corporate site and subdomains |
| A12-3 | IR landing page | Share price or financial data widgets pulling from disconnected third-party sources with no unified IR data layer |
| A12-4 | Universal — SEO/AEO | Analytics configuration cannot track user journeys across domains; conversion events not configured |
| A12-5 | Sustainability reporting centre | ESG data published in a separate portal or microsite with no consistent navigation or brand connection to the main site |
| A12-6 | Newsroom | Press releases syndicated from a PR distribution platform and embedded rather than published natively, indicating no CMS ownership of content |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Graduate candidates (6.1) experience the fragmentation directly when
the application journey exits the main site. CIOs (8.1) evaluating
the company as a technology partner will notice platform incoherence as
a proxy for internal governance quality.

**Typical client profile:** Company that has accumulated digital
platforms through growth, acquisition, and departmental decisions made
without a global digital governance model. Each platform is maintained
by a different team; no single team owns the end-to-end experience.

---

### A13 — The B2B site built for linear journeys

**Pattern:** Site architecture assumes a predictable, sequential funnel
progression from awareness to enquiry. Real B2B buyers circle non-linearly
— returning at different decision stages with different needs — and the
site fails to serve them at each re-entry point.

**Primary audience affected:** B2B procurement decision-makers across
extended buying cycles (typically 6–18 months for high-value contracts).

**Playbook sections that provide evidence:**

| Criterion | Playbook section | Signal |
|-----------|-----------------|--------|
| A13-1 | Universal — stakeholder content | No audience-specific entry points for different buyer stages; all visitors enter through the same homepage journey |
| A13-2 | At a glance / Strategy | Commercial proposition not described at multiple levels of depth; no summary for orientation-stage visitors and no technical depth for evaluation-stage visitors |
| A13-3 | Newsroom | Case studies not filterable by sector, application type, or outcome; buyer cannot self-select relevant proof points |
| A13-4 | Contact | No route for buyers who are not ready to make an enquiry — no content download, no webinar, no lower-commitment conversion option |
| A13-5 | Universal — SEO/AEO | Key commercial decision-stage queries not addressed by dedicated landing pages; site not structured around buyer intent signals |
| A13-6 | Strategy page | Commercial content and investor content are not separated; buyers navigating for commercial information must pass through investor-oriented content |

**Minimum for High confidence:** 3 of 6 criteria

**Audience signals:**
Senior procurement directors (3.1) visit repeatedly over months;
the site must serve them at the orientation stage, the evaluation stage,
and the shortlisting stage with different content. Engineering
specification teams (3.2) arrive at the evaluation stage with specific
technical queries and will not respond to orientation-level content.

**Typical client profile:** B2B services or industrial company whose
site was designed with a simple enquiry-generation objective. Common
where the commercial team and digital team have not collaborated on
buyer journey mapping. Often identified through GA4 showing high
return visitor rates but no measurable conversion progression.

---

## Archetype co-occurrence patterns

Some archetypes frequently appear together. When two or more of the
following pairs are both High confidence, treat their co-occurrence as
reinforcing evidence for a systemic rather than isolated finding:

| Pair | What co-occurrence signals |
|------|---------------------------|
| A01 + A02 | Content exists but is neither packaged nor maintained — publishing discipline without editorial strategy |
| A03 + A13 | Architecture designed around internal org structure rather than any audience's actual journey |
| A06 + A12 | Platform and integration debt are the root cause; content improvements will not fix the underlying problem |
| A07 + A13 | B2B commercial failure at both the content and journey level — needs both content strategy and IA work |
| A09 + A03 | Employer brand is one of the invisible stakeholder groups; careers is the most visible symptom |
| A11 + A01 | Document-repository sites are structurally AI-invisible — packaging gaps and AEO gaps are the same problem |
