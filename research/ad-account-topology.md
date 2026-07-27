# Paid Media Account and Attribution Topology

**Date:** 2026-07-27
**Decision context:** One legal company, one solo owner, multiple independently branded Apple and/or web MVPs, separate Instagram and TikTok product accounts, public launch in 3–7 days, TikTok-first paid acquisition, AppsFlyer as the mobile measurement partner.

## Contents

- Executive recommendation
- Fixed ownership model
- Meta fixed topology
- TikTok fixed topology
- AppsFlyer fixed topology
- Naming standard
- Three-to-seven-day bootstrap
- Reusable bootstrap checklist
- Decision summary

## Executive recommendation

Use one company-owned control plane per provider and product-owned execution assets below it:

| Scope | Meta | TikTok | AppsFlyer |
| --- | --- | --- | --- |
| One per legal company | One Business Portfolio; company legal identity; payment governance | One verified advertiser Business Center; payment governance | One advertiser account with the owner as account owner |
| One per product | Facebook Page; Instagram Business account; ad account; web dataset/pixel; Meta developer app when advertising an app | Organization Account or linked Business Account; advertiser account; web pixel; TikTok App ID when advertising an app | One platform app for each distributed app; one web app only when Web Attribution is deliberately enabled; one Product Line for the same product across platforms |
| One per market | No new asset by default | No new asset by default | No new asset by default |
| Create per market only when | A different payer, business country, currency/timezone, regulatory boundary, or operational owner requires isolation | A different payer, legal entity, currency/timezone, region, or operational owner requires isolation | Reporting or data-residency requirements cannot be represented by campaign/geo dimensions |

The default paid-media unit is therefore **one ad account per product, not one ad account per campaign or country**. Campaigns and ad sets separate markets while the product ad account preserves one budget history, one attribution namespace, and one recovery path. Create another market ad account only for a documented boundary.

This is a recommended operating topology, not a claim that either platform technically requires one account per product. TikTok explicitly describes distinct Business Center-owned ad accounts as a way to separate budgets, campaigns, and performance by brand, product line, or region; it also says the creation limit varies by Business Center type. Meta creates a new ad account when currency/timezone changes, and AppsFlyer documents a nine-ad-account-per-app limit for Meta iOS 14+ attribution. Those constraints favor deliberate, sparse account creation ([TikTok ad-account creation](https://ads.tiktok.com/help/article/create-ad-accounts-in-business-center), [Meta currency and timezone](https://www.facebook.com/help/messenger-app/291404291014138), [AppsFlyer Meta integration](https://support.appsflyer.com/hc/en-us/articles/207033826-Meta-Ads-integration-setup)).

## Fixed ownership model

### Company control planes

Create all assets under company control from the start:

- The Meta Business Portfolio is the company container for Pages, Instagram professional accounts, ad accounts, datasets, people, and partner access. Meta defines a Business Portfolio as the product for managing business assets and the people who work on them ([Meta Verified Business Terms](https://www.facebook.com/legal/mvb_terms)).
- The TikTok Business Center is the company container for advertiser accounts, TikTok accounts, pixels, payment, members, and partners. TikTok positions it as the centralized asset, finance, permission, and security layer ([About TikTok Business Center](https://ads.tiktok.com/help/article/tiktok-business-center?lang=en-GB)).
- The AppsFlyer advertiser account is the company attribution container. The owner-created user remains the account owner; AppsFlyer says this user cannot be deleted or demoted in self-service, and ownership changes require a manual support process ([AppsFlyer user management](https://support.appsflyer.com/hc/en-us/articles/4409128270481-User-management)).

Do not create a Business Portfolio or Business Center for every product. The company is the stable owner; products are assets beneath it. This makes recovery, billing review, partner removal, and future product shutdown possible without multiplying high-privilege containers.

### Product identities

Each public product receives:

- one Facebook Page;
- one Instagram **Business** account, connected to that Page;
- one TikTok Organization Account created in Business Center when available, otherwise one existing TikTok Business Account linked to Business Center for account management;
- one Meta ad account;
- one TikTok advertiser account.

Meta says a connected professional Instagram account and Facebook Page can run ads across Instagram and Facebook, share posts, and use a unified inbox. A professional account is required when the Page is owned in Business Manager, and Meta characterizes Business rather than Creator as the appropriate account type for a business ([Instagram–Page connection](https://www.facebook.com/help/instagram/790156881117411), [professional accounts](https://www.facebook.com/help/instagram/138925576505882), [connect or change Page](https://www.facebook.com/help/570895513091465)).

For TikTok, prefer an Organization Account when the feature is available. TikTok describes it as a Business Center-owned identity independent of an individual's personal account and identifies it with a Business Center-issued login code rather than a traditional password. Creating one requires verified company and legal-representative details, Business Center Admin access, and complete contact/billing information ([TikTok account management](https://ads.tiktok.com/help/article/about-managing-tiktok-accounts-in-business-center), [create an Organization Account](https://ads.tiktok.com/help/article/how-to-create-an-organization-account-in-business-center)).

### Recovery and continuity

The owner must:

1. Use a real, long-lived personal identity for Meta access; never use a shared or invented profile.
2. Use company-domain email addresses for TikTok Business Center and AppsFlyer.
3. Enable 2FA on the Meta/Facebook identity, Instagram account, TikTok Business Center, and AppsFlyer account.
4. Store recovery codes in the owner's password manager and offline recovery record.
5. Record every container and asset ID in the private project operations record.
6. Store the exact legal name, registered address, tax data, verification documents, domain ownership evidence, and payment ownership evidence used during verification.
7. Keep a current access register: identity, email, role, assets, date granted, reason, and review date.

Meta supports security keys, authenticator apps, SMS, and recovery codes for Facebook 2FA; Instagram recommends an authenticator app and provides backup codes ([Facebook 2FA](https://www.facebook.com/help/148233965247823), [Instagram 2FA](https://www.facebook.com/help/566810106808145/)). TikTok lets a Business Center Admin require 2-step verification for all members and explicitly calls that the best practice ([TikTok 2-step verification](https://ads.tiktok.com/help/article/2-step-verification-business-center)).

For a true solo company, do not manufacture a second administrator. If a real trusted recovery person is appointed later, grant a separately identified account only the minimum recovery role, require 2FA, document the appointment, and review it quarterly. Shared passwords are prohibited; both Meta and TikTok provide role-based access instead.

## Meta fixed topology

### Company-level assets

Create once:

- `COMPANY | Business Portfolio`
- legal business information and, when available or required, business verification;
- company payment governance;
- owner access with full control;
- 2FA/Advanced Protection where available;
- domain inventory and company-wide access register.

Business verification and Meta Verified are not the same thing. Verification may be required for legal, payment, ownership, or feature access. Meta may request business documents, government ID, bank verification, or domain/email/phone verification, and the data must match public or submitted records ([Meta verification documents](https://www.facebook.com/help/243868559497297/), [Meta Verified Business Terms](https://www.facebook.com/legal/mvb_terms)). Do not buy Meta Verified merely to establish the topology.

### Product-level assets

Create for every product:

1. `PRODUCT | FB Page`
2. `PRODUCT | IG`
3. `PRODUCT | META | PRIMARY | CCY | TZ` ad account
4. `PRODUCT | WEB | DATASET` for products with a marketing site or web funnel
5. `PRODUCT | APP` Meta developer app for products advertised as mobile apps

Connect the Page and Instagram Business account. Add both to the company Business Portfolio. Give the product ad account access to the Page, Instagram identity, dataset, and app required for that product only.

Meta Page access is high risk: a person with Facebook access and full control can change access, remove other people, or delete the Page. Use task access or business-tool access for routine work and reserve full control for the owner ([About Facebook Page access](https://www.facebook.com/help/289207354498410)).

### Ad-account boundary

Default: one ad account per product.

Create an additional market ad account only when at least one is true:

- billing must use another legal payer;
- the business country or tax treatment differs;
- currency/timezone must differ;
- a regulated product or market requires isolated access/data;
- a distinct partner must have operational control and cannot be safely limited at campaign level.

Do not create a new account only for:

- a new campaign;
- a new persona;
- a new creative test;
- a Custom Product Page;
- a language;
- a country that shares the same payer, currency/timezone, and legal boundary.

Meta says changing currency and timezone creates a new ad account, closes the old account, and stops its ads. It also notes that payment availability depends on country and currency, and some countries require matching business country and currency ([change Meta ad currency](https://www.facebook.com/help/messenger-app/291404291014138), [accepted payment options](https://www.facebook.com/help/messenger-app/212763688755026)).

Do not encode a universal Meta ad-account limit. The available limit is account-specific and should be read from the live Business Portfolio during bootstrap. The only fixed limit relevant here that is currently documented by AppsFlyer is Meta's limit of nine ad accounts per app for iOS 14+ attribution ([AppsFlyer Meta integration](https://support.appsflyer.com/hc/en-us/articles/207033826-Meta-Ads-integration-setup)).

### Web measurement: dataset, Pixel, and Conversions API

Use one Meta dataset/pixel per product web journey. The marketing site, web-to-app funnel, and product web app may feed the same product dataset when they belong to the same product and data controller. Never share a dataset across unrelated products merely to reduce setup work.

Install:

- Meta Pixel in the browser;
- Conversions API from the product backend for authoritative server-known events;
- identical event names and stable `event_id` values for browser/server deduplication;
- only the minimum match keys and event fields permitted by the product's privacy implementation.

Meta says website, app, and offline events are being presented in a dataset and that the dataset ID is the same as the pixel ID. Meta recommends using Conversions API together with Pixel because browser delivery can be affected by errors, connectivity, and blockers; it also says Conversions API is not a way to bypass ATT or privacy law ([set up Meta Pixel](https://www.facebook.com/help/messenger-app/952192354843755), [About Conversions API](https://www.facebook.com/business/help/AboutConversionsAPI)).

The product backend owns the CAPI adapter and test fixtures. Do not add a separate self-hosted CAPI gateway during the 3–7 day MVP unless a direct integration or official partner integration cannot meet the requirement.

### App measurement

For an Apple app:

1. Create one Meta developer app for the product.
2. Add the correct iOS platform/bundle information and make the app Live.
3. Configure the same Meta/Facebook App ID in the product's AppsFlyer app.
4. Activate the Meta Ads integration in AppsFlyer.
5. Configure approved in-app event mappings and privacy settings.
6. Configure SKAN/AEM and ATT behavior according to the product's current consent decision.
7. Test a new install and selected conversion event before spend.

AppsFlyer says mobile attribution does not require Facebook Login or the Meta SDK for the basic integration, but Meta deep-link features can add SDK/AEM prerequisites. It also says AppsFlyer attributes per Facebook App ID, requires the Meta app to be Live, and supports Meta AEM ([AppsFlyer Meta integration](https://support.appsflyer.com/hc/en-us/articles/207033826-Meta-Ads-integration-setup)).

### Roles and spend

Owner-only:

- Portfolio full control;
- business verification submission;
- legal attestations and policy acceptance;
- personal identity, 2FA, recovery codes;
- payment method entry/removal;
- tax and invoice data;
- campaign activation;
- initial budget and every budget increase;
- account closure, ownership, or irreversible asset changes.

Agent may prepare or configure, when an approved connector/API supports it:

- Page and Instagram metadata drafts;
- asset naming and asset-to-ad-account assignments;
- dataset/pixel/CAPI code and tests;
- event taxonomy and AppsFlyer event mappings;
- paused campaign, ad set, and ad drafts;
- URL parameters, OneLink destinations, creative variants, and QA evidence;
- read-only reporting and spend anomaly checks.

The agent must not publish an ad or change a budget without explicit owner approval. Meta records campaign, budget, schedule, account, and actor changes in Ads Manager activity history; review it after every approved launch or change ([Meta ad activity history](https://www.facebook.com/help/messenger-app/289211751238030)).

## TikTok fixed topology

### Company-level assets

Create once:

- `COMPANY | Business Center`
- advertiser-type Business Center, not agency;
- company and legal-representative verification;
- owner Admin;
- owner Finance Manager only when payment management is required;
- 2-step verification required for all members;
- company payment governance and access register.

TikTok says Business Center Admins can create advertiser accounts, manage members and assets, manage verification, and turn 2-step verification on or off. Finance Manager is an additional role required to manage payment methods, balances, billing groups, and invoices; Finance Analyst is view-only ([roles and permissions](https://ads.tiktok.com/help/article/about-business-center-roles-and-permissions)).

Business verification may affect the ability to post ads. TikTok asks for matching legal business data and documentation; Business Center verification may take up to two business days. Legal-representative verification is a prerequisite for Business Center-created Organization Accounts ([TikTok business verification](https://ads.tiktok.com/help/article/about-business-verification)).

### Product-level assets

Create for every product:

1. `PRODUCT | TT` Organization Account, or linked TikTok Business Account fallback
2. `PRODUCT | TIKTOK | PRIMARY | CCY | TZ` advertiser account
3. `PRODUCT | WEB | PIXEL` for products with a marketing site or web funnel
4. TikTok App ID for each app advertised on TikTok

Business Center should create and own the advertiser account. TikTok says this keeps budgets, campaigns, and performance separate by brand/product/region and permits access to be granted or revoked without sharing credentials ([create advertiser accounts](https://ads.tiktok.com/help/article/create-ad-accounts-in-business-center)).

The Business Center-created Organization Account is the preferred long-term product identity. If its verification or feature prerequisites cannot be completed inside the launch window, link an existing product Business Account to Business Center for **Manage account**, document the fallback, and revisit organization ownership after launch. TikTok distinguishes `Deliver ads` from `Manage account`; the latter includes organic profile, comment, and message management ([TikTok account management](https://ads.tiktok.com/help/article/about-managing-tiktok-accounts-in-business-center)).

One Business Center can request access to up to 200 TikTok accounts, while TikTok does not publish one universal ad-account creation number: the default varies by Business Center type ([manage TikTok accounts](https://ads.tiktok.com/help/article/manage-tiktok-accounts-business-center), [create advertiser accounts](https://ads.tiktok.com/help/article/create-ad-accounts-in-business-center)). Do not create spare accounts “just in case.”

### Ad-account boundary

Default: one advertiser account per product.

Use campaigns/ad groups for markets. Add a market-specific advertiser account only for a different legal payer, currency/timezone, regulated boundary, operating region, or separately controlled partner. TikTok explicitly supports separate accounts for brand, product line, or region, but the one-per-product rule is the lowest-operations interpretation for this solo company ([create advertiser accounts](https://ads.tiktok.com/help/article/create-ad-accounts-in-business-center)).

Turkey is currently listed among regions eligible for self-serve Business Center ad-account creation ([available regions](https://ads.tiktok.com/help/article/available-countries-and-regions-for-ad-account-creation-in-bc)).

### Web measurement: Pixel and Events API

Use one TikTok Pixel per product web journey and connect it to the product advertiser account. Implement:

- Pixel on the product marketing site/web funnel;
- Events API from the backend;
- matching event names and parameters across both;
- event deduplication;
- value and currency on revenue events;
- the minimum permitted match keys.

TikTok recommends Pixel and Events API together with event deduplication for web-conversion clients. Pixel or Events API is a prerequisite for the Web Conversions objective ([About Events API](https://ads.tiktok.com/help/article/events-api), [Event Builder and custom code](https://ads.tiktok.com/help/article/how-to-add-or-edit-events-event-builder-and-custom-code)).

Do not install a product's web pixel on another product's domain. Do not send app events through the web pixel; app attribution is handled through the product's AppsFlyer app and TikTok Advanced SRN integration.

### App measurement

For each advertised Apple app:

1. Add the app to AppsFlyer and integrate the current SDK.
2. Generate and record the TikTok App ID in TikTok Ads Manager.
3. Activate `tiktokglobal_int`, the TikTok for Business Advanced SRN, for that AppsFlyer app.
4. Add the TikTok App ID to the integration.
5. Map only the approved conversion events.
6. Decide the iOS Advanced Data Sharing state from the product privacy decision; it is off by default.
7. Configure SKAN interoperability in AppsFlyer.
8. Connect the correct advertiser ID for clicks/impressions and cost only if the AppsFlyer plan includes the required cost feature.
9. Test a new install and the selected sale/conversion event before activating spend.

AppsFlyer documents `tiktokglobal_int` as the current Advanced SRN, says it can measure click/view mobile attribution including installs from non-mobile TikTok campaigns, and recommends a TikTok App ID for every advertised app. The legacy integration was deprecated in 2024 ([TikTok Advanced SRN setup](https://support.appsflyer.com/hc/en-us/articles/6722785184913-TikTok-for-Business-Advanced-SRN-integration-setup)). AppsFlyer also recommends keeping SKAN conversion mapping in AppsFlyer when multiple networks are used ([TikTok SKAN interoperability](https://support.appsflyer.com/hc/en-us/articles/360018499098-SKAN-interoperation-with-TikTok-for-Business)).

### Roles and spend

Owner-only:

- Business Center Admin and verification submission;
- legal-representative verification;
- 2-step verification enrollment and recovery;
- payment method, billing option, tax, and invoice data;
- campaign activation;
- initial budget and every budget increase;
- ad-account transfer, ownership change, or destructive action.

Agent may configure:

- asset names and advertiser-account assignments;
- Pixel/Events API code and tests;
- TikTok/Appsflyer partner mapping;
- paused campaigns and creative drafts;
- tracking parameters and test plans;
- read-only reporting and anomaly alerts.

Assign any future contractor as a Standard Business Center member with only assigned assets. At advertiser-account level, Analyst is read-only; Operator can create/edit campaigns and manage finance; Admin can also manage settings. Do not give Operator merely for reporting ([TikTok asset permissions](https://ads.tiktok.com/help/article/about-assets-and-asset-level-permissions)).

Payment is owner-controlled. TikTok supports manual, automatic, and eligible monthly invoicing, and some changes cannot be reversed: automatic cannot return to manual, and monthly invoicing cannot return to manual or automatic. For the MVP, prefer **manual payment or an owner-approved hard budget cap** where available; choose the billing model before adding funds ([TikTok billing options](https://ads.tiktok.com/help/article/tiktok-billing-options), [billing option changes](https://ads.tiktok.com/help/article/about-billing-option-changes)).

## AppsFlyer fixed topology

### Company account and product grouping

Use one AppsFlyer advertiser account for the company. For each product:

- add one AppsFlyer app for each distributed platform app;
- create one Product Line to group the same product's Apple/web variants;
- add one AppsFlyer web app only when Web Attribution is intentionally enabled;
- use one OneLink template family and branded link domain per product where the plan supports them;
- use the same product-owned opaque Customer User ID only when cross-platform identity is legitimate and authenticated.

AppsFlyer's Product Line groups platform-specific versions of the same product, supports up to 30 apps, and requires a consistent CUID for cross-platform attribution. An app can belong to one Product Line only ([AppsFlyer Product Line](https://support.appsflyer.com/hc/en-us/articles/39524780935185-Product-Line-Group-apps-for-cross-platform-attribution)).

Keep unrelated products out of the same Product Line and never use email as the cross-platform identifier.

### Native app campaigns

For each product app:

1. Install and initialize the current AppsFlyer SDK.
2. Define the canonical sale/conversion event once.
3. Configure Unified Deep Linking.
4. Create a product OneLink template.
5. Activate TikTok Advanced SRN first.
6. Activate Meta Ads second.
7. Test install, deep link, deferred deep link, purchase/conversion, and postback behavior.

OneLink detects platform and can route to an app store or web destination; Unified Deep Linking is required for direct and deferred in-app routing ([AppsFlyer SDK integration guide](https://support.appsflyer.com/hc/en-us/articles/207032066-Basic-SDK-integration-guide)).

### Web-to-app campaigns

Preferred path:

- ads land on the product's own Astro web-to-app funnel;
- the incoming URL preserves platform click identifiers and campaign parameters;
- OneLink Smart Script V2 generates the outgoing app-store/deep-link URL;
- the app SDK records the install and conversion;
- AppsFlyer attributes the original campaign and sends permitted partner postbacks.

AppsFlyer says Smart Script V2 is the recommended new implementation and supports all media sources, including SRNs, while preserving incoming parameters for web-to-app attribution ([Smart Script overview](https://support.appsflyer.com/hc/en-us/articles/360000677217-OneLink-Smart-Script-overview)). For Meta web-to-app campaigns, AppsFlyer specifically requires `pid=metaweb_int` and propagation of `fbclid`; it uses those values for attribution/postback through CAPI ([Meta web-based campaigns](https://support.appsflyer.com/hc/en-us/articles/25646834966033-Meta-Ads-Create-web-based-campaigns)).

Plan gate: AppsFlyer currently says Smart Script and Smart Banners require an eligible paid plan. Do not incur that charge without owner approval. If the plan is not approved, use explicit campaign-specific OneLink links and accept the documented loss of fully dynamic two-click parameter preservation until the paid capability is justified ([web-to-app comparison](https://support.appsflyer.com/hc/en-us/articles/360001237818-Convert-your-mobile-web-visitors-to-app-users)).

### Pure web campaigns

Do not make AppsFlyer Web Attribution a mandatory MVP dependency yet. As of 2026-07-08, AppsFlyer documents it as **Beta**. The fixed MVP stack remains:

- GA4 for marketing-site analytics;
- Meta Pixel + CAPI for Meta web optimization;
- TikTok Pixel + Events API for TikTok web optimization;
- AppsFlyer for native-app and web-to-app attribution.

Enable AppsFlyer Web Attribution only when a product is a true web application and cross-network web attribution provides enough value to justify beta and plan risk. When enabled, create one web app for the product, install the Web SDK, configure acquisition events, activate Meta/TikTok web partners, and optionally group it with the product's mobile app in a Product Line. AppsFlyer's beta checklist supports Meta Ads and TikTok Ads web partners and reserves cost measurement for ROI360 ([AppsFlyer Web Attribution beta](https://support.appsflyer.com/hc/en-us/articles/43529798016401--Beta-Onboard-AppsFlyer-Web-Attribution)).

### Access and recovery

- Owner uses the company-domain email and remains account owner.
- Require 2FA and store recovery material.
- Agent access, if a distinct identity is supported, receives the least-capable role and product-specific app access.
- Partner permissions are enabled only for the relevant product apps and necessary data.
- API and server-to-server tokens remain secret-manager values; only AppsFlyer Admins can manage these tokens.
- Record advertiser IDs, App IDs, dev keys, OneLink template IDs, and integration states without storing secret values in GitHub.

AppsFlyer permits roles and app/media-source/geo restrictions, while Admin has all capabilities, all apps, and token management. Account-owner 2FA reset requires AppsFlyer Support, so the recovery record is essential ([AppsFlyer user management](https://support.appsflyer.com/hc/en-us/articles/4409128270481-User-management), [data access permissions](https://support.appsflyer.com/hc/en-us/articles/115005972889-Manage-data-access-permissions)).

## Naming standard

Use immutable IDs as the real references; names exist for human scanning.

| Asset | Pattern | Example |
| --- | --- | --- |
| Meta Business Portfolio | `COMPANY` | `Dijital Gozluk` |
| Meta Page | `PRODUCT` | `Atlas` |
| Instagram | `@product` or approved fallback | `@atlasapp` |
| Meta ad account | `PRODUCT \| META \| SCOPE \| CCY \| TZ` | `ATLAS | META | PRIMARY | TRY | Europe/Istanbul` |
| Meta dataset | `PRODUCT \| WEB \| DATASET` | `ATLAS | WEB | DATASET` |
| Meta developer app | `PRODUCT \| APP` | `ATLAS | APP` |
| TikTok Business Center | `COMPANY` | `Dijital Gozluk` |
| TikTok account | `@product` or approved fallback | `@atlasapp` |
| TikTok advertiser | `PRODUCT \| TIKTOK \| SCOPE \| CCY \| TZ` | `ATLAS | TIKTOK | PRIMARY | TRY | Europe/Istanbul` |
| TikTok pixel | `PRODUCT \| WEB \| PIXEL` | `ATLAS | WEB | PIXEL` |
| AppsFlyer app | `PRODUCT \| PLATFORM \| ENV` | `ATLAS | IOS | PROD` |
| AppsFlyer Product Line | `PRODUCT` | `ATLAS` |
| OneLink template | `product-purpose-platform` | `atlas-acquisition-ios` |
| Campaign | `YYYYMM \| MARKET \| OBJECTIVE \| PERSONA \| OFFER` | `202607 | TR | PURCHASE | SOLODEV | ANNUAL` |

Never put legal names, product names, currency, timezone, or market into an account before the owner confirms them. Platform naming and country/currency decisions can trigger review or replacement.

## Three-to-seven-day bootstrap

### Day 0: owner packet

Owner supplies or confirms:

- legal company name, registered address, registration/tax identifiers;
- company domain and company email;
- owner identity and phone;
- target payer, currency, timezone, and first market;
- product public name, handles, icon, website URL, App Store ID/bundle ID when available;
- explicit maximum learning budget;
- approved privacy disclosure and tracking decision.

Agent produces:

- asset manifest with desired names and IDs-to-capture;
- paused campaign skeleton;
- event and URL-parameter map;
- owner-only action checklist.

### Day 1: company control planes

Owner:

- creates or confirms the Meta Business Portfolio, TikTok Business Center, and AppsFlyer advertiser account;
- completes MFA;
- enters legal/verification information;
- adds payment only after confirming currency, timezone, billing mode, and budget cap.

Agent:

- verifies the resulting structure read-only;
- records non-secret IDs;
- flags mismatches before product assets are attached.

Start TikTok verification on Day 1 because TikTok says review may take up to two business days ([TikTok verification](https://ads.tiktok.com/help/article/about-business-verification)).

### Day 1–2: product identities and ad accounts

Create and connect:

- Meta Page + Instagram Business account;
- Meta product ad account;
- TikTok Organization Account or linked Business Account;
- TikTok product advertiser account;
- least-privilege assignments;
- paused campaign containers only.

No spend is authorized by account creation.

### Day 2–4: measurement

Implement and verify:

- Meta dataset, Pixel, CAPI, deduplication;
- TikTok Pixel, Events API, deduplication;
- AppsFlyer SDK, OneLink, UDL;
- TikTok Advanced SRN;
- Meta Ads AppsFlyer integration;
- canonical purchase/conversion event and revenue/currency parameters.

Test staging or platform test tools first. Production validation uses a bounded owner-approved test; do not create uncontrolled spend.

### Day 4–5: campaign QA

Agent prepares paused TikTok-first learning campaign:

- outcome/value-led creative;
- one primary conversion event;
- destinations and fallback routes;
- AppsFlyer/UTM parameters;
- daily and lifetime cap;
- start/end times;
- test matrix and stop conditions.

Owner reviews:

- exact problem being tested;
- expected user path;
- how the owner validates it;
- budget and worst-case spend;
- privacy disclosure and event-sharing state.

### Day 5–7: controlled launch

Owner explicitly approves:

- payment method;
- exact budget;
- campaign activation;
- any partner data-sharing option not previously approved.

Agent may activate only if the approved connector supports it and the owner explicitly authorized that exact campaign and budget. Otherwise the owner activates manually. After launch:

- verify spend and event arrival within the first bounded window;
- pause on missing/duplicated conversion events, wrong destination, payment anomaly, or policy warning;
- retain the user's separate rule: scaling requires at least 50 verified selected conversions in a rolling seven days plus acceptable CPA/ROAS, tracking quality, and creative diversity.

## Reusable bootstrap checklist

### Meta

- [ ] One company Business Portfolio selected
- [ ] Owner has full control; routine identities do not
- [ ] Facebook and Instagram 2FA enabled; recovery codes stored
- [ ] Legal identity and domain data match evidence
- [ ] Product Page created and added
- [ ] Product Instagram Business account created and connected to Page
- [ ] Product ad account created with confirmed payer/currency/timezone
- [ ] Payment entered by owner only
- [ ] Product dataset/pixel created
- [ ] Pixel + CAPI implemented and deduplicated
- [ ] Product Meta developer app created and Live when app ads are used
- [ ] AppsFlyer Meta integration activated for correct app
- [ ] Event mappings/privacy options reviewed
- [ ] Test install/conversion verified
- [ ] Campaign remains paused until explicit budget approval

### TikTok

- [ ] One advertiser Business Center selected
- [ ] Company and legal representative verification started/completed
- [ ] 2-step verification required for all members
- [ ] Owner Admin; Finance Manager only where required
- [ ] Product Organization Account created, or linked Business Account fallback documented
- [ ] Product advertiser account created with confirmed payer/currency/timezone
- [ ] Payment/billing option selected by owner
- [ ] Product Pixel created
- [ ] Pixel + Events API implemented and deduplicated
- [ ] TikTok App ID recorded for advertised app
- [ ] AppsFlyer `tiktokglobal_int` activated
- [ ] SKAN/event/data-sharing configuration reviewed
- [ ] Test install/conversion verified
- [ ] TikTok-first learning campaign remains paused until explicit budget approval

### AppsFlyer

- [ ] One company advertiser account selected
- [ ] Company-domain account owner and 2FA/recovery verified
- [ ] Product app(s) added
- [ ] Product Line created only for variants of the same product
- [ ] SDK, canonical conversion event, UDL, and OneLink tested
- [ ] TikTok Advanced SRN connected to correct advertiser/App ID
- [ ] Meta integration connected to correct App ID/ad account
- [ ] Web-to-app Smart Script plan entitlement checked before paid use
- [ ] Web Attribution beta remains off unless separately approved
- [ ] Non-secret asset IDs recorded; secrets remain outside GitHub
- [ ] Cost integration enabled only with approved plan and need

## Decision summary

Adopt this as the fixed paved road:

1. One company Meta Business Portfolio, TikTok Business Center, and AppsFlyer advertiser account.
2. One product social identity and one ad account per network per product.
3. New market ad accounts only for a documented legal, billing, currency/timezone, regulatory, or ownership boundary.
4. One product web dataset/pixel per network; browser + server measurement with deduplication.
5. AppsFlyer app and partner integrations per product app; Product Line only for the same product across platforms.
6. TikTok Advanced SRN first, Meta second.
7. Own web-to-app funnel + AppsFlyer OneLink/Smart Script when the owner approves the eligible plan.
8. No paid activation, payment mutation, budget creation/increase, legal attestation, verification submission, or MFA operation without the owner.
9. Agent may build integrations, tests, paused campaigns, asset mappings, and reports.
10. Revalidate platform UI, plan entitlement, country availability, and mutable limits at every product bootstrap because platform operations change faster than the reusable skill.
