# Phase Loop Operator Guide — {{PHASE}}

## Prerequisites

- Review `config.json`; it contains no secrets or placeholders. Bind `launchMapIssueUrl`, `phaseIssueNumber`, `milestoneTitle`, and `milestoneDueDate` to the native map, phase parent, and dated commitment. Bind `issueType` to the enabled implementation type, or use `{"mode":"unavailable","reason":"..."}` only after live repository capability discovery proves native types unavailable. For a required launch Project, bind its owner, number, node ID, title, Status field ID, and the four transition option IDs. A canonical tiny launch may instead use `{"mode":"tiny-skip","owner":"...","title":"<PRODUCT> — MVP Launch","mapChildCount":4,"repositoryCount":1,"reason":"..."}`; preflight traverses the complete live sub-issue tree, verifies at most four descendants in one repository, and proves that the Project is absent.
- Resolve direct native Node, Git, Git's selected `git-remote-https` helper, GitHub CLI, Bash, and `codex` executables. Record every absolute real path and SHA-256 in `config.json`; replace the Node and Bash placeholders in both shell launchers with those same reviewed paths. Preflight requires the pinned HTTPS helper to match the pinned Git executable's own exec path. Scripts, renamed wrappers, shells used as generic command runners, package runners, and unrecognized agent executables are refused. Keep `agent-args.json` on the fixed `codex exec --sandbox workspace-write -C %WORKTREE% --skip-git-repo-check -` contract; full-access, extra-directory, config-override, or other free-form agent arguments fail preflight. The complete worker prompt is delivered through standard input.
- Use the pinned Node executable to run `git-execution-fingerprint.mjs` with the product repository, pinned Git path/digest, and `owner/name`. Copy its Git-configuration digest, executable-attribute digest, and exact HTTPS GitHub origin into `agent-runtime-guard.json`. The helper rejects aliases, clean/smudge/process filters, diff or merge drivers, credential/remote helpers, SSH/external transports, signing commands, unsafe protocol rewrites, and active `filter`/`diff` attributes. If any appears, do not weaken the check: use an owner handoff.

```text
"{{ABSOLUTE_OWNER_REVIEWED_NODE_EXECUTABLE}}" "{{INDIE_MVP_SKILL_PATH}}/scripts/git-execution-fingerprint.mjs" --repo "{{ABSOLUTE_PRODUCT_REPOSITORY}}" --git "{{ABSOLUTE_OWNER_REVIEWED_GIT_EXECUTABLE}}" --git-sha256 "{{OWNER_REVIEWED_GIT_EXECUTABLE_SHA256}}" --repository "{{OWNER/REPOSITORY}}"
```

- Complete `agent-enforcement-policy.txt` from evidence that the selected sandbox/tool policy denies container-runtime execution and indirect repository commands. Bind the pinned tool digests, Git fingerprints, both resolved launcher-file digests, evidence digest, arguments digest, and agent digest in `agent-runtime-guard.json`, then bind the guard digest in `config.json`. Runtime Git uses only the pinned Git binary, a matching direct HTTPS GitHub origin, disabled helpers/hooks/fsmonitor/signing/external diff, and the existing GitHub CLI token through a transient child-process environment; the token is not written to files or logs.
- Runtime approval must expire after approval and within 30 days. Preflight stops on a stale/future/expired/reversed approval window, altered tools, arguments, evidence, guard, Git configuration, executable attributes, origin, or an unresolved placeholder. If direct enforcement cannot be proven, leave the issue outside the autonomous queue and use an owner handoff.
- Keep `safe-checks.json` limited to the supported static check types. Run every build, test, generator, package-manager, Make/Task/Just, or other wrapper command yourself unless a future reviewed checker proves it cannot reach a container runtime.
- Review and commit the generated examples, scripts, prompt, guide, report template, and `.gitignore`. Keep the machine-specific `config.json`, `agent-args.json`, `agent-enforcement-policy.txt`, `agent-runtime-guard.json`, generated report, `logs/`, and `state/` ignored. Start only from a clean product worktree.
- Confirm GitHub and local agent authentication.
- Run `BASH_ENV= ENV= NODE_OPTIONS= NODE_PATH= ./.indie-mvp-loop/preflight.sh`.

Preflight queries live GitHub labels, assignments, native parents, milestones, dependencies, Project membership/Status, and the configured Product Launch Map gate. It rejects drift plus missing or stale machine-readable contracts, wrong phases, open blockers, claims, unresolved decisions, owner actions, secrets, spend, premature validate-first frontend work, deployment/runtime execution, and Docker/container-runtime work. An explicitly authorized, agent-ready ASC CLI publication is not rejected merely because it is a release.

At claim time, the runner creates a unique GitHub comment lease. The earliest active lease wins, so two loops using the same owner account cannot both start the same issue. A normal blocked exit releases its lease after removing `ready-for-agent`; an unresolved lease remains a visible global stop for owner review.

## Start

```text
BASH_ENV= ENV= NODE_OPTIONS= NODE_PATH= ./.indie-mvp-loop/run-phase.sh
```

Expected bound: the `maxRuntimeMinutes`, `maxAttempts`, and `maxIssuesPerRun` values in `config.json`.

## Observe

- GitHub: phase issues, claimed issues, branches, and pull requests.
- Local state: `.indie-mvp-loop/state/`.
- Logs: `.indie-mvp-loop/logs/`.
- Morning report: `.indie-mvp-loop/morning-report.md`.

## Stop and resume

Create `.indie-mvp-loop/state/STOP` to request a stop between issues. Do not terminate an active git write. Resume only after reading `state/last-run.json`, the morning report, and any blocked issue; remove the stop marker manually before starting the next bounded run.

## Owner-only work

Docker/runtime deployment, secrets, payments, paid plans, campaign activation/budgets, legal assent, identity verification, MFA, recovery, and irreversible ownership remain outside this loop.

The loop never runs a free-form repository command. Its static check allowlist supports only `git diff --check`, `node --check`, and `bash -n`, invoked through the pinned native tools without a shell. It revalidates the bound Git configuration, executable attributes, and origin before Git mutations. It moves a required launch-Project item from `Ready` to `In progress`, `Blocked`, or `In review`, explicitly adds each pull request, uses a native closing link, and reads every mutation back before publishing evidence. Treat every other command as an owner handoff until its complete execution path has a dedicated safe checker.
