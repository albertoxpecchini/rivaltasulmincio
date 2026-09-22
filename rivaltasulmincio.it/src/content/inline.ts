/*
 * Composizione in riga (CONTENT.md «TESTO IN RIGA»).
 *
 * Riconosce, dentro un paragrafo, una cella o una voce di elenco:
 *
 *   **forte**      → <strong>
 *   *enfasi*       → <em>
 *   `codice`       → <code class="code">
 *   [testo](url)   → <a>, con rel/target quando il link esce dal sito
 *   [[badge]]      → <span class="tag">
 *
 * Tutto il resto è testo, e come testo viene escapato: nel corpo di un
 * articolo non entra mai HTML scritto a mano (JOURNAL.md «SICUREZZA»).
 */
import { escape, raw, type Html } from '../lib/html';

/** Protocolli ammessi in un collegamento. Nessun `javascript:`, nessun `data:`. */
const SAFE_PROTOCOL = /^(https?:|mailto:|tel:)/i;

/**
 * Un URL sicuro da mettere in `href`, oppure `null` se non lo è.
 * I percorsi interni (`/giornale/...`, `#nota`) passano; gli schemi no.
 */
export function safeUrl(url: string): string | null {
  const value = url.trim();
  if (!value) return null;
  if (value.startsWith('/') || value.startsWith('#')) return value;
  if (SAFE_PROTOCOL.test(value)) return value;
  return null;
}

/** Un collegamento esce dal sito quando punta al web: va aperto in sicurezza. */
export function isExternal(url: string): boolean {
  return /^https?:/i.test(url.trim());
}

/*
 * Un solo passaggio sulla riga, con le alternative in ordine di precedenza.
 * `codice` viene per primo: dentro non si formatta nulla.
 *
 * Nell'URL è ammessa una coppia di parentesi annidata, perché compaiono negli
 * indirizzi reali (le voci di Wikipedia, per esempio).
 *
 * L'enfasi vuole testo attaccato agli asterischi: `*parola*` è corsivo,
 * `3 * 4` resta una moltiplicazione.
 */
const TOKEN =
  /(`[^`\n]+`)|(\[\[([^\]\n]+)\]\])|(\[([^\]\n]*)\]\(((?:[^()\s]|\([^()\s]*\))*)\))|(\*\*(\S(?:[^*\n]*\S)?)\*\*)|(\*(\S(?:[^*\n]*\S)?)\*)/g;

/** Trasforma una riga di testo in markup, lasciando intatto quello che non riconosce. */
export function inline(text: string): Html {
  let out = '';
  let last = 0;

  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    out += escape(text.slice(last, at));
    last = at + match[0].length;

    const [, code, , badge, whole, label, url, , strong, , em] = match;

    if (code) {
      out += `<code class="code">${escape(code.slice(1, -1))}</code>`;
    } else if (badge) {
      out += `<span class="tag">${escape(badge.trim())}</span>`;
    } else if (whole !== undefined) {
      out += link(label ?? '', url ?? '', whole);
    } else if (strong) {
      out += `<strong>${inline(strong).value}</strong>`;
    } else if (em) {
      out += `<em>${inline(em).value}</em>`;
    }
  }

  out += escape(text.slice(last));
  return raw(out);
}

/**
 * Collegamento. Quando l'URL non è sicuro la scrittura resta com'era, visibile
 * e innocua: così l'errore si vede e si corregge, invece di sparire in un
 * testo che sembra giusto.
 */
function link(label: string, url: string, whole: string): string {
  const href = safeUrl(url);
  if (!href) return escape(whole);
  const attrs = isExternal(href) ? ' rel="noopener noreferrer"' : '';
  return `<a href="${escape(href)}"${attrs}>${inline(label.trim() || url).value}</a>`;
}
