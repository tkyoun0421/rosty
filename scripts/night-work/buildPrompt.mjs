#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  buildNightWorkPrompt,
  listSupplementaryDocumentPaths,
} from "./lib/buildNightWorkPrompt.mjs";
import { parseNightWorkGoal } from "./lib/parseNightWorkGoal.mjs";

const goal = parseNightWorkGoal(process.argv.slice(2));

if (!goal) {
  console.error('Usage: node scripts/night-work/buildPrompt.mjs "<goal>"');
  process.exit(1);
}

const repoRoot = process.cwd();
const stateDirectoryPath = path.join(repoRoot, "tmp/night-work");
const latestSummaryPath = path.join(stateDirectoryPath, "latest-summary.txt");
const gitStatus = execFileSync("git", ["status", "--short"], {
  cwd: repoRoot,
  encoding: "utf8",
});
const latestSummary = fs.existsSync(latestSummaryPath)
  ? fs.readFileSync(latestSummaryPath, "utf8")
  : undefined;

const prompt = buildNightWorkPrompt({
  goal,
  gitStatus,
  latestSummary,
  supplementaryDocumentPaths: listSupplementaryDocumentPaths(repoRoot),
});

process.stdout.write(prompt);
