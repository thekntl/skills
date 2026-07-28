import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  buildPreflightGitEnvironment,
  collectLaunchProjectReadback,
  collectLaunchIssueTree,
  issueTypeReadbackArgs,
  resolveSafePath,
  validateAgentArguments,
  validateApprovalWindow,
  validateFrontierSnapshot,
  validateLaunchGateEvidence,
  validateLaunchProjectReadback,
  validateIssueTypeReadback,
  validateSingleIssueSnapshot,
  validateLoopConfig,
  validateSafeChecks,
} from "./loop-safety.mjs";
import { emptyLoopContract } from "./loop-contract.mjs";

const baseConfig = {
  schemaVersion: 1,
  repository: "thekntl/example",
  launchMapIssueUrl: "https://github.com/thekntl/example/issues/1",
  phaseIssueNumber: 8,
  milestoneTitle: "MVP public launch — 2026-08-02",
  milestoneDueDate: "2026-08-02",
  issueType: {
    mode: "required",
    name: "Task",
  },
  launchProject: {
    mode: "required",
    owner: "thekntl",
    number: 3,
    id: "PVT_example",
    title: "Example — MVP Launch",
    statusFieldId: "PVTSSF_example",
    statusOptionIds: {
      ready: "ready-option",
      inProgress: "in-progress-option",
      inReview: "in-review-option",
      blocked: "blocked-option",
    },
  },
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
    issueType: { name: "Task" },
    parent: { number: 8 },
    milestone: {
      title: "MVP public launch — 2026-08-02",
      dueOn: "2026-08-02T23:59:59Z",
    },
    projectItems: [
      {
        title: "Example — MVP Launch",
        status: { name: "Ready" },
      },
    ],
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

test("frontier fails closed on native planning drift", () => {
  const cases = [
    ["missing parent", { parent: null }, /native parent/],
    ["wrong parent", { parent: { number: 9 } }, /native parent/],
    ["missing milestone", { milestone: null }, /milestone/],
    ["missing issue type", { issueType: null }, /issue type/],
    ["wrong issue type", { issueType: { name: "Bug" } }, /issue type/],
    [
      "wrong milestone",
      {
        milestone: {
          title: "Post-launch stabilization — 2026-08-09",
          dueOn: "2026-08-09T23:59:59Z",
        },
      },
      /milestone/,
    ],
    [
      "wrong milestone due date",
      {
        milestone: {
          title: "MVP public launch — 2026-08-02",
          dueOn: "2026-08-03T23:59:59Z",
        },
      },
      /due date/,
    ],
    ["missing Project", { projectItems: [] }, /launch Project/],
    [
      "wrong Project Status",
      {
        projectItems: [
          {
            title: "Example — MVP Launch",
            status: { name: "Backlog" },
          },
        ],
      },
      /Project Status/,
    ],
  ];

  for (const [name, overrides, expected] of cases) {
    const result = validateFrontierSnapshot(
      [issue(overrides)],
      validateLoopConfig(baseConfig),
    );
    assert.equal(result.selected.length, 0, name);
    assert.match(result.errors.join("\n"), expected, name);
  }
});

test("loop config permits only an explicit documented tiny-Project skip", () => {
  const tinySkip = {
    mode: "tiny-skip",
    owner: "thekntl",
    title: "Example — MVP Launch",
    mapChildCount: 4,
    repositoryCount: 1,
    reason: "One map plus four child issues in one repository.",
  };

  assert.deepEqual(
    validateLoopConfig({ ...baseConfig, launchProject: tinySkip }).launchProject,
    tinySkip,
  );
  assert.throws(
    () => validateLoopConfig({
      ...baseConfig,
      launchProject: { ...tinySkip, reason: "" },
    }),
    /launchProject.reason/,
  );
});

test("required Project readback binds identity, membership, and Ready status", () => {
  const snapshots = {
    project: {
      id: "PVT_example",
      number: 3,
      title: "Example — MVP Launch",
    },
    items: {
      totalCount: 1,
      items: [
        {
          id: "PVTI_issue",
          content: { url: "https://github.com/thekntl/example/issues/42" },
          status: "Ready",
        },
      ],
    },
  };

  assert.deepEqual(
    validateLaunchProjectReadback([issue()], baseConfig, snapshots),
    [],
  );
  assert.match(
    validateLaunchProjectReadback(
      [issue()],
      baseConfig,
      {
        ...snapshots,
        project: { ...snapshots.project, id: "PVT_wrong" },
      },
    ).join("\n"),
    /identity/,
  );
});

test("one canonical helper owns required and tiny Project readback commands", () => {
  const requiredCalls = [];
  const required = collectLaunchProjectReadback(baseConfig, (args) => {
    requiredCalls.push(args);
    return args[1] === "view"
      ? { id: "PVT_example", number: 3, title: "Example — MVP Launch" }
      : { totalCount: 0, items: [] };
  });
  assert.equal(required.project.id, "PVT_example");
  assert.deepEqual(
    requiredCalls.map((args) => args.slice(0, 2)),
    [
      ["project", "view"],
      ["project", "item-list"],
    ],
  );

  const tinyConfig = {
    ...baseConfig,
    launchProject: {
      mode: "tiny-skip",
      owner: "thekntl",
      title: "Example — MVP Launch",
      mapChildCount: 0,
      repositoryCount: 1,
      reason: "Only the map exists in one repository.",
    },
  };
  const tinyCalls = [];
  const tiny = collectLaunchProjectReadback(tinyConfig, (args) => {
    tinyCalls.push(args);
    if (args[0] === "project") {
      return { totalCount: 0, projects: [] };
    }
    return {
      number: 1,
      url: "https://github.com/thekntl/example/issues/1",
      subIssues: [],
      subIssuesSummary: { total: 0 },
    };
  });
  assert.equal(tiny.launchTree.issues.length, 1);
  assert.deepEqual(
    tinyCalls.map((args) => args.slice(0, 2)),
    [
      ["project", "list"],
      ["issue", "view"],
    ],
  );
});

test("tiny Project skip is rejected when live scope is not tiny or Project exists", () => {
  const tinyConfig = {
    ...baseConfig,
    launchProject: {
      mode: "tiny-skip",
      owner: "thekntl",
      title: "Example — MVP Launch",
      mapChildCount: 4,
      repositoryCount: 1,
      reason: "One map plus four child issues in one repository.",
    },
  };
  const snapshots = {
    projects: { totalCount: 0, projects: [] },
    launchTree: {
      rootUrl: "https://github.com/thekntl/example/issues/1",
      issues: [
        { url: "https://github.com/thekntl/example/issues/1" },
        { url: "https://github.com/thekntl/example/issues/2" },
        { url: "https://github.com/thekntl/example/issues/3" },
        { url: "https://github.com/thekntl/example/issues/4" },
        { url: "https://github.com/thekntl/example/issues/5" },
      ],
      repositoryCount: 1,
    },
  };

  assert.deepEqual(
    validateLaunchProjectReadback([issue()], tinyConfig, snapshots),
    [],
  );
  assert.match(
    validateLaunchProjectReadback(
      [issue()],
      tinyConfig,
      {
        ...snapshots,
        launchTree: {
          ...snapshots.launchTree,
          issues: [
            ...snapshots.launchTree.issues,
            { url: "https://github.com/thekntl/example/issues/6" },
          ],
        },
      },
    ).join("\n"),
    /at most four/,
  );
  assert.match(
    validateLaunchProjectReadback(
      [issue()],
      tinyConfig,
      {
        ...snapshots,
        projects: {
          totalCount: 1,
          projects: [{ title: "Example — MVP Launch" }],
        },
      },
    ).join("\n"),
    /already exists/,
  );
});

test("tiny Project skip traverses nested launch scope instead of direct children only", () => {
  const nodes = new Map([
    [
      "https://github.com/thekntl/example/issues/1",
      {
        number: 1,
        url: "https://github.com/thekntl/example/issues/1",
        subIssuesSummary: { total: 4 },
        subIssues: [2, 3, 4, 5].map((number) => ({
          number,
          url: `https://github.com/thekntl/example/issues/${number}`,
        })),
      },
    ],
    ...[2, 4, 5].map((number) => [
      `https://github.com/thekntl/example/issues/${number}`,
      {
        number,
        url: `https://github.com/thekntl/example/issues/${number}`,
        subIssuesSummary: { total: 0 },
        subIssues: [],
      },
    ]),
    [
      "https://github.com/thekntl/example/issues/3",
      {
        number: 3,
        url: "https://github.com/thekntl/example/issues/3",
        subIssuesSummary: { total: 1 },
        subIssues: [
          {
            number: 6,
            url: "https://github.com/thekntl/example/issues/6",
          },
        ],
      },
    ],
    [
      "https://github.com/thekntl/example/issues/6",
      {
        number: 6,
        url: "https://github.com/thekntl/example/issues/6",
        subIssuesSummary: { total: 0 },
        subIssues: [],
      },
    ],
  ]);
  const launchTree = collectLaunchIssueTree(
    baseConfig,
    (url) => nodes.get(url),
  );
  const tinyConfig = {
    ...baseConfig,
    launchProject: {
      mode: "tiny-skip",
      owner: "thekntl",
      title: "Example — MVP Launch",
      mapChildCount: 4,
      repositoryCount: 1,
      reason: "One map plus four child issues in one repository.",
    },
  };

  assert.equal(launchTree.issues.length, 6);
  assert.match(
    validateLaunchProjectReadback(
      [issue()],
      tinyConfig,
      {
        projects: { totalCount: 0, projects: [] },
        launchTree,
      },
    ).join("\n"),
    /at most four/,
  );
});

test("issue type availability is discovered live", () => {
  assert.deepEqual(
    issueTypeReadbackArgs(baseConfig),
    [
      "api",
      "--hostname",
      "github.com",
      "-H",
      "X-GitHub-Api-Version: 2026-03-10",
      "--paginate",
      "--slurp",
      "repos/thekntl/example/issue-types?per_page=100",
    ],
  );
  assert.deepEqual(
    validateIssueTypeReadback(baseConfig, [{ name: "Task" }, { name: "Bug" }]),
    [],
  );
  assert.match(
    validateIssueTypeReadback(baseConfig, []).join("\n"),
    /configured native issue type Task is unavailable/,
  );
  const unavailableConfig = {
    ...baseConfig,
    issueType: {
      mode: "unavailable",
      reason: "The live repository capability query returned no issue types.",
    },
  };
  assert.deepEqual(validateIssueTypeReadback(unavailableConfig, []), []);
  assert.match(
    validateIssueTypeReadback(unavailableConfig, [{ name: "Task" }]).join("\n"),
    /available/,
  );
});

test("loop config requires a real milestone due date", () => {
  assert.throws(
    () => validateLoopConfig({ ...baseConfig, milestoneDueDate: "soon" }),
    /milestoneDueDate/,
  );
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
