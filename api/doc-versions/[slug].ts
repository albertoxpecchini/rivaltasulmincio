import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, sendJson, readJson, formatItalianDate, getQuery } from '../_lib/util'

// PATCH /api/doc-versions/:slug — aggiorna versione documento (solo admin).
export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') return sendJson(res, 405, { error: 'Method not allowed' })

  const slug = String((req.query && req.query.slug) || getQuery(req).slug || '').toLowerCase()
  const VALID_SLUGS = new Set(['privacy', 'cookie', 'note-legali'])
  if (!VALID_SLUGS.has(slug)) {
    return sendJson(res, 404, { error: `Documento non riconosciuto: "${slug}".` })
  }

  const token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return sendJson(res, 401, { error: 'Non autorizzato.' })

  try {
    const userRes = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    })
    if (!userRes.ok) throw new Error('token-invalid')
    const user = await userRes.json()

    const roleRes = await fetch(
      `${SUPABASE_PROJECT_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    const roles = await roleRes.json()
    if (!roles?.[0] || roles[0].role !== 'admin') {
      return sendJson(res, 403, { error: 'Permesso negato: richiesto ruolo admin.' })
    }
  } catch {
    return sendJson(res, 401, { error: 'Sessione non valida o scaduta.' })
  }

  let body: any
  try { body = await readJson(req) } catch { body = {} }
  const version = String(body.version || '').trim()
  const effective_date = String(body.effective_date || '').trim()
  const notes = String(body.notes || '').trim()

  if (!version || !/^\d+\.\d+$/.test(version)) {
    return sendJson(res, 400, { error: 'Versione non valida. Formato atteso: "X.Y" (es. "2.1").' })
  }
  if (!effective_date || !/^\d{4}-\d{2}-\d{2}$/.test(effective_date)) {
    return sendJson(res, 400, { error: 'Data non valida. Formato atteso: "YYYY-MM-DD" (es. "2026-05-24").' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  try {
    const sbRes = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/doc_versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ slug, version, effective_date, notes }),
    })
    if (!sbRes.ok) throw new Error(await sbRes.text())
  } catch (e: any) {
    return sendJson(res, 502, { error: 'Errore salvataggio: ' + e.message })
  }

  sendJson(res, 200, {
    ok: true, slug, version, effective_date,
    effective_date_it: formatItalianDate(effective_date),
  })
}
