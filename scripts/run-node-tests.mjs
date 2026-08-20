import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = dirname(scriptDir);
const testsDir = join(repositoryRoot, "tests");

const entries = await readdir(testsDir, { withFileTypes: true });
const testFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".mjs"))
  .map((entry) => join("tests", entry.name))
  .sort((a, b) => a.localeCompare(b, "en"));

if (testFiles.length === 0) {
  throw new Error("ANVIL Node test discovery found no top-level tests/*.mjs files");
}

console.log(`ANVIL Node test files (${testFiles.length}):`);
for (const file of testFiles) console.log(`- ${file}`);

const child = spawn(process.execPath, ["--test", ...testFiles], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`ANVIL Node tests terminated by signal ${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
