# Fixed Paved Road

## Contents

- Product structure
- Apple
- Web and API
- Data
- Providers
- Marketing and acquisition
- Exceptions

## Product structure

- Use one monorepo per product.
- Use `pnpm` and Turborepo for repository orchestration.
- Add a Go workspace beside it when Go modules exist.
- Expose stable repository tasks for build, lint, type, test, generation, and smoke checks.
- Keep the marketing site a separate deployable product inside the monorepo.

## Apple

- Use native Swift and SwiftUI.
- Target the Apple version 26 generation and Liquid Glass during MVP.
- Use SwiftData locally.
- Add CloudKit only when multi-device synchronization is part of the promise.
- Use current platform APIs and actual simulator/device/runtime validation.
- When recurring subscription monetization fits the product, use one Apple subscription group, one RevenueCat entitlement, and two store products: weekly and annual.
- Give the weekly product a three-day free introductory offer.
- Give the annual product a one-month pay-up-front introductory offer, then renew at the regular annual price.
- Treat introductory eligibility as subscription-group-wide: a customer can redeem only one introductory offer in the group.

## Web and API

- Use Go with a `net/http`-compatible `chi` router.
- Render the product web UI with `templ`; enhance with HTMX.
- Return useful server-rendered HTML at every public/indexable stable URL.
- Use Tailwind CSS and shared design tokens; keep React and Next.js outside the default.
- Use ordinary HTML/HTMX endpoints for the browser.
- Expose versioned JSON REST described by OpenAPI 3.1 for Apple and external clients.
- Generate the Swift client with Apple Swift OpenAPI Generator.
- Build the marketing website with Astro static output and content collections.
- Keep the existing WordPress Multisite outside the default; reconsider it only through a staging-first benchmarked decision.

## Data

- Use one shared production PostgreSQL installation and a separate staging installation.
- Give every product a separate database and least-privilege login role.
- Use `pgx`, `sqlc`, and `goose`.
- Use embedded SQLite only for an explicitly single-instance, low-write, low-risk service.
- Do not make self-hosted libSQL or an improvised multi-primary database the default.
- Prioritize tested backups, restore, monitoring, and recovery before a separate HA project.

## Providers

| Capability | Default |
| --- | --- |
| Web identity | WorkOS AuthKit Hosted UI when accounts add product value |
| Cross-platform identity | WorkOS after a focused shared-account Grill |
| Product analytics | PostHog Cloud EU |
| Crash/error reporting | Sentry |
| Marketing-site analytics | GA4 |
| Paywall and entitlement | RevenueCat |
| Web-to-app purchase | Astro funnel + RevenueCat Web SDK/Billing + Stripe |
| Emergency web purchase | RevenueCat Web Purchase Links |
| Attribution and deep link | AppsFlyer OneLink and Unified Deep Linking |
| Email | One Brevo account per product |
| Support | Shared FreeScout production service plus staging counterpart |
| Static creative | OpenAI image generation |
| Video creative | Higgsfield when its connector is installed and verified |
| Pre-build demand validation | Prelauncher after owner purchase/approval and current capability review |

Start on a viable free plan. Preserve a 20% Brevo transactional reserve: review capacity before 240 daily sends, a campaign above 240 recipients, or 1,600 actively automated contacts. Recheck mutable quotas and plan entitlements at bootstrap.

## Marketing and acquisition

- Use one company Meta Business Portfolio, TikTok Business Center, and AppsFlyer advertiser account.
- Give each product separate public identities, ad accounts, and measurement assets.
- Start paid learning on TikTok when suitable; test Meta second.
- Treat 50 verified selected conversions in a rolling seven-day window as the default TikTok learning-volume gate.
- Scale only with trustworthy attribution, acceptable CPA/ROAS, data quality, and creative diversity.
- Lead every creative with user problem, outcome, or truthful before/after change. Features are supporting proof.

## Exceptions

Open a focused decision only when the paved road cannot meet a verified product, market, legal, platform, performance, security, or operating requirement. Compare three viable options, migration cost, reversibility, and effect on the launch deadline.
