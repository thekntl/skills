import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  compatibilityFingerprint,
  deploymentContractFingerprint,
  parseEnvironment,
  readinessRequiresEvidence,
  validateEnvironmentValues,
  validateFoundationEvidence,
  validateManifestTemplate,
  validateYamlStructure,
} from "./validate-shared-platform.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = readFileSync(
  resolve(root, "assets/infrastructure/shared-platform.yml"),
  "utf8",
);
const staging = readFileSync(
  resolve(root, "assets/infrastructure/platform.staging.env.example"),
  "utf8",
);
const production = readFileSync(
  resolve(root, "assets/infrastructure/platform.production.env.example"),
  "utf8",
);
const validatorPath = resolve(root, "scripts/validate-shared-platform.mjs");

function resolvedStagingValues() {
  return staging
    .replaceAll(/{{[^}]+}}/g, "owner-reviewed")
    .replace("FOUNDATION_STATE=BLOCKED_OWNER_VERIFICATION", "FOUNDATION_STATE=STAGING_VERIFIED")
    .replace("FOUNDATION_CONTRACT_EVIDENCE=owner-reviewed", "FOUNDATION_CONTRACT_EVIDENCE=https://github.com/thekntl/platform/issues/1")
    .replace("POSTGRES_IMAGE=owner-reviewed", `POSTGRES_IMAGE=registry.example/postgres@sha256:${"a".repeat(64)}`)
    .replace("FREESCOUT_IMAGE=owner-reviewed", `FREESCOUT_IMAGE=registry.example/freescout@sha256:${"b".repeat(64)}`)
    .replace("POSTGRES_MAJOR=owner-reviewed", "POSTGRES_MAJOR=18")
    .replace("POSTGRES_ARCHITECTURE=owner-reviewed", "POSTGRES_ARCHITECTURE=linux/amd64")
    .replace("FREESCOUT_ARCHITECTURE=owner-reviewed", "FREESCOUT_ARCHITECTURE=linux/amd64")
    .replace("POSTGRES_DATA_TARGET=owner-reviewed", "POSTGRES_DATA_TARGET=/var/lib/postgresql")
    .replace("FREESCOUT_SETUP_TYPE=owner-reviewed", "FREESCOUT_SETUP_TYPE=MANUAL")
    .replace("FREESCOUT_SCHEDULER_TYPE=owner-reviewed", "FREESCOUT_SCHEDULER_TYPE=service");
}

function compatibilityFrom(values) {
  return Object.fromEntries(
    [
      "POSTGRES_IMAGE",
      "FREESCOUT_IMAGE",
      "POSTGRES_MAJOR",
      "POSTGRES_ARCHITECTURE",
      "FREESCOUT_ARCHITECTURE",
      "POSTGRES_DATA_TARGET",
      "FREESCOUT_SETUP_TYPE",
      "FREESCOUT_SCHEDULER_TYPE",
      "FREESCOUT_ENABLE_AUTO_UPDATE",
    ].map((key) => [key, values[key]]),
  );
}

function environmentContent(values) {
  return `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;
}

function runValidator(args) {
  return spawnSync(process.execPath, [validatorPath, ...args], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    shell: false,
  });
}

function outputFingerprint(output, name) {
  const match = output.match(new RegExp(`^${name}=([a-f0-9]{64})$`, "m"));
  assert.ok(match, `Expected ${name} in validator output:\n${output}`);
  return match[1];
}

test("packaged shared-platform source and blocked examples are statically valid", () => {
  assert.deepEqual(validateYamlStructure(manifest), []);
  assert.deepEqual(validateManifestTemplate(manifest), []);
  assert.deepEqual(
    validateEnvironmentValues(staging, {
      expectedEnvironment: "staging",
      allowPlaceholders: true,
    }),
    [],
  );
  assert.deepEqual(
    validateEnvironmentValues(production, {
      expectedEnvironment: "production",
      allowPlaceholders: true,
    }),
    [],
  );
});

test("manifest validation rejects malformed or structurally incomplete YAML", () => {
  assert.match(validateYamlStructure("services:\n  postgres: [\n").join("\n"), /YAML/);
  assert.match(
    validateYamlStructure("services:\n  postgres:\n    image: example\n").join("\n"),
    /freescout/,
  );
});

test("environment parser rejects shell syntax and duplicate keys", () => {
  assert.throws(
    () => parseEnvironment("ENVIRONMENT=staging\nENVIRONMENT=production\n"),
    /Duplicate/,
  );
  assert.throws(
    () => parseEnvironment("ENVIRONMENT=$(unsafe)\n"),
    /shell syntax/,
  );
  assert.throws(
    () => parseEnvironment("export ENVIRONMENT=staging\n"),
    /KEY=VALUE/,
  );
});

test("resolved values require immutable images and compatible persistence", () => {
  const resolved = resolvedStagingValues();

  assert.deepEqual(
    validateEnvironmentValues(resolved, {
      expectedEnvironment: "staging",
      allowPlaceholders: false,
      evidenceProvided: true,
    }),
    [],
  );

  assert.match(
    validateEnvironmentValues(
      resolved.replace(
        "POSTGRES_IMAGE=registry.example/postgres@",
        "POSTGRES_IMAGE=registry.example/postgres:18@",
      ),
      {
        expectedEnvironment: "staging",
        allowPlaceholders: false,
        evidenceProvided: true,
      },
    ).join("\n"),
    /immutable/,
  );
  assert.match(
    validateEnvironmentValues(
      resolved.replace("POSTGRES_DATA_TARGET=/var/lib/postgresql", "POSTGRES_DATA_TARGET=/var/lib/postgresql/data"),
      {
        expectedEnvironment: "staging",
        allowPlaceholders: false,
        evidenceProvided: true,
      },
    ).join("\n"),
    /PostgreSQL 18/,
  );
});

test("blocked staging and production fingerprints bootstrap both documented readiness sequences", () => {
  const stagingValues = parseEnvironment(resolvedStagingValues());
  const blockedStagingValues = {
    ...stagingValues,
    FOUNDATION_STATE: "BLOCKED_OWNER_VERIFICATION",
    FOUNDATION_CONTRACT_EVIDENCE: "",
  };
  const stagingContractFingerprint =
    deploymentContractFingerprint(blockedStagingValues);
  assert.equal(
    deploymentContractFingerprint(stagingValues),
    stagingContractFingerprint,
  );

  const compatibility = compatibilityFrom(stagingValues);
  const evidence = {
    schemaVersion: 1,
    state: "STAGING_VERIFIED",
    ownerApproved: true,
    ownerApprovedAt: new Date().toISOString(),
    primarySourceReviewedAt: new Date().toISOString(),
    contractEvidenceUrl: "https://github.com/thekntl/platform/issues/1",
    restoreEvidenceUrl: "https://github.com/thekntl/platform/issues/2",
    primarySources: [
      "https://github.com/freescout-help-desk/freescout",
      "https://github.com/nfrastack/container-freescout",
      "https://github.com/docker-library/postgres",
    ],
    isolatedRestorePassed: true,
    mailSchedulerCompatibilityPassed: true,
    secretFileContractPassed: true,
    manifestSha256: "placeholder",
    stagingDeploymentContractSha256: stagingContractFingerprint,
    productionDeploymentContractSha256: null,
    productionContractEvidenceUrl: null,
    productionOwnerApproved: null,
    productionOwnerApprovedAt: null,
    compatibility,
    compatibilityFingerprint: compatibilityFingerprint(compatibility),
  };
  const productionTarget = {
    ...stagingValues,
    ENVIRONMENT: "production",
    FOUNDATION_STATE: "PRODUCTION_READY",
    FOUNDATION_CONTRACT_EVIDENCE:
      "https://github.com/thekntl/platform/issues/3",
  };
  const blockedProductionTarget = {
    ...productionTarget,
    FOUNDATION_STATE: "BLOCKED_OWNER_VERIFICATION",
    FOUNDATION_CONTRACT_EVIDENCE: "",
  };
  evidence.productionDeploymentContractSha256 =
    deploymentContractFingerprint(blockedProductionTarget);
  assert.equal(
    deploymentContractFingerprint(productionTarget),
    evidence.productionDeploymentContractSha256,
  );
  evidence.productionContractEvidenceUrl =
    productionTarget.FOUNDATION_CONTRACT_EVIDENCE;
  evidence.productionOwnerApproved = true;
  evidence.productionOwnerApprovedAt = new Date().toISOString();

  assert.deepEqual(
    validateFoundationEvidence(evidence, {
      manifest,
      targetEnvironment: "staging",
      targetValues: stagingValues,
      expectedManifestSha256: "placeholder",
    }),
    [],
  );

  const errors = validateFoundationEvidence(evidence, {
    manifest,
    targetEnvironment: "production",
    targetValues: productionTarget,
    expectedManifestSha256: "placeholder",
  });
  assert.deepEqual(errors, []);

  const changedProduction = {
    ...productionTarget,
    POSTGRES_MAJOR: "17",
  };
  assert.match(
    validateFoundationEvidence(evidence, {
      manifest,
      targetEnvironment: "production",
      targetValues: changedProduction,
      expectedManifestSha256: "placeholder",
    }).join("\n"),
    /POSTGRES_MAJOR/,
  );

  assert.match(
    validateFoundationEvidence(evidence, {
      manifest,
      targetEnvironment: "staging",
      targetValues: {
        ...stagingValues,
        FOUNDATION_CONTRACT_EVIDENCE:
          "https://github.com/thekntl/platform/issues/3",
      },
      expectedManifestSha256: "placeholder",
    }).join("\n"),
    /must match the owner-approved staging evidence issue/,
  );
});

test("CLI completes blocked-to-verified staging and blocked-to-ready production sequences", (context) => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "indie-mvp-foundation-"));
  context.after(() => rmSync(temporaryRoot, { recursive: true, force: true }));

  const stagingReadyValues = parseEnvironment(resolvedStagingValues());
  const stagingBlockedValues = {
    ...stagingReadyValues,
    FOUNDATION_STATE: "BLOCKED_OWNER_VERIFICATION",
  };
  const stagingValuesPath = join(temporaryRoot, "staging.env");
  writeFileSync(stagingValuesPath, environmentContent(stagingBlockedValues), {
    mode: 0o600,
  });
  const stagingBlockedRun = runValidator([
    "--values",
    stagingValuesPath,
    "--environment",
    "staging",
  ]);
  assert.equal(
    stagingBlockedRun.status,
    0,
    stagingBlockedRun.stderr || stagingBlockedRun.stdout,
  );
  const stagingFingerprint = outputFingerprint(
    stagingBlockedRun.stdout,
    "deploymentContractSha256",
  );

  const compatibility = compatibilityFrom(stagingReadyValues);
  const evidence = {
    schemaVersion: 1,
    state: "STAGING_VERIFIED",
    ownerApproved: true,
    ownerApprovedAt: new Date().toISOString(),
    primarySourceReviewedAt: new Date().toISOString(),
    contractEvidenceUrl: stagingReadyValues.FOUNDATION_CONTRACT_EVIDENCE,
    restoreEvidenceUrl: "https://github.com/thekntl/platform/issues/2",
    primarySources: [
      "https://github.com/freescout-help-desk/freescout",
      "https://github.com/nfrastack/container-freescout",
      "https://github.com/docker-library/postgres",
    ],
    isolatedRestorePassed: true,
    mailSchedulerCompatibilityPassed: true,
    secretFileContractPassed: true,
    manifestSha256: createHash("sha256").update(manifest).digest("hex"),
    stagingDeploymentContractSha256: stagingFingerprint,
    productionDeploymentContractSha256: null,
    productionContractEvidenceUrl: null,
    productionOwnerApproved: null,
    productionOwnerApprovedAt: null,
    compatibility,
    compatibilityFingerprint: compatibilityFingerprint(compatibility),
  };
  const evidencePath = join(temporaryRoot, "evidence.json");
  writeFileSync(stagingValuesPath, environmentContent(stagingReadyValues), {
    mode: 0o600,
  });
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, {
    mode: 0o600,
  });
  const stagingReadyRun = runValidator([
    "--values",
    stagingValuesPath,
    "--environment",
    "staging",
    "--foundation-evidence",
    evidencePath,
  ]);
  assert.equal(
    stagingReadyRun.status,
    0,
    stagingReadyRun.stderr || stagingReadyRun.stdout,
  );

  const productionBlockedValues = {
    ...stagingReadyValues,
    FOUNDATION_STATE: "BLOCKED_OWNER_VERIFICATION",
    FOUNDATION_CONTRACT_EVIDENCE:
      "https://github.com/thekntl/platform/issues/3",
    ENVIRONMENT: "production",
    STACK_NAME: "indie-platform-production",
    BACKEND_NETWORK: "production-backend",
    INGRESS_NETWORK: "production-ingress",
    POSTGRES_VOLUME: "production-postgres",
    FREESCOUT_DATA_VOLUME: "production-freescout",
    FREESCOUT_HOSTNAME: "support.example.com",
  };
  const productionValuesPath = join(temporaryRoot, "production.env");
  writeFileSync(
    productionValuesPath,
    environmentContent(productionBlockedValues),
    { mode: 0o600 },
  );
  const productionBlockedRun = runValidator([
    "--values",
    productionValuesPath,
    "--environment",
    "production",
  ]);
  assert.equal(
    productionBlockedRun.status,
    0,
    productionBlockedRun.stderr || productionBlockedRun.stdout,
  );
  evidence.productionDeploymentContractSha256 = outputFingerprint(
    productionBlockedRun.stdout,
    "deploymentContractSha256",
  );
  evidence.productionContractEvidenceUrl =
    productionBlockedValues.FOUNDATION_CONTRACT_EVIDENCE;
  evidence.productionOwnerApproved = true;
  evidence.productionOwnerApprovedAt = new Date().toISOString();
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, {
    mode: 0o600,
  });
  writeFileSync(
    productionValuesPath,
    environmentContent({
      ...productionBlockedValues,
      FOUNDATION_STATE: "PRODUCTION_READY",
    }),
    { mode: 0o600 },
  );
  const productionReadyRun = runValidator([
    "--values",
    productionValuesPath,
    "--environment",
    "production",
    "--foundation-evidence",
    evidencePath,
  ]);
  assert.equal(
    productionReadyRun.status,
    0,
    productionReadyRun.stderr || productionReadyRun.stdout,
  );
});

test("verified staging and ready production both require the exact evidence contract", () => {
  assert.equal(
    readinessRequiresEvidence("staging", "BLOCKED_OWNER_VERIFICATION"),
    false,
  );
  assert.equal(readinessRequiresEvidence("staging", "STAGING_VERIFIED"), true);
  assert.equal(
    readinessRequiresEvidence("production", "BLOCKED_OWNER_VERIFICATION"),
    false,
  );
  assert.equal(readinessRequiresEvidence("production", "PRODUCTION_READY"), true);
});

test("runtime-ready state fails without exact evidence and rejects disputed TLS keys", () => {
  const invalid = staging
    .replace("FOUNDATION_STATE=BLOCKED_OWNER_VERIFICATION", "FOUNDATION_STATE=STAGING_VERIFIED")
    .replace(
      "# FREESCOUT_POSTGRES_TLS_SETTING={{BLOCKED_OWNER_VERIFICATION}}",
      "FREESCOUT_DB_PGSQL_SSL_MODE=require",
    );

  const errors = validateEnvironmentValues(invalid, {
    expectedEnvironment: "staging",
    allowPlaceholders: false,
  });

  assert.match(errors.join("\n"), /unresolved placeholder/);
  assert.match(errors.join("\n"), /disputed PostgreSQL TLS/);
});
