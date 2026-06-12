import { sendJson, readJson } from './_lib/util'

const SYSTEM_PROMPT = `Sei un redattore esperto per il sito di notizie locali di Rivalta sul Mincio (MN), Italia, gestito dalla Pro Loco.
Analizza il contenuto fornito e restituisci SOLO un oggetto JSON valido (nessun testo extra, nessun markdown, nessun backtick).

Istruzioni per la qualità del testo:
- "title": titolo giornalistico preciso, max 90 caratteri, in italiano corretto
- "subtitle": sottotitolo evocativo o contestuale, max 140 caratteri, stile editoriale
- "excerpt": 1-2 frasi di introduzione accattivanti, max 260 caratteri, tono caldo e invitante
- "content": articolo completo in italiano elegante, minimo 120 parole. Struttura: apertura coinvolgente → cos'è → quando e dove → chi organizza → cosa aspettarsi → come partecipare → chiusura. Paragrafi separati da \\n\\n.
- "event_start_at": solo la data in formato YYYY-MM-DD (es. 2026-05-24), NON includere l'ora
- "event_end_at": solo la data in formato YYYY-MM-DD oppure null
- "event_time_text": orario come "15:15" o "10:00 – 23:00" o null (separato dalla data)

Schema JSON richiesto (rispetta esattamente i nomi):
{
  "title": "...",
  "subtitle": "... o null",
  "excerpt": "...",
  "content": "...",
  "category": "una di: Ambiente|Anniversari|Assemblea|Canoa|Ciclismo|Cultura|Enogastronomia|Eventi|Festa del Pesce|Iniziative|Love-luccio|Mincio-art|Natale|Natura|Rassegna Stampa|Sagre|Sport|Tesseramento|Turismo|Video",
  "tone": "narrativo|istituzionale|giornalistico|conviviale",
  "target_audience": "famiglie|bambini|giovani|turisti|escursionisti|appassionati_natura o null",
  "event_start_at": "YYYY-MM-DD o null",
  "event_end_at": "YYYY-MM-DD o null",
  "event_time_text": "HH:MM o HH:MM – HH:MM o null",
  "location_text": "nome luogo o null",
  "address_text": "indirizzo completo o null",
  "organizer": "ente organizzatore o null",
  "contacts": "telefono o email o null",
  "price_text": "Gratuito o €5 o null",
  "keywords": ["parola1","parola2","parola3"],
  "tags": ["tag1","tag2"]
}
Non inventare informazioni non presenti. Rispondi SOLO con il JSON.`

const MAX_AI_BODY = 8 * 1024 * 1024

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  const GEMINI_KEY = process.env.GEMINI_API_KEY
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  const useGemini = Boolean(GEMINI_KEY)
  if (!GEMINI_KEY && !ANTHROPIC_KEY) {
    return sendJson(res, 503, { error: 'Chiave API AI non configurata. Imposta GEMINI_API_KEY o ANTHROPIC_API_KEY nelle variabili ambiente Vercel.' })
  }

  let body: any
  try { body = await readJson(req, MAX_AI_BODY) } catch { return sendJson(res, 413, { error: 'Payload troppo grande.' }) }

  const mode = body.mode === 'image' ? 'image' : body.mode === 'both' ? 'both' : 'text'

  if ((mode === 'image' || mode === 'both') && !String(body.data || '')) {
    return sendJson(res, 400, { error: 'Immagine mancante.' })
  }
  if (mode === 'text' && !String(body.text || '').trim()) {
    return sendJson(res, 400, { error: 'Testo mancante.' })
  }

  let raw = ''
  try {
    if (useGemini) {
      const parts: any[] = []
      if (mode === 'image') {
        parts.push({ inline_data: { mime_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } })
        parts.push({ text: 'Analizza questo volantino ed estrai le informazioni.' })
      } else if (mode === 'both') {
        const txt = String(body.text || '').trim().slice(0, 4000)
        parts.push({ inline_data: { mime_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } })
        parts.push({ text: 'Analizza questa immagine' + (txt ? ' e usa il seguente testo come contesto aggiuntivo:\n"""\n' + txt + '\n"""' : '') + '. Estrai tutte le informazioni disponibili.' })
      } else {
        parts.push({ text: String(body.text || '').slice(0, 8000) })
      }
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 20000)
      let geminiRes: any
      try {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ parts }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
            }),
          },
        )
      } finally { clearTimeout(t) }
      if (!geminiRes.ok) {
        console.error('[ai-autofill] Gemini error', geminiRes.status)
        return sendJson(res, 502, { error: 'Errore Gemini (' + geminiRes.status + ').' })
      }
      const geminiData = await geminiRes.json()
      const gParts = geminiData.candidates?.[0]?.content?.parts || []
      const gTextPart = gParts.find((p: any) => !p.thought && typeof p.text === 'string') || gParts[0] || {}
      raw = (gTextPart.text || '').trim()
    } else {
      let messages: any
      if (mode === 'image') {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } },
            { type: 'text', text: 'Analizza questo volantino ed estrai le informazioni per compilare il post.' },
          ],
        }]
      } else {
        messages = [{ role: 'user', content: String(body.text || '').slice(0, 8000) }]
      }
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY as string, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: SYSTEM_PROMPT, messages }),
      })
      if (!claudeRes.ok) {
        console.error('[ai-autofill] Claude error', claudeRes.status)
        return sendJson(res, 502, { error: 'Errore AI (' + claudeRes.status + ').' })
      }
      const claudeData = await claudeRes.json()
      raw = (claudeData.content?.[0]?.text || '').trim()
    }
  } catch (e: any) {
    console.error('[ai-autofill]', e?.name, e?.message)
    if (e?.name === 'AbortError') return sendJson(res, 504, { error: 'Timeout: la richiesta AI ha impiegato troppo. Riprova.' })
    return sendJson(res, 500, { error: 'Errore interno del server.' })
  }

  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw
  let parsed: any
  try { parsed = JSON.parse(jsonStr) } catch {
    return sendJson(res, 502, { error: 'Risposta AI non analizzabile. Prova con un testo più strutturato.' })
  }
  sendJson(res, 200, parsed, { 'Cache-Control': 'no-store' })
}
