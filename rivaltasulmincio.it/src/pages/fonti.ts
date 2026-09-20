import type { PageResult } from '../app/page';
import { officialBadge } from '../components/official-badge';
import { section } from '../components/section';
import { formatDate } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { getSource, isOfficial, listHierarchy, listSources, sourceTypeLabel } from '../services/sources';
import type { Source } from '../types';

export function render(): PageResult {
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
      <div class="page-header">
        <h1>Fonti</h1>
        <p class="lead">Ogni informazione pubblicata indica da dove proviene e quando è stata verificata. Le fonti ufficiali hanno priorità sui contenuti secondari quando descrivono lo stesso dato; se due fonti sono in conflitto, il progetto mantiene entrambe e documenta la differenza.</p>
      </div>
      ${section({ id: 'gerarchia', title: 'Fonte per tipo di informazione', body: hierarchy })}
      ${section({
        id: 'registro',
        title: 'Registro delle fonti',
        intro: 'In ordine di preferenza.',
        body: html`<ol class="source-list list-plain">${listSources().map(sourceItem)}</ol>`,
      })}
    `,
  };
}

function sourceItem(source: Source): Html {
  return html`<li class="source-item" id="${source.id}">
  <div class="source-item__head">
    <h3>${source.name}</h3>
    ${isOfficial(source) ? officialBadge() : ''}
    <span class="tag tag--muted">${sourceTypeLabel(source.type)}</span>
  </div>
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
    <dt>Ultima verifica</dt>
    <dd>${source.checkedAt ? html`<time datetime="${source.checkedAt}">${formatDate(source.checkedAt)}</time>` : 'Da verificare'}</dd>
  </dl>
</li>`;
}
