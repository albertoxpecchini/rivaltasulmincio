import { belowViewport, motion, reducedMotion } from './config';

/*
 * Contatore (ANIMATIONS.md «Numeri», «Counter»): i numeri principali
 * `[data-count]` sotto la piega contano da 0 al valore reale quando entrano
 * nel viewport. Il valore reale resta sempre nel markup (copia nascosta alla
 * vista, letta dagli screen reader); qui si anima solo la copia visibile.
 * L'ultimo fotogramma scrive il numero esatto, formattato come dal server.
 */
const format = new Intl.NumberFormat('it-IT');

export function mountCount(root: ParentNode = document): void {
  if (reducedMotion() || !('IntersectionObserver' in window)) return;

  const pending = [...root.querySelectorAll<HTMLElement>('[data-count]')].filter((element) => {
    const value = Number(element.dataset.count);
    return Number.isFinite(value) && element.querySelector('[data-count-value]') && belowViewport(element);
  });
  if (pending.length === 0) return;

  for (const element of pending) {
    const target = element.querySelector<HTMLElement>('[data-count-value]');
    if (target) target.textContent = format.format(0);
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      count(entry.target as HTMLElement);
    }
  });
  for (const element of pending) observer.observe(element);
}

function count(element: HTMLElement): void {
  const target = element.querySelector<HTMLElement>('[data-count-value]');
  const value = Number(element.dataset.count);
  if (!target) return;
  const start = performance.now();
  const step = (now: number): void => {
    const progress = Math.min((now - start) / motion.duration.count, 1);
    const eased = 1 - (1 - progress) ** 3; // power3.out
    target.textContent = format.format(progress < 1 ? Math.round(value * eased) : value);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
