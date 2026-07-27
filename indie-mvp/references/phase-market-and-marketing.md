# Market and Marketing Phase

## Contents

- Market analysis
- Apple research tools
- Marketing system
- Marketing website
- Email and support
- Creative loop
- Paid acquisition
- Store and search
- Gate

## Market analysis

Classify the product as market-creating/reframing or competing in an existing category.

For an existing category:

1. Let the owner define category, direction, seed competitors, and leaders.
2. Suggest missed competitors from Astro, Kickstart, category, and adjacent evidence.
3. Treat suggestions as provisional until the owner confirms the shortlist.
4. Research every shortlisted competitor across accessible App Store reviews, social discussions, Reddit, forums, communities, and review sites.

Record source URL/date/locale, user context, direct or inferred evidence, pain point/outcome, severity signal, workaround, and confidence. Cluster frequency, severity, recency, persona, and type: product gap, usability, reliability, price, trust, support, or unmet outcome. Also record praise and table stakes.

Research leaders first and stop expanding when new sources no longer produce material pain-point categories. Link evidence-backed opportunities to product work and mark coverage gaps.

## Apple research tools

For Apple products, use Astro MCP and Kickstart MCP for market, competitor, ASO, and ASA evidence. Do not use Computer Use unless the required MCP capability is unavailable and the owner approves.

Record tool, query, market, locale, date, and artifact. The owner chooses final broad ASO/ASA keywords.

At project entry, request the owner's keyword clusters and intended search meanings. During market work, refine each confirmed cluster into one stable acquisition intent and maintain [intent-route-matrix.md](../assets/marketing/intent-route-matrix.md). Do not equate a keyword with intent without owner confirmation and evidence.

## Marketing system

Required in week one:

- dedicated Instagram and TikTok product accounts;
- product Meta and TikTok advertising assets under company control planes;
- separate marketing site;
- GA4, GSC, SEO and attribution paths;
- email capture;
- FreeScout support;
- initial organic content and recurring routine;
- paid creative pipeline and first bounded campaign plan;
- store metadata/assets for Apple;
- honest social-proof module prepared, but unpublished without evidence.

Use the company/per-product account topology in [fixed-stack.md](fixed-stack.md). Keep legal verification, MFA, recovery, payment, campaign activation, budgets, and ownership changes with the owner.

Create two recurring content routines:

- organic TikTok/Instagram generation and approved publishing every day, or twice daily when the product plan says so;
- SEO article and landing-page production every day, with search intent, evidence, internal links, localization, indexing status, and measured result.

Approve the first representative outputs before unattended publishing. Keep new message families, markets, claims, and paid campaigns behind owner review.

Use the phase templates directly:

- [competitor-evidence.md](../assets/marketing/competitor-evidence.md) for the shortlisted competitor evidence set;
- [campaign-brief.md](../assets/marketing/campaign-brief.md) for value-led campaigns and creative variants;
- [content-routine.md](../assets/marketing/content-routine.md) for recurring organic and SEO production;
- [demand-validation-experiment.md](../assets/marketing/demand-validation-experiment.md) when the optional validate-first route is active;
- [intent-route-matrix.md](../assets/marketing/intent-route-matrix.md) for acquisition-to-experience routing;
- [paywall-variant-matrix.md](../assets/marketing/paywall-variant-matrix.md) for the fixed paywall presentation and failure evidence.

## Marketing website

Treat the Astro site as a separate deployable product even when the core is web.

Reuse a fixed static/content-collection template. Change brand tokens, copy, media, locales, product configuration, and campaigns.

Required surfaces:

- home/primary landing;
- explanation, use cases, and product proof;
- product and publisher about pages;
- email signup/waitlist;
- `/support` connected to the product FreeScout mailbox/portal;
- privacy, terms, subscription disclosures, and required legal pages;
- localized metadata/content;
- SEO articles and landing-page system;
- web-to-app funnel;
- campaign pages and direct approved destinations.

Match the approved app icon, logo, typography, color, motion, and frontend language. Preserve performance, accessibility, stable URLs, indexability, sitemap, canonical/hreflang, and Google Ads landing requirements.

Use GA4. Use AppsFlyer where appropriate for native/web-to-app journeys. Keep pure web acquisition on GA4 plus network web measurement unless a later verified reason changes it.

Use one two- or three-step web-to-app structure with configurable destinations: email capture, information, qualification, permitted web checkout, or direct App Store. Preserve attribution and connect approved conversion events.

## Email and support

Use one Brevo account per product behind an email adapter. Cover contact consent/upsert, transactional send, suppression, deletion/export, and verified webhooks. Authenticate SPF/DKIM/DMARC and test unsubscribe, bounce, complaint, retry, quota reserve, and Apple private relay.

Use the shared FreeScout product mailbox/portal. Keep `/support` canonical across product and site. Do not build a second support database.

Generate versioned legal drafts from publisher/product identity, markets/locales, and a current provider/data inventory. The owner approves publication. Escalate to qualified legal review for sensitive data, children, regulated claims, new high-risk jurisdictions, or uncovered risk.

Start from the versioned sources:

- [data-provider-inventory.md](../assets/legal/data-provider-inventory.md);
- [privacy-policy.md](../assets/legal/privacy-policy.md);
- [terms-of-use.md](../assets/legal/terms-of-use.md);
- [subscription-disclosure.md](../assets/legal/subscription-disclosure.md);
- [support-terms.md](../assets/legal/support-terms.md).

Replace every placeholder from the actual data/provider inventory; do not publish generic text that describes behavior the product does not have.

## Creative loop

Golden rule: sell the user's truthful outcome, not the feature.

Every brief answers:

1. Who has the problem?
2. What is the recognizable before state?
3. What useful after state can the product help create?
4. What proof makes it believable?
5. What should the person do next?

For each campaign:

1. Define objective, destination, conversion, KPI, budget assumption, and window.
2. Research personas, problems, objections, awareness, and reachable channels.
3. Generate three materially different value-led territories.
4. Batch Grill the directions.
5. Prototype: static contact sheet, carousel frames, or video script/storyboard/shot list.
6. Explain the visual review scenario.
7. Generate approved static assets with OpenAI image generation.
8. Generate video through verified Higgsfield access using shot-level prompts; treat one-prompt video as exploration.
9. Produce platform variants, captions, safe areas, thumbnails, CTA, and tracking.
10. Publish through the approved mode, measure, and feed results back.

Map each campaign:

```text
Objective → Persona → Before → After → Value → Proof → Hook → Format → Channel → Destination → CTA → Conversion → KPI
```

Approve representative organic examples, then allow scheduled daily or approved twice-daily publishing inside fixed limits. Require owner approval for every new paid campaign, budget, material increase, optimization-event change, or market.

## Paid acquisition

Start with small TikTok learning campaigns unless unsuitable.

- Define one business-relevant optimization conversion.
- Verify AppsFlyer/TikTok or approved web attribution end to end.
- Use 50 verified selected conversions in a rolling seven-day window as the default learning-volume gate.
- Scale only when attribution, CPA/ROAS, data quality, and creative diversity also pass.
- Avoid disruptive edits during learning.
- Adapt a validated TikTok hypothesis to Meta; do not assume direct transfer.

Keep campaigns paused until the owner approves activation and budget.

## Store and search

Prepare:

- App Store default product page;
- Custom Product Pages;
- Product Page Optimization;
- featuring submission;
- localized metadata and screenshots;
- truthful rating/review social proof after evidence exists;
- Google Search Console;
- technical/content SEO routine;
- Google Ads landing pages.

For Apple acquisition, keep the chain explicit:

```text
keyword cluster / campaign → search intent → Custom Product Page → approved deep link → intent_id → onboarding variant → paywall variant → outcome event
```

Use unique keyword sets for each searchable Custom Product Page. Keep page claims, screenshots, deep-link destination, onboarding, paywall framing, and measured outcome semantically consistent. Record the default route for organic/direct traffic and any case where Apple or the attribution provider does not deliver a usable route.

Custom Product Page analytics and campaign analytics are aggregate acquisition evidence. Do not claim that aggregate App Store reporting exposes the originating page or raw search term to every individual app launch.

Use owner-provided Figma screenshot templates and actual target-runtime captures. Use ASC CLI for supported approved publishing operations when prerequisites are ready.

## Gate

Close when:

- owner confirmed competitor shortlist and evidence synthesis exist;
- value proposition reflects evidence without uncontrolled scope growth;
- site, support, email, legal, measurement, store, and campaign work are linked;
- creatives lead with value and have traceable hypotheses;
- owner-only account/spend actions are visible;
- implementation and production issues contain no unresolved marketing decision.
