/**
 * One-shot script: replace all inline standard nav header blocks in pages
 * with <!--PARTIAL:nav-->, and normalise user-menu-wrap → nav-auth in JS/CSS.
 * Skip: index, storia, login (custom navs).
 * Run once then delete.
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Pages to process — skip index, storia, login (custom navs)
const PAGES = [
  'category', 'cookie', 'dashboard', 'db-test',
  'modifica-profilo', 'note-legali', 'post', 'preferenze',
  'privacy', 'profile', 'reset', 'write'
];

// Matches <header class="site-header"> ... </header>
// Only standard nav (no id="navbar" or id="site-header")
const NAV_RE = /<header class="site-header">\s*<div class="nav-island">[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/;

let ok = 0, skip = 0;

for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  let content;
  try { content = readFileSync(filePath, 'utf8'); }
  catch (_) { console.log(`SKIP ${page} — file not found`); skip++; continue; }

  if (!NAV_RE.test(content)) {
    console.log(`SKIP ${page} — nav pattern not found`);
    skip++;
    continue;
  }

  let updated = content.replace(NAV_RE, '<!--PARTIAL:nav-->');

  // Normalise user-menu-wrap → nav-auth in JS
  updated = updated.replace(/\$\(['"]user-menu-wrap['"]\)/g, "$('nav-auth')");
  updated = updated.replace(/getElementById\(['"]user-menu-wrap['"]\)/g, "getElementById('nav-auth')");

  // Normalise CSS selector #user-menu-wrap → #nav-auth
  updated = updated.replace(/#user-menu-wrap/g, '#nav-auth');

  writeFileSync(filePath, updated, 'utf8');
  console.log(`OK   ${page}`);
  ok++;
}

console.log(`\nDone: ${ok} replaced, ${skip} skipped.`);
