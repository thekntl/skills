# Provider Stack Research

**Date:** 2026-07-27
**Decision context:** One solo developer; Apple and Go/HTMX web products; a separate Astro marketing site; public launch in 3–7 days; RevenueCat and AppsFlyer are already preferred; all providers sit behind product-owned adapters.

## Contents

- Executive recommendation
- Authentication
- Product analytics and error reporting
- Email signup, marketing, and transactional delivery
- Support portal and ticketing
- RevenueCat native and web purchase standard
- AppsFlyer, OneLink, TikTok, and Meta
- Privacy and consent baseline
- Launch-time checks
- Plain-English summary
- FreeScout decision evidence
- Brevo decision evidence

## Executive recommendation

| Concern | Recommended paved road | Important exception |
| --- | --- | --- |
| Authentication | WorkOS AuthKit Hosted UI, official Go SDK, and official iOS SDK | Do not require an account when the product has no meaningful account-based feature |
| Product analytics | PostHog Cloud EU for product events only | Marketing-site analytics stays in GA4 |
| Crash and error reporting | Sentry Cloud for Apple and Go/web | Disable replay and broad PII collection by default |
| Email marketing | Brevo | Re-evaluate only after measured deliverability, automation, or volume failure |
| Product transactional email | Brevo transactional API/SMTP, separated logically from marketing | AuthKit sends auth messages; the billing engine sends receipts and subscription messages |
| Support | Shared FreeScout production service plus staging counterpart; one mailbox/portal per product | Infrastructure remains owner-run and blocked until the pinned image/restore contract is proven |
| Native paywall | RevenueCatUI, backed by App Store products | watchOS and visionOS need a custom surface because RevenueCatUI does not support them |
| Web purchase | A version-controlled 2–3 step funnel using RevenueCat Web SDK + RevenueCat Billing + Stripe | Hosted Web Purchase Links are a fallback, not the localized default |
| Deep/deferred link | AppsFlyer OneLink + Unified Deep Linking | RevenueCat Redemption Links remain a separate purchase-redemption route |
| Paid attribution | AppsFlyer TikTok Advanced SRN first; Meta integration second | Partner postbacks and identifier sharing remain consent- and policy-gated |
| Consent | One product-owned consent coordinator, default-denied marketing/attribution, purpose-specific controls | Exact legal basis and regional text require a launch-time legal review |

These are fixed template defaults, not direct dependencies in product code. Every external provider is reached through the required adapter pattern.

## 1. Authentication

### Recommendation: WorkOS AuthKit, not self-hosted Go authentication

Use AuthKit Hosted UI for the browser authentication ceremony, the official WorkOS Go SDK for authorization-code exchange and sealed-cookie sessions, and the official iOS SDK/public PKCE client when an Apple client needs the same account. WorkOS documents a first-party [Go SDK](https://workos.com/docs/sdks/go), an [iOS mobile SDK](https://workos.com/docs/sdks), and separate application objects for a web app, mobile app, and desktop app while retaining one user base ([Applications](https://workos.com/docs/authkit/applications)).

AuthKit's Hosted UI handles sign-up, sign-in, reset, verification, MFA enrollment, bot protection, and automatic localization of both UI and authentication emails ([Hosted UI](https://workos.com/docs/authkit/hosted-ui)). WorkOS currently lists AuthKit as free up to one million monthly active users, while a custom AuthKit domain is currently a paid add-on ([pricing](https://workos.com/pricing)). Treat both figures as volatile and verify them at bootstrap.

Self-hosted Go authentication would make the solo developer responsible for password hashing, breached-password controls, account verification, recovery, MFA, session rotation and revocation, bot/rate-limit defenses, safe identity linking, and OAuth key rotation. OWASP describes secure authentication and session management as a coupled, security-sensitive system and recommends Argon2id for stored passwords ([Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)). That work is incompatible with the 3–7 day default.

### Product rules

- Do not add authentication merely because the template supports it. Apple says apps without significant account-based features should allow use without login; apps that create accounts must support in-app account deletion ([App Review Guidelines 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/)).
- Keep the provider subject in an `identity_links` table and use a product-owned opaque user ID everywhere else.
- Web sessions use `HttpOnly`, `Secure`, appropriate `SameSite` cookies; never browser local storage for session or refresh tokens.
- Authorization remains product-owned. AuthKit proves identity; Go use cases decide what that identity may do.
- Keep WorkOS behind `IdentityProvider`, `SessionVerifier`, and `UserLifecycle` interfaces. Verify signed webhooks before local user-state changes.

### Sign in with Apple implications

AuthKit supports Apple as a social provider and requires production Apple credentials ([WorkOS Apple integration](https://workos.com/docs/integrations/apple)). Apple Guideline 4.8 requires an equivalent privacy-preserving login option when an app uses third-party or social login for the primary account; a company-owned email/password-only login is one listed exception ([App Review Guidelines 4.8](https://developer.apple.com/app-store/review/guidelines/)).

For each product:

1. Enable Sign in with Apple when any other social login is enabled.
2. Create the App ID and web Services ID, register every return URL, and keep the Apple private key out of clients. Apple requires a unique Services ID for each supporting web service ([Apple configuration](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple)).
3. Register every real outbound sending domain used for Apple private-relay recipients and authenticate it with SPF and DKIM. Apple explicitly requires registered outbound sources for relay delivery ([Private Email Relay configuration](https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/)).
4. Accept `private.icloud.com` as well as legacy Apple relay domains; Apple announced the new domain for 2026 while preserving existing addresses ([Apple notice](https://developer.apple.com/news/?id=sus6t6ab)).
5. Store Apple's stable subject/provider link. Do not use email as the immutable identity key because a user can hide or change relay behavior.

### Credible alternative

Clerk is the strongest alternate if a product needs a more consumer-oriented native SwiftUI experience or a free custom auth domain. Clerk has official [Go](https://clerk.com/docs/reference/go/overview) and [native iOS](https://clerk.com/docs/ios/reference/native-mobile/overview) SDKs, native Sign in with Apple support, and currently includes a custom domain and 50,000 monthly retained users on its free plan ([pricing](https://clerk.com/pricing)). Its component localization is currently marked experimental and its hosted Account Portal remains English ([localization](https://clerk.com/docs/guides/customizing-clerk/localization)). Do not switch per product without changing the fixed template decision.

## 2. Product analytics and error reporting

### Product analytics: PostHog Cloud EU

Use one PostHog project per product and the EU Cloud region when the primary market includes Europe. PostHog has official Apple and Go SDKs: its iOS SDK captures events, identity, offline queues, feature flags, experiments, surveys, and optional replay ([iOS SDK](https://posthog.com/docs/libraries/ios)); its Go SDK batches events asynchronously and supports aligned frontend/backend identities ([Go SDK](https://posthog.com/docs/libraries/go)). Current published pricing includes one million product-analytics events per month free, followed by usage pricing ([pricing](https://posthog.com/pricing)).

Rules:

- Use PostHog only inside the product. The Astro marketing site continues to use GA4.
- Define the activation event, satisfaction moment, paywall events, purchase outcome, and review-request eligibility before instrumentation.
- Use the same product-owned opaque user ID across Swift and Go. Never identify with email, name, Apple relay address, or an AppsFlyer advertising identifier.
- Disable autocapture and session replay initially. Add only after a specific research need, consent design, masking test, and cost cap.
- Maintain a typed event catalog and budget. Unknown event names fail tests.

### Crash/error reporting: Sentry Cloud

Use Sentry as the error and crash system rather than treating analytics events as crash reports. The official Sentry Cocoa SDK supports iOS, iPadOS, macOS, watchOS, and visionOS and recommends Swift Package Manager ([Sentry Cocoa](https://github.com/getsentry/sentry-cocoa)). Sentry maintains a Go SDK with error, tracing, logging, metrics, and HTTP integrations ([Sentry Go](https://github.com/getsentry/sentry-go)). The current Developer plan is free for one user and includes 5,000 errors, while the Team plan currently starts at USD 26/month annually ([pricing](https://sentry.io/pricing/)).

Rules:

- Create separate Sentry projects for Apple and Go/web under one organization; use the same release identifier.
- Start with crashes, handled errors, release health, and low tracing samples. Disable replay, profiling, attachments, request bodies, and broad logs.
- Scrub authorization headers, cookies, form values, email, support text, purchase payloads, and user content before transmission. Enable server-side default data scrubbing and IP scrubbing ([organization privacy controls](https://docs.sentry.io/api/organizations/update-an-organization/)).
- Use a product-owned error reporter adapter so tests use a no-op/in-memory reporter.

### Why two providers

PostHog answers product questions: activation, retention, funnels, and experiments. Sentry answers engineering questions: what failed, in which release, and how many users were affected. Combining them into a single generic event stream produces weaker incident handling and encourages accidental PII in analytics.

## 3. Email signup, marketing, and transactional delivery

### Recommendation: Brevo

Brevo is the lowest-operations default because one account supports:

- embeddable signup forms, segmentation, campaigns, and automations such as welcome sequences ([email marketing](https://www.brevo.com/features/email-marketing/));
- marketing and transactional email in the same sending allowance;
- transactional API/SMTP and outbound webhooks;
- a current free plan with 300 daily sends, one seat, and automation for up to 2,000 contacts ([plan details](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans)).

The daily cap and automation-contact cap make Free a bootstrap plan, not a promise of permanent cost. Brevo's current Starter plan begins at USD 9/month, but list-size and send-volume tiers change; verify price during provider setup.

### Data and adapter model

Store consent evidence locally before creating or updating a Brevo contact:

```text
subscriber_id
email_normalized
locale
source
consent_purpose
consent_text_version
consented_at
withdrawn_at
provider_contact_id
```

Use `AudienceProvider` for contact/segment changes, `CampaignProvider` for marketing sends, and `TransactionalMailer` for product messages. Provider webhooks update delivery, bounce, complaint, and unsubscribe state locally.

### Is a separate transactional provider needed?

No, not initially.

- AuthKit should send verification, reset, and magic-code messages.
- RevenueCat Billing/Stripe should send billing receipts and subscription-management messages.
- Brevo should send the remaining product messages through its transactional channel.

Separate marketing and transactional streams with distinct templates, tags, API credentials, reply-to addresses, and preferably sending subdomains even while they share Brevo. Add a separate provider such as Postmark or Resend only after measured evidence of deliverability isolation, unsupported product requirements, or volume risk. Adding it pre-launch creates another DPA, webhook, secret, suppression list, and failure mode without proven value.

## 4. Support portal and ticketing

### Superseded SaaS comparison: Freshdesk

This section preserves the earlier SaaS comparison only. The owner's final paved-road decision is the shared FreeScout system in the historical decision record below and in the skill package. Do not treat Freshdesk as the current recommendation.

The earlier Freshdesk analysis found:

- The customer portal lets customers create and track tickets and use a knowledge base; it can use a custom support domain ([Customer Portal](https://support.freshdesk.com/support/solutions/articles/50000003752)).
- The help widget embeds solution articles and a ticket form in a website or product, and its API can prefill safe fields ([Help Widget](https://support.freshdesk.com/support/solutions/articles/239273-setting-up-your-help-widget)).
- Ticket forms can be embedded in a normal web page, assigned to portals/widgets, and drive automations ([Ticket Forms](https://support.freshdesk.com/support/solutions/articles/50000010095-understand-and-use-ticket-forms)).
- The portal and knowledge base support multiple languages, with browser/profile language selection ([multilingual portal](https://support.freshdesk.com/support/solutions/articles/180033-setting-up-a-multi-language-support-portal-with-freshdesk)).
- Freshdesk exposes ticket APIs and automation-triggered webhooks through its official developer platform ([Freshdesk API](https://developers.freshdesk.com/api/)).

Current Freshdesk pricing starts at USD 19/agent/month annually for Growth; a one-to-two-agent free program currently lasts six months. The multilingual knowledge base is documented as a Pro feature, currently USD 55/agent/month annually ([pricing](https://www.freshworks.com/freshdesk/pricing/), [knowledge-base plan matrix](https://support.freshdesk.com/support/solutions/articles/50000000585-about-freshdesk-knowledge-base)). Therefore:

- start with Growth if the launch has one support language;
- use Pro before launching multiple support-content languages;
- do not claim multilingual parity until the actual plan and translated articles pass acceptance.

### Current standard flow

1. The product route connected to its shared FreeScout mailbox/portal is canonical.
2. `/support` on the Astro marketing site explains the flow and embeds or links the ticket form.
3. Apple apps open `/support?product=<safe-id>&version=<version>&locale=<locale>` in an appropriate in-app browser.
4. Only the user's explicit action creates a ticket. Optional diagnostics require separate consent and a preview.
5. The native email fallback includes product, version, and a human-editable template, never secrets or raw logs.
6. Support status stays in FreeScout; do not build a second ticket database.

Do not load the support widget on every marketing page before consent review. A dedicated support route is simpler, faster, and reduces third-party tracking surface.

## 5. RevenueCat native and web purchase standard

### Native Apple paywall

Use RevenueCat offerings and entitlements behind a product-owned `EntitlementProvider`. Present the remotely configured paywall through `RevenueCatUI` on supported platforms. RevenueCat documents SwiftUI/UIKit presentation and entitlement-gated `presentPaywallIfNeeded` flows ([displaying paywalls](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls)).

RevenueCatUI currently supports iOS, macOS, and Mac Catalyst, but its published matrix does not support watchOS or visionOS ([installation matrix](https://www.revenuecat.com/docs/tools/paywalls/installation)). Those platforms use a small custom native purchase surface backed by the core Purchases SDK where supported, or route purchase management to the paired/supported platform after policy review.

### Web-to-app standard

Use a version-controlled two- or three-step Astro funnel:

1. outcome/value and qualification;
2. plan/paywall;
3. checkout, success, and install/redeem handoff.

Render the paywall/checkout with `@revenuecat/purchases-js`, RevenueCat Billing, and a connected Stripe payment gateway. The Web SDK supports identified users and anonymous purchases; anonymous purchases return redemption information that the site must present itself ([Web SDK](https://www.revenuecat.com/docs/web/web-billing/web-sdk)). RevenueCat recommends RevenueCat Billing for new web-billing integrations and includes RevenueCat Web within its normal RevenueCat pricing; Stripe processing and optional tax fees still apply ([billing-engine comparison](https://www.revenuecat.com/docs/web/web-billing/overview)).

Why this is the default:

- the funnel layout, copy, tracking, consent, and localization stay in the reusable marketing-site template;
- the Web SDK can select among 33 checkout locales, including Turkish ([Web SDK localization](https://www.revenuecat.com/docs/web/web-billing/localization));
- a RevenueCat Paywall can be rendered directly in the page and use Apple Pay/Google Pay where configured ([Web Paywalls](https://www.revenuecat.com/docs/web/paywalls));
- anonymous buyers can enter the app through one-time RevenueCat Redemption Links ([Redemption Links](https://www.revenuecat.com/docs/web/web-billing/redemption-links)).

Hosted Web Purchase Links remain the emergency/no-code fallback. They support identified and anonymous purchases, custom success redirects, and Redemption Links ([Web Purchase Links](https://www.revenuecat.com/docs/web/web-billing/web-purchase-links)), but the hosted flow cannot currently be forced to a selected language. That conflicts with the template's localization requirement.

RevenueCat's own hosted multi-step Funnels are promising, but are currently limited to Pro/Enterprise and add a remotely managed surface outside the version-controlled Astro template ([Funnels](https://www.revenuecat.com/docs/tools/funnels)). Re-evaluate only after the fixed funnel has real conversion data.

### Store-policy gate

Do not expose an in-app link to external purchase globally. RevenueCat's current guidance says U.S. iOS apps may direct users to external payment under the cited court ruling, while outside the U.S. Apple may still require digital goods/subscriptions to use IAP ([RevenueCat Web overview](https://www.revenuecat.com/docs/web/payment-integrations)). This is time-sensitive legal/store-policy information: verify the current storefront, entitlement, product category, and App Review rules immediately before every release.

## 6. AppsFlyer, OneLink, TikTok, and Meta

### Deep-link standard

Use one AppsFlyer OneLink template per product and the Unified Deep Linking API. OneLink can route installed users into the app and new users through the store before delivering the deferred destination ([OneLink](https://support.appsflyer.com/hc/en-us/articles/208874366-Create-deep-linking-and-redirection-links-for-your-campaigns-with-OneLink)). On iOS, UDL returns a constrained `deep_link_value` plus `deep_link_sub1...10` for new users as a privacy protection ([iOS UDL](https://dev.appsflyer.com/hc/docs/dl_ios_unified_deep_linking)).

Rules:

- Define a small product-owned route enum; never let arbitrary link parameters select a URL, file, or privileged action.
- Universal Links are primary; a product-unique custom scheme is fallback.
- Preserve campaign parameters from ad → Astro landing page → OneLink CTA.
- Test installed, not-installed, consent-delayed, expired, offline, and invalid-route states on a physical device.
- Keep RevenueCat Redemption Links separate. OneLink attributes/navigates; Redemption Links associate a completed web purchase.

### TikTok first

Activate AppsFlyer's current TikTok for Business Advanced SRN integration (`tiktokglobal_int`), not the deprecated legacy integration. It measures installs, re-engagement, and in-app events, including app activity after non-app/web-landing campaigns ([TikTok setup](https://support.appsflyer.com/hc/en-us/articles/6722785184913-TikTok-for-Business-Advanced-SRN-integration-setup)).

Map a small event set:

- activation/satisfaction;
- paywall viewed;
- trial started where applicable;
- verified purchase/subscription with value and currency;
- renewal/cancellation only when the optimization model needs them.

Use TikTok standard events for optimization. Do not forward every PostHog event. Purchase confirmation should originate from a verified RevenueCat/backend state, be deduplicated, and be forwarded through the AppsFlyer adapter.

### Meta second

Create the Meta App ID, activate the AppsFlyer Meta integration, and map the same canonical conversion taxonomy. AppsFlyer says Meta mobile attribution does not require Facebook Login or the Meta mobile SDK when the AppsFlyer integration is used ([Meta setup](https://support.appsflyer.com/hc/en-us/articles/207033826-Meta-Ads-integration-setup)). AppsFlyer maps SDK or server events to Meta's predefined events and supports custom mappings ([event mapping](https://support.appsflyer.com/hc/en-us/articles/4410480904081-Meta-ads-in-app-event-mapping)).

For iOS without an advertising identifier, Meta's Aggregated Event Measurement may receive qualifying events when advanced data sharing is enabled; that choice can include additional device-related information and is a privacy decision, not a harmless optimization toggle ([Meta AEM](https://support.appsflyer.com/hc/en-us/articles/19228737402129-Meta-Ads-Aggregate-Event-Measurement-AEM-for-iOS)).

### Cost caveat

AppsFlyer's current Growth plan includes a one-time first-year allowance of 12,000 measured conversions and then lists USD 0.07 per conversion; organic actions are not counted. Cost data/ROI360 and several APIs are premium features ([pricing](https://www.appsflyer.com/pricing/full/)). Verify the live plan and put a spend alert in the bootstrap checklist.

## 7. Privacy and consent baseline

This is an implementation baseline, not legal advice.

### One consent coordinator

Create a product-owned `ConsentCoordinator` with separate, versioned purposes:

- necessary service/auth/payment/support;
- product analytics;
- diagnostics;
- marketing attribution;
- personalized advertising;
- email marketing.

Provider SDKs receive state from this coordinator. They do not independently invent consent. Record consent version, locale, timestamp, source, and withdrawal.

### Apple requirements

- ATT is required before tracking users across other companies' apps/websites or accessing IDFA. Apple explicitly includes some third-party deep/deferred-link identity sharing for ad measurement ([User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)).
- Request ATT only at a contextual moment after explaining the value. Never gate product functionality or reward consent. If the configuration does not perform cross-company tracking or access IDFA, do not show ATT merely because AppsFlyer is installed.
- AppsFlyer says not to call `waitForATTUserAuthorization` unless the app will actually invoke ATT ([basic SDK guide](https://support.appsflyer.com/hc/en-us/articles/207032066-Basic-SDK-integration-guide)).
- Keep AppsFlyer Aggregated Advanced Privacy enabled by default for non-consented iOS traffic; it withholds user-level attribution data under its stated rules ([AAP](https://support.appsflyer.com/hc/en-us/articles/360018515798-Apply-Aggregated-Advanced-Privacy-framework)).
- Generate and inspect Xcode's privacy report. Apple requires valid privacy manifests for apps and specified third-party SDKs and makes the developer responsible for third-party code ([privacy manifests](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk), [SDK requirements](https://developer.apple.com/support/third-party-SDK-requirements/)).
- Update the App Store privacy answers for identifiers, product interaction, purchases, crash/performance data, support content, and tracking. Apple requires disclosure of third-party collection and warns that data collected in an app web view can also require disclosure ([App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)).

### Website requirements

- The Astro site's CMP defaults GA4 `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to denied where affirmative consent is required. Basic Consent Mode sends nothing before consent; advanced mode sends cookieless pings, so choose deliberately ([Google Consent Mode](https://support.google.com/analytics/answer/10000067)).
- Do not load PostHog, AppsFlyer web tags, ad pixels, or optional support embeds before their approved purpose allows it.
- Email signup uses an unchecked, purpose-specific marketing choice; store the exact text version and provide one-click unsubscribe.
- Support, legal, account deletion, and purchase management remain usable after rejecting marketing/analytics.

### Data-minimization rules

- AppsFlyer's terms prohibit restricted data such as financial details, health data, government IDs, and sensitive categories. The customer is responsible for notices and required consent ([AppsFlyer Terms](https://www.appsflyer.com/legal/terms-of-use/)).
- Never send raw email, name, support message, document content, health/sensitive content, full URLs with user data, or payment payloads to PostHog, Sentry, or AppsFlyer.
- Use opaque product IDs. Maintain a provider deletion/export runbook for AuthKit, PostHog, Sentry, Brevo, FreeScout, RevenueCat, and AppsFlyer.
- Sign DPAs, record regions/subprocessors, set retention limits, rotate provider keys, and keep secret keys server-side.

## Launch-time checks

1. Verify WorkOS custom-domain pricing and whether the hosted-provider domain is acceptable for the product's conversion goals.
2. Run an App Review preflight for the exact native/web purchase path and storefronts; external-purchase rules are changing.
3. Verify FreeScout core/image/module compatibility, portal locales, mail behavior, immutable artifacts, and restore evidence before production.
4. Confirm Brevo's sender approval, regional hosting/DPA, Apple private-relay delivery, and required daily volume.
5. Confirm PostHog and Sentry region, retention, spend caps, and SDK privacy manifests against the versions actually pinned.
6. Verify AppsFlyer plan access to OneLink, raw-data/API needs, TikTok/Meta partner settings, AAP, ATT behavior, and campaign event postbacks in sandbox.
7. Have counsel or a qualified privacy reviewer approve consent text, legal basis, retention, international transfers, and child/sensitive-data handling for each product and market.

## Plain-English summary

Use managed services for identity, measurement, email, billing, and attribution, plus the owner-run shared FreeScout platform, so one developer can launch quickly. Keep each service replaceable behind an adapter, collect only the minimum data, and do not turn marketing tracking on before the required consent. The recommended stack is WorkOS, PostHog, Sentry, Brevo, FreeScout, RevenueCat, and AppsFlyer.

## FreeScout decision evidence

FreeScout is the final shared support default. No agent may execute Docker, Swarm, deployment, upgrade, restore, or rollback commands; the owner performs those operations manually.

### Shortlist

| Option | What official sources establish | Gaps and solo-operator cost | 3–7 day fit |
| --- | --- | --- | --- |
| **FreeScout — preferred OSS desk** | The core is AGPL-3.0, PHP/database based, multilingual, email-first, and its project says it has no stated minimum CPU/RAM. It provides a web installer/updater and the official project links a container image ([repository and requirements](https://github.com/freescout-help-desk/freescout)). Its official End-User Portal module adds ticket submission, email-link login, ticket viewing/status and replies; the Knowledge Base module adds translated articles; the API & Webhooks module adds signed webhooks and a REST API ([portal](https://www.freescout.net/module/end-user-portal/), [knowledge base](https://freescout.net/module/knowledge-base/), [API/webhooks](https://freescout.net/module/api-webhooks/)). | The linked container is maintained in the separate `nfrastack` repository, not by the FreeScout core team ([linked image](https://github.com/nfrastack/container-freescout)). Portal, API/webhooks, knowledge base, SAML and some security features are separate modules whose prices, licenses and compatible versions must be rechecked. SAML covers agents/admins; the customer portal normally uses emailed magic links ([SAML module](https://www.freescout.net/module/saml/)). Backup is an application-directory copy plus database export, and updates require a backup and post-update checks ([backup](https://github.com/freescout-help-desk/freescout/wiki/Backup), [updates](https://github.com/freescout-help-desk/freescout/wiki/Updating-FreeScout)). | **Good after one manual infrastructure slot.** Use one instance, one isolated mailbox/portal per product. Do not couple customer access to product auth in the MVP. |
| **osTicket — all-core portal fallback** | GPL-2.0; its official web installer targets PHP, a supported web server and MySQL ([repository](https://github.com/osTicket/osTicket), [installation](https://docs.osticket.com/en/latest/Getting%20Started/Installation.html)). Its client portal lets guests or registered users submit tickets and view status/history. It supports IMAP/POP or piping for inbound mail and SMTP for replies; official language packs are downloadable ([ticket status](https://docs.osticket.com/en/latest/User/Ticket/Check%20Ticket%20Status.html), [email](https://docs.osticket.com/en/latest/Admin/Emails/Emails.html), [languages](https://osticket.com/download/)). The OAuth2 plugin can provide SSO for users and agents ([OAuth2 guide](https://docs.osticket.com/en/latest/Guides/OAuth2%20Guide.html)). | There is no first-party container path in the official installation guide. The official HTTP API currently creates tickets only, with no documented first-party webhook system ([ticket API](https://docs.osticket.com/en/latest/Developer%20Documentation/API/Tickets.html)). Backups are manual database/files backups and upgrades can require an offline web migration ([upgrade](https://docs.osticket.com/en/latest/Getting%20Started/Upgrade%20and%20Migration.html)). No official minimum resource figure was found. | **Acceptable only when an all-core customer portal matters more than automation.** Poor adapter/event fit. |
| **Zammad — mature but not lightweight** | AGPL-3.0 with a first-party Docker Compose repository, a customer interface with ticket status/history, inbound/outbound email, a full REST API, retrying webhooks, multilingual knowledge base, and OIDC/SAML ([repository](https://github.com/zammad/zammad), [customer interface](https://zammad.com/en/product/features/customer-interface), [REST API](https://docs.zammad.org/en/latest/api/intro.html), [webhooks](https://admin-docs.zammad.org/en/latest/manage/webhook.html), [knowledge base](https://admin-docs.zammad.org/en/latest/manage/knowledge-base.html), [OIDC](https://admin-docs.zammad.org/en/latest/settings/security/third-party/openid-connect.html)). Its Compose stack includes a backup/restore path ([Docker backup](https://docs.zammad.org/en/latest/appendix/backup-and-restore/docker-compose.html)). | Official minimum guidance is 2 CPU cores and 6 GB RAM, plus 4 GB when Elasticsearch is on the same server ([hardware](https://docs.zammad.org/en/latest/prerequisites/hardware.html)). It is operationally much larger than the support needs of a new solo MVP. | **No for the paved road.** Switch candidate only when advanced workflows/search justify a dedicated service and memory budget. |
| **Chatwoot — conversational support, not the required ticket portal** | Community code outside its enterprise directory is MIT-licensed; official production Docker/CE images exist. It has inbound/outbound email, application/client APIs, webhooks, a localized widget, help center, and HMAC identity validation for logged-in product users ([license](https://github.com/chatwoot/chatwoot/blob/develop/LICENSE), [Docker](https://developers.chatwoot.com/self-hosted/deployment/docker), [email](https://developers.chatwoot.com/self-hosted/configuration/features/email-channel/introduction), [APIs](https://developers.chatwoot.com/api-reference/introduction), [webhooks](https://developers.chatwoot.com/api-reference/webhooks/add-a-webhook), [languages](https://www.chatwoot.com/hc/user-guide/articles/1677695546-languages-supported-in-chatwoot), [identity](https://www.chatwoot.com/hc/user-guide/articles/1782283175-understanding-contact-identity-and-identity-validation-in-chatwoot)). | The Community Edition does not include SSO or custom branding ([self-hosted plans](https://www.chatwoot.com/pricing/self-hosted-plans)). Its product model is a persistent conversation/widget, not the classic customer ticket-status portal required here. It needs PostgreSQL, Redis and workers; official minimum guidance is 2 cores, 4 GB RAM and 20 GB storage. Backups cover database, storage and configuration ([requirements](https://developers.chatwoot.com/self-hosted/deployment/requirements), [backup](https://developers.chatwoot.com/self-hosted/deployment/backup)). | **No for this requirement.** Reconsider only if live chat and social inboxes replace ticket-status tracking. |

Peppermint was not shortlisted: its official GitHub repository was archived on 2026-07-17, so it is not a safe new production dependency ([repository](https://github.com/Peppermint-Lab/peppermint)).

### FreeScout shape on the existing Swarm

FreeScout is lightweight at the application layer, but it is not a stateless single-container system:

- The upstream project is a PHP application that requires a supported SQL database and a web server. Upstream links to a container image but does not publish that image itself ([upstream README](https://github.com/freescout-help-desk/freescout)).
- The linked `nfrastack` image packages Nginx, PHP-FPM, FreeScout, the minute scheduler, and the queue worker into one application container. It does not require Redis or Elasticsearch ([container README](https://github.com/nfrastack/container-freescout)).
- The image requires persistent application state at `/data` or `/www/html`; `/data` includes configuration, sessions, cache, modules, and uploads. Logs, database state, and the application state require a backup and tested restore path ([persistent storage](https://github.com/nfrastack/container-freescout#persistent-storage)).
- The maintainer's [reference Compose file](https://github.com/nfrastack/container-freescout/blob/main/examples/compose.yml) runs three services: FreeScout, MariaDB, and a database-backup container. On this infrastructure, the approved shared PostgreSQL service can replace the two database services by giving FreeScout its own database and least-privilege role. The resulting runtime shape can therefore be one FreeScout application service plus external PostgreSQL, persistent application storage, ingress, secrets, and mail connectivity.
- Run one application replica initially. Swarm failover is safe only when the replacement task can reach the same durable application state; a node-local volume without a placement/recovery plan is insufficient.
- Pin a reviewed image version or digest and disable surprise application updates. Validate migrations, module compatibility, mailbox polling, outbound mail, backup, restore, and rollback in staging.

This is a **moderate**, not trivial, Swarm addition. The application itself is simpler than Zammad or Chatwoot; the real work is durable storage, mail, secrets, upgrade control, and recovery. Codex may prepare the reviewed stack manifest and operator runbook, but the owner performs every runtime command.

### FreeScout bootstrap gate and volatile checks

Before selecting or deploying it for a product:

- Verify the current stable core release, supported PHP/database versions, published security advisories and the exact supported-version policy.
- Recheck End-User Portal, API & Webhooks, Knowledge Base and SAML module prices, AGPL/license terms, compatibility and update entitlement. All displayed module prices and versions are volatile.
- Decide whether the separately maintained `nfrastack` image is acceptable. Pin an immutable version/digest, review its source/change log and define rollback; otherwise use the core project's manual installer. Do not use `latest` in production.
- Confirm Turkish and every product locale in the core UI, portal and knowledge base with a real browser test; “multilingual” does not guarantee complete translations.
- Test SMTP/IMAP or provider OAuth, SPF/DKIM/DMARC, Apple private-relay delivery, reply threading, bounce handling, spam controls and mailbox isolation.
- Write and perform a restore drill covering the database, application/configuration files, modules, attachments and encryption key. A backup without a tested restore does not pass.
- Verify TLS, secret storage, admin MFA/SSO choice, attachment limits/malware policy, retention/deletion/export, privacy notice and log redaction.
- Measure idle and peak CPU/RAM/storage on staging before allocating production capacity. FreeScout publishes no numeric minimum, so “lightweight” must be demonstrated on this infrastructure.
- Keep the email-only route working as the rollback path. The owner performs every infrastructure command manually; Codex may prepare reviewed manifests and runbooks but must not execute Docker/Swarm commands.

### Final owner decision and provisioning boundary

Deploy one shared FreeScout production service and one staging counterpart as part of the reusable platform foundation before the next product launch. Connect each service to its own database and least-privilege role in the corresponding shared PostgreSQL installation. Give every product a separate mailbox and customer portal configuration; retain native email only as the portal-unavailable fallback.

The official API requires the paid API & Webhooks module ([module](https://freescout.net/module/api-webhooks/), [API documentation](https://api-docs.freescout.net/)). Its documented provisioning boundary is:

- **Automatable:** list existing mailboxes; create and manage conversations in a known mailbox; create/list/delete users; list folders and custom fields; create/list/delete signed webhooks; consume status and reply events.
- **Not documented as automatable:** create or update a mailbox; configure inbound mailbox credentials; configure outbound SMTP identity; assign mailbox users and permissions; install or license modules; create or brand the customer portal.

The API documentation contains `GET /api/mailboxes` but no documented create/update mailbox operation. Therefore each product gets:

1. an agent-generated mailbox manifest and exact owner checklist;
2. owner-entered mailbox, OAuth/MFA, SMTP, domain, module-license, and portal settings;
3. an agent-run API verification only after the owner supplies the non-secret result or an approved connector can access the service;
4. automated conversation, webhook, and reporting integration after the mailbox ID exists.

Do not automate unsupported setup through browser control, direct database writes, container execution, or undocumented endpoints. Recheck the official API before each reusable template release because its methods can change.

## Brevo decision evidence

**Decision:** Use **Brevo** as the fixed paved-road default for both marketing and product transactional email. This comparison was checked on 2026-07-27 against official vendor pricing, documentation, and legal pages only. Plan limits and localized prices are volatile and must be rechecked at each product bootstrap.

### Current free and entry-tier comparison

| Provider | Free contacts and sends | Automation, forms, and segmentation | Marketing + transactional integration | First paid pressure |
| --- | --- | --- | --- | --- |
| **Brevo — fixed default** | Up to **100,000 stored contacts** and **300 combined email credits/day** for marketing or transactional use; unused capacity does not roll over. This is at most 9,000 sends in a 30-day month, but a campaign above 300 recipients must be manually requeued and mail beyond the retry queue is not delivered ([Free limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan), [shared credits](https://help.brevo.com/hc/en-us/articles/8292912279954-Add-or-remove-emails-from-your-plan)). | Marketing automation can process up to **2,000 contacts**. Brevo documents sign-up forms, lists, and dynamic segments; Free excludes landing pages and pop-ups ([plans](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans), [segments](https://help.brevo.com/hc/en-us/sections/202171449-Filters-and-segments), [Free exclusions](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)). | One contact store and credit pool. REST API, ordinary SMTP relay, contact APIs, and marketing/transactional delivery webhooks are documented ([transactional API](https://developers.brevo.com/docs/send-a-transactional-email), [SMTP](https://developers.brevo.com/docs/smtp-integration), [webhooks](https://help.brevo.com/hc/en-us/articles/27824932835474-Create-outbound-webhooks-to-send-real-time-data-from-Brevo-to-an-external-app)). | Starter begins at **$9/month** for 5,000 sends and only 500 stored contacts; the next published tiers are 10,000/1,500 and 15,000/2,500. Paid contact capacity is tied to send tier, so a Free account with a large stored list may need a higher tier than send volume alone suggests. Starter branding removal is a separate **$9/month** add-on ([plans](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans)). Prepaid non-expiring credits are another option, but replace the Free daily allowance while active ([prepaid credits](https://help.brevo.com/hc/en-us/articles/4409354969746-Customize-your-plan-with-add-ons)). |
| **Loops — switch candidate for product-led email** | Up to **1,000 subscribed contacts** and **4,000 total marketing + transactional sends/month**; transactional-only recipients do not count as marketing contacts. All features are included, with a small footer ([Free plan](https://app.loops.so/docs/account/free-plan)). | Full functionality includes workflows, events, forms, mailing lists, and dynamic segments. No separate Free workflow-count cap is published; the shared contact/send caps remain ([workflows](https://loops.so/docs/workflows), [segments](https://loops.so/docs/contacts/filters-segments), [pricing](https://loops.so/pricing)). | One audience for campaigns, workflows, and transactional templates. REST API, an official Go SDK, inbound/outbound webhooks, and SMTP are available. Its SMTP is not a generic body relay: every message references a Loops transactional template and sends an API-like JSON body ([API](https://loops.so/docs/api-reference/intro), [webhooks](https://loops.so/docs/webhooks), [SMTP](https://loops.so/docs/smtp)). | The first paid bracket is **$49/month for 1,000–5,000 subscribers**, with unlimited marketing and transactional sends and full features. This is a simple but steep jump from Free ([pricing](https://loops.so/pricing)). |
| **MailerLite + MailerSend** | MailerLite Free has **250 active subscribers** and **2,500 marketing sends/month**. MailerSend separately offers **500 transactional sends/month** after approval and requires a card even on Free ([MailerLite pricing](https://www.mailerlite.com/pricing), [MailerSend pricing](https://www.mailerlite.com/pricing-mailersend)). | Free includes **3 active automations**, **3 forms**, unlimited dynamic segments/groups, one landing page, and one website. Free API/webhook access is limited and cannot send email through the API ([Free-plan update](https://www.mailerlite.com/help/free-plan-update-faq), [pricing](https://www.mailerlite.com/pricing)). | Marketing and transactional mail are two products, contact models, quotas, and potentially bills. MailerLite has contact APIs/webhooks but no SMTP relay; MailerSend supplies transactional API, SMTP, and webhooks ([MailerLite SMTP answer](https://www.mailerlite.com/help/does-mailerlite-offer-smtp-simple-mail-transfer-protocol), [webhooks](https://developers.mailerlite.com/api/webhooks), [MailerSend pricing](https://www.mailerlite.com/pricing-mailersend)). | MailerLite Comfort starts at **$12/month**; sends equal 10× the chosen subscriber-tier ceiling, and the 500-subscriber view shows 5,000/month. MailerSend Hobby starts at **$7/month for 5,000 transactional sends**. The split adds operational cost even when the combined price is acceptable ([MailerLite pricing](https://www.mailerlite.com/pricing), [MailerSend pricing](https://www.mailerlite.com/pricing-mailersend)). |
| **Mailchimp** | Free has **250 contacts**, **500 marketing sends/month**, and a **250/day** cap ([plan guide](https://mailchimp.com/help/about-mailchimp-pricing-plans/)). | The plan guide lists one automated welcome email plus forms; the live comparison table simultaneously says Free automation flows are not included. Treat automation entitlement as unresolved until verified in-account. Free has one audience and basic forms/segmentation ([plan guide](https://mailchimp.com/help/about-mailchimp-pricing-plans/), [live pricing](https://mailchimp.com/pricing/marketing/)). | Marketing API and audience webhooks are documented. SMTP/API transactional mail is a separate Mailchimp Transactional add-on, available only with Standard, Premium, or a legacy monthly marketing plan—not Essentials ([Marketing API](https://mailchimp.com/developer/marketing/), [webhooks](https://mailchimp.com/developer/marketing/api/list-webhooks/), [transactional pricing](https://mailchimp.com/pricing/transactional-email/)). | The localized page rendered Essentials at **€11.50/month for 12 months** for the entry configuration at research time, with 500 contacts and 10× contact-limit sends; checkout price and taxes vary. Essentials cannot buy Transactional. Transactional starts at **$20 per 25,000-email block** on top of an eligible Standard/Premium plan ([marketing pricing](https://mailchimp.com/pricing/marketing/), [transactional pricing](https://mailchimp.com/pricing/transactional-email/)). |

### Sender-domain and regional facts

- **All four require or strongly drive a controlled custom sending domain.** Brevo requires sender-domain authentication and documents Brevo-code, DKIM, and DMARC records; Loops requires domain ownership plus SPF, DKIM, MX, and DMARC and recommends a sending subdomain; MailerLite requires custom-domain authentication after its 14-day trial; Mailchimp requires sender verification, recommends authentication, and requires authentication for Transactional ([Brevo](https://help.brevo.com/hc/en-us/articles/17286219877778-FAQs-About-domain-authentication-Brevo-code-DKIM-DMARC), [Loops](https://loops.so/docs/sending-domain), [MailerLite](https://www.mailerlite.com/help/how-to-verify-and-authenticate-your-domain), [Mailchimp](https://mailchimp.com/help/set-up-email-domain-authentication/)).
- **Brevo** publishes a DPA and says its database hosting is exclusively in the EU, with primary hosting in France/Germany and Google Cloud storage in Belgium ([DPA](https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA), [locations](https://help.brevo.com/hc/fr/articles/360001005510-Lieux-de-stockage-des-donn%C3%A9es)).
- **Loops/Astrodon** publishes a DPA, is US-based, says personal data is transferred to and processed in the US, and cites SCC and Data Privacy Framework safeguards ([DPA](https://loops.so/dpa), [privacy](https://loops.so/privacy)).
- **MailerLite** publishes a DPA with SCCs. Its EEA/UK/Swiss contracting entity is Irish; it says new MailerLite data is hosted on Google Cloud in the Netherlands and legacy data in Germany ([DPA](https://www.mailerlite.com/legal/data-processing-agreement), [privacy](https://www.mailerlite.com/legal/privacy-policy), [legal FAQ](https://www.mailerlite.com/legal)).
- **Mailchimp** publishes a DPA and says its own servers are in the US; European transfers rely on its DPF participation and SCC fallback ([DPA](https://mailchimp.com/legal/data-processing-addendum/), [European transfers](https://mailchimp.com/help/mailchimp-european-data-transfers/)).

### Fixed operating rule and switch threshold

1. **Default:** create one Brevo account per product, keep it behind the common email adapter, and use it for both marketing and transactional messages. Required adapter operations are contact upsert/consent, transactional send, suppression, delete/export, and verified webhook ingestion.
2. **Free-plan safety ceiling:** reserve 20% for product mail. Open the paid-capacity issue before the forecast reaches **240 total sends on any day**, before any intended campaign exceeds **240 recipients**, or at **1,600 contacts entering active automations**. Marketing must never consume the reserved transactional capacity.
3. **Provider-switch review:** do not add a second provider merely because Free is exceeded. Reopen the Brevo-versus-Loops decision when Brevo's required all-in monthly quote reaches or exceeds the matching Loops contact tier—currently **$49 at up to 5,000 Loops subscribers**—or a documented legal/technical requirement cannot be met. Switch only when the six-month forecast is at least **30% cheaper** on Loops or its unlimited-send model removes a demonstrated operational bottleneck. These are template heuristics, not vendor guidance.
4. **Delivery evidence rule:** pricing and feature documentation do not prove inbox placement, so this report makes no cross-provider deliverability claim. Before launch, authenticate the domain, use consented/double-opt-in marketing contacts, process bounce/complaint/unsubscribe webhooks, protect transactional reserve, and record sent/delivered/deferred/bounced/complained outcomes. Change provider only from measured authenticated-domain evidence, not testimonials or intuition.

### Bootstrap checks

- Recheck exact contact/send tier, branding, API, webhook, automation, DPA, and region entitlements in the product's country and currency.
- Confirm account/sender approval and complete SPF, DKIM, and DMARC before any production send.
- Test marketing consent, unsubscribe/suppression, bounce/complaint handling, transactional retries, idempotency, Apple private-relay addresses, and deletion/export through the adapter.
- Add spend and quota alerts; fail closed for campaigns while preserving critical transactional mail.
