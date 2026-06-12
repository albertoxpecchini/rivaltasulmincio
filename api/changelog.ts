import { SECURITY_HEADERS, sendJson } from './_lib/util'

let _cache: string | null = null
let _cacheTime = 0
const TTL_MS = 300_000

export default async function handler(_req: any, res: any) {
  const now = Date.now()
  if (_cache && now - _cacheTime < TTL_MS) {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' })
    res.end(_cache)
    return
  }

  try {
    const REPO = 'albertoxpecchini/rivaltasulmincio'
    const UA = { 'User-Agent': 'rivaltasulmincio-server/1.0' }

    const listRes = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=5`, { headers: UA })
    if (!listRes.ok) throw new Error(`gh-list ${listRes.status}`)
    const commits = await listRes.json()
    if (!Array.isArray(commits) || !commits[0]) throw new Error('no-commits')

    const recentCommits = commits.slice(0, 5)
    const detailEntries = await Promise.all(recentCommits.map(async (commit: any) => {
      try {
        const detailRes = await fetch(`https://api.github.com/repos/${REPO}/commits/${commit.sha}`, { headers: UA })
        if (!detailRes.ok) return [commit.sha, null]
        return [commit.sha, await detailRes.json()]
      } catch { return [commit.sha, null] }
    }))
    const detailBySha = new Map<string, any>(detailEntries as any)

    const c0 = commits[0]
    const sha = c0.sha
    const msg = c0.commit.message.split('\n')[0]
    const author = c0.commit.author.name
    const date = c0.commit.author.date
    const url = c0.html_url

    const detail = detailBySha.get(sha)
    if (!detail) throw new Error('gh-detail missing')
    const files = detail.files || []
    const stats = detail.stats || {}

    let changes: string[] = []
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
    if (ANTHROPIC_KEY && files.length) {
      const fileList = files.slice(0, 24).map((f: any) => `${f.status}: ${f.filename} (+${f.additions} -${f.deletions})`).join('\n')
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Commit al sito rivaltasulmincio.it.\nMessaggio: ${msg}\nFile modificati:\n${fileList}\n\nScrivi 3-5 voci brevi in italiano (max 9 parole ciascuna) che descrivono cosa è cambiato. Rispondi SOLO con un array JSON di stringhe. Esempio: ["Aggiornato layout /storia", "Corretto bug nel menu"]`,
          }],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        const text = aiData.content?.[0]?.text || ''
        try { const m = text.match(/\[[\s\S]*\]/); changes = m ? JSON.parse(m[0]) : [] } catch { changes = [] }
      }
    }

    if (!changes.length) {
      changes = files.slice(0, 5).map((f: any) => {
        const name = f.filename.split('/').pop().replace(/\.[^/.]+$/, '') || f.filename
        const act = f.status === 'added' ? 'Aggiunto' : f.status === 'removed' ? 'Rimosso' : 'Aggiornato'
        return `${act}: ${name}`
      })
    }
    if (!changes.length) changes = [msg || 'Aggiornamento sito']

    const recent_commit_rows = recentCommits.map((c: any) => {
      const d = detailBySha.get(c.sha)
      const df = Array.isArray(d?.files) ? d.files : []
      return {
        sha: c.sha,
        short_sha: c.sha.slice(0, 7),
        message: (c.commit?.message || '').split('\n')[0] || 'Aggiornamento sito',
        author: c.commit?.author?.name || 'Autore sconosciuto',
        date: c.commit?.author?.date || null,
        url: c.html_url,
        files_changed: df.length,
        changed_files: df.slice(0, 6).map((f: any) => f.filename),
      }
    })

    const payload = JSON.stringify({
      sha, message: msg, author, date, url, changes,
      files_changed: files.length,
      stats: { total: stats.total || 0, add: stats.additions || 0, del: stats.deletions || 0 },
      recent_commits: recent_commit_rows,
    })

    _cache = payload
    _cacheTime = Date.now()
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' })
    res.end(payload)
  } catch {
    sendJson(res, 200, { changes: ['Changelog non disponibile'], error: true })
  }
}
