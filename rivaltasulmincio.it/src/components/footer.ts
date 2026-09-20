import { site } from '../app/site';
import { formatDateShort, formatTime } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { osmDataTimestamp } from '../places/service';
import { linkedSources } from '../services/sources';

/**
 * Piè di pagina: pannello scuro con identità, sezioni, fonti e una riga di
 * stato in mono (STYLE.md «barre informative»): attribuzione, data dei dati
 * OSM, momento della build. Il sito è statico: «adesso» è la build.
 */
export function footer(): Html {
  const built = new Date().toISOString();
  const osm = osmDataTimestamp();
  return html`<footer class="site-footer inverse">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <p class="wordmark">${site.name}</p>
        <p>${site.description}</p>
      </div>
      <nav aria-label="Navigazione secondaria">
        <p class="label">Sezioni</p>
        <ul class="list-plain">
          ${site.navigation.map((item) => html`<li><a href="${item.href}">${item.label}</a></li>`)}
        </ul>
      </nav>
      <div>
        <p class="label">Fonti principali</p>
        <ul class="list-plain">
          ${linkedSources().map((source) => html`<li><a href="${source.url}" rel="noopener noreferrer">${source.name}</a></li>`)}
        </ul>
      </div>
    </div>
    <p class="site-footer__note">La presenza di un ente o di un'attività nel progetto non implica approvazione, collaborazione o patrocinio, salvo indicazione esplicita e documentata.</p>
    <p class="site-footer__meta">
      <span>© OpenStreetMap contributors · ODbL</span>
      ${osm ? html`<span>Dati OSM <time datetime="${osm}">${formatDateShort(osm)}</time></span>` : ''}
      <span>Build <time datetime="${built}">${formatDateShort(built)} ${formatTime(built)}</time></span>
    </p>
  </div>
</footer>`;
}
