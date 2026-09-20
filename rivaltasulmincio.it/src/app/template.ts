import type { RenderedDocument } from './page';

/** Inserisce testa e corpo nel template `index.html` (segnaposto in commento). */
export function inject(template: string, page: RenderedDocument): string {
  return template
    .replace('<!--app-head-->', () => page.head)
    .replace('<!--app-html-->', () => page.html);
}
