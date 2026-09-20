import { html, type Html } from '../lib/html';

const numberFormat = new Intl.NumberFormat('it-IT');

/** «2.847»: numeri con separatore italiano delle migliaia. */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/**
 * Numero principale (TYPOGRAPHY.md «Numeri principali»). Il valore reale sta
 * nel testo per chi non vede e per chi non ha JavaScript; la copia visibile
 * può contare da zero quando entra nel viewport (src/animations/count.ts,
 * ANIMATIONS.md «Numeri»: il valore finale non dipende dall'animazione).
 */
export function statNumber(value: number, options: { class?: string } = {}): Html {
  const text = formatNumber(value);
  return html`<span class="stat${options.class ? ` ${options.class}` : ''}" data-count="${value}"><span aria-hidden="true" data-count-value>${text}</span><span class="visually-hidden">${text}</span></span>`;
}
