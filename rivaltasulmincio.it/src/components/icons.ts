import building2 from 'lucide-static/icons/building-2.svg?raw';
import bus from 'lucide-static/icons/bus.svg?raw';
import circleCheck from 'lucide-static/icons/circle-check.svg?raw';
import externalLink from 'lucide-static/icons/external-link.svg?raw';
import landmark from 'lucide-static/icons/landmark.svg?raw';
import library from 'lucide-static/icons/library.svg?raw';
import map from 'lucide-static/icons/map.svg?raw';
import mapPin from 'lucide-static/icons/map-pin.svg?raw';
import slidersHorizontal from 'lucide-static/icons/sliders-horizontal.svg?raw';
import store from 'lucide-static/icons/store.svg?raw';
import treePine from 'lucide-static/icons/tree-pine.svg?raw';
import trophy from 'lucide-static/icons/trophy.svg?raw';
import waves from 'lucide-static/icons/waves.svg?raw';
import { raw, type Html } from '../lib/html';

/*
 * Icone (ICONS.md): un solo sistema, Lucide, importato icona per icona da
 * `lucide-static` così nel bundle finisce solo ciò che è usato. Lo stroke
 * arriva dal token CSS `--icon-stroke-width`.
 */
const ICONS = {
  'building-2': building2,
  bus,
  'circle-check': circleCheck,
  'external-link': externalLink,
  landmark,
  library,
  map,
  'map-pin': mapPin,
  'sliders-horizontal': slidersHorizontal,
  store,
  'tree-pine': treePine,
  trophy,
  waves,
} as const;

export type IconName = keyof typeof ICONS;

/** Markup dell'icona decorativa: il significato deve essere dato dal testo o dal contesto. */
export function iconMarkup(name: IconName, size = 16): string {
  const source = ICONS[name];
  const start = source.indexOf('>', source.indexOf('<svg')) + 1;
  const inner = source.slice(start, source.lastIndexOf('</svg>')).trim();
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export function icon(name: IconName, size = 16): Html {
  return raw(iconMarkup(name, size));
}
