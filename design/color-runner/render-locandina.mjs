/* Riesporta la locandina della Color Runner senza Claude Design.
 *
 *   node design/color-runner/render-locandina.mjs
 *
 * Sorgente:  design/color-runner/locandina.render.html
 *            (copia standalone di locandina.dc.html, font inclusi: nessuna rete)
 * Uscite:    assets/foto/color-runner-locandina.webp   1240 x 1754
 *            assets/color-runner-locandina.pdf          A4, una pagina
 *
 * Serve Chrome o Edge (cerca da solo i percorsi soliti su Windows/macOS/Linux;
 * si puo forzare con CHROME_PATH) e il pacchetto `sharp` (devDependency).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, copyFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const SRC = join(here, "locandina.render.html");
const OUT_WEBP = join(repo, "assets", "foto", "color-runner-locandina.webp");
const OUT_PDF = join(repo, "assets", "color-runner-locandina.pdf");
const WIDTH = 1240;
const HEIGHT = 1754;

function trovaBrowser() {
  const candidati = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const p of candidati) if (existsSync(p)) return p;
  throw new Error(
    "Chrome/Edge non trovato. Installane uno o passa CHROME_PATH=/percorso/al/browser.",
  );
}

async function caricaSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    throw new Error("Manca `sharp`. Da radice progetto: npm install");
  }
}

function chrome(browser, args) {
  execFileSync(browser, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    // niente rete: i font sono gia dentro l'HTML
    "--host-resolver-rules=MAP * ~NOTFOUND",
    "--virtual-time-budget=15000",
    "--run-all-compositor-stages-before-draw",
    ...args,
  ], { stdio: ["ignore", "ignore", "inherit"] });
}

if (!existsSync(SRC)) throw new Error(`Sorgente mancante: ${SRC}`);
const browser = trovaBrowser();
const sharp = await caricaSharp();
const srcUrl = pathToFileURL(SRC).href;
const tmp = mkdtempSync(join(tmpdir(), "cr-loc-"));
const pngTmp = join(tmp, "shot.png");

try {
  console.log(`browser  ${browser}`);
  console.log(`sorgente ${SRC}`);

  // PDF: pagina A4 vera, senza intestazioni del browser
  chrome(browser, ["--no-pdf-header-footer", `--print-to-pdf=${OUT_PDF}`, srcUrl]);

  // PNG: A4 a 96dpi (794x1123) per 2 = 1588x2246, poi ridotto a 1240x1754
  chrome(browser, [
    "--force-device-scale-factor=2",
    "--window-size=794,1123",
    `--screenshot=${pngTmp}`,
    srcUrl,
  ]);
  if (!existsSync(pngTmp)) throw new Error("lo screenshot non e stato creato");

  const info = await sharp(pngTmp)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .webp({ quality: 82, effort: 6 })
    .toFile(OUT_WEBP);

  const kb = (p) => (statSync(p).size / 1024).toFixed(0);
  console.log(`\nok`);
  console.log(`  ${OUT_WEBP}  ${info.width}x${info.height}  ${kb(OUT_WEBP)} KB`);
  console.log(`  ${OUT_PDF}  A4  ${kb(OUT_PDF)} KB`);
  console.log(`\nControlla le due uscite, poi committa.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
