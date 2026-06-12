import { sendJson } from './_lib/util'

export default function handler(_req: any, res: any) {
  sendJson(res, 200, {
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'undefined',
  }, { 'Cache-Control': 'no-store' })
}
