import { useDocumentMeta } from './useDocumentMeta'
import { useInlineScript } from './useInlineScript'

type PageProps = {
  html: string
  script?: string
  title?: string
  description?: string
}

/**
 * Wrapper di pagina: imposta la SEO per-route, inietta il markup della pagina
 * (ex <main> della vecchia pagina HTML) ed esegue il relativo script inline.
 * Il chrome (topbar/footbar/newsletter) è fornito dal Layout via <Outlet>.
 */
export default function Page({ html, script, title, description }: PageProps) {
  useDocumentMeta(title, description)
  useInlineScript(script)
  return <div data-rsm-page dangerouslySetInnerHTML={{ __html: html }} />
}
