import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function main() {
  const root = process.cwd();
  const hooksDirectory = path.join(root, ".githooks");
  const hookPath = path.join(hooksDirectory, "pre-commit");

  await mkdir(hooksDirectory, { recursive: true });
  await writeFile(
    hookPath,
    "#!/bin/sh\npnpm encoding:check\n",
    { encoding: "utf8", mode: 0o755 },
  );

  await execFileAsync("git", ["config", "core.hooksPath", ".githooks"], { cwd: root });

  console.log("Installed Git hooks in .githooks.");
}

await main();
