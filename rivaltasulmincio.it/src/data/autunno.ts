import atlanteJson from '../../data/autunno/simboli.json';

/**
 * I simboli dell'autunno: novanta disegni (foglie, frutti, animali, cose
 * della stagione) montati in un atlante. Li produce
 * `scripts/autunno-simboli.ts`; li anima `src/stagione/autunno.ts`.
 */
export interface FoglioAutunno {
  nome: string;
  /** Le foglie ruzzolano e sfarfallano; gli oggetti scendono dondolando. */
  movimento: 'foglia' | 'oggetto';
  /** Frequenza relativa nello sfondo: le foglie devono dominare. */
  peso: number;
}

export interface SimboloAutunno {
  nome: string;
  /** Indice in `fogli`. */
  foglio: number;
  /** Rettangolo nell'atlante 1x; nel 2x è tutto doppio. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AtlanteAutunno {
  /** Lato della cella a 1x. */
  cella: number;
  colonne: number;
  righe: number;
  fogli: FoglioAutunno[];
  simboli: SimboloAutunno[];
}

export const atlanteAutunno: AtlanteAutunno = atlanteJson as AtlanteAutunno;
