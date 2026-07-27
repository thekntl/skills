# Apple Paywall Variant Matrix — {{PRODUCT_NAME}}

## Fixed shell

- Background: muted looping video with accessible poster/static fallback
- Message: value-led headline and outcome
- Proof: traceable approved quotes/ratings, hidden when unavailable
- Products: weekly and annual
- Controls: purchase, restore, close, privacy, terms
- Commerce copy: localized StoreKit/RevenueCat variables only

## Store catalog

| Store product | Duration | Introductory offer | Regular renewal | RevenueCat package | Entitlement |
| --- | --- | --- | --- | --- | --- |
| `{{WEEKLY_PRODUCT_ID}}` | 1 week | 3-day free trial | {{LOCALIZED_WEEKLY_TERMS}} | `$rc_weekly` | `{{ENTITLEMENT}}` |
| `{{ANNUAL_PRODUCT_ID}}` | 1 year | 1-month pay-up-front price | {{LOCALIZED_ANNUAL_TERMS}} | `$rc_annual` | `{{ENTITLEMENT}}` |

Both products belong to one Apple subscription group. A customer may redeem only one introductory offer from the group.

## Intent presentation

| Intent ID | Background video/poster | Value headline | Social proof evidence | Weekly marketing label | Annual marketing label | Same store products |
| --- | --- | --- | --- | --- | --- | --- |
| `default` | | | | | | Yes |
| `{{INTENT_A}}` | | | | | | Yes |
| `{{INTENT_B}}` | | | | | | Yes |

Use RevenueCat custom variables and visibility rules. Derive mutually exclusive `is_default`, `is_intent_a`, and `is_intent_b` values from the product-owned route. Marketing labels may vary; StoreKit product display names, duration, price, offer, entitlement, and purchase-sheet truth do not.

Fallback only when the current plan/SDK cannot reproduce the approved variants: clone this shell into three app-selected RevenueCat Offerings/paywalls while reusing the same two store products. Do not require paid Targeting.

## Eligibility states

| State | Weekly copy | Annual copy | Required behavior and recovery |
| --- | --- | --- | --- |
| Intro eligible | Exact localized 3-day free period, then exact weekly price and renewal timing | Exact localized first-month pay-up-front price, then total annual price and renewal timing | Apply only the selected product's StoreKit-confirmed offer; explain that offers cannot be combined |
| Intro ineligible | Exact regular weekly price, duration, and renewal timing | Exact total regular annual price, duration, and renewal timing | Hide every introductory claim and keep purchase available at regular terms |
| Eligibility unknown | Exact regular weekly terms | Exact regular annual terms | Never promise an offer; permit a safe refresh without replacing truth with cached marketing copy |

Never infer eligibility from route, campaign, prior app state, or a local flag. Use current RevenueCat/StoreKit eligibility. A redeemed introductory offer on either product exhausts introductory eligibility for the subscription group.

## Loading, purchase, and restore states

| Scenario | Truth shown | Interaction | Recovery |
| --- | --- | --- | --- |
| Paywall/Offering loading | No guessed prices, durations, offers, or proof | Show a labeled progress state; keep close/support available | Retry once under the bounded policy, then show retry and exit |
| Offering unavailable or malformed | No commerce claim | Disable purchase and selection | Refresh; fall back only to an app-selected approved Offering that reuses the same two products |
| One or both products unavailable | No partial or invented fixed catalog | Do not present the state as the approved two-product paywall; disable purchase | Refresh catalog; offer close/support; record product identifiers and non-sensitive error evidence |
| Purchase pending | Terms accepted for the selected product remain visible | Disable duplicate purchase; announce pending state | Observe CustomerInfo/transaction updates and expose safe exit |
| Purchase cancelled | Existing entitlement state remains unchanged | Return focus to the selected plan/purchase action without an error alarm | Allow another selection or close |
| Purchase failed | Exact selected terms remain visible; no success claim | Show a plain localized error without provider internals | Retry when safe; expose restore, close, and support |
| Purchase succeeds | Current entitlement truth | Announce success once and continue to the promised outcome | Refresh CustomerInfo before unlocking |
| Already entitled | Active entitlement truth; no unnecessary sale claim | Replace purchase pressure with continue/manage access | Refresh entitlement and continue |
| Restore running | No restored-access claim yet | Disable duplicate restore; announce progress | Wait for the bounded result |
| Restore succeeds | Restored entitlement truth | Announce success and continue | Refresh CustomerInfo before unlocking |
| Restore finds no entitlement | No entitlement claim | Explain that no eligible purchase was found | Keep purchase, retry, close, and support available |
| Restore fails | Existing local access is not silently revoked | Show a localized recoverable error | Retry, close, or open support; record non-sensitive evidence |

## Accessibility and presentation states

| Scenario | Required behavior | Evidence |
| --- | --- | --- |
| VoiceOver | Read value, proof status, selected product, full price/duration/intro/renewal terms, purchase, restore, close, privacy, and terms with meaningful labels and traits | Transcript/order for eligible, ineligible, loading, failure, and restore states |
| Dynamic Type | Preserve complete commerce text and controls at accessibility sizes without clipping or overlap; allow vertical scrolling | Largest supported size on every target device class |
| Focus order | Start at the value heading, then proof when present, products, purchase, restore, legal, and close; after cancel/failure return to the relevant plan/action | Keyboard/Switch Control/VoiceOver traversal |
| Reduce Motion | Replace looping video with the approved poster before animation starts; preserve contrast and message | Reduce Motion enabled before and during presentation |
| Video failed/offline | Show the same approved poster and readable foreground; do not block commerce loading | Offline and media-error target-runtime evidence |
| Proof unavailable | Remove the module and its focus stop entirely | No placeholder quote, rating, or empty accessibility element |
| Localization stress | Keep exact localized price, duration, offer, renewal, restore, and legal text readable in supported locales | Longest-copy locale plus right-to-left locale when supported |

## Runtime evidence

| Scenario | Default | Intent A | Intent B |
| --- | --- | --- | --- |
| Video/poster and Reduce Motion | | | |
| Proof present/absent | | | |
| Weekly/annual selection | | | |
| Eligible/ineligible/unknown | | | |
| Offering/product loading, missing, and retry | | | |
| Purchase/cancel/failure/pending/already entitled | | | |
| Restore running/success/none/failure | | | |
| VoiceOver reading and focus order | | | |
| Dynamic Type and localization stress | | | |

## Plain-English summary

All three acquisition routes use the same two subscriptions and fixed paywall structure; only truthful presentation content changes.
