import type { PageResult } from '../app/page';
import { mapBlock } from '../components/map';
import { pageHeader } from '../components/page-header';
import { section } from '../components/section';
import { sourceLabel } from '../components/source-label';
import { formatDateShort } from '../lib/dates';
import { html } from '../lib/html';
import { MAP_ZOOM } from '../map/config';
import { categoryLine } from '../places/list';
import { activePlaces, mapCenter, osmDataTimestamp, placesByCategory } from '../places/service';

/** Mappa completa (FUNDAMENTA.md «MAPPA»): motore, dati e interfaccia separati; l'elenco testuale sta in /luoghi. */
export function render(): PageResult {
  const groups = placesByCategory();
  const total = activePlaces().length;
  const osmTimestamp = osmDataTimestamp();

  return {
    title: 'Mappa',
    description: `La mappa di Rivalta sul Mincio: ${total} luoghi da OpenStreetMap, con scheda e collegamento all'elemento originale.`,
    main: html`
      ${pageHeader({
        title: 'Mappa',
        lead: html`Ogni marker è un luogo censito in OpenStreetMap entro il paese e la campagna vicina. Selezionalo per aprire la scheda; l'elenco completo è in <a href="/luoghi">Luoghi</a>.`,
      })}
      ${mapBlock({
        id: 'mappa',
        mode: 'full',
        center: mapCenter(),
        zoom: MAP_ZOOM.village,
        label: 'Mappa di Rivalta sul Mincio',
        title: 'Mappa · OpenStreetMap',
        filters: groups.map((group) => ({ category: group.category, count: group.places.length })),
        updatedAt: osmTimestamp ? formatDateShort(osmTimestamp) : undefined,
      })}
      ${section({
        id: 'categorie',
        title: 'Luoghi per categoria',
        meta: `${total} luoghi`,
        intro: "Nell'area del paese.",
        body: html`<ul class="category-list list-plain">
          ${groups.map(
            (group) => html`<li><a href="/luoghi#${group.category}">${categoryLine(group.category, group.places.length)}</a></li>`,
          )}
        </ul>`,
        more: { href: '/luoghi', label: 'Elenco completo' },
      })}
      ${sourceLabel({ source: { name: 'OpenStreetMap', sourceId: 'source-007' }, updatedAt: osmTimestamp })}
    `,
  };
}
