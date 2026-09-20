import { raw, type Html } from '../lib/html';

/*
 * Icone SVG inline (ICONS.md): un solo sistema, stroke da token CSS,
 * geometrie della libreria Lucide (licenza ISC). Quando le icone diventeranno
 * numerose si passerà al pacchetto Lucide con tree-shaking, mantenendo questa
 * firma.
 */
const GLYPHS = {
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
} as const;

export type IconName = keyof typeof GLYPHS;

/** Icona decorativa: il significato deve essere dato dal testo o dal contesto. */
export function icon(name: IconName, size = 16): Html {
  return raw(
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${GLYPHS[name]}</svg>`,
  );
}
