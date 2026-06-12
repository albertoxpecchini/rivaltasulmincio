import { useEffect } from 'react'

/** Imposta title e meta description per-route (SEO lato client). */
export function useDocumentMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let el = document.head.querySelector('meta[name="description"]')
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', 'description')
        document.head.appendChild(el)
      }
      el.setAttribute('content', description)
    }
  }, [title, description])
}
