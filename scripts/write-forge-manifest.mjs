import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Forge manifest requires ${name} in GitHub Actions`);
  return value;
}

const sourceSha = isGitHubActions ? requiredEnv("GITHUB_SHA") : "LOCAL_UNVERIFIED";
const sourceRef = isGitHubActions
  ? (process.env.GITHUB_HEAD_REF?.trim() || requiredEnv("GITHUB_REF_NAME"))
  : "LOCAL_UNVERIFIED";
const sourceRepository = isGitHubActions ? requiredEnv("GITHUB_REPOSITORY") : "LOCAL_UNVERIFIED";
const ciRunId = isGitHubActions ? requiredEnv("GITHUB_RUN_ID") : "LOCAL_UNVERIFIED";
const ciRunAttempt = isGitHubActions ? requiredEnv("GITHUB_RUN_ATTEMPT") : "LOCAL_UNVERIFIED";

const manifest = {
  schema: "anvil-forge-owner-gate/v1",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-01 / CUT",
  forgeRevision: "v0.1-field-trial",
  provenance: isGitHubActions ? "github-actions" : "local-unverified",
  sourceRepository,
  sourceSha,
  sourceRef,
  ciRunId,
  ciRunAttempt,
  artifactName: "anvil-browser-laboratory",
  builtAt: new Date().toISOString(),
};

const outDir = resolve("dist");
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "forge-gate.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Forge manifest: ${manifest.provenance} ${manifest.sourceSha} run ${manifest.ciRunId}`);
