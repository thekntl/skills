# {{IMPLEMENTATION_OUTCOME}}

<!-- indie-mvp-loop
{
  "schema_version": 1,
  "phase": "{{PHASE_LABEL}}",
  "blocked_by": [],
  "unresolved_decisions": [],
  "approved_cross_phase_dependencies": [],
  "owner_only_actions": [],
  "requires_secret": false,
  "requires_spend": false,
  "requires_docker_runtime": false,
  "requires_deployment_or_runtime": false,
  "validation_route": "{{VALIDATION_ROUTE}}",
  "validation_verdict": null,
  "public_product_clock_started_at": null,
  "launch_gate_evidence_url": null,
  "claimed_by": null
}
-->

Keep this JSON synchronized with labels and the sections below. Set the confirmed validation route on every implementation issue. For frontend work, also copy the Product Launch Map's live verdict, public-product clock start, and canonical issue URL; validate-first permits frontend only after `GO` or `BUILD-TO-LEARN`. An unattended loop compares those values with the live Product Launch Map marker, and rejects the issue unless every blocker/decision/owner boundary is empty or `false`, `claimed_by` is `null`, and the issue is open, unassigned, and labeled for the active phase plus `ready-for-agent`.

{{INSERT_AND_RESOLVE_ASSETS/GITHUB/NATIVE-TRACKER-READBACK.MD}}

## Problem

{{PROBLEM}}

## User outcome

{{USER_OUTCOME}}

## Decision evidence

- Phase: {{PHASE_ISSUE}}
- Decisions/research: {{LINKS}}

## Scope

- {{IN_SCOPE}}

## Non-goals

- {{NON_GOALS}}

## Acceptance criteria

- [ ] {{CRITERION}}

## Affected surfaces

{{SURFACES}}

## Dependencies and blockers

{{DEPENDENCIES}}

- Native GitHub blocking links: {{BLOCKING_LINKS_OR_NONE}}
- Approved cross-phase dependencies: {{APPROVED_DEPENDENCIES_OR_NONE}}

This section explains the native graph; it does not replace parent/sub-issue or blocked-by/blocking mutations.

## Verification

- Automated: {{AUTOMATED_CHECKS}}
- Human validation: `required | recommended | not needed`
- Scenario: {{SCENARIO}}
- Expected result: {{EXPECTED}}
- Failure signs: {{FAILURE_SIGNS}}
- Target runtime: {{TARGET_RUNTIME}}

## Boundaries

- Secrets: {{SECRET_LOCATION_OR_NONE}}
- Owner-only actions: {{OWNER_ACTIONS_OR_NONE}}
- Docker runtime: `absent`
- Spend/activation: `absent`
- Owner-runtime/deployment: `absent`

## Plain-English summary

{{SIMPLE_EXPLANATION}}
