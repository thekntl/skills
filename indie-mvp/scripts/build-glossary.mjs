#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const values = { check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") {
      values.check = true;
      continue;
    }
    if (["--context", "--glossary", "--output"].includes(arg)) {
      values[arg.slice(2)] = argv[index + 1];
      index += 1;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }
  for (const name of ["context", "glossary", "output"]) {
    if (!values[name]) fail(`Missing --${name}`);
  }
  return values;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitList(value) {
  if (!value || value.trim() === "-" || value.includes("{{")) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTerms(markdown, source, defaultCategory) {
  const sections = markdown.split(/^##\s+/m).slice(1);
  return sections
    .map((section) => {
      const lines = section.trim().split(/\r?\n/);
      const term = lines.shift()?.trim() ?? "";
      const metadata = {};
      const definition = [];
      let readingMetadata = true;

      for (const line of lines) {
        const match = line.match(/^(Category|Aliases|Discouraged):\s*(.*)$/i);
        if (readingMetadata && match) {
          metadata[match[1].toLowerCase()] = match[2].trim();
          continue;
        }
        if (line.trim()) readingMetadata = false;
        if (!readingMetadata) definition.push(line);
      }

      return {
        term,
        category: metadata.category || defaultCategory,
        aliases: splitList(metadata.aliases),
        discouraged: splitList(metadata.discouraged),
        definition: definition.join("\n").trim(),
        source,
      };
    })
    .filter(
      (entry) =>
        entry.term &&
        entry.definition &&
        !entry.term.includes("{{") &&
        !entry.definition.includes("{{"),
    );
}

function sourceLink(output, source) {
  const path = relative(dirname(output), source).replaceAll("\\", "/");
  return path.startsWith(".") ? path : `./${path}`;
}

function generatedAt(paths) {
  const sourceEpoch = process.env.SOURCE_DATE_EPOCH;
  if (sourceEpoch && /^\d+$/.test(sourceEpoch)) {
    return new Date(Number(sourceEpoch) * 1000).toISOString();
  }
  const newest = Math.max(...paths.map((path) => statSync(path).mtimeMs));
  return new Date(newest).toISOString();
}

function render({ entries, digest, timestamp, contextPath, glossaryPath, outputPath }) {
  const categories = [...new Set(entries.map((entry) => entry.category))].sort(
    (left, right) => left.localeCompare(right),
  );
  const sorted = [...entries].sort((left, right) =>
    left.term.localeCompare(right.term),
  );
  const cards = sorted
    .map((entry) => {
      const search = [
        entry.term,
        entry.category,
        ...entry.aliases,
        ...entry.discouraged,
        entry.definition,
      ]
        .join(" ")
        .toLowerCase();
      const aliases = entry.aliases.length
        ? `<p><strong>Aliases:</strong> ${entry.aliases.map(escapeHtml).join(", ")}</p>`
        : "";
      const discouraged = entry.discouraged.length
        ? `<p><strong>Discouraged:</strong> ${entry.discouraged.map(escapeHtml).join(", ")}</p>`
        : "";
      return `<article class="term" id="${slugify(entry.term)}" data-category="${escapeHtml(entry.category)}" data-search="${escapeHtml(search)}">
  <div class="term-heading"><h2>${escapeHtml(entry.term)}</h2><a href="#${slugify(entry.term)}" aria-label="Link to ${escapeHtml(entry.term)}">#</a></div>
  <p class="category">${escapeHtml(entry.category)}</p>
  <div class="definition">${escapeHtml(entry.definition).replaceAll("\n", "<br>")}</div>
  ${aliases}
  ${discouraged}
  <p class="source">Source: ${escapeHtml(entry.source)}</p>
</article>`;
    })
    .join("\n");
  const options = categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="indie-mvp-source-sha256" content="${digest}">
  <title>Project Glossary</title>
  <style>
    :root { color-scheme: light dark; --accent: #6d5dfc; --line: color-mix(in srgb, CanvasText 16%, transparent); }
    * { box-sizing: border-box; }
    body { margin: 0; font: 16px/1.55 system-ui, sans-serif; background: Canvas; color: CanvasText; }
    header, main { width: min(900px, calc(100% - 32px)); margin: 0 auto; }
    header { padding: 48px 0 24px; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 7vw, 4rem); letter-spacing: -.04em; }
    .meta, .source { color: color-mix(in srgb, CanvasText 65%, transparent); font-size: .88rem; }
    .controls { position: sticky; top: 0; display: grid; grid-template-columns: 1fr 220px; gap: 12px; padding: 14px 0; background: Canvas; z-index: 2; }
    input, select { width: 100%; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: Canvas; color: CanvasText; font: inherit; }
    #count { margin: 8px 0 20px; }
    .term { padding: 22px 0; border-top: 1px solid var(--line); scroll-margin-top: 80px; }
    .term-heading { display: flex; align-items: baseline; gap: 10px; }
    .term h2 { margin: 0; }
    .term-heading a { color: var(--accent); text-decoration: none; }
    .category { display: inline-block; margin: 8px 0; padding: 3px 9px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 16%, Canvas); }
    .definition { margin: 8px 0 14px; }
    .empty { padding: 48px 0; text-align: center; }
    @media (max-width: 640px) { .controls { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Project Glossary</h1>
    <p>Search product, technical, design, marketing, and operational language.</p>
    <p class="meta">Generated ${escapeHtml(timestamp)} · Sources: <a href="${escapeHtml(sourceLink(outputPath, contextPath))}">Product Context</a>, <a href="${escapeHtml(sourceLink(outputPath, glossaryPath))}">Project Glossary</a></p>
  </header>
  <main>
    <div class="controls">
      <label><span hidden>Search</span><input id="search" type="search" placeholder="Search terms, definitions, or aliases…" autocomplete="off"></label>
      <label><span hidden>Category</span><select id="category"><option value="">All categories</option>${options}</select></label>
    </div>
    <p id="count" class="meta"></p>
    <section id="terms">${cards}</section>
    <p id="empty" class="empty" hidden>No matching term.</p>
  </main>
  <script>
    const search = document.querySelector("#search");
    const category = document.querySelector("#category");
    const terms = [...document.querySelectorAll(".term")];
    const count = document.querySelector("#count");
    const empty = document.querySelector("#empty");
    function filter() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      for (const term of terms) {
        const match = (!query || term.dataset.search.includes(query)) &&
          (!category.value || term.dataset.category === category.value);
        term.hidden = !match;
        if (match) visible += 1;
      }
      count.textContent = visible + (visible === 1 ? " term" : " terms");
      empty.hidden = visible !== 0;
    }
    search.addEventListener("input", filter);
    category.addEventListener("change", filter);
    filter();
  </script>
</body>
</html>
`;
}

const args = parseArgs(process.argv.slice(2));
const contextPath = resolve(args.context);
const glossaryPath = resolve(args.glossary);
const outputPath = resolve(args.output);

for (const path of [contextPath, glossaryPath]) {
  if (!existsSync(path)) fail(`Missing source: ${path}`);
}

const context = readFileSync(contextPath, "utf8");
const glossary = readFileSync(glossaryPath, "utf8");
const digest = createHash("sha256")
  .update(`CONTEXT\n${context}\nGLOSSARY\n${glossary}`)
  .digest("hex");

if (args.check) {
  if (!existsSync(outputPath)) fail(`Missing generated glossary: ${outputPath}`);
  const output = readFileSync(outputPath, "utf8");
  const match = output.match(
    /<meta name="indie-mvp-source-sha256" content="([a-f0-9]{64})">/,
  );
  if (!match || match[1] !== digest) {
    fail(`Generated glossary is stale: ${outputPath}`);
  }
  process.stdout.write(`Glossary is current: ${outputPath}\n`);
  process.exit(0);
}

const entries = [
  ...parseTerms(context, "Product Context", "Product domain"),
  ...parseTerms(glossary, "Project Glossary", "Operations"),
];
if (entries.length === 0) {
  fail("No glossary terms found. Add at least one level-two term with a definition.");
}

const duplicate = entries.find(
  (entry, index) =>
    entries.findIndex(
      (candidate) => candidate.term.toLowerCase() === entry.term.toLowerCase(),
    ) !== index,
);
if (duplicate) fail(`Duplicate glossary term: ${duplicate.term}`);

const html = render({
  entries,
  digest,
  timestamp: generatedAt([contextPath, glossaryPath]),
  contextPath,
  glossaryPath,
  outputPath,
});
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
process.stdout.write(`Generated ${entries.length} terms: ${outputPath}\n`);
