import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIKI_DIR = path.join(__dirname, "..", "..", "..", "data");

function slugify(name) {
  return name
    .replace(/\.md$/, "")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_");
}

function getAllMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllMdFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(slugify(entry.name));
    }
  }
  return results;
}

const slugs = getAllMdFiles(WIKI_DIR);
const outPath = path.join(__dirname, "slugs.json");
fs.writeFileSync(outPath, JSON.stringify(slugs, null, 2));
console.log(`Generated ${slugs.length} slugs to ${outPath}`);
