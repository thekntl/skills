# Integrations Phase

## Contents

- Gate
- Acquisition-intent router
- Adapter boundary
- Capability defaults
- RevenueCat catalog and paywall
- Measurement and consent
- Verification

## Gate

Start from approved frontend contracts. Decide provider-specific deviations only when the fixed stack cannot satisfy a verified requirement.

Cover:

- product analytics and event taxonomy;
- crash/error reporting;
- RevenueCat paywall, purchase, entitlement, and restore;
- AppsFlyer attribution and deep links;
- product-owned acquisition-intent routing;
- email and support;
- product-specific external services;
- consent, privacy, and settings behavior.

Presentation remains separate from provider connection: frontend owns the experience; adapters own the service.

## Acquisition-intent router

Define a product-owned `AcquisitionContext` and router before connecting Apple or AppsFlyer:

- accept an approved deep link, campaign payload, explicit user choice, or no signal;
- normalize provider values to a stable internal `intent_id`;
- never expose SDK payloads or Custom Product Page IDs to onboarding/paywall logic;
- preserve one deterministic default and reject unknown or retired routes safely;
- persist only the minimum context needed for continuity and experiments;
- let an explicit user choice override an inferred intent;
- prevent late attribution from replacing an onboarding/paywall the user has already meaningfully entered;
- emit route-selected, source, confidence, fallback, onboarding, paywall, and conversion events.

For Apple Custom Product Pages, assign an approved universal link or custom URL to the page and encode the stable intent route in product-owned path/query semantics. Treat the deep link as an entry signal, not proof that every install or later Home Screen launch exposes the originating page. Verify install → App Store **Open**, direct Home Screen launch, re-open, and already-installed behavior on the supported OS.

Use AppsFlyer deferred deep linking for approved external campaigns when current plan and platform behavior support it. Reconcile duplicate Apple/AppsFlyer signals by an explicit priority rule and record attribution uncertainty.

Treat App Store Connect campaign tokens as aggregate measurement, not app-launch routing. For Apple Ads, keep AdServices attribution behind its own adapter and tolerate no-match, delayed, reduced-detail, and expired-token results. Do not block or replace the first-use route while waiting for attribution.

## Adapter boundary

Use an Adapter for every external system:

1. Define a small product-owned capability interface.
2. Keep SDKs, transports, credentials, payloads, and provider errors inside the provider adapter.
3. Map to product-owned models at the boundary.
4. Select adapters in one composition root.
5. Provide a fake/in-memory adapter for prototypes and behavior tests.
6. Test product behavior against the fake.
7. Add focused contract/integration tests for production adapters.

Keep interfaces sized to the MVP. Do not mirror a provider's full API.

Host the adapter on the backend when it needs secrets, privileged APIs, webhooks, scheduled work, shared rules, or orchestration. Keep a required client SDK behind a client-side adapter.

Record:

- capability and owner;
- supported operations;
- input/output models;
- failure mapping and retry/idempotency policy;
- consent purpose;
- fake behavior;
- contract evidence;
- secret location and rotation owner.

## Capability defaults

Use the defaults in [fixed-stack.md](fixed-stack.md):

- PostHog Cloud EU for product analytics;
- Sentry for crash/error reporting;
- RevenueCat for native/web entitlement;
- AppsFlyer for campaign attribution/deep links;
- Brevo for product email;
- shared FreeScout for support;
- WorkOS only when web/shared accounts are meaningful.

Run a focused Grill before sharing one WorkOS identity across Apple and web clients. Recheck current provider entitlements, country availability, SDK compatibility, and plan costs at bootstrap.

## RevenueCat catalog and paywall

When the product uses the default Apple subscription model:

1. Create one Apple subscription group and one RevenueCat entitlement.
2. Map one weekly and one annual store product to that entitlement.
3. Put both products in one default Offering as weekly and annual Packages.
4. Attach one fixed RevenueCat Paywall to the Offering.
5. Normalize the stable `intent_id`, then pass mutually exclusive product-owned boolean/content variables to the paywall.
6. Use Paywall Rules to swap background video, approved proof, value copy, and marketing labels while retaining the same Packages.

Configure:

- weekly: one-week auto-renewable subscription with a three-day free introductory offer;
- annual: one-year auto-renewable subscription with a one-month **pay-up-front** introductory offer, followed by the regular annual renewal.

Do not describe the annual offer as a free trial. Render the exact localized “first month, then annual” terms only when the customer is eligible. Apple allows only one redeemed introductory offer per subscription group; once the customer uses either product's intro, the other intro is unavailable.

Use RevenueCat/StoreKit product and offer variables for price, duration, renewal, and eligibility. Never hardcode localized commerce facts. Show regular terms when the customer is ineligible or eligibility is unknown.

Do not create six same-priced store products solely to rename plans for three intents. App Store Connect product display names are localized store metadata and are not runtime presentation variables. Open a separate monetization decision before adding products for a real price, duration, offer, entitlement, tax, or availability difference.

Recheck current RevenueCat plan and SDK support. If one Paywall cannot reproduce the approved media variants, create `default`, `intent_a`, and `intent_b` Offerings/paywalls that reuse the same two store products, and let the product-owned router select a fetched Offering by identifier. Do not make paid RevenueCat Targeting a launch dependency or activate it without owner approval.

## Measurement and consent

Default useful product analytics/diagnostics to enabled only when market, platform, data design, and documented legal basis permit it:

- collect minimum event data;
- exclude sensitive content and direct identifiers;
- disclose provider, purpose, categories, retention, sharing, and withdrawal;
- provide an effective settings opt-out.

Use one purpose-specific `ConsentCoordinator`. Withdrawal stops corresponding collection and forwarding.

For Apple acquisition:

- default to SKAN/AdAttributionKit and applicable AppsFlyer aggregate privacy paths;
- do not show ATT merely because AppsFlyer, TikTok, or Meta exists;
- request ATT contextually before IDFA access, retargeting, cross-company tracking, or equivalent user-level attribution;
- open a focused decision before enabling those capabilities.

For the marketing site:

- use GA4, not PostHog;
- hold nonessential cookies, storage, pixels, and tags until applicable regional consent;
- keep email enrollment explicit and separate.

App Store approval is not legal compliance. Launch without optional measurement if its permission or market basis cannot be cleared.

## Verification

Decision gate:

- event taxonomy and success metrics are explicit;
- acquisition-intent normalization, precedence, persistence, late-arrival, and fallback behavior are explicit;
- adapters and owners are defined;
- consent and opt-out behavior is specified;
- secrets and owner actions are identified;
- tests and implementation issues are agent-ready.

Runtime gate:

- test-environment events are observable;
- Offering/product loading and unavailable-catalog recovery never invent commerce facts;
- purchases, pending/cancel/failure recovery, restore success/none/failure, entitlements, support, email, attribution, and deep links work when applicable;
- RevenueCat/StoreKit supply current localized price, duration, renewal, offer, and eligibility truth;
- paywall VoiceOver, Dynamic Type, focus, Reduce Motion, localization, and recovery evidence exists on the target runtime;
- every approved intent route and default fallback work on the target runtime;
- opt-out/withdrawal stops the intended flow;
- provider details do not leak into product logic;
- every production adapter has focused evidence.
