# Release and Post-Launch

## Contents

- Release evidence
- Publication
- Docker handoff
- Launch definition
- Post-launch loop

## Release evidence

Verify on every actual target runtime:

- onboarding and primary value journey;
- critical loading, empty, error, offline, retry, and recovery;
- purchase, entitlement, restore, account, and web-to-app behavior when applicable;
- support portal, safe context, and native-email fallback;
- analytics, diagnostics, attribution, consent, and settings opt-out;
- accessibility and localization;
- privacy, legal, security, and store requirements;
- marketing site, email capture, campaign destinations, and SEO;
- StoreKit satisfaction milestone and support quick action for applicable Apple apps;
- automated build, lint, type, unit, integration, contract, generation, and smoke checks;
- every PR's human-validation scenario and evidence.

Do not release with a launch-blocking or critical defect. Do not require exhaustive theoretical QA when the critical journey, payment, support, measurement, compliance, and recovery paths have evidence.

## Publication

For Apple:

- use ASC CLI for supported, approved App Store Connect operations;
- prepare metadata/assets and start review-dependent work early;
- stop for missing credentials, unsupported operations, owner judgment, or unmet prerequisites;
- count launch only at public App Store availability.

For web:

- require a public production URL, TLS, health evidence, analytics, support, legal pages, and working destinations;
- record release version, rollback, monitoring, and incident owner.

For paid acquisition:

- keep prepared campaigns paused until owner activation and budget approval;
- verify conversion and attribution before recommending activation.

## Docker handoff

For self-hosted releases:

1. Perform all code and static checks that do not invoke Docker.
2. Produce exact staging commands/checklist for the owner.
3. Stop before Docker runtime work.
4. Continue from owner-supplied output.
5. Record staging evidence and prepare the production checklist.
6. Repeat the owner handoff for production.

Never infer deployment success from valid YAML or a built Dockerfile.

## Launch definition

The complete MVP system is live only when the product plus required acquisition, measurement, support, legal, and observability surfaces are available.

Record:

- public URL/App Store URL;
- version/build;
- release time and deadline result;
- known limitations and rollback;
- dashboards/events/support verification;
- first content and campaign state;
- external blockers;
- next evidence review.

Before publication, attach target-runtime evidence for support request success, validation failure, offline behavior, portal unavailability, native-email unavailability, fallback send/cancel behavior, and duplicate prevention.

After an interactive release boundary, run the manual Ask Matt closeout before the next operation. If an explicitly agent-ready release completed inside an autonomous loop, leave the exact Ask Matt reminder in the final morning report without interrupting the loop.

## Post-launch loop

Use measured evidence from:

- activation, retention, satisfaction, and conversion;
- AppsFlyer and network attribution;
- support themes and time-to-resolution;
- ratings, reviews, and review-request eligibility;
- SEO impressions, clicks, pages, and content;
- email growth/delivery;
- creative and campaign experiments;
- crashes, errors, and operational alerts.

Open focused issues that state evidence, hypothesis, expected user outcome, metric, time window, and stop condition. Preserve the three-to-seven-day MVP as a baseline; do not turn the first evidence cycle into an unbounded rewrite.

Refresh App Store social proof only from traceable real ratings, reviews, or permissioned testimonials.
