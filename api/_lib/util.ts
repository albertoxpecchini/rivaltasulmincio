// Helper condivisi per le funzioni serverless (porting da server.js).

export const SUPABASE_PROJECT_URL =
  process.env.SUPABASE_PROJECT_URL || 'https://tljwxymcavgpzntksjtx.supabase.co'

// Anon key pubblica (stessa di supabase.config.js): usata come fallback se
// la variabile d'ambiente non è impostata.
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsand4eW1jYXZncHpudGtzanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODM2MzksImV4cCI6MjA5Mjg1OTYzOX0.4mLVUxTO2SGeVWDDn7Vw0NuSDB82T3v6IWO-BVlrzC0'

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

export function sendJson(res: any, status: number, obj: any, extraHeaders: Record<string, string> = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', ...extraHeaders })
  res.end(JSON.stringify(obj))
}

/** Legge il body JSON sia da req.body (Vercel/dev) sia dallo stream. */
export async function readJson(req: any, maxBytes = 8 * 1024 * 1024): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return req.body
    try { return JSON.parse(String(req.body)) } catch { return {} }
  }
  return await new Promise((resolve) => {
    let data = ''
    req.on('data', (c: any) => {
      data += c
      if (data.length > maxBytes) { try { req.destroy() } catch { /* noop */ } resolve({}) }
    })
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}

export function getQuery(req: any): Record<string, string> {
  if (req.query && typeof req.query === 'object') return req.query
  try {
    const u = new URL(req.url || '/', 'http://localhost')
    return Object.fromEntries(u.searchParams.entries())
  } catch { return {} }
}

export function isValidEmail(str: any): boolean {
  return typeof str === 'string' &&
    str.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim())
}

export function formatItalianDate(isoDate: any): string {
  const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  const parts = String(isoDate || '').split('-')
  if (parts.length !== 3) return String(isoDate)
  const d = parseInt(parts[2], 10)
  const m = MONTHS[parseInt(parts[1], 10) - 1] || ''
  return `${d} ${m} ${parts[0]}`
}

export const DOC_VERSIONS_DEFAULTS: Record<string, { version: string; effective_date: string }> = {
  privacy: { version: '2.0', effective_date: '24 maggio 2026' },
  cookie: { version: '2.1', effective_date: '24 maggio 2026' },
  'note-legali': { version: '2.0', effective_date: '24 maggio 2026' },
}
