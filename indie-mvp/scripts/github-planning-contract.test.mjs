import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const skill = read("SKILL.md");
const planning = read("references/github-planning.md");
const bootstrap = read("references/phase-bootstrap.md");
const loops = read("references/implementation-loops.md");
const masterMap = read("assets/github/master-map.md");
const phaseIssue = read("assets/github/phase-issue.md");
const implementationIssue = read("assets/github/implementation-issue.md");
const nativeTrackerReadback = read("assets/github/native-tracker-readback.md");
const nativePullRequestReadback = read(
  "assets/github/native-pull-request-readback.md",
);
const pullRequest = read("assets/github/pull-request.md");

test("the runtime loads the fail-closed native planning contract", () => {
  assert.match(skill, /Read \[github-planning\.md\]/);
  assert.match(skill, /applicable native GitHub planning feature/);
  assert.match(planning, /Native metadata is canonical/);
  assert.match(planning, /do not replace it with body-only links/);
  assert.match(loops, /body link, cached issue-creation response, or unchecked Project auto-add/);
});

test("the issue graph has one native three-level hierarchy and real dependencies", () => {
  assert.match(planning, /Product Launch Map` is the parentless root/);
  assert.match(planning, /Every phase issue is a direct sub-issue/);
  assert.match(planning, /decision, research, implementation, defect, and owner-action issue/);
  assert.match(planning, /Create a dependency only when/);
  assert.match(bootstrap, /Keep that file authoritative/);
});

test("milestones model delivery commitments instead of components", () => {
  assert.match(planning, /Demand validation — YYYY-MM-DD/);
  assert.match(planning, /MVP public launch — YYYY-MM-DD/);
  assert.match(planning, /Post-launch stabilization — YYYY-MM-DD/);
  assert.match(planning, /Never create `Website`, `Creative`, `Backend`/);
  assert.match(planning, /indefinite ideas and deferred learning backlog remain without a milestone/);
});

test("one launch Project is the default only when it adds planning value", () => {
  assert.match(planning, /<PRODUCT> — MVP Launch/);
  assert.match(planning, /at least six planned issues/);
  assert.match(planning, /at most four child issues/);
  assert.match(planning, /durable ownership, access, cadence, backlog, or workflow boundary/);
  assert.match(planning, /Do not depend on auto-add for correctness/);
});

test("tracker construction uses create, wire, readback, and publish passes", () => {
  for (const marker of ["**Discover:**", "**Create:**", "**Wire:**", "**Read back:**", "**Publish:**"]) {
    assert.ok(planning.includes(marker), `missing transaction step ${marker}`);
  }
  assert.match(planning, /connected GitHub integration/);
  assert.match(planning, /current `gh` commands/);
  assert.match(planning, /REST or GraphQL/);
});

test("all issue templates insert one canonical native readback mirror", () => {
  for (const template of [masterMap, phaseIssue, implementationIssue]) {
    assert.match(
      template,
      /\{\{INSERT_AND_RESOLVE_ASSETS\/GITHUB\/NATIVE-TRACKER-READBACK\.MD\}\}/,
    );
  }
  assert.match(nativeTrackerReadback, /## Native tracker readback/);
  assert.match(nativeTrackerReadback, /Native GitHub state is canonical/);
  for (const field of [
    "Parent:",
    "Milestone:",
    "Launch Project:",
    "Project Status:",
    "Blocked by:",
    "Blocking:",
    "Linked pull request:",
    "Verified at:",
  ]) {
    assert.ok(nativeTrackerReadback.includes(field), `missing ${field}`);
  }
});

test("manual pull requests use and verify the native lifecycle", () => {
  assert.match(pullRequest, /^Closes #\{\{ISSUE_NUMBER\}\}$/m);
  assert.match(
    pullRequest.replaceAll("{{ISSUE_NUMBER}}", "42"),
    /^Closes #42$/m,
  );
  assert.match(
    pullRequest,
    /\{\{INSERT_AND_RESOLVE_ASSETS\/GITHUB\/NATIVE-PULL-REQUEST-READBACK\.MD\}\}/,
  );
  assert.match(pullRequest, /same dated milestone/);
  assert.match(pullRequest, /explicitly to the launch Project/);
  assert.match(pullRequest, /read back/i);
  assert.match(nativePullRequestReadback, /Closing issue:/);
  assert.match(nativePullRequestReadback, /Milestone:/);
  assert.match(nativePullRequestReadback, /Launch Project:/);
  assert.match(nativePullRequestReadback, /Project Status:/);
});
