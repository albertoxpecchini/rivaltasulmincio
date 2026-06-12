import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, sendJson, formatItalianDate, DOC_VERSIONS_DEFAULTS } from '../_lib/util'

// GET /api/doc-versions — versioni correnti dei documenti legali (pubbliche).
export default async function handler(_req: any, res: any) {
  try {
    const r = await fetch(
      `${SUPABASE_PROJECT_URL}/rest/v1/doc_versions?select=slug,version,effective_date`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    )
    if (r.ok) {
      const rows = await r.json()
      const data: Record<string, any> = {}
      for (const row of rows) {
        data[row.slug] = { version: row.version, effective_date: formatItalianDate(row.effective_date) }
      }
      if (Object.keys(data).length) {
        return sendJson(res, 200, { ...DOC_VERSIONS_DEFAULTS, ...data }, { 'Cache-Control': 'public, max-age=300' })
      }
    }
  } catch (e: any) {
    console.error('[doc-versions]', e?.message)
  }
  sendJson(res, 200, DOC_VERSIONS_DEFAULTS)
}
