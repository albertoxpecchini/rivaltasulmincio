/*
 * Template HTML con escape automatico.
 *
 *   html`<p>${testo}</p>`   → il valore viene sempre escapato
 *   raw(stringa)            → inserisce HTML già sicuro (usare solo per markup generato dal progetto)
 *
 * Valori ammessi nelle interpolazioni: stringhe, numeri, Html, array di questi,
 * null/undefined/false (renderizzati come stringa vuota).
 */
export class Html {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escape(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function raw(markup: string): Html {
  return new Html(markup);
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): Html {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) out += render(values[i]);
  }
  return new Html(out);
}

function render(value: unknown): string {
  if (value == null || value === false) return '';
  if (value instanceof Html) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escape(String(value));
}
