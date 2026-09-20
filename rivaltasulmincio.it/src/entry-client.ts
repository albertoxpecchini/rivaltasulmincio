/*
 * Entry lato client: l'HTML arriva già completo dal build, qui si montano
 * solo i miglioramenti progressivi. Ogni sistema si aggancia a un attributo
 * `data-*` del proprio markup; la mappa viene caricata (codice e stile)
 * soltanto quando entra nel viewport.
 */
import { mountSearch } from './search/client';

for (const form of document.querySelectorAll<HTMLElement>('[data-search]')) {
  mountSearch(form);
}

const maps = [...document.querySelectorAll<HTMLElement>('[data-map]')];
if (maps.length > 0) {
  const load = (): void => {
    void import('./map/mount').then(({ mountMap }) => maps.forEach((element) => void mountMap(element)));
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: '200px' },
    );
    maps.forEach((element) => observer.observe(element));
  } else {
    load();
  }
}
