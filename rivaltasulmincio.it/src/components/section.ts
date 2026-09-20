import { html, type Html } from '../lib/html';

/** Sezione di pagina con titolo (h2), introduzione facoltativa e link «vedi tutto». */
export function section(options: {
  id: string;
  title: string;
  intro?: string;
  body: Html | Html[];
  more?: { href: string; label: string };
}): Html {
  const headingId = `${options.id}-titolo`;
  return html`<section class="section" id="${options.id}" aria-labelledby="${headingId}">
  <div class="section__head">
    <h2 id="${headingId}">${options.title}</h2>
    ${options.intro ? html`<p class="section__intro">${options.intro}</p>` : ''}
    ${options.more ? html`<a class="section__more" href="${options.more.href}">${options.more.label}</a>` : ''}
  </div>
  ${options.body}
</section>`;
}
