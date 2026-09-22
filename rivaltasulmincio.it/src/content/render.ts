/*
 * Dai blocchi all'HTML (CONTENT.md «RESA»).
 *
 * Ogni blocco usa i componenti già in uso nel resto del sito — `.tag`,
 * `.table`, `.caption`, `.label` — così un articolo non inventa uno stile
 * suo. Il markup esce da `html`/`inline`, mai dal testo dell'autore.
 */
import { html, type Html } from '../lib/html';
import type { ContentBlock } from '../types';
import { inline } from './inline';
import { parseContent } from './parse';

/**
 * Il corpo di un articolo, pronto da inserire.
 *
 * `level` dice a che profondità sta il contenuto: nella pagina dell'articolo
 * il titolo è l'h1, quindi un `#` del testo diventa h2 e la gerarchia resta
 * corretta (JOURNAL.md «ACCESSIBILITÀ»).
 */
export function renderContent(source: string, options: { level?: 2 | 3 } = {}): Html {
  return renderBlocks(parseContent(source), options);
}

export function renderBlocks(blocks: ContentBlock[], options: { level?: 2 | 3 } = {}): Html {
  const base = options.level ?? 2;
  return html`${blocks.map((block) => renderBlock(block, base))}`;
}

function renderBlock(block: ContentBlock, base: 2 | 3): Html {
  switch (block.kind) {
    case 'heading':
      return heading(block.level, base, inline(block.text));

    case 'subtitle':
      return html`<p class="prose__subtitle">${inline(block.text)}</p>`;

    case 'paragraph':
      return html`<p>${inline(block.text)}</p>`;

    case 'small':
      return html`<p class="prose__small text-small">${inline(block.text)}</p>`;

    case 'quote':
      return html`<figure class="prose__quote">
  <blockquote>${block.text.split(/\s*\|\s*/).filter(Boolean).map((line) => html`<p>${inline(line)}</p>`)}</blockquote>
  ${block.cite ? html`<figcaption class="caption">— ${inline(block.cite)}</figcaption>` : ''}
</figure>`;

    case 'list':
      return block.ordered
        ? html`<ol class="prose__list"${block.start ? html` start="${block.start}"` : ''}>${block.items.map((item) => html`<li>${inline(item)}</li>`)}</ol>`
        : html`<ul class="prose__list">${block.items.map((item) => html`<li>${inline(item)}</li>`)}</ul>`;

    case 'table':
      return table(block);

    case 'note':
      return html`<aside class="prose__note">${block.title ? html`<p class="label">${inline(block.title)}</p>` : ''}<p>${inline(block.text)}</p></aside>`;

    case 'code':
      return html`<pre class="prose__code"${block.language ? html` data-language="${block.language}"` : ''}><code>${block.code}</code></pre>`;
  }
}

/**
 * Il livello scritto nel testo è relativo: `#` è il titolo più alto che
 * l'autore può usare dentro il corpo, e scivola sotto quello della pagina.
 */
function heading(level: 1 | 2 | 3, base: 2 | 3, content: Html): Html {
  const depth = Math.min(base + level - 1, 4);
  if (depth <= 2) return html`<h2>${content}</h2>`;
  if (depth === 3) return html`<h3>${content}</h3>`;
  return html`<h4>${content}</h4>`;
}

/** Tabella: intestazione forte, allineamento per colonna, numeri a destra. */
function table(block: Extract<ContentBlock, { kind: 'table' }>): Html {
  /*
   * L'allineamento viene dalla riga dei trattini; in mancanza di indicazione
   * una cella di soli numeri va comunque a destra, perché le cifre si leggono
   * incolonnate (TYPOGRAPHY.md «Tabelle»).
   */
  const cellClass = (column: number, cell: { text: string }): Html => {
    const align = block.align[column] ?? 'left';
    const name = align === 'center' ? 'center' : align === 'right' || isNumeric(cell.text) ? 'num' : '';
    return name ? html` class="${name}"` : html``;
  };

  /* Cella senza valore: un trattino, perché «vuoto» e «zero» non si confondano. */
  const content = (cell: { text: string }): Html => (cell.text ? inline(cell.text) : html`<span class="table__empty">—</span>`);

  return html`<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>${block.header.map((cell, column) => html`<th scope="col"${cellClass(column, cell)}>${inline(cell.text)}</th>`)}</tr>
    </thead>
    <tbody>
      ${block.rows.map(
        (row) => html`<tr>${row.map((cell, column) =>
          cell.header
            ? html`<th scope="row"${cellClass(column, cell)}>${content(cell)}</th>`
            : html`<td${cellClass(column, cell)}>${content(cell)}</td>`,
        )}</tr>`,
      )}
    </tbody>
  </table>
</div>`;
}

/** Una cella è numerica quando contiene solo un numero, con unità o segno. */
function isNumeric(text: string): boolean {
  return /^[−+-]?[\d.,]+\s*(%|°C?|km|m|h|€|mm)?$/.test(text.trim());
}
