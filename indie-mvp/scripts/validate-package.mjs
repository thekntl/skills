#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { emptyLoopContract } from "./loop-contract.mjs";
import { validateAgentArguments } from "./loop-safety.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/operating-contract.md",
  "references/github-planning.md",
  "references/product-map-and-grilling.md",
  "references/fixed-stack.md",
  "references/phase-bootstrap.md",
  "references/phase-demand-validation.md",
  "references/phase-frontend.md",
  "references/phase-integrations.md",
  "references/phase-backend-and-infrastructure.md",
  "references/phase-market-and-marketing.md",
  "references/phase-release-and-postlaunch.md",
  "references/implementation-loops.md",
  "assets/github/master-map.md",
  "assets/github/phase-issue.md",
  "assets/github/implementation-issue.md",
  "assets/github/native-tracker-readback.md",
  "assets/github/native-pull-request-readback.md",
  "assets/github/pull-request.md",
  "assets/github/ask-matt-handoff.md",
  "assets/legal/data-provider-inventory.md",
  "assets/legal/privacy-policy.md",
  "assets/legal/subscription-disclosure.md",
  "assets/legal/support-terms.md",
  "assets/legal/terms-of-use.md",
  "assets/marketing/campaign-brief.md",
  "assets/marketing/competitor-evidence.md",
  "assets/marketing/content-routine.md",
  "assets/marketing/demand-validation-experiment.md",
  "assets/marketing/intent-route-matrix.md",
  "assets/marketing/paywall-variant-matrix.md",
  "assets/infrastructure/owner-values.md",
  "assets/infrastructure/owner-runbook.md",
  "assets/infrastructure/freescout-product-checklist.md",
  "assets/infrastructure/shared-platform.yml",
  "assets/infrastructure/platform.staging.env.example",
  "assets/infrastructure/platform.production.env.example",
  "assets/infrastructure/foundation-evidence.json.example",
  "assets/loop/config.json.example",
  "assets/loop/agent-args.json.example",
  "assets/loop/agent-enforcement-policy.txt.example",
  "assets/loop/agent-runtime-guard.json.example",
  "assets/loop/safe-checks.json.example",
  "assets/loop/gitignore.tmpl",
  "assets/loop/preflight.sh.tmpl",
  "assets/loop/run-phase.sh.tmpl",
  "scripts/build-glossary.mjs",
  "scripts/scaffold-phase-loop.mjs",
  "scripts/loop-safety.mjs",
  "scripts/loop-safety.test.mjs",
  "scripts/loop-contract.mjs",
  "scripts/github-planning-contract.test.mjs",
  "scripts/runtime-environment-policy.mjs",
  "scripts/runtime-environment-policy.test.mjs",
  "scripts/git-execution-fingerprint.mjs",
  "scripts/run-phase-loop.mjs",
  "scripts/run-phase-loop.test.mjs",
  "scripts/validate-shared-platform.mjs",
  "scripts/validate-shared-platform.test.mjs",
];

for (const path of required) {
  if (!existsSync(resolve(root, path))) errors.push(`Missing required file: ${path}`);
}

const markdownFiles = required.filter((path) => path.endsWith(".md"));
for (const path of markdownFiles) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) continue;
  const content = readFileSync(absolute, "utf8");
  if (path === "SKILL.md" || path.startsWith("references/")) {
    if (content.includes("[TODO")) errors.push(`Unresolved TODO in ${path}`);
  }
  const links = [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  for (const link of links) {
    const target = link[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    if (!existsSync(resolve(dirname(absolute), target))) {
      errors.push(`Broken link in ${path}: ${link[1]}`);
    }
  }
}

const skill = readFileSync(resolve(root, "SKILL.md"), "utf8");
const openAiConfig = readFileSync(resolve(root, "agents/openai.yaml"), "utf8");
const demandValidation = readFileSync(
  resolve(root, "references/phase-demand-validation.md"),
  "utf8",
);
const frontend = readFileSync(resolve(root, "references/phase-frontend.md"), "utf8");
const integrations = readFileSync(resolve(root, "references/phase-integrations.md"), "utf8");
const loops = readFileSync(resolve(root, "references/implementation-loops.md"), "utf8");
const implementationIssue = readFileSync(
  resolve(root, "assets/github/implementation-issue.md"),
  "utf8",
);
const masterMap = readFileSync(resolve(root, "assets/github/master-map.md"), "utf8");
const phaseIssue = readFileSync(resolve(root, "assets/github/phase-issue.md"), "utf8");
const nativeTrackerReadback = readFileSync(
  resolve(root, "assets/github/native-tracker-readback.md"),
  "utf8",
);
const nativePullRequestReadback = readFileSync(
  resolve(root, "assets/github/native-pull-request-readback.md"),
  "utf8",
);
const pullRequest = readFileSync(resolve(root, "assets/github/pull-request.md"), "utf8");
const demandExperiment = readFileSync(
  resolve(root, "assets/marketing/demand-validation-experiment.md"),
  "utf8",
);
const paywallMatrix = readFileSync(
  resolve(root, "assets/marketing/paywall-variant-matrix.md"),
  "utf8",
);
const preflight = readFileSync(resolve(root, "assets/loop/preflight.sh.tmpl"), "utf8");
const agentArguments = readFileSync(
  resolve(root, "assets/loop/agent-args.json.example"),
  "utf8",
);
const workerPrompt = readFileSync(resolve(root, "assets/loop/worker-prompt.md"), "utf8");
const runner = readFileSync(resolve(root, "assets/loop/run-phase.sh.tmpl"), "utf8");
const loopSafety = readFileSync(resolve(root, "scripts/loop-safety.mjs"), "utf8");
const phaseRunner = readFileSync(resolve(root, "scripts/run-phase-loop.mjs"), "utf8");
const infrastructure = readFileSync(
  resolve(root, "assets/infrastructure/shared-platform.yml"),
  "utf8",
);
const ownerValues = readFileSync(
  resolve(root, "assets/infrastructure/owner-values.md"),
  "utf8",
);
const infrastructureValidator = readFileSync(
  resolve(root, "scripts/validate-shared-platform.mjs"),
  "utf8",
);
if (skill.split(/\r?\n/).length > 500) errors.push("SKILL.md exceeds 500 lines");
if (!skill.includes("three to seven days")) errors.push("SKILL.md misses launch timebox");
if (!skill.includes("Docker")) errors.push("SKILL.md misses Docker boundary");
if (!skill.includes("Ask Matt")) errors.push("SKILL.md misses Ask Matt closeout");
if (!skill.includes("Demand validation")) errors.push("SKILL.md misses optional demand-validation route");
if (!skill.includes("github-planning.md") ||
    !skill.includes("applicable native GitHub planning feature")) {
  errors.push("SKILL.md must load and enforce the native GitHub planning contract");
}
for (const [name, template] of [
  ["master map", masterMap],
  ["phase issue", phaseIssue],
  ["implementation issue", implementationIssue],
]) {
  if (!template.includes(
    "{{INSERT_AND_RESOLVE_ASSETS/GITHUB/NATIVE-TRACKER-READBACK.MD}}",
  )) {
    errors.push(`${name} template must insert the canonical native tracker readback`);
  }
}
if (!nativeTrackerReadback.includes("## Native tracker readback") ||
    !nativeTrackerReadback.includes("Native GitHub state is canonical")) {
  errors.push("Canonical native tracker readback asset is incomplete");
}
if (!pullRequest.includes(
  "{{INSERT_AND_RESOLVE_ASSETS/GITHUB/NATIVE-PULL-REQUEST-READBACK.MD}}",
) || !nativePullRequestReadback.includes("Closing issue:")) {
  errors.push("Pull-request template must insert its canonical native readback");
}
if (!demandValidation.includes("SetupIntent")) {
  errors.push("Demand-validation reference must disclose the current SetupIntent behavior");
}
if (!demandValidation.includes("does not prove")) {
  errors.push("Demand-validation reference must constrain evidence interpretation");
}
if (!frontend.includes("intent-route-matrix.md")) {
  errors.push("Frontend reference must include acquisition-intent routing");
}
if (!frontend.includes("paywall-variant-matrix.md")) {
  errors.push("Frontend reference must include the fixed Apple paywall");
}
if (!integrations.includes("pay-up-front")) {
  errors.push("Integrations reference must preserve the annual paid introductory model");
}
if (!integrations.includes("only one redeemed introductory offer per subscription group")) {
  errors.push("Integrations reference must preserve Apple's intro eligibility boundary");
}
if (!openAiConfig.includes("allow_implicit_invocation: false")) {
  errors.push("agents/openai.yaml must keep this skill explicitly user-invoked");
}
if (!loops.includes("## Static-safe checks") || !loops.includes("## Ask Matt by execution mode")) {
  errors.push("Implementation loops must define static-safe checks and execution-mode Ask Matt");
}
if (!implementationIssue.includes("<!-- indie-mvp-loop")) {
  errors.push("Implementation issue template must include the machine-readable loop contract");
}
if (!masterMap.includes("<!-- indie-mvp-launch-gate") ||
    !loopSafety.includes("validateLaunchGateEvidence")) {
  errors.push("Frontend queue must bind to the live Product Launch Map gate");
}
const issueContractMatch = implementationIssue.match(
  /<!--\s*indie-mvp-loop\s*([\s\S]*?)-->/i,
);
if (issueContractMatch) {
  try {
    const embedded = JSON.parse(issueContractMatch[1]);
    if (JSON.stringify(embedded) !== JSON.stringify(emptyLoopContract())) {
      errors.push("Implementation issue contract differs from the canonical loop schema");
    }
  } catch (error) {
    errors.push(`Implementation issue contract is not valid JSON: ${error.message}`);
  }
}
if (!masterMap.includes("## Demand-validation clock") ||
    !masterMap.includes("## Public-product clock")) {
  errors.push("Product Launch Map must model validation and public-product clocks separately");
}
for (const requiredText of [
  "Personal-data deletion request route",
  "Market/privacy/legal review",
  "Visitor charge: `none`",
]) {
  if (!demandExperiment.includes(requiredText)) {
    errors.push(`Demand experiment misses: ${requiredText}`);
  }
}
for (const requiredText of [
  "Offering unavailable or malformed",
  "Restore fails",
  "VoiceOver",
  "Dynamic Type",
  "Focus order",
  "Reduce Motion",
]) {
  if (!paywallMatrix.includes(requiredText)) {
    errors.push(`Paywall matrix misses: ${requiredText}`);
  }
}
if (!preflight.includes("loop-safety.mjs") ||
    !preflight.includes("builtin unset BASH_ENV ENV NODE_OPTIONS NODE_PATH") ||
    preflight.includes("bash -lc") ||
    preflight.includes("$(") ||
    preflight.includes("source ")) {
  errors.push("Preflight must delegate to loop-safety without sourcing or free-form shell execution");
}
try {
  validateAgentArguments(JSON.parse(agentArguments));
} catch (error) {
  errors.push(`Agent argument example is unsafe: ${error.message}`);
}
if (!workerPrompt.includes("`autonomous`") ||
    !workerPrompt.includes("never invoke Ask Matt")) {
  errors.push("Worker prompt must keep Ask Matt non-blocking during autonomous loops");
}
if (!runner.includes("run-phase-loop.mjs") ||
    !runner.includes("builtin unset BASH_ENV ENV NODE_OPTIONS NODE_PATH") ||
    runner.includes("ISSUE_QUERY_AND_CLAIM_IMPLEMENTATION") ||
    runner.includes("$(") ||
    /\bexit 2\b/.test(runner)) {
  errors.push("Phase runner must use the complete bounded loop without a claim placeholder");
}
for (const marker of [
  "blockedBy",
  "runtimeGuardFile",
  "argumentsSha256",
  "runtimeGuardSha256",
  "verifyToolchain",
  "gitRemoteHttps",
  "gitConfigurationSha256",
  "gitAttributesSha256",
  "direct HTTPS github.com origin",
  "MAX_GUARD_AGE_MS",
  "containerRuntimeExecutionDenied",
  "indirectRepositoryCommandsDenied",
  "git-clean-smudge-process-filters",
  "git-environment-execution-paths",
  "git-origin-transport",
  "commit.gpgSign=false",
  "claimLabel",
]) {
  if (!loopSafety.includes(marker)) {
    errors.push(`Loop safety misses required live/safety marker: ${marker}`);
  }
}
for (const marker of [
  "claimIssue",
  "createClaimLease",
  "selectClaimWinner",
  "worktree",
  "spawnSync",
  "runSafeChecks",
  "pr",
  "morning-report.md",
  "remove-label",
]) {
  if (!phaseRunner.includes(marker)) {
    errors.push(`Phase runner misses required bounded-loop marker: ${marker}`);
  }
}
if (!infrastructure.includes("BLOCKED_OWNER_VERIFICATION") ||
    !ownerValues.includes("BLOCKED_OWNER_VERIFICATION")) {
  errors.push("Shared foundation must remain explicitly blocked pending owner verification");
}
if (!infrastructure.includes("FREESCOUT_APP_KEY_FILE") ||
    /^\s+APP_KEY_FILE:/m.test(infrastructure)) {
  errors.push("Shared foundation must use the reviewed FreeScout app-key variable");
}
if (!infrastructureValidator.includes("BLOCKED_OWNER_VERIFICATION") ||
    !infrastructureValidator.includes("@sha256:") ||
    !infrastructureValidator.includes("POSTGRES_MAJOR") ||
    !infrastructureValidator.includes("DISPUTED_TLS_KEYS") ||
    !infrastructureValidator.includes("validateFoundationEvidence") ||
    !infrastructureValidator.includes("deploymentContractFingerprint") ||
    !infrastructureValidator.includes("productionOwnerApproved") ||
    !infrastructureValidator.includes("compatibilityFingerprint") ||
    !infrastructureValidator.includes("--foundation-evidence")) {
  errors.push("Shared foundation static validator misses a required owner-verification gate");
}

for (const obsolete of [
  "assets/loop/config.env.example",
  "assets/infrastructure/platform.env.example",
  "assets/infrastructure/shared-platform.production.yml",
  "assets/infrastructure/shared-platform.staging.yml",
]) {
  if (existsSync(resolve(root, obsolete))) {
    errors.push(`Obsolete duplicated or free-form artifact remains: ${obsolete}`);
  }
}

const longStructuredFiles = [
  resolve(root, "..", "indie-mvp-skill-brief.md"),
  ...[
    "references/operating-contract.md",
    "references/github-planning.md",
    "references/product-map-and-grilling.md",
    "references/fixed-stack.md",
    "references/phase-bootstrap.md",
    "references/phase-demand-validation.md",
    "references/phase-frontend.md",
    "references/phase-integrations.md",
    "references/phase-backend-and-infrastructure.md",
    "references/phase-market-and-marketing.md",
    "references/phase-release-and-postlaunch.md",
    "references/implementation-loops.md",
  ].map((path) => resolve(root, path)),
  ...readdirSync(resolve(root, "..", "research"))
    .filter((path) => path.endsWith(".md"))
    .map((path) => resolve(root, "..", "research", path)),
];
for (const absolute of longStructuredFiles) {
  if (!existsSync(absolute)) {
    errors.push(`Missing structured reference: ${absolute}`);
    continue;
  }
  const content = readFileSync(absolute, "utf8");
  if (content.split(/\r?\n/).length > 100 &&
      !/^## (?:Contents|Table of contents)\s*$/m.test(content)) {
    errors.push(`Long reference misses a contents list: ${absolute}`);
  }
}

if (errors.length) {
  for (const error of errors) process.stderr.write(`${error}\n`);
  process.exit(1);
}
process.stdout.write(`Validated Indie MVP package at ${root}\n`);
