# Acquisition Intent Route Matrix — {{PRODUCT_NAME}}

## Rules

- One stable internal `intent_id` per approved user intent.
- Exactly three launch routes: one default and two owner-confirmed intent variants. Fewer requires an explicit launch exception.
- One default route for missing, late, invalid, or retired signals.
- Shared onboarding/paywall components with configuration-driven variants.
- Same product truth and entitlement semantics across variants.
- Price, trial, product, or eligibility changes require a separate monetization decision.

## Routes

| Intent ID | Keyword cluster / campaign | User intent | Evidence | Custom Product Page | Approved deep link | Onboarding variant | Paywall variant | Outcome event | State |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `default` | Direct / unknown | {{DEFAULT_INTENT}} | | Default page | Default route | Default | Default | | Active |
| `{{INTENT_A}}` | | | | | | | | | Proposed |
| `{{INTENT_B}}` | | | | | | | | | Proposed |

## Router behavior

- Signal priority: {{PRIORITY_RULE}}
- Explicit user override, only when product behavior needs one: {{OVERRIDE_RULE}}
- Persistence: {{PERSISTENCE_RULE}}
- Late-arriving attribution: {{LATE_SIGNAL_RULE}}
- Unknown/retired route: `default`
- Sensitive/raw keyword handling: {{DATA_MINIMIZATION_RULE}}

## Target-runtime scenarios

| Scenario | Expected intent | Expected experience | Evidence |
| --- | --- | --- | --- |
| Install and tap **Open** from Custom Product Page | | | |
| Launch from Home Screen after install | `default` unless verified context exists | | |
| Already installed, open approved deep link | | | |
| Generic App Store campaign link only | `default` | Aggregate measurement does not choose an app route | |
| Apple Ads attribution is late or unavailable | preserve current route | | |
| Missing or invalid route | `default` | | |
| Product-specific goal selector, when present | selected intent | | |
| Attribution arrives after onboarding begins | preserve current experience | | |

## Measurement

| Intent ID | Page view/download evidence | Onboarding completion | Paywall view | Purchase/activation | Retention outcome |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## Plain-English summary

This matrix keeps each acquisition message connected to the matching first-use and paywall experience while preserving a safe default when the source is unknown.
