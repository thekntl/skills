#!/usr/bin/env node

import {
  createHash,
} from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  LOOP_CONTRACT_ARRAY_FIELDS,
  LOOP_CONTRACT_FLAG_FIELDS,
  LOOP_CONTRACT_KEYS,
} from "./loop-contract.mjs";
import {
  buildGitEnvironment,
  buildGitHubEnvironment,
} from "./runtime-environment-policy.mjs";

const CONFIG_KEYS = new Set([
  "schemaVersion",
  "repository",
  "launchMapIssueUrl",
  "phaseIssueNumber",
  "milestoneTitle",
  "milestoneDueDate",
  "issueType",
  "launchProject",
  "phaseLabel",
  "readyLabel",
  "blockedLabel",
  "decisionLabel",
  "ownerActionLabel",
  "claimLabel",
  "executionMode",
  "baseBranch",
  "branchPrefix",
  "worktreeDirectory",
  "maxAttempts",
  "maxRuntimeMinutes",
  "maxIssuesPerRun",
  "frontierLimit",
  "concurrency",
  "tools",
  "agent",
  "safeChecksFile",
  "glossary",
]);

const FORBIDDEN_EXECUTABLES = new Set([
  "bash",
  "bun",
  "containerd",
  "ctr",
  "docker",
  "docker-compose",
  "fish",
  "just",
  "make",
  "nerdctl",
  "node",
  "npm",
  "npx",
  "pnpm",
  "podman",
  "sh",
  "task",
  "yarn",
  "zsh",
]);

const RECOGNIZED_AGENT_EXECUTABLES = new Set(["codex"]);
const TOOL_NAMES = Object.freeze([
  "node",
  "git",
  "gitRemoteHttps",
  "gh",
  "bash",
]);
const TOOL_BASENAMES = Object.freeze({
  node: "node",
  git: "git",
  gitRemoteHttps: "git-remote-https",
  gh: "gh",
  bash: "bash",
});
const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const MAX_GUARD_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const VALIDATION_ROUTES = new Set([
  "build-first",
  "parallel",
  "validate-first",
]);
const VALIDATION_VERDICTS = new Set([
  "GO",
  "ITERATE",
  "STOP",
  "BUILD-TO-LEARN",
]);
const LAUNCH_GATE_KEYS = new Set([
  "schema_version",
  "validation_route",
  "validation_verdict",
  "public_product_clock_started_at",
  "frontend_delivery_active",
]);
const REQUIRED_PROJECT_KEYS = new Set([
  "mode",
  "owner",
  "number",
  "id",
  "title",
  "statusFieldId",
  "statusOptionIds",
]);
const REQUIRED_ISSUE_TYPE_KEYS = new Set(["mode", "name"]);
const UNAVAILABLE_ISSUE_TYPE_KEYS = new Set(["mode", "reason"]);
const PROJECT_STATUS_OPTION_KEYS = new Set([
  "ready",
  "inProgress",
  "inReview",
  "blocked",
]);
const TINY_PROJECT_SKIP_KEYS = new Set([
  "mode",
  "owner",
  "title",
  "mapChildCount",
  "repositoryCount",
  "reason",
]);
const PROHIBITED_GIT_CONFIG_PATTERN = new RegExp(
  "^(alias\\..*|credential\\..*|filter\\..*\\.(clean|smudge|process|required)|" +
    "diff\\..*\\.(command|textconv)|merge\\..*\\.driver|" +
    "core\\.(alternaterefscommand|askpass|attributesfile|fsmonitor|sshcommand|worktree)|" +
    "remote\\..*\\.(pushurl|uploadpack|receivepack|vcs|proxy)|" +
    "gpg\\..*|user\\.signingkey|commit\\.gpgsign|tag\\.gpgsign|" +
    "gc\\.recentobjectshook|protocol\\..*\\.allow|push\\.recursesubmodules|" +
    "url\\..*\\.(insteadof|pushinsteadof))$",
  "i",
);

function fail(message) {
  throw new Error(message);
}

function isPlaceholder(value) {
  return typeof value === "string" && value.includes("{{");
}

function requireString(value, name) {
  if (typeof value !== "string" || value.trim() === "" || isPlaceholder(value)) {
    fail(`${name} must be a resolved non-empty string`);
  }
}

function requireInteger(value, name, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    fail(`${name} must be an integer from ${minimum} through ${maximum}`);
  }
}

function requireDate(value, name) {
  requireString(value, name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    fail(`${name} must be a real date in YYYY-MM-DD form`);
  }
}

function requireExactKeys(value, allowed, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${name} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(`${name} contains unsupported key: ${key}`);
  }
}

function assertRepoRelative(path, name) {
  requireString(path, name);
  if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) {
    fail(`${name} must remain inside its declared root`);
  }
}

export function resolveSafePath(root, path, name) {
  assertRepoRelative(path, name);
  const absolute = resolve(root, path);
  const relation = relative(root, absolute);
  if (relation.startsWith("..") || isAbsolute(relation)) {
    fail(`${name} escapes its declared root`);
  }

  let cursor = resolve(root);
  for (const component of relation.split(sep).filter(Boolean)) {
    cursor = resolve(cursor, component);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) {
      fail(`${name} crosses a symbolic link: ${cursor}`);
    }
  }
  return absolute;
}

export function projectStatusName(projectItem) {
  return typeof projectItem?.status === "string"
    ? projectItem.status
    : projectItem?.status?.name;
}

export function milestoneReadbackErrors(milestone, config) {
  const errors = [];
  if (milestone?.title !== config.milestoneTitle) {
    errors.push(`milestone must be ${config.milestoneTitle}`);
  }
  if (typeof milestone?.dueOn !== "string" ||
      milestone.dueOn.slice(0, 10) !== config.milestoneDueDate) {
    errors.push(`milestone due date must be ${config.milestoneDueDate}`);
  }
  return errors;
}

function issueRepository(url) {
  const match = typeof url === "string"
    ? url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/\d+$/)
    : null;
  if (!match) fail(`launch issue has a non-canonical GitHub URL: ${String(url)}`);
  return `${match[1]}/${match[2]}`;
}

export function collectLaunchIssueTree(config, readIssue) {
  const queue = [config.launchMapIssueUrl];
  const queued = new Set(queue);
  const issues = [];

  while (queue.length) {
    const requestedUrl = queue.shift();
    const issue = readIssue(requestedUrl);
    if (!issue || typeof issue !== "object" || Array.isArray(issue)) {
      fail(`launch issue readback is missing for ${requestedUrl}`);
    }
    if (issue.url !== requestedUrl) {
      fail(`launch issue readback URL does not match ${requestedUrl}`);
    }
    if (!Array.isArray(issue.subIssues) ||
        !Number.isInteger(issue.subIssuesSummary?.total)) {
      fail(`launch issue hierarchy readback is incomplete for ${requestedUrl}`);
    }
    if (issue.subIssuesSummary.total !== issue.subIssues.length) {
      fail(`launch issue hierarchy readback is truncated for ${requestedUrl}`);
    }
    issues.push({ number: issue.number, url: issue.url });
    for (const child of issue.subIssues) {
      if (typeof child?.url !== "string") {
        fail(`launch issue hierarchy contains a child without a canonical URL`);
      }
      if (queued.has(child.url)) {
        fail(`launch issue hierarchy is not a unique tree at ${child.url}`);
      }
      queued.add(child.url);
      queue.push(child.url);
    }
  }

  return {
    rootUrl: config.launchMapIssueUrl,
    issues,
    repositoryCount: new Set(issues.map(({ url }) => issueRepository(url))).size,
  };
}

export function collectLaunchProjectReadback(config, runJson) {
  if (config.launchProject.mode === "required") {
    return {
      project: runJson([
        "project",
        "view",
        String(config.launchProject.number),
        "--owner",
        config.launchProject.owner,
        "--format",
        "json",
      ]),
      items: runJson([
        "project",
        "item-list",
        String(config.launchProject.number),
        "--owner",
        config.launchProject.owner,
        "--limit",
        "1000",
        "--format",
        "json",
      ]),
    };
  }
  return {
    projects: runJson([
      "project",
      "list",
      "--owner",
      config.launchProject.owner,
      "--limit",
      "1000",
      "--format",
      "json",
    ]),
    launchTree: collectLaunchIssueTree(
      config,
      (url) => runJson([
        "issue",
        "view",
        url,
        "--json",
        "number,url,subIssues,subIssuesSummary",
      ]),
    ),
  };
}

export function validateIssueTypeReadback(config, readback) {
  const errors = [];
  const issueTypes = Array.isArray(readback) && readback.every(Array.isArray)
    ? readback.flat()
    : readback;
  if (!Array.isArray(issueTypes) ||
      issueTypes.some(({ name } = {}) => typeof name !== "string" || name.trim() === "")) {
    return ["native issue type capability readback has an unsupported shape"];
  }
  if (config.issueType.mode === "required" &&
      !issueTypes.some(({ name }) => name === config.issueType.name)) {
    errors.push(
      `configured native issue type ${config.issueType.name} is unavailable in the live repository`,
    );
  }
  if (config.issueType.mode === "unavailable" && issueTypes.length) {
    errors.push(
      `native issue types are available in the live repository: ` +
      issueTypes.map(({ name }) => name).join(", "),
    );
  }
  return errors;
}

export function issueTypeReadbackArgs(config) {
  const [owner, repository] = config.repository.split("/");
  return [
    "api",
    "--hostname",
    "github.com",
    "-H",
    "X-GitHub-Api-Version: 2026-03-10",
    "--paginate",
    "--slurp",
    `repos/${owner}/${repository}/issue-types?per_page=100`,
  ];
}

export function validateLaunchProjectReadback(issues, config, snapshots) {
  const errors = [];
  if (config.launchProject.mode === "required") {
    const project = snapshots.project;
    if (project?.id !== config.launchProject.id ||
        project?.number !== config.launchProject.number ||
        project?.title !== config.launchProject.title) {
      errors.push("launch Project identity does not match configured node, number, and title");
    }
    const items = snapshots.items;
    if (!Array.isArray(items?.items)) {
      errors.push("launch Project item readback has an unsupported shape");
      return errors;
    }
    if (Number.isInteger(items.totalCount) && items.totalCount > items.items.length) {
      errors.push("launch Project item readback is truncated");
    }
    for (const issue of issues) {
      const item = items.items.find(
        (candidate) =>
          (candidate?.content?.url ?? candidate?.url) === issue.url,
      );
      if (!item) {
        errors.push(`Issue #${issue.number} is missing configured launch Project membership`);
      } else if (projectStatusName(item) !== "Ready") {
        errors.push(
          `Issue #${issue.number} configured launch Project Status must be Ready, ` +
          `found ${projectStatusName(item) ?? "unset"}`,
        );
      }
    }
    return errors;
  }

  const projects = snapshots.projects;
  if (!Array.isArray(projects?.projects)) {
    errors.push("launch Project list readback has an unsupported shape");
    return errors;
  }
  if (Number.isInteger(projects.totalCount) &&
      projects.totalCount > projects.projects.length) {
    errors.push("launch Project list readback is truncated");
  }
  if (projects.projects.some(({ title }) => title === config.launchProject.title)) {
    errors.push(`launch Project ${config.launchProject.title} already exists`);
  }
  const launchTree = snapshots.launchTree;
  const liveChildCount = Array.isArray(launchTree?.issues)
    ? launchTree.issues.length - 1
    : null;
  if (launchTree?.rootUrl !== config.launchMapIssueUrl) {
    errors.push("tiny Project skip launch tree is not rooted at the configured map");
  }
  if (!Number.isInteger(liveChildCount) ||
      liveChildCount !== config.launchProject.mapChildCount ||
      liveChildCount > 4) {
    errors.push(
      "tiny Project skip requires a complete live launch tree with at most four child issues",
    );
  }
  if (launchTree?.repositoryCount !== config.launchProject.repositoryCount ||
      launchTree?.repositoryCount !== 1) {
    errors.push("tiny Project skip requires the complete live launch tree in one repository");
  }
  return errors;
}

export function validateLoopConfig(config) {
  requireExactKeys(config, CONFIG_KEYS, "config");

  for (const key of CONFIG_KEYS) {
    if (!(key in config)) fail(`config is missing ${key}`);
  }

  requireInteger(config.schemaVersion, "schemaVersion", 1, 1);
  requireString(config.repository, "repository");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(config.repository)) {
    fail("repository must use owner/name form");
  }
  requireString(config.launchMapIssueUrl, "launchMapIssueUrl");
  const launchMapPrefix = `https://github.com/${config.repository}/issues/`;
  if (!config.launchMapIssueUrl.startsWith(launchMapPrefix) ||
      !/^\d+$/.test(config.launchMapIssueUrl.slice(launchMapPrefix.length))) {
    fail("launchMapIssueUrl must be the canonical issue in repository");
  }
  requireInteger(config.phaseIssueNumber, "phaseIssueNumber", 1, Number.MAX_SAFE_INTEGER);
  requireString(config.milestoneTitle, "milestoneTitle");
  requireDate(config.milestoneDueDate, "milestoneDueDate");
  if (!config.issueType || typeof config.issueType !== "object" ||
      Array.isArray(config.issueType)) {
    fail("issueType must be required or explicitly unavailable");
  }
  if (config.issueType.mode === "required") {
    requireExactKeys(config.issueType, REQUIRED_ISSUE_TYPE_KEYS, "issueType");
    requireString(config.issueType.name, "issueType.name");
  } else if (config.issueType.mode === "unavailable") {
    requireExactKeys(config.issueType, UNAVAILABLE_ISSUE_TYPE_KEYS, "issueType");
    requireString(config.issueType.reason, "issueType.reason");
  } else {
    fail("issueType.mode must be required or unavailable");
  }
  if (!config.launchProject || typeof config.launchProject !== "object" ||
      Array.isArray(config.launchProject)) {
    fail("launchProject must be a required Project or an explicit tiny skip");
  }
  if (config.launchProject.mode === "required") {
    requireExactKeys(config.launchProject, REQUIRED_PROJECT_KEYS, "launchProject");
    for (const key of REQUIRED_PROJECT_KEYS) {
      if (!(key in config.launchProject)) fail(`launchProject is missing ${key}`);
    }
    for (const key of ["owner", "id", "title", "statusFieldId"]) {
      requireString(config.launchProject[key], `launchProject.${key}`);
    }
    requireInteger(
      config.launchProject.number,
      "launchProject.number",
      1,
      Number.MAX_SAFE_INTEGER,
    );
    requireExactKeys(
      config.launchProject.statusOptionIds,
      PROJECT_STATUS_OPTION_KEYS,
      "launchProject.statusOptionIds",
    );
    for (const key of PROJECT_STATUS_OPTION_KEYS) {
      if (!(key in config.launchProject.statusOptionIds)) {
        fail(`launchProject.statusOptionIds is missing ${key}`);
      }
      requireString(
        config.launchProject.statusOptionIds[key],
        `launchProject.statusOptionIds.${key}`,
      );
    }
  } else if (config.launchProject.mode === "tiny-skip") {
    requireExactKeys(config.launchProject, TINY_PROJECT_SKIP_KEYS, "launchProject");
    requireString(config.launchProject.owner, "launchProject.owner");
    requireString(config.launchProject.title, "launchProject.title");
    requireInteger(config.launchProject.mapChildCount, "launchProject.mapChildCount", 0, 4);
    requireInteger(config.launchProject.repositoryCount, "launchProject.repositoryCount", 1, 1);
    requireString(config.launchProject.reason, "launchProject.reason");
  } else {
    fail("launchProject.mode must be required or tiny-skip");
  }
  for (const key of [
    "phaseLabel",
    "readyLabel",
    "blockedLabel",
    "decisionLabel",
    "ownerActionLabel",
    "claimLabel",
  ]) {
    requireString(config[key], key);
  }
  requireString(config.baseBranch, "baseBranch");
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/.test(config.baseBranch) ||
      config.baseBranch.includes("..")) {
    fail("baseBranch contains unsafe Git ref syntax");
  }
  requireString(config.branchPrefix, "branchPrefix");
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,63}\/$/.test(config.branchPrefix) ||
      config.branchPrefix.includes("..")) {
    fail("branchPrefix must be a bounded Git prefix ending in /");
  }
  assertRepoRelative(config.worktreeDirectory, "worktreeDirectory");
  if (!["autonomous", "interactive"].includes(config.executionMode)) {
    fail("executionMode must be autonomous or interactive");
  }
  requireInteger(config.maxAttempts, "maxAttempts", 1, 100);
  requireInteger(config.maxRuntimeMinutes, "maxRuntimeMinutes", 1, 1440);
  requireInteger(config.maxIssuesPerRun, "maxIssuesPerRun", 1, 50);
  requireInteger(config.frontierLimit, "frontierLimit", 1, 100);
  if (config.maxIssuesPerRun > config.frontierLimit) {
    fail("maxIssuesPerRun cannot exceed frontierLimit");
  }
  requireInteger(config.concurrency, "concurrency", 1, 1);

  requireExactKeys(config.tools, new Set(TOOL_NAMES), "tools");
  for (const name of TOOL_NAMES) {
    if (!(name in config.tools)) fail(`tools is missing ${name}`);
    requireExactKeys(
      config.tools[name],
      new Set(["executable", "sha256"]),
      `tools.${name}`,
    );
    requireString(config.tools[name].executable, `tools.${name}.executable`);
    if (!isAbsolute(config.tools[name].executable)) {
      fail(`tools.${name}.executable must be an absolute owner-reviewed path`);
    }
    if (!/^[a-f0-9]{64}$/i.test(config.tools[name].sha256)) {
      fail(`tools.${name}.sha256 must be an owner-reviewed SHA-256 digest`);
    }
  }

  requireExactKeys(
    config.agent,
    new Set([
      "executable",
      "sha256",
      "argumentsFile",
      "argumentsSha256",
      "runtimeGuardFile",
      "runtimeGuardSha256",
    ]),
    "agent",
  );
  requireString(config.agent.executable, "agent.executable");
  if (!isAbsolute(config.agent.executable)) {
    fail("agent.executable must be an absolute owner-reviewed path");
  }
  if (!/^[a-f0-9]{64}$/i.test(config.agent.sha256)) {
    fail("agent.sha256 must be an owner-reviewed SHA-256 digest");
  }
  assertRepoRelative(config.agent.argumentsFile, "agent.argumentsFile");
  if (!/^[a-f0-9]{64}$/i.test(config.agent.argumentsSha256)) {
    fail("agent.argumentsSha256 must be an owner-reviewed SHA-256 digest");
  }
  assertRepoRelative(config.agent.runtimeGuardFile, "agent.runtimeGuardFile");
  if (!/^[a-f0-9]{64}$/i.test(config.agent.runtimeGuardSha256)) {
    fail("agent.runtimeGuardSha256 must be an owner-reviewed SHA-256 digest");
  }
  assertRepoRelative(config.safeChecksFile, "safeChecksFile");

  requireExactKeys(
    config.glossary,
    new Set(["context", "glossary", "output"]),
    "glossary",
  );
  for (const key of ["context", "glossary", "output"]) {
    assertRepoRelative(config.glossary[key], `glossary.${key}`);
  }

  return config;
}

function parseIssueContract(body) {
  const match = body.match(/<!--\s*indie-mvp-loop\s*([\s\S]*?)-->/i);
  if (!match) fail("missing indie-mvp-loop contract");
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(`invalid indie-mvp-loop JSON: ${error.message}`);
  }
}

function parseLaunchGate(body) {
  const match = body.match(/<!--\s*indie-mvp-launch-gate\s*([\s\S]*?)-->/i);
  if (!match) fail("missing indie-mvp-launch-gate contract");
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(`invalid indie-mvp-launch-gate JSON: ${error.message}`);
  }
}

function isRealPastUtcTimestamp(value, now = Date.now()) {
  if (typeof value !== "string" || !ISO_UTC_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  const normalized = value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  return !Number.isNaN(parsed) &&
    new Date(parsed).toISOString() === normalized &&
    parsed <= now + 5 * 60 * 1000;
}

function issueLabels(issue) {
  return new Set(
    (issue.labels ?? []).map((label) =>
      typeof label === "string" ? label : label.name,
    ),
  );
}

function sectionContent(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return "";
  const content = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    content.push(line);
  }
  return content.join("\n").trim();
}

function validateIssue(issue, config) {
  const errors = [];
  const report = (message) => errors.push(`Issue #${issue.number}: ${message}`);
  const labels = issueLabels(issue);

  if (issue.state !== "OPEN") report("issue is not open");
  if (!labels.has(config.phaseLabel)) report(`missing ${config.phaseLabel} label`);
  if (!labels.has(config.readyLabel)) report(`missing ${config.readyLabel} label`);
  if (labels.has(config.blockedLabel)) report(`has ${config.blockedLabel} label`);
  if (labels.has(config.decisionLabel)) report(`has ${config.decisionLabel} label`);
  if (labels.has(config.ownerActionLabel)) report(`has ${config.ownerActionLabel} label`);
  if (labels.has(config.claimLabel)) report(`has ${config.claimLabel} label`);
  const otherPhases = [...labels].filter(
    (label) => label.startsWith("phase:") && label !== config.phaseLabel,
  );
  if (otherPhases.length) report(`has conflicting phase labels: ${otherPhases.join(", ")}`);
  if ((issue.assignees ?? []).length) report("already has a GitHub assignee");
  if (config.issueType.mode === "required" &&
      issue.issueType?.name !== config.issueType.name) {
    report(`native issue type must be ${config.issueType.name}`);
  }
  if (config.issueType.mode === "unavailable" && issue.issueType) {
    report("native issue type is available but config marks it unavailable");
  }
  if (issue.parent?.number !== config.phaseIssueNumber) {
    report(`native parent must be phase issue #${config.phaseIssueNumber}`);
  }
  for (const error of milestoneReadbackErrors(issue.milestone, config)) report(error);
  if (config.launchProject.mode === "required") {
    const projectItem = (issue.projectItems ?? []).find(
      ({ title }) => title === config.launchProject.title,
    );
    if (!projectItem) {
      report(`missing required launch Project ${config.launchProject.title}`);
    } else {
      const status = projectStatusName(projectItem);
      if (status !== "Ready") {
        report(`Project Status must be Ready, found ${status ?? "unset"}`);
      }
    }
  }
  const liveBlockers = (issue.blockedBy ?? []).filter(
    (blocker) => blocker.state !== "CLOSED",
  );
  if (liveBlockers.length) {
    report(`has live GitHub blockers: ${liveBlockers.map(({ number }) => `#${number}`).join(", ")}`);
  }
  if (!sectionContent(issue.body ?? "", "## Plain-English summary")) {
    report("missing or empty Plain-English summary");
  }
  if ((issue.body ?? "").includes("{{")) report("contains an unresolved placeholder");
  const requiredSections = [
    "## Problem",
    "## User outcome",
    "## Decision evidence",
    "## Scope",
    "## Non-goals",
    "## Acceptance criteria",
    "## Affected surfaces",
    "## Dependencies and blockers",
    "## Verification",
    "## Boundaries",
  ];
  for (const heading of requiredSections) {
    if (!sectionContent(issue.body ?? "", heading)) {
      report(`missing or empty ${heading.slice(3)} section`);
    }
  }
  const acceptance = sectionContent(issue.body ?? "", "## Acceptance criteria");
  if (!/^- \[(?: |x|X)\] \S.+$/m.test(acceptance)) {
    report("Acceptance criteria must contain at least one checkable criterion");
  }
  const verification = sectionContent(issue.body ?? "", "## Verification");
  for (const marker of [
    "Human validation:",
    "Scenario:",
    "Expected result:",
    "Failure signs:",
    "Target runtime:",
  ]) {
    if (!verification.includes(marker)) {
      report(`Verification section misses ${marker}`);
    }
  }

  let contract;
  try {
    contract = parseIssueContract(issue.body ?? "");
  } catch (error) {
    report(error.message);
    return errors;
  }

  if (contract.schema_version !== 1) report("unsupported contract schema_version");
  for (const key of Object.keys(contract)) {
    if (!LOOP_CONTRACT_KEYS.includes(key)) {
      report(`contract contains unsupported key: ${key}`);
    }
  }
  for (const key of LOOP_CONTRACT_KEYS) {
    if (!(key in contract)) report(`contract is missing ${key}`);
  }
  if (contract.phase !== config.phaseLabel) {
    report(`contract phase is ${String(contract.phase)}, expected ${config.phaseLabel}`);
  }
  for (const field of LOOP_CONTRACT_ARRAY_FIELDS) {
    if (!Array.isArray(contract[field])) {
      report(`${field} must be an array`);
    }
  }
  for (const field of LOOP_CONTRACT_ARRAY_FIELDS) {
    if (Array.isArray(contract[field]) && contract[field].length) {
      report(`${field} is not empty`);
    }
  }
  for (const field of LOOP_CONTRACT_FLAG_FIELDS) {
    if (contract[field] !== false) report(`${field} must be false`);
  }
  if (!VALIDATION_ROUTES.has(contract.validation_route)) {
    report("validation_route must be build-first, parallel, or validate-first");
  }
  if (contract.validation_verdict !== null &&
      !VALIDATION_VERDICTS.has(contract.validation_verdict)) {
    report("validation_verdict is unsupported");
  }
  if (config.phaseLabel === "phase:frontend") {
    if (contract.validation_route === "validate-first" &&
        !["GO", "BUILD-TO-LEARN"].includes(contract.validation_verdict)) {
      report("validate-first frontend requires GO or BUILD-TO-LEARN");
    }
    if (!isRealPastUtcTimestamp(contract.public_product_clock_started_at)) {
      report("frontend requires a real started public-product clock");
    }
    const expectedPrefix = `https://github.com/${config.repository}/issues/`;
    const evidenceIssue = typeof contract.launch_gate_evidence_url === "string"
      ? contract.launch_gate_evidence_url.slice(expectedPrefix.length)
      : "";
    if (typeof contract.launch_gate_evidence_url !== "string" ||
        !contract.launch_gate_evidence_url.startsWith(expectedPrefix) ||
        !/^\d+$/.test(evidenceIssue) ||
        contract.launch_gate_evidence_url !== config.launchMapIssueUrl) {
      report("frontend requires its canonical Product Launch Map issue URL");
    }
  }
  if (contract.claimed_by !== null) report("claimed_by must be null");

  return errors;
}

export function validateLaunchGateEvidence(issues, config, readIssue) {
  if (config.phaseLabel !== "phase:frontend") return [];
  const errors = [];
  const cache = new Map();
  for (const issue of issues) {
    let contract;
    try {
      contract = parseIssueContract(issue.body ?? "");
      const match = contract.launch_gate_evidence_url.match(/\/issues\/(\d+)$/);
      const number = Number(match?.[1]);
      if (!Number.isSafeInteger(number)) {
        throw new Error("launch-gate evidence URL has no issue number");
      }
      let launchMap = cache.get(number);
      if (!launchMap) {
        launchMap = readIssue(number);
        cache.set(number, launchMap);
      }
      if (launchMap.state !== "OPEN") {
        throw new Error(`Product Launch Map #${number} is not open`);
      }
      const gate = parseLaunchGate(launchMap.body ?? "");
      requireExactKeys(gate, LAUNCH_GATE_KEYS, "Product Launch Map gate");
      if (gate.schema_version !== 1 ||
          gate.validation_route !== contract.validation_route ||
          gate.validation_verdict !== contract.validation_verdict ||
          gate.public_product_clock_started_at !==
            contract.public_product_clock_started_at ||
          gate.frontend_delivery_active !== true) {
        throw new Error(
          "Product Launch Map gate does not match the frontend issue contract",
        );
      }
      if (gate.validation_route === "validate-first" &&
          !["GO", "BUILD-TO-LEARN"].includes(gate.validation_verdict)) {
        throw new Error(
          "validate-first Product Launch Map has not activated frontend",
        );
      }
      if (!isRealPastUtcTimestamp(gate.public_product_clock_started_at)) {
        throw new Error("Product Launch Map has no valid public-product clock");
      }
    } catch (error) {
      errors.push(`Issue #${issue.number}: ${error.message}`);
    }
  }
  return errors;
}

export function validateFrontierSnapshot(issues, rawConfig) {
  const config = validateLoopConfig(rawConfig);
  if (!Array.isArray(issues)) fail("frontier snapshot must be an array");
  if (issues.length >= config.frontierLimit) {
    return {
      selected: [],
      errors: [
        `Live frontier reached frontierLimit=${config.frontierLimit}; raise the bounded limit and query again so no issue escapes validation`,
      ],
    };
  }

  const errors = [];
  const eligible = [];
  for (const issue of issues) {
    const issueErrors = validateIssue(issue, config);
    if (issueErrors.length) errors.push(...issueErrors);
    else eligible.push(issue);
  }

  eligible.sort((left, right) => left.number - right.number);
  return {
    selected: eligible.slice(
      0,
      Math.min(config.maxIssuesPerRun, config.maxAttempts),
    ),
    errors,
  };
}

export function validateSingleIssueSnapshot(issue, rawConfig) {
  const config = validateLoopConfig(rawConfig);
  const errors = validateIssue(issue, config);
  return {
    selected: errors.length ? [] : [issue],
    errors,
  };
}

export function validateSafeChecks(checks) {
  if (!Array.isArray(checks) || checks.length > 100) {
    fail("safe checks must be an array with at most 100 entries");
  }

  for (const [index, check] of checks.entries()) {
    requireExactKeys(check, new Set(["type", "paths"]), `safeChecks[${index}]`);
    if (!["git-diff-check", "node-syntax", "shell-syntax"].includes(check.type)) {
      fail(`safeChecks[${index}] has unsupported type: ${String(check.type)}`);
    }
    if (check.type === "git-diff-check") {
      if ("paths" in check) fail(`safeChecks[${index}] git-diff-check accepts no paths`);
      continue;
    }
    if (!Array.isArray(check.paths) || check.paths.length === 0) {
      fail(`safeChecks[${index}].paths must be a non-empty array`);
    }
    for (const [pathIndex, path] of check.paths.entries()) {
      assertRepoRelative(path, `safeChecks[${index}].paths[${pathIndex}]`);
      const expected =
        check.type === "node-syntax" ? /\.(?:c|m)?js$/i : /\.sh$/i;
      if (!expected.test(path)) {
        fail(`safeChecks[${index}] contains a path with the wrong file type: ${path}`);
      }
    }
  }

  return checks;
}

function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env,
    input: options.input,
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error) fail(`${basename(executable)} failed to start: ${result.error.message}`);
  const allowedStatuses = options.allowedStatuses ?? [0];
  if (!allowedStatuses.includes(result.status)) {
    const detail = options.capture ? `: ${(result.stderr || result.stdout).trim()}` : "";
    fail(`${basename(executable)} exited with ${result.status}${detail}`);
  }
  return options.capture ? result.stdout : "";
}

export function buildPreflightGitEnvironment(
  tools,
  source = process.env,
  githubToken,
) {
  if (!tools || typeof tools.git !== "string" || tools.git === "") {
    fail("Preflight Git environment requires the verified Git toolchain");
  }
  return buildGitEnvironment({
    source,
    githubToken,
    gitExecutable: tools.git,
  });
}

function runGit(repoRoot, args, tools, options = {}) {
  return run(
    tools.git,
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
      env: buildPreflightGitEnvironment(
        tools,
        process.env,
        options.githubToken,
      ),
    },
  );
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyPinnedTool(name, declaration) {
  if (!TOOL_NAMES.includes(name)) fail(`Unsupported pinned tool: ${name}`);
  const executable = declaration.executable;
  if (!existsSync(executable) || !lstatSync(executable).isFile()) {
    fail(`tools.${name}.executable must resolve to a regular file`);
  }
  const resolved = realpathSync(executable);
  if (resolved !== executable) {
    fail(`tools.${name}.executable must use its canonical real path`);
  }
  if (basename(resolved).toLowerCase() !== TOOL_BASENAMES[name].toLowerCase()) {
    fail(`tools.${name}.executable must resolve directly to ${TOOL_BASENAMES[name]}`);
  }
  const bytes = readFileSync(resolved);
  if (bytes.subarray(0, 2).toString("utf8") === "#!") {
    fail(`tools.${name}.executable resolves to a script or wrapper`);
  }
  if (sha256(bytes) !== declaration.sha256.toLowerCase()) {
    fail(`tools.${name}.sha256 does not match the owner-reviewed executable`);
  }
  return resolved;
}

export function verifyToolchain(config) {
  const tools = {};
  for (const name of TOOL_NAMES) {
    tools[name] = verifyPinnedTool(name, config.tools[name]);
  }
  if (realpathSync(process.execPath) !== tools.node) {
    fail("preflight must itself run with the pinned tools.node executable");
  }
  const gitExecPath = run(tools.git, ["--no-pager", "--exec-path"], {
    capture: true,
    env: buildPreflightGitEnvironment(tools),
  }).trim();
  const gitRemoteHttps = realpathSync(resolve(gitExecPath, "git-remote-https"));
  if (gitRemoteHttps !== tools.gitRemoteHttps) {
    fail(
      "tools.gitRemoteHttps must match the HTTPS helper selected by the pinned Git executable",
    );
  }
  return tools;
}

function runRawGit(repoRoot, args, tools, options = {}) {
  return run(tools.git, ["--no-pager", "-C", repoRoot, ...args], {
    ...options,
    env: buildPreflightGitEnvironment(tools),
  });
}

export function computeGitExecutionSnapshot(repoRoot, tools, repository) {
  const configNames = runRawGit(
    repoRoot,
    ["config", "--null", "--name-only", "--list"],
    tools,
    { capture: true },
  ).split("\0").filter(Boolean);
  const prohibited = configNames.filter(
    (name) => PROHIBITED_GIT_CONFIG_PATTERN.test(name),
  );
  if (prohibited.length) {
    fail(
      "Git configuration contains an executable/helper/alias/transport path; " +
      `remove ${prohibited.join(", ")} or use an explicit owner handoff`,
    );
  }

  const remotes = runRawGit(repoRoot, ["remote"], tools, { capture: true })
    .split(/\r?\n/)
    .filter(Boolean);
  if (JSON.stringify(remotes) !== JSON.stringify(["origin"])) {
    fail("Autonomous Git requires exactly one remote named origin");
  }
  const origin = runRawGit(
    repoRoot,
    ["remote", "get-url", "--all", "origin"],
    tools,
    { capture: true },
  ).trim();
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(origin)) {
    fail("Autonomous Git requires one direct HTTPS github.com origin");
  }
  if (repository) {
    const expected = `https://github.com/${repository}`;
    if (origin !== expected && origin !== `${expected}.git`) {
      fail("Git origin does not match the configured GitHub repository");
    }
  }

  const configuration = runRawGit(
    repoRoot,
    ["config", "--show-origin", "--null", "--list"],
    tools,
    { capture: true },
  );
  const trackedAndUntracked = runRawGit(
    repoRoot,
    ["ls-files", "-co", "--exclude-standard", "-z"],
    tools,
    { capture: true },
  );
  const attributes = trackedAndUntracked
    ? runRawGit(
      repoRoot,
      ["check-attr", "-z", "-a", "--stdin"],
      tools,
      { capture: true, input: trackedAndUntracked },
    )
    : "";
  if (/(?:^|\0)(?:filter|diff)\0/.test(attributes)) {
    fail(
      "Active Git attributes select a filter or diff driver; " +
      "autonomous execution requires an owner handoff",
    );
  }

  return {
    gitConfigurationSha256: sha256(configuration),
    gitAttributesSha256: sha256(attributes),
    remoteOrigin: origin,
  };
}

export function verifyGitExecutionSnapshot(repoRoot, tools, guard, repository) {
  const actual = computeGitExecutionSnapshot(repoRoot, tools, repository);
  for (const key of [
    "gitConfigurationSha256",
    "gitAttributesSha256",
    "remoteOrigin",
  ]) {
    if (actual[key] !== guard[key]) {
      fail(`Current ${key} differs from the owner-approved runtime guard`);
    }
  }
  return actual;
}

export function readJson(path, name) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Cannot read ${name}: ${error.message}`);
  }
}

export function validateAgentArguments(args) {
  const required = [
    "exec",
    "--sandbox",
    "workspace-write",
    "-C",
    "%WORKTREE%",
    "--skip-git-repo-check",
    "-",
  ];
  if (!Array.isArray(args) ||
      args.some((arg) => typeof arg !== "string") ||
      JSON.stringify(args) !== JSON.stringify(required)) {
    fail(
      "agent arguments must use the fixed direct Codex exec contract: " +
      JSON.stringify(required),
    );
  }
  return args;
}

export function validateApprovalWindow(ownerApprovedAt, expiresAtValue, now = Date.now()) {
  requireString(ownerApprovedAt, "agent runtime guard ownerApprovedAt");
  requireString(expiresAtValue, "agent runtime guard expiresAt");
  if (!ISO_UTC_PATTERN.test(ownerApprovedAt) ||
      !ISO_UTC_PATTERN.test(expiresAtValue)) {
    fail("agent runtime guard timestamps must use exact UTC ISO-8601 form");
  }
  const approvedAt = Date.parse(ownerApprovedAt);
  const expiresAt = Date.parse(expiresAtValue);
  const normalized = (value) =>
    value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  if (Number.isNaN(approvedAt) ||
      Number.isNaN(expiresAt) ||
      new Date(approvedAt).toISOString() !== normalized(ownerApprovedAt) ||
      new Date(expiresAt).toISOString() !== normalized(expiresAtValue)) {
    fail("agent runtime guard timestamps must be real UTC calendar instants");
  }
  if (expiresAt <= approvedAt ||
      approvedAt > now + 5 * 60 * 1000 ||
      now - approvedAt > MAX_GUARD_AGE_MS ||
      expiresAt <= now ||
      expiresAt - approvedAt > MAX_GUARD_AGE_MS) {
    fail(
      "agent runtime guard is stale, future-dated, expired, reversed, " +
      "or valid for longer than 30 days",
    );
  }
  return { approvedAt, expiresAt };
}

export function verifyAgent(config, loopRoot, tools) {
  const executable = config.agent.executable;
  if (!existsSync(executable) || !lstatSync(executable).isFile()) {
    fail("agent.executable must resolve to a regular file");
  }
  const resolved = realpathSync(executable);
  const executableName = basename(resolved).toLowerCase();
  if (FORBIDDEN_EXECUTABLES.has(executableName) ||
      !RECOGNIZED_AGENT_EXECUTABLES.has(executableName)) {
    fail(`agent.executable must be the directly reviewed native codex executable, not ${executableName}`);
  }
  const executableBytes = readFileSync(resolved);
  if (executableBytes.subarray(0, 2).toString("utf8") === "#!") {
    fail("agent.executable resolves to a script or wrapper; autonomous execution requires a direct native codex binary");
  }
  const digest = createHash("sha256").update(executableBytes).digest("hex");
  if (digest !== config.agent.sha256.toLowerCase()) {
    fail("agent.executable SHA-256 does not match the owner-reviewed digest");
  }

  const argumentsPath = resolveSafePath(
    loopRoot,
    config.agent.argumentsFile,
    "agent.argumentsFile",
  );
  const argumentsBytes = readFileSync(argumentsPath);
  const argumentsDigest = createHash("sha256").update(argumentsBytes).digest("hex");
  if (argumentsDigest !== config.agent.argumentsSha256.toLowerCase()) {
    fail("agent arguments SHA-256 does not match the owner-reviewed digest");
  }
  let args;
  try {
    args = JSON.parse(argumentsBytes.toString("utf8"));
  } catch (error) {
    fail(`Cannot read agent arguments: ${error.message}`);
  }
  validateAgentArguments(args);
  if (args.some(isPlaceholder)) {
    fail("agent arguments contain an unresolved placeholder");
  }

  const guardPath = resolveSafePath(
    loopRoot,
    config.agent.runtimeGuardFile,
    "agent.runtimeGuardFile",
  );
  const guardBytes = readFileSync(guardPath);
  const guardDigest = createHash("sha256").update(guardBytes).digest("hex");
  if (guardDigest !== config.agent.runtimeGuardSha256.toLowerCase()) {
    fail("agent runtime guard SHA-256 does not match the owner-reviewed digest");
  }
  let guard;
  try {
    guard = JSON.parse(guardBytes.toString("utf8"));
  } catch (error) {
    fail(`Cannot read agent runtime guard: ${error.message}`);
  }
  requireExactKeys(
    guard,
    new Set([
      "schemaVersion",
      "agentSha256",
      "argumentsSha256",
      "toolSha256",
      "gitConfigurationSha256",
      "gitAttributesSha256",
      "remoteOrigin",
      "preflightLauncherSha256",
      "runnerLauncherSha256",
      "ownerApprovedAt",
      "expiresAt",
      "enforcementEvidenceFile",
      "enforcementEvidenceSha256",
      "containerRuntimeExecutionDenied",
      "indirectRepositoryCommandsDenied",
    ]),
    "agent runtime guard",
  );
  if (guard.schemaVersion !== 1) fail("agent runtime guard schemaVersion must be 1");
  if (guard.agentSha256 !== config.agent.sha256.toLowerCase()) {
    fail("agent runtime guard digest must match agent.sha256");
  }
  if (guard.argumentsSha256 !== config.agent.argumentsSha256.toLowerCase()) {
    fail("agent runtime guard arguments digest must match agent.argumentsSha256");
  }
  requireExactKeys(guard.toolSha256, new Set(TOOL_NAMES), "agent runtime guard toolSha256");
  for (const name of TOOL_NAMES) {
    if (guard.toolSha256[name] !== config.tools[name].sha256.toLowerCase()) {
      fail(`agent runtime guard tools digest must match tools.${name}.sha256`);
    }
  }
  for (const key of [
    "gitConfigurationSha256",
    "gitAttributesSha256",
    "preflightLauncherSha256",
    "runnerLauncherSha256",
  ]) {
    if (!/^[a-f0-9]{64}$/i.test(guard[key])) {
      fail(`agent runtime guard ${key} must be a SHA-256 digest`);
    }
  }
  requireString(guard.remoteOrigin, "agent runtime guard remoteOrigin");
  const launcherPaths = {
    preflightLauncherSha256: resolveSafePath(
      loopRoot,
      "preflight.sh",
      "preflight launcher",
    ),
    runnerLauncherSha256: resolveSafePath(
      loopRoot,
      "run-phase.sh",
      "phase runner launcher",
    ),
  };
  for (const [key, path] of Object.entries(launcherPaths)) {
    if (sha256(readFileSync(path)) !== guard[key].toLowerCase()) {
      fail(`${key} does not match the owner-reviewed launcher`);
    }
  }
  validateApprovalWindow(guard.ownerApprovedAt, guard.expiresAt);
  assertRepoRelative(
    guard.enforcementEvidenceFile,
    "agent runtime guard enforcementEvidenceFile",
  );
  if (!/^[a-f0-9]{64}$/i.test(guard.enforcementEvidenceSha256)) {
    fail("agent runtime guard enforcementEvidenceSha256 must be a SHA-256 digest");
  }
  const evidencePath = resolveSafePath(
    loopRoot,
    guard.enforcementEvidenceFile,
    "agent runtime guard enforcementEvidenceFile",
  );
  const evidence = readFileSync(evidencePath);
  const evidenceDigest = createHash("sha256").update(evidence).digest("hex");
  if (evidenceDigest !== guard.enforcementEvidenceSha256.toLowerCase()) {
    fail("agent enforcement evidence SHA-256 does not match the runtime guard");
  }
  const evidenceText = evidence.toString("utf8");
  for (const marker of [
    `agent-executable-sha256: ${config.agent.sha256.toLowerCase()}`,
    `agent-arguments-sha256: ${config.agent.argumentsSha256.toLowerCase()}`,
    ...TOOL_NAMES.map(
      (name) => `${name}-executable-sha256: ${config.tools[name].sha256.toLowerCase()}`,
    ),
    `git-configuration-sha256: ${guard.gitConfigurationSha256.toLowerCase()}`,
    `git-attributes-sha256: ${guard.gitAttributesSha256.toLowerCase()}`,
    `git-origin: ${guard.remoteOrigin}`,
    `preflight-launcher-sha256: ${guard.preflightLauncherSha256.toLowerCase()}`,
    `runner-launcher-sha256: ${guard.runnerLauncherSha256.toLowerCase()}`,
    "agent-kind: direct-native-codex",
    "container-runtime: deny",
    "indirect-repository-commands: deny",
    "git-clean-smudge-process-filters: runtime-rejected",
    "git-credential-remote-helpers: runtime-rejected",
    "git-origin-transport: direct-https-github-with-pinned-gh-token",
    "git-environment-execution-paths: runner-sanitized",
    "git-hooks-fsmonitor-signing-external-diff: runner-disabled",
  ]) {
    if (!evidenceText.includes(marker)) {
      fail(`agent enforcement evidence misses: ${marker}`);
    }
  }
  if (evidenceText.includes("{{")) {
    fail("agent enforcement evidence contains an unresolved placeholder");
  }
  if (!guard.containerRuntimeExecutionDenied ||
      !guard.indirectRepositoryCommandsDenied) {
    fail("agent runtime guard must deny container runtime and indirect repository commands");
  }

  if (!tools || tools.node !== realpathSync(process.execPath)) {
    fail("agent verification requires the already verified pinned toolchain");
  }

  return { executable: resolved, args, guard };
}

export function runSafeChecks(checks, repoRoot, tools) {
  for (const check of checks) {
    if (check.type === "git-diff-check") {
      runGit(
        repoRoot,
        ["diff", "--check", "--no-ext-diff", "--no-textconv"],
        tools,
      );
      continue;
    }
    const executable = check.type === "node-syntax" ? tools.node : tools.bash;
    const prefix = check.type === "node-syntax" ? ["--check"] : ["-n"];
    for (const path of check.paths) {
      const absolute = resolveSafePath(repoRoot, path, `safe check path ${path}`);
      if (!existsSync(absolute)) fail(`Safe check path does not exist: ${path}`);
      run(executable, [...prefix, absolute], { cwd: repoRoot });
    }
  }
}

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== "--loop-root") {
    fail("Usage: loop-safety.mjs --loop-root <generated-loop-directory>");
  }
  return resolve(argv[1]);
}

function preflight(loopRoot) {
  const repoRoot = dirname(loopRoot);
  const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const configPath = resolveSafePath(loopRoot, "config.json", "config path");
  const config = validateLoopConfig(readJson(configPath, "loop config"));
  const tools = verifyToolchain(config);

  if (!existsSync(resolve(repoRoot, ".git"))) {
    fail(`Not a repository root or worktree: ${repoRoot}`);
  }
  const agent = verifyAgent(config, loopRoot, tools);
  verifyGitExecutionSnapshot(repoRoot, tools, agent.guard, config.repository);
  const dirty = runGit(
    repoRoot,
    ["status", "--porcelain"],
    tools,
    { capture: true },
  );
  if (dirty.trim()) fail("Repository is not clean; preserve or isolate existing work");

  const githubEnvironment = buildGitHubEnvironment(tools);
  run(
    tools.gh,
    ["auth", "status", "--hostname", "github.com"],
    { env: githubEnvironment },
  );
  const runGhJson = (args) => JSON.parse(
    run(tools.gh, args, { capture: true, env: githubEnvironment }),
  );
  const issueTypeErrors = validateIssueTypeReadback(
    config,
    runGhJson(issueTypeReadbackArgs(config)),
  );
  if (issueTypeErrors.length) {
    fail(`Unsafe native issue type readback:\n${issueTypeErrors.join("\n")}`);
  }

  const issueOutput = run(
    tools.gh,
    [
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
      "number,title,state,url,body,labels,assignees,blockedBy,blocking,milestone,parent,projectItems,issueType",
    ],
    { capture: true, env: githubEnvironment },
  );
  const frontier = JSON.parse(issueOutput);
  const result = validateFrontierSnapshot(frontier, config);
  if (result.errors.length) fail(`Unsafe ready-for-agent frontier:\n${result.errors.join("\n")}`);
  if (!result.selected.length) fail("The active ready-for-agent frontier is empty");
  const projectSnapshots = collectLaunchProjectReadback(config, runGhJson);
  const projectErrors = validateLaunchProjectReadback(
    result.selected,
    config,
    projectSnapshots,
  );
  if (projectErrors.length) {
    fail(`Unsafe launch Project readback:\n${projectErrors.join("\n")}`);
  }
  const launchGateErrors = validateLaunchGateEvidence(
    result.selected,
    config,
    (number) => JSON.parse(
      run(
        tools.gh,
        [
          "issue",
          "view",
          String(number),
          "--repo",
          config.repository,
          "--json",
          "number,state,url,body",
        ],
        { capture: true, env: githubEnvironment },
      ),
    ),
  );
  if (launchGateErrors.length) {
    fail(`Unsafe Product Launch Map gate:\n${launchGateErrors.join("\n")}`);
  }

  const glossaryArgs = [
    resolve(skillRoot, "scripts", "build-glossary.mjs"),
    "--context",
    resolveSafePath(repoRoot, config.glossary.context, "glossary.context"),
    "--glossary",
    resolveSafePath(repoRoot, config.glossary.glossary, "glossary.glossary"),
    "--output",
    resolveSafePath(repoRoot, config.glossary.output, "glossary.output"),
    "--check",
  ];
  run(tools.node, glossaryArgs, { cwd: repoRoot });

  const safeChecksPath = resolveSafePath(
    loopRoot,
    config.safeChecksFile,
    "safeChecksFile",
  );
  const safeChecks = validateSafeChecks(readJson(safeChecksPath, "safe checks"));
  verifyGitExecutionSnapshot(repoRoot, tools, agent.guard, config.repository);
  runSafeChecks(safeChecks, repoRoot, tools);

  const stateRoot = resolveSafePath(loopRoot, "state", "state directory");
  mkdirSync(stateRoot, { recursive: true });
  const frontierJson = `${JSON.stringify(result.selected, null, 2)}\n`;
  writeFileSync(resolve(stateRoot, "frontier.json"), frontierJson);
  const generatedAt = new Date();
  const expiresAt = new Date(generatedAt.getTime() + 15 * 60 * 1000);
  writeFileSync(
    resolve(stateRoot, "preflight-summary.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: generatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        frontierSha256: sha256(frontierJson),
        executionMode: config.executionMode,
        phaseLabel: config.phaseLabel,
        selectedIssues: result.selected.map(({ number }) => number),
        limits: {
          maxAttempts: config.maxAttempts,
          maxRuntimeMinutes: config.maxRuntimeMinutes,
          maxIssuesPerRun: config.maxIssuesPerRun,
          frontierLimit: config.frontierLimit,
          concurrency: config.concurrency,
        },
      },
      null,
      2,
    )}\n`,
  );

  process.stdout.write(
    `Preflight passed for ${result.selected.length} issue(s) in ${config.phaseLabel}.\n`,
  );
}

const isMain = process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    preflight(parseArgs(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
