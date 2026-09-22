/*
 * Dal contenuto al testo semplice (CONTENT.md «TESTO SEMPLICE»).
 *
 * Serve a due cose che non vogliono markup: l'indice di ricerca, che deve
 * trovare una parola scritta dentro una tabella o un elenco, e l'estratto
 * automatico quando l'articolo non ne dichiara uno.
 */
import type { ContentBlock } from '../types';
import { parseContent } from './parse';

/** Il contenuto come testo continuo, senza segni di composizione. */
export function contentText(source: string): string {
  return blocksText(parseContent(source));
}

export function blocksText(blocks: ContentBlock[]): string {
  return blocks.map(blockText).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function blockText(block: ContentBlock): string {
  switch (block.kind) {
    case 'heading':
    case 'subtitle':
    case 'paragraph':
    case 'small':
      return plain(block.text);
    case 'quote':
      return [plain(block.text), block.cite ? plain(block.cite) : ''].filter(Boolean).join(' ');
    case 'list':
      return block.items.map(plain).join(' ');
    case 'table':
      return [...block.header, ...block.rows.flat()].map((cell) => plain(cell.text)).join(' ');
    case 'note':
      return [block.title ? plain(block.title) : '', plain(block.text)].filter(Boolean).join(' ');
    /*
     * Il codice resta fuori dalla ricerca: cercare «const» non deve portare a
     * un articolo sulla sagra.
     */
    case 'code':
      return '';
  }
}

/** Toglie i segni della composizione in riga, tenendo le parole. */
function plain(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => label.trim() || url)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Estratto ricavato dal contenuto: le prime frasi del primo paragrafo vero.
 * Usato solo quando l'articolo non dichiara `excerpt` (JOURNAL.md «EXCERPT»:
 * un estratto scritto a mano non va mai sovrascritto).
 */
export function autoExcerpt(source: string, limit = 180): string {
  const first = parseContent(source).find((block) => block.kind === 'paragraph');
  if (!first) return '';
  const text = plain(first.kind === 'paragraph' ? first.text : '');
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return stop > limit * 0.5 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}
