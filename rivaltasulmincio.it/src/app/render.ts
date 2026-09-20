import { renderDocument } from '../layouts/base';
import * as notFound from '../pages/not-found';
import type { RenderedDocument } from './page';
import { match, normalizePath } from './router';

/** Rende un URL in documento completo; i percorsi sconosciuti danno la pagina 404. */
export function render(url: string): RenderedDocument {
  const path = normalizePath(url);
  const hit = match(path);
  const result = hit ? hit.page.render({ path, params: hit.params }) : null;
  return result ? renderDocument(path, result) : renderNotFound(path);
}

export function renderNotFound(path = '/404'): RenderedDocument {
  return renderDocument(path, notFound.render());
}
