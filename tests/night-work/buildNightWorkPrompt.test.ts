import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  CORE_DOCUMENT_PATHS,
  buildNightWorkPrompt,
  listSupplementaryDocumentPaths,
} from "../../scripts/night-work/lib/buildNightWorkPrompt.mjs";

describe("buildNightWorkPrompt", () => {
  it("includes the goal, hard-stop rules, output markers, and repository context", () => {
    const prompt = buildNightWorkPrompt({
      goal: "Continue the current scheduling implementation until blocked.",
      gitStatus: " M src/shared/constants/queryKeys.ts\n?? scripts/night-work/run.sh",
      latestSummary: "Added the current work query and validated it.",
      supplementaryDocumentPaths: [
        "docs/agents/night-work-runner.md",
        "docs/policies/night-work-continuity.md",
      ],
    });

    expect(prompt).toContain("$night-work");
    expect(prompt).toContain("Continue the current scheduling implementation until blocked.");
    expect(prompt).toContain("NIGHT_WORK_STATUS: CONTINUE");
    expect(prompt).toContain("NIGHT_WORK_STATUS: BLOCKED");
    expect(prompt).toContain("approval_required");
    expect(prompt).toContain("AGENTS.md");
    expect(prompt).toContain("docs/domain/working-model.md");
    expect(prompt).toContain("docs/policies/night-work-continuity.md");
    expect(prompt).toContain(" M src/shared/constants/queryKeys.ts");
    expect(prompt).toContain("Added the current work query and validated it.");
  });

  it("falls back cleanly when there is no previous summary", () => {
    const prompt = buildNightWorkPrompt({
      goal: "Keep working.",
      gitStatus: "",
      supplementaryDocumentPaths: [],
    });

    expect(prompt).toContain("No previous run summary is available.");
    expect(prompt).toContain(CORE_DOCUMENT_PATHS[0]);
  });
});

describe("listSupplementaryDocumentPaths", () => {
  const tempPaths: string[] = [];

  afterEach(() => {
    for (const tempPath of tempPaths) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
    tempPaths.length = 0;
  });

  it("collects markdown files from additive policy directories and ignores unrelated files", () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "night-work-docs-"));
    tempPaths.push(repoRoot);

    fs.mkdirSync(path.join(repoRoot, "docs/policies"), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, "docs/decisions"), { recursive: true });
    fs.writeFileSync(
      path.join(repoRoot, "docs/policies/night-work-continuity.md"),
      "# Night Work Continuity\n",
    );
    fs.writeFileSync(
      path.join(repoRoot, "docs/decisions/2026-03-28-runner.md"),
      "# Runner Decision\n",
    );
    fs.writeFileSync(path.join(repoRoot, "docs/policies/ignore.txt"), "ignore");

    expect(listSupplementaryDocumentPaths(repoRoot)).toEqual([
      "docs/decisions/2026-03-28-runner.md",
      "docs/policies/night-work-continuity.md",
    ]);
  });
});
