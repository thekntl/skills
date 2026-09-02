# Adapters

Read this before writing any capability interface in step 3 of `/kntl-backend`. The vocabulary is `codebase-design`'s: module, interface, seam, adapter, fake.

## The boundary

- One product-owned interface per capability, sized to the MVP: the operations `docs/design/SCENARIOS.md` needs, and only those.
- SDKs, transports, credentials, payloads, and provider errors stay inside the adapter; the seam speaks product-owned models and product-owned failures.
- One composition root per app selects adapters; the fake is the second adapter that makes the seam real, composed where the conventions file's Environment parity allows. Which provider project each environment targets is in `references/environments.md`.
- An adapter lives on the backend when it needs a secret, a privileged API, a webhook, scheduled work, or a rule shared across clients; a provider that ships a required client SDK keeps a client-side adapter in front of it.
- Product behaviour is tested against the fake; each production adapter has focused contract tests.
- The ticket that builds an adapter records: capability, operations, models, failure mapping with retry and idempotency policy, consent purpose, fake behaviour, secret location and rotation owner.

## Provider defaults

Providers come from `docs/agents/kntl-stack.md`; these rules bind when the default provider is chosen.

**RevenueCat (payment and entitlement).** One entitlement, one Apple subscription group, one weekly and one annual store product in one default Offering with one Paywall attached. Weekly carries the free introductory offer; annual carries a pay-up-front first month, worded as "first month, then annual" and shown only to eligible customers, since Apple redeems one introductory offer per group. Price, duration, renewal, and eligibility come from RevenueCat/StoreKit variables at runtime, with regular terms whenever eligibility is unknown. Presentation variants (intent, media, copy) are Paywall Rules or extra Offerings over the same two products; a new store product needs a real price, duration, offer, entitlement, tax, or availability difference and its own ledger entry. Paid Targeting is the owner's decision.

## Consent baseline

One purpose-specific `ConsentCoordinator` sits in front of the analytics, crash, attribution, and email adapters, whichever provider fills them. Analytics and diagnostics default to on only where market, platform, and the documented legal basis allow it, with minimum event data, pseudonymous ids only, and a settings opt-out whose withdrawal stops both collection and forwarding. SKAN/AdAttributionKit and the MMP's aggregate paths are the default; ATT appears contextually and only right before IDFA, retargeting, or user-level attribution. The marketing site holds non-essential cookies, pixels, and tags until regional consent and keeps email enrolment a separate explicit step. Wording and legal basis belong to `/kntl-legal`.

## Acquisition intent (parked)

Acquisition-intent routing is parked. The MVP sends every entry (install, deep link, Custom Product Page, campaign) to the default onboarding and paywall; campaign tokens and Apple Ads attribution are aggregate measurement behind the attribution adapter. When `/kntl-marketing` opens an intent ticket, the product owns an `AcquisitionContext` with a stable `intent_id` normalised at the seam, one deterministic default, and an explicit user choice outranking an inferred intent; the route matrix arrives with that ticket.

## Go service design

When the stack file names the owner's Go stack (`chi`, `templ` + HTMX, Postgres):

- Browser HTML/HTMX endpoints and versioned JSON REST live in separate route groups.
- The API the Apple client uses is described in OpenAPI 3.1, and the Swift client is generated from it.
- Storage goes through `pgx`, `sqlc`, and `goose` migrations behind a storage adapter.
- Idempotency keys, webhook verification, retries, failure mapping, and observability are part of the interface and are written down with it.
- Admin tooling is minimal and owner-operable.
- The service ticket records data ownership, access, retention, deletion and export, migrations, jobs, health, resources, failure modes, backup, restore, and rollback.
