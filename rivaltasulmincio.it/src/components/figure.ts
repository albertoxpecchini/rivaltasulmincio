import { html, type Html } from '../lib/html';
import type { PlaceImage } from '../types';

/*
 * Fotografia di un luogo (IMAGES.md «Responsive images», «Lazy loading»,
 * «Crediti»). Il browser sceglie la variante: `sizes` dichiara quanto spazio
 * occupa davvero la figura, `width`/`height` riservano lo spazio prima del
 * caricamento così la pagina non salta.
 */

/*
 * Quanto spazio occupa davvero la figura: tutta la larghezza sotto i 64rem
 * della scheda, poi i 64rem pieni. Su schermo a densità doppia il browser
 * sale da sé alle varianti grandi, che per questo ci sono tutte.
 */
const SIZES = '(max-width: 64rem) 100vw, 64rem';

function srcset(image: PlaceImage): string {
  const stem = image.src.replace(/-\d+\.webp$/, '');
  return image.widths.map((width) => `${stem}-${width}.webp ${width}w`).join(', ');
}

/**
 * La fotografia in apertura di scheda. `eager` per l'immagine principale
 * sopra la piega (IMAGES.md: non penalizzare l'LCP), `lazy` altrove.
 */
export function placeFigure(image: PlaceImage, options: { loading?: 'eager' | 'lazy' } = {}): Html {
  const loading = options.loading ?? 'eager';
  const caption = [image.caption, image.credit ? `Foto: ${image.credit}` : undefined].filter(Boolean);

  return html`<figure class="figure">
  <img
    class="figure__image"
    src="${image.src}"
    srcset="${srcset(image)}"
    sizes="${SIZES}"
    alt="${image.alt}"
    width="${image.width}"
    height="${image.height}"
    loading="${loading}"
    decoding="async"
  />
  ${caption.length ? html`<figcaption class="figure__caption">${caption.join(' · ')}</figcaption>` : ''}
</figure>`;
}
