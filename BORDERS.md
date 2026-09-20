# BORDERS.md

## Scopo

Definisci sistema bordi per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Bordi devono:

* separare contenuti;
* definire componenti;
* indicare stato;
* migliorare struttura;
* supportare accessibilità.

Non usare bordi come decorazione casuale.

## Principio

Bordo deve avere funzione.

Usi principali:

* separazione;
* contenitore;
* focus;
* stato;
* selezione;
* struttura tabella;
* delimitazione mappa.

## Token

Usa colori definiti in `COLORS.md`.

```css
:root {
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-strong: 3px;

  --border-color: var(--color-border);
  --border-color-subtle: var(--color-border-subtle);
  --border-color-strong: var(--color-border-strong);
}
```

Non inserire colori arbitrari nei componenti.

## Spessore

### Standard

```css
border: 1px solid var(--border-color);
```

Uso principale:

* card;
* input;
* pannelli;
* separatori;
* tabelle.

### Medio

```css
border: 2px solid var(--border-color-strong);
```

Uso:

* stato attivo;
* selezione;
* componenti importanti;
* focus quando necessario.

### Forte

```css
border: 3px solid ...;
```

Usalo raramente.

Principalmente per:

* indicatori critici;
* componenti ad alta evidenza;
* elementi specifici della mappa.

## Direzione

Preferisci bordo solo dove necessario.

Esempio:

```css
border-bottom: 1px solid var(--border-color);
```

per liste e sezioni.

Evita:

```css
border: 1px solid ...;
```

su ogni elemento quando separatore singolo basta.

## Card

Card standard:

```css
.card {
  border: 1px solid var(--border-color);
}
```

Non aggiungere automaticamente:

* bordo;
* ombra;
* gradient;
* effetto glass;
* forte radius.

Card deve restare visivamente leggera.

## Pannelli

Pannelli informativi possono usare bordo standard.

Pannelli fluttuanti mappa possono usare:

```css
border: 1px solid var(--border-color);
```

più ombra leggera quando necessaria per distinguere pannello da mappa.

## Separators

Separatore standard:

```css
.separator {
  border-top: 1px solid var(--border-color-subtle);
}
```

Usalo per:

* metadata;
* sezioni;
* liste;
* footer;
* tabelle.

Non usare separatori tra ogni parola o blocco minimo.

## Input

Default:

```css
.input {
  border: 1px solid var(--border-color);
}
```

Focus:

```css
.input:focus-visible {
  border-color: var(--color-primary);
}
```

Errore:

```css
.input[aria-invalid="true"] {
  border-color: var(--color-danger);
}
```

Successo quando realmente utile:

```css
.input[data-valid="true"] {
  border-color: var(--color-success);
}
```

Non usare verde per ogni campo compilato correttamente.

## Button

Pulsante primario può non richiedere bordo visibile se contrasto sufficiente.

Pulsante secondario:

```css
.button-secondary {
  border: 1px solid var(--border-color-strong);
}
```

Pulsante ghost:

```css
.button-ghost {
  border: 1px solid transparent;
}
```

Su hover può comparire bordo o superficie.

## Focus

Focus deve essere percepibile.

Preferenza:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
```

Non usare il solo cambio bordo come indicatore focus.

Non fare:

```css
outline: none;
```

senza alternativa accessibile.

## Selezione

Elemento selezionato:

```css
.is-selected {
  border-color: var(--color-primary);
}
```

Quando possibile aggiungi anche:

* background;
* testo;
* indicatore;
* stato.

Non affidarti soltanto al bordo.

## Hover

Hover può cambiare bordo:

```css
.card:hover {
  border-color: var(--border-color-strong);
}
```

Cambio deve essere minimo.

Non far "saltare" layout modificando dimensione bordo.

Preferisci `box-shadow`, inset border o struttura stabile quando necessario.

## Active

Active state può usare bordo più marcato.

```css
.nav-item[aria-current="page"] {
  border-color: var(--color-primary);
}
```

Mantieni indicatore coerente tra componenti.

## Disabled

Bordo attenuato:

```css
:disabled {
  border-color: var(--color-border-subtle);
}
```

Non usare contrasto così basso da rendere componente indistinguibile.

## Error

Errore deve essere chiaro:

```css
border-color: var(--color-danger);
```

Messaggio errore deve esistere fuori dal bordo.

Colore da solo non basta.

## Warning

```css
border-color: var(--color-warning);
```

Usalo per:

* dati da verificare;
* stato temporaneo;
* avvisi.

Non usare bordo giallo per contenuto puramente informativo.

## Success

```css
border-color: var(--color-success);
```

Usalo solo quando stato positivo è utile all'utente.

## Mappe

Bordi mappa possono rappresentare:

* confini;
* strade;
* aree;
* proprietà territoriali quando dati disponibili;
* selezioni.

Usa gerarchia visiva:

```text
confine principale > confine secondario > dettaglio
```

Non rendere ogni geometria equivalente.

## Layer

Ogni layer geografico deve avere peso visivo coerente.

Confini importanti:

* stroke maggiore.

Elementi secondari:

* stroke minore.

Layer inattivo:

* attenuato o nascosto.

## Marker

Marker selezionato può usare bordo:

```css
.marker[data-selected="true"] {
  border: 2px solid var(--color-primary);
}
```

Non aggiungere bordo spesso a tutti i marker.

## Tabelle

Header può usare bordo inferiore.

Righe:

```css
tbody tr {
  border-bottom: 1px solid var(--border-color-subtle);
}
```

Evita griglia completa pesante se non necessaria.

Per tabelle molto dense può essere utile bordo verticale, ma solo quando migliora scansione dati.

## Liste

Separatore tra elementi:

```css
.list-item + .list-item {
  border-top: 1px solid var(--border-color-subtle);
}
```

Non circondare ogni item con un box se lista lineare è più leggibile.

## Breadcrumb

Non usare bordi come separatori principali.

Preferire:

* spacing;
* slash;
* chevron;
* tipografia.

## Modali

Modal può usare bordo sottile insieme a superficie distinta.

Non creare doppio bordo:

```text
bordo + bordo interno + ombra forte
```

Usa massimo combinazione necessaria per separazione.

## Drawer

Drawer deve avere bordo sul lato di separazione:

```css
border-left: 1px solid var(--border-color);
```

oppure:

```css
border-right: 1px solid var(--border-color);
```

in base alla direzione.

## Footer

Preferisci un solo separatore strutturale:

```css
.footer {
  border-top: 1px solid var(--border-color);
}
```

Evita molti box interni.

## Header

Header può usare:

```css
header {
  border-bottom: 1px solid var(--border-color);
}
```

quando separazione dal contenuto migliora leggibilità.

Header trasparente su hero può non avere bordo iniziale.

## Radius e bordi

Bordo e radius devono usare stesso sistema.

Non creare:

```text
border 1px + radius 27px
```

su componente standard senza motivo.

Vedi `RADIUS.md` per valori ufficiali.

## Bordi colorati

Bordo colorato comunica stato o categoria.

Non assegnare bordo colorato a ogni categoria del progetto.

Per categorie usa soprattutto:

* icona;
* label;
* marker;
* colore controllato.

## Double borders

Evita doppio bordo.

Eccezioni:

* elementi editoriali;
* componenti specifici;
* decorazione cartografica documentata.

## Dashed

Bordo tratteggiato utile per:

* aree da verificare;
* confini non precisi;
* selezioni temporanee;
* stato in modifica.

Esempio:

```css
border: 1px dashed var(--border-color);
```

Non usarlo per decorazione generica.

## Dotted

Puntinato quasi sempre secondario.

Usalo solo quando semantica è chiara.

Non usarlo come stile predefinito.

## Responsive

Spessore non deve cambiare solo per viewport.

Può cambiare densità quando:

* mappa richiede leggibilità;
* touch richiede stato più evidente.

## Performance

Bordi CSS sono economici.

Evita però elementi duplicati usati solo per simulare bordi complessi.

Preferisci CSS a immagini raster.

## Pixel alignment

Con bordi da 1px verifica rendering su display ad alta densità.

Non aggiungere trasformazioni per correggere microdiferenze senza necessità.

## Dark mode

Usa token dedicati.

Non trasformare automaticamente:

```text
#D8D9D2
```

in bianco puro.

Dark mode deve mantenere separazione sottile.

## Stampa

Bordi devono rimanere leggibili in stampa.

Riduci colori forti.

Usa nero/grigio quando colore non è necessario.

## Anti-regressione

Prima di aggiungere bordo:

1. verifica se separazione è già ottenuta da spacing;
2. cerca componente simile;
3. usa token esistente;
4. verifica radius;
5. verifica focus;
6. verifica hover;
7. verifica dark mode;
8. verifica mobile;
9. verifica stampa.

Non aggiungere bordo solo per "dare più forma" al componente.

## Regola finale

**Bordo separa. Bordo indica stato. Bordo non decora senza motivo.**

Un bordo ben usato rende atlante più preciso.

Un bordo inutile rende interfaccia rumorosa.
