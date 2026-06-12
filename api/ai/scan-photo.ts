import { Buffer } from 'node:buffer'
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, sendJson, readJson } from '../_lib/util'

const PROMPT = `Sei un redattore per il sito di notizie locali di Rivalta sul Mincio (MN), Italia.
Analizza questa immagine e restituisci ESCLUSIVAMENTE un oggetto JSON valido.
Non scrivere nulla prima o dopo il JSON. Non usare markdown o backtick.

Restituisci questo schema JSON (rispetta esattamente i nomi dei campi):
{
  "title": "titolo articolo in italiano, max 80 caratteri",
  "subtitle": "sottotitolo opzionale max 120 caratteri, oppure null",
  "excerpt": "riassunto 1-2 frasi, max 160 caratteri",
  "content": "testo articolo in italiano, minimo 80 parole",
  "category": "una tra: Ambiente|Assemblea|Ciclismo|Cultura|Enogastronomia|Eventi|Iniziative|Natura|Sagre|Sport|Turismo|Video",
  "tone": "una tra: narrativo|istituzionale|giornalistico|promozionale",
  "reading_level": "una tra: semplice|medio|approfondito",
  "target_audience": "una tra: famiglie|bambini|giovani|turisti|escursionisti|appassionati_natura oppure null",
  "location_text": "nome del luogo visibile nell'immagine oppure null",
  "address_text": "indirizzo completo se visibile oppure null",
  "organizer": "nome organizzatore se visibile oppure null",
  "event_start_at": "solo la data YYYY-MM-DD se visibile es. 2026-06-15 oppure null (NON includere l'ora)",
  "event_end_at": "solo la data YYYY-MM-DD fine evento se visibile oppure null",
  "event_time_text": "orario leggibile es. 10:00–23:00 oppure null",
  "contacts": "telefono o email se visibili oppure null",
  "price_text": "Gratuito oppure €5 oppure null",
  "booking_url": "URL prenotazione se visibile oppure null",
  "cta_text": "testo pulsante azione es. Scopri il programma oppure null",
  "cta_url": "URL azione se visibile oppure null",
  "keywords": ["parola1", "parola2", "parola3"],
  "tags": ["tag1", "tag2"]
}`

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return sendJson(res, 401, { error: 'Non autorizzato.' })

  try {
    const verifyRes = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    })
    if (!verifyRes.ok) return sendJson(res, 401, { error: 'Sessione scaduta.' })
  } catch {
    return sendJson(res, 503, { error: 'Errore di autenticazione.' })
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) return sendJson(res, 503, { error: 'AI non configurata (GEMINI_API_KEY mancante).' })

  let body: any
  try { body = await readJson(req) } catch { body = {} }
  const imageUrl = String(body.imageUrl || '').trim()
  if (!imageUrl || !imageUrl.startsWith('https://')) {
    return sendJson(res, 400, { error: 'URL immagine non valido.' })
  }

  let imageBase64: string, mimeType: string
  try {
    const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': 'rivaltasulmincio-server/1.0' } })
    if (!imgRes.ok) throw new Error(`image-fetch-${imgRes.status}`)
    const ct = imgRes.headers.get('content-type') || 'image/jpeg'
    mimeType = ct.split(';')[0].trim()
    const buf = await imgRes.arrayBuffer()
    if (buf.byteLength > 10 * 1024 * 1024) throw new Error('Immagine troppo grande (max 10 MB).')
    imageBase64 = Buffer.from(buf).toString('base64')
  } catch (e: any) {
    return sendJson(res, 400, { error: "Impossibile leggere l'immagine: " + e.message })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: PROMPT }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      },
    )
    if (!geminiRes.ok) {
      console.error('[scan-photo] Gemini error', geminiRes.status)
      return sendJson(res, geminiRes.status >= 500 ? 503 : 400, { error: `AI non disponibile (${geminiRes.status}).` })
    }
    const geminiData = await geminiRes.json()
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('risposta AI non valida')
    const fields = JSON.parse(jsonMatch[0])
    sendJson(res, 200, fields, { 'Cache-Control': 'no-store' })
  } catch (e: any) {
    console.error('[scan-photo]', e?.message)
    sendJson(res, 500, { error: 'Errore AI: ' + e.message })
  }
}
