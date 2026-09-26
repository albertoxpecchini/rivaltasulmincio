import { reducedMotion } from '../animations/config';
import { atlanteAutunno, type SimboloAutunno } from '../data/autunno';

/*
 * Lo sfondo d'autunno: foglie, frutti, funghi, animali e altre cose della
 * stagione che scendono dietro la pagina. Un solo <canvas> fisso sotto il
 * contenuto (stagione.css): i pannelli opachi lo coprono, il testo sulla
 * crema ci passa sopra. I disegni vengono da un atlante (scripts/
 * autunno-simboli.ts), scelto a 1x o 2x secondo lo schermo.
 *
 * Le foglie dominano per numero (peso dei fogli), ruzzolano e sfarfallano;
 * gli oggetti scendono più lenti, dondolando. Un vento lento le porta
 * tutte da una parte o dall'altra. La densità segue l'area della finestra,
 * dimezzata sotto i 768 px (ANIMATIONS.md «Mobile»); se i fotogrammi si
 * fanno lenti, il numero cala da solo.
 *
 * Non parte con «risparmio dati». Con «riduci movimento» disegna un solo
 * fotogramma fermo: le foglie ci sono, ma non si muovono. Si ferma quando
 * la scheda non è visibile.
 */

/** La finestra della stagione: dall'equinozio a poco prima del solstizio. */
const INIZIO = { mese: 9, giorno: 21 };
const FINE = { mese: 12, giorno: 20 };

const PIXEL_PER_SIMBOLO = 8000;
const PIXEL_PER_SIMBOLO_MOBILE = 9000;
const MINIMO = 16;
const MASSIMO = 240;
/** Lato massimo di un simbolo a schermo (px CSS): decide anche quale atlante serve. */
const LATO_MASSIMO = 76;
/** Sopra questa durata media del fotogramma (ms) si tolgono simboli. */
const FOTOGRAMMA_LENTO = 26;

interface Particella {
  simbolo: SimboloAutunno;
  foglia: boolean;
  /** Profondità 0,45–1: vicino è grande, opaco e veloce. */
  z: number;
  x: number;
  y: number;
  /** Lato maggiore a schermo, in px CSS. */
  lato: number;
  w: number;
  h: number;
  alpha: number;
  /** Velocità di caduta (px/s), già scalata per z. */
  vy: number;
  rot: number;
  /** Velocità angolare (rad/s) per le foglie, ampiezza del dondolio per gli oggetti. */
  rotV: number;
  ondaA: number;
  ondaF: number;
  fase: number;
  /** Frequenza dello sfarfallio (ribaltamento apparente) delle foglie. */
  battito: number;
}

export function inStagione(data: Date): boolean {
  const giorno = (data.getMonth() + 1) * 100 + data.getDate();
  return giorno >= INIZIO.mese * 100 + INIZIO.giorno && giorno <= FINE.mese * 100 + FINE.giorno;
}

export function mountStagione(root: HTMLElement): void {
  if (!inStagione(new Date())) return;
  const connessione = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connessione?.saveData === true) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  root.append(canvas);

  // L'atlante 1x ha celle da 128 px: basta finché il simbolo più grande, in pixel veri, ci sta dentro.
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const scala = dpr * LATO_MASSIMO > atlanteAutunno.cella ? 2 : 1;
  const atlante = new Image();
  atlante.decoding = 'async';
  atlante.src = `/foto/autunno/simboli-${scala}x.avif`;
  atlante
    .decode()
    .then(() => avvia(root, canvas, ctx, atlante, scala, dpr))
    .catch(() => root.remove());
}

function avvia(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  atlante: HTMLImageElement,
  scala: number,
  dpr: number,
): void {
  const fermo = reducedMotion();
  const mobile = window.matchMedia('(max-width: 767px)');
  const estratti = estrazione();
  let particelle: Particella[] = [];
  let larghezza = 0;
  let altezza = 0;

  function misura(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === larghezza && h === altezza) return;
    const rapporto = larghezza > 0 ? w / larghezza : 1;
    larghezza = w;
    altezza = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const perSimbolo = mobile.matches ? PIXEL_PER_SIMBOLO_MOBILE : PIXEL_PER_SIMBOLO;
    let quante = Math.round((w * h) / perSimbolo);
    if (fermo) quante = Math.round(quante * 0.6);
    quante = Math.min(MASSIMO, Math.max(MINIMO, quante));

    for (const p of particelle) p.x *= rapporto;
    while (particelle.length > quante) particelle.pop();
    while (particelle.length < quante) particelle.push(nuova(estratti, w, h, true));
  }

  function disegna(t: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Le vicine sopra le lontane.
    particelle.sort((a, b) => a.z - b.z);
    for (const p of particelle) {
      const sfarfallio = p.foglia ? 0.55 + 0.45 * Math.abs(Math.cos(t * p.battito + p.fase)) : 1;
      const cos = Math.cos(p.rot);
      const sin = Math.sin(p.rot);
      ctx.setTransform(dpr * cos * sfarfallio, dpr * sin * sfarfallio, -dpr * sin, dpr * cos, dpr * p.x, dpr * p.y);
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(
        atlante,
        p.simbolo.x * scala,
        p.simbolo.y * scala,
        p.simbolo.w * scala,
        p.simbolo.h * scala,
        -p.w / 2,
        -p.h / 2,
        p.w,
        p.h,
      );
    }
    ctx.globalAlpha = 1;
  }

  function muovi(dt: number, t: number): void {
    const vento = 18 * Math.sin(t * 0.11) + 12 * Math.sin(t * 0.037 + 1.3);
    for (const p of particelle) {
      p.y += p.vy * dt;
      p.x += (vento * p.z + Math.sin(t * p.ondaF + p.fase) * p.ondaA * p.ondaF) * dt;
      p.rot = p.foglia ? p.rot + p.rotV * dt : Math.sin(t * p.ondaF * 0.7 + p.fase) * p.rotV;

      const margine = p.lato;
      if (p.y > altezza + margine) {
        Object.assign(p, nuova(estratti, larghezza, altezza, false));
      } else if (p.x < -margine) {
        p.x = larghezza + margine;
      } else if (p.x > larghezza + margine) {
        p.x = -margine;
      }
    }
  }

  misura();
  let ultimo = performance.now();
  const partenza = ultimo;

  if (fermo) {
    // Un solo fotogramma: le foglie sono sparse sulla pagina e restano lì.
    disegna(0);
    window.addEventListener('resize', () => {
      misura();
      disegna(0);
    });
    return;
  }

  let richiesta = 0;
  let sommaFotogrammi = 0;
  let contati = 0;

  function passo(adesso: number): void {
    const dt = Math.min((adesso - ultimo) / 1000, 0.05);
    const t = (adesso - partenza) / 1000;
    ultimo = adesso;
    muovi(dt, t);
    disegna(t);

    // Se il dispositivo arranca, meno simboli: un quinto in meno per volta.
    sommaFotogrammi += adesso - ultimo + dt * 1000;
    contati += 1;
    if (contati >= 90) {
      if (sommaFotogrammi / contati > FOTOGRAMMA_LENTO && particelle.length > MINIMO) {
        particelle.length = Math.max(MINIMO, Math.round(particelle.length * 0.8));
      }
      sommaFotogrammi = 0;
      contati = 0;
    }
    richiesta = window.requestAnimationFrame(passo);
  }

  function riprendi(): void {
    if (richiesta !== 0) return;
    ultimo = performance.now();
    richiesta = window.requestAnimationFrame(passo);
  }

  function ferma(): void {
    if (richiesta === 0) return;
    window.cancelAnimationFrame(richiesta);
    richiesta = 0;
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? ferma() : riprendi()));

  let attesa = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(attesa);
    attesa = window.setTimeout(misura, 150);
  });

  root.dataset.stagioneAttiva = '';
  riprendi();
}

/** L'urna dei simboli: ogni disegno compare tante volte quanto pesa il suo foglio. */
function estrazione(): SimboloAutunno[] {
  const urna: SimboloAutunno[] = [];
  for (const simbolo of atlanteAutunno.simboli) {
    const peso = atlanteAutunno.fogli[simbolo.foglio]?.peso ?? 1;
    for (let i = 0; i < peso; i++) urna.push(simbolo);
  }
  return urna;
}

const caso = (min: number, max: number): number => min + Math.random() * (max - min);

/** Una particella nuova: ovunque nella pagina se `ovunque`, altrimenti sopra il bordo alto. */
function nuova(urna: SimboloAutunno[], larghezza: number, altezza: number, ovunque: boolean): Particella {
  const simbolo = urna[Math.floor(Math.random() * urna.length)]!;
  const foglia = atlanteAutunno.fogli[simbolo.foglio]?.movimento !== 'oggetto';
  const z = caso(0.45, 1);
  const lato = (foglia ? caso(28, LATO_MASSIMO) : caso(32, 68)) * z;
  const rapporto = simbolo.w / simbolo.h;
  const w = rapporto >= 1 ? lato : lato * rapporto;
  const h = rapporto >= 1 ? lato / rapporto : lato;
  const y = ovunque ? caso(-altezza * 0.1, altezza) : caso(-altezza * 0.25, -lato);
  return {
    simbolo,
    foglia,
    z,
    x: caso(-lato, larghezza + lato),
    y,
    lato,
    w,
    h,
    alpha: 0.35 + ((z - 0.45) / 0.55) * 0.5,
    vy: (foglia ? caso(34, 80) : caso(24, 50)) * z,
    rot: caso(0, Math.PI * 2),
    rotV: foglia ? caso(0.5, 1.6) * (Math.random() < 0.5 ? -1 : 1) : caso(0.15, 0.35),
    ondaA: caso(14, 44),
    ondaF: caso(0.35, 0.9),
    fase: caso(0, Math.PI * 2),
    battito: caso(0.8, 1.8),
  };
}
