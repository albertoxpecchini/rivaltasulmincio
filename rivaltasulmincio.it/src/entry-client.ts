/*
 * Entry lato client: l'HTML arriva già completo dal build, qui si montano
 * solo i miglioramenti progressivi. Ogni sistema si aggancia a un attributo
 * `data-*` del proprio markup; la mappa viene caricata (codice e stile)
 * soltanto quando entra nel viewport.
 */
import { mountCount } from './animations/count';
import { mountReveal } from './animations/reveal';
import { mountMenu } from './nav/client';
import { mountNoticeBar } from './notices/client';
import { mountSearch, mountShortcut } from './search/client';

for (const button of document.querySelectorAll<HTMLElement>('[data-menu-toggle]')) {
  mountMenu(button);
}

for (const form of document.querySelectorAll<HTMLElement>('[data-search]')) {
  mountSearch(form);
}
mountShortcut();

for (const bar of document.querySelectorAll<HTMLElement>('[data-notice-bar]')) {
  mountNoticeBar(bar);
}

// Motion (ANIMATIONS.md): reveal delle sezioni e contatori dei numeri, solo sotto la piega.
mountReveal();
mountCount();

const weather = [...document.querySelectorAll<HTMLElement>('[data-weather]')];
if (weather.length > 0) {
  void import('./weather/client').then(({ mountWeather }) => weather.forEach((element) => void mountWeather(element)));
}

/*
 * Mappe. Con «risparmio dati» attivo (RESPONSIVE.md «Connessione lenta») le
 * mappe secondarie, in Home e nelle schede, aspettano un tocco; la mappa di
 * /mappa è il contenuto principale della pagina e si carica comunque.
 */
const maps = [...document.querySelectorAll<HTMLElement>('[data-map]')];
if (maps.length > 0) {
  const mount = (elements: HTMLElement[]): void => {
    void import('./map/mount').then(({ mountMap }) => elements.forEach((element) => void mountMap(element)));
  };

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const deferred = saveData ? maps.filter((element) => element.dataset.map !== 'full') : [];
  const eager = maps.filter((element) => !deferred.includes(element));

  for (const element of deferred) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--secondary';
    button.textContent = 'Mostra la mappa';
    button.addEventListener('click', () => mount([element]), { once: true });
    const notice = element.querySelector('[data-map-noscript]');
    if (notice) notice.replaceWith(button);
    else element.querySelector('.map-canvas__fallback')?.append(' ', button);
  }

  if (eager.length > 0) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          mount(eager);
        },
        { rootMargin: '200px' },
      );
      eager.forEach((element) => observer.observe(element));
    } else {
      mount(eager);
    }
  }
}
