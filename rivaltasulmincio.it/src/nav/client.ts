/*
 * Menu della testata (RESPONSIVE.md «Matrice navigazione»): sotto i 768 px la
 * navigazione si apre da un pulsante, chiusa di default; da 768 in su le voci
 * sono sempre visibili e lo stato qui impostato non ha effetto (CSS).
 * Senza JavaScript il pulsante resta nascosto e le voci restano in vista.
 */
export function mountMenu(button: HTMLElement): void {
  const header = button.closest<HTMLElement>('.site-header');
  const controls = button.getAttribute('aria-controls');
  const nav = controls ? document.getElementById(controls) : null;
  if (!header || !nav) return;

  const set = (open: boolean): void => {
    header.dataset.menu = open ? 'open' : 'closed';
    button.setAttribute('aria-expanded', String(open));
  };

  set(false);
  button.hidden = false;

  button.addEventListener('click', () => set(header.dataset.menu !== 'open'));

  header.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || header.dataset.menu !== 'open') return;
    set(false);
    button.focus();
  });

  document.addEventListener('click', (event) => {
    if (header.dataset.menu === 'open' && !header.contains(event.target as Node | null)) set(false);
  });
}
