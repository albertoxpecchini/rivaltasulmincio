import type { PageResult, RenderedDocument } from '../app/page';
import { site } from '../app/site';
import { footer } from '../components/footer';
import { header } from '../components/header';
import { noticeBar } from '../components/notice';
import { activeNotices } from '../data/notices';
import { escape, html } from '../lib/html';

/** Layout base: testa del documento, skip link, testata, <main>, piè di pagina. */
export function renderDocument(path: string, page: PageResult): RenderedDocument {
  const title = path === '/' ? site.fullName : `${page.title} — ${site.name}`;
  const description = page.description ?? site.description;
  const canonical = `${site.origin}${path === '/' ? '/' : path}`;

  const head = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    page.robots
      ? `<meta name="robots" content="${page.robots}" />`
      : `<link rel="canonical" href="${escape(canonical)}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escape(site.name)}" />`,
    `<meta property="og:locale" content="it_IT" />`,
    ...(page.robots ? [] : [`<meta property="og:url" content="${escape(canonical)}" />`]),
  ].join('\n    ');

  // Un avviso alla volta in cima alla pagina: il primo ancora valido.
  const [notice] = activeNotices(new Date());

  const body = html`
    <a class="skip-link" href="#contenuto">Vai al contenuto</a>
    ${notice ? noticeBar(notice) : ''}
    ${header(path)}
    <main id="contenuto" class="container">${page.main}</main>
    ${footer()}
    <div class="stagione" data-stagione="autunno" aria-hidden="true"></div>
  `;

  return { status: page.status ?? 200, head, html: body.value };
}
