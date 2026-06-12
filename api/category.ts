import { SECURITY_HEADERS } from './_lib/util'

// Legacy redirect: /category?... -> /post?... (la SPA gestisce /post lato client)
export default function handler(req: any, res: any) {
  const qs = (req.url || '').includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  res.writeHead(301, { ...SECURITY_HEADERS, Location: '/post' + qs, 'Cache-Control': 'public, max-age=3600' })
  res.end()
}
