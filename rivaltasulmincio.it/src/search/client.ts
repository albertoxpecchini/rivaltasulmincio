import type { SearchEntry } from '../types';

/*
 * Ricerca lato client: miglioramento progressivo del modulo reso dal server
 * (`src/components/search.ts`). L'indice viene scaricato alla prima
 * interazione e filtrato localmente. Ctrl K (⌘ K su Mac) porta al campo,
 * da qualunque pagina (STYLE.md «SEARCH»).
 */

const INDEX_URL = '/search-index.json';
const MAX_RESULTS = 10;
const DEBOUNCE_MS = 120;
const SEARCH_PAGE = '/#ricerca';

let shortcutMounted = false;

export function mountSearch(form: HTMLElement): void {
  const input = form.querySelector<HTMLInputElement>('input[type="search"]');
  const status = form.querySelector<HTMLElement>('[data-search-status]');
  const results = form.querySelector<HTMLElement>('[data-search-results]');
  if (!input || !status || !results) return;

  let entries: SearchEntry[] | null = null;
  let loading: Promise<void> | null = null;
  let failed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const load = (): Promise<void> => {
    loading ??= fetch(INDEX_URL, { headers: { accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((list) => {
        entries = list;
      })
      .catch(() => {
        failed = true;
      });
    return loading;
  };

  const show = (hits: SearchEntry[], message: string): void => {
    status.textContent = message;
    results.replaceChildren(...hits.map(resultItem));
    results.hidden = hits.length === 0;
  };

  const run = async (): Promise<void> => {
    const terms = normalize(input.value).split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      show([], '');
      return;
    }
    await load();
    if (failed || !entries) {
      show([], 'Ricerca non disponibile al momento.');
      return;
    }
    const hits = entries
      .filter((entry) => {
        const haystack = normalize(`${entry.title} ${entry.text}`);
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, MAX_RESULTS);
    show(hits, hits.length === 0 ? 'Nessun risultato.' : `${hits.length} ${hits.length === 1 ? 'risultato' : 'risultati'}`);
  };

  input.addEventListener('focus', () => void load(), { once: true });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), DEBOUNCE_MS);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      show([], '');
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    void run();
  });

  mountShortcut();
}

/**
 * Tasto rapido globale. Montato una volta sola: con un campo in pagina lo
 * mette a fuoco, altrimenti porta alla ricerca della Home. Le etichette
 * «Ctrl K» rese dal server diventano «⌘ K» sui sistemi Apple.
 */
export function mountShortcut(): void {
  if (shortcutMounted) return;
  shortcutMounted = true;

  const apple = /Mac|iPhone|iPad/.test(navigator.platform);
  if (apple) {
    for (const kbd of document.querySelectorAll('[data-search-kbd]')) kbd.textContent = '⌘ K';
  }

  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || event.altKey) return;
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('[data-search] input[type="search"]');
    if (input) {
      input.focus();
      input.select();
    } else {
      window.location.href = SEARCH_PAGE;
    }
  });
}

function resultItem(entry: SearchEntry): HTMLLIElement {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = entry.url;

  const kind = document.createElement('span');
  kind.className = 'tag tag--muted search__kind';
  kind.textContent = entry.kind;

  const title = document.createElement('span');
  title.className = 'search__title';
  title.textContent = entry.title;

  link.append(kind, title);
  item.append(link);
  return item;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
