/**
 * One-shot script: replace all inline footer HTML blocks in pages
 * with the <!--PARTIAL:footer--> marker.
 * Run once then delete.
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

// Matches:
//   - optional leading whitespace
//   - <footer class="footer" id="contatti"> ... </footer>
//   - optional trailing year script on same or next line
const FOOTER_RE = /[ \t]*<footer class="footer" id="contatti">[\s\S]*?<\/footer>(\s*<script>document\.getElementById\('year'\)\.textContent=new Date\(\)\.getFullYear\(\);<\/script>)?/;

let ok = 0, skip = 0;

for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  let content;
  try { content = readFileSync(filePath, 'utf8'); }
  catch (_) { console.log(`SKIP ${page} — file not found`); skip++; continue; }

  if (!FOOTER_RE.test(content)) {
    console.log(`SKIP ${page} — footer marker not found`);
    skip++;
    continue;
  }

  const updated = content.replace(FOOTER_RE, '  <!--PARTIAL:footer-->');
  writeFileSync(filePath, updated, 'utf8');
  console.log(`OK   ${page}`);
  ok++;
}

console.log(`\nDone: ${ok} replaced, ${skip} skipped.`);
