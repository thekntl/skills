import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildGitEnvironment,
  buildGitHubEnvironment,
} from "./runtime-environment-policy.mjs";

const source = {
  HOME: "/Users/example",
  LANG: "en_US.UTF-8",
  PATH: "/untrusted/bin",
  GH_TOKEN: "github-token",
  NODE_OPTIONS: "--require=unsafe.js",
  DOCKER_HOST: "tcp://runtime.example",
};

test("shared Git policy drops unrelated execution variables and pins PATH", () => {
  const environment = buildGitEnvironment({
    source,
    githubToken: "transient-token",
    gitExecutable: "/verified/git/bin/git",
  });

  assert.equal(environment.HOME, "/Users/example");
  assert.equal(environment.PATH, "/verified/git/bin:/usr/bin:/bin");
  assert.equal(environment.GIT_TERMINAL_PROMPT, "0");
  assert.equal(environment.GIT_CONFIG_COUNT, "1");
  assert.equal(environment.GH_TOKEN, undefined);
  assert.equal(environment.NODE_OPTIONS, undefined);
  assert.equal(environment.DOCKER_HOST, undefined);
});

test("shared Git policy fails closed without a verified Git executable", () => {
  assert.throws(
    () => buildGitEnvironment({ source }),
    /requires the verified Git executable/,
  );
});

test("shared GitHub policy fixes github.com and excludes runtime variables", () => {
  const environment = buildGitHubEnvironment(
    { git: "/verified/git/bin/git" },
    { source },
  );

  assert.equal(environment.GH_HOST, "github.com");
  assert.equal(environment.GH_PROMPT_DISABLED, "1");
  assert.equal(environment.GH_TOKEN, "github-token");
  assert.equal(environment.PATH, "/verified/git/bin:/usr/bin:/bin");
  assert.equal(environment.NODE_OPTIONS, undefined);
  assert.equal(environment.DOCKER_HOST, undefined);
});
