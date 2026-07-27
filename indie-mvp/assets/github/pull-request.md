## Problem and outcome

- Canonical issue: {{ISSUE}}
- Original problem: {{PROBLEM}}
- User-visible outcome: {{OUTCOME}}

## Scope

### Included

- {{INCLUDED}}

### Non-goals

- {{NON_GOALS}}

## Evidence

| Check | Result |
| --- | --- |
| {{COMMAND_OR_CHECK}} | {{RESULT}} |

## Human validation

**Human validation:** `required | recommended | not needed`

**Why:** {{PLAIN_REASON}}

When required or recommended:

1. {{LOCAL_STEP}}

- Scenario: {{SCENARIO}}
- Expected result: {{EXPECTED}}
- Failure signs: {{FAILURE_SIGNS}}
- Target-platform visual evidence: {{VISUAL_EVIDENCE}}

## Risk and recovery

- Known risks: {{RISKS}}
- Rollback: {{ROLLBACK}}
- Owner-only steps: {{OWNER_ONLY_STEPS}}

## Merge recommendation

{{PLAIN_MERGE_RECOMMENDATION}}

## Ask Matt handoff

- Execution mode: `interactive | autonomous`
- Interactive: append the returned Ask Matt result before the next interactive operation.
- Autonomous: write `Deferred to the final loop reminder`; this does not block the remaining eligible queue.

{{ASK_MATT_RESULT}}
