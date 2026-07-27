# Phase-Scoped Implementation Loops

## Contents

- Entry gate
- Generated package
- Preflight
- Static-safe checks
- Worker semantics
- Ask Matt by execution mode
- Pull requests
- Owner handoff
- Morning report

## Entry gate

Generate a loop only when the active phase's decisions are confirmed or deliberately deferred and its remaining in-scope work is agent-ready.

An issue is `ready-for-agent` only when it contains:

- one canonical problem and user outcome;
- included scope and non-goals;
- acceptance criteria;
- affected surfaces and linked decisions;
- dependencies and blockers;
- test and human-validation expectations;
- secret, spend, Docker, release, and owner-only boundaries;
- no unresolved product question.

For frontend issues, also require the validation route, qualifying verdict, public-product clock start, and canonical Product Launch Map URL. Preflight compares them with the live machine-readable map gate; validate-first accepts only `GO` or `BUILD-TO-LEARN` with frontend delivery active.

Keep future phases, provisional decisions, production Docker work, campaign activation, payment, MFA, legal assent, and other human actions outside the queue.

## Generated package

Copy and adapt the templates under `assets/loop/` into the product repository:

```text
.indie-mvp-loop/
  .gitignore
  config.json.example
  agent-args.json.example
  agent-enforcement-policy.txt.example
  agent-runtime-guard.json.example
  safe-checks.json.example
  operator-guide.md
  worker-prompt.md
  morning-report.template.md
  morning-report.md
  run-phase.sh
  preflight.sh
  state/
  logs/
```

Replace every `{{PLACEHOLDER}}` and configure the issue labels. Repository-native build/test/generator commands remain owner handoffs unless a dedicated static-safe checker is added to the skill allowlist; do not insert them as free-form loop commands. Do not create a second task database; GitHub Issues remain canonical.

Every implementation issue must include the machine-readable `indie-mvp-loop` JSON contract from [implementation-issue.md](../assets/github/implementation-issue.md). Keep it synchronized with native labels, assignments, blocking links, decisions, and owner boundaries.

## Preflight

The generated preflight must fail clearly when:

- repository, branch, or worktree state is unsafe;
- required GitHub/agent authentication is unavailable;
- the agent executable is unresolved, wrapper/script based, not the recognized direct native Codex executable, or differs from its owner-reviewed SHA-256;
- agent arguments, enforcement evidence, or runtime guard differ from their bound SHA-256 values, or the owner approval is missing, stale, future-dated, expired, or longer than 30 days;
- `docs/glossary.html` is stale;
- a selected issue is not open, unassigned, active-phase, and labeled `ready-for-agent`;
- the machine-readable issue contract is absent, malformed, or inconsistent with live labels, assignments, or native `blockedBy` dependencies;
- a frontend issue's validation route, verdict, clock, or activation state differs from the live Product Launch Map gate;
- the live query reaches its configured frontier limit, because unseen issues would escape validation;
- dependencies/blockers, claims, unresolved decisions, or cross-phase membership are unsafe;
- selected issues contain unresolved decisions;
- an issue is outside the active phase without an approved dependency;
- non-secret configuration is missing;
- Docker/container runtime, deployment/runtime execution, secrets, spend, or another owner-only action is in the queue;
- time, attempt, retry, or concurrency bounds are absent.

Default to one worker. Increase only for demonstrably independent issues in isolated worktrees.

## Static-safe checks

Never source a configuration file and never run a configured string through `eval`, `bash -c`, `sh -c`, or another shell. Store configuration and agent arguments as JSON. Clear Bash and Node preload variables at the owner entry command and again in the launchers. Spawn the owner-reviewed agent executable directly with `shell: false`.

Pin native Node, Git, Git's selected `git-remote-https` helper, GitHub CLI, Bash, and Codex executables by canonical absolute real path and SHA-256. Use only the packaged fixed Codex `exec`/`workspace-write`/worktree/stdin argument contract; reject arbitrary config overrides, extra directories, or full-access modes. Bind those digests, both resolved launcher-file digests, and a fresh owner-reviewed execution evidence file to the runtime guard. Generate and bind the current Git execution fingerprint with the skill-owned helper: exact configuration digest, executable-attribute digest, and direct HTTPS GitHub origin. The runner rejects aliases, filters, diff/merge drivers, credential or remote helpers, SSH/external transports, signing commands, protocol rewrites, and executable attributes; it disables helpers, hooks, fsmonitor, signing, and external diff again for every Git call. If this complete path cannot be proven, refuse autonomous execution and hand the phase to the owner.

The reusable preflight allowlist is intentionally narrow:

- `git diff --check`;
- `node --check` on declared repository-relative JavaScript files;
- `bash -n` on declared repository-relative shell files;
- the skill-owned glossary currentness checker.

These parse or inspect files without running repository application code. A build, test, generator, package-manager script, Make/Task/Just target, shell wrapper, compiled helper, or other repository command can hide a container-runtime path. Until a dedicated checker proves its complete path safe, leave it out of the unattended loop and record an owner verification handoff. A command is not safe merely because its text omits the word `docker`.

## Worker semantics

For each cycle:

1. Query open, unblocked, unclaimed `ready-for-agent` issues for the active phase.
2. Claim one issue before editing with a unique run token and GitHub comment lease. The earliest active lease wins; later same-account or cross-host loops fail closed.
3. Start a fresh agent context in an isolated branch/worktree.
4. Load the issue, linked decisions, repository instructions, and required references.
5. Implement only its acceptance criteria.
6. Run required verification.
7. Commit intentionally and create/update the focused PR.
8. Record evidence on the issue.
9. Apply the execution-mode Ask Matt rule below.
10. On bounded failure, record evidence, mark blocked/retryable, release unsafe claims, and continue only with an independent issue.

Stop when:

- the frontier is empty;
- time or attempt budget is reached;
- a global precondition fails;
- remaining work needs a human;
- changes overlap unsafe user work;
- a product decision appears.

Keep state resumable and retries bounded. Keep secrets out of files and logs. A worker may prepare Docker artifacts but must skip Docker execution and deployment.

## Ask Matt by execution mode

Record `interactive` or `autonomous` in `config.json` and the preflight summary.

- **Interactive:** after a substantial implementation, PR, completed Grill, phase gate, or frontier-changing deliverable, prepare the exact manual Ask Matt prompt and wait for its returned result before the next interactive operation.
- **Autonomous:** never invoke Ask Matt inside the loop and never pause an otherwise safe queue for it. Continue through independent eligible issues. At final stop, add one prominent reminder to the morning report with current state, recommended next operation, and the exact Ask Matt prompt for the returning owner.

Ask Matt is not a substitute for a decision or safety gate. A genuine blocker, unresolved owner decision, prohibited action, or unsafe condition still stops or skips affected work in either mode.

## Pull requests

Use [pull-request.md](../assets/github/pull-request.md). Keep one issue per PR unless the issue documents a justified coupled bundle. Use small commits that map to acceptance criteria.

Visual changes require evidence from the actual target runtime. State whether human validation is required, recommended, or unnecessary; explain why.

## Owner handoff

Before the owner runs a loop, explain in Turkish:

- exact start command;
- prerequisites and expected bound;
- progress command/view;
- safe stop and resume;
- log/state/report locations;
- branch, PR, and blocked-ticket destinations;
- work that remains owner-run.

Select and verify the actual local toolchain and agent executables, immutable digests, direct CLI arguments, Git execution fingerprint, and runtime guard while generating the repository-specific loop; never guess them into an overnight run. `run-phase.sh` is otherwise complete: it performs preflight, live revalidation, exclusive claim, isolated worktree/branch creation, direct agent spawn, static-safe checks, commit/push, pull-request and issue evidence, bounded failure handling, resumable state, and the final report.

## Morning report

Produce:

- run identity, phase, start/end, stop reason;
- completed issues, commits, and PRs;
- verification results;
- blocked, retryable, skipped, and owner-only work;
- remaining frontier;
- product state and risks;
- Ask Matt current state, next operation, and exact prompt.

Use [morning-report.md](../assets/loop/morning-report.md).
