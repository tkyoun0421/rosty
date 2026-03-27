#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  buildNightWorkPrompt,
  listSupplementaryDocumentPaths,
} from "./lib/buildNightWorkPrompt.mjs";
import { buildNightWorkStatusText, parseNightWorkResult } from "./lib/parseNightWorkResult.mjs";
import { parseNightWorkGoal } from "./lib/parseNightWorkGoal.mjs";

const goal = parseNightWorkGoal(process.argv.slice(2));

if (!goal) {
  console.error('Usage: node scripts/night-work/run.mjs "<goal>"');
  process.exit(1);
}

const repoRoot = process.cwd();
const stateDirectoryPath = path.join(repoRoot, "tmp/night-work");
const schemaPath = path.join(repoRoot, "scripts/night-work/output-schema.json");
const latestPromptPath = path.join(stateDirectoryPath, "latest.prompt.txt");
const latestStatusPath = path.join(stateDirectoryPath, "latest.status");
const latestSummaryPath = path.join(stateDirectoryPath, "latest-summary.txt");
const latestResponsePath = path.join(stateDirectoryPath, "latest-response.json");
const runnerLogPath = path.join(stateDirectoryPath, "runner.log");
const pidPath = path.join(stateDirectoryPath, "runner.pid");
const sleepSeconds = Number.parseInt(process.env.NIGHT_WORK_SLEEP_SECONDS ?? "5", 10);

function appendRunnerLog(message) {
  fs.appendFileSync(runnerLogPath, `${new Date().toISOString()} ${message}\n`, "utf8");
}

function ensureStateDirectory() {
  fs.mkdirSync(stateDirectoryPath, { recursive: true });
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function assertSingleRunner() {
  if (!fs.existsSync(pidPath)) {
    return;
  }

  const existingPid = Number.parseInt(fs.readFileSync(pidPath, "utf8").trim(), 10);

  if (Number.isNaN(existingPid) || existingPid === process.pid) {
    return;
  }

  if (!isProcessAlive(existingPid)) {
    fs.rmSync(pidPath, { force: true });
    return;
  }

  throw new Error(`night-work runner is already active with pid ${existingPid}.`);
}

function writePidFile() {
  fs.writeFileSync(pidPath, `${process.pid}\n`, "utf8");
}

function cleanupPidFile() {
  if (!fs.existsSync(pidPath)) {
    return;
  }

  const recordedPid = fs.readFileSync(pidPath, "utf8").trim();
  if (recordedPid === `${process.pid}`) {
    fs.rmSync(pidPath, { force: true });
  }
}

function readLatestSummary() {
  return fs.existsSync(latestSummaryPath) ? fs.readFileSync(latestSummaryPath, "utf8") : undefined;
}

function readGitStatus() {
  const result = spawnSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "git status --short failed");
  }

  return result.stdout;
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function buildBlockedResult(summary, nextStep, validation) {
  return {
    status: "BLOCKED",
    reason: "external_blocker",
    summary,
    validation,
    next_step: nextStep,
  };
}

function writeLatestArtifacts({ prompt, result, responseText, transcriptPath }) {
  fs.writeFileSync(latestPromptPath, prompt, "utf8");
  fs.writeFileSync(latestResponsePath, responseText, "utf8");
  fs.writeFileSync(latestSummaryPath, `${result.summary}\n`, "utf8");
  fs.writeFileSync(latestStatusPath, `${buildNightWorkStatusText(result)}\n`, "utf8");

  const transcript = [
    `NIGHT_WORK_TRANSCRIPT: ${new Date().toISOString()}`,
    "",
    "## Prompt",
    prompt,
    "",
    "## Result",
    responseText,
    "",
    `## Status File`,
    buildNightWorkStatusText(result),
  ].join("\n");

  fs.writeFileSync(transcriptPath, transcript, "utf8");
}

function runCodex(prompt) {
  fs.rmSync(latestResponsePath, { force: true });

  const result = spawnSync(
    "codex",
    [
      "exec",
      "--full-auto",
      "--cd",
      repoRoot,
      "--color",
      "never",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      latestResponsePath,
      prompt,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );

  const stdout = result.stdout?.trim() ?? "";
  const stderr = result.stderr?.trim() ?? "";
  const responseText = fs.existsSync(latestResponsePath)
    ? fs.readFileSync(latestResponsePath, "utf8")
    : "";

  if (result.status !== 0) {
    return {
      parsedResult: buildBlockedResult(
        "Codex execution failed before a valid night-work response was produced.",
        "Inspect tmp/night-work/runner.log and the latest transcript, then rerun after fixing the CLI or auth issue.",
        stderr || stdout || `codex exit code ${result.status ?? "unknown"}`,
      ),
      responseText:
        responseText || JSON.stringify({ stdout, stderr, exitCode: result.status }, null, 2),
      stdout,
      stderr,
    };
  }

  try {
    return {
      parsedResult: parseNightWorkResult(responseText),
      responseText,
      stdout,
      stderr,
    };
  } catch (error) {
    return {
      parsedResult: buildBlockedResult(
        "Codex returned an invalid night-work payload.",
        "Inspect tmp/night-work/latest-response.json and adjust the runner prompt or schema before rerunning.",
        error instanceof Error ? error.message : "Unknown schema error",
      ),
      responseText: responseText || JSON.stringify({ stdout, stderr }, null, 2),
      stdout,
      stderr,
    };
  }
}

async function main() {
  ensureStateDirectory();
  assertSingleRunner();
  writePidFile();
  appendRunnerLog(`runner started for goal: ${goal}`);

  const stopSignal = () => {
    appendRunnerLog("runner received stop signal");
    cleanupPidFile();
    process.exit(0);
  };

  process.on("SIGINT", stopSignal);
  process.on("SIGTERM", stopSignal);

  try {
    while (true) {
      const prompt = buildNightWorkPrompt({
        goal,
        gitStatus: readGitStatus(),
        latestSummary: readLatestSummary(),
        supplementaryDocumentPaths: listSupplementaryDocumentPaths(repoRoot),
      });
      const transcriptPath = path.join(
        stateDirectoryPath,
        `${new Date().toISOString().replace(/[:.]/g, "-")}.log`,
      );
      const { parsedResult, responseText, stdout, stderr } = runCodex(prompt);

      writeLatestArtifacts({
        prompt,
        result: parsedResult,
        responseText,
        transcriptPath,
      });
      appendRunnerLog(
        `status=${parsedResult.status} reason=${parsedResult.reason} summary=${parsedResult.summary}`,
      );

      if (stdout) {
        appendRunnerLog(`stdout=${stdout}`);
      }

      if (stderr) {
        appendRunnerLog(`stderr=${stderr}`);
      }

      if (parsedResult.status === "BLOCKED") {
        break;
      }

      await sleep(Math.max(sleepSeconds, 1) * 1000);
    }
  } finally {
    cleanupPidFile();
    appendRunnerLog("runner stopped");
  }
}

main().catch((error) => {
  ensureStateDirectory();
  const blockedResult = buildBlockedResult(
    "The night-work runner crashed before completion.",
    "Inspect tmp/night-work/runner.log and fix the runner implementation before restarting.",
    error instanceof Error ? error.message : "Unknown crash",
  );

  fs.writeFileSync(latestStatusPath, `${buildNightWorkStatusText(blockedResult)}\n`, "utf8");
  appendRunnerLog(blockedResult.validation);
  cleanupPidFile();
  process.exit(1);
});
