# Demand Validation Experiment — {{PRODUCT_NAME}}

## Decision

- Route: `validate-first | parallel`
- Hypothesis: {{FALSIFIABLE_HYPOTHESIS}}
- Decision this test unlocks: {{DECISION}}
- Window: {{WINDOW}}
- Spend ceiling: {{OWNER_APPROVED_CEILING}}
- Owner approval: {{APPROVAL}}

## Audience and promise

- Market/locale: {{MARKET_LOCALE}}
- Audience: {{AUDIENCE}}
- Pain/before state: {{BEFORE}}
- Desired after state: {{AFTER}}
- Truthful value promise: {{PROMISE}}
- Product-status disclosure: {{PRELAUNCH_DISCLOSURE}}
- Stated price/offer: {{PRICE_OR_OFFER}}

## Funnel and traffic

- Tool and current capability check: {{TOOL_EVIDENCE}}
- Traffic source: {{SOURCE}}
- Campaign/ad set: {{CAMPAIGN}}
- Creative/message variants: {{VARIANTS}}
- Tracked destination: {{DESTINATION}}
- Funnel steps: {{FUNNEL}}
- Contact consent and retention: {{CONSENT}}
- Personal-data deletion request route: {{PUBLIC_DELETION_ROUTE}}
- Deletion owner and response target: {{DELETION_OWNER_AND_TARGET}}
- Payment-intent processor/mode: {{PROCESSOR_AND_SETUP_INTENT}}
- Product/agent access to payment credentials: `none`
- Visitor charge: `none`

## Truth, privacy, and market review

- Product-status and no-charge disclosure evidence: {{DISCLOSURE_EVIDENCE}}
- Data/controller/processor inventory: {{DATA_INVENTORY}}
- Consent withdrawal route: {{WITHDRAWAL_ROUTE}}
- Target market and applicable review scope: {{MARKET_AND_REVIEW_SCOPE}}
- Market/privacy/legal review: `required | not-required-with-reason | completed`
- Reviewer/owner: {{REVIEW_OWNER}}
- Review evidence and date: {{REVIEW_EVIDENCE}}
- Unresolved restriction: {{RESTRICTION_OR_NONE}}

Do not activate traffic while a required review or deletion route is missing. A tool's acceptance, a platform approval, or a no-charge checkout does not establish legal compliance.

## Measurement

| Signal | Definition | Pass | Continue | Stop |
| --- | --- | --- | --- | --- |
| Primary intent conversion | {{PRIMARY_CONVERSION}} | | | |
| Pre-registration | {{REGISTRATION_EVENT}} | | | |
| Paywall view | {{PAYWALL_EVENT}} | | | |

- Minimum evidence: {{SAMPLE_AND_CONFIDENCE}}
- Attribution limitations: {{LIMITATIONS}}
- Stop-loss rule: {{STOP_LOSS}}

## Results

| Segment | Visitors | Registrations | Paywall views | Intent confirmations | Rate | Spend | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| | | | | | | | |

## Verdict

- Result: `GO | ITERATE | STOP | BUILD-TO-LEARN`
- What the evidence supports: {{SUPPORTED_CLAIM}}
- What it does not prove: {{LIMITS}}
- Next operation: {{NEXT_OPERATION}}

## Plain-English summary

This test measures whether a specific audience responds to a truthful promise and price strongly enough to justify the next product step; it is not proof of a real sale or retention.
