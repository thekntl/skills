# Prelaunch validation and Apple intent routing

**Research date:** 2026-07-27
**Scope:** Prelauncher first-party material only for Part 1; official Apple material only for Part 2. No independent vendor testing was performed.

## Contents

- Executive read
- What Prelauncher actually does
- Official Apple mechanisms for intent-specific routing and attribution

## Executive read

- Prelauncher is a paid-traffic, pre-product “fake door” test: it generates ads and a hosted web funnel, exposes cold visitors to real-looking pricing, records funnel behavior, and labels the result against its claimed web-to-app benchmark. Its strongest documented event is a Stripe `SetupIntent`/checkout confirmation with no charge, not a purchase.
- Apple Custom Product Pages (CPPs) are the first-party mechanism that can preserve coarse intent into the installed app: one CPP can have an App Review-approved deep link, and on iOS/iPadOS 18+ tapping **Open** routes to app-defined content. The app can interpret that route as an onboarding or paywall variant, subject to App Review and StoreKit rules.
- App Store Connect campaign links (`pt`, `ct`, `mt`) are documented as aggregate acquisition attribution. Apple does not document delivering the `ct` value to the app at launch, so a campaign link alone is not a first-party deferred-routing payload.

## 1. What Prelauncher actually does

### Documented test flow

| Stage | First-party description | What is actually observed |
| --- | --- | --- |
| Idea check | AI scores the pitch for pain, market size, willingness to pay, and paid-ad reachability. | An AI assessment, not market behavior. |
| Ad setup | Generates Meta-oriented angles, copy, AI images, and one tracked link per creative. The developer supplies the ad account and budget. | Ad delivery, click response, source/ad/country/device segments, and reportedly synced spend. |
| Hosted funnel | Generates and hosts `landing → walkthrough → pre-registration → paywall`; can collect email and questionnaire answers. | Visits, step engagement/drop-off, signups, and voluntarily submitted responses. |
| Payment-intent step | Shows real pricing and asks the visitor to continue through checkout/confirmation. | The privacy policy says entered card details go directly to Stripe to create a `SetupIntent`; Prelauncher says it neither sees nor stores the card number and makes no charge. |
| Verdict | Compares visitor-to-checkout behavior with a claimed 2–5% web-to-app benchmark, calculates confidence intervals, sweeps ad/source/country/device segments, and returns `BUILD IT`, `PROMISING — KEEP TESTING`, or `DON'T BUILD`. | A vendor-defined statistical classification of its own funnel events. |

Sources: [Prelauncher homepage and FAQ](https://prelauncher.com/), [Terms of Service](https://prelauncher.com/terms), [Privacy Policy](https://prelauncher.com/privacy).

The homepage suggests approximately USD 50–150 of Meta spend over 3–7 days. It contains two different operating descriptions: one says the user pastes generated assets into Meta Ads Manager; another advertises a connected-account “autopilot” that creates a paused campaign and syncs spend. The public material does not establish which flow is currently generally available. **Confidence: high on the generated-kit/manual flow; medium on autopilot availability.**

### Payment-intent behavior and safeguards

- The legal documents are explicit that validation mode must not charge a visitor. The account holder must not misrepresent the test as a completed purchase or an already available product. [Terms §§4 and 6](https://prelauncher.com/terms)
- The visitor is told that the app is coming and that they can be notified at launch. [Homepage FAQ](https://prelauncher.com/)
- The privacy policy gives the most precise payment description: card details entered in the paywall go directly to Stripe for a `SetupIntent`; Prelauncher says it never sees or stores the card number. [Privacy §3](https://prelauncher.com/privacy)
- Prelauncher records a random visitor cookie, truncated IP, device type, country, referring ad/source, optional questionnaire responses, and optional contact details. It says it sets no cross-site tracking cookie itself, although an account holder may add Meta/TikTok pixels under the account holder's responsibility. [Privacy §§3 and 5](https://prelauncher.com/privacy)
- The account holder is the controller of funnel visitor personal data and is responsible for applicable law, ad-platform policy, funnel/ad content, and pixel use. Projects and their visitor data can be deleted; visitor deletion requests may go through the account holder or Prelauncher. [Terms §4](https://prelauncher.com/terms), [Privacy §§7–8](https://prelauncher.com/privacy)
- AI-generated funnels, copy, images, scores, and verdicts require human review. Prelauncher characterizes its verdict as statistical guidance, not financial or business advice. [Terms §6](https://prelauncher.com/terms)

There is a wording conflict worth preserving. The marketing page says that no card is “ever collected,” while the privacy policy says visitors can enter card details that Stripe receives for a `SetupIntent`. The defensible reading is that **Prelauncher itself does not receive/store the card number and no charge occurs; Stripe does receive payment details**. The public pages do not show the exact checkout UI, consent copy, `SetupIntent` configuration, or post-confirmation lifecycle. **Confidence: high on no charge and no card storage by Prelauncher; medium on the exact event represented by “completed checkout.”**

### What the result does and does not prove

**Directly evidenced, if instrumentation is accurate:**

- A particular paid audience responded to particular creative and funnel copy.
- Some visitors progressed from ad click through specific web-funnel steps.
- Some visitors supplied an email, answered questions, or submitted payment details far enough for the configured intent event.
- The observed rate for that traffic sample can be compared across tested ads, countries, sources, devices, and prices.

**Not proved by this test:**

- **Collected revenue or true purchase conversion.** No payment is charged, so the test does not observe authorization, settlement, refunds, chargebacks, renewal, cancellation, or price retention.
- **App Store conversion or in-app paywall conversion.** The measured experience is an ad-to-web funnel, not an App Store product page followed by a shipped app and StoreKit purchase.
- **Activation, retention, satisfaction, or product quality.** There is no product to use.
- **Technical feasibility, App Review acceptance, or policy compliance.** The AI idea check evaluates a paid-acquisition pitch, not implementation or review.
- **Broad market demand.** Results are conditional on the chosen channels, audience, geography, creative, funnel, price presentation, and test window. A result from cold Meta traffic does not establish organic, referral, search, or other-channel demand.
- **Sustainable unit economics.** A short test may estimate click and intent costs, but it does not observe delivery/support costs, realized revenue, lifetime value, churn, or scaled-auction effects.
- **An independently validated statistical conclusion.** Prelauncher publicly states the benchmark range, confidence intervals, segment sweep, and a rule that any working segment prevents a `DON'T BUILD` verdict, but it does not publish benchmark provenance, sample sizes, formulas, multiple-comparison handling, bot/fraud filtering, or power requirements.

The “does not prove” list is a methodological inference from the events Prelauncher says it records and the events it explicitly does not record. **Confidence: high** for purchase/product/retention limits; **medium** for the statistical-risk assessment because the implementation is not public.

### Material unknowns

- Definition of a checkout attempt versus a completed checkout/`SetupIntent`, and whether duplicate or returning visitors are deduplicated.
- Benchmark dataset provenance, recency, app categories, regions, traffic quality, and exact confidence calculation.
- Bot, click-farm, accidental-click, and fraudulent-card defenses.
- Meta campaign objective, optimization event, targeting defaults, learning-phase treatment, and whether the advertised autopilot is live.
- Whether price tests are randomized concurrently or compared sequentially; how creative, audience, and price confounding is handled.
- Exact visitor disclosure and consent text in generated funnels; pixel consent behavior by jurisdiction.

## 2. Official Apple mechanisms for intent-specific routing and attribution

### Capability matrix

| Apple mechanism | Can it choose an in-app route? | Attribution available | Principal limits |
| --- | --- | --- | --- |
| Custom Product Page unique URL | Indirectly. It selects a CPP; that CPP may carry one app deep link. | CPP-level views, downloads, conversion, proceeds, paying-user and downstream subscription/sales metrics. | Up to 70 pages; page must be approved. CPP is available on iOS/iPadOS 15+, but its app deep link requires iOS/iPadOS 18+. |
| CPP deep link | Yes. Apple accepts a universal link or custom URL; app code/delegates decide the destination. | The associated CPP remains the analytics cohort. | Fires when the user taps **Open** on the CPP; deep link and page metadata require App Review. Universal links are recommended. |
| CPP search keywords | Yes, through the same CPP deep link after Open. Approved app keywords can be assigned to a CPP so that page replaces the default page for those searches. | Search traffic can be viewed per CPP. | Searchable only after the page is approved and visible; keywords come from the latest approved app version. |
| App Store Connect campaign link (`pt`, `ct`, `mt`) | **No app-launch route is documented.** It sends the user to the App Store product page and labels aggregate analytics. | Impressions, page views, downloads, usage, sales, subscriptions, territory/device/page type. | First-time-download attribution requires download within 24 hours; latest campaign link receives credit for subsequent sales; dashboard needs at least five first-time downloaders and at least 24 hours. |
| Apple Ads + CPP | Yes, by selecting a CPP that has a deep link. | Apple Ads reporting; optionally app/server attribution through AdServices. | CPP deep links in Apple Ads require supported placements/OS versions and are unavailable for ads using age or gender targeting. |
| Apple Ads Attribution API (`AdServices`) | It returns attribution metadata that app/backend logic could interpret, but it is not a deep link. | Apple Ads `campaignId`, `adGroupId`, `keywordId`, `adId`, placement and claim type, with standard/detailed variants. | Apple Ads only, not generic `ct` campaign links. Token TTL is 24 hours; a lookup can return no match; ATT status changes payload detail. |

Primary sources: [Configure multiple product page versions](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/), [CPP analytics](https://developer.apple.com/help/app-store-connect-analytics/acquisition/custom-product-pages/), [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/), [Apple Ads `ProductPageDetail`](https://developer.apple.com/documentation/apple_ads/productpagedetail), [AdServices](https://developer.apple.com/documentation/AdServices/), [`attributionToken()`](https://developer.apple.com/documentation/AdServices/AAAttribution/attributionToken%28%29).

### Custom Product Page routing details

- Apple currently permits **up to 70 CPPs per app**. Each has a unique `ppid` URL and can vary screenshots, previews, promotional text, and keywords. A CPP is shown to people following its URL or, if enabled, through assigned search keywords; otherwise the default product page appears. [App Store Connect Help](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/)
- A CPP can have an optional universal link or custom URL. On iOS/iPadOS 18+, tapping **Open** sends that link into the app; Apple states that app delegate logic determines where it lands. This supports an intent-specific onboarding screen, feature destination, or paywall as an app-defined route. [App Store Connect Help](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/), [WWDC24 session](https://developer.apple.com/videos/play/wwdc2024/10063/?time=710)
- Apple’s current WWDC26 example explicitly describes a website linked to a yoga-specific CPP and, after download, deep-linking the user to the yoga offering. [WWDC26: Enhance your presence on the App Store](https://developer.apple.com/videos/play/wwdc2026/205/)
- The CPP and its deep link must pass App Review before the link works. A disabled or deleted CPP URL falls back to the default product page, so it no longer provides that page-specific route. [App Store Connect Help](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/), [CPP submission](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-a-custom-product-page)
- For StoreKit-rendered third-party ads, the marketing partner must support the custom page identifier; otherwise Apple says users fall back to the default page. [Apple Tech Talk: Make the most of custom product pages](https://developer.apple.com/videos/play/tech-talks/110361/)

**Confidence: high.** The remaining ambiguity is first-launch edge behavior when the user installs but does not immediately tap **Open**, plus behavior on OS versions below 18. Apple documents routing on Open, not an arbitrary-length deferred-link guarantee.

### Campaign-link attribution is not routing

App Store Connect generates links such as:

```text
https://apps.apple.com/app/apple-store/id123456789?pt=123456&ct=test1234&mt=8
```

Apple documents `ct` as a campaign token used by App Store Connect Analytics. It also documents passing campaign/provider tokens when a source app presents a product page through StoreKit. The resulting metrics can be filtered by campaign and include post-download usage, sales, and subscriptions. [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)

No official page found in this research documents an API that hands the generic `ct` value to the downloaded app as a launch parameter. Therefore:

- campaign links can compare intent cohorts in App Store Connect;
- campaign links alone should not be treated as a deterministic selector for onboarding/paywall state;
- CPP deep links are the documented Apple-native carrier for that routing state;
- whether a URL combining `ppid` with `ct` receives both forms of attribution is **not established by the cited Apple docs** and should remain an explicit unknown.

**Confidence: medium-high.** This is partly an absence-of-documented-API conclusion. Apple’s separate AdServices API does return app/server-readable campaign metadata, but only for Apple Ads, not for arbitrary App Store Connect campaign links.

### Attribution granularity and privacy limits

- A CPP or campaign appears in its dedicated App Store Connect dashboard after at least **five first-time downloads**. Campaigns also need at least 24 hours. [CPP analytics](https://developer.apple.com/help/app-store-connect-analytics/acquisition/custom-product-pages/), [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- Analytics reports are aggregated. Detailed reports omit rows below five users/devices and add statistical noise; some usage reports exist only when users opt in to diagnostics/usage sharing. This data is appropriate for cohort measurement, not individual launch routing. [Analytics Reports API](https://developer.apple.com/help/app-store-connect-analytics/overview/analytics-reports-api), [privacy in report data](https://developer.apple.com/documentation/analytics-reports/privacy)
- Campaign first-time-download credit requires download within 24 hours of the link/token. If more than one campaign link was used, Apple credits subsequent sales to the most recent link. [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- AdServices is a separate Apple Ads path: the app requests a token and the server exchanges it for an attribution record. The token expires after 24 hours; lookups can return `attribution=false`; ATT authorization changes whether the response is standard or detailed. [`attributionToken()`](https://developer.apple.com/documentation/AdServices/AAAttribution/attributionToken%28%29)

### App Review and paywall boundaries

- CPP assets and the app experience must accurately represent what the app provides. Apple prohibits misleading marketing and false prices, and says metadata must indicate when featured content requires an additional purchase. [App Review Guidelines 2.3](https://developer.apple.com/app-store/review/guidelines/)
- Routing directly to a paywall does not change payment rules. Unlocking digital features/content in the app generally must use In-App Purchase, subject to Apple’s documented storefront/category exceptions. [Guideline 3.1.1](https://developer.apple.com/app-store/review/guidelines/)
- Before asking for an auto-renewable subscription, the app must clearly describe what the customer receives for the price; subscriptions must provide ongoing value. [Guideline 3.1.2](https://developer.apple.com/app-store/review/guidelines/)
- Apple Ads CPP deep links are documented for iOS 18+ Today/search-results variations and iPadOS 18+ search-results variations, and are unavailable with age or gender targeting. [Apple Ads `ProductPageDetail`](https://developer.apple.com/documentation/apple_ads/productpagedetail)

**Confidence: high** on the cited review and StoreKit boundaries. Review acceptance of a particular first-launch paywall remains app-specific and cannot be inferred from the routing mechanism alone.
