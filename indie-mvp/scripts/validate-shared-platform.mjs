#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REQUIRED_VALUES = new Set([
  "FOUNDATION_STATE",
  "FOUNDATION_CONTRACT_EVIDENCE",
  "ENVIRONMENT",
  "STACK_NAME",
  "POSTGRES_IMAGE",
  "POSTGRES_MAJOR",
  "POSTGRES_ARCHITECTURE",
  "FREESCOUT_IMAGE",
  "FREESCOUT_ARCHITECTURE",
  "POSTGRES_DATA_TARGET",
  "BACKEND_NETWORK",
  "INGRESS_NETWORK",
  "POSTGRES_VOLUME",
  "FREESCOUT_DATA_VOLUME",
  "POSTGRES_NODE_LABEL",
  "FREESCOUT_NODE_LABEL",
  "POSTGRES_ADMIN_USER_SECRET",
  "POSTGRES_ADMIN_PASSWORD_SECRET",
  "FREESCOUT_DB_PASSWORD_SECRET",
  "FREESCOUT_APP_KEY_SECRET",
  "POSTGRES_CPU_LIMIT",
  "POSTGRES_MEMORY_LIMIT",
  "POSTGRES_CPU_RESERVATION",
  "POSTGRES_MEMORY_RESERVATION",
  "FREESCOUT_CPU_LIMIT",
  "FREESCOUT_MEMORY_LIMIT",
  "FREESCOUT_CPU_RESERVATION",
  "FREESCOUT_MEMORY_RESERVATION",
  "FREESCOUT_HOSTNAME",
  "FREESCOUT_DB_NAME",
  "FREESCOUT_DB_USER",
  "FREESCOUT_SETUP_TYPE",
  "FREESCOUT_SCHEDULER_TYPE",
  "FREESCOUT_ENABLE_AUTO_UPDATE",
]);

// These values describe evidence/readiness, not the deployment contract itself.
// Excluding them lets an owner fingerprint blocked values, collect evidence, and
// then promote the same contract without creating a self-referential hash.
const EVIDENCE_CONTROL_VALUES = new Set([
  "FOUNDATION_STATE",
  "FOUNDATION_CONTRACT_EVIDENCE",
]);

const MANIFEST_METADATA_VALUES = new Set([
  "STACK_NAME",
  "POSTGRES_MAJOR",
  "POSTGRES_ARCHITECTURE",
  "FREESCOUT_ARCHITECTURE",
]);

const DISPUTED_TLS_KEYS = [
  "FREESCOUT_DB_PGSQL_SSL_MODE",
  "DB_PGSQL_SSL_MODE",
  "DB_PGSQL_SSLMODE",
  "FREESCOUT_POSTGRES_TLS_SETTING",
];

const COMPATIBILITY_KEYS = Object.freeze([
  "POSTGRES_IMAGE",
  "FREESCOUT_IMAGE",
  "POSTGRES_MAJOR",
  "POSTGRES_ARCHITECTURE",
  "FREESCOUT_ARCHITECTURE",
  "POSTGRES_DATA_TARGET",
  "FREESCOUT_SETUP_TYPE",
  "FREESCOUT_SCHEDULER_TYPE",
  "FREESCOUT_ENABLE_AUTO_UPDATE",
]);

function isPlaceholder(value) {
  return /\{\{[^}]+\}\}/.test(value);
}

function isImmutableImage(reference) {
  const marker = "@sha256:";
  const markerIndex = reference.indexOf(marker);
  if (markerIndex <= 0 || reference.indexOf(marker, markerIndex + 1) !== -1) {
    return false;
  }
  const repository = reference.slice(0, markerIndex);
  const digest = reference.slice(markerIndex + marker.length);
  const imageName = repository.slice(repository.lastIndexOf("/") + 1);
  return repository.includes("/") &&
    imageName.length > 0 &&
    !imageName.includes(":") &&
    /^[a-f0-9]{64}$/i.test(digest);
}

export function compatibilityFingerprint(compatibility) {
  const canonical = {};
  for (const key of COMPATIBILITY_KEYS) canonical[key] = compatibility[key];
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function deploymentContractFingerprint(values) {
  const canonical = {};
  for (const key of [...REQUIRED_VALUES].sort()) {
    if (EVIDENCE_CONTROL_VALUES.has(key)) continue;
    canonical[key] = values[key];
  }
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function parseEnvironment(content) {
  const values = {};
  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) {
      throw new Error(`Line ${index + 1} must use plain KEY=VALUE syntax`);
    }
    const [, key, rawValue] = match;
    if (Object.hasOwn(values, key)) {
      throw new Error(`Duplicate environment key: ${key}`);
    }
    const value = rawValue.trim();
    if (/`|\$\(|\$\{|[;&|<>]/.test(value)) {
      throw new Error(`Environment key ${key} contains shell syntax`);
    }
    values[key] = value;
  }
  return values;
}

export function validateYamlStructure(content) {
  if (content.includes("\t")) return ["YAML must not contain tab indentation"];
  const ruby = spawnSync(
    "ruby",
    [
      "-e",
      [
        'require "yaml"',
        "document = YAML.safe_load(STDIN.read, permitted_classes: [], aliases: false)",
        'abort "root must be a map" unless document.is_a?(Hash)',
        'services = document["services"]',
        'abort "services must be a map" unless services.is_a?(Hash)',
        '%w[postgres freescout].each { |name| abort "missing service #{name}" unless services[name].is_a?(Hash) }',
        '%w[networks volumes secrets].each { |name| abort "#{name} must be a map" unless document[name].is_a?(Hash) }',
      ].join("; "),
    ],
    {
      encoding: "utf8",
      input: content,
      maxBuffer: 1024 * 1024,
      shell: false,
    },
  );
  if (ruby.error) {
    return [
      `YAML parser unavailable; owner handoff required before readiness: ${ruby.error.message}`,
    ];
  }
  if (ruby.status !== 0) {
    return [`YAML structure is invalid: ${(ruby.stderr || ruby.stdout).trim()}`];
  }
  return [];
}

export function validateManifestTemplate(content) {
  const errors = validateYamlStructure(content);
  if (!content.includes("AUTHORING TEMPLATE ONLY — NOT RUNTIME-READY")) {
    errors.push("Manifest must retain the non-runtime-ready warning");
  }
  if (!content.includes('state: "${FOUNDATION_STATE}"')) {
    errors.push("Manifest must expose the foundation readiness state");
  }
  if (!content.includes("FREESCOUT_APP_KEY_FILE")) {
    errors.push("Manifest must use the verified FreeScout app-key file variable");
  }
  if (content.includes("APP_KEY_FILE:") &&
      !content.includes("FREESCOUT_APP_KEY_FILE:")) {
    errors.push("Manifest contains the obsolete FreeScout app-key variable");
  }
  for (const key of DISPUTED_TLS_KEYS) {
    if (content.includes(`${key}:`) || content.includes(`\${${key}}`)) {
      errors.push(`Manifest must not guess the disputed PostgreSQL TLS key ${key}`);
    }
  }

  const placeholders = new Set(
    [...content.matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/g)].map((match) => match[1]),
  );
  for (const key of REQUIRED_VALUES) {
    if (MANIFEST_METADATA_VALUES.has(key)) continue;
    if (!placeholders.has(key)) errors.push(`Manifest misses value placeholder ${key}`);
  }
  for (const key of placeholders) {
    if (!REQUIRED_VALUES.has(key)) errors.push(`Manifest has undeclared value placeholder ${key}`);
  }
  return errors;
}

export function validateEnvironmentValues(
  content,
  { expectedEnvironment, allowPlaceholders, evidenceProvided = false },
) {
  let values;
  try {
    values = parseEnvironment(content);
  } catch (error) {
    return [error.message];
  }

  const errors = [];
  for (const key of REQUIRED_VALUES) {
    if (!Object.hasOwn(values, key) || values[key] === "") {
      errors.push(`Missing required environment value ${key}`);
    }
  }
  for (const key of Object.keys(values)) {
    if (!REQUIRED_VALUES.has(key) && DISPUTED_TLS_KEYS.includes(key)) {
      errors.push(`Remove disputed PostgreSQL TLS key ${key}`);
    } else if (!REQUIRED_VALUES.has(key)) {
      errors.push(`Unsupported environment value ${key}`);
    }
  }

  if (values.ENVIRONMENT !== expectedEnvironment) {
    errors.push(`ENVIRONMENT must be ${expectedEnvironment}`);
  }
  const allowedStates = expectedEnvironment === "staging"
    ? new Set(["BLOCKED_OWNER_VERIFICATION", "STAGING_VERIFIED"])
    : new Set(["BLOCKED_OWNER_VERIFICATION", "PRODUCTION_READY"]);
  if (!allowedStates.has(values.FOUNDATION_STATE)) {
    errors.push(`Invalid ${expectedEnvironment} FOUNDATION_STATE`);
  }
  if (readinessRequiresEvidence(
    expectedEnvironment,
    values.FOUNDATION_STATE,
  ) && !evidenceProvided) {
    errors.push(`${values.FOUNDATION_STATE} requires --foundation-evidence`);
  }

  if (!allowPlaceholders) {
    for (const [key, value] of Object.entries(values)) {
      if (isPlaceholder(value)) errors.push(`${key} contains an unresolved placeholder`);
    }
  } else if (values.FOUNDATION_STATE !== "BLOCKED_OWNER_VERIFICATION") {
    errors.push("Example values with placeholders must remain BLOCKED_OWNER_VERIFICATION");
  }

  for (const imageKey of ["POSTGRES_IMAGE", "FREESCOUT_IMAGE"]) {
    const value = values[imageKey] ?? "";
    if (!isPlaceholder(value) && !isImmutableImage(value)) {
      errors.push(`${imageKey} must be a full immutable repository@sha256 reference without a mutable tag`);
    }
  }
  for (const architectureKey of ["POSTGRES_ARCHITECTURE", "FREESCOUT_ARCHITECTURE"]) {
    const value = values[architectureKey] ?? "";
    if (!isPlaceholder(value) && !/^linux\/(?:amd64|arm64)$/.test(value)) {
      errors.push(`${architectureKey} must identify the reviewed linux/amd64 or linux/arm64 artifact`);
    }
  }

  const major = Number(values.POSTGRES_MAJOR);
  const target = values.POSTGRES_DATA_TARGET;
  if (!isPlaceholder(values.POSTGRES_MAJOR ?? "") &&
      (!Number.isInteger(major) || major < 14 || major > 99)) {
    errors.push("POSTGRES_MAJOR must be an explicit supported integer major");
  } else if (Number.isInteger(major) && !isPlaceholder(target ?? "")) {
    if (major <= 17 && target !== "/var/lib/postgresql/data") {
      errors.push("PostgreSQL 17 and below require POSTGRES_DATA_TARGET=/var/lib/postgresql/data");
    }
    if (major >= 18 && target !== "/var/lib/postgresql") {
      errors.push("PostgreSQL 18 and above require POSTGRES_DATA_TARGET=/var/lib/postgresql");
    }
  }

  const setupType = values.FREESCOUT_SETUP_TYPE ?? "";
  if (!isPlaceholder(setupType) && !["AUTO", "MANUAL"].includes(setupType)) {
    errors.push("FREESCOUT_SETUP_TYPE must be AUTO or MANUAL");
  }
  const schedulerType = values.FREESCOUT_SCHEDULER_TYPE ?? "";
  if (!isPlaceholder(schedulerType) && !["service", "cron"].includes(schedulerType)) {
    errors.push("FREESCOUT_SCHEDULER_TYPE must be service or cron");
  }
  if (values.FREESCOUT_ENABLE_AUTO_UPDATE !== "FALSE") {
    errors.push("FREESCOUT_ENABLE_AUTO_UPDATE must remain FALSE for deterministic promotion");
  }

  if (values.FOUNDATION_STATE !== "BLOCKED_OWNER_VERIFICATION") {
    const evidence = values.FOUNDATION_CONTRACT_EVIDENCE ?? "";
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(evidence)) {
      errors.push("A runtime-ready state requires an exact GitHub infrastructure evidence issue URL");
    }
  }

  return errors;
}

export function validateFoundationEvidence(
  evidence,
  { manifest, targetEnvironment, targetValues, expectedManifestSha256 },
) {
  const errors = [];
  if (!["staging", "production"].includes(targetEnvironment)) {
    errors.push("Foundation evidence validation requires a staging or production target");
  }
  const requiredKeys = new Set([
    "schemaVersion",
    "state",
    "ownerApproved",
    "ownerApprovedAt",
    "primarySourceReviewedAt",
    "contractEvidenceUrl",
    "restoreEvidenceUrl",
    "primarySources",
    "isolatedRestorePassed",
    "mailSchedulerCompatibilityPassed",
    "secretFileContractPassed",
    "manifestSha256",
    "stagingDeploymentContractSha256",
    "productionDeploymentContractSha256",
    "productionContractEvidenceUrl",
    "productionOwnerApproved",
    "productionOwnerApprovedAt",
    "compatibility",
    "compatibilityFingerprint",
  ]);
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return ["Foundation evidence must be an object"];
  }
  for (const key of requiredKeys) {
    if (!(key in evidence)) errors.push(`Foundation evidence misses ${key}`);
  }
  for (const key of Object.keys(evidence)) {
    if (!requiredKeys.has(key)) errors.push(`Foundation evidence has unsupported key ${key}`);
  }
  if (evidence.schemaVersion !== 1) errors.push("Foundation evidence schemaVersion must be 1");
  if (evidence.state !== "STAGING_VERIFIED") {
    errors.push("Foundation evidence state must be STAGING_VERIFIED");
  }
  if (evidence.ownerApproved !== true) errors.push("Foundation evidence requires ownerApproved=true");
  const approvedAt = Date.parse(evidence.ownerApprovedAt);
  const sourceReviewedAt = Date.parse(evidence.primarySourceReviewedAt);
  const now = Date.now();
  if (Number.isNaN(approvedAt) ||
      approvedAt > now + 5 * 60 * 1000 ||
      now - approvedAt > 30 * 24 * 60 * 60 * 1000) {
    errors.push("Staging ownerApprovedAt must be valid and no older than 30 days");
  }
  if (Number.isNaN(sourceReviewedAt) ||
      sourceReviewedAt > now + 5 * 60 * 1000 ||
      now - sourceReviewedAt > 30 * 24 * 60 * 60 * 1000) {
    errors.push("Primary-source review must be valid and no older than 30 days");
  }
  for (const [name, value] of [
    ["contractEvidenceUrl", evidence.contractEvidenceUrl],
    ["restoreEvidenceUrl", evidence.restoreEvidenceUrl],
  ]) {
    if (typeof value !== "string" ||
        !/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(value)) {
      errors.push(`${name} must be an exact GitHub evidence issue URL`);
    }
  }
  if (targetEnvironment === "staging" &&
      targetValues.FOUNDATION_CONTRACT_EVIDENCE !==
      evidence.contractEvidenceUrl) {
    errors.push(
      "FOUNDATION_CONTRACT_EVIDENCE must match the owner-approved staging evidence issue",
    );
  }
  if (!Array.isArray(evidence.primarySources) ||
      evidence.primarySources.length < 3 ||
      evidence.primarySources.some((url) =>
        typeof url !== "string" ||
        !/^https:\/\/(?:github\.com|hub\.docker\.com|www\.postgresql\.org)\//.test(url))) {
    errors.push("Foundation evidence requires at least three reviewed primary-source URLs");
  }
  for (const key of [
    "isolatedRestorePassed",
    "mailSchedulerCompatibilityPassed",
    "secretFileContractPassed",
  ]) {
    if (evidence[key] !== true) errors.push(`Foundation evidence requires ${key}=true`);
  }
  const manifestDigest = expectedManifestSha256 ??
    createHash("sha256").update(manifest).digest("hex");
  if (evidence.manifestSha256 !== manifestDigest) {
    errors.push("Foundation evidence manifestSha256 does not match the current shared-platform source");
  }
  if (!/^[a-f0-9]{64}$/i.test(evidence.stagingDeploymentContractSha256 ?? "")) {
    errors.push("Foundation evidence requires stagingDeploymentContractSha256");
  }
  if (targetEnvironment === "staging") {
    if (evidence.stagingDeploymentContractSha256 !==
        deploymentContractFingerprint(targetValues)) {
      errors.push(
        "Foundation evidence does not match the complete staging deployment contract",
      );
    }
    if (evidence.productionDeploymentContractSha256 !== null &&
        !/^[a-f0-9]{64}$/i.test(evidence.productionDeploymentContractSha256 ?? "")) {
      errors.push("Foundation evidence productionDeploymentContractSha256 must be null or a SHA-256 digest");
    }
  }
  if (targetEnvironment === "production") {
    if (evidence.productionOwnerApproved !== true) {
      errors.push("Production readiness requires productionOwnerApproved=true");
    }
    const productionApprovedAt = Date.parse(evidence.productionOwnerApprovedAt);
    if (Number.isNaN(productionApprovedAt) ||
        productionApprovedAt > now + 5 * 60 * 1000 ||
        now - productionApprovedAt > 30 * 24 * 60 * 60 * 1000) {
      errors.push(
        "Production readiness requires productionOwnerApprovedAt no older than 30 days",
      );
    }
    if (typeof evidence.productionContractEvidenceUrl !== "string" ||
        !/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(
          evidence.productionContractEvidenceUrl,
        ) ||
        evidence.productionContractEvidenceUrl !==
          targetValues.FOUNDATION_CONTRACT_EVIDENCE) {
      errors.push(
        "Production evidence issue must match the resolved production environment",
      );
    }
    if (!/^[a-f0-9]{64}$/i.test(evidence.productionDeploymentContractSha256 ?? "") ||
        evidence.productionDeploymentContractSha256 !==
          deploymentContractFingerprint(targetValues)) {
      errors.push(
        "Production evidence does not match the complete resolved production environment",
      );
    }
  }
  if (!evidence.compatibility ||
      typeof evidence.compatibility !== "object" ||
      Array.isArray(evidence.compatibility)) {
    errors.push("Foundation evidence compatibility must be an object");
    return errors;
  }
  const compatibilityKeys = Object.keys(evidence.compatibility).sort();
  if (JSON.stringify(compatibilityKeys) !==
      JSON.stringify([...COMPATIBILITY_KEYS].sort())) {
    errors.push("Foundation evidence compatibility has missing or unsupported fields");
  }
  const fingerprint = compatibilityFingerprint(evidence.compatibility);
  if (evidence.compatibilityFingerprint !== fingerprint) {
    errors.push("Foundation evidence compatibilityFingerprint is invalid");
  }
  for (const key of COMPATIBILITY_KEYS) {
    if (targetValues[key] !== evidence.compatibility[key]) {
      errors.push(`Target ${key} differs from the owner-approved staging compatibility set`);
    }
  }
  return errors;
}

export function readinessRequiresEvidence(environment, state) {
  return (environment === "staging" && state === "STAGING_VERIFIED") ||
    (environment === "production" && state === "PRODUCTION_READY");
}

function parseArgs(argv) {
  if (argv.length === 0) return { packagedExamples: true };
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!["--values", "--environment", "--foundation-evidence"].includes(key) || !value) {
      throw new Error(
        "Usage: validate-shared-platform.mjs [--values <env-file> --environment staging|production [--foundation-evidence <json>]]",
      );
    }
    values[key.slice(2)] = value;
  }
  if (!values.values || !["staging", "production"].includes(values.environment)) {
    throw new Error("--environment must be staging or production");
  }
  return {
    valuesPath: resolve(values.values),
    expectedEnvironment: values.environment,
    foundationEvidencePath: values["foundation-evidence"]
      ? resolve(values["foundation-evidence"])
      : undefined,
  };
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const infrastructureRoot = resolve(root, "assets", "infrastructure");
  const args = parseArgs(process.argv.slice(2));
  const manifest = readFileSync(resolve(infrastructureRoot, "shared-platform.yml"), "utf8");
  const errors = validateManifestTemplate(manifest);
  let deploymentContractValues;

  if (args.packagedExamples) {
    for (const environment of ["staging", "production"]) {
      const content = readFileSync(
        resolve(infrastructureRoot, `platform.${environment}.env.example`),
        "utf8",
      );
      errors.push(
        ...validateEnvironmentValues(content, {
          expectedEnvironment: environment,
          allowPlaceholders: true,
        }).map((error) => `${environment}: ${error}`),
      );
    }
  } else {
    const content = readFileSync(args.valuesPath, "utf8");
    const environmentErrors = validateEnvironmentValues(content, {
        expectedEnvironment: args.expectedEnvironment,
        allowPlaceholders: false,
        evidenceProvided: Boolean(args.foundationEvidencePath),
      });
    errors.push(...environmentErrors);
    const environmentValues = parseEnvironment(content);
    deploymentContractValues = environmentValues;
    const evidenceRequired = readinessRequiresEvidence(
      args.expectedEnvironment,
      environmentValues.FOUNDATION_STATE,
    );
    if (evidenceRequired && environmentErrors.length === 0) {
      const foundationEvidence = JSON.parse(
        readFileSync(args.foundationEvidencePath, "utf8"),
      );
      errors.push(
        ...validateFoundationEvidence(foundationEvidence, {
          manifest,
          targetEnvironment: args.expectedEnvironment,
          targetValues: environmentValues,
        }),
      );
    }
  }

  if (errors.length) {
    for (const error of errors) process.stderr.write(`${error}\n`);
    process.exit(1);
  }
  process.stdout.write(
    args.packagedExamples
      ? "Shared-platform authoring template and blocked examples are statically valid.\n"
      : `${args.expectedEnvironment} shared-platform values are statically valid.\n` +
        `deploymentContractSha256=${deploymentContractFingerprint(deploymentContractValues)}\n` +
        (args.expectedEnvironment === "staging"
          ? `manifestSha256=${createHash("sha256").update(manifest).digest("hex")}\n` +
            `compatibilityFingerprint=${compatibilityFingerprint(deploymentContractValues)}\n`
          : ""),
  );
}

const isMain = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
