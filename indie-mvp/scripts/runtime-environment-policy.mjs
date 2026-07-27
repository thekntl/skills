import { dirname } from "node:path";

const GIT_SOURCE_KEYS = Object.freeze([
  "HOME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LOGNAME",
  "PATH",
  "SSH_AUTH_SOCK",
  "TMPDIR",
  "USER",
]);

const GITHUB_SOURCE_KEYS = Object.freeze([
  "GH_CONFIG_DIR",
  "GH_TOKEN",
  "HOME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LOGNAME",
  "TMPDIR",
  "USER",
]);

function copyAllowed(source, keys) {
  const environment = {};
  for (const key of keys) {
    if (typeof source[key] === "string" && source[key] !== "") {
      environment[key] = source[key];
    }
  }
  return environment;
}

function pinnedGitPath(gitExecutable) {
  return [
    dirname(gitExecutable),
    "/usr/bin",
    "/bin",
  ].filter((value, index, all) => all.indexOf(value) === index).join(":");
}

export function buildGitEnvironment({
  source = process.env,
  githubToken,
  gitExecutable,
} = {}) {
  if (typeof gitExecutable !== "string" || gitExecutable === "") {
    throw new TypeError("Git environment policy requires the verified Git executable");
  }
  const environment = copyAllowed(source, GIT_SOURCE_KEYS);
  environment.GIT_PAGER = "";
  environment.GIT_TERMINAL_PROMPT = "0";
  environment.PAGER = "";
  environment.PATH = pinnedGitPath(gitExecutable);
  if (githubToken) {
    environment.GIT_CONFIG_COUNT = "1";
    environment.GIT_CONFIG_KEY_0 = "http.https://github.com/.extraHeader";
    environment.GIT_CONFIG_VALUE_0 =
      `Authorization: Basic ${Buffer.from(`x-access-token:${githubToken}`).toString("base64")}`;
  }
  return environment;
}

export function buildGitHubEnvironment(tools, { source = process.env } = {}) {
  if (!tools || typeof tools.git !== "string" || tools.git === "") {
    throw new TypeError("GitHub environment policy requires the verified Git executable");
  }
  const environment = copyAllowed(source, GITHUB_SOURCE_KEYS);
  environment.GH_HOST = "github.com";
  environment.GH_PAGER = "";
  environment.GH_PROMPT_DISABLED = "1";
  environment.PAGER = "";
  environment.PATH = pinnedGitPath(tools.git);
  return environment;
}
