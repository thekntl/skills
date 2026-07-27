# Product Launch Map — {{PRODUCT_NAME}}

<!-- indie-mvp-launch-gate
{
  "schema_version": 1,
  "validation_route": "{{VALIDATION_ROUTE}}",
  "validation_verdict": null,
  "public_product_clock_started_at": null,
  "frontend_delivery_active": false
}
-->

Keep this marker synchronized with the confirmed route and verdict. For `build-first` or `parallel`, record the bootstrap clock and activate frontend. For `validate-first`, keep the clock `null` and frontend inactive until `GO` or `BUILD-TO-LEARN`, then record the fresh public-product clock and activate frontend.

## Launch contract

- Codename: `{{CODENAME}}`
- Promise: {{PRODUCT_PROMISE}}
- Market/category: {{MARKET}}
- Platforms: {{PLATFORMS}}
- Validation route: `validate-first | parallel | build-first`
- Public launch definition: {{LAUNCH_DEFINITION}}
- Repository: {{REPOSITORY}}

## Demand-validation clock

- State: `not-selected | pending | running | completed`
- Started at: {{VALIDATION_STARTED_AT_OR_NONE}}
- Deadline: {{VALIDATION_DEADLINE_OR_NONE}}
- Current day: {{VALIDATION_DAY_OR_NONE}}
- Verdict: `pending | GO | ITERATE | STOP | BUILD-TO-LEARN`
- Evidence: {{VALIDATION_EVIDENCE}}

For `validate-first`, this clock may run while the public-product clock remains `waiting-for-verdict`. Only `GO` or `BUILD-TO-LEARN` starts a fresh public-product clock. `ITERATE` continues the validation clock; `STOP` leaves the public-product clock inactive.

## Public-product clock

- State: `waiting-for-verdict | pending | running | launched | stopped`
- Started at: {{PUBLIC_PRODUCT_STARTED_AT_OR_NONE}}
- Deadline: {{PUBLIC_PRODUCT_DEADLINE_OR_NONE}}
- Current day: {{PUBLIC_PRODUCT_DAY_OR_NONE}}
- Start evidence: {{PUBLIC_PRODUCT_START_EVIDENCE}}

For `build-first`, start this clock at bootstrap. For `parallel`, record both clocks independently and never let validation silently extend the public deadline.

## Public-product countdown

| Day | Required outcome | State | Evidence |
| --- | --- | --- | --- |
| 0–1 | Identity, repository, first runtime shell, long-lead actions | Not started | |
| 1–3 | Frontend decisions and states complete | Not started | |
| 2–5 | Phase implementation, integrations/backend, market system | Not started | |
| 4–7 | Critical QA, publication, acquisition/support readiness | Not started | |

Do not activate or populate this countdown during a `validate-first` run until `GO` or `BUILD-TO-LEARN` is recorded.

## Phase map

| Phase | Gate | Canonical issue | State | Ask Matt |
| --- | --- | --- | --- | --- |
| Bootstrap | Entry packet, repository, launch route, and clock state recorded; validate-first keeps frontend inactive until GO or BUILD-TO-LEARN | | Active | |
| Demand validation (optional) | GO, ITERATE, STOP, or BUILD-TO-LEARN verdict recorded | | Conditional | |
| Frontend | Every surface/state approved on actual targets | | Pending | |
| Integrations | Adapters, events, consent, and tests settled | | Pending | |
| Backend | Backendless or every contract mapped and agent-ready | | Pending | |
| Market | Competitor evidence and opportunities linked | | Pending | |
| Marketing | Site, content, acquisition, support, and store work ready | | Pending | |
| Release | Product and operating system publicly observable | | Pending | |
| Post-launch | First evidence cycle is scheduled | | Pending | |

## Active frontier

- Current phase: {{ACTIVE_PHASE}}
- Current outcome: {{PHASE_OUTCOME}}
- Next checkable gate: {{NEXT_GATE}}
- Today's target: {{DAILY_TARGET}}
- Ready-for-agent issues: {{READY_ISSUES}}
- Owner actions: {{OWNER_ACTIONS}}

## Decision register

| Decision | State | Evidence | Reevaluate by |
| --- | --- | --- | --- |
| | confirmed / provisional / research-needed | | |

## Critical path and blockers

| Item | Owner | Deadline impact | Next action |
| --- | --- | --- | --- |
| | | | |

## Deferred until after launch

- {{DEFERRED_SCOPE}}

## Next operation

{{NEXT_OPERATION}}

## Plain-English summary

This issue shows where the product is, what must happen next, and what can safely wait.
