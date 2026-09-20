import type { SearchEntry } from '../types';

/*
 * Ricerca lato client: miglioramento progressivo del modulo reso dal server
 * (`src/components/search.ts`). L'indice viene scaricato alla prima
 * interazione e filtrato localmente.
 */

const INDEX_URL = '/search-index.json';
const MAX_RESULTS = 10;
const DEBOUNCE_MS = 120;

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
}

function resultItem(entry: SearchEntry): HTMLLIElement {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = entry.url;

  const kind = document.createElement('span');
  kind.className = 'label search__kind';
  kind.textContent = entry.kind;

  const title = document.createElement('span');
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
