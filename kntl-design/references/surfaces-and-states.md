# Surfaces and states

Every surface below is marked in scope or out of scope on the design ticket; an out-of-scope surface is a ledger entry with its D-id.

## Required surfaces

- Onboarding
- Authentication and authorization (web, when accounts hold value)
- Paywall and the monetization boundary (paid product; a free launch is a ledger decision)
- App Shell: navigation skeleton and the product's main screens
- Core value workflow (the feature `/kntl-poc` proves)
- Settings
- Help and support
- About: version, publisher, legal links

## States per screen, where applicable

- first use, returning
- loading, empty, populated, success, error, validation, retry
- offline, degraded, permission denied, service unavailable
- locked/premium, purchase, restore, expired entitlement
- signed out, signed in, unauthorized
- accessibility and localisation stress: large Dynamic Type, VoiceOver order, Reduce Motion, long strings

Each state is reachable through a scenario in `docs/design/SCENARIOS.md` (its data-state axis) or by flipping the fake adapter from that scenario in the demo.

## Support moments

Canonical destination: `/support` on the marketing site. Apple opens it in an in-app browser and keeps a prefilled native-mail fallback; web opens the route. URL context carries product id, version, build, platform and locale; diagnostics attach through a separate explicit action with a preview.

Prototype these states on every target runtime: request succeeds (case reference and next expectation shown); validation fails (entered content kept, fields identified, retry available); offline (connectivity explained, retry and mail fallback visible, submission unclaimed); portal unavailable (context kept, mail fallback offered); mail unavailable (copy address and details, retry, cancel usable); composer opened versus sent (distinguished, return without a duplicate request).

iOS/iPadOS adds a static, localized, high-priority "Get Support" Home Screen quick action with an SF Symbol.

## Review moment (Apple)

Define a satisfaction milestone. Request the StoreKit review after a genuine successful outcome, delayed past the task, with cooldown, version, repetition and negative-context guards; display is best-effort. Optionally add a user-initiated "Rate the App" destination in Settings or About. Record milestone, eligibility, suppression and request event under Patterns in `DESIGN.md`.

## Acquisition intent (parked)

Design the default onboarding and paywall only. Intent-specific variants (copy, imagery, paywall framing per search intent) arrive later as configuration over the same shared components, one paywall and one store catalog, as their own tickets once campaigns exist; `/kntl-marketing` opens them.
