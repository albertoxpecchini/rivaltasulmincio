import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, sendJson, readJson, isValidEmail } from '../_lib/util'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed' })

  let body: any
  try { body = await readJson(req) } catch { body = {} }

  const email = String(body.email || '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return sendJson(res, 400, { ok: false, error: 'Inserisci un indirizzo email valido.' })
  }

  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  try {
    const sbRes = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ email, source: 'web' }),
    })
    if (!sbRes.ok && sbRes.status !== 409) {
      const errText = await sbRes.text().catch(() => '')
      throw new Error(`supabase-${sbRes.status}: ${errText}`)
    }
    sendJson(res, 200, { ok: true }, { 'Cache-Control': 'no-store' })
  } catch (e: any) {
    console.error('[newsletter/subscribe]', e?.message)
    sendJson(res, 500, { ok: false, error: 'Errore interno. Riprova tra poco.' })
  }
}
