import { site } from '../app/site';
import { html, raw, type Html } from '../lib/html';

/** Testata: wordmark testuale (LOGO.md: non esiste ancora un SVG ufficiale) e navigazione principale. */
export function header(path: string): Html {
  return html`<header class="site-header">
  <div class="container site-header__inner">
    <a class="wordmark" href="/">${site.name}</a>
    <nav class="site-nav" aria-label="Navigazione principale">
      <ul class="list-plain">
        ${site.navigation.map(
          (item) =>
            html`<li><a href="${item.href}"${isActive(path, item.href) ? raw(' aria-current="page"') : ''}>${item.label}</a></li>`,
        )}
      </ul>
    </nav>
  </div>
</header>`;
}

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  return path === href || path.startsWith(`${href}/`);
}
