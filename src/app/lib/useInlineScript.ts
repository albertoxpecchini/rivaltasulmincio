import { useEffect } from 'react'

/**
 * Esegue uno script "classico" (IIFE legacy) dopo che il markup della pagina
 * è stato montato nel DOM. Riusa così, senza riscriverli, gli script inline
 * estratti dalle vecchie pagine HTML. Lo script viene rimosso allo smontaggio.
 */
export function useInlineScript(code?: string) {
  useEffect(() => {
    if (!code || !code.trim()) return
    const el = document.createElement('script')
    el.setAttribute('data-rsm-inline', '')
    el.text = code
    document.body.appendChild(el)
    return () => { el.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
