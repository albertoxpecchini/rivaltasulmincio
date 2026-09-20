/*
 * Prerender: dopo `vite build` genera l'HTML statico di ogni percorso.
 *
 * Input:  dist/index.html (template con asset già hashati)
 *         dist/server/entry-server.js (rendering, percorsi, indice ricerca)
 * Output: dist/<percorso>/index.html, dist/404.html e i feed JSON (search-index, places)
 *
 * Eseguito da Node direttamente come TypeScript (type stripping, Node ≥ 22.18).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type EntryServer = typeof import('../src/entry-server');

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const serverDir = path.join(dist, 'server');
const serverEntry = path.join(serverDir, 'entry-server.js');

if (!fs.existsSync(serverEntry)) {
  console.error(`prerender: manca ${path.relative(root, serverEntry)}. Eseguire prima "vite build".`);
  process.exit(1);
}

const entry = (await import(pathToFileURL(serverEntry).href)) as EntryServer;
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const routes = entry.paths();
for (const route of routes) {
  const page = entry.render(route);
  const file = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
  write(path.join(dist, file), entry.inject(template, page));
}

write(path.join(dist, '404.html'), entry.inject(template, entry.renderNotFound()));

const feeds = Object.entries(entry.feeds());
for (const [route, data] of feeds) {
  write(path.join(dist, route.slice(1)), JSON.stringify(data));
}

fs.rmSync(serverDir, { recursive: true, force: true });

console.log(`prerender: ${routes.length} pagine, 404.html, ${feeds.map(([route]) => route.slice(1)).join(', ')}`);

function write(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}
