/*
 * Motion centralizzato (ANIMATIONS.md «Config»): stessi valori dei token CSS
 * in tokens.css, per le animazioni fatte con la Web Animations API. Nessun
 * valore sparso nei componenti.
 */
export const motion = {
  duration: {
    fast: 180,
    normal: 240,
    slow: 450,
    /** Contatori numerici (ANIMATIONS.md «Numeri»: 600–1000 ms). */
    count: 800,
  },
  ease: {
    standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    enter: 'cubic-bezier(0.19, 1, 0.22, 1)',
  },
  /** Ritardo tra elementi vicini (ANIMATIONS.md «Stagger»). */
  stagger: 60,
} as const;

export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** L'elemento sta sotto il bordo inferiore della finestra: può entrare animato senza sfarfallio. */
export function belowViewport(element: Element): boolean {
  return element.getBoundingClientRect().top >= window.innerHeight;
}
