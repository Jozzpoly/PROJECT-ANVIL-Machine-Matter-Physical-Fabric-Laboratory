import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Forge manifest requires ${name} in GitHub Actions`);
  return value;
}

let event = {};
if (isGitHubActions) {
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  try {
    event = JSON.parse(await readFile(eventPath, "utf8"));
  } catch (error) {
    throw new Error(`Forge manifest could not read GITHUB_EVENT_PATH: ${error instanceof Error ? error.message : String(error)}`);
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

const manifest = {
  schema: "anvil-forge-owner-gate/v1",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-01 / CUT",
  forgeRevision: "v0.1-field-trial",
  provenance: isGitHubActions ? "github-actions" : "local-unverified",
  sourceRepository,
  sourceSha,
  checkoutSha,
  sourceRef,
  ciEvent,
  ciRunId,
  ciRunAttempt,
  artifactName: "anvil-browser-laboratory",
  builtAt: new Date().toISOString(),
};

const outDir = resolve("dist");
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "forge-gate.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Forge manifest: ${manifest.provenance} source ${manifest.sourceSha} checkout ${manifest.checkoutSha} run ${manifest.ciRunId}`);
