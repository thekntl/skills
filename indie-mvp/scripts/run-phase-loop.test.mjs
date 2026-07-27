import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import {
  branchNameForIssue,
  buildAgentEnvironment,
  remainingIssueNumbers,
  selectClaimWinner,
  substituteAgentArguments,
  validatePreflightState,
  validateWorkerResult,
  validateWorkerStop,
} from "./run-phase-loop.mjs";

test("agent arguments substitute only declared scalar tokens", () => {
  assert.deepEqual(
    substituteAgentArguments(
      ["exec", "-C", "%WORKTREE%", "--issue", "%ISSUE_NUMBER%", "-"],
      {
        WORKTREE: "/tmp/worktree",
        ISSUE_NUMBER: "42",
        REPOSITORY: "thekntl/example",
        BRANCH: "codex/frontend-issue-42",
      },
    ),
    ["exec", "-C", "/tmp/worktree", "--issue", "42", "-"],
  );
  assert.throws(
    () => substituteAgentArguments(["exec", "%UNKNOWN%"], {}),
    /unsupported token/,
  );
});

test("branch names remain bounded and issue-specific", () => {
  assert.equal(
    branchNameForIssue("codex/", "phase:frontend", 42),
    "codex/frontend-issue-42",
  );
  assert.match(
    branchNameForIssue("codex/", "phase:Very Long / Unsafe", 7),
    /^codex\/very-long-unsafe-issue-7$/,
  );
});

test("Ask Matt remaining frontier excludes the current and handled issues", () => {
  assert.deepEqual(
    remainingIssueNumbers(
      [{ number: 10 }, { number: 11 }, { number: 12 }, { number: 13 }],
      [{ issue: { number: 10 } }],
      [{ issue: { number: 11 } }],
      12,
    ),
    [13],
  );
});

test("runner binds the fresh preflight queue to current numeric limits", () => {
  const frontier = [{ number: 10 }, { number: 11 }];
  const frontierJson = `${JSON.stringify(frontier, null, 2)}\n`;
  const generatedAt = "2026-07-27T12:00:00.000Z";
  const config = {
    executionMode: "autonomous",
    phaseLabel: "phase:frontend",
    maxAttempts: 2,
    maxRuntimeMinutes: 480,
    maxIssuesPerRun: 2,
    frontierLimit: 50,
    concurrency: 1,
  };
  const summary = {
    schemaVersion: 1,
    generatedAt,
    expiresAt: "2026-07-27T12:15:00.000Z",
    frontierSha256: createHash("sha256").update(frontierJson).digest("hex"),
    executionMode: config.executionMode,
    phaseLabel: config.phaseLabel,
    selectedIssues: [10, 11],
    limits: {
      maxAttempts: config.maxAttempts,
      maxRuntimeMinutes: config.maxRuntimeMinutes,
      maxIssuesPerRun: config.maxIssuesPerRun,
      frontierLimit: config.frontierLimit,
      concurrency: config.concurrency,
    },
  };

  assert.deepEqual(
    validatePreflightState(
      frontier,
      summary,
      config,
      Date.parse("2026-07-27T12:01:00.000Z"),
    ),
    {
      numbers: [10, 11],
      expiresAt: Date.parse("2026-07-27T12:15:00.000Z"),
    },
  );
  assert.throws(
    () => validatePreflightState(
      [...frontier, { number: 12 }],
      summary,
      config,
      Date.parse("2026-07-27T12:01:00.000Z"),
    ),
    /execution bounds/,
  );
});

test("the earliest active unique GitHub claim lease wins", () => {
  const comment = (id, runId, token, status = "active") => ({
    id,
    body:
      `<!-- indie-mvp-claim\n${JSON.stringify({
        schema_version: 1,
        run_id: runId,
        token,
        status,
      })}\n-->\n\n## Plain-English summary\nClaim state.`,
  });
  assert.deepEqual(
    selectClaimWinner([
      comment(20, "run-b", "token-b"),
      comment(10, "run-a", "token-a"),
      comment(5, "old-run", "old-token", "released"),
    ]),
    { commentId: 10, runId: "run-a", token: "token-a" },
  );
});

test("a released successful claim lease never blocks a later active lease", () => {
  const leaseComment = (id, runId, status) => ({
    id,
    body: `<!-- indie-mvp-claim
${JSON.stringify({
  schema_version: 1,
  run_id: runId,
  token: `${runId}-token`,
  status,
})}
-->`,
  });
  assert.deepEqual(
    selectClaimWinner([
      leaseComment(1, "completed-run", "released"),
      leaseComment(2, "next-run", "active"),
    ]),
    { commentId: 2, runId: "next-run", token: "next-run-token" },
  );
});

test("agent receives a minimal environment without runtime or host secrets", () => {
  const environment = buildAgentEnvironment({
    PATH: "/usr/bin:/bin",
    HOME: "/Users/example",
    LANG: "en_US.UTF-8",
    GH_TOKEN: "secret",
    OPENAI_API_KEY: "secret",
    DOCKER_HOST: "ssh://production",
    KUBECONFIG: "/secret/config",
  });

  assert.equal(environment.PATH, "/usr/bin:/bin");
  assert.equal(environment.HOME, "/Users/example");
  assert.equal(environment.LANG, "en_US.UTF-8");
  assert.equal(environment.GIT_TERMINAL_PROMPT, "0");
  assert.equal(environment.GH_TOKEN, undefined);
  assert.equal(environment.OPENAI_API_KEY, undefined);
  assert.equal(environment.DOCKER_HOST, undefined);
  assert.equal(environment.KUBECONFIG, undefined);
});

test("worker result requires an actionable owner handoff", () => {
  const result = {
    schemaVersion: 1,
    summary: "Implemented the approved settings screen.",
    includedWork: ["Added the approved settings rows and navigation."],
    nonGoals: ["Did not change backend behavior."],
    verification: ["node --check scripts/settings.mjs: passed"],
    humanValidation: "recommended",
    humanValidationReason: "The target-runtime layout needs a visual check.",
    humanValidationSteps: ["Open Settings on the target simulator."],
    expectedResult: "All approved rows are visible and usable.",
    failureSigns: ["A row clips or cannot be focused."],
    risks: ["The compact-width layout remains sensitive to localization."],
    rollback: "Revert the focused issue commit.",
  };

  assert.deepEqual(validateWorkerResult(result), result);
  assert.throws(
    () => validateWorkerResult({ ...result, verification: [] }),
    /verification/,
  );
  assert.throws(
    () => validateWorkerResult({ ...result, humanValidation: "sometimes" }),
    /humanValidation/,
  );
});

test("worker stop distinguishes independent implementation failure from a global stop", () => {
  assert.deepEqual(
    validateWorkerStop({
      schemaVersion: 1,
      scope: "issue",
      code: "implementation-failure",
      message: "The focused implementation did not converge within its bound.",
    }),
    {
      schemaVersion: 1,
      scope: "issue",
      code: "implementation-failure",
      message: "The focused implementation did not converge within its bound.",
    },
  );
  assert.throws(
    () => validateWorkerStop({
      schemaVersion: 1,
      scope: "issue",
      code: "docker-runtime-required",
      message: "Docker would be required.",
    }),
    /global/,
  );
});
