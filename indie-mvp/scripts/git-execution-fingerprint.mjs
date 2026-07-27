#!/usr/bin/env node

import { resolve } from "node:path";

import {
  computeGitExecutionSnapshot,
  verifyPinnedTool,
} from "./loop-safety.mjs";

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!["--repo", "--git", "--git-sha256", "--repository"].includes(key) ||
        typeof value !== "string") {
      fail(
        "Usage: git-execution-fingerprint.mjs --repo <absolute-path> " +
        "--git <absolute-git> --git-sha256 <digest> --repository <owner/name>",
      );
    }
    values[key.slice(2)] = value;
  }
  for (const key of ["repo", "git", "git-sha256", "repository"]) {
    if (!values[key]) fail(`Missing --${key}`);
  }
  return values;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const tools = {
    git: verifyPinnedTool("git", {
      executable: args.git,
      sha256: args["git-sha256"],
    }),
  };
  const snapshot = computeGitExecutionSnapshot(
    resolve(args.repo),
    tools,
    args.repository,
  );
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
