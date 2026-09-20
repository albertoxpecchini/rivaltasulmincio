/*
 * Entry lato client: l'HTML arriva già completo dal build, qui si montano
 * solo i miglioramenti progressivi. Ogni sistema (ricerca, mappa, meteo…)
 * si aggancia a un attributo `data-*` del proprio markup.
 */
import { mountSearch } from './search/client';

for (const form of document.querySelectorAll<HTMLElement>('[data-search]')) {
  mountSearch(form);
}
