import { useDocumentMeta } from '@/app/lib/useDocumentMeta'

export default function NotFound() {
  useDocumentMeta('Pagina non trovata — Rivalta sul Mincio')
  return (
    <main id="main">
      <section className="container rsm-page text-center py-5">
        <p className="text-primary fw-semibold text-uppercase small mb-1">Errore 404</p>
        <h1>Pagina non trovata</h1>
        <p className="lead">La pagina che cerchi non esiste o è stata spostata.</p>
        <a className="btn btn-primary" href="/">Torna alla home</a>
      </section>
    </main>
  )
}
