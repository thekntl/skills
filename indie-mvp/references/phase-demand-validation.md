# Demand Validation Phase

## Contents

- Entry
- Paved road
- Experiment contract
- Interpretation
- Gate

## Entry

Use this optional phase only when bootstrap selects `validate-first` or `parallel`. It tests whether a reachable audience responds to the promise and stated price strongly enough to justify product construction. It does not replace competitor research, target-runtime prototypes, App Store validation, or a released-product learning loop.

Keep one canonical `phase:validation` issue and use [demand-validation-experiment.md](../assets/marketing/demand-validation-experiment.md).

## Paved road

Use Prelauncher for the first Apple-app demand test while the owner is learning web-to-app mechanics. Recheck its current capabilities, price, supported traffic sources, data handling, and terms before every project.

As of the recorded research:

- the generated flow is landing page → walkthrough → pre-registration → paywall;
- the buyer-intent step presents real pricing and sends visitor-entered card details directly to Stripe for a SetupIntent;
- Prelauncher says it does not see or store card numbers and no visitor charge is made;
- the measured signal is payment-method setup/checkout intent, not a completed purchase;
- its documented campaign setup is Meta-led; do not claim TikTok support without current evidence.

Purchasing Prelauncher, adding a payment method, connecting an ad account, accepting legal terms, setting a budget, or activating a campaign remains owner-only.

Do not build a custom fake-checkout system during the MVP. Reopen that option only after the owner has enough web-to-app experience and a product-specific reason.

## Experiment contract

Before generating the funnel or creative, record:

- hypothesis and falsifiable decision;
- audience, market, locale, pain, desired outcome, and awareness;
- truthful value-led promise and before/after message;
- stated product status and delivery expectation;
- price or offer being tested;
- traffic source, campaign, creative variants, destination, and attribution;
- primary conversion, secondary funnel events, sample/spend ceiling, window, and stopping rule;
- pass, continue, and stop thresholds;
- public personal-data deletion and consent-withdrawal routes;
- target-market privacy/legal review scope, owner, evidence, and unresolved restrictions;
- owner approvals and privacy/legal checks.

Never fabricate availability, testimonials, ratings, scarcity, outcomes, or social proof. Make the pre-launch status clear before collecting contact data or recording a purchase-intent confirmation. Do not let the product or agent receive, log, or store payment credentials. If the approved experiment uses Prelauncher's Stripe SetupIntent flow, record the processor, disclosure, consent, deletion route, market/legal review, and the vendor's current no-charge behavior.

Do not activate traffic until the deletion route is public and usable and every required market/privacy/legal review is recorded. Vendor or ad-platform acceptance does not establish legal compliance.

Use small paid tests. Keep every campaign paused until the owner approves its exact budget and activation.

## Interpretation

Treat the vendor verdict as evidence, not authority. Segment by creative, audience, country, source, device, and intent where sample size permits.

A positive test supports only this claim: the tested message, audience, price presentation, funnel, traffic source, and conditions produced the recorded intent signal. It does not prove:

- actual paid conversion;
- retention or repeated use;
- product quality or technical feasibility;
- organic, ASO, ASA, SEO, or referral demand;
- profitability at scale;
- demand outside the tested segment.

Record uncertainty, tracking loss, sample limitations, creative effects, and follow-up tests. Preserve the waitlist and consent evidence for an approved launch notification; do not silently repurpose it.

## Gate

Close with one owner-confirmed verdict:

- `GO`: advance the evidence-backed promise and intent segments;
- `ITERATE`: change one material variable and run another bounded test;
- `STOP`: archive the idea or return it to research;
- `BUILD-TO-LEARN`: evidence is inconclusive, but a released MVP is the cheaper next test.

Link the verdict to the Product Launch Map. For a validate-first project, either `GO` or `BUILD-TO-LEARN` activates the frontend route and starts a fresh public-product three-to-seven-day clock from that recorded verdict. Neither verdict pre-approves production claims, pricing, paywalls, or campaign scale. `ITERATE` and `STOP` keep the public-product clock and frontend delivery pressure inactive.
