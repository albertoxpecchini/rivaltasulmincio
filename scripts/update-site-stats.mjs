import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const GITHUB_SHA = process.env.GITHUB_SHA || '';
const DRY_RUN = String(process.env.DRY_RUN || '') === '1';

const PAGE_FILES = [
  'index',
  'login',
  'dashboard',
  'write',
  'post',
  'profile',
  'modifica-profilo',
  'preferenze',
  'category',
  'reset',
  'privacy',
  'cookie',
  'note-legali',
  'storia',
  'db-test'
];

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico',
  '.mp4', '.webm', '.mov', '.avi', '.mkv',
  '.woff', '.woff2', '.ttf', '.otf',
  '.zip', '.gz', '.tar', '.7z', '.pdf'
]);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function countLines(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function sanitizeVersion(raw) {
  return String(raw || '').trim().replace(/^[~^]/, '');
}

function getTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function isTextFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (!ext) return true;
  return !BINARY_EXTENSIONS.has(ext);
}

function parseBlockedWordsCount(securityClientSource) {
  const m = securityClientSource.match(/var\s+DEFAULT_BLOCKED_WORDS\s*=\s*\[([\s\S]*?)\];/);
  if (!m) return 0;
  const body = m[1];
  const words = body.match(/'([^']+)'/g) || [];
  return words.length;
}

function buildStats() {
  const pkg = JSON.parse(readUtf8(path.join(ROOT, 'package.json')));
  const trackedFiles = getTrackedFiles();

  let linesOfCode = 0;
  for (const relPath of trackedFiles) {
    if (!isTextFile(relPath)) continue;
    const absPath = path.join(ROOT, relPath);
    try {
      const src = readUtf8(absPath);
      linesOfCode += countLines(src);
    } catch {
      // Skip unreadable files.
    }
  }

  const perPageLines = {};
  for (const page of PAGE_FILES) {
    const abs = path.join(ROOT, page);
    if (fs.existsSync(abs)) {
      perPageLines[page] = countLines(readUtf8(abs));
    }
  }

  const imageCount = trackedFiles.filter((p) => p.startsWith('img/')).length;
  const videoCount = trackedFiles.filter((p) => p.startsWith('video/')).length;
  const blockedWords = parseBlockedWordsCount(readUtf8(path.join(ROOT, 'security.client.js')));

  const stats = {
    files: trackedFiles.length,
    lines_of_code: linesOfCode,
    pages: PAGE_FILES.filter((p) => fs.existsSync(path.join(ROOT, p))).length,
    images: imageCount,
    videos: videoCount,
    npm_deps: Object.keys(pkg.dependencies || {}).length,
    animejs_version: sanitizeVersion(pkg.dependencies?.animejs),
    swiper_version: sanitizeVersion(pkg.dependencies?.swiper),
    version: String(pkg.version || ''),
    filtered_words: blockedWords,
    rate_limit_attempts: 5,
    rate_limit_window: 10,
    rate_limit_lock: 15,
    lines_index: perPageLines.index || 0,
    lines_login: perPageLines.login || 0,
    lines_dashboard: perPageLines.dashboard || 0,
    lines_write: perPageLines.write || 0,
    lines_post: perPageLines.post || 0,
    lines_profile: perPageLines.profile || 0,
    lines_modifica_profilo: perPageLines['modifica-profilo'] || 0,
    lines_preferenze: perPageLines.preferenze || 0,
    lines_category: perPageLines.category || 0,
    lines_reset: perPageLines.reset || 0,
    lines_privacy: perPageLines.privacy || 0,
    lines_cookie: perPageLines.cookie || 0,
    lines_note_legali: perPageLines['note-legali'] || 0,
    lines_storia: perPageLines.storia || 0,
    lines_db_test: perPageLines['db-test'] || 0
  };

  return stats;
}

function requireEnv() {
  if (DRY_RUN) return;
  if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
  if (!/^https?:\/\//i.test(SUPABASE_URL)) throw new Error('SUPABASE_URL must start with http:// or https://');
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  };
}

async function getCurrentDeployments() {
  const endpoint = `${SUPABASE_URL}/rest/v1/site_stats?key=eq.deployments&select=value&limit=1`;
  const res = await fetch(endpoint, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`site_stats deployments read failed: ${res.status}`);
  }
  const data = await res.json();
  const current = Number(data?.[0]?.value || 0);
  return Number.isFinite(current) ? current : 0;
}

async function upsertSiteStats(stats) {
  const payload = Object.entries(stats).map(([key, value]) => ({ key, value: String(value) }));
  const endpoint = `${SUPABASE_URL}/rest/v1/site_stats?on_conflict=key`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`site_stats upsert failed: ${res.status} ${text}`);
  }
}

async function upsertReleaseVersion(version) {
  const latestEndpoint = `${SUPABASE_URL}/rest/v1/site_releases?select=version&order=released_at.desc&limit=1`;
  const latestRes = await fetch(latestEndpoint, { headers: getHeaders() });
  if (!latestRes.ok) {
    throw new Error(`site_releases read failed: ${latestRes.status}`);
  }

  const latest = await latestRes.json();
  const latestVersion = String(latest?.[0]?.version || '');
  if (latestVersion === version) return;

  const notes = GITHUB_SHA ? `Auto release ${GITHUB_SHA.slice(0, 7)}` : 'Auto release';
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/site_releases`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal'
    },
    body: JSON.stringify([{ version, notes }])
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    throw new Error(`site_releases insert failed: ${insertRes.status} ${text}`);
  }
}

async function main() {
  requireEnv();
  const stats = buildStats();

  if (DRY_RUN) {
    const preview = { ...stats, deployments: 'INCREMENT_FROM_DB' };
    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  const currentDeployments = await getCurrentDeployments();
  stats.deployments = currentDeployments + 1;

  await upsertSiteStats(stats);
  await upsertReleaseVersion(stats.version);

  console.log(`site_stats aggiornato. deployments=${stats.deployments} version=${stats.version}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
