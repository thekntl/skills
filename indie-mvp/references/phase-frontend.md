# Frontend Phase

## Contents

- Frontend-first gate
- Research
- Target-runtime prototypes
- Acquisition-intent experience
- Fixed Apple paywall
- Required surfaces and states
- Support and review moments
- Figma
- Output contract

## Frontend-first gate

Design the complete owner-visible product behavior before production backend implementation. Use mocks, fixtures, and in-memory adapters. Record every data need, mutation, event, permission, integration, and backend question as downstream work.

Do not make integration or backend choices merely to unblock a visual prototype.

## Research

Before a material design decision:

- use the Mobbin MCP to inspect how relevant products solve the same interaction;
- look beyond category leaders when another product has a stronger solution;
- record query, examples, pattern, source, and adaptation verdict in the phase issue;
- distinguish inspiration from copied branding or protected assets.

Use web research only for gaps Mobbin cannot answer. Keep decisions connected to the user's problem and target-platform conventions.

## Target-runtime prototypes

Use `grilling-frontend-prototyping` and `prototype` when available.

Build and review:

- web in a real browser;
- iOS/iPadOS/watchOS/visionOS in the appropriate simulator or device environment;
- macOS as a native macOS app.

A browser mock of an Apple interface is an exploratory sketch. Recreate it on the actual Apple runtime before approval. When platforms differ materially, approve each separately.

Evaluate typography, safe areas, device/window sizes, navigation, gestures, keyboard/pointer input, system components, accessibility settings, motion, and state transitions.

Before each owner review, explain in Turkish:

- the question;
- the user problem;
- the exact scenario to try;
- what to watch for;
- the verdict needed.

## Acquisition-intent experience

For Apple products, run a dedicated frontend Batch Grill after the owner supplies ASO/ASA keyword clusters or campaign intents. Use [intent-route-matrix.md](../assets/marketing/intent-route-matrix.md).

Plan exactly three launch routes: one default plus the two strongest owner-confirmed, evidence-backed search-intent variants. If the owner cannot confirm two truthful variants, record an explicit launch exception instead of silently weakening the gate or inventing intent. Adding more than three launch routes requires a post-launch decision or a separate owner-approved launch exception.

Each stable `intent_id` may change:

- onboarding copy, examples, imagery, ordering, and first recommended action;
- paywall background video, value framing, verified social proof, marketing labels, and package emphasis;
- Custom Product Page assets and campaign message.

Keep the paywall structure, underlying product truth, entitlement rules, and promised outcome consistent. Changing price, trial, store product, or eligibility by intent is a separate monetization decision, not a presentation variant.

Build variants from shared components and configuration. Do not fork the whole onboarding or paywall into independent implementations.

Prototype each launch variant on the actual Apple runtime. Cover:

- first install opened from an approved Custom Product Page deep link;
- direct/organic launch with no intent;
- invalid, unknown, or retired intent;
- cold, warm, and already-onboarded deep-link arrival;
- attribution arriving late or not at all;
- optional user correction only when the product independently needs a goal selector.

Do not assume the app always receives the Custom Product Page identifier or the user's raw search term. Route from an approved deep link or verified attribution payload when available; otherwise show the default onboarding and paywall without adding an acquisition question.

## Fixed Apple paywall

Use [paywall-variant-matrix.md](../assets/marketing/paywall-variant-matrix.md). The reusable paywall shell contains:

- a muted looping background video with poster, loading, offline, Reduce Motion, and contrast-safe fallback;
- a value-led headline and short outcome explanation;
- a social-proof module that remains hidden until every quote/rating has traceable, approved evidence;
- exactly two choices: weekly and annual;
- localized price, offer eligibility, introductory period, renewal amount/timing, cancel terms, restore, privacy, and terms; keep the total annual charge more prominent than any monthly equivalent;
- one clear purchase action and a non-blocking close path when platform/review rules require it.

Keep one RevenueCat paywall and the same two store products across the default and two search-intent variants. Derive mutually exclusive booleans such as `is_default`, `is_intent_a`, and `is_intent_b`; pass them with approved copy variables and use visibility rules to swap video, proof, and marketing labels without changing the store catalog.

Use broad, accurate, localized App Store Connect display names such as **Weekly Access** and **Annual Access**. A variant may show an additional intent-specific marketing label, but it must not contradict the StoreKit product, duration, price, offer, entitlement, or purchase sheet.

Prototype and test:

- default, intent A, and intent B;
- weekly/annual selected;
- intro-eligible and intro-ineligible;
- video available, loading, failed, Reduce Motion, and offline;
- social proof present and absent;
- Offering and product loading, malformed/missing catalog, retry, and exit;
- purchase pending, cancelled, failed, successful, and already entitled;
- restore running, successful, no entitlement found, and failed;
- VoiceOver reading order and commerce labels;
- Dynamic Type, focus order, localization stress, Reduce Motion, and media/offline recovery.

## Required surfaces and states

Every product includes:

- onboarding;
- authentication and authorization for web when accounts have value;
- paywall and monetization boundary; a paid-download-only or deliberately free launch requires an explicit exception decision;
- product-specific app shell;
- settings;
- help and support;
- about, version, publisher, and legal information;
- core value workflow.

Cover applicable states:

- first use and returning use;
- loading, empty, populated, success, error, validation, retry;
- offline, degraded, permission denied, service unavailable;
- locked/premium, purchase, restore, expired entitlement;
- signed out, signed in, unauthorized;
- accessibility and localization stress cases.

## Support and review moments

Use `/support` on the marketing site as the canonical support destination:

- Apple opens it in an appropriate in-app browser/web view;
- web opens the same route;
- Apple preserves a prefilled native-email fallback;
- safe URL context is limited to product ID, version, build, platform, and locale;
- diagnostic attachment requires a separate explicit action and preview.

Prototype and record these support states on every applicable target runtime:

| Scenario | Required behavior |
| --- | --- |
| Portal request succeeds | Show the case reference/status path and a clear next expectation |
| Validation fails | Preserve safe entered content, identify correctable fields, and keep retry available |
| Device is offline | Explain connectivity without claiming submission; keep retry and native-email fallback visible |
| Portal is unavailable | Preserve context and offer the prefilled native-email fallback |
| Native email is unavailable or unconfigured | Keep `/support`, copy-address/details, retry, and cancel paths usable; never claim that mail was sent |
| Fallback mail opens, sends, or is cancelled | Distinguish composer-opened from sent; return safely without creating a duplicate portal request |

Capture success, validation, offline, portal-unavailable, email-unavailable, fallback, and duplicate-prevention verdicts in the phase issue. Release evidence must prove the final portal/fallback behavior on the actual target.

For iOS/iPadOS, prototype a localized, static, high-priority **Get Support** Home Screen quick action using an appropriate SF Symbol. The system controls color and position.

For Apple apps, define a satisfaction milestone:

- request StoreKit review only after a genuine successful outcome;
- delay it so it does not interrupt the task;
- add cooldown, version, repetition, and negative-context guards;
- treat display as best-effort;
- optionally provide a user-initiated **Rate the App** destination in Settings/About.

Record milestone, eligibility, suppression, request event, and target-runtime scenario.

## Figma

Use the Codex Figma connector for reads and writes. Ask before Computer Use when a needed Figma capability is unavailable.

Move approved explorations to Figma when an editable artifact improves reuse or review. Preserve design tokens and frontend language.

For store screenshots, use owner-provided iOS/iPad/Mac templates when available. Replace designated screen layers, update localized copy and brand values, record template/build/locale, and keep social proof unpublished until real traceable evidence exists.

## Output contract

Close the decision gate when:

- every in-scope surface and meaningful state is testable on each actual target;
- every launch intent has a matrix row, target-runtime evidence, and safe default;
- the owner has recorded verdicts;
- visual tokens, behavior, accessibility, and localization rules are explicit;
- every data, event, adapter, integration, and backend need is linked;
- implementation issues can be completed without a product question.

Then generate the frontend phase loop. Runtime completion requires verified production frontend behavior; prototype approval alone closes only the decision gate.
