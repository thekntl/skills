# Apple and RevenueCat intent-paywall catalog

**Research date:** 2026-07-27
**Scope:** Official Apple and RevenueCat documentation only. No dashboard configuration or independent storefront testing.

## Decision

Use **two Apple subscription products**—weekly and annual—in **one subscription group**, attach both to **one RevenueCat entitlement**, and reuse those products in **one fixed RevenueCat Paywall**. The product-owned route supplies mutually exclusive intent variables so the same shell can vary truthful video, proof, copy, and marketing labels.

Only when the current RevenueCat plan/SDK cannot reproduce every approved media variant from one Paywall, use three app-selected Offerings/paywalls—default plus two intent variants—that reuse the same two products. Paid RevenueCat Targeting is not a launch dependency.

Intent variants may change truthful framing, copy, imagery, video, social proof, layout, and package emphasis. They do not need separate App Store products merely to show different marketing labels.

## 1. Apple introductory-offer facts

### Annual product with a low-price first month

**Yes, as a one-month _pay-up-front_ introductory offer.** Apple allows a one-year subscription to have a pay-up-front introductory duration of 1, 2, 3, or 6 months, or 1 year. The customer pays one discounted amount for that introductory duration; after it ends, the subscription renews at the standard annual price unless canceled.

It is **not** a one-month pay-as-you-go offer. For a one-year subscription, Apple permits pay-as-you-go only for a one-year introductory duration.

| Offer type | Customer pays during intro | One-month intro on annual product? | After intro |
| --- | --- | --- | --- |
| Free trial | Nothing | Yes | Standard annual price |
| Pay up front | One discounted amount covering the selected intro duration | **Yes** | Standard annual price |
| Pay as you go | Discounted price each normal billing period | **No**; annual products allow a one-year pay-as-you-go duration only | Standard annual price |

Apple says offers auto-renew at the standard price after the offer period. Its StoreKit documentation illustrates pay up front as one discounted initial charge followed by regular-price renewals. Sources: [Apple introductory-offer duration table](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions), [Apple subscription-offer definitions](https://developer.apple.com/app-store/subscriptions/), [StoreKit `payUpFront`](https://developer.apple.com/documentation/storekit/product/subscriptionoffer/paymentmode-swift.struct/payupfront).

The paywall must prominently disclose the actual amount billed, the offer duration, and the standard renewal price. For an annual plan, the total annual charge must be more prominent than a monthly equivalent. [Apple subscription presentation guidance](https://developer.apple.com/app-store/subscriptions/), [Apple Human Interface Guidelines: In-app purchase](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase).

### Weekly product with a three-day free trial

**Yes.** Apple’s table explicitly allows a three-day free trial for a one-week auto-renewable subscription. The normal subscription period still satisfies Apple’s minimum seven-day subscription-period rule. Sources: [Apple introductory-offer duration table](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions), [App Review Guideline 3.1.2(a)](https://developer.apple.com/app-store/review/guidelines/).

Eligibility is subscription-group-wide:

- A customer may redeem only **one introductory offer per subscription group**, even if several products in that group each have an offer.
- New subscribers are eligible. A lapsed subscriber may be eligible if they have never redeemed an introductory offer in that group. An active subscriber in the group is not eligible.
- After redeeming an intro offer in the group, switching to the other product does not grant another trial or intro price.
- The app should query StoreKit’s `isEligibleForIntroOffer`; it must not advertise the trial as available to everyone.

Sources: [Implementing introductory offers](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app), [`isEligibleForIntroOffer`](https://developer.apple.com/documentation/storekit/product/subscriptioninfo/iseligibleforintrooffer), [App Store Connect introductory-offer FAQ](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions).

## 2. Intent copy can vary while the products stay fixed

RevenueCat supports both developer-built paywalls and remotely configured Paywalls. Its current editor includes custom text, image, video, package, purchase-button, carousel, and social-proof components. Offering metadata can carry custom strings and media URLs; RevenueCat explicitly documents creating another Offering with the **same products** but different metadata to test different paywall messaging. Sources: [RevenueCat Paywall components](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls/components), [Offering metadata](https://www.revenuecat.com/docs/tools/offering-metadata), [SDK quickstart](https://www.revenuecat.com/docs/getting-started/quickstart).

Therefore, three intent variants may use different marketing headlines or plan labels while purchasing the same weekly and annual products. Keep the canonical subscription identity visible and unambiguous: the subscription name, duration, included access, localized total charge, introductory terms, and renewal price must remain accurate. Testimonials, ratings, awards, outcomes, scarcity, and savings claims must be genuine and supportable. Apple prohibits misleading marketing, false prices, bait-and-switch subscription presentation, and unverifiable claims. [App Review Guidelines 2.3 and 3.1.2](https://developer.apple.com/app-store/review/guidelines/).

The App Store subscription display name remains customer-facing metadata:

- StoreKit exposes it as storefront-localized `Product.displayName`; StoreKit’s `SubscriptionStoreView` renders localized names, descriptions, and prices.
- Apple says customers see subscription names and all renewal options when managing subscriptions.
- If the in-app purchase is promoted on the App Store, its display name and description are public there.
- RevenueCat can render the store-localized product name when a paywall uses its product-name variable.

Sources: [StoreKit `Product.displayName`](https://developer.apple.com/documentation/storekit/product/displayname), [`SubscriptionStoreView`](https://developer.apple.com/documentation/storekit/subscriptionstoreview), [Apple auto-renewable subscription setup](https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/), [Apple In-App Purchase information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/), [RevenueCat Paywall variables](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls/variables).

**Undocumented boundary:** the standard StoreKit purchase API documentation confirms that Apple presents a system confirmation sheet, but the official standard-product pages found here do not precisely map every field on that sheet. Do not assume a custom marketing label replaces App Store metadata in Apple-controlled purchase or management UI.

## 3. Why not create six same-priced Apple products

Creating weekly and annual duplicates for each intent variant adds durable catalog state without adding a distinct commercial product:

- Each product needs its own immutable, non-reusable Product ID, pricing, availability, localizations, review screenshot/notes, App Review submission, RevenueCat import, entitlement attachment, package mapping, and purchase/restore testing. Sources: [Apple In-App Purchase information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/), [Submit an In-App Purchase](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/).
- In one subscription group, Apple exposes the products as renewal options and allows upgrades/crossgrades/downgrades. Six equal-access, equal-price options with intent-oriented names can confuse customers in Apple’s management UI. They still share one-intro-offer eligibility; duplicate products do not create additional trials. [Apple auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/).
- Putting the duplicates in separate groups is worse for one access level: customers can hold and be billed for subscriptions in multiple groups, intro eligibility becomes group-specific, and paid-service days are group-specific. Apple recommends one group when customers should have one active subscription. [Apple auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/).
- Apple and RevenueCat report purchases by subscription/product identifier. Six identifiers split weekly and annual performance into extra rows that must be rolled up. RevenueCat already records the presented Offering and supports analysis by product, Placement, and Targeting Rule, so product duplication is unnecessary for intent attribution. Sources: [RevenueCat Charts](https://www.revenuecat.com/docs/dashboard-and-metrics/charts), [Scheduled Data Exports](https://www.revenuecat.com/docs/integrations/scheduled-data-exports).

## 4. Recommended RevenueCat model

| Layer | Configuration |
| --- | --- |
| Apple subscription group | One group for the single premium access level |
| Apple products | `weekly` and `annual` only |
| RevenueCat entitlement | One stable entitlement such as `premium`; attach both products |
| RevenueCat packages | `$rc_weekly` and `$rc_annual`, mapped to the two Apple products |
| RevenueCat Offering/Paywall | One default Offering with one fixed Paywall; route-owned custom variables and visibility rules select approved intent presentation |
| Placement | One real UI location such as `onboarding_end`; add `feature_gate` only if it is a distinct journey location, not merely another acquisition intent |
| Fallback | If one Paywall cannot reproduce approved variants, app-select `default`, `intent_a`, or `intent_b` Offerings/paywalls that reuse the same packages; unknown/late intent selects default |

RevenueCat Paywalls support variables and configurable components. Keep route resolution in product code and use route-owned presentation values only for truthful display, never access control. Sources: [RevenueCat Paywall variables](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls/variables), [RevenueCat Paywall components](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls/components).

For the fallback only, the app can deterministically select `intent_a` or `intent_b` by Offering identifier from fetched Offerings and fall back to `current`/default. RevenueCat supports fetching a named Offering and presenting a specific Offering. [Displaying products](https://www.revenuecat.com/docs/getting-started/displaying-products), [Displaying paywalls](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls).

RevenueCat explicitly supports multiple products unlocking one entitlement. Entitlement status—not product name or `intent_id`—must gate premium access. [RevenueCat Entitlements](https://www.revenuecat.com/docs/getting-started/entitlements).

## Remaining uncertainties

- App Review acceptance is app- and presentation-specific; official rules support truthful variant framing but do not pre-approve particular copy, video, or social proof.
- Exact standard StoreKit confirmation-sheet field placement should be verified on the target iOS version with sandbox/TestFlight.
- Introductory-offer availability, eligibility, localized prices, and renewal wording should be read from StoreKit and tested per storefront; never hardcode them from this report.
