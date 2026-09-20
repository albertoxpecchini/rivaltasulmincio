import { site } from '../app/site';
import { html, type Html } from '../lib/html';
import { linkedSources } from '../services/sources';

export function footer(): Html {
  return html`<footer class="site-footer">
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
  </div>
</footer>`;
}
