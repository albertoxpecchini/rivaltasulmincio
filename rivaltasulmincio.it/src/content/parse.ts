/*
 * Dal testo dell'articolo ai blocchi (CONTENT.md «BLOCCHI»).
 *
 * Il dialetto è Markdown ristretto: riconosce i costrutti che servono al
 * giornale e nient'altro. Quello che non riconosce resta un paragrafo, mai
 * un errore: un articolo scritto male si legge comunque.
 */
import type { ContentBlock, TableCell } from '../types';

/** Righe che aprono un blocco non testuale. */
const HEADING = /^(#{1,3})\s+(.*)$/;
const SUBTITLE = /^%%\s+(.*)$/;
const NOTE = /^>>\s*(?:\[([^\]\n]+)\]\s*)?(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBER = /^(\d+)[.)]\s+(.*)$/;
const FENCE = /^```\s*([\w-]*)\s*$/;
const TABLE_ROW = /^\|(.*)\|\s*$/;
const TABLE_RULE = /^\|[\s:|-]+\|\s*$/;
const SMALL = /^\/\/\s+(.*)$/;

/** Il testo di un articolo, in blocchi. */
export function parseContent(source: string): ContentBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ContentBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (!line.trim()) continue;

    // Blocco di codice: tutto quello che sta dentro è letterale, fino alla chiusura.
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      let closed = false;
      for (i++; i < lines.length; i++) {
        if (FENCE.test(lines[i] ?? '')) {
          closed = true;
          break;
        }
        code.push(lines[i] ?? '');
      }
      // Una recinzione mai chiusa arriva in fondo: meglio il testo che il silenzio.
      if (!closed || code.length) {
        blocks.push({ kind: 'code', language: fence[1] || undefined, code: code.join('\n') });
      }
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ kind: 'heading', level: (heading[1] ?? '#').length as 1 | 2 | 3, text: heading[2] ?? '' });
      continue;
    }

    const subtitle = SUBTITLE.exec(line);
    if (subtitle) {
      blocks.push({ kind: 'subtitle', text: subtitle[1] ?? '' });
      continue;
    }

    const small = SMALL.exec(line);
    if (small) {
      const text = [small[1] ?? ''];
      while (SMALL.test(lines[i + 1] ?? '')) text.push(SMALL.exec(lines[++i] ?? '')?.[1] ?? '');
      blocks.push({ kind: 'small', text: text.join(' ') });
      continue;
    }

    // Nota: `>> [Titolo] testo`, eventualmente su più righe.
    const note = NOTE.exec(line);
    if (note) {
      const text = [note[2] ?? ''];
      while (NOTE.test(lines[i + 1] ?? '')) text.push(NOTE.exec(lines[++i] ?? '')?.[2] ?? '');
      blocks.push({ kind: 'note', title: note[1]?.trim() || undefined, text: text.join(' ').trim() });
      continue;
    }

    // Citazione: righe `>` di seguito; l'ultima `> — Autore` è l'attribuzione.
    if (QUOTE.test(line)) {
      const rows: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i] ?? '')) rows.push(QUOTE.exec(lines[i++] ?? '')?.[1] ?? '');
      i--;
      let cite: string | undefined;
      const last = rows[rows.length - 1]?.trim() ?? '';
      if (/^(—|--)\s*\S/.test(last)) {
        cite = last.replace(/^(—|--)\s*/, '').trim();
        rows.pop();
      }
      blocks.push({ kind: 'quote', text: paragraph(rows), cite });
      continue;
    }

    // Elenchi: puntato e numerato. Una voce può continuare sulla riga rientrata.
    const bullet = BULLET.exec(line);
    const numbered = NUMBER.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const start = ordered ? Number(numbered?.[1]) : undefined;
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i] ?? '';
        const item = ordered ? NUMBER.exec(current) : BULLET.exec(current);
        if (item) {
          items.push((ordered ? item[2] : item[1]) ?? '');
          i++;
          continue;
        }
        // Continuazione rientrata della voce precedente.
        if (/^\s+\S/.test(current) && items.length) {
          items[items.length - 1] += ` ${current.trim()}`;
          i++;
          continue;
        }
        break;
      }
      i--;
      blocks.push({ kind: 'list', ordered, start: start && start !== 1 ? start : undefined, items });
      continue;
    }

    // Tabella: righe fra barre verticali; la seconda, fatta di trattini, fissa l'allineamento.
    if (TABLE_ROW.test(line) && TABLE_RULE.test(lines[i + 1] ?? '')) {
      const header = cells(line);
      const align = alignments(lines[++i] ?? '');
      const rows: TableCell[][] = [];
      while (TABLE_ROW.test(lines[i + 1] ?? '')) rows.push(cells(lines[++i] ?? ''));
      /*
       * La griglia la detta l'intestazione: le righe corte si completano con
       * celle vuote, quelle lunghe si tagliano. Una tabella storta nel testo
       * non deve diventare una tabella rotta nella pagina.
       */
      const width = header.length;
      const quadrate = rows.map((row) =>
        Array.from({ length: width }, (_, column) => row[column] ?? { text: '' }),
      );
      blocks.push({ kind: 'table', header, align, rows: quadrate });
      continue;
    }

    // Paragrafo: fino alla riga vuota o al prossimo blocco riconosciuto.
    const rows = [line];
    while (i + 1 < lines.length) {
      const next = lines[i + 1] ?? '';
      if (!next.trim() || opensBlock(next)) break;
      rows.push(next);
      i++;
    }
    blocks.push({ kind: 'paragraph', text: paragraph(rows) });
  }

  return blocks;
}

/** Vero quando la riga comincia un blocco: un paragrafo non se la tira dentro. */
function opensBlock(line: string): boolean {
  return (
    HEADING.test(line) ||
    SUBTITLE.test(line) ||
    SMALL.test(line) ||
    NOTE.test(line) ||
    QUOTE.test(line) ||
    BULLET.test(line) ||
    NUMBER.test(line) ||
    FENCE.test(line) ||
    TABLE_ROW.test(line)
  );
}

/** Righe unite in un paragrafo: l'a capo singolo non conta, come in Markdown. */
function paragraph(rows: string[]): string {
  return rows.map((row) => row.trim()).join(' ').trim();
}

/** Le celle di una riga di tabella; `!` in testa marca la cella come intestazione di riga. */
function cells(line: string): TableCell[] {
  return (TABLE_ROW.exec(line)?.[1] ?? '').split('|').map((cell) => {
    const text = cell.trim();
    return text.startsWith('!') ? { text: text.slice(1).trim(), header: true } : { text };
  });
}

/** `|---|---:|:--:|` → allineamento per colonna. I due punti dicono da che parte. */
function alignments(rule: string): ('left' | 'right' | 'center')[] {
  return (TABLE_ROW.exec(rule)?.[1] ?? '').split('|').map((cell) => {
    const text = cell.trim();
    if (text.startsWith(':') && text.endsWith(':')) return 'center';
    if (text.endsWith(':')) return 'right';
    return 'left';
  });
}
