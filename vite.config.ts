import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Dev middleware: instrada /api/* verso i file serverless in api/**.ts
 * (gli stessi che Vercel esegue in produzione) adattando req/res allo
 * stile Vercel (req.query, req.body, res.status().json()).
 */
function devApi() {
  return {
    name: 'rsm-dev-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const rawUrl: string = req.url || ''
        if (!rawUrl.startsWith('/api/')) return next()

        const u = new URL(rawUrl, 'http://localhost')
        const rel = u.pathname.replace(/^\/api\//, '').replace(/\/+$/, '')

        let file: string | null = null
        const params: Record<string, string> = {}
        for (const cand of [path.resolve('api', rel + '.ts'), path.resolve('api', rel, 'index.ts')]) {
          if (fs.existsSync(cand)) { file = cand; break }
        }
        if (!file) {
          const parts = rel.split('/')
          if (parts.length >= 2) {
            const slug = parts.pop() as string
            const dyn = path.resolve('api', parts.join('/'), '[slug].ts')
            if (fs.existsSync(dyn)) { file = dyn; params.slug = decodeURIComponent(slug) }
          }
        }
        if (!file) return next()

        const query: Record<string, string> = Object.fromEntries(u.searchParams.entries())
        Object.assign(query, params)

        let body: any = undefined
        if (req.method && !['GET', 'HEAD'].includes(req.method)) {
          body = await new Promise((resolve) => {
            let data = ''
            req.on('data', (c: any) => { data += c })
            req.on('end', () => {
              if (!data) return resolve(undefined)
              try { resolve(JSON.parse(data)) } catch { resolve(data) }
            })
          })
        }

        const resAdapter: any = res
        resAdapter.status = (code: number) => { res.statusCode = code; return resAdapter }
        resAdapter.json = (obj: any) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return resAdapter }
        resAdapter.send = (data: any) => {
          if (data && typeof data === 'object') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
          else res.end(data == null ? '' : String(data))
          return resAdapter
        }
        const reqAdapter: any = req
        reqAdapter.query = query
        reqAdapter.body = body

        try {
          const mod = await server.ssrLoadModule(file)
          await mod.default(reqAdapter, resAdapter)
        } catch (err: any) {
          console.error('[dev-api]', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'dev api error', detail: String(err?.message || err) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Rende le variabili di .env disponibili agli handler api/* in dev.
  const env = loadEnv(mode, process.cwd(), '')
  for (const k of Object.keys(env)) {
    if (!(k in process.env)) process.env[k] = env[k]
  }

  return {
    plugins: [react(), devApi()],
    resolve: {
      alias: { '@': path.resolve('src') },
    },
    server: { port: 5173 },
  }
})
