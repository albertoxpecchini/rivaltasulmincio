import type { IconName } from '../components/icons';
import type { PlaceCategory } from '../types/place.ts';

/*
 * Categorie dei luoghi: etichetta, colore (token COLORS.md) e icona (ICONS.md).
 * Il colore non è mai l'unico segnale: etichetta e icona lo accompagnano.
 * I colori sono applicati in CSS tramite `[data-category]` (map.css).
 */
export type CategoryInfo = {
  label: string;
  /** Token colore di COLORS.md usato in CSS per marker e contrassegni. */
  colorToken: string;
  icon: IconName;
};

export const PLACE_CATEGORIES: Record<PlaceCategory, CategoryInfo> = {
  attivita: { label: 'Attività', colorToken: '--category-business', icon: 'store' },
  servizi: { label: 'Servizi', colorToken: '--category-services', icon: 'building-2' },
  cultura: { label: 'Cultura', colorToken: '--category-culture', icon: 'library' },
  sport: { label: 'Sport', colorToken: '--category-sport', icon: 'trophy' },
  natura: { label: 'Natura', colorToken: '--category-nature', icon: 'tree-pine' },
  mobilita: { label: 'Mobilità', colorToken: '--category-mobility', icon: 'bus' },
  storia: { label: 'Storia', colorToken: '--category-history', icon: 'landmark' },
  territorio: { label: 'Territorio', colorToken: '--color-earth', icon: 'map-pin' },
  acqua: { label: 'Acqua', colorToken: '--color-water', icon: 'waves' },
};

export const PLACE_CATEGORY_ORDER = Object.keys(PLACE_CATEGORIES) as PlaceCategory[];

export function categoryLabel(category: PlaceCategory): string {
  return PLACE_CATEGORIES[category]?.label ?? category;
}
