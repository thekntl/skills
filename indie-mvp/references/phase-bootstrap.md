# Bootstrap Phase

## Contents

- Entry packet
- Validation route
- First frontier
- Repository and tracker
- Long-lead work
- Gate

## Entry packet

Start from four owner inputs:

1. product codename;
2. one-sentence product promise;
3. target market/category;
4. target platform: Apple platform, web, or both.

Accept an owner-supplied icon/logo direction when available. If absent, make icon and identity the first visual frontier; do not block repository and market-account preparation that can proceed safely.

Classify:

- Apple platforms in scope;
- web product, marketing site, or both;
- backendless, uncertain, or clearly server-backed;
- existing category or market-creating hypothesis;
- App Store public launch or public web launch definition.

For Apple products, also request:

- owner-supplied ASO/ASA keyword clusters and known search intents;
- seed competitors and category leaders;
- whether demand validation should happen before the full frontend, in parallel, or after a build-first launch.

Do not invent final keywords for the owner. Record missing clusters as research input and preserve a default acquisition route.

## Validation route

Choose and record one route before opening the full frontend frontier:

- `validate-first`: run the demand-validation gate after minimum bootstrap;
- `parallel`: run demand validation while the default frontend path advances;
- `build-first`: keep the normal phase order and validate through the released product.

Recommend `validate-first` for acquisition-led consumer ideas with material willingness-to-pay uncertainty and a build cost larger than a short demand test. Recommend `parallel` when the product can advance safely without using unsettled test claims. Recommend `build-first` when the product is cheaper and faster to ship than the test, the category evidence is already strong, or the available validation tool does not fit the product.

Read [phase-demand-validation.md](phase-demand-validation.md) for `validate-first` or `parallel`. Keep repository creation, the launch map, honest identity assets, and owner-only account actions ahead of any paid test.

## First frontier

Create a three-to-seven-day route that protects the product promise:

- Day 0–1: identity, repository, master map, target-runtime prototype shell, long-lead accounts.
- Day 1–3: complete frontend behavior and decisions.
- Day 2–5: phase loops, integrations/backend, market evidence, site and acquisition preparation.
- Day 4–7: critical QA, store/web release, support, measurement, first content and controlled campaign readiness.

Start overlapping work when it does not create unresolved implementation decisions. Keep the critical user journey ahead of polish.

For `validate-first`, run a separate three-to-seven-day validation countdown until the owner records `GO` or `BUILD-TO-LEARN`. Start a fresh three-to-seven-day public-product countdown only after that verdict. Do not build the full target-runtime shell merely to stay busy; prepare only the minimum honest funnel assets, measurement, and reversible long-lead work.

For `parallel`, keep both clocks visible: demand evidence may change or stop unsettled work, but it does not silently extend the public-product deadline.

## Repository and tracker

Create one private repository under `thekntl`, using the codename-derived slug after confirming naming does not collide or disclose sensitive information.

Add:

- master launch map from `assets/github/master-map.md`;
- phase issues from `assets/github/phase-issue.md`;
- `CONTEXT.md`, `docs/GLOSSARY.md`, and generated `docs/glossary.html`;
- launch labels and milestones appropriate to the repository;
- fixed stack and hard guardrails in repository agent instructions;
- owner-action issues for credentials, verification, payment, Docker runtime, and other human boundaries.

Suggested labels:

- `phase:bootstrap`, `phase:frontend`, `phase:integrations`, `phase:backend`;
- `phase:validation`;
- `phase:market`, `phase:marketing`, `phase:release`, `phase:post-launch`;
- `decision`, `research`, `ready-for-agent`, `blocked`, `owner-action`;
- `priority:launch`, `post-launch`.

## Long-lead work

Open owner-action issues immediately when applicable:

- Apple Developer and App Store Connect access;
- bundle identifiers, certificates, tax/banking, agreements, app record;
- company Meta/TikTok/AppsFlyer control-plane access;
- product social identities and advertiser assets;
- WorkOS, RevenueCat, PostHog, Sentry, Brevo, GA4, GSC, domain, and DNS access;
- sender-domain authentication;
- FreeScout mailbox and portal configuration;
- legal facts and supported markets/locales;
- product domain and website publication path.

The agent may prepare manifests, copy, asset names, IDs to collect, paused campaigns, and verification plans. Keep owner-only steps explicit.

## Gate

Close bootstrap when:

- identity has an approved codename and usable icon/logo direction;
- launch promise, target market, platforms, deadline, and public definition are visible;
- validation route, clock boundary, and decision gate are visible;
- Apple keyword clusters/search intents are recorded or explicitly marked missing;
- repository and master map exist;
- glossary sources and build command exist;
- for `build-first` or `parallel`, the first frontend phase issue is open and no missing input prevents its first target-runtime prototype;
- for `validate-first` before `GO` or `BUILD-TO-LEARN`, the demand-validation phase issue is open while the frontend phase remains planned/inactive and carries no delivery countdown or prototype-readiness pressure;
- long-lead owner actions and blockers are visible;
- after a validate-first `GO` or `BUILD-TO-LEARN` verdict, start the public-product clock, activate the frontend phase, and then apply its target-runtime readiness gate.
