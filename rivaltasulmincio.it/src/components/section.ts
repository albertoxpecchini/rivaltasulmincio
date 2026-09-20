import { html, type Html } from '../lib/html';
import { icon } from './icons';

/**
 * Sezione di pagina: testata con codice d'ordine in mono (STYLE.md «codici
 * identificativi»), titolo (h2), metadata tecnico, introduzione e link
 * «vedi tutto». `data-reveal` la fa entrare quando arriva nel viewport
 * (src/animations/reveal.ts); senza JavaScript è semplicemente visibile.
 */
export function section(options: {
  id: string;
  title: string;
  /** Numero d'ordine, «01»: solo dove la pagina è una sequenza di moduli. */
  code?: string;
  /** Metadata in mono accanto al titolo: data, fonte, conteggio. */
  meta?: string;
  intro?: string;
  body: Html | Html[];
  more?: { href: string; label: string };
}): Html {
  const headingId = `${options.id}-titolo`;
  return html`<section class="section" id="${options.id}" aria-labelledby="${headingId}" data-reveal>
  <div class="section__head">
    ${options.code ? html`<span class="section__code" aria-hidden="true">${options.code}</span>` : ''}
    <h2 id="${headingId}">${options.title}</h2>
    ${options.meta ? html`<span class="section__meta">${options.meta}</span>` : ''}
    ${options.intro ? html`<p class="section__intro">${options.intro}</p>` : ''}
    ${options.more ? html`<a class="section__more" href="${options.more.href}">${options.more.label} ${icon('arrow-right', 14)}</a>` : ''}
  </div>
  ${options.body}
</section>`;
}
