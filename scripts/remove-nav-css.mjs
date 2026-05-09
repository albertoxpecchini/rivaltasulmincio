/**
 * One-shot script: rimuove il blocco CSS nav island da tutte le pagine.
 * Il CSS nav vive ora solo in theme.css.
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

// Rimuovi il blocco CSS nav: da .site-header { fino a .profile-dropdown__sep + eventuale @media brand-name
// Il blocco può iniziare con un commento /* ── Nav Island ── */ o direttamente con .site-header
const NAV_CSS_RE = /(?:\/\*\s*[─—–\-]+\s*Nav\s+Island[^*]*\*\/\s*)?\.site-header\s*\{[\s\S]*?\.profile-dropdown__sep[^}]*\}[ \t]*\n?(?:\s*@media[^{]*\{[^\}]*\.brand-name\s+span[^\}]*\}[^\}]*\}[ \t]*\n?)?/g;

let ok = 0, skip = 0;

for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  let content;
  try { content = readFileSync(filePath, 'utf8'); }
  catch (_) { console.log(`SKIP ${page} — file not found`); skip++; continue; }

  if (!NAV_CSS_RE.test(content)) {
    NAV_CSS_RE.lastIndex = 0;
    console.log(`SKIP ${page} — nav CSS pattern not found`);
    skip++;
    continue;
  }
  NAV_CSS_RE.lastIndex = 0;

  const updated = content.replace(NAV_CSS_RE, '');
  writeFileSync(filePath, updated, 'utf8');
  console.log(`OK   ${page}`);
  ok++;
}

console.log(`\nDone: ${ok} replaced, ${skip} skipped.`);
