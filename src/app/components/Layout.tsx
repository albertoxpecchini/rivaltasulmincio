import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import topbarHtml from './topbar.html?raw'
import footbarHtml from './footbar.html?raw'
import newsletterHtml from './newsletter-modal.html?raw'
import layoutClient from './layout.client.js?raw'

/**
 * Shell condivisa: topbar + footbar + modale newsletter (ex partials),
 * con <Outlet> per la pagina corrente. Monta una sola volta: gli script
 * legacy del chrome (auth, ricerca, newsletter, orologio) girano una volta.
 */
export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Esegue una volta la logica client di topbar + footer.
  useEffect(() => {
    const el = document.createElement('script')
    el.setAttribute('data-rsm-inline', 'layout')
    el.text = layoutClient
    document.body.appendChild(el)
    return () => { el.remove() }
  }, [])

  // Navigazione SPA: intercetta i click sui link interni assoluti.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      let node = e.target as HTMLElement | null
      while (node && node.tagName !== 'A') node = node.parentElement
      const a = node as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (!href || href.startsWith('//')) return
      if (!href.startsWith('/')) return
      if (a.getAttribute('target') === '_blank') return
      if (a.hasAttribute('download') || a.hasAttribute('data-bs-toggle')) return
      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      // Solo hash sulla stessa pagina: lascia lo scroll nativo.
      if (url.pathname === window.location.pathname && url.hash) return
      e.preventDefault()
      navigate(url.pathname + url.search + url.hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  // Scroll all'ancora (o in cima) ad ogni cambio rotta.
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) { target.scrollIntoView(); return }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <>
      <div data-rsm-shell dangerouslySetInnerHTML={{ __html: topbarHtml }} />
      <Outlet />
      <div data-rsm-shell dangerouslySetInnerHTML={{ __html: footbarHtml }} />
      <div data-rsm-shell dangerouslySetInnerHTML={{ __html: newsletterHtml }} />
    </>
  )
}
