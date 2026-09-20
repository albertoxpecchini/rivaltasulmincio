import type { PageResult } from '../app/page';
import { officialBadge } from '../components/official-badge';
import { pageHeader } from '../components/page-header';
import { section } from '../components/section';
import { formatDateShort } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { getSource, isOfficial, listHierarchy, listSources, sourceTypeLabel } from '../services/sources';
import type { Source } from '../types';

/** Fonti (STYLE.md «FONTI»: record verificabili): gerarchia per tipo di informazione e registro. */
export function render(): PageResult {
  const sources = listSources();
  const hierarchy = html`<div class="table-wrap">
    <table class="table">
      <thead>
        <tr><th scope="col">Informazione</th><th scope="col">Fonte di riferimento</th></tr>
      </thead>
      <tbody>
        ${listHierarchy().map((rule) => {
          const source = getSource(rule.sourceId);
          return html`<tr>
            <td>${rule.information}</td>
            <td>${
              source
                ? html`<a href="#${source.id}">${source.name}</a>${isOfficial(source) ? officialBadge({ compact: true }) : ''}`
                : (rule.note ?? 'Dato non disponibile')
            }</td>
          </tr>`;
        })}
      </tbody>
    </table>
  </div>`;

  return {
    title: 'Fonti',
    description:
      'Le fonti dei dati di Rivalta sul Mincio: quali sono, cosa forniscono e quando sono state verificate.',
    main: html`
      ${pageHeader({
        title: 'Fonti',
        lead: 'Ogni informazione pubblicata indica da dove proviene e quando è stata verificata. Le fonti ufficiali hanno priorità sui contenuti secondari quando descrivono lo stesso dato; se due fonti sono in conflitto, il progetto mantiene entrambe e documenta la differenza.',
      })}
      ${section({ id: 'gerarchia', title: 'Fonte per tipo di informazione', body: hierarchy })}
      ${section({
        id: 'registro',
        title: 'Registro delle fonti',
        meta: `${sources.length} record`,
        intro: 'In ordine di preferenza.',
        body: html`<ol class="source-list list-plain">${sources.map(sourceRecord)}</ol>`,
      })}
    `,
  };
}

function sourceRecord(source: Source): Html {
  return html`<li class="source-record panel" id="${source.id}">
  <div class="panel__head">
    <span class="panel__title">Fonte ${String(source.rank).padStart(2, '0')}</span>
    <span class="tag tag--muted">${sourceTypeLabel(source.type)}</span>
    ${isOfficial(source) ? officialBadge() : ''}
    <span class="panel__meta">${source.id}</span>
  </div>
  <div class="panel__body">
    <h3>${source.name}</h3>
    <p>${source.scope}</p>
    <dl>
      <dt>Sito</dt>
      <dd>${source.url ? html`<a href="${source.url}" rel="noopener noreferrer">${source.url}</a>` : 'Dato non disponibile'}</dd>
      ${source.license ? html`<dt>Licenza</dt><dd>${source.license}</dd>` : ''}
      ${
        source.attribution
          ? html`<dt>Attribuzione</dt><dd>${
              source.attributionUrl
                ? html`<a href="${source.attributionUrl}" rel="noopener noreferrer">${source.attribution}</a>`
                : source.attribution
            }</dd>`
          : ''
      }
      ${source.terms ? html`<dt>Condizioni</dt><dd>${source.terms}</dd>` : ''}
    </dl>
  </div>
  <div class="panel__foot">
    <span>Ultima verifica ${source.checkedAt ? html`<time datetime="${source.checkedAt}">${formatDateShort(source.checkedAt)}</time>` : 'da fare'}</span>
    ${source.verifiedAt ? html`<span>Fonte ufficiale verificata <time datetime="${source.verifiedAt}">${formatDateShort(source.verifiedAt)}</time></span>` : ''}
  </div>
</li>`;
}
