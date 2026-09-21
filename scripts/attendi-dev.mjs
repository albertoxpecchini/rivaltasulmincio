/*
 * Aspetta che il server di sviluppo risponda davvero, poi esce.
 *
 * Serve a F5: il task «dev» resta acceso in background, e VS Code non ha
 * modo di sapere quando Vite è pronto se non leggendo l'output — che è
 * colorato, cambia fra una versione e l'altra e va in pezzi in silenzio.
 * Qui invece si interroga la porta: o la pagina risponde, o non risponde.
 *
 * Il plugin `atlante` serve HTML solo a chi lo chiede, quindi la prova
 * manda l'intestazione «Accept: text/html» come farebbe un browser.
 */
const url = process.argv[2] ?? 'http://localhost:5173/';
const limiteMs = Number(process.argv[3] ?? 90_000);
const scaduto = Date.now() + limiteMs;

const attendi = (ms) => new Promise((r) => setTimeout(r, ms));

while (Date.now() < scaduto) {
  try {
    const risposta = await fetch(url, { headers: { accept: 'text/html' } });
    if (risposta.ok) {
      console.log(`pronto: ${url} risponde ${risposta.status}`);
      process.exit(0);
    }
  } catch {
    // non ancora in ascolto: si riprova
  }
  await attendi(250);
}

console.error(
  `il server non ha risposto su ${url} entro ${Math.round(limiteMs / 1000)}s.\n` +
    `Guarda il pannello Terminale, scheda «dev»: se dice «Port 5173 is already in use»\n` +
    `c'è un altro server acceso; chiudilo (cestino nel Terminale) e ripremi F5.`,
);
process.exit(1);
