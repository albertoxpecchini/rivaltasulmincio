# TYPOGRAPHY.md

## Scopo

Definisci sistema tipografico ufficiale per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Tipografia deve comunicare:

* precisione;
* leggibilità;
* cartografia;
* archivio;
* contemporaneità;
* solidità.

## Principio

Usa poche famiglie tipografiche.

Gerarchia deve derivare da:

* famiglia;
* dimensione;
* peso;
* altezza riga;
* spaziatura;
* contrasto.

Non creare gerarchia usando soltanto font enormi.

## Font principale

Font principale UI e contenuti:

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

Usa stesso stack in tutto sito.

Non importare Google Fonts senza motivo.

## Font numerico

Numeri devono usare stessa famiglia principale salvo necessità specifica.

Per dati statistici abilita quando disponibile:

```css
font-variant-numeric: tabular-nums;
```

Questo mantiene numeri allineati in tabelle e statistiche.

## Gerarchia

### Display

Titoli hero e intestazioni principali.

```css
font-size: clamp(2.5rem, 6vw, 6rem);
line-height: 0.95;
font-weight: 650;
letter-spacing: -0.04em;
```

Usalo raramente.

Titolo deve essere leggibile, non decorativo.

### H1

```css
font-size: clamp(2rem, 4vw, 3.5rem);
line-height: 1;
font-weight: 650;
letter-spacing: -0.035em;
```

Uno solo per pagina.

### H2

```css
font-size: clamp(1.5rem, 2.5vw, 2.25rem);
line-height: 1.1;
font-weight: 620;
letter-spacing: -0.025em;
```

### H3

```css
font-size: 1.25rem;
line-height: 1.2;
font-weight: 620;
letter-spacing: -0.015em;
```

### H4

```css
font-size: 1.05rem;
line-height: 1.3;
font-weight: 600;
```

## Corpo

### Body large

Usato per introduzioni e descrizioni principali.

```css
font-size: 1.125rem;
line-height: 1.6;
font-weight: 400;
```

### Body

```css
font-size: 1rem;
line-height: 1.55;
font-weight: 400;
```

### Body small

```css
font-size: 0.875rem;
line-height: 1.5;
font-weight: 400;
```

Usato per:

* metadati;
* informazioni secondarie;
* testo compatto.

## Caption

```css
font-size: 0.75rem;
line-height: 1.4;
font-weight: 450;
```

Usato per:

* didascalie;
* coordinate;
* note;
* fonti.

Non usarlo per informazioni essenziali.

## Label

```css
font-size: 0.75rem;
line-height: 1.2;
font-weight: 600;
letter-spacing: 0.04em;
```

Usato per:

* categorie;
* sezioni brevi;
* stati;
* filtri.

Mai trasformare tutto in uppercase automaticamente.

## Numeri principali

Statistiche importanti:

```css
font-size: clamp(2rem, 5vw, 4rem);
line-height: 0.95;
font-weight: 650;
font-variant-numeric: tabular-nums;
letter-spacing: -0.04em;
```

Esempi:

`2.847`

`63 ha`

`12 km`

`24 attività`

Numero deve avere maggiore peso visivo rispetto alla relativa descrizione.

## Coordinate

Coordinate devono usare numeri tabulari e dimensione compatta.

Esempio:

```text
45.16842, 10.66931
```

Non rendere coordinate elementi visivi dominanti.

## Tabelle

Usa:

```css
font-variant-numeric: tabular-nums;
```

Header:

* peso 600;
* dimensione compatta;
* allineamento coerente.

Numeri:

* allineamento a destra quando confronto numerico lo richiede.

Testo:

* allineamento a sinistra.

## Mappe

Etichette mappa seguono sistema separato dal contenuto UI ma devono mantenere stessa identità.

Priorità:

1. nome luogo;
2. strade principali;
3. elementi secondari;
4. dati meno importanti.

Non usare font eccessivamente piccoli.

## Fonti

Formato:

```text
Fonte: OpenStreetMap
Aggiornato: 20 settembre 2026
```

Fonte usa Body small o Caption.

Colore subordinato.

Non ridurre dimensione fino a rendere fonte illeggibile.

## Link

Link devono essere riconoscibili senza dipendere soltanto da hover.

Default:

* colore primario;
* eventuale sottolineatura in contesti testuali.

Hover:

* colore primary dark.

Focus:

* outline visibile.

## Pulsanti

Testo:

* peso 600;
* dimensione 0.875–1rem;
* line-height 1.2.

Evita pulsanti con testo eccessivamente sottile.

## Navigazione

Navigazione principale:

* 0.875–0.95rem;
* peso 550–600.

Elemento attivo deve essere distinguibile.

Non usare uppercase per tutta navigazione salvo contesti specifici.

## Uppercase

Usalo solo per:

* micro-label;
* categorie;
* marcatori;
* metadata brevi.

Non usare uppercase per:

* paragrafi;
* titoli lunghi;
* menu completi.

## Letter spacing

Titoli grandi:

```css
letter-spacing: -0.04em;
```

Titoli medi:

```css
letter-spacing: -0.02em;
```

Body:

```css
letter-spacing: normal;
```

Label:

```css
letter-spacing: 0.04em;
```

Non usare tracking estremo.

## Line height

Regole:

Titoli grandi:
`0.95–1.1`

Titoli medi:
`1.1–1.25`

Body:
`1.5–1.65`

Caption:
`1.35–1.5`

Interfaccia:
`1.2–1.4`

## Peso

Scala preferita:

```text
400 Regular
500 Medium
600 Semibold
650 Strong
700 Bold
```

Non usare molti pesi.

Peso 700 riservato a casi specifici.

## Corsivo

Corsivo solo per:

* citazioni;
* termini editoriali;
* eventuali denominazioni storiche.

Non usare corsivo come elemento decorativo.

## Testo lungo

Massima larghezza consigliata:

```css
max-width: 70ch;
```

Paragrafi lunghi non devono occupare tutta larghezza desktop.

## Titoli

Titoli devono:

* essere brevi;
* descrivere contenuto;
* mantenere gerarchia;
* evitare giochi tipografici inutili.

Preferire:

`Attività locali`

Non:

`Scopri tutte le fantastiche attività del paese`

## Testo editoriale

Scrivere in frasi brevi.

Paragrafi compatti.

Evitare muri di testo.

Usare:

* titoli;
* sottotitoli;
* elenchi;
* dati;
* tabelle;
* separatori.

## Microcopy

UI deve usare parole semplici e precise.

Preferire:

`Cerca`

`Filtra`

`Mostra mappa`

`Apri scheda`

`Vedi fonte`

`Dati non disponibili`

Evitare:

`Scopri il nostro fantastico archivio`

## Responsive typography

Non ridurre solo dimensione font.

Adatta anche:

* spaziatura;
* larghezza testo;
* numero righe;
* gerarchia;
* densità.

Titoli principali devono usare `clamp()` quando utile.

## Accessibilità

Testo normale deve restare leggibile.

Non usare:

* font troppo piccoli;
* peso troppo leggero su fondo complesso;
* contrasto basso;
* paragrafi troppo larghi.

Rispetta zoom browser almeno 200%.

Layout non deve rompersi quando testo aumenta.

## Consistenza

Stesso livello semantico = stesso stile.

Non creare:

* H2 diversi tra pagine;
* numeri con stili arbitrari;
* label casuali;
* font diversi per singola sezione.

## Token

Centralizza valori tipografici.

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

  --font-size-body: 1rem;
  --font-size-small: 0.875rem;
  --font-size-caption: 0.75rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-strong: 650;
  --font-weight-bold: 700;
}
```

Non inserire valori tipografici casuali direttamente nei componenti.

## Regola finale

**Leggibilità prima estetica. Gerarchia prima dimensione. Numeri precisi. Testo compatto.**

Tipografia deve far percepire progetto come **atlante digitale**, non come landing page.
