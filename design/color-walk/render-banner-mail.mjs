/* Ritaglia dal banner della Color Walk la testata delle mail.
 *
 *   node design/color-walk/render-banner-mail.mjs   (o `npm run render:banner-mail`)
 *
 * Sorgente:  assets/foto/color-walk-banner.webp        2400 x 900
 * Uscita:    assets/foto/color-walk-banner-mail.jpg    1200 x 330
 *
 * ── Perché un file a parte e non il banner così com'è ────────────────────
 * Il banner intero è largo 2400 e in una mail sta dentro una lastra da 600:
 * in fondo alla tavola c'è la riga di chi organizza, in corpo minuto, e a
 * quella scala diventa pettine invece che testo. È anche una cosa che la
 * mail dice già a parole, e meglio. Quindi della tavola si prende la parte
 * alta e si lascia fuori il piede.
 *
 * ── Perché JPEG e non il webp ────────────────────────────────────────────
 * Outlook su Windows disegna col motore di Word, che il webp non lo apre:
 * chi legge lì vedrebbe un rettangolo vuoto. Il JPEG lo aprono tutti.
 *
 * ── Quando si rifà ───────────────────────────────────────────────────────
 * Ogni volta che cambia il banner, e la misura del ritaglio va guardata di
 * nuovo insieme: è cieca, e una tavola nuova la sposta. È già successo.
 * Fino alla tavola del 6 settembre 2026 il taglio era a 380 pixel — lì
 * finiva la riga dei chip con data e orario, e sotto cominciavano le quote,
 * i tre riquadri e la fascia dei loghi, che a 600 pixel non si leggevano.
 * La tavola nuova ha un'altra impaginazione: a destra c'è una scheda sola
 * con dentro data, ora, luogo, le due quote e la riga dell'aperitivo, e
 * quella scheda a 600 pixel si legge ancora tutta. Tagliare a 380 la
 * avrebbe mozzata a metà. Adesso il taglio è a 660, che è dove la scheda
 * finisce e comincia il corpo minuto.
 *
 * L'uscita si controlla a occhio, come la locandina.
 */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const SRC = join(repo, "assets", "foto", "color-walk-banner.webp");
const OUT = join(repo, "assets", "foto", "color-walk-banner-mail.jpg");

/* L'altezza del ritaglio, in pixel del banner a grandezza naturale. Sotto
   questa riga comincia il corpo minuto di chi organizza, che alla larghezza
   di una mail non si legge più — e che la mail dice già a parole. */
const FASCIA = 660;
const LARGHEZZA = 1200; // 600 della lastra, per due: schermi a densità doppia

if (!existsSync(SRC)) throw new Error(`Sorgente mancante: ${SRC}`);

let sharp;
try {
  sharp = createRequire(join(repo, "package.json"))("sharp");
} catch {
  throw new Error("Manca `sharp`. Da radice progetto: npm install");
}

const { width, height } = await sharp(SRC).metadata();
if (height < FASCIA) throw new Error(`Il banner è alto ${height}px: meno del ritaglio (${FASCIA}px).`);

const info = await sharp(SRC)
  .extract({ left: 0, top: 0, width, height: FASCIA })
  .resize(LARGHEZZA)
  .jpeg({ quality: 84, chromaSubsampling: "4:4:4", mozjpeg: true })
  .toFile(OUT);

console.log(`ok  ${OUT}`);
console.log(`    ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} kB`);
console.log(`\nGuardala, poi rifai il build: la mail la prende da sé.`);
