#!/usr/bin/env node

import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const values = { force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      values.force = true;
      continue;
    }
    if (["--repo", "--phase"].includes(arg)) {
      values[arg.slice(2)] = argv[index + 1];
      index += 1;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }
  if (!values.repo) fail("Missing --repo");
  if (!values.phase) fail("Missing --phase");
  return values;
}

const args = parseArgs(process.argv.slice(2));
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = join(skillRoot, "assets", "loop");
const repoRoot = resolve(args.repo);
const outputRoot = join(repoRoot, ".indie-mvp-loop");
const phaseLabel = args.phase.startsWith("phase:") ?
  args.phase :
  `phase:${args.phase}`;

if (!existsSync(join(repoRoot, ".git"))) {
  fail(`Not a repository root: ${repoRoot}`);
}
if (existsSync(outputRoot) && !args.force) {
  fail(`Loop package exists: ${outputRoot}. Use --force only after reviewing local changes.`);
}

mkdirSync(outputRoot, { recursive: true });
mkdirSync(join(outputRoot, "state"), { recursive: true });
mkdirSync(join(outputRoot, "logs"), { recursive: true });

const files = [
  ["config.json.example", "config.json.example"],
  ["agent-args.json.example", "agent-args.json.example"],
  ["agent-enforcement-policy.txt.example", "agent-enforcement-policy.txt.example"],
  ["agent-runtime-guard.json.example", "agent-runtime-guard.json.example"],
  ["safe-checks.json.example", "safe-checks.json.example"],
  ["gitignore.tmpl", ".gitignore"],
  ["operator-guide.md", "operator-guide.md"],
  ["worker-prompt.md", "worker-prompt.md"],
  ["morning-report.md", "morning-report.template.md"],
  ["preflight.sh.tmpl", "preflight.sh"],
  ["run-phase.sh.tmpl", "run-phase.sh"],
];

for (const [sourceName, outputName] of files) {
  const source = join(templateRoot, sourceName);
  const target = join(outputRoot, outputName);
  let content = readFileSync(source, "utf8")
    .replaceAll("{{PHASE}}", args.phase)
    .replaceAll("{{phase:frontend}}", phaseLabel)
    .replaceAll("{{INDIE_MVP_SKILL_PATH}}", skillRoot);
  writeFileSync(target, content);
  if (outputName.endsWith(".sh")) chmodSync(target, 0o755);
}

cpSync(
  join(outputRoot, "config.json.example"),
  join(outputRoot, "config.json"),
  { force: args.force },
);
cpSync(
  join(outputRoot, "agent-args.json.example"),
  join(outputRoot, "agent-args.json"),
  { force: args.force },
);
cpSync(
  join(outputRoot, "agent-enforcement-policy.txt.example"),
  join(outputRoot, "agent-enforcement-policy.txt"),
  { force: args.force },
);
cpSync(
  join(outputRoot, "agent-runtime-guard.json.example"),
  join(outputRoot, "agent-runtime-guard.json"),
  { force: args.force },
);
cpSync(
  join(outputRoot, "safe-checks.json.example"),
  join(outputRoot, "safe-checks.json"),
  { force: args.force },
);

process.stdout.write(
  `Scaffolded ${basename(repoRoot)} phase loop at ${outputRoot}\n` +
    "Complete the JSON contracts and owner-reviewed runtime guard, then run run-phase.sh.\n",
);
