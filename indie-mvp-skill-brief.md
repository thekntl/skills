# Indie MVP Skill Brief

Status: canonical runtime skill specification.

## Contents

- Objective
- Launch Timebox
- Solo-Operator Constraint
- Operating Model
- GitHub Native Planning Contract
- Confirmed Authoring Decisions
- Technology Stack Decision Register
- Provider Decision Register
- Decision-to-Execution Boundary
- Communication and Documentation Contract
- Execution-Mode Ask Matt Closeout
- Project Glossary
- Product Bootstrap Gate
- Frontend-First Gate
- Figma Workflow
- Integration Gate
- Infrastructure Baseline
- Backend Gate
- Market Analysis Gate
- Standard Marketing Assets
- Organic and Paid Content Operations
- TikTok-First Paid Acquisition and Learning Gate
- Creative Production Loop
- Marketing Roadmap Visuals
- Fixed Marketing Website Product
- Web-to-App Standard
- App Store and Search Marketing
- Overnight Implementation Gate
- Release and Post-Launch Gates
- Demand Validation and Apple Acquisition Intent

## Objective

Provide one user-invoked entry point that takes an indie product from a codename and product promise to a live, measurable Apple-platform app, web app, or both. Use GitHub Issues as the persistent operational source of truth and resume from the current frontier instead of repeating discovery.

**Plain-English summary:** Start once, remember everything, and keep moving toward launch.

## Launch Timebox

Treat the public-product launch window as a product constraint:

- for `build-first` and `parallel`, start the public-product clock at bootstrap;
- for `validate-first`, run a separate bounded demand-validation clock and do not start the public-product clock or frontend delivery pressure until a recorded `GO` or `BUILD-TO-LEARN` verdict;
- after the public-product clock starts, produce the main product shape within two or three days and put the product in the field within three to seven days;
- prefer the smallest complete end-to-end experience that tests the product promise;
- prefer reversible decisions, managed services, existing templates, and operational simplicity;
- move work that is not required to test the product promise into a clearly linked post-launch backlog;
- maintain a visible launch countdown, critical path, and daily completion target in GitHub Issues;
- start long-lead external work during bootstrap, including account creation, business verification, domain verification, store access, and review-dependent preparation.

For a web product, "in the field" means publicly available at its production URL. For an Apple product, it means publicly available on the App Store; a TestFlight build or App Review submission does not satisfy the launch result. Start App Store work as early as possible. If external review prevents public availability within seven days, record the timebox as missed with a visible external blocker instead of silently weakening the definition.

**Plain-English summary:** Show the real product to real users within one week, and reduce the first release until that is credible.

## Solo-Operator Constraint

Assume one indie developer owns product, engineering, design, marketing, release, and support.

- Prefer industry-standard defaults over product-specific invention when the difference does not test the product promise.
- Optimize architecture and operations for one person's cognitive load and available time.
- Automate repetitive work across setup, testing, content, monitoring, support triage, and reporting.
- Prefer self-service support, automated acknowledgements, searchable help content, reusable replies, and escalation rules.
- Keep dashboards, alerts, and recurring routines small enough for one person to operate.
- Add operational complexity only when current evidence justifies its ongoing ownership cost.

**Plain-English summary:** Build a product that one person can launch, support, and improve without becoming its full-time operator.

## Operating Model

- Use a paved road: apply stable defaults automatically and ask only decisions that materially change the product.
- Keep the top-level skill lean. Load phase-specific instructions only when that phase becomes active.
- Treat GitHub Issues as the canonical record for decisions, research, tasks, bugs, dependencies, and links to code or artifacts.
- Store code and substantial artifacts in the repository; link them from their canonical issue.
- Work through phase gates. Do not advance until the active gate has a checkable completion result.
- Keep implementation moving; use Wayfinder-style decision maps only for genuinely unclear decision clusters.
- Resolve scope conflicts in favor of the launch timebox and the product's smallest testable promise.

**Plain-English summary:** Follow a standard route, record the work, and pause only at real crossroads.

## GitHub Native Planning Contract

Use every applicable native GitHub planning feature. Native metadata is canonical; body links may explain but never replace issue type, labels, confirmed assignee, parent/sub-issue, blocked-by/blocking, milestone, Project membership, linked pull request, or close state reason.

Use this hierarchy:

1. `Product Launch Map` is the parentless root.
2. Phase issues are its native sub-issues.
3. Decision, research, implementation, defect, and owner-action issues are native sub-issues of their owning phase.

Use blocking relations only for real prerequisites. Create related issues first, wire all native relations second, then read every affected issue back. Do not mark the tracker ready or place affected work in `ready-for-agent` when an applicable mutation or readback fails.

Use milestones for dated outcomes, not components:

- `validate-first`: create `Demand validation — YYYY-MM-DD`; create `MVP public launch — YYYY-MM-DD` only after `GO` or `BUILD-TO-LEARN`.
- `build-first` or `parallel`: create `MVP public launch — YYYY-MM-DD` at bootstrap.
- Create `Post-launch stabilization — YYYY-MM-DD` only for committed scope and date.
- Leave indefinite backlog unmilestoned. Never create Website, Creative, Backend, or other component milestones.

Default to one `<PRODUCT> — MVP Launch` Project when there are at least six planned issues, multiple workstreams or repositories, or a shared dashboard is useful. Keep product, website, backend, creatives, release, and post-launch in this one Project; represent them with hierarchy, workstream metadata, and views. Skip Projects only for one map plus at most four child issues in one repository and document why. Split only at a durable ownership, access, cadence, backlog, or workflow boundary. Use a portfolio Project only for multiple independent products or teams.

Add every launch issue and pull request explicitly; do not rely on Project auto-add. Use native fields plus one Project Status and the minimum useful views. Inspect capabilities first, prefer the connected GitHub integration for supported mutations, fall back to current `gh`, then current REST or GraphQL. Fail closed rather than silently degrading to body-only links.

**Plain-English summary:** Build one verified native issue graph and one useful launch dashboard, not several disconnected lists.

## Confirmed Authoring Decisions

Batch Grill round 1 established these template decisions:

1. Use manual next-skill handoffs for user-invoked skills such as Ask Matt; do not alter their global invocation metadata.
2. Use one monorepo per product.
3. Require public App Store availability for an Apple product to count as in the field.
4. Generate and run a separate phase-scoped implementation loop after each phase's decisions and issues become agent-ready.
5. Use fixed, platform-specific technology stacks. Select those stacks while authoring this skill, then do not reopen them per product.
6. Use staged publishing automation: approve initial examples, then automate recurring organic publishing; retain owner approval for new paid campaigns and budget changes.
7. Create product repositories under the GitHub user `thekntl` and make them private by default. Prefer the connected GitHub integration; the connector has been verified with administrative access to existing `thekntl` repositories. Do not treat sandboxed CLI authentication failure as proof that the host or connector is logged out.
8. In week one, require the marketing site, measurement, support entry, social accounts, first content, and first campaign to be ready or live; also verify the review-request path and prepare the truthful social-proof template.
9. Keep Indie MVP explicitly user-invoked with `policy.allow_implicit_invocation: false` in `agents/openai.yaml`. Keep `SKILL.md` frontmatter limited to the fields accepted by the current official Skill Creator validator; do not add legacy invocation metadata.

Round 3 selected Brevo as the free-first email default and FreeScout as the shared self-hosted support platform. Their reusable infrastructure remains blocked until the documented owner-verification contract passes; do not repeat the provider comparison for every product.

**Plain-English summary:** The operating model is settled. Email and support now have preferred directions, but their final low-cost implementations still need one evidence check.

## Technology Stack Decision Register

Round 2 currently has these states.

### Confirmed

- Build Apple clients natively with Swift and SwiftUI.
- Set Apple platform minimums to the version 26 generation and design for Liquid Glass. Do not add pre-26 compatibility during the MVP; reconsider older versions only from later market evidence.
- Use SwiftData for local Apple persistence. Add CloudKit only when the product is expected to work across multiple devices or cross-device synchronization is part of the product promise.
- Use `pnpm` and Turborepo for repository-level task orchestration. When Go modules are present, use a Go workspace alongside it and expose Go checks through stable repository tasks.
- Build server-backed web products and server-side application services in Go.
- Use a `net/http`-compatible `chi` router, render web-product pages with `templ`, and enhance them with HTMX. Every public or indexable route must return useful server-rendered HTML at a stable URL; HTMX fragment responses are an enhancement, not the only representation.
- Build the separate content-heavy marketing website with Astro static output and content collections. Astro is selected for the reusable multilingual landing-page, article, sitemap, and content-production workflow, not because Go-rendered HTML is inherently bad for SEO.
- Keep the existing WordPress Multisite separate from the new-product paved road. Do not create new product marketing sites or install a second support system there by default. Reconsider WordPress as an optional headless editorial source or full replacement only through a separate staging-first decision that proves lower total operating cost, safe network upgrades, restore, automation, performance, localization, SEO, and design parity.
- Keep React and Next.js out of the default stack.
- Use normal HTML form and HTMX endpoints for the web interface. Expose a separate versioned JSON REST contract described by OpenAPI 3.1 for Apple clients and external integrations. Generate the Swift client with Apple's Swift OpenAPI Generator so the Apple app does not depend on web-fragment endpoints.
- Use one shared production PostgreSQL installation with a separate database and least-privilege login role per product, plus a completely separate staging PostgreSQL installation.
- Use `pgx` as the PostgreSQL driver, `sqlc` for type-safe Go query generation, and `goose` for versioned SQL migrations.
- Permit embedded SQLite only for an explicitly single-instance, low-write, low-risk service. Do not make self-hosted libSQL or the newer Turso database engine part of the fixed default stack.
- Use Tailwind CSS with shared design tokens and no default JavaScript UI framework for both Go-rendered product interfaces and Astro marketing sites.
- Do not add Coolify or another privileged deployment control plane during the MVP system rollout. Keep the existing production Swarm unchanged and reconsider a management UI only as a separate, staging-first infrastructure project.

Primary-source findings and the complete recommendation are recorded in [`research/web-stack-and-data-topology.md`](research/web-stack-and-data-topology.md).
The WordPress alternative is evaluated in [`research/wordpress-multisite-evaluation.md`](research/wordpress-multisite-evaluation.md).

**Plain-English summary:** The fixed Apple, web, marketing, database, styling, and Go persistence stacks are settled.

## Provider Decision Register

Rounds 3 and 4 currently have these states.

### Confirmed

- When a web product genuinely requires accounts, use WorkOS AuthKit Hosted UI with the official Go SDK behind product-owned identity and session interfaces. Do not add authentication to a product that has no meaningful account-based feature.
- When one product has both web and Apple clients and should expose one shared user account, use WorkOS as the default shared identity system. This is a conditional default, not an automatic implementation decision: run a focused Batch Grill before building the cross-platform account flow and confirm that shared identity is actually required.
- Use PostHog Cloud EU for product analytics and Sentry for crash and error reporting. Keep the separate Astro marketing site on GA4 rather than PostHog.
- Use AppsFlyer OneLink and Unified Deep Linking for campaign routing and deferred deep links. Validate current plan access and partner settings at product bootstrap.
- For the custom web-to-app route, use an Astro two- or three-step funnel with the RevenueCat Web SDK, RevenueCat Billing, and Stripe. Keep RevenueCat Web Purchase Links as the emergency fast-launch fallback.
- Use one Brevo account per product for email marketing and remaining product transactional email. Protect transactional capacity, authenticate the sending domain, and reopen cost only at the documented quota or six-month cost threshold.
- Run FreeScout as one shared support platform, with a staging counterpart for upgrades and restore validation. Give each product its own mailbox and portal configuration. Connect FreeScout to a dedicated database and least-privilege role in the shared PostgreSQL installation, and preserve its application state separately.
- Use the free WorkOS-hosted authentication domain during MVP validation. Buy a custom authentication domain only with explicit owner approval after measured trust, conversion, or branding evidence justifies the recurring cost.
- Start every provider on a free plan when a viable free plan exists. No agent may start a paid plan, add a payment method, buy an add-on, or upgrade a subscription without explicit product-owner approval. Treat this as a hard cost guardrail, not a suggestion.
- Let the agent create and configure external-service resources when an approved connector supports the operation. The product owner retains legal-identity declarations, contracts or terms requiring personal assent, billing details, payment authorization, MFA, and any secret that cannot be delegated safely.

Primary-source findings are recorded in [`research/provider-stack.md`](research/provider-stack.md).

**Plain-English summary:** WorkOS, PostHog, Sentry, Brevo, FreeScout, web checkout, campaign routing, free-first costs, and external-service authority are settled defaults.

## Decision-to-Execution Boundary

Separate decision work from unattended production implementation:

- Use research, Batch Grill, platform-native prototypes, and architecture work to resolve the product's decisions first.
- Treat prototype code as a decision artifact unless its canonical issue explicitly promotes a production rewrite.
- Convert every approved outcome into an implementation issue with acceptance criteria, dependencies, test expectations, affected surfaces, and links to its decision evidence.
- Mark an issue ready for agents only when an implementation agent can complete it without asking a product question.
- Keep unresolved, provisional, research-dependent, credential-dependent, approval-dependent, and human-runtime work outside the unattended queue.
- At the end of each phase, generate a phase-scoped unattended implementation loop when that phase's in-scope decisions are confirmed or deliberately deferred and its remaining frontier consists entirely of agent-ready implementation issues.
- Do not wait for later marketing or release decisions when the completed frontend, integration, or backend phase can be implemented safely.
- Keep future-phase issues and any unresolved cross-phase dependency outside the active loop.

Runtime-oriented phase completion criteria are verified by the implementation loop and release validation; they do not require production code during the earlier decision session.

**Plain-English summary:** Finish deciding what to build, turn those decisions into self-contained tickets, and only then let agents implement them unattended.

## Communication and Documentation Contract

- Communicate with the product owner in Turkish.
- Write source code, identifiers, commits, documentation, research, GitHub issues, and GitHub comments in English.
- End every GitHub issue and substantive issue comment with:

  ```markdown
  ## Plain-English summary

  <Explain the practical meaning in simple, non-technical English.>
  ```

- Explain human decisions in simple language even when the underlying tracker material is technical.
- During Batch Grill rounds:
  - ask every currently unblocked decision together;
  - number the questions;
  - phrase each question in simple Turkish;
  - provide three materially different viable options when the decision space supports them;
  - give a concise advantage and disadvantage for each option;
  - mark the recommended option and explain why it best fits the current product and launch timebox;
  - allow a free-form answer when none of the options fit;
  - summarize the expected later rounds;
  - recompute those rounds after each answer;
  - research discoverable facts instead of asking the product owner.
- Record every answer with one of these decision states:
  - `confirmed`: the product owner is comfortable treating it as settled;
  - `provisional`: proceed with the selected assumption, but revisit it before closing the session;
  - `research-needed`: a factual or highly technical dependency must be investigated before asking for a durable decision.
- Infer `provisional` when the product owner expresses uncertainty, relies on intuition, or cannot evaluate the trade-offs. State that interpretation in Turkish instead of silently treating the answer as final.
- Keep a session-level uncertainty register containing the question, provisional choice, reason for uncertainty, cost of changing later, and the latest safe reevaluation point.
- After the normal frontier becomes empty, run a mandatory reevaluation round:
  - show every provisional decision together;
  - summarize what was learned after the original answer;
  - explain whether later decisions increased or reduced its risk;
  - recommend confirming, changing, researching, or deliberately deferring it;
  - close the session only after the product owner confirms the resulting decision states.
- When presenting a prototype, state in Turkish:
  - the question being tested;
  - the problem it is intended to solve;
  - the exact scenario the product owner should try.

**Plain-English summary:** Internal work is precise English; conversation with the product owner is clear Turkish, and uncertain answers remain visible until they are deliberately confirmed.

## Execution-Mode Ask Matt Closeout

For interactive or human-in-the-loop work, consult the installed `ask-matt` skill after every major work boundary, including:

- completion of a substantial implementation;
- creation of a pull request;
- completion of every Batch Grill or other grilling session after its reevaluation round;
- completion of a major phase gate or other deliverable that changes the tracker frontier.

Run the closeout after completion evidence and tracker state are current. Give Ask Matt the active product destination, current phase, completed artifact, unresolved blockers, and available frontier. Ask:

1. Where are we now?
2. What is the next operation?
3. What exact prompt should the product owner use next?

Append the answer to the bottom of the canonical completion issue comment, pull-request handoff, or grilling resolution using:

````markdown
## Ask Matt handoff

### Current state

<Concise assessment>

### Next operation

<The next skill, flow, ticket, or action and why>

### Next prompt

```text
<A ready-to-use prompt>
```
````

Surface the same three-part handoff at the bottom of the Turkish user-facing completion message. Keep the tracker version in English.

The MVP skill must make Ask Matt reachable as a manual closeout dependency without changing Ask Matt's own invocation metadata. At every interactive boundary, provide the product owner with the exact Ask Matt invocation and a ready-to-use prompt, pause the next interactive operation until the returned guidance is available, and then append the result to the canonical record.

During an autonomous implementation loop, do not invoke Ask Matt per implementation or pull request and do not pause otherwise eligible work for it. At final stop, put one prominent reminder in the morning report with the current state, recommended next operation, and exact Ask Matt prompt. The returning owner runs it before selecting the next human-directed operation.

Ask Matt never overrides a real blocker, unresolved owner decision, prohibited action, or safety stop.

**Completion result:** Interactive work records Ask Matt's recommendation before the next operation; autonomous work finishes its safe frontier and leaves the returning owner one exact Ask Matt reminder.

**Plain-English summary:** Every major finish ends by showing where the product stands and giving the exact prompt that starts the right next step.

## Project Glossary

Use `grill-with-docs` and `domain-modeling` throughout decision sessions to maintain a shared language.

Keep two canonical Markdown sources:

- `CONTEXT.md`, or the contexts linked by `CONTEXT-MAP.md`, for product-specific domain language only;
- `docs/GLOSSARY.md` for non-domain technical, design, marketing, analytics, infrastructure, and operational terms that the product owner needs while working on this project.

Each term lives in exactly one canonical Markdown source. Keep definitions in concise, simple English. Record the preferred term, a one- or two-sentence definition, and aliases or discouraged alternatives when useful.

During a decision session:

- challenge conflicting or overloaded domain terms immediately;
- propose a precise canonical term for fuzzy product language;
- update the relevant Markdown source as soon as a term is resolved;
- add a relevant non-domain term when the product owner flags it as unfamiliar or when understanding it is necessary for an upcoming decision;
- keep implementation specifications and decision history out of term definitions;
- use ADRs separately for hard-to-reverse, surprising trade-off decisions.

Generate one self-contained, browser-readable `docs/glossary.html` from the canonical Markdown sources. The HTML is derived output and must not be edited directly.

The generated glossary must provide:

- instant client-side search;
- alphabetical browsing;
- filtering by domain context or operational category;
- preferred terms, definitions, aliases, and discouraged terms;
- stable anchors so a specific term can be linked;
- simple responsive styling;
- offline use without a backend or build server;
- a visible generation timestamp and links to the canonical Markdown sources.

Provide a deterministic glossary build command and an up-to-date check. Regenerate the HTML whenever a glossary source changes. Include the check in normal verification and the overnight implementation preflight.

Before closing a Grill session:

1. capture every resolved term;
2. regenerate and verify `docs/glossary.html`;
3. link the glossary from the canonical grilling resolution;
4. complete the uncertainty reevaluation round;
5. run the mandatory Ask Matt closeout.

**Completion result:** The agent has precise canonical language, the owner can search the same language in a browser, and generated HTML matches the Markdown sources.

**Plain-English summary:** Keep the product's vocabulary accurate for agents and publish the same vocabulary as a simple searchable page for the owner.

## Product Bootstrap Gate

Require:

- project codename;
- one-sentence product promise;
- target: Apple ecosystem, web, or both;
- target market;
- initial icon or logo direction;
- GitHub repository and issue-tracker structure.

Supported Apple targets include current and future Apple platforms such as iOS, iPadOS, macOS, watchOS, and visionOS. An Apple app may be backendless or backend-backed.

**Completion result:** The repository exists, the product identity is usable, and the first frontend decision is on the tracker frontier.

## Frontend-First Gate

- Research relevant and adjacent interaction patterns through Mobbin before making design decisions.
- Use `grilling-frontend-prototyping` for every visual or interaction decision that cannot be evaluated reliably in words.
- Build and evaluate each prototype in its actual target platform:
  - browser for web;
  - a native macOS app for macOS;
  - the appropriate Apple simulator or device environment for iOS, iPadOS, watchOS, and visionOS.
- Treat a browser-rendered mock of an Apple-platform interface as an exploratory sketch, not an acceptable prototype verdict. Recreate and approve it on the target Apple runtime before recording a design decision.
- When a product targets more than one platform, prototype and approve every materially different platform presentation separately.
- Evaluate actual platform behavior, including typography, safe areas, window or device dimensions, navigation, gestures, keyboard or pointer input, system components, accessibility settings, and meaningful state transitions.
- Use the `prototype` approach for throwaway decision artifacts and preserve the resulting verdict in the canonical issue.
- Design the entire frontend independently of production backend services using mocks or in-memory state.
- Record every discovered data need, mutation, integration event, and backend question as deferred tracker work.
- Cover every meaningful screen state, including applicable loading, empty, success, error, permission, offline, and locked/premium states.

Baseline surfaces:

- onboarding;
- authentication and authorization for web apps;
- paywall;
- product-specific app shell;
- settings;
- help and support;
- about, version, publisher, and legal information;
- product-specific core workflows.

### Shared Support Entry

Use one support system across the product and its marketing website instead of building separate short-term support backends.

- The canonical support entry lives at `/support` on the product's marketing website.
- At launch, connect that route to the product's mailbox and customer portal in the shared FreeScout service so customers can submit, reply to, and inspect support requests.
- Apple apps open that support route in a platform-appropriate in-app browser or web view.
- Web apps open the same support experience directly.
- Preserve a prefilled native-email path for Apple platforms as a fallback when the portal is unavailable. The message template should include the product and app version automatically, offer optional diagnostic context with user consent, and never place secrets or sensitive user data in the message.
- Pass only documented non-sensitive context to `/support`: product identifier, app version, build, platform, and locale. Do not place email, name, product content, raw analytics identifiers, tokens, secrets, or user-entered data in support URLs.
- Keep FreeScout customer authentication email-link based during the MVP; do not couple it to WorkOS or product authentication.
- Collect diagnostics only after a separate, explicit user action. Show what will be attached, redact identifiers and content by default, and let the user cancel.
- Keep provider, SMTP, routing, acknowledgement, and ticket-state details behind the support adapter so the standard frontend flow survives a later provider change.
- Prototype and verify success, validation, offline, email-unavailable, portal-unavailable, and fallback states.

For iOS and iPadOS, include a localized **Get Support** Home Screen quick action that launches or resumes the app directly at the support route. Make it a static, high-priority app-defined action so it is available before first launch. Use an appropriate SF Symbol. Do not promise a red style, a specific position beside the system's Remove App action, or an emoji: the system controls the menu presentation, and Apple's Human Interface Guidelines advise using a monochrome interface symbol instead of emoji.

**Plain-English summary:** Product support has one FreeScout-backed web home, while native email remains available when that portal cannot be reached.

### Satisfaction and App Store Review Moment

For every Apple app, define one or more product-specific **satisfaction milestones** during frontend discovery. A milestone is a successful outcome that gives the user a fair basis for reviewing the product.

- Request an App Store rating or review through the current StoreKit review-request API only after a qualifying milestone.
- Delay the request so it does not interrupt the completed task.
- Apply product-appropriate repetition, cooldown, app-version, and negative-context guards.
- Treat the request as best effort: the operating system decides whether to display it, and the product must work normally when it does not appear.
- Do not ask immediately after launch or make the review request the direct result of a review button.
- Provide a separate user-initiated **Rate the App** destination in Settings or About when appropriate; this may open the App Store review page.
- Record the milestone, eligibility rules, request event, suppression rules, and verification scenario in the canonical issue. Do not claim that the app can observe the rating the user submitted.

Prototype the milestone and its surrounding states on the actual Apple target. Explain what timing is being tested and which successful user journey the owner should complete before judging it.

**Plain-English summary:** Ask for a review after the product has genuinely helped the user, without interrupting them or pretending the prompt is guaranteed to appear.

**Completion result:** Every in-scope screen and meaningful state is testable and approved in each actual target environment, decisions are recorded, and downstream service contracts are identified.

**Plain-English summary:** Judge an iPhone design on an iPhone simulator, a Mac design as a Mac app, and a web design in a browser so implementation does not reveal avoidable visual differences later.

## Figma Workflow

Use the installed Codex Figma integration as the primary path for Figma reads and writes.

- Move frontend explorations into Figma when an editable design artifact improves review or reuse.
- Use product brand tokens and approved frontend decisions as the design source.
- Prefer the Codex Figma integration over controlling the Figma desktop interface.
- Ask the product owner before using Computer Use when the required Figma capability is unavailable through the integration.

For App Store screenshots:

- use the product owner's reusable Figma templates when provided;
- support at least the provided iOS, iPad, and Mac templates;
- capture the approved app screen in its target runtime;
- replace the designated screenshot layer in the Figma template;
- update background, copy, localization, and other template-controlled values through the Figma integration;
- include a reusable social-proof frame or module in the template;
- populate social proof only with verifiable ratings, review excerpts, or permissioned testimonials, preserving source, locale, date, and approval evidence;
- never fabricate a rating, review, user identity, or implied endorsement;
- keep the social-proof module unpublished at first launch when qualifying evidence does not yet exist, and create a post-launch issue to activate it after evidence is available;
- export the required platform sizes and record the source Figma file, template version, locale, and app build in the canonical asset issue.

**Plain-English summary:** Reuse editable Figma templates and add honest social proof as soon as real ratings or reviews exist.

## Integration Gate

The skill standardizes shared integration rules. Batch-grill only product-specific deviations.

- Product analytics and event taxonomy
- RevenueCat for monetization and paywalls
- AppsFlyer for marketing measurement and attribution
- Crash and operational telemetry
- Consent and privacy handling

Keep presentation and service connection separate: design paywall and consent experiences during frontend work, then connect providers during integration.

### Mandatory Adapter Boundary

Use the Adapter design pattern for every external system integration, including payment, analytics, attribution, backend services, marketing services, support systems, email providers, and product-specific third-party APIs.

- Define a small product-owned interface for the capability the product needs.
- Put provider SDKs, transport details, credentials, payloads, and provider-specific errors inside a provider-specific adapter.
- Map provider data into product-owned models at the adapter boundary.
- Select and configure the concrete adapter in one composition root.
- Provide a fake or in-memory adapter implementing the same interface for prototypes and automated tests.
- Test product behavior against the fake adapter.
- Add focused contract or integration tests that verify each production adapter against its provider boundary.
- Keep the interface sized to the MVP use case instead of mirroring the provider's complete API.
- Record adapter ownership, supported operations, failure mapping, and test evidence in the canonical integration issue.

Prefer backend-hosted adapters when an integration uses secrets, privileged APIs, webhooks, scheduled work, shared business rules, or cross-provider orchestration. Keep a platform SDK in the client only when the capability requires client execution, and place that SDK behind a client-side adapter.

**Plain-English summary:** The product speaks its own language; each outside service gets a small translator that can be replaced and tested safely.

### Consent and Tracking Baseline

The owner's preferred operating posture is to enable useful measurement by default and expose understandable opt-outs in product settings. Apply that posture only inside these mandatory boundaries:

- Product analytics and diagnostics may start enabled when the product's markets, data design, platform rules, and documented legal basis permit it. Collect the minimum event data, exclude sensitive content and direct identifiers, disclose the behavior precisely, and provide an effective settings opt-out.
- Privacy-policy, terms, App Store privacy labels, and in-product explanations must accurately describe each provider, purpose, data category, retention rule, sharing destination, and withdrawal path.
- A disclosure is not a substitute for permission where prior permission is required. Request App Tracking Transparency authorization before accessing IDFA or performing tracking as Apple defines it. Do not enable personalized advertising, cross-company tracking, or equivalent user-level attribution merely because it appears in the privacy policy.
- Do not show ATT merely because AppsFlyer, TikTok, or Meta measurement exists. Default Apple acquisition measurement to privacy-preserving aggregate paths such as SKAN/AdAttributionKit and AppsFlyer's applicable aggregate privacy mode. Open a focused product decision only when a campaign genuinely needs IDFA, retargeting, or cross-company user-level tracking; request ATT contextually before enabling that capability.
- On the marketing website, keep non-essential cookies, storage, pixels, and tags disabled until the applicable regional consent requirement is satisfied. Keep email-marketing enrollment separate and explicit.
- Route every provider through a product-owned, purpose-specific `ConsentCoordinator`. A denied or withdrawn purpose must stop the corresponding collection and forwarding.
- Run a market-specific privacy preflight before release. App Store acceptance does not establish legal compliance. If optional measurement cannot be cleared in time, launch the product without that optional measurement rather than delaying the core product or silently enabling it.

Primary-source platform and provider constraints are recorded in [`research/provider-stack.md`](research/provider-stack.md).

**Plain-English summary:** Measure aggressively where it is allowed, explain it clearly, and provide opt-outs—but never use a privacy-policy paragraph to bypass a permission the platform or market requires first.

**Decision completion result:** Provider choices, product-owned interfaces, adapter responsibilities, measurement events, consent handling, test strategy, and agent-ready implementation issues are recorded with no unresolved product decision.

**Runtime completion result:** Required providers work end to end in a test environment, measurement events can be verified, provider details remain behind adapters, and each adapter has test evidence.

## Infrastructure Baseline

Use the existing self-hosted infrastructure as the default backend and integration deployment target:

- one server dedicated to storage;
- one production Docker Swarm cluster consisting of three servers;
- one server dedicated to staging;
- access from the owner's development machines through configured Docker CLI contexts.

Apply these rules:

- Evaluate the existing infrastructure before proposing another hosting platform.
- Prepare backend services and server-side adapters for staging first, then prepare the production Swarm release after the owner verifies staging.
- Keep production workloads off the storage-only server; access storage through an explicit storage adapter and approved network boundary.
- Keep credentials, private keys, tokens, and secret values out of GitHub Issues, repository files, logs, and user-facing summaries. Record only the approved secret location and rotation owner.
- Capture deployment configuration, service ownership, health checks, resource limits, rollback procedure, persistence needs, backup expectations, and test evidence in canonical infrastructure issues.
- Consider alternative infrastructure only when evidence shows the baseline cannot meet an MVP requirement for capacity, availability, latency, regional placement, security, compliance, provider compatibility, or operational simplicity.
- When the baseline is insufficient, open a decision ticket comparing three viable options, their migration cost, and their effect on the three-to-seven-day launch timebox.

### Hard Docker Runtime Guardrail

Treat every Docker, Docker Compose, Docker context, Docker API, and Docker Swarm runtime operation as human-executed.

- The agent may create and edit Dockerfiles, Compose files, Swarm stack YAML, configuration templates, deployment plans, rollback plans, and exact operator checklists.
- The agent may perform static file validation that does not invoke Docker.
- The agent must not execute Docker commands, change or inspect Docker contexts, query remote nodes or services, read runtime logs through Docker, deploy a stack, update a service, restart a workload, or control Docker Desktop.
- Hand the owner the preflight checks and commands required for staging or production. Continue after the owner supplies the resulting output.
- Keep Docker publishing as an explicit human-in-the-loop release ticket because the shared servers host other live products.

Do not make Coolify part of the production baseline while its official Docker Swarm support remains experimental. If the owner wants to evaluate it:

- create a separate infrastructure decision and staging-pilot plan;
- inspect registry, ingress/proxy, overlay-network, persistent-volume, backup, rollback, and existing-service coexistence requirements before installation;
- keep the pilot away from the live production Swarm until the owner accepts the migration and rollback evidence;
- treat every Coolify action that changes a container, network, volume, proxy, database, or deployment as a Docker runtime action under the same human-only guardrail;
- never use a Coolify API or interface to bypass the prohibition on agent-executed Docker operations.

The staging server's orchestration mode, context names, container registry, ingress, secrets management, observability, backup, and disaster-recovery setup remain discovery items supplied or executed by the owner.

**Plain-English summary:** Prepare safe deployment artifacts for the five existing servers, while the owner remains the only person who runs Docker against live infrastructure.

### Shared Platform Foundation

Maintain the reusable infrastructure package outside an individual product's three-to-seven-day launch:

- one source manifest for the shared PostgreSQL and FreeScout service shape, plus separate staging and production value contracts;
- owner-reviewed immutable PostgreSQL and FreeScout references promoted only after staging evidence;
- database, role, migration, backup, restore, monitoring, resource, upgrade, and rollback runbooks;
- one shared FreeScout production service and a staging counterpart connected to separate PostgreSQL databases and roles;
- durable FreeScout application storage, ingress, mail connectivity, secrets contract, backup, restore, upgrade, and rollback artifacts;
- static validation and an owner-executed staging acceptance checklist for every generated manifest.

The agent generates and maintains the manifest, separate non-secret environment examples, machine-readable foundation-evidence contract, validation scripts, and exact operator guide. `scripts/validate-shared-platform.mjs` must statically reject unresolved runtime-ready values, mutable image references, architecture/major/persistence mismatches, disputed TLS keys, invalid readiness transitions, and missing GitHub evidence. `STAGING_VERIFIED` must bind the complete staging deployment contract; `PRODUCTION_READY` must carry its own issue, owner approval, and complete production deployment-contract hash while matching the owner-approved staging manifest and compatibility fingerprint, including exact images, architectures, PostgreSQL major/persistence, FreeScout setup/scheduler/update contract, primary-source review, secret-file behavior, and isolated restore. Each deployment-contract hash is generated while the values remain blocked and excludes only the readiness state and evidence URL, preventing a self-referential promotion hash while still binding every runtime-relevant value. The validator never invokes Docker. The owner performs every Docker/Swarm runtime operation and returns the results.

The authored foundation remains `BLOCKED_OWNER_VERIFICATION`: current primary sources do not establish a complete current FreeScout 2.2.1 digest, a tested FreeScout/PostgreSQL major matrix, or an unambiguous Nfrastack PostgreSQL TLS variable. Do not guess those values. Do not mark the foundation `STAGING_VERIFIED` until the owner proves the exact image/architecture/module set, version-aware PostgreSQL persistence, secret-file behavior, scheduling, proxy/TLS, mail, and an isolated database-plus-`/data` restore. Do not mark it `PRODUCTION_READY` until reviewed production evidence exists. The dated evidence is in `research/shared-platform-infrastructure.md`.

Once this foundation exists, a product launch must not reinstall PostgreSQL or FreeScout. Product-specific work is limited to:

- creating or assigning the product database and least-privilege role;
- creating the FreeScout mailbox, portal route, product branding, locale, access, mail connection, and approved modules;
- connecting the product's `/support` route and safe context handoff;
- recording non-secret IDs, test evidence, owner-only secrets, and rollback instructions.

Automate product provisioning only through a documented, tested provider API operation. When FreeScout exposes no supported API for a required setting, generate a short owner checklist instead of controlling its UI or modifying its database directly.

**Plain-English summary:** Install and prove the shared database and support platform once; each new product only receives isolated configuration inside those services.

## Backend Gate

- Close the gate immediately when the product needs no backend.
- Otherwise derive the backend from recorded frontend contracts and integration requirements, then deploy it on the infrastructure baseline.
- Decide data, identity, synchronization, permissions, operations, security, and administrative needs only to the depth required by the MVP.

**Decision completion result:** Every approved frontend contract has a backend design or an explicit backendless resolution, infrastructure requirements are known, and all implementation work is agent-ready or marked as human-run.

**Runtime completion result:** Every approved frontend contract has a working implementation, owner-supplied staging verification is recorded, the production deployment path is known, and no unresolved backend blocker remains.

## Market Analysis Gate

Classify the product as:

- creating or reframing a market; or
- competing in an existing category.

For an existing category, separate competitor selection from competitor evidence:

1. The product owner defines the category, product direction, seed competitors, and known market leaders.
2. The agent uses Astro, Kickstart, category evidence, and adjacent-market research to suggest potentially missed competitors.
3. The product owner confirms the competitor shortlist. Treat additions as recommendations until confirmed.
4. The agent performs the full evidence-gathering and pain-point analysis for every shortlisted competitor.

Research each shortlisted competitor across accessible sources such as:

- App Store reviews;
- Facebook and Instagram discussions;
- X/Twitter posts and replies;
- Reddit;
- specialist and general forums;
- public communities, review sites, and other relevant user-generated sources.

For each piece of evidence, record the competitor, source, URL, date, locale, user context when available, pain point or desired outcome, severity signal, workaround, and whether the evidence is direct or inferred. Use short excerpts only when they materially preserve meaning.

Synthesize the evidence by:

- clustering recurring pain points without erasing meaningful differences;
- estimating frequency, severity, recency, affected persona, and confidence;
- separating product gaps, usability friction, reliability failures, pricing objections, trust barriers, support failures, and unmet outcomes;
- recording what users praise so product table stakes are not mistaken for differentiation;
- mapping evidence-backed opportunities to product decisions and backlog issues;
- marking source-access and coverage gaps explicitly.

Optimize the investigation for the launch timebox by researching the confirmed market leaders first, then expanding until additional sources stop producing material new pain-point categories.

For Apple-platform products:

- create or inspect the product in both Astro and Kickstart during market analysis;
- use the Astro MCP and Kickstart MCP as the required access paths;
- use those tools for relevant market, competitor, ASO keyword, and ASA keyword evidence;
- leave final broad keyword selection with the product owner;
- ask the product owner before using Computer Use when a required Astro or Kickstart MCP capability is unavailable;
- record the tool, query, market, locale, date, and result link or artifact in the canonical research issue.

**Completion result:** The product owner has confirmed the competitor shortlist, every shortlisted competitor has traceable multi-source evidence or an explicit coverage gap, recurring pain points are prioritized, and evidence-backed opportunities are linked to affected product work.

**Plain-English summary:** The owner chooses who matters; the agent finds what those competitors' users repeatedly struggle with and turns that evidence into product opportunities.

## Standard Marketing Assets

Every product requires:

- a dedicated Instagram brand account;
- a dedicated TikTok brand account;
- configured Meta and TikTok advertising infrastructure;
- a separate marketing website;
- organic social content operations;
- paid creative production;
- campaign measurement and attribution.

Use this fixed ownership topology:

- one company-owned Meta Business Portfolio, TikTok advertiser Business Center, and AppsFlyer advertiser account;
- per product: one Facebook Page, Instagram Business account, TikTok Organization Account or linked Business Account fallback, one Meta ad account, one TikTok advertiser account, and the required product measurement assets;
- per product web journey: one Meta dataset/pixel and one TikTok Pixel, with browser and backend events deduplicated;
- per distributed app: one AppsFlyer app and the relevant Meta developer app/TikTok App ID; use an AppsFlyer Product Line only for platform variants of the same product;
- no new ad account per campaign, language, persona, Custom Product Page, or market by default;
- create a market-specific ad account only for a documented payer, legal entity, country, currency/timezone, regulatory, data, partner-control, or operational-ownership boundary.

Use TikTok Advanced SRN first and Meta integration second. Keep AppsFlyer Web Attribution off by default while it remains beta; use GA4 plus the networks' web measurement for pure web acquisition. Use AppsFlyer OneLink for native and web-to-app journeys; enable paid Smart Script or cost features only with explicit owner approval.

The owner retains company control, legal and representative verification, MFA and recovery, payment, tax and invoice data, campaign activation, initial budget, every budget increase, and irreversible ownership changes. The agent may prepare asset manifests, integrations, event mapping, tests, paused campaigns, creative drafts, destination parameters, and read-only reports.

Recheck mutable platform limits, country availability, plan entitlements, and current setup screens at every product bootstrap. Record non-secret asset IDs and access roles in the private operations record; never store provider secrets or recovery codes in GitHub.

Primary-source evidence, naming conventions, and the three-to-seven-day bootstrap checklist are recorded in [`research/ad-account-topology.md`](research/ad-account-topology.md).

**Plain-English summary:** The company owns one secure control center on each platform; every product gets isolated public, advertising, and measurement assets beneath it.

## Organic and Paid Content Operations

- Create a scheduled organic-content task for every product.
- Default cadence is daily; allow a product to use twice-daily generation.
- Support platform-appropriate TikTok and Instagram content.
- Maintain a paid creative pipeline:
  - video as the primary format;
  - static creative as a supported format;
  - multiple hooks, messages, and aspect ratios;
  - traceable connection between each creative, campaign, audience, destination, and result.
- Decide the approval and publishing mode before automating live posting.
- Approve the first representative organic assets for a product, then allow the recurring organic routine to publish automatically within the approved format, message, frequency, and safety limits.
- Require product-owner approval for every new paid campaign, initial budget, material budget increase, optimization-event change, or new market.

**Plain-English summary:** Produce fresh organic posts every day and keep a measurable supply of ads ready to test.

## TikTok-First Paid Acquisition and Learning Gate

Start paid social acquisition on TikTok before Meta unless current product evidence, platform eligibility, or market access makes TikTok unsuitable.

- Begin with small, bounded learning campaigns rather than an immediate scale campaign.
- Define one business-relevant optimization conversion before launch. Prefer an attributable purchase or paid subscription when the product and available volume support it.
- For app campaigns, send eligible in-app events such as purchases through the approved AppsFlyer MMP integration and verify TikTok attribution end to end.
- For web or web-to-app campaigns, use the approved TikTok web measurement path and preserve campaign attribution through the funnel.
- Treat **conversion**, not “conversation,” as the canonical term.
- For standard TikTok conversion campaigns, use at least 50 verified conversions at the selected optimization event within a rolling seven-day window as the product's default learning-volume gate.
- Do not scale merely because the volume gate was reached. Also require verified attribution, acceptable CPA or ROAS against the campaign hypothesis, no material data-quality warning, and enough creative diversity to manage fatigue.
- When the campaign cannot reach the gate, improve the value proposition, creative, offer, audience, funnel, bid, or budget. An explicitly approved higher-funnel proxy event may help the platform learn, but it does not prove purchase-level scalability.
- Avoid disruptive campaign edits during learning; record any change that restarts or materially disturbs the learning period.
- Recheck TikTok's current official documentation before every new campaign type is standardized. Platform guidance varies: current general guidance identifies 50 conversions as the strongest learning-phase indicator, while formats such as Search Ads publish different thresholds.
- After TikTok produces a validated campaign hypothesis, adapt and test it on Meta rather than assuming the result transfers unchanged.

**Plain-English summary:** Learn cheaply on TikTok first, but scale only after enough real conversions, trustworthy tracking, and acceptable economics.

## Creative Production Loop

### Golden Rule: Sell the User Outcome

Never make a product feature the main campaign message. Every organic or paid creative must lead with the user's problem, desired outcome, or meaningful change in their life.

- Describe the user's recognizable **before** state.
- Show the product as the credible mechanism that helps create change.
- Make the improved **after** state and user value clear.
- Express the promise in the persona's language, not internal product terminology.
- Use features, interface footage, and technical capabilities only as supporting proof of how the outcome becomes possible.
- Keep every transformation truthful, achievable with the current product, and supported by evidence; never invent results, testimonials, or guarantees.
- Reject a creative when a viewer can name the feature but cannot explain which problem it solves or how their situation improves.

Every creative brief must answer:

1. Who is experiencing the problem?
2. What is their situation before using the product?
3. What useful outcome does the product help them reach?
4. What makes that outcome believable?
5. What action should they take next?

**Plain-English summary:** Do not advertise what the app has; show people how their situation can improve by using it.

Use two creative branches:

- **Static:** Produce paid-ad images, organic social images, and carousel panels with OpenAI image generation available through the owner's ChatGPT/Codex subscription.
- **Video:** Produce organic social and paid-ad videos through the owner's selected video-generation provider and Codex plugin. The expected provider is Higgsfield; verify the exact provider, connector, and available capabilities when installed.

Standardize the process, not the creative answer. Run this loop separately for each product and major campaign:

1. Define the campaign objective, destination, conversion event, KPI, budget assumption, and time window.
2. Research and select the audience personas relevant to that objective.
3. Define each persona's problem, before state, desired after state, objections, awareness level, and reachable channels.
4. Generate materially different value-led campaign territories, transformation stories, promises, headlines, hooks, offers, calls to action, and creative formats.
5. Use a Batch Grill round to compare three viable directions with concise advantages, disadvantages, and a recommendation.
6. Prototype before final generation:
   - generate low-cost static compositions or contact sheets for images;
   - create a frame-by-frame carousel outline for carousels;
   - create a script, storyboard, shot list, timing, voice, visual references, and per-shot generation prompts for video.
7. Run a visual review round that states what is being tested and the scenario the product owner should evaluate.
8. Generate the selected assets through the appropriate provider.
9. Produce platform-specific variants, captions, aspect ratios, safe areas, thumbnails, and tracking configuration.
10. Publish through the approved workflow, verify attribution, measure results, and feed evidence into the next creative round.

Treat single-prompt video generation as a draft or exploration. Use the approved storyboard and shot-level prompts for production video. Put automated provider access behind a video-generation adapter so the provider can be replaced without changing the campaign model.

**Completion result:** Every published creative communicates a truthful user outcome and is linked to its campaign, persona, before state, desired after state, hypothesis, destination, conversion event, generation inputs, approval, and measured result.

**Plain-English summary:** Decide who the campaign is for and what story it tells before asking an image or video model to make the final asset.

## Marketing Roadmap Visuals

Create one required low-resolution campaign map for each major campaign:

```text
Objective → Persona → Before → Desired After → Value Promise → Proof → Hook → Format → Channel → Destination → CTA → Conversion → KPI
```

Use additional visual boards only when they improve a decision:

- one persona/message board when audiences need comparison;
- one static contact sheet when image directions need comparison;
- one carousel frame board for each approved carousel;
- one storyboard for each approved video;
- one experiment matrix when several creatives, audiences, or destinations will be tested.

Keep a small campaign in one visual. Split larger work into linked visuals when one board is no longer readable. Link every visual from its canonical campaign issue and record the verdict there.

**Plain-English summary:** Keep one map of the campaign, then add focused visual boards only where a choice needs to be seen.

## Fixed Marketing Website Product

Treat the marketing website as a separate deployable product even when the main product is a web application. Reuse one fixed technical template across products; change brand tokens, copy, media, locales, product configuration, and campaign content.

The website must:

- share the app's icon, logo, typography, color, motion, and frontend language;
- feel animated and alive without weakening performance, accessibility, or SEO;
- support every locale supported by the product;
- support Google Search and Google Ads landing-page requirements;
- use Google Analytics for marketing-site analytics;
- avoid PostHog on the marketing site;
- support AppsFlyer attribution where technically appropriate;
- provide a content system for SEO pages and recurring articles;
- provide campaign-specific landing pages.

Required surfaces:

- product home or primary landing page;
- product explanation, features, and use cases;
- about the product;
- about the publishing company;
- email signup or waitlist;
- FreeScout-backed support request creation and ticket-status tracking;
- privacy policy;
- terms of use/service;
- product- and platform-required legal disclosures;
- localized content and metadata;
- web-to-app funnel;
- campaign landing pages;
- direct App Store and other approved destination routes.

The product and website must share one canonical support destination. The website owns the ticket flow; product clients deep-link to the relevant support route and pass only safe, documented context. Avoid a separate in-app support database for the MVP.

**Completion result:** The template is localized, branded, indexable, measurable, campaign-ready, and connected to support, email, attribution, and approved destinations.

### Legal Document Baseline

Maintain reusable, versioned English source templates for the privacy policy, terms of use/service, support terms, subscription disclosures, and platform-required notices. Generate each product's localized drafts from:

- the product and publisher identity;
- supported markets and locales;
- a current data-and-provider inventory;
- account, payment, support, analytics, attribution, advertising, retention, deletion, and user-rights behavior;
- Apple and web-platform disclosure requirements.

The agent prepares and consistency-checks the drafts; the product owner reviews and approves publication. Escalate to qualified legal review when a product handles sensitive data, targets children, enters a materially different jurisdiction, makes regulated claims, or creates another risk the reusable template does not cover. Record source version, effective date, locale, owner approval, and the product facts used to generate every published document. Open an update issue whenever providers or data practices change.

**Plain-English summary:** Reuse a strong legal-document system, update it from what each product actually does, and pay for specialist review only when the product's risk makes it necessary.

## Web-to-App Standard

Use one fixed, reusable funnel structure across products; change only product content and configuration.

The funnel must:

- support a short two- or three-step path;
- preserve campaign attribution;
- support destination choice by campaign:
  - email capture;
  - informational landing page;
  - web-to-app onboarding or qualification;
  - web paywall or checkout when permitted;
  - direct App Store destination;
- hand off cleanly to the installed app or store destination;
- connect conversion events to Google Analytics and AppsFlyer.

Research current primary documentation before freezing:

- RevenueCat-hosted web purchase/paywall capabilities versus a custom RevenueCat-backed funnel;
- AppsFlyer web-to-app and deep-linking options;
- current Apple policies and regional constraints for web purchase flows and app handoff.

**Plain-English summary:** Ads can send people to the destination that fits the campaign, while attribution survives the journey.

## App Store and Search Marketing

Prepare and operate:

- App Store default product page;
- custom product pages;
- Product Page Optimization experiments;
- featuring submissions;
- localized store assets and metadata;
- Google Search Console;
- technical and content SEO routines;
- Google Ads-compatible campaign pages.

Use approved Figma screenshot templates for localized iOS, iPad, and Mac store assets. Use ASC CLI for supported App Store Connect publishing operations, including prepared metadata and assets. The agent should execute the ASC CLI release path without waiting solely because it is a publish action; discuss a manual handoff only when a required operation is unsupported, credentials or authority are missing, or product-owner judgment is required.

At first launch, prepare the social-proof screenshot module but publish it only when its claims are supported by traceable evidence. After launch, monitor ratings and reviews, respond where appropriate, and create an asset refresh issue when qualifying proof becomes available.

**Plain-English summary:** Make the product discoverable in both the app store and web search, then improve its pages with evidence.

## Overnight Implementation Gate

Whenever a phase reaches the decision-to-execution boundary, generate or update a repository-specific unattended implementation package for that phase. The package consumes only that phase's GitHub ready-for-agent frontier; it does not duplicate the implementation plan in a second task store.

Generate, following repository conventions:

- one-command loop entry script;
- preflight script or preflight mode;
- stable worker prompt containing project rules and hard guardrails;
- non-secret JSON configuration, agent-argument, and static-safe-check examples;
- operator guide explaining start, monitor, stop, resume, logs, reports, and recovery;
- durable per-run logs and a machine-readable run state;
- morning report template.

The preflight must verify:

- repository and branch/worktree safety;
- required CLI authentication and issue-tracker access;
- recognized direct native Node, Git, Git-selected HTTPS remote helper, GitHub CLI, Bash, and Codex executables plus bound tool, launcher, agent, argument, enforcement-evidence, and runtime-guard SHA-256 values; approval must be current, expire after approval within 30 days, and bind the exact Git configuration digest, executable-attribute digest, and matching direct HTTPS GitHub origin;
- the declared static-safe checks, limited to direct parse/inspection operations whose complete execution path cannot reach a container runtime;
- the generated HTML glossary matches its canonical Markdown sources;
- every selected live GitHub issue is open, unassigned, labeled for the active phase plus `ready-for-agent`, and carries the synchronized machine-readable loop contract;
- every frontend issue's validation route, verdict, public-product clock, and activation state match the live canonical Product Launch Map; validate-first accepts only recorded `GO` or `BUILD-TO-LEARN`;
- the ready-for-agent frontier contains no blocker, claim, unresolved product decision, owner-only action, secret, spend, deployment/runtime execution, or Docker/container-runtime work;
- every selected issue belongs to the active phase or is an explicitly approved dependency;
- required non-secret configuration exists;
- Docker runtime work is absent from the unattended queue;
- stop conditions, time budget, attempt limit, and concurrency are configured.

Run the implementation loop with these semantics:

1. Query the open, unblocked, unclaimed ready-for-agent frontier.
2. Claim one issue before work with a unique run token and repository-visible GitHub lease; the earliest active lease wins and every competing loop fails closed.
3. Start a fresh agent context in an isolated branch or worktree for that issue.
4. Load only the issue, linked decisions, repository instructions, and required references.
5. Implement against the acceptance criteria, using the project's testing and code-review disciplines.
6. Run the required verification commands.
7. Commit intentionally and create or update the pull request when the issue is complete.
8. Record evidence on the issue. In interactive mode, run the manual Ask Matt closeout before the next operation. In autonomous mode, continue through independent eligible work without invoking or waiting for Ask Matt.
9. On a bounded failure, record the failure evidence, mark the issue blocked or retryable, release unsafe claims, and continue only with an independent frontier issue.
10. Stop when the frontier is empty, the configured time or attempt budget is reached, a global precondition fails, or the remaining work requires a human.

Keep each pull request focused on one canonical issue unless a tightly coupled phase bundle is explicitly justified. Use small commits that map back to the issue's acceptance criteria. Every pull request must contain this owner handoff:

- linked canonical issue and the original problem;
- why the change exists and the user-visible outcome;
- included work and explicit non-goals;
- automated checks run and their results;
- `Human validation: required`, `recommended`, or `not needed`, with a plain-language reason;
- when human validation is required or recommended, exact local steps, the scenario to try, expected result, and failure signs;
- target-platform visual evidence for visual changes;
- known risks, rollback path, and any owner-only step;
- a short plain-English merge recommendation.

If human validation is not needed, explain why the automated evidence is sufficient. Never hide a Docker runtime step inside the test instructions: label it as owner-only and provide it without executing it.

Safety and operability:

- Default to one worker per repository. Increase concurrency only for demonstrably independent issues in isolated worktrees.
- Preserve user changes and stop before overlapping a dirty worktree.
- Use bounded retries and resumable state; never spin indefinitely on one failure.
- Keep secrets out of generated files and logs.
- Never source loop configuration or execute a configured string through `eval`, `bash -c`, `sh -c`, or an equivalent shell. Do not treat a command as safe merely because its visible text omits `docker`.
- Resolve every runner tool through its owner-reviewed absolute path and SHA-256. Reject Git aliases, executable filters/drivers, credential/remote helpers, external transports, unsafe protocol rewrites, or changed Git execution fingerprints; use an explicit owner handoff when the path cannot be proven safe.
- The reusable unattended allowlist covers only `git diff --check`, `node --check`, `bash -n`, and the skill-owned glossary currentness checker. Until a dedicated checker proves a build, test, generator, package-manager script, Make/Task/Just target, shell wrapper, compiled helper, or other command cannot reach a container runtime, record it as owner verification instead of executing it.
- Carry the hard Docker runtime guardrail into the worker prompt and preflight. The loop may prepare Docker artifacts but must skip every Docker execution or deployment ticket for the owner.
- Keep production deployment and other explicit human-runtime operations outside the overnight implementation queue.
- Treat ASC CLI release work according to the release plan; include it in an unattended run only when the release ticket is explicitly agent-ready and every prerequisite is already satisfied.

Before handing over the loop, tell the owner in Turkish:

- the exact start command;
- prerequisites and expected runtime;
- how to watch progress;
- how to stop safely;
- how to resume;
- where logs, branches, pull requests, blocked tickets, and the morning report will appear;
- which work remains human-run.

At the end of the run, produce a morning report containing completed issues, commits and pull requests, verification results, blocked or skipped work, remaining frontier, product state, and a prominent non-blocking Ask Matt reminder with the exact next prompt.

**Completion result:** The owner can start the verified loop with one command, leave it unattended, stop or resume it safely, and return to a traceable report of what changed and what remains.

**Plain-English summary:** Once every product decision is settled, provide a safe one-command runner that implements ready tickets overnight and leaves a clear morning report.

## Release and Post-Launch Gates

Before launch, verify:

- the approved onboarding and primary value journey on every actual target runtime;
- critical error, empty, offline, loading, retry, and recovery states;
- purchase, entitlement, restore, account, and web-to-app behavior when applicable;
- support entry and fallback behavior;
- analytics, diagnostics, attribution, consent, and settings opt-out behavior;
- automated build, lint, type, unit, integration, contract, and smoke checks required by the repository;
- every PR's required owner-validation scenario and evidence;
- accessibility;
- privacy, legal, security, and store compliance;
- production analytics and attribution;
- support entry, in-product support route, native-email fallback where applicable, and the iOS/iPadOS Home Screen support quick action;
- satisfaction-milestone review eligibility and the StoreKit request path;
- marketing website and campaign destinations;
- store materials and submissions, with no fabricated social proof;
- organic and paid content readiness.

Do not release with an unresolved launch-blocking or critical-severity defect. Do not require exhaustive testing of every theoretical state when the critical user journey, payment, support, measurement, compliance, and recovery paths have evidence.

For self-hosted backend releases, stop at the Docker operator handoff and continue from the owner's deployment results. For Apple releases, use ASC CLI as the default execution path.

After launch, run an evidence loop across product analytics, attribution, support, reviews, SEO, content, and experiments.

**Completion result:** The product and its full acquisition, measurement, support, and compliance system are live and observable.

## Demand Validation and Apple Acquisition Intent

Some products need a paid demand test before full construction. Bootstrap must therefore record one route:

- `validate-first`: complete a bounded demand-validation gate before full frontend work;
- `parallel`: test demand while the default frontend route advances;
- `build-first`: keep the original phase order and validate through the public MVP.

Minimum identity, repository, Product Launch Map, truthful product-status copy, and owner-only account/spend actions still precede a paid test. For `validate-first` and `parallel`, use Prelauncher as the temporary paved road while the owner learns web-to-app mechanics. Recheck current product behavior, price, traffic sources, terms, and privacy at each use.

Prelauncher is an evidence tool, not a product oracle. Its current public pages conflict: the marketing page says no card is collected, while the June 18, 2026 privacy policy says visitor-entered card details go directly to Stripe for a SetupIntent. Prelauncher says it does not see or store card numbers and makes no charge. Treat the result as payment-method setup or checkout intent, never as a completed purchase, retention, product-market fit, technical feasibility, organic demand, or profitable scale. Never misrepresent the pre-launch product as available or purchased. Keep product/agent systems away from payment credentials and record the processor, disclosure, consent, deletion, market/legal review, and current no-charge behavior.

For Apple products, request owner-supplied ASO/ASA keyword clusters and known search intents during bootstrap. The owner continues to own final keyword selection. Maintain one acquisition-intent route matrix:

```text
keyword cluster / campaign → search intent → Custom Product Page → approved deep link → intent_id → onboarding variant → paywall variant → outcome event
```

Use one stable internal `intent_id`, one deterministic default, and shared configuration-driven onboarding/paywall components. Do not duplicate full flows. Variants may change truthful copy, examples, imagery, ordering, proof, layout, and package emphasis. A price, trial, product, entitlement, or eligibility change is a separate monetization decision.

Run a dedicated frontend Batch Grill for these intent routes and prototype every launch variant on the actual Apple runtime. Cover Custom Product Page open, Home Screen launch, already-installed open, missing/invalid/retired intent, late attribution, and explicit user correction. Do not assume the app receives a Custom Product Page ID or raw search term on every launch. Normalize Apple deep links, AppsFlyer payloads, explicit user choice, and missing signals behind a product-owned acquisition router.

The primary-source evidence and unresolved vendor behavior are recorded in [`research/prelaunch-validation-and-intent-routing.md`](research/prelaunch-validation-and-intent-routing.md).

The owner confirmed:

1. `validate-first` has its own three-to-seven-day clock; `GO` or `BUILD-TO-LEARN` starts a fresh three-to-seven-day public-product clock;
2. the first public build plans three total routes: one default plus the two strongest confirmed search-intent variants;
3. missing, invalid, late, or unavailable intent silently uses the default onboarding and paywall; do not add an acquisition question.

For Apple products where recurring subscription monetization fits, use one Apple subscription group, one RevenueCat entitlement, and two store products:

- weekly: one-week auto-renewable subscription with a three-day free introductory offer;
- annual: one-year auto-renewable subscription with a one-month pay-up-front introductory offer, then the regular annual renewal.

Apple calls the annual first month a paid introductory offer, not a free trial. A customer can redeem only one introductory offer across the subscription group. Paywalls must show eligible offer terms only when RevenueCat/StoreKit confirms eligibility and must otherwise show regular terms.

Use one fixed RevenueCat paywall shell: muted looping background video with accessible fallback, value-led message, evidence-backed social proof, weekly/annual selection, exact localized commerce terms, purchase, restore, privacy, and terms. Keep the total annual charge more prominent than a monthly equivalent. The default and two intent variants use the same two store products. RevenueCat custom variables and visibility rules change the background video, approved quotes, copy, and intent-specific marketing labels. App Store product display names remain broad, accurate, localized store metadata.

If the current RevenueCat plan or SDK cannot render all approved media variants from one Paywall, use three app-selected Offerings/paywalls that reuse the same two products. Do not make paid RevenueCat Targeting a launch dependency.

Do not create six same-priced store products solely to display different intent names. Add store products only for a real price, duration, offer, entitlement, tax, or availability difference.

The supporting Apple and RevenueCat evidence is recorded in [`research/apple-revenuecat-intent-paywalls.md`](research/apple-revenuecat-intent-paywalls.md).

**Plain-English summary:** Each product now chooses when to test demand, and Apple acquisition messages can continue into matching onboarding and paywall experiences without pretending the source signal is always available.
