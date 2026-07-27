# Product Map and Decision Sessions

## Contents

- Hybrid Wayfinder model
- Phase records
- Batch Grill protocol
- Uncertainty register
- Prototype verdicts
- Glossary
- Ask Matt closeout

## Hybrid Wayfinder model

Keep one long-lived `Product Launch Map` issue. It shows:

- launch promise and deadline;
- current phase and gate;
- completed phases;
- critical path and daily target;
- confirmed, provisional, and research-needed decisions;
- active blockers and owner actions;
- ready-for-agent frontier;
- next operation.

Keep its `indie-mvp-launch-gate` marker synchronized with the confirmed validation route, verdict, public-product clock start, and frontend activation state. Every frontend implementation issue copies these values plus the map's canonical issue URL. Preflight reads the live map and rejects a mismatch; a validate-first frontend queue cannot open before `GO` or `BUILD-TO-LEARN`.

At each phase boundary, run a short Wayfinder checkpoint inside the phase issue. Recompute the route from actual evidence; do not create a competing master plan or map every future detail.

The checkpoint records:

1. current state;
2. phase outcome;
3. known evidence;
4. unresolved crossroads;
5. smallest credible route;
6. gate and validation scenario;
7. work deliberately deferred.

Use [master-map.md](../assets/github/master-map.md) and [phase-issue.md](../assets/github/phase-issue.md).

## Phase records

Use issues as the durable session surface:

- one master launch map;
- one canonical issue per phase;
- separate decision/research issues only when they need independent evidence or block multiple tasks;
- one focused issue per implementation unit;
- one PR per canonical implementation issue unless a tight bundle is justified.

Update the master map after a phase gate changes. Avoid invisible agent-only phase state.

## Batch Grill protocol

Ask only decisions that change the product, route, risk, cost, or launch result.

For each round:

1. Ask every currently unblocked question together in simple Turkish.
2. Number the questions.
3. Give three materially different viable options when the decision supports them.
4. For each option, state a short advantage and disadvantage.
5. Mark one recommendation and connect it to the product promise and timebox.
6. Permit a free-form answer.
7. Explain what the round resolves.
8. Preview the likely later rounds, then recompute them after the answers.

Use platform prototypes as question surfaces when seeing the result is more useful than describing it. Text and visual questions may share one round.

Do not grill:

- a fixed stack choice;
- a safe reversible default;
- a fact that research or repository inspection can answer;
- implementation detail that does not alter owner-visible behavior.

## Uncertainty register

Record each answer as:

- `confirmed`;
- `provisional`;
- `research-needed`.

Infer `provisional` when the owner expresses uncertainty, relies on intuition, or cannot assess a technical trade-off. Tell the owner in Turkish that the answer will be used temporarily.

For each provisional item record:

| Field | Meaning |
| --- | --- |
| Question | Decision being made |
| Provisional choice | Current assumption |
| Uncertainty | Why confidence is limited |
| Change cost | Cost if changed later |
| Reevaluate by | Latest safe checkpoint |
| Evidence | What would improve the decision |

When the normal frontier is empty, present every provisional item together. Explain what later work changed, recommend confirm/change/research/defer, and close only after the owner confirms the new states.

## Prototype verdicts

Every prototype review starts in Turkish with:

- what is being tested;
- which problem it should solve;
- the exact scenario the owner should try;
- what a successful verdict would establish.

Store the verdict and evidence in the canonical issue. Prototype code remains a decision artifact unless an implementation issue explicitly promotes a production rewrite.

## Glossary

Use the `grill-with-docs` and `domain-modeling` skills during decision sessions when available.

Keep each term in one Markdown source:

- domain terms in `CONTEXT.md` or mapped context files;
- technical, design, marketing, analytics, and operations terms in `docs/GLOSSARY.md`.

Use the templates in `assets/project/`. Generate the searchable HTML with:

```text
node <skill-path>/scripts/build-glossary.mjs --context CONTEXT.md --glossary docs/GLOSSARY.md --output docs/glossary.html
```

Add `--check` in verification and phase-loop preflight.

Before closing a Grill session, capture resolved terms, regenerate and check HTML, link it from the session issue, then complete reevaluation.

## Ask Matt closeout

Use the execution mode recorded for the work.

For interactive or human-in-the-loop work, after a substantial implementation, PR creation, completed Grill, phase gate, or frontier-changing deliverable:

1. Make tracker state and completion evidence current.
2. Provide the owner with an exact manual `$ask-matt` invocation because that skill is user-invoked.
3. Include product destination, phase, completed artifact, blockers, and available frontier.
4. Ask:
   - Where are we now?
   - What is the next operation?
   - What exact prompt should the owner use next?
5. Append the returned answer to the canonical record using [ask-matt-handoff.md](../assets/github/ask-matt-handoff.md).
6. Repeat the three-part result at the bottom of the Turkish completion message.
7. Pause the next interactive operation until the result is recorded.

For an autonomous loop, do not invoke Ask Matt per implementation or PR and do not pause eligible work for it. When the run stops, put one visible Ask Matt reminder in the morning report with current state, recommended next operation, and the exact prompt. The returning owner runs it before choosing the next human-directed operation.

Neither mode may use Ask Matt to bypass a real blocker, unresolved owner decision, prohibited action, or safety stop.
