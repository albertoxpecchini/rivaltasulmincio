import type { PageResult } from '../app/page';
import { sourceLabel } from '../components/source-label';
import { formatDate } from '../lib/dates';
import { html } from '../lib/html';
import { categoryHeading, placeList } from '../places/list';
import { activePlaces, osmDataTimestamp, placesByCategory } from '../places/service';

/** Catalogo dei luoghi: il contenuto che la mappa rappresenta, leggibile senza JavaScript. */
export function render(): PageResult {
  const groups = placesByCategory();
  const total = activePlaces().length;
  const osmTimestamp = osmDataTimestamp();

  return {
    title: 'Luoghi',
    description: `${total} luoghi di Rivalta sul Mincio da OpenStreetMap: attività, servizi, cultura, sport, natura, mobilità, storia, territorio e acqua.`,
    main: html`
      <div class="page-header">
        <h1>Luoghi</h1>
        <p class="lead">${total} luoghi censiti in OpenStreetMap entro il paese e la campagna vicina, per categoria. Ogni luogo con nome ha una scheda; tutti sono sulla <a href="/mappa">mappa</a>.</p>
        <nav aria-label="Categorie">
          <ul class="chip-list list-plain">
            ${groups.map((group) => html`<li><a class="chip" href="#${group.category}">${group.info.label} <span class="tabular">${group.places.length}</span></a></li>`)}
          </ul>
        </nav>
      </div>
      ${groups.map(
        (group) => html`<section class="section" aria-labelledby="${group.category}">
        ${categoryHeading(group.category, group.places.length)}
        ${placeList(group.places)}
      </section>`,
      )}
      ${sourceLabel({ source: { name: 'OpenStreetMap', sourceId: 'source-007' }, updatedAt: osmTimestamp })}
      <p class="caption">Dati OpenStreetMap${osmTimestamp ? html` al ${formatDate(osmTimestamp)}` : ''}, licenza ODbL. Un dato assente in OpenStreetMap non significa che il luogo non lo abbia.</p>
    `,
  };
}
