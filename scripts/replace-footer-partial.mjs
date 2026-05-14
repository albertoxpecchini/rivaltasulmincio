/**
 * One-shot script: replace all inline footer HTML blocks in pages
 * with the <!--PARTIAL:footer--> marker, and sync partials/footbar.html
 * from the canonical source (index).
 *
 * The canonical footer lives in `index`. To propagate a footer update:
 *   1. Edit the footer block inside `index`.
 *   2. Run this script: node scripts/replace-footer-partial.mjs
 *
 * The script will:
 *   - Extract the footer block from `index` and overwrite partials/footbar.html.
 *   - Replace every inline footer block in all HTML_PAGES with <!--PARTIAL:footer-->.
 *     (Pages that already use the marker are left unchanged.)
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PAGES = [
  'write', 'reset', 'profile', 'preferenze', 'post',
  'modifica-profilo', 'dashboard', 'login', 'index',
  'category', 'db-test', 'privacy', 'cookie', 'note-legali', 'storia'
];

// Matches the full footer block embedded inline in a page:
//   <link rel="stylesheet" href="/partials/footbar.css?v=…" />
//   <style data-rsm-foot-critical> … </style>
//   [optional duplicate <link> for older v]
//   <footer class="rsm-foot" … > … </footer>
//   <script> (function(){ … })(); </script>
const FOOTER_RE = /<link rel="stylesheet" href="\/partials\/footbar\.css\?v=12" \/>[\s\S]*?\}\)\(\);\n<\/script>/;

// ── Sync partials/footbar.html from the canonical source (index) ─────────────
const indexContent = readFileSync(path.join(ROOT, 'index'), 'utf8');
const match = indexContent.match(FOOTER_RE);
if (!match) {
  console.error('ERROR: Could not find footer block in index — aborting.');
  process.exit(1);
}
writeFileSync(path.join(ROOT, 'partials', 'footbar.html'), match[0] + '\n', 'utf8');
console.log('OK   partials/footbar.html synced from index');

// ── Replace inline footer blocks with the partial marker ─────────────────────
let ok = 0, skip = 0;

for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  let content;
  try { content = readFileSync(filePath, 'utf8'); }
  catch (_) { console.log(`SKIP ${page} — file not found`); skip++; continue; }

  if (!FOOTER_RE.test(content)) {
    console.log(`SKIP ${page} — footer block not found (already uses partial?)`);
    skip++;
    continue;
  }

  const updated = content.replace(FOOTER_RE, '<!--PARTIAL:footer-->');
  writeFileSync(filePath, updated, 'utf8');
  console.log(`OK   ${page}`);
  ok++;
}

console.log(`\nDone: ${ok} replaced, ${skip} skipped.`);
