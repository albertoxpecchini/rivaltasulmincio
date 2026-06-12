import { SECURITY_HEADERS, sendJson, getQuery } from './_lib/util'

const KW_WIKI_TITLES: Record<string, string> = {
  'lago-di-garda': 'Lago di Garda',
  'ramsar': 'Convenzione di Ramsar',
  'natura-2000': 'Natura 2000',
  'mincio': 'Mincio',
  'zona-umida': 'Zona umida',
  'biodiversita': 'Biodiversità',
  'uccelli-acquatici': 'Uccelli acquatici',
  'airone-cenerino': 'Airone cenerino',
  'garzetta': 'Garzetta',
  'nitticora': 'Nitticora',
  'pianura-padana': 'Pianura Padana',
  'canneti': 'Phragmites australis',
  'fitodepurazione': 'Fitodepurazione',
  'eutrofizzazione': 'Eutrofizzazione',
  'canne-palustri': 'Phragmites australis',
  'arelle': 'Stuoia',
  'martin-pescatore': 'Alcedo atthis',
}

const _cache = new Map<string, { wiki: string; claude: string; ts: number }>()
const TTL = 6 * 60 * 60 * 1000

export default async function handler(req: any, res: any) {
  const q = getQuery(req)
  const kw = String(q.kw || '').slice(0, 60)
  const title = String(q.title || '').slice(0, 80)

  if (!kw) return sendJson(res, 400, { error: 'missing kw' })

  const cached = _cache.get(kw)
  if (cached && Date.now() - cached.ts < TTL) {
    return sendJson(res, 200, { wiki: cached.wiki, claude: cached.claude }, { 'Cache-Control': 'public, max-age=21600' })
  }

  let wikiExtract = ''
  const wikiTitle = KW_WIKI_TITLES[kw]
  if (wikiTitle) {
    try {
      const wRes = await fetch(
        `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
        { headers: { 'User-Agent': 'rivaltasulmincio/1.0 (info@prolocorivalta.mn.it)' } },
      )
      if (wRes.ok) {
        const wData = await wRes.json()
        const raw = wData.extract || ''
        const sentences = raw.match(/[^.!?]+[.!?]+\s*/g) || [raw]
        const first = (sentences[0] || raw).trim()
        wikiExtract = first.length > 240 ? first.slice(0, 237) + '…' : first
      }
    } catch { /* Wikipedia irraggiungibile */ }
  }

  let claudeSentence = ''
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (ANTHROPIC_KEY) {
    try {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 100,
          system: 'Sei una guida naturalistica delle Valli del Mincio (Rivalta sul Mincio, Mantova). Scrivi esattamente 1 frase breve, concreta e specifica (max 22 parole) che spiega perché questo concetto è importante per chi visita le Valli del Mincio o il borgo di Rivalta. Niente generalità. Solo la frase, in italiano.',
          messages: [{ role: 'user', content: `Concetto: ${title || kw}` }],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        claudeSentence = (aiData.content?.[0]?.text || '').trim()
      }
    } catch { /* Claude irraggiungibile */ }
  }

  _cache.set(kw, { wiki: wikiExtract, claude: claudeSentence, ts: Date.now() })
  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=21600' })
  res.end(JSON.stringify({ wiki: wikiExtract, claude: claudeSentence }))
}
