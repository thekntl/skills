import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  buildPreflightGitEnvironment,
  resolveSafePath,
  validateAgentArguments,
  validateApprovalWindow,
  validateFrontierSnapshot,
  validateLaunchGateEvidence,
  validateSingleIssueSnapshot,
  validateLoopConfig,
  validateSafeChecks,
} from "./loop-safety.mjs";
import { emptyLoopContract } from "./loop-contract.mjs";

const baseConfig = {
  schemaVersion: 1,
  repository: "thekntl/example",
  launchMapIssueUrl: "https://github.com/thekntl/example/issues/1",
  phaseLabel: "phase:frontend",
  readyLabel: "ready-for-agent",
  blockedLabel: "blocked",
  decisionLabel: "decision",
  ownerActionLabel: "owner-action",
  claimLabel: "loop-claimed",
  executionMode: "autonomous",
  baseBranch: "main",
  branchPrefix: "codex/",
  worktreeDirectory: "state/worktrees",
  maxAttempts: 6,
  maxRuntimeMinutes: 480,
  maxIssuesPerRun: 6,
  frontierLimit: 50,
  concurrency: 1,
  tools: {
    node: { executable: "/opt/example/node", sha256: "1".repeat(64) },
    git: { executable: "/opt/example/git", sha256: "2".repeat(64) },
    gitRemoteHttps: {
      executable: "/opt/example/git-remote-https",
      sha256: "5".repeat(64),
    },
    gh: { executable: "/opt/example/gh", sha256: "3".repeat(64) },
    bash: { executable: "/opt/example/bash", sha256: "4".repeat(64) },
  },
  agent: {
    executable: "/opt/example/codex",
    sha256: "a".repeat(64),
    argumentsFile: "agent-args.json",
    argumentsSha256: "b".repeat(64),
    runtimeGuardFile: "agent-runtime-guard.json",
    runtimeGuardSha256: "c".repeat(64),
  },
  safeChecksFile: "safe-checks.json",
  glossary: {
    context: "CONTEXT.md",
    glossary: "docs/GLOSSARY.md",
    output: "docs/glossary.html",
  },
};

const contract = {
  ...emptyLoopContract("phase:frontend"),
  validation_route: "build-first",
  validation_verdict: null,
  public_product_clock_started_at: "2026-07-20T00:00:00.000Z",
  launch_gate_evidence_url:
    "https://github.com/thekntl/example/issues/1",
};

test("preflight Git consumer replaces a hostile PATH with the verified Git path", () => {
  const environment = buildPreflightGitEnvironment(
    { git: "/verified/git/bin/git" },
    {
      HOME: "/Users/example",
      PATH: "/hostile/bin",
      NODE_OPTIONS: "--require=unsafe.js",
      DOCKER_HOST: "tcp://runtime.example",
    },
  );

  assert.equal(environment.PATH, "/verified/git/bin:/usr/bin:/bin");
  assert.equal(environment.GIT_PAGER, "");
  assert.equal(environment.NODE_OPTIONS, undefined);
  assert.equal(environment.DOCKER_HOST, undefined);
});

function issue(overrides = {}, contractOverrides = {}) {
  const loopContract = { ...contract, ...contractOverrides };
  return {
    number: 42,
    title: "Implement the approved shell",
    state: "OPEN",
    url: "https://github.com/thekntl/example/issues/42",
    assignees: [],
    blockedBy: [],
    labels: [
      { name: "phase:frontend" },
      { name: "ready-for-agent" },
    ],
    body:
      "## Problem\nThe approved product surface is missing.\n\n" +
      "## User outcome\nThe user can complete the approved flow.\n\n" +
      "## Decision evidence\nConfirmed frontend phase issue.\n\n" +
      "## Scope\n- Build the approved surface.\n\n" +
      "## Non-goals\n- Do not change backend behavior.\n\n" +
      "## Acceptance criteria\n- [ ] The approved flow works.\n\n" +
      "## Affected surfaces\nFrontend shell.\n\n" +
      "## Dependencies and blockers\nNone.\n\n" +
      "## Verification\n- Automated: static-safe checks\n" +
      "- Human validation: `recommended`\n" +
      "- Scenario: Complete the primary flow.\n" +
      "- Expected result: The approved outcome appears.\n" +
      "- Failure signs: The flow stops or clips.\n" +
      "- Target runtime: iOS Simulator\n\n" +
      "## Boundaries\nNo secrets, spend, deployment, or Docker runtime.\n\n" +
      `<!-- indie-mvp-loop\n${JSON.stringify(loopContract, null, 2)}\n-->\n\n` +
      "## Plain-English summary\nBuild the approved shell.",
    ...overrides,
  };
}

test("loop config rejects free-form command escape hatches", () => {
  for (const key of ["agentCommand", "buildCommand", "testCommand"]) {
    assert.throws(
      () => validateLoopConfig({ ...baseConfig, [key]: "wrapper-that-runs-anything" }),
      new RegExp(key),
    );
  }
});

test("agent arguments use one fixed sandboxed direct-exec contract", () => {
  const args = [
    "exec",
    "--sandbox",
    "workspace-write",
    "-C",
    "%WORKTREE%",
    "--skip-git-repo-check",
    "-",
  ];
  assert.deepEqual(validateAgentArguments(args), args);
  assert.throws(
    () => validateAgentArguments([
      "exec",
      "--dangerously-bypass-approvals-and-sandbox",
      "-",
    ]),
    /fixed direct Codex exec contract/,
  );
});

test("loop config enforces bounded autonomous execution", () => {
  assert.deepEqual(validateLoopConfig(baseConfig), baseConfig);

  for (const invalid of [
    { maxAttempts: 0 },
    { maxRuntimeMinutes: 1441 },
    { maxIssuesPerRun: 51 },
    { frontierLimit: 0 },
    { concurrency: 2 },
    { executionMode: "unbounded" },
  ]) {
    assert.throws(() => validateLoopConfig({ ...baseConfig, ...invalid }));
  }
});

test("runtime approval must be current, forward, and no longer than 30 days", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");
  assert.deepEqual(
    validateApprovalWindow(
      "2026-07-27T11:00:00.000Z",
      "2026-08-01T11:00:00.000Z",
      now,
    ),
    {
      approvedAt: Date.parse("2026-07-27T11:00:00.000Z"),
      expiresAt: Date.parse("2026-08-01T11:00:00.000Z"),
    },
  );
  assert.throws(
    () => validateApprovalWindow(
      "2026-07-27T11:00:00.000Z",
      "2026-07-27T10:00:00.000Z",
      now,
    ),
    /reversed/,
  );
});

test("frontier accepts only an unclaimed, decision-complete issue in the active phase", () => {
  const result = validateFrontierSnapshot(
    [issue()],
    validateLoopConfig(baseConfig),
  );

  assert.deepEqual(result.selected.map(({ number }) => number), [42]);
  assert.deepEqual(result.errors, []);
});

test("frontier rejects every prohibited queue condition", () => {
  const cases = [
    ["wrong phase", {}, { phase: "phase:backend" }],
    ["blocked label", { labels: [...issue().labels, { name: "blocked" }] }, {}],
    ["decision label", { labels: [...issue().labels, { name: "decision" }] }, {}],
    ["owner label", { labels: [...issue().labels, { name: "owner-action" }] }, {}],
    ["claim label", { labels: [...issue().labels, { name: "loop-claimed" }] }, {}],
    ["live blocker", { blockedBy: [{ number: 12, state: "OPEN" }] }, {}],
    ["GitHub assignee", { assignees: [{ login: "agent" }] }, {}],
    ["contract claim", {}, { claimed_by: "agent" }],
    ["dependency", {}, { blocked_by: [12] }],
    ["approved cross-phase dependency", {}, { approved_cross_phase_dependencies: [12] }],
    ["decision", {}, { unresolved_decisions: ["Choose storage"] }],
    ["owner action", {}, { owner_only_actions: ["Accept terms"] }],
    ["secret", {}, { requires_secret: true }],
    ["spend", {}, { requires_spend: true }],
    ["Docker runtime", {}, { requires_docker_runtime: true }],
    ["deployment/runtime", {}, { requires_deployment_or_runtime: true }],
  ];

  for (const [name, issueOverrides, contractOverrides] of cases) {
    const result = validateFrontierSnapshot(
      [issue(issueOverrides, contractOverrides)],
      validateLoopConfig(baseConfig),
    );
    assert.equal(result.selected.length, 0, name);
    assert.equal(result.errors.length, 1, name);
  }
});

test("frontier rejects unknown issue-contract keys", () => {
  const result = validateFrontierSnapshot(
    [issue({}, { requires_docker_runtim: true })],
    baseConfig,
  );

  assert.equal(result.selected.length, 0);
  assert.match(result.errors.join("\n"), /unsupported key.*requires_docker_runtim/);
});

test("validate-first frontend requires an activating verdict", () => {
  const result = validateFrontierSnapshot(
    [
      issue({}, {
        validation_route: "validate-first",
        validation_verdict: "ITERATE",
      }),
    ],
    baseConfig,
  );

  assert.equal(result.selected.length, 0);
  assert.match(result.errors.join("\n"), /GO or BUILD-TO-LEARN/);
});

test("frontend queue is bound to the live Product Launch Map gate", () => {
  const candidate = issue();
  const launchMap = {
    number: 1,
    state: "OPEN",
    body: `<!-- indie-mvp-launch-gate
${JSON.stringify({
  schema_version: 1,
  validation_route: "build-first",
  validation_verdict: null,
  public_product_clock_started_at: "2026-07-20T00:00:00.000Z",
  frontend_delivery_active: true,
}, null, 2)}
-->`,
  };

  assert.deepEqual(
    validateLaunchGateEvidence([candidate], baseConfig, () => launchMap),
    [],
  );
  assert.match(
    validateLaunchGateEvidence(
      [candidate],
      baseConfig,
      () => ({
        ...launchMap,
        body: launchMap.body.replace(
          '"frontend_delivery_active": true',
          '"frontend_delivery_active": false',
        ),
      }),
    ).join("\n"),
    /does not match/,
  );
});

test("safe path resolution rejects an existing symlink component", () => {
  const root = mkdtempSync(join(tmpdir(), "indie-mvp-safe-path-"));
  const realState = join(root, "real-state");
  mkdirSync(realState);
  symlinkSync(realState, join(root, "state"));

  assert.throws(
    () => resolveSafePath(root, "state/frontier.json", "frontier"),
    /symbolic link/,
  );
});

test("frontier requires the machine-readable contract and plain-English summary", () => {
  const noContract = issue({ body: "## Plain-English summary\nMissing contract." });
  const noSummary = issue({
    body: `<!-- indie-mvp-loop\n${JSON.stringify(contract)}\n-->`,
  });
  const emptySummary = issue({
    body:
      `<!-- indie-mvp-loop\n${JSON.stringify(contract)}\n-->\n\n` +
      "## Plain-English summary\n",
  });
  const unresolved = issue({
    body:
      `<!-- indie-mvp-loop\n${JSON.stringify(contract)}\n-->\n\n` +
      "## Plain-English summary\n{{SIMPLE_EXPLANATION}}",
  });

  assert.match(
    validateFrontierSnapshot([noContract], baseConfig).errors.join("\n"),
    /contract/,
  );
  assert.match(
    validateFrontierSnapshot([noSummary], baseConfig).errors.join("\n"),
    /Plain-English summary/,
  );
  assert.match(
    validateFrontierSnapshot([emptySummary], baseConfig).errors.join("\n"),
    /Plain-English summary/,
  );
  assert.match(
    validateFrontierSnapshot([unresolved], baseConfig).errors.join("\n"),
    /placeholder/,
  );
});

test("frontier rejects an incomplete implementation issue", () => {
  const incomplete = issue({
    body:
      `<!-- indie-mvp-loop\n${JSON.stringify(contract)}\n-->\n\n` +
      "## Plain-English summary\nLooks ready but lacks implementation sections.",
  });
  const result = validateFrontierSnapshot([incomplete], baseConfig);

  assert.equal(result.selected.length, 0);
  assert.match(result.errors.join("\n"), /Problem section/);
  assert.match(result.errors.join("\n"), /Acceptance criteria/);
  assert.match(result.errors.join("\n"), /Verification section/);
});

test("frontier fails closed when the live query may be truncated", () => {
  const tinyLimit = {
    ...baseConfig,
    frontierLimit: 1,
    maxIssuesPerRun: 1,
  };
  const result = validateFrontierSnapshot([issue()], tinyLimit);

  assert.equal(result.selected.length, 0);
  assert.match(result.errors[0], /frontierLimit/);
});

test("single-issue revalidation is independent of frontier truncation", () => {
  const tinyLimit = {
    ...baseConfig,
    frontierLimit: 1,
    maxIssuesPerRun: 1,
  };
  const result = validateSingleIssueSnapshot(issue(), tinyLimit);

  assert.deepEqual(result.selected.map(({ number }) => number), [42]);
  assert.deepEqual(result.errors, []);
});

test("safe checks allow static parsers only and reject arbitrary commands", () => {
  const checks = [
    { type: "git-diff-check" },
    { type: "node-syntax", paths: ["scripts/example.mjs"] },
    { type: "shell-syntax", paths: ["scripts/example.sh"] },
  ];

  assert.deepEqual(validateSafeChecks(checks), checks);
  assert.throws(() =>
    validateSafeChecks([{ type: "command", command: "make test" }]),
  );
  assert.throws(() =>
    validateSafeChecks([{ type: "go-test", paths: ["./..."] }]),
  );
});
