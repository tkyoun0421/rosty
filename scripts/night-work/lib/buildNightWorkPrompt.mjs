import fs from "node:fs";
import path from "node:path";

export const CORE_DOCUMENT_PATHS = [
  ".agents/skills/night-work/SKILL.md",
  "AGENTS.md",
  "docs/domain/working-model.md",
  "docs/prd.md",
  "docs/work-log.md",
];

const SUPPLEMENTARY_DOCUMENT_DIRECTORIES = [
  "docs/domain",
  "docs/policies",
  "docs/decisions",
  "docs/agents",
];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function walkMarkdownFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

export function listSupplementaryDocumentPaths(repoRoot) {
  const discoveredPaths = SUPPLEMENTARY_DOCUMENT_DIRECTORIES.flatMap((directoryPath) =>
    walkMarkdownFiles(path.join(repoRoot, directoryPath)),
  )
    .map((absolutePath) => toPosixPath(path.relative(repoRoot, absolutePath)))
    .filter((relativePath) => !CORE_DOCUMENT_PATHS.includes(relativePath));

  return [...new Set(discoveredPaths)].sort();
}

export function buildNightWorkPrompt({
  goal,
  gitStatus,
  latestSummary,
  coreDocumentPaths = CORE_DOCUMENT_PATHS,
  supplementaryDocumentPaths = [],
}) {
  const statusBlock = gitStatus.trim()
    ? gitStatus
    : "(clean worktree or no pending changes reported)";
  const supplementaryBlock = supplementaryDocumentPaths.length
    ? supplementaryDocumentPaths.map((documentPath) => `- ${documentPath}`).join("\n")
    : "- No additive policy documents detected.";
  const summaryBlock = latestSummary?.trim()
    ? latestSummary.trim()
    : "No previous run summary is available.";

  return [
    "$night-work",
    "",
    "Continue from the current repository state.",
    "Do not stop after one completed slice. Move straight into the next highest-value in-scope task until a hard stop is reached.",
    "",
    "Active objective:",
    goal,
    "",
    "Hard-stop only policy:",
    "- Stop only for approval_required, destructive_change, requirement_conflict, external_blocker, or scope_exhausted.",
    "- Treat a finished feature slice as CONTINUE, not BLOCKED.",
    "- If new behavioral or process rules are needed, add a new document instead of editing an existing document.",
    "",
    "Repository documents to load before substantial edits:",
    ...coreDocumentPaths.map((documentPath) => `- ${documentPath}`),
    "",
    "Additive documents to load after the core set:",
    supplementaryBlock,
    "",
    "Current git status --short:",
    statusBlock,
    "",
    "Latest run summary:",
    summaryBlock,
    "",
    "Output contract:",
    "- Return JSON only and conform to the provided output schema.",
    "- The status and reason must map to these markers:",
    "  NIGHT_WORK_STATUS: CONTINUE",
    "  NIGHT_WORK_STATUS: BLOCKED",
    "  NIGHT_WORK_REASON: slice_complete|approval_required|destructive_change|requirement_conflict|external_blocker|scope_exhausted",
    "- summary should say what changed or why work is blocked.",
    "- validation should say what checks ran, or why they did not run.",
    "- next_step should say the next action if CONTINUE or the human unblock action if BLOCKED.",
  ].join("\n");
}
