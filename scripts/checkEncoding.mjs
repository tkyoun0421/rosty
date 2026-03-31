import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".scss",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const bomAllowedExtensions = new Set([".ps1"]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
]);

function hasUtf8Bom(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
}

async function* walk(directory) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        yield* walk(fullPath);
      }
      continue;
    }

    yield fullPath;
  }
}

function decodeUtf8(buffer, relativePath) {
  const decoder = new TextDecoder("utf-8", { fatal: true });

  try {
    return decoder.decode(buffer);
  } catch {
    throw new Error(`${relativePath}: not valid UTF-8`);
  }
}

async function main() {
  const root = process.cwd();
  const failures = [];

  for await (const filePath of walk(root)) {
    const extension = path.extname(filePath).toLowerCase();

    if (!textExtensions.has(extension) && !bomAllowedExtensions.has(extension)) {
      continue;
    }

    const relativePath = path.relative(root, filePath).split(path.sep).join("/");
    const buffer = await readFile(filePath);
    const hasBom = hasUtf8Bom(buffer);

    if (hasBom && !bomAllowedExtensions.has(extension)) {
      failures.push(`${relativePath}: unexpected UTF-8 BOM`);
    }

    const content = decodeUtf8(hasBom ? buffer.subarray(3) : buffer, relativePath);

    if (content.includes("\r\n") || content.includes("\r")) {
      failures.push(`${relativePath}: expected LF line endings`);
    }
  }

  if (failures.length > 0) {
    console.error("Encoding check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Encoding check passed.");
}

await main();
