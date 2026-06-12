import { SUPABASE_PROJECT_URL, sendJson, readJson } from '../_lib/util'

// Endpoint admin: invia la newsletter a tutti gli iscritti attivi via Resend.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method not allowed' })

  const adminSecret = process.env.NEWSLETTER_ADMIN_SECRET
  if (!adminSecret) {
    return sendJson(res, 503, { ok: false, error: 'Newsletter send not configured (NEWSLETTER_ADMIN_SECRET missing).' })
  }
  const authHeader = req.headers['authorization'] || ''
  if (authHeader !== `Bearer ${adminSecret}`) {
    return sendJson(res, 401, { ok: false, error: 'Non autorizzato.' })
  }

  let body: any
  try { body = await readJson(req) } catch { body = {} }
  const subject = String(body.subject || '').trim()
  const htmlContent = String(body.html || '').trim()
  const textContent = String(body.text || '').trim()
  if (!subject || (!htmlContent && !textContent)) {
    return sendJson(res, 400, { ok: false, error: 'Fornisci subject e html (o text).' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return sendJson(res, 503, { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY non configurata.' })

  let subscribers: any
  try {
    const sbRes = await fetch(
      `${SUPABASE_PROJECT_URL}/rest/v1/newsletter_subscribers?is_active=eq.true&select=email`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    )
    if (!sbRes.ok) throw new Error(`supabase-${sbRes.status}`)
    subscribers = await sbRes.json()
  } catch (e: any) {
    console.error('[newsletter/send] fetch-subscribers', e?.message)
    return sendJson(res, 500, { ok: false, error: 'Impossibile recuperare gli iscritti.' })
  }

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return sendJson(res, 200, { ok: true, sent: 0, message: 'Nessun iscritto attivo.' })
  }

  const emails = subscribers.map((s: any) => s.email).filter(Boolean)
  const fromName = process.env.NEWSLETTER_FROM_NAME || 'Pro Loco Rivalta sul Mincio'
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'info@prolocorivalta.mn.it'

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return sendJson(res, 503, {
      ok: false,
      error: "Email provider non configurato. Imposta RESEND_API_KEY nelle variabili d'ambiente.",
      subscribers: emails.length,
    })
  }

  let sent = 0
  const errors: string[] = []
  const BATCH = 50
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    try {
      const rRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          bcc: batch,
          to: fromEmail,
          subject,
          html: htmlContent || undefined,
          text: textContent || undefined,
        }),
      })
      if (rRes.ok) sent += batch.length
      else { const errBody = await rRes.text().catch(() => ''); errors.push(`batch-${i}: ${rRes.status} ${errBody}`) }
    } catch (e: any) {
      errors.push(`batch-${i}: ${e.message}`)
    }
  }

  const ok = errors.length === 0
  sendJson(res, ok ? 200 : 207, { ok, sent, errors: errors.length ? errors : undefined })
}
