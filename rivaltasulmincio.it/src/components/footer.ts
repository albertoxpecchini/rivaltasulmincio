import { site } from '../app/site';
import { formatDateShort, formatTime } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { osmDataTimestamp } from '../places/service';
import { linkedSources } from '../services/sources';

/*
 * Striscia del Mincio sopra il piè di pagina: fotografia ritagliata, senza
 * fondo, che chiude la pagina con il paese visto dall'acqua. Le canoe e la
 * darsena poggiano sulla crema della pagina e la riva si appoggia al pannello
 * scuro sotto (IMAGES.md «Responsive images»). È ornamento, non contenuto:
 * `alt` vuoto e `aria-hidden`, così chi legge con la voce non la incontra.
 */
const BANNER_WIDE = [480, 720, 960, 1440, 1600, 2172];
const BANNER_NARROW = [480, 720, 960, 1100];

function srcsetOf(stem: string, widths: number[]): string {
  return widths.map((width) => `/foto/banner/${stem}-${width}.webp ${width}w`).join(', ');
}

/*
 * Due tagli, non uno ridimensionato. Il panorama intero è largo quasi cinque
 * volte la sua altezza: sotto i 48rem diventerebbe una striscia di pochi pixel
 * in cui le canoe sono puntini. Lì si usa un ritaglio stretto sulla darsena,
 * dove la scena resta leggibile.
 */
function footerBanner(): Html {
  return html`<div class="site-footer__banner" aria-hidden="true">
    <picture>
      <source
        media="(min-width: 48rem)"
        srcset="${srcsetOf('mincio-canoe', BANNER_WIDE)}"
        sizes="100vw"
        width="2172"
        height="445"
      />
      <img
        class="site-footer__banner-image"
        src="/foto/banner/mincio-canoe-stretto-960.webp"
        srcset="${srcsetOf('mincio-canoe-stretto', BANNER_NARROW)}"
        sizes="100vw"
        alt=""
        width="1100"
        height="445"
        loading="lazy"
        decoding="async"
      />
    </picture>
  </div>`;
}

/**
 * Piè di pagina: striscia del Mincio, poi pannello scuro con identità,
 * sezioni, fonti e una riga di stato in mono (STYLE.md «barre informative»):
 * attribuzione, data dei dati OSM, momento della build e, in fondo, la firma
 * di chi ha fatto il progetto. Il sito è statico: «adesso» è la build.
 */
export function footer(): Html {
  const built = new Date().toISOString();
  const osm = osmDataTimestamp();
  return html`<footer class="site-footer">
  ${footerBanner()}
  <div class="site-footer__panel inverse">
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
      <a href="${site.author.url}" rel="author">Progetto di ${site.author.name}</a>
    </p>
  </div>
  </div>
</footer>`;
}
