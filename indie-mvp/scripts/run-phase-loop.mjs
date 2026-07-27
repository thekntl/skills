#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  readJson,
  resolveSafePath,
  runSafeChecks,
  validateFrontierSnapshot,
  validateLaunchGateEvidence,
  validateSingleIssueSnapshot,
  validateLoopConfig,
  validateSafeChecks,
  verifyAgent,
  verifyGitExecutionSnapshot,
  verifyToolchain,
} from "./loop-safety.mjs";
import {
  buildGitEnvironment,
  buildGitHubEnvironment,
} from "./runtime-environment-policy.mjs";

const AGENT_TOKENS = new Set([
  "WORKTREE",
  "ISSUE_NUMBER",
  "REPOSITORY",
  "BRANCH",
]);

const SAFE_AGENT_ENVIRONMENT_KEYS = Object.freeze([
  "HOME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LOGNAME",
  "NO_COLOR",
  "PATH",
  "SHELL",
  "TERM",
  "TMPDIR",
  "USER",
]);

const WORKER_RESULT_KEYS = new Set([
  "schemaVersion",
  "summary",
  "includedWork",
  "nonGoals",
  "verification",
  "humanValidation",
  "humanValidationReason",
  "humanValidationSteps",
  "expectedResult",
  "failureSigns",
  "risks",
  "rollback",
]);

const WORKER_STOP_CODES = new Set([
  "implementation-failure",
  "unresolved-owner-decision",
  "prohibited-action",
  "unsafe-condition",
  "secret-required",
  "spend-required",
  "docker-runtime-required",
  "runtime-deployment-required",
  "authentication-unavailable",
]);

let runtimeTools;

function fail(message) {
  throw new Error(message);
}

function requireText(value, name) {
  if (typeof value !== "string" || value.trim() === "" || value.includes("{{")) {
    fail(`${name} must be resolved non-empty text`);
  }
}

function requireTextArray(value, name, { allowEmpty = false } = {}) {
  if (!Array.isArray(value) ||
      (!allowEmpty && value.length === 0) ||
      value.some((item) => typeof item !== "string" || item.trim() === "")) {
    fail(`${name} must be ${allowEmpty ? "an" : "a non-empty"} array of text`);
  }
}

export function validateWorkerResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    fail("worker result must be an object");
  }
  for (const key of Object.keys(result)) {
    if (!WORKER_RESULT_KEYS.has(key)) fail(`worker result has unsupported key ${key}`);
  }
  for (const key of WORKER_RESULT_KEYS) {
    if (!(key in result)) fail(`worker result is missing ${key}`);
  }
  if (result.schemaVersion !== 1) fail("worker result schemaVersion must be 1");
  for (const key of [
    "summary",
    "humanValidationReason",
    "expectedResult",
    "rollback",
  ]) {
    requireText(result[key], `worker result ${key}`);
  }
  for (const key of [
    "includedWork",
    "nonGoals",
    "verification",
    "humanValidationSteps",
    "failureSigns",
    "risks",
  ]) {
    requireTextArray(result[key], `worker result ${key}`, {
      allowEmpty: key === "risks",
    });
  }
  if (!["required", "recommended", "not needed"].includes(result.humanValidation)) {
    fail("worker result humanValidation must be required, recommended, or not needed");
  }
  return result;
}

export function validateWorkerStop(stop) {
  if (!stop || typeof stop !== "object" || Array.isArray(stop)) {
    fail("worker stop must be an object");
  }
  const keys = Object.keys(stop).sort();
  if (JSON.stringify(keys) !==
      JSON.stringify(["code", "message", "schemaVersion", "scope"])) {
    fail("worker stop must contain exactly schemaVersion, scope, code, and message");
  }
  if (stop.schemaVersion !== 1) fail("worker stop schemaVersion must be 1");
  if (!["issue", "global"].includes(stop.scope)) {
    fail("worker stop scope must be issue or global");
  }
  if (!WORKER_STOP_CODES.has(stop.code)) {
    fail("worker stop code is unsupported");
  }
  requireText(stop.message, "worker stop message");
  if (stop.scope === "issue" && stop.code !== "implementation-failure") {
    fail("Only implementation-failure may use issue scope; safety and owner blockers are global");
  }
  return stop;
}

export function substituteAgentArguments(args, replacements) {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) {
    fail("agent arguments must be an array of strings");
  }
  return args.map((arg) =>
    arg.replace(/%([A-Z_]+)%/g, (_token, name) => {
      if (!AGENT_TOKENS.has(name) || !(name in replacements)) {
        fail(`agent argument contains unsupported token %${name}%`);
      }
      return String(replacements[name]);
    }),
  );
}

export function branchNameForIssue(prefix, phaseLabel, issueNumber) {
  const phase = phaseLabel
    .replace(/^phase:/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${prefix}${phase || "phase"}-issue-${issueNumber}`;
}

export function remainingIssueNumbers(
  frontier,
  completed,
  blocked,
  currentIssueNumber,
) {
  const handled = new Set([
    currentIssueNumber,
    ...completed.map(({ issue }) => issue.number),
    ...blocked.map(({ issue }) => issue.number),
  ]);
  return frontier
    .map(({ number }) => number)
    .filter((number) => !handled.has(number));
}

export function buildAgentEnvironment(source = process.env) {
  const environment = {};
  for (const key of SAFE_AGENT_ENVIRONMENT_KEYS) {
    if (typeof source[key] === "string" && source[key] !== "") {
      environment[key] = source[key];
    }
  }
  environment.GIT_PAGER = "cat";
  environment.GIT_TERMINAL_PROMPT = "0";
  environment.PAGER = "cat";
  return environment;
}

export function validatePreflightState(frontier, summary, config, now = Date.now()) {
  if (!Array.isArray(frontier)) fail("preflight frontier must be an array");
  if (frontier.length === 0 ||
      frontier.length > config.maxIssuesPerRun ||
      frontier.length > config.maxAttempts) {
    fail("preflight frontier exceeds the current configured execution bounds");
  }
  const numbers = frontier.map(({ number }) => number);
  if (numbers.some((number) => !Number.isSafeInteger(number) || number <= 0) ||
      new Set(numbers).size !== numbers.length) {
    fail("preflight frontier contains an invalid or duplicate issue number");
  }
  const keys = Object.keys(summary ?? {}).sort();
  const expectedKeys = [
    "executionMode",
    "expiresAt",
    "frontierSha256",
    "generatedAt",
    "limits",
    "phaseLabel",
    "schemaVersion",
    "selectedIssues",
  ].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys) ||
      summary.schemaVersion !== 1) {
    fail("preflight summary has an unsupported schema");
  }
  const expectedLimits = {
    maxAttempts: config.maxAttempts,
    maxRuntimeMinutes: config.maxRuntimeMinutes,
    maxIssuesPerRun: config.maxIssuesPerRun,
    frontierLimit: config.frontierLimit,
    concurrency: config.concurrency,
  };
  if (summary.executionMode !== config.executionMode ||
      summary.phaseLabel !== config.phaseLabel ||
      JSON.stringify(summary.limits) !== JSON.stringify(expectedLimits) ||
      JSON.stringify(summary.selectedIssues) !== JSON.stringify(numbers)) {
    fail("preflight state no longer matches the current loop configuration");
  }
  const frontierJson = `${JSON.stringify(frontier, null, 2)}\n`;
  const digest = createHash("sha256").update(frontierJson).digest("hex");
  const generatedAt = Date.parse(summary.generatedAt);
  const expiresAt = Date.parse(summary.expiresAt);
  if (summary.frontierSha256 !== digest ||
      Number.isNaN(generatedAt) ||
      Number.isNaN(expiresAt) ||
      generatedAt > now + 5 * 60 * 1000 ||
      expiresAt <= generatedAt ||
      expiresAt <= now ||
      expiresAt - generatedAt > 15 * 60 * 1000) {
    fail("preflight state is altered, stale, future-dated, or expired");
  }
  return { numbers, expiresAt };
}

function runDirect(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? {
      ...process.env,
      GIT_PAGER: "cat",
      GIT_TERMINAL_PROMPT: "0",
      PAGER: "cat",
    },
    input: options.input,
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
    timeout: options.timeout,
  });
  if (result.error) {
    const suffix = result.error.code === "ETIMEDOUT" ? " (timed out)" : "";
    fail(`${basename(executable)} failed to start${suffix}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    fail(`${basename(executable)} exited with ${result.status}${detail ? `: ${detail}` : ""}`);
  }
  return (result.stdout || "").trim();
}

function git(repoRoot, args, options = {}) {
  if (!runtimeTools) fail("verified toolchain is unavailable");
  return runDirect(
    runtimeTools.git,
    [
      "--no-pager",
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "core.fsmonitor=false",
      "-c",
      "diff.external=",
      "-c",
      "commit.gpgSign=false",
      "-c",
      "tag.gpgSign=false",
      "-c",
      "credential.helper=",
      "-C",
      repoRoot,
      ...args,
    ],
    {
      ...options,
      env: buildGitEnvironment({
        source: process.env,
        githubToken: options.githubToken,
        gitExecutable: runtimeTools.git,
      }),
    },
  );
}

function gh(args, options = {}) {
  if (!runtimeTools) fail("verified toolchain is unavailable");
  return runDirect(runtimeTools.gh, args, {
    ...options,
    env: options.env ?? buildGitHubEnvironment(runtimeTools),
  });
}

function issueFields() {
  return "number,title,state,url,body,labels,assignees,blockedBy";
}

function readLiveIssue(config, number) {
  return JSON.parse(
    gh([
      "issue",
      "view",
      String(number),
      "--repo",
      config.repository,
      "--json",
      issueFields(),
    ]),
  );
}

function readLiveFrontier(config) {
  return JSON.parse(
    gh([
      "issue",
      "list",
      "--repo",
      config.repository,
      "--label",
      config.phaseLabel,
      "--label",
      config.readyLabel,
      "--state",
      "open",
      "--limit",
      String(config.frontierLimit),
      "--json",
      issueFields(),
    ]),
  );
}

function writeIssueComment(loopRoot, config, issueNumber, stem, markdown) {
  const commentsRoot = resolveSafePath(loopRoot, "state/comments", "comment directory");
  mkdirSync(commentsRoot, { recursive: true });
  const path = resolve(commentsRoot, `${stem}-issue-${issueNumber}.md`);
  writeFileSync(path, `${markdown.trim()}\n`);
  gh([
    "issue",
    "comment",
    String(issueNumber),
    "--repo",
    config.repository,
    "--body-file",
    path,
  ]);
}

function bodyWithClaim(body, claimedBy) {
  const match = body.match(/<!--\s*indie-mvp-loop\s*([\s\S]*?)-->/i);
  if (!match) fail("cannot synchronize claim because the issue contract is missing");
  let contract;
  try {
    contract = JSON.parse(match[1]);
  } catch (error) {
    fail(`cannot synchronize invalid issue contract: ${error.message}`);
  }
  contract.claimed_by = claimedBy;
  const replacement = `<!-- indie-mvp-loop\n${JSON.stringify(contract, null, 2)}\n-->`;
  return body.replace(match[0], replacement);
}

function claimLeaseBody(runId, token, status) {
  return `<!-- indie-mvp-claim
${JSON.stringify({
    schema_version: 1,
    run_id: runId,
    token,
    status,
  })}
-->

## Loop claim lease

- Run: \`${runId}\`
- Status: \`${status}\`

## Plain-English summary

This machine-readable comment prevents two unattended loops from working on the same issue.`;
}

function parseClaimLease(comment) {
  const match = (comment.body ?? "").match(
    /<!--\s*indie-mvp-claim\s*([\s\S]*?)-->/i,
  );
  if (!match) return null;
  try {
    const lease = JSON.parse(match[1]);
    if (lease.schema_version !== 1 ||
        typeof lease.run_id !== "string" ||
        typeof lease.token !== "string" ||
        !["active", "released"].includes(lease.status)) {
      return null;
    }
    return {
      commentId: Number(comment.id),
      runId: lease.run_id,
      token: lease.token,
      status: lease.status,
    };
  } catch {
    return null;
  }
}

export function selectClaimWinner(comments) {
  const active = comments
    .map(parseClaimLease)
    .filter((lease) =>
      lease &&
      lease.status === "active" &&
      Number.isSafeInteger(lease.commentId),
    )
    .sort((left, right) => left.commentId - right.commentId);
  if (!active.length) return null;
  const [{ commentId, runId, token }] = active;
  return { commentId, runId, token };
}

function updateClaimLease(config, lease, status) {
  const [owner, repository] = config.repository.split("/");
  gh([
    "api",
    "--method",
    "PATCH",
    `repos/${owner}/${repository}/issues/comments/${lease.commentId}`,
    "-f",
    `body=${claimLeaseBody(lease.runId, lease.token, status)}`,
  ]);
}

function createClaimLease(loopRoot, config, issue, runId) {
  const token = randomUUID();
  const bodiesRoot = resolveSafePath(loopRoot, "state/claims", "claim directory");
  mkdirSync(bodiesRoot, { recursive: true });
  const bodyPath = resolve(bodiesRoot, `${runId}-issue-${issue.number}.md`);
  writeFileSync(bodyPath, `${claimLeaseBody(runId, token, "active")}\n`);
  const url = gh([
    "issue",
    "comment",
    String(issue.number),
    "--repo",
    config.repository,
    "--body-file",
    bodyPath,
  ]);
  const idMatch = url.match(/issuecomment-(\d+)(?:\s|$)/);
  if (!idMatch) fail("GitHub did not return a parseable claim-comment URL");
  const lease = {
    commentId: Number(idMatch[1]),
    runId,
    token,
  };
  const [owner, repository] = config.repository.split("/");
  const pages = JSON.parse(
    gh([
      "api",
      `repos/${owner}/${repository}/issues/${issue.number}/comments`,
      "--paginate",
      "--slurp",
    ]),
  );
  const comments = Array.isArray(pages) && pages.every(Array.isArray)
    ? pages.flat()
    : pages;
  const winner = selectClaimWinner(comments);
  if (!winner ||
      winner.commentId !== lease.commentId ||
      winner.runId !== lease.runId ||
      winner.token !== lease.token) {
    try {
      updateClaimLease(config, lease, "released");
    } catch {
      // The competing active lease remains canonical even if loser cleanup fails.
    }
    fail(`Issue #${issue.number} is held by another unique loop lease`);
  }
  return lease;
}

function writeIssueBody(loopRoot, config, issueNumber, stem, body) {
  const bodiesRoot = resolveSafePath(loopRoot, "state/issue-bodies", "issue body directory");
  mkdirSync(bodiesRoot, { recursive: true });
  const path = resolve(bodiesRoot, `${stem}-issue-${issueNumber}.md`);
  writeFileSync(path, `${body.trim()}\n`);
  gh([
    "issue",
    "edit",
    String(issueNumber),
    "--repo",
    config.repository,
    "--body-file",
    path,
  ]);
}

function releaseClaim(loopRoot, config, issue, login, lease) {
  const errors = [];
  try {
    const live = readLiveIssue(config, issue.number);
    writeIssueBody(
      loopRoot,
      config,
      issue.number,
      "released",
      bodyWithClaim(live.body ?? "", null),
    );
  } catch (error) {
    errors.push(`contract release failed: ${error.message}`);
  }
  try {
    gh([
      "issue",
      "edit",
      String(issue.number),
      "--repo",
      config.repository,
      "--remove-assignee",
      login,
      "--remove-label",
      config.claimLabel,
    ]);
  } catch (error) {
    errors.push(`live claim release failed: ${error.message}`);
  }
  try {
    updateClaimLease(config, lease, "released");
  } catch (error) {
    errors.push(`GitHub claim lease release failed: ${error.message}`);
  }
  if (errors.length) fail(errors.join("; "));
}

function markBlocked(loopRoot, config, issue, message, login, lease) {
  const errors = [];
  let blockedRecorded = false;
  try {
    gh([
      "issue",
      "edit",
      String(issue.number),
      "--repo",
      config.repository,
      "--add-label",
      config.blockedLabel,
      "--remove-label",
      config.readyLabel,
    ]);
    blockedRecorded = true;
  } catch (error) {
    errors.push(`blocked-state update failed: ${error.message}`);
  }
  try {
    writeIssueComment(
      loopRoot,
      config,
      issue.number,
      "blocked",
      `## Autonomous loop blocked\n\n${message}\n\n` +
        `${blockedRecorded
          ? "The unsafe claim will be released after this blocked state is recorded."
          : "The claim remains visible because the blocked state could not be recorded safely."} ` +
        "No Docker or container-runtime action was executed.\n\n" +
        "## Plain-English summary\n\n" +
        "The unattended worker stopped on this ticket and left the evidence for the owner.",
    );
  } catch (error) {
    errors.push(`blocked evidence comment failed: ${error.message}`);
  }
  if (blockedRecorded) {
    try {
      releaseClaim(loopRoot, config, issue, login, lease);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length) fail(errors.join("; "));
}

function claimIssue(loopRoot, config, issue, login, runId) {
  gh([
    "issue",
    "edit",
    String(issue.number),
    "--repo",
    config.repository,
    "--add-assignee",
    login,
    "--add-label",
    config.claimLabel,
  ]);
  const claimed = readLiveIssue(config, issue.number);
  const assignees = (claimed.assignees ?? []).map(({ login: assignee }) => assignee);
  if (!assignees.includes(login) || assignees.some((assignee) => assignee !== login)) {
    try {
      gh([
        "issue",
        "edit",
        String(issue.number),
        "--repo",
        config.repository,
        "--remove-assignee",
        login,
        "--remove-label",
        config.claimLabel,
      ]);
    } catch {
      // Preserve the competing claim for owner inspection if cleanup itself fails.
    }
    fail(`Issue #${issue.number} could not be claimed exclusively`);
  }
  const lease = createClaimLease(loopRoot, config, issue, runId);
  try {
    writeIssueBody(
      loopRoot,
      config,
      issue.number,
      "claimed",
      bodyWithClaim(claimed.body ?? "", `${login}:${runId}:${lease.token}`),
    );
  } catch (error) {
    try {
      updateClaimLease(config, lease, "released");
      gh([
        "issue",
        "edit",
        String(issue.number),
        "--repo",
        config.repository,
        "--remove-assignee",
        login,
        "--remove-label",
        config.claimLabel,
      ]);
    } catch {
      // Leave any partial claim visible when cleanup cannot complete.
    }
    throw error;
  }
  return {
    issue: readLiveIssue(config, issue.number),
    lease,
  };
}

function list(markdownItems, empty = "None recorded.") {
  return markdownItems.length
    ? markdownItems.map((item) => `- ${item}`).join("\n")
    : empty;
}

function buildPrompt(
  basePrompt,
  issue,
  resultPath,
  stopPath,
  executionMode,
) {
  return `${basePrompt.trim()}

## This issue

- Repository: ${issue.url.replace(/\/issues\/\d+$/, "")}
- Issue: #${issue.number} — ${issue.title}
- Canonical URL: ${issue.url}
- Execution mode: ${executionMode}

${issue.body}

## Worker result contract

Do not stage, commit, push, create a pull request, edit the GitHub issue, or execute Docker/container/runtime/deployment work. The runner owns Git and GitHub mutations after your process exits.

Before exiting successfully, write ${resultPath} as JSON with exactly:

- \`schemaVersion\`: \`1\`
- \`summary\`: plain-English completed outcome
- \`includedWork\`: non-empty list of implemented scope
- \`nonGoals\`: non-empty list of deliberately excluded work
- \`verification\`: non-empty list of checks you performed or prepared; do not claim an unexecuted check passed
- \`humanValidation\`: \`required\`, \`recommended\`, or \`not needed\`
- \`humanValidationReason\`: plain-English reason
- \`humanValidationSteps\`: non-empty exact local scenarios
- \`expectedResult\`: expected owner-visible result
- \`failureSigns\`: non-empty list
- \`risks\`: list, which may be empty
- \`rollback\`: exact rollback description

If any acceptance criterion requires a prohibited or unproven command, implement the safe file changes only, state the owner-run verification in the result, and do not execute that command.

If you cannot exit successfully, write ${stopPath} before exiting nonzero. It must contain exactly:

- \`schemaVersion\`: \`1\`
- \`scope\`: \`issue\` only for a bounded \`implementation-failure\`; otherwise \`global\`
- \`code\`: one of \`implementation-failure\`, \`unresolved-owner-decision\`, \`prohibited-action\`, \`unsafe-condition\`, \`secret-required\`, \`spend-required\`, \`docker-runtime-required\`, \`runtime-deployment-required\`, or \`authentication-unavailable\`
- \`message\`: concise evidence

A missing or malformed stop record is treated as a global unsafe stop. Genuine blockers, owner decisions, prohibited actions, and unsafe conditions must use global scope.
`;
}

function pullRequestBody(issue, result, config, askMattPrompt) {
  return `## Canonical issue

Closes no issue automatically. Implements #${issue.number}: ${issue.title}

## Why and user-visible outcome

${result.summary}

## Scope

### Included

${list(result.includedWork)}

### Non-goals

${list(result.nonGoals)}

## Verification

${list(result.verification)}

## Human validation: ${result.humanValidation}

${result.humanValidationReason}

### Steps

${list(result.humanValidationSteps)}

### Expected result

${result.expectedResult}

### Failure signs

${list(result.failureSigns)}

## Risks

${list(result.risks)}

## Rollback

${result.rollback}

## Owner-only work

Docker/container runtime, deployment, secrets, spend, legal assent, MFA, and irreversible ownership actions were excluded.

## Ask Matt handoff

${config.executionMode === "autonomous"
    ? "Deferred to the final autonomous-loop reminder; this PR does not block the remaining eligible queue."
    : `Run this before the next interactive operation:\n\n\`\`\`text\n${askMattPrompt}\n\`\`\``}

## Plain-English summary

Review the focused change and the human-validation note before merging.
`;
}

function exactAskMattPrompt(config, completed, blocked, remaining, stopReason) {
  return `[$ask-matt](/Users/kntl/.agents/skills/ask-matt/SKILL.md) ` +
    `The Indie MVP ${config.phaseLabel} loop for ${config.repository} finished with stop reason: ${stopReason}. ` +
    `Completed PRs: ${completed.map(({ issue, pr }) => `#${issue.number} ${pr}`).join(", ") || "none"}. ` +
    `Blocked/skipped issues: ${blocked.map(({ issue }) => `#${issue.number}`).join(", ") || "none"}. ` +
    `Remaining preflight frontier: ${remaining.join(", ") || "none"}. ` +
    `${config.executionMode === "autonomous"
      ? "No Ask Matt call ran inside the autonomous loop."
      : "The interactive loop is waiting for this required Ask Matt closeout."} ` +
    "Where are we now, what is the next operation, and what exact prompt should be used next?";
}

function renderMorningReport({
  config,
  runId,
  startedAt,
  endedAt,
  stopReason,
  completed,
  blocked,
  remaining,
  askMattPrompt,
}) {
  const completedRows = completed.length
    ? completed.map(({ issue, commit, pr }) =>
      `| #${issue.number} | \`${commit}\` | ${pr} | Static-safe checks passed; see PR |`).join("\n")
    : "| — | — | — | No completed issue |";
  const blockedRows = blocked.length
    ? blocked.map(({ issue, reason }) =>
      `| #${issue.number} | blocked/skipped | ${reason.replace(/\|/g, "\\|")} | Owner review |`).join("\n")
    : "| — | — | No blocked issue | — |";

  return `# Morning Report — ${runId}

## Run

- Phase: ${config.phaseLabel}
- Started: ${startedAt}
- Ended: ${endedAt}
- Stop reason: ${stopReason}

## Completed

| Issue | Commit | Pull request | Verification |
| --- | --- | --- | --- |
${completedRows}

## Blocked, skipped, or retryable

| Issue | State | Evidence | Required action |
| --- | --- | --- | --- |
${blockedRows}

## Remaining frontier

${list(remaining.map((number) => `#${number}`))}

## Owner-only work

Docker/container runtime, deployment, secrets, spend, legal assent, MFA, campaign activation, and irreversible ownership actions remain owner-run.

## Product state and risks

${completed.length} issue(s) produced a pull request; ${blocked.length} issue(s) stopped or were skipped. Read every PR handoff before merge.

## ${config.executionMode === "autonomous"
    ? "Ask Matt reminder for the returning owner"
    : "Required Ask Matt interactive closeout"}

**${config.executionMode === "autonomous"
    ? "This reminder did not block or interrupt the autonomous run. Run it before choosing the next human-directed operation."
    : "The loop is paused at the human boundary. Run this closeout before the next interactive operation."}**

### Current state

The ${config.phaseLabel} loop stopped because: ${stopReason}.

### Next operation

Review this report and the linked pull requests, resolve genuine blockers, then ask Matt for the next frontier.

### Next prompt

\`\`\`text
${askMattPrompt}
\`\`\`
`;
}

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== "--loop-root") {
    fail("Usage: run-phase-loop.mjs --loop-root <generated-loop-directory>");
  }
  return resolve(argv[1]);
}

function runPhase(loopRoot) {
  const repoRoot = dirname(loopRoot);
  const config = validateLoopConfig(
    readJson(resolveSafePath(loopRoot, "config.json", "config path"), "loop config"),
  );
  runtimeTools = verifyToolchain(config);
  const {
    executable: agentExecutable,
    args: agentArgs,
    guard: runtimeGuard,
  } = verifyAgent(config, loopRoot, runtimeTools);
  verifyGitExecutionSnapshot(
    repoRoot,
    runtimeTools,
    runtimeGuard,
    config.repository,
  );
  const safeChecks = validateSafeChecks(
    readJson(
      resolveSafePath(loopRoot, config.safeChecksFile, "safeChecksFile"),
      "safe checks",
    ),
  );
  const frontier = readJson(
    resolveSafePath(loopRoot, "state/frontier.json", "frontier state"),
    "preflight frontier",
  );
  const summary = readJson(
    resolveSafePath(loopRoot, "state/preflight-summary.json", "preflight summary"),
    "preflight summary",
  );
  validatePreflightState(frontier, summary, config);

  const runId = new Date().toISOString().replace(/[-:.]/g, "").replace("Z", "Z");
  const startedAt = new Date().toISOString();
  const deadline = Date.now() + config.maxRuntimeMinutes * 60_000;
  const logsRoot = resolveSafePath(loopRoot, "logs", "logs directory");
  const promptsRoot = resolveSafePath(loopRoot, "state/prompts", "prompt directory");
  mkdirSync(logsRoot, { recursive: true });
  mkdirSync(promptsRoot, { recursive: true });
  const runLog = resolve(logsRoot, `${runId}.log`);
  const basePrompt = readFileSync(
    resolveSafePath(loopRoot, "worker-prompt.md", "worker prompt"),
    "utf8",
  );
  const login = gh(["api", "--hostname", "github.com", "user", "--jq", ".login"]);
  const githubToken = gh(["auth", "token", "--hostname", "github.com"]);
  const liveFrontier = validateFrontierSnapshot(
    readLiveFrontier(config),
    config,
  );
  if (liveFrontier.errors.length) {
    fail(`Unsafe live frontier:\n${liveFrontier.errors.join("\n")}`);
  }
  const launchGateErrors = validateLaunchGateEvidence(
    liveFrontier.selected,
    config,
    (number) => readLiveIssue(config, number),
  );
  if (launchGateErrors.length) {
    fail(`Unsafe live Product Launch Map gate:\n${launchGateErrors.join("\n")}`);
  }
  const expectedNumbers = frontier.map(({ number }) => number);
  const liveNumbers = liveFrontier.selected.map(({ number }) => number);
  if (JSON.stringify(liveNumbers) !== JSON.stringify(expectedNumbers)) {
    fail("Live GitHub frontier changed after preflight; rerun preflight");
  }
  const completed = [];
  const blocked = [];
  let attempts = 0;
  let stopReason = "eligible frontier exhausted";

  appendFileSync(runLog, `Run ${runId} started for ${config.phaseLabel}.\n`);

  for (const snapshotIssue of frontier) {
    if (attempts >= config.maxAttempts) {
      stopReason = "attempt limit reached";
      break;
    }
    if (Date.now() >= deadline) {
      stopReason = "runtime limit reached";
      break;
    }
    if (existsSync(resolveSafePath(loopRoot, "state/STOP", "stop marker"))) {
      stopReason = "owner stop marker observed between issues";
      break;
    }

    attempts += 1;
    let claimed = false;
    let claimLease;
    let canContinueIndependent = false;
    let liveIssue = snapshotIssue;
    try {
      liveIssue = readLiveIssue(config, snapshotIssue.number);
      const liveValidation = validateSingleIssueSnapshot(liveIssue, config);
      if (liveValidation.errors.length || liveValidation.selected.length !== 1) {
        fail(liveValidation.errors.join("; ") || "issue is no longer eligible");
      }
      const liveGateErrors = validateLaunchGateEvidence(
        [liveIssue],
        config,
        (number) => readLiveIssue(config, number),
      );
      if (liveGateErrors.length) {
        fail(`Live Product Launch Map gate changed: ${liveGateErrors.join("; ")}`);
      }
      const claim = claimIssue(loopRoot, config, liveIssue, login, runId);
      liveIssue = claim.issue;
      claimLease = claim.lease;
      claimed = true;

      const branch = branchNameForIssue(
        config.branchPrefix,
        config.phaseLabel,
        liveIssue.number,
      );
      const worktree = resolveSafePath(
        loopRoot,
        `${config.worktreeDirectory}/${runId}-issue-${liveIssue.number}`,
        "issue worktree",
      );
      mkdirSync(dirname(worktree), { recursive: true });
      verifyGitExecutionSnapshot(
        repoRoot,
        runtimeTools,
        runtimeGuard,
        config.repository,
      );
      git(repoRoot, ["worktree", "add", "-b", branch, worktree, config.baseBranch]);

      const resultPath = resolve(worktree, ".indie-mvp-agent-result.json");
      const stopPath = resolve(worktree, ".indie-mvp-agent-stop.json");
      const prompt = buildPrompt(
        basePrompt,
        liveIssue,
        resultPath,
        stopPath,
        config.executionMode,
      );
      const promptPath = resolve(promptsRoot, `${runId}-issue-${liveIssue.number}.md`);
      writeFileSync(promptPath, prompt);
      const resolvedArgs = substituteAgentArguments(agentArgs, {
        WORKTREE: worktree,
        ISSUE_NUMBER: String(liveIssue.number),
        REPOSITORY: config.repository,
        BRANCH: branch,
      });
      const remainingMs = Math.max(1, deadline - Date.now());
      const agentResult = spawnSync(agentExecutable, resolvedArgs, {
        cwd: worktree,
        encoding: "utf8",
        env: buildAgentEnvironment(),
        input: prompt,
        maxBuffer: 20 * 1024 * 1024,
        shell: false,
        timeout: remainingMs,
      });
      appendFileSync(
        runLog,
        `\n## Issue #${liveIssue.number}\n${agentResult.stdout || ""}\n${agentResult.stderr || ""}\n`,
      );
      if (agentResult.error) {
        fail(`agent process failed: ${agentResult.error.message}`);
      }
      if (agentResult.status !== 0) {
        if (!existsSync(stopPath)) {
          fail(`agent process exited with ${agentResult.status} without a typed stop record`);
        }
        const workerStop = validateWorkerStop(readJson(stopPath, "worker stop"));
        unlinkSync(stopPath);
        canContinueIndependent =
          workerStop.scope === "issue" &&
          workerStop.code === "implementation-failure";
        fail(`agent stop ${workerStop.code}: ${workerStop.message}`);
      }
      if (existsSync(stopPath)) {
        const workerStop = validateWorkerStop(readJson(stopPath, "worker stop"));
        unlinkSync(stopPath);
        fail(`agent exited successfully but also declared stop ${workerStop.code}: ${workerStop.message}`);
      }
      if (!existsSync(resultPath)) {
        fail("agent did not write .indie-mvp-agent-result.json");
      }
      const workerResult = validateWorkerResult(readJson(resultPath, "worker result"));
      unlinkSync(resultPath);

      verifyGitExecutionSnapshot(
        worktree,
        runtimeTools,
        runtimeGuard,
        config.repository,
      );
      runSafeChecks(safeChecks, worktree, runtimeTools);
      const changes = git(worktree, ["status", "--porcelain"]);
      if (!changes) fail("agent completed without a repository change");

      git(worktree, ["add", "-A"]);
      git(
        worktree,
        ["diff", "--cached", "--check", "--no-ext-diff", "--no-textconv"],
      );
      const commitSubject = `issue #${liveIssue.number}: ${liveIssue.title}`
        .replace(/\s+/g, " ")
        .slice(0, 120);
      git(worktree, ["commit", "-m", commitSubject]);
      const commit = git(worktree, ["rev-parse", "--short=12", "HEAD"]);
      git(
        worktree,
        ["push", "origin", `HEAD:refs/heads/${branch}`],
        { githubToken },
      );

      const remainingAfterCurrent = remainingIssueNumbers(
        frontier,
        completed,
        blocked,
        liveIssue.number,
      );
      const provisionalAskMattPrompt = exactAskMattPrompt(
        config,
        [...completed, { issue: liveIssue, pr: "this pull request" }],
        blocked,
        remainingAfterCurrent,
        "interactive handoff",
      );
      const prBodyPath = resolve(promptsRoot, `${runId}-issue-${liveIssue.number}-pr.md`);
      writeFileSync(
        prBodyPath,
        pullRequestBody(liveIssue, workerResult, config, provisionalAskMattPrompt),
      );
      const pr = gh([
        "pr",
        "create",
        "--repo",
        config.repository,
        "--base",
        config.baseBranch,
        "--head",
        branch,
        "--title",
        liveIssue.title,
        "--body-file",
        prBodyPath,
      ]);
      const completedAskMattPrompt = exactAskMattPrompt(
        config,
        [...completed, { issue: liveIssue, pr }],
        blocked,
        remainingAfterCurrent,
        "interactive handoff",
      );
      writeFileSync(
        prBodyPath,
        pullRequestBody(liveIssue, workerResult, config, completedAskMattPrompt),
      );
      gh([
        "pr",
        "edit",
        pr,
        "--repo",
        config.repository,
        "--body-file",
        prBodyPath,
      ]);
      gh([
        "issue",
        "edit",
        String(liveIssue.number),
        "--repo",
        config.repository,
        "--remove-label",
        config.readyLabel,
      ]);
      writeIssueComment(
        loopRoot,
        config,
        liveIssue.number,
        "completed",
        `## Loop implementation evidence\n\n` +
          `- Commit: \`${commit}\`\n- Pull request: ${pr}\n` +
          `- Human validation: ${workerResult.humanValidation} — ${workerResult.humanValidationReason}\n\n` +
          `${config.executionMode === "autonomous"
            ? "Ask Matt was not invoked and did not block the queue. The final morning report contains the exact owner prompt."
            : `Run the interactive Ask Matt closeout before the next operation:\n\n\`\`\`text\n${completedAskMattPrompt}\n\`\`\``}\n\n` +
          "## Plain-English summary\n\n" +
          "The focused implementation is ready for pull-request review.",
      );
      releaseClaim(loopRoot, config, liveIssue, login, claimLease);
      claimed = false;
      completed.push({ issue: liveIssue, commit, pr });

      if (config.executionMode === "interactive") {
        stopReason = "interactive Ask Matt handoff required after completed PR";
        break;
      }
    } catch (error) {
      const reason = error.message.replace(/\s+/g, " ").slice(0, 1000);
      appendFileSync(runLog, `Issue #${liveIssue.number} stopped: ${reason}\n`);
      blocked.push({ issue: liveIssue, reason });
      if (claimed) {
        try {
          markBlocked(loopRoot, config, liveIssue, reason, login, claimLease);
        } catch (markError) {
          appendFileSync(
            runLog,
            `Could not record blocked state for #${liveIssue.number}: ${markError.message}\n`,
          );
          stopReason = "GitHub blocker recording failed";
          break;
        }
      }
      if (config.executionMode === "interactive") {
        stopReason = "interactive issue stopped for owner review";
        break;
      }
      if (!canContinueIndependent) {
        stopReason = `global unsafe stop: ${reason}`;
        break;
      }
    }
  }

  const handled = new Set([
    ...completed.map(({ issue }) => issue.number),
    ...blocked.map(({ issue }) => issue.number),
  ]);
  const remaining = frontier
    .map(({ number }) => number)
    .filter((number) => !handled.has(number));
  if (stopReason === "eligible frontier exhausted" && remaining.length) {
    stopReason = "bounded frontier processing stopped";
  }
  const endedAt = new Date().toISOString();
  const askMattPrompt = exactAskMattPrompt(
    config,
    completed,
    blocked,
    remaining,
    stopReason,
  );
  const report = renderMorningReport({
    config,
    runId,
    startedAt,
    endedAt,
    stopReason,
    completed,
    blocked,
    remaining,
    askMattPrompt,
  });
  writeFileSync(
    resolveSafePath(loopRoot, "morning-report.md", "morning report"),
    report,
  );
  writeFileSync(
    resolveSafePath(loopRoot, "state/last-run.json", "last run state"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        runId,
        phaseLabel: config.phaseLabel,
        executionMode: config.executionMode,
        startedAt,
        endedAt,
        stopReason,
        attempts,
        completed: completed.map(({ issue, commit, pr }) => ({
          issue: issue.number,
          commit,
          pr,
        })),
        blocked: blocked.map(({ issue, reason }) => ({
          issue: issue.number,
          reason,
        })),
        remaining,
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    `Phase loop finished: ${stopReason}. Read ${resolve(loopRoot, "morning-report.md")}.\n`,
  );
}

const isMain = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    runPhase(parseArgs(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
