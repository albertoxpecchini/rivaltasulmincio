import { html, raw, type Html } from '../lib/html';
import type { Poster } from '../types';

/*
 * Locandina (JOURNAL.md «MEDIA»).
 *
 * La locandina pubblicata è quella vera: il suo HTML viene dal file sorgente
 * degli organizzatori, importato da `scripts/locandina-import.ts` in
 * `data/journal/locandine/<nome>.html` e incluso qui così com'è. Non è una
 * ricostruzione: ogni misura, colore, curva e disegno è l'originale.
 *
 * Il foglio è composto in millimetri su un A4 fisso, quindi non si adatta da
 * sé a uno schermo stretto: `poster.css` lo scala per intero con `transform`,
 * mantenendo le proporzioni esatte. Il testo resta testo — si seleziona, si
 * cerca, lo legge lo screen reader — e i disegni sono SVG, quindi nitidi a
 * qualunque ingrandimento.
 */

/** Larghezza e altezza del foglio, in millimetri (A4 verticale). */
export const SHEET = { width: 210, height: 297 };

/**
 * Il foglio, dentro il contenitore che lo scala.
 *
 * `--sheet-w` e `--sheet-h` dicono al CSS quanto è grande il foglio; il resto
 * lo fa `poster.css`. `role="img"` più `aria-label` danno all'insieme un nome
 * solo, ma il contenuto resta nel documento e leggibile voce per voce.
 */
export function posterSheet(poster: Poster): Html {
  return html`<div class="poster-sheet" style="--sheet-w: ${SHEET.width}; --sheet-h: ${SHEET.height}">
  <div class="poster-sheet__scale">${raw(poster.markup)}</div>
</div>`;
}

const IMAGE_SIZES = '(max-width: 64rem) 100vw, 48rem';

/** La riproduzione fotografica del foglio: serve all'anteprima e al download. */
export function posterImage(poster: Poster, options: { loading?: 'eager' | 'lazy' } = {}): Html {
  const image = poster.image;
  const stem = image.src.replace(/-\d+\.webp$/, '');
  const srcset = image.widths.map((width) => `${stem}-${width}.webp ${width}w`).join(', ');
  return html`<img
    class="poster-image"
    src="${image.src}"
    srcset="${srcset}"
    sizes="${IMAGE_SIZES}"
    alt="${image.alt}"
    width="${image.width}"
    height="${image.height}"
    loading="${options.loading ?? 'lazy'}"
    decoding="async"
  />`;
}
