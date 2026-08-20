import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const EXPECTED_PROJECT = "PROJECT ANVIL / Physical Fabric Laboratory";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`ANVIL artifact manifest requires ${name} in GitHub Actions`);
  return value;
}

function requiredConfigString(config, key) {
  const value = config?.[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`ANVIL artifact config requires non-empty ${key}`);
  }
  return value.trim();
}

function validateEntryPath(entryPath) {
  if (!entryPath.startsWith("/") || entryPath.startsWith("//")) {
    throw new Error("ANVIL artifact entryPath must be a single-origin absolute path beginning with /");
  }
  if (entryPath.includes("://") || entryPath.includes("\\") || /[\r\n\0]/u.test(entryPath)) {
    throw new Error("ANVIL artifact entryPath contains a forbidden external or control sequence");
  }
  return entryPath;
}

let artifactConfig;
try {
  artifactConfig = JSON.parse(await readFile(resolve("anvil-artifact.config.json"), "utf8"));
} catch (error) {
  throw new Error(`ANVIL could not read anvil-artifact.config.json: ${error instanceof Error ? error.message : String(error)}`);
}

if (requiredConfigString(artifactConfig, "schema") !== "anvil-owner-artifact-config/v1") {
  throw new Error("ANVIL artifact config has unsupported schema");
}
const project = requiredConfigString(artifactConfig, "project");
if (project !== EXPECTED_PROJECT) throw new Error("ANVIL artifact config has unexpected project identity");
const role = requiredConfigString(artifactConfig, "role");
const entryPath = validateEntryPath(requiredConfigString(artifactConfig, "entryPath"));
const artifactName = requiredConfigString(artifactConfig, "artifactName");

let event = {};
if (isGitHubActions) {
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  try {
    event = JSON.parse(await readFile(eventPath, "utf8"));
  } catch (error) {
    throw new Error(`ANVIL artifact manifest could not read GITHUB_EVENT_PATH: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const checkoutSha = isGitHubActions ? requiredEnv("GITHUB_SHA") : "LOCAL_UNVERIFIED";
const pullRequestHeadSha =
  event && typeof event === "object" && "pull_request" in event && event.pull_request && typeof event.pull_request === "object" &&
  "head" in event.pull_request && event.pull_request.head && typeof event.pull_request.head === "object" &&
  "sha" in event.pull_request.head && typeof event.pull_request.head.sha === "string"
    ? event.pull_request.head.sha.trim()
    : null;
const sourceSha = isGitHubActions ? (pullRequestHeadSha || checkoutSha) : "LOCAL_UNVERIFIED";
const sourceRef = isGitHubActions
  ? (process.env.GITHUB_HEAD_REF?.trim() || requiredEnv("GITHUB_REF_NAME"))
  : "LOCAL_UNVERIFIED";
const sourceRepository = isGitHubActions ? requiredEnv("GITHUB_REPOSITORY") : "LOCAL_UNVERIFIED";
const ciRunId = isGitHubActions ? requiredEnv("GITHUB_RUN_ID") : "LOCAL_UNVERIFIED";
const ciRunAttempt = isGitHubActions ? requiredEnv("GITHUB_RUN_ATTEMPT") : "LOCAL_UNVERIFIED";
const ciEvent = isGitHubActions ? requiredEnv("GITHUB_EVENT_NAME") : "LOCAL_UNVERIFIED";

const provenance = {
  provenance: isGitHubActions ? "github-actions" : "local-unverified",
  sourceRepository,
  sourceSha,
  checkoutSha,
  sourceRef,
  ciEvent,
  ciRunId,
  ciRunAttempt,
};

const manifest = {
  schema: "anvil-owner-artifact/v1",
  project,
  role,
  entryPath,
  ...provenance,
  artifactName,
  builtAt: new Date().toISOString(),
};

// Historical owner-gate UIs still request /forge-gate.json. Keep a fail-closed
// compatibility marker so they do not mistake a current generic artifact for an
// old ANVIL-01/02/03 owner candidate. Historical Playwright tests inject the
// exact historical manifest when they intentionally validate those flows.
const legacyForgeMarker = {
  schema: "anvil-forge-owner-gate/v2",
  project,
  gate: "INACTIVE / NO ACTIVE SCIENTIFIC OWNER GATE",
  entryPath,
  forgeRevision: "retired-compatibility-marker",
  ...provenance,
  artifactName,
  builtAt: manifest.builtAt,
};

const outDir = resolve("dist");
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "anvil-artifact.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(resolve(outDir, "forge-gate.json"), `${JSON.stringify(legacyForgeMarker, null, 2)}\n`, "utf8");
console.log(`ANVIL artifact manifest: ${manifest.role} ${manifest.entryPath} · ${manifest.provenance} source ${manifest.sourceSha} checkout ${manifest.checkoutSha} run ${manifest.ciRunId}`);
console.log(`Legacy Forge compatibility marker: ${legacyForgeMarker.gate}`);
