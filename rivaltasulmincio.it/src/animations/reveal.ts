import { belowViewport, motion, reducedMotion } from './config';

/*
 * Reveal (ANIMATIONS.md «Reveal», STYLE.md «ANIMAZIONI»): gli elementi
 * `[data-reveal]` ancora sotto la piega entrano con opacità e un breve
 * spostamento verticale quando arrivano nel viewport. Ciò che è già in vista
 * al caricamento non viene toccato: niente sfarfallio, niente CLS. Con
 * reduced motion o senza IntersectionObserver non succede nulla.
 */
const SAFETY_MS = 4000;

export function mountReveal(root: ParentNode = document): void {
  if (reducedMotion() || !('IntersectionObserver' in window)) return;

  const pending = [...root.querySelectorAll<HTMLElement>('[data-reveal]')].filter(belowViewport);
  if (pending.length === 0) return;

  for (const element of pending) element.style.opacity = '0';

  const observer = new IntersectionObserver(
    (entries) => {
      let index = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        element.style.opacity = '';
        element.animate(
          [
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: motion.duration.slow, easing: motion.ease.enter, delay: index * motion.stagger, fill: 'backwards' },
        );
        index += 1;
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const element of pending) observer.observe(element);

  // Rete di sicurezza: nulla resta nascosto se l'osservatore non scatta.
  setTimeout(() => {
    for (const element of pending) if (element.style.opacity === '0') element.style.opacity = '';
  }, SAFETY_MS);
}
