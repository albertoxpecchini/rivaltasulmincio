import { escape, html, raw, type Html } from '../lib/html';
import type { Poster, PosterDay, PosterEntry } from '../types';

/*
 * Locandina in HTML (JOURNAL.md «MEDIA», ACCESSIBILITÀ).
 *
 * La locandina non è un'immagine: è il programma dell'evento, composto con la
 * propria identità grafica. Renderla in HTML significa che il testo si
 * seleziona, si cerca, si legge con lo screen reader, si traduce, si ingrandisce
 * e si stampa senza sfocare — cose che un PNG non sa fare.
 *
 * I colori vivono nel dataset e non nei token del sito: appartengono alla
 * locandina, non al design system (STYLE.md vale per il sito attorno). Restano
 * confinati sotto `.poster`, che non tocca nessun'altra parte della pagina.
 */

/**
 * Evidenzia sul testo le parti che la locandina stampa in grassetto.
 *
 * Il confronto avviene sul testo *già escapato*, perché è quello che finisce
 * nella pagina: «Anna & Max» nel dataset diventa «Anna &amp; Max» qui, e il
 * termine da cercare va escapato allo stesso modo prima di diventare pattern.
 * Così l'unico markup inserito sono i `<b>` del progetto.
 */
function withStrong(text: string, strong: string[] | undefined): Html {
  if (!strong?.length) return html`${text}`;
  // Le parti più lunghe per prime: «Anna & Max» prima di «Max».
  const parts = [...strong].sort((a, b) => b.length - a.length);
  const pattern = parts
    .map((part) => escape(part).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const markup = escape(text).replace(new RegExp(pattern, 'g'), '<b>$&</b>');
  return raw(markup);
}

function entry(item: PosterEntry): Html {
  return html`<div class="poster-entry">
    <dt class="poster-entry__time">${item.time}</dt>
    <dd class="poster-entry__text">
      ${withStrong(item.text, item.strong)}
      ${
        item.note
          ? html`<p class="poster-note">${item.note.label ? html`<b>${item.note.label}</b> ` : ''}${item.note.text}</p>`
          : ''
      }
    </dd>
  </div>`;
}

function day(item: PosterDay): Html {
  return html`<section class="poster-day" style="--poster-day: ${item.color}" aria-labelledby="poster-${item.id}">
    <h2 class="poster-day__head" id="poster-${item.id}">${item.heading}</h2>
    <dl class="poster-day__list">${item.entries.map(entry)}</dl>
  </section>`;
}

function menu(item: NonNullable<Poster['menu']>): Html {
  return html`<section class="poster-menu" aria-labelledby="poster-menu">
    <h2 class="poster-menu__title" id="poster-menu">${item.title}</h2>
    <ul class="poster-menu__courses list-plain">
      ${item.courses.map((course) => html`<li>${course.strong ? html`<b>${course.text}</b>` : course.text}</li>`)}
    </ul>
    ${item.note ? html`<p class="poster-menu__note">${item.note}</p>` : ''}
    <dl class="poster-prices">
      ${item.prices.map(
        (price) => html`<div class="poster-price">
          <dt>${price.label}</dt>
          <dd>${price.value}</dd>
        </div>`,
      )}
    </dl>
  </section>`;
}

function booking(item: NonNullable<Poster['booking']>): Html {
  return html`<section class="poster-booking" aria-labelledby="poster-prenotazione">
    <div class="poster-booking__text">
      <p class="poster-booking__kicker">${item.kicker}</p>
      <h2 class="poster-booking__title" id="poster-prenotazione">${item.title}</h2>
      ${item.note ? html`<p class="poster-booking__note">${item.note}</p>` : ''}
    </div>
    <ul class="poster-booking__contacts list-plain">
      ${item.contacts.map(
        (contact) => html`<li>
          <span class="poster-booking__name">${contact.name}</span>
          <a class="poster-booking__phone" href="tel:+39${contact.phone.replaceAll(' ', '')}">${contact.phone}</a>
        </li>`,
      )}
    </ul>
  </section>`;
}

/** Il titolo su più righe, come sulla locandina. */
function titleLines(poster: Poster): Html[] {
  return poster.title.map((line, index) => (index === 0 ? html`${line}` : html`<br />${line}`));
}

function contrade(item: NonNullable<Poster['contrade']>): Html {
  return html`<section class="poster-contrade" aria-labelledby="poster-contrade">
    <h2 class="poster-contrade__label" id="poster-contrade">${item.label}</h2>
    <ul class="poster-contrade__list list-plain">
      ${item.items.map(
        (contrada) => html`<li
          class="poster-contrada${contrada.ink === 'dark' ? ' poster-contrada--dark' : ''}"
          style="--contrada: ${contrada.color}"
        >
          <img
            class="poster-contrada__logo"
            src="${contrada.logo}"
            alt=""
            width="64"
            height="64"
            loading="lazy"
            decoding="async"
          />
          <span class="poster-contrada__name">${contrada.name}</span>
        </li>`,
      )}
    </ul>
  </section>`;
}

/**
 * La locandina come documento HTML.
 *
 * `level` dice a che profondità sta il titolo della locandina: `1` quando la
 * locandina *è* la pagina, `2` quando vive dentro un'altra. Il resto della
 * gerarchia scende di conseguenza, così i titoli non saltano un livello
 * (ACCESSIBILITÀ, WCAG 2.2 «Info and Relationships»).
 */
export function posterBlock(poster: Poster, options: { level?: 1 | 2 } = {}): Html {
  const level = options.level ?? 1;
  const title =
    level === 1
      ? html`<h1 class="poster__title" id="poster-titolo">${titleLines(poster)}</h1>`
      : html`<h2 class="poster__title" id="poster-titolo">${titleLines(poster)}</h2>`;
  return html`<article class="poster" aria-labelledby="poster-titolo">
  <header class="poster__header">
    <p class="poster__kicker">${poster.kicker}</p>
    ${title}
    <p class="poster__place">${poster.place}</p>
    <p class="poster__dates">${poster.dates}</p>
  </header>

  <div class="poster__days">
    ${poster.days.map(day)}
    ${poster.highlight ? html`<p class="poster-highlight">${poster.highlight}</p>` : ''}
    ${
      poster.music
        ? html`<section class="poster-music" aria-labelledby="poster-musica">
            <img class="poster-music__logo" src="${poster.music.logo}" alt="" width="72" height="72" loading="lazy" decoding="async" />
            <div>
              <h2 class="poster-music__kicker" id="poster-musica">${poster.music.kicker}</h2>
              <p class="poster-music__text">${withStrong(poster.music.text, poster.music.strong)}</p>
            </div>
          </section>`
        : ''
    }
    ${poster.menu ? menu(poster.menu) : ''}
  </div>

  ${poster.booking ? booking(poster.booking) : ''}
  ${poster.contrade ? contrade(poster.contrade) : ''}

  <footer class="poster__footer">
    <div class="poster__credits">
      <p>${withStrong(poster.credits.text, poster.credits.strong)}</p>
      <ul class="poster__links list-plain">${poster.links.map((link) => html`<li>${link}</li>`)}</ul>
    </div>
    <ul class="poster__logos list-plain">
      ${poster.logos.map(
        (logo) => html`<li>
          <img src="${logo.src}" alt="${logo.name}" width="${logo.width}" height="${logo.height}" loading="lazy" decoding="async" />
        </li>`,
      )}
    </ul>
  </footer>
</article>`;
}

const IMAGE_SIZES = '(max-width: 64rem) 100vw, 48rem';

/** La riproduzione fedele del foglio distribuito in paese. */
export function posterImage(poster: Poster, options: { loading?: 'eager' | 'lazy' } = {}): Html {
  const image = poster.image;
  const stem = image.src.replace(/-\d+\.webp$/, '');
  const srcset = image.widths.map((width) => `${stem}-${width}.webp ${width}w`).join(', ');
  return html`<img
    class="poster-image"
    src="${image.src}"
    srcset="${srcset}"
    sizes="${IMAGE_SIZES}"
    alt="${image.alt}"
    width="${image.width}"
    height="${image.height}"
    loading="${options.loading ?? 'lazy'}"
    decoding="async"
  />`;
}
