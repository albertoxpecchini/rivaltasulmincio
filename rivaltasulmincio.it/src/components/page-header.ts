import { html, type Html } from '../lib/html';

export type Crumb = { href?: string; label: string };

/**
 * Testata di pagina: breadcrumb tecnico in mono (STYLE.md «breadcrumb
 * tecnici»), titolo (h1), descrizione, eventuale contenuto aggiuntivo.
 * Il breadcrumb parte sempre dalla Home; l'ultima voce è la pagina corrente.
 */
export function pageHeader(options: { title: string; lead?: Html | string; crumbs?: Crumb[]; extra?: Html }): Html {
  return html`<div class="page-header">
  ${crumbs(options.crumbs ?? [{ label: options.title }])}
  <h1>${options.title}</h1>
  ${options.lead ? html`<p class="lead">${options.lead}</p>` : ''}
  ${options.extra ?? ''}
</div>`;
}

export function crumbs(items: Crumb[]): Html {
  const last = items.length - 1;
  return html`<nav class="crumbs" aria-label="Percorso">
  <ol class="list-plain">
    <li><a href="/">Rivalta</a></li>
    ${items.map((item, index) =>
      item.href && index !== last
        ? html`<li><a href="${item.href}">${item.label}</a></li>`
        : html`<li><span${index === last ? html` aria-current="page"` : ''}>${item.label}</span></li>`,
    )}
  </ol>
</nav>`;
}
