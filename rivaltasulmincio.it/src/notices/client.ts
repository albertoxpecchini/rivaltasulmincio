import { motion, reducedMotion } from '../animations/config';

/*
 * Striscia d'avviso a comparsa (src/components/notice.ts). Arriva dopo un po'
 * di lettura, oppure prima se il puntatore sale fino al bordo alto della
 * finestra, verso schede e barra degli indirizzi: chi sta per andarsene la
 * vede comunque. Sui touch conta solo il tempo. Si chiude con la × o con Esc,
 * e il browser ricorda la chiusura per quell'avviso; uno nuovo ricompare.
 */
const DELAY_MS = 8000;
const TOP_EDGE_PX = 16;

export function mountNoticeBar(bar: HTMLElement): void {
  if (Date.parse(bar.dataset.validUntil ?? '') <= Date.now()) {
    bar.remove();
    return;
  }
  if (wasClosed(bar.id)) return;

  const onMove = (event: MouseEvent): void => {
    if (event.clientY <= TOP_EDGE_PX) open();
  };
  const onLeave = (event: MouseEvent): void => {
    if (event.clientY <= 0) open();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close();
  };

  const timer = window.setTimeout(open, DELAY_MS);
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
  }

  function open(): void {
    window.clearTimeout(timer);
    document.removeEventListener('mousemove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    if (!bar.hidden) return;
    bar.hidden = false;
    document.addEventListener('keydown', onKey);
    if (!reducedMotion()) {
      bar.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], {
        duration: motion.duration.slow,
        easing: motion.ease.enter,
      });
    }
  }

  function close(): void {
    document.removeEventListener('keydown', onKey);
    remember(bar.id);
    const hide = (): void => {
      bar.hidden = true;
    };
    if (reducedMotion()) return hide();
    bar
      .animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], {
        duration: motion.duration.normal,
        easing: motion.ease.standard,
      })
      .finished.then(hide, hide);
  }

  bar.querySelector('[data-notice-close]')?.addEventListener('click', close);
}

// Il browser può negare lo storage (navigazione privata, dati bloccati): allora l'avviso torna a ogni pagina.
function wasClosed(id: string): boolean {
  try {
    return window.localStorage.getItem(`chiuso:${id}`) !== null;
  } catch {
    return false;
  }
}

function remember(id: string): void {
  try {
    window.localStorage.setItem(`chiuso:${id}`, new Date().toISOString());
  } catch {
    // Niente da ricordare: la chiusura vale per questa pagina.
  }
}
