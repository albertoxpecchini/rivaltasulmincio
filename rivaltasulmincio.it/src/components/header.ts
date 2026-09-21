import { site } from '../app/site';
import { html, raw, type Html } from '../lib/html';
import { icon } from './icons';

/*
 * Testata: wordmark testuale (LOGO.md: non esiste ancora un SVG ufficiale) e
 * navigazione principale. Sotto i 768 px la navigazione si apre da un pulsante
 * (RESPONSIVE.md «Matrice navigazione»: logo | menu); il pulsante è reso
 * nascosto e lo attiva `src/nav/client.ts`, così senza JavaScript le voci
 * restano tutte in vista. La Home è il wordmark: non compare tra le voci, che
 * portano un numero d'ordine in mono (STYLE.md «NAVIGAZIONE»); a destra
 * l'elemento «Cerca» con il tasto rapido, mostrato solo su desktop.
 */
export function header(path: string): Html {
  return html`<header class="site-header inverse">
  <div class="container site-header__inner">
    <a class="wordmark" href="/" aria-label="${site.name} — home">${site.name}</a>
    <button class="site-menu" type="button" aria-expanded="false" aria-controls="navigazione" aria-label="Menu" data-menu-toggle hidden>
      <span class="site-menu__icon site-menu__icon--open">${icon('menu', 20)}</span>
      <span class="site-menu__icon site-menu__icon--close">${icon('x', 20)}</span>
      <span class="site-menu__label">Menu</span>
    </button>
    <nav class="site-nav" id="navigazione" aria-label="Navigazione principale">
      <ul class="list-plain">
        ${site.navigation
          .filter((item) => item.href !== '/' && (item.href !== '/meteo' || site.features.weather))
          .map(
          (item, index) =>
            html`<li><a href="${item.href}"${isActive(path, item.href) ? raw(' aria-current="page"') : ''}><span class="site-nav__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${item.label}</a></li>`,
        )}
      </ul>
    </nav>
    <a class="site-header__search" href="/#ricerca" aria-label="Cerca">${icon('search', 16)}<span>Cerca</span><kbd class="kbd" aria-hidden="true" data-search-kbd>Ctrl K</kbd></a>
  </div>
</header>`;
}

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  return path === href || path.startsWith(`${href}/`);
}
