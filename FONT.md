# FONT.md

## Scopo

Definisci gestione font per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Obiettivo:

* rendering stabile;
* look nativo;
* performance alta;
* piena leggibilità;
* nessuna dipendenza inutile da font esterni.

## Font principale

Usa stack di sistema:

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  "Noto Sans",
  sans-serif;
```

Non scaricare font esterni per contenuti normali.

## Priorità font

Ordine:

1. font sistema disponibile;
2. fallback sistema;
3. fallback sans-serif.

Browser deve scegliere automaticamente font nativo migliore disponibile.

## Apple

Su dispositivi Apple deve essere privilegiato font di sistema tramite:

```css
-apple-system
```

Non sostituire font sistema Apple con Google Fonts.

## Windows

Su Windows deve essere privilegiato:

```css
"Segoe UI"
```

## Linux

Usa:

```css
system-ui
```

con fallback definiti.

## Google Fonts

Non usare Google Fonts come dipendenza predefinita.

Non aggiungere:

```html
<link rel="preconnect" ...>
<link href="https://fonts.googleapis.com/..." ...>
```

solo per ottenere un font estetico.

Ridurre richieste esterne.

## Font locali

Usa font locali solo quando esiste una necessità concreta di brand identity.

Prima verificare:

* licenza;
* formato;
* subset;
* peso disponibile;
* caricamento;
* fallback.

Preferire:

```text
.woff2
```

Evitare font pesanti in formati legacy quando non necessari.

## Font loading

Quando font locali esistono:

```css
font-display: swap;
```

Non bloccare rendering pagina aspettando font.

## Numero di font

Massimo consigliato:

**2 famiglie**

Preferenza progetto:

**1 famiglia**

Usa variazioni di:

* peso;
* dimensione;
* tracking;
* line-height.

Non introdurre seconda famiglia solo per decorazione.

## Peso font

Usa principalmente:

```text
400
500
600
650
700
```

Non caricare tutti i pesi se non utilizzati.

Se font supporta solo pesi standard, usa quelli realmente disponibili.

## Variable fonts

Variable font preferibile quando:

* file unico sostituisce molti file;
* supporta pesi necessari;
* dimensione totale resta ragionevole.

Esempio:

```css
font-weight: 400 700;
```

Non usare assi variabili non necessari.

## Italic

Carica italic solo se realmente usato.

Non aggiungere variante italic completa per poche citazioni.

## Unicode range

Per font locali molto grandi, usa subset quando possibile.

Non includere alfabeti non necessari.

Il progetto utilizza principalmente:

```text
Latin
Latin Extended
```

## Icon font

Non usare icon font come sistema principale icone.

Preferire SVG.

Motivi:

* accessibilità migliore;
* controllo dimensione;
* colore indipendente;
* nessun mapping caratteri;
* rendering più prevedibile.

## Mappe

Le label della mappa possono usare font sistema.

Non caricare font separato solo per mappe salvo requisito tecnico.

Priorità:

* leggibilità;
* contrasto;
* dimensione;
* densità.

## Numeri

Usa font con numeri leggibili.

Per tabelle e statistiche:

```css
font-variant-numeric: tabular-nums;
```

Quando supportato, preferire numeri tabulari.

## Dati geografici

Coordinate, CAP, numeri civici e valori statistici devono mantenere rendering chiaro.

Esempio:

```text
45.16842, 10.66931
46040
2.847 abitanti
```

Evita font ornamentali.

## Lingua

Lingua principale:

```text
it-IT
```

Imposta correttamente:

```html
<html lang="it">
```

Font fallback deve gestire caratteri italiani senza sostituzioni visive incoerenti.

## Rendering

Usa:

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

solo quando testato visivamente.

Non applicare smoothing aggressivo se peggiora leggibilità.

## Text rendering

Non usare impostazioni sperimentali senza beneficio verificabile.

Evita:

```css
text-rendering: optimizeLegibility;
```

come regola globale senza test.

Browser moderni gestiscono rendering testo normalmente.

## Font synthesis

Quando appropriato:

```css
font-synthesis: none;
```

Usalo solo se font disponibili coprono realmente pesi e stili richiesti.

Non simulare pesi mancanti se risultato visivo è scadente.

## Fallback

Ogni font personalizzato deve avere fallback.

Esempio:

```css
font-family:
  "NomeFont",
  ui-sans-serif,
  system-ui,
  sans-serif;
```

Sito deve restare graficamente coerente anche quando font principale non viene caricato.

## Performance

Font budget ridotto.

Controlla:

* numero file;
* dimensione totale;
* numero pesi;
* numero richieste;
* cache;
* preload.

Non precaricare font non usati above-the-fold.

## Preload

Usa `preload` solo per font realmente critici.

Esempio:

```html
<link
  rel="preload"
  href="/fonts/example.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

Non precaricare intera libreria font.

## Cache

Font statici devono avere caching lunga durata quando filename contiene hash/versione.

Esempio:

```text
font-regular.a82d91.woff2
```

Evita cache infinita su file con nome invariabile se il contenuto può cambiare.

## CSS

Definisci font in un unico punto.

Esempio:

```css
:root {
  --font-family-base:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif;
}

html {
  font-family: var(--font-family-base);
}
```

Non ridefinire font casualmente nei componenti.

## Componenti

Tutti componenti devono ereditare font globale.

Override ammessi solo quando documentati.

Esempio valido:

```css
.map-label {
  font-family: var(--font-family-base);
}
```

Esempio da evitare:

```css
.card-title {
  font-family: SomeRandomFont;
}
```

## Logo

Logo può avere lettering proprietario.

Il font del logo non deve influenzare UI.

Logo SVG deve contenere geometria o tracciati quando necessario.

Non dipendere da font remoto per visualizzare logo.

## Titoli

Titoli usano stessa famiglia del resto del sito.

Gerarchia tramite:

* size;
* weight;
* tracking;
* line-height.

Non cambiare famiglia per creare contrasto.

## Testi editoriali

Corpo testo deve privilegiare comfort lettura.

Configurazione indicativa:

```css
.prose {
  max-width: 70ch;
  line-height: 1.55;
}
```

## Accessibilità

Verifica leggibilità con:

* zoom 200%;
* zoom 400% quando applicabile;
* display piccoli;
* display ad alta densità;
* modalità ad alto contrasto;
* font fallback.

Non usare peso 300 per testo normale.

## Browser

Testa almeno:

* Chrome;
* Safari;
* Firefox;
* Edge.

Controlla differenze di:

* rendering;
* peso percepito;
* fallback;
* metriche testo;
* wrapping.

## Offline

Sito deve mantenere leggibilità anche quando font esterno non raggiungibile.

Per questo font principale deve essere sistema o locale.

## Licenze

Ogni font non incluso nel sistema operativo deve avere licenza documentata.

Registra:

```text
Nome
Versione
Licenza
Fonte
Utilizzo
File
```

Non includere font senza autorizzazione.

## Anti-regressione

Prima di aggiungere font:

1. verifica font già presenti;
2. verifica necessità reale;
3. verifica dimensione;
4. verifica licenza;
5. verifica fallback;
6. verifica performance;
7. verifica mobile.

Non aggiungere font duplicati.

## Regola finale

**System font first. One family when possible. Few weights. WOFF2 only when needed. No unnecessary external font.**

Font deve sparire come problema tecnico.

Utente deve vedere **Rivalta**, non una libreria di font.
