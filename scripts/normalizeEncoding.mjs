import { readFile, readdir, writeFile } from "node:fs/promises";
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

const ignoredDirectories = new Set([
  ".git",
  ".githooks",
  ".next",
  "coverage",
  "dist",
  "node_modules",
]);

function hasUtf8Bom(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
}

async function* walk(directory) {
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

async function main() {
  const root = process.cwd();
  let updatedCount = 0;

  for await (const filePath of walk(root)) {
    const extension = path.extname(filePath).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const buffer = await readFile(filePath);
    const startIndex = hasUtf8Bom(buffer) ? 3 : 0;
    const text = buffer.toString("utf8", startIndex).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const normalizedBuffer = Buffer.from(text, "utf8");

    if (!buffer.subarray(startIndex).equals(normalizedBuffer) || startIndex > 0) {
      await writeFile(filePath, normalizedBuffer);
      updatedCount += 1;
    }
  }

  console.log(`Normalized ${updatedCount} file(s).`);
}

await main();