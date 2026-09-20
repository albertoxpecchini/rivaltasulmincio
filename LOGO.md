# LOGO.md

## Scopo

Definisci uso corretto del logo di **Rivalta sul Mincio — il paese, in ogni suo dato**.

Logo deve rappresentare identità territoriale senza trasformarsi in marchio commerciale aggressivo.

## Principio

Logo deve essere:

* semplice;
* riconoscibile;
* riproducibile;
* leggibile;
* neutro;
* coerente con atlante digitale;
* utilizzabile su web e stampa.

Non usare logo come elemento decorativo dominante.

## Identità

Logo deve richiamare concettualmente almeno uno di questi elementi:

* Rivalta sul Mincio;
* territorio;
* acqua;
* cartografia;
* coordinate;
* paesaggio;
* identità locale.

Riferimenti devono restare astratti e sintetici.

Evitare simbolismo eccessivamente turistico.

## Versioni

Prevedi almeno:

### Logo principale

Uso standard su sfondi chiari.

### Logo scuro

Uso su sfondi chiari quando contrasto richiede variante più scura.

### Logo chiaro

Uso su superfici scure o fotografie.

### Simbolo

Solo elemento grafico senza denominazione.

Uso:

* favicon;
* marker;
* app icon;
* avatar;
* elementi molto piccoli.

### Wordmark

Nome:

```text
Rivalta sul Mincio
```

Usalo quando spazio orizzontale è disponibile.

## Composizione

Logo deve avere rapporto geometrico stabile.

Non modificare manualmente:

* proporzioni;
* spaziature;
* allineamento;
* inclinazione;
* forma;
* stroke;
* colori.

## Clear space

Mantieni area libera attorno al logo.

Definisci spazio minimo in base a una misura interna del simbolo.

Esempio:

```text
clear space = 1× altezza simbolo
```

Nessun testo, icona o bordo deve entrare nell'area protetta.

## Dimensione minima

Web:

```text
logo completo: minimo 120px larghezza
wordmark: minimo 120px larghezza
simbolo: minimo 20px
```

Sotto dimensioni minime usa solo versione semplificata o simbolo.

Non forzare logo completo in spazi troppo piccoli.

## Colori

Usa token definiti in `COLORS.md`.

Versione principale:

```css
color: var(--color-primary);
```

Versione monocromatica:

```text
nero
bianco
```

Non creare tonalità custom per singola pagina.

## Sfondo

Logo deve mantenere contrasto sufficiente su:

* background principale;
* surface;
* verde principale;
* fotografie;
* mappa;
* dark mode.

Su fotografie complesse usa area di appoggio oppure variante ad alto contrasto.

## Non usare

Non:

* deformare;
* ruotare;
* inclinare;
* comprimere;
* allungare;
* aggiungere ombre;
* aggiungere gradienti;
* aggiungere glow;
* applicare filtri;
* cambiare colori arbitrariamente;
* aggiungere contorni;
* aggiungere testo non previsto;
* inserire logo dentro forme casuali.

## Tipografia logo

Se logo usa wordmark specifico, non sostituire automaticamente font con quello UI.

Wordmark deve essere trattato come identità grafica autonoma.

Non usare testo HTML come sostituto del logo quando versione ufficiale SVG esiste.

## SVG

Formato preferito:

```text
SVG
```

Logo vettoriale deve essere pulito e ottimizzato.

Evita:

* metadata inutili;
* raster incorporati;
* dipendenze esterne;
* font esterni;
* script dentro SVG.

SVG deve funzionare offline.

## Accessibilità

Logo con funzione link:

```html
<a href="/" aria-label="Rivalta sul Mincio — home">
  ...
</a>
```

Logo puramente decorativo:

```html
aria-hidden="true"
```

Non fornire testo alternativo duplicato quando accanto esiste già nome visibile equivalente.

## Header

Header deve usare logo con dimensione coerente.

Desktop:

```text
logo + navigazione
```

Mobile:

```text
logo + menu
```

Non rendere logo troppo grande rispetto alla navigazione.

## Footer

Footer può usare versione compatta.

Può includere:

* simbolo;
* nome;
* descrizione breve;
* link principali;
* fonti;
* informazioni progetto.

Non trasformare footer in grande blocco pubblicitario.

## Favicon

Usa simbolo, non logo completo.

Formati consigliati:

```text
favicon.svg
favicon.ico
apple-touch-icon.png
```

Prevedi dimensioni adatte ai diversi contesti.

## PWA / Web App

Quando il progetto usa manifest:

```text
icons/
  icon-192.png
  icon-512.png
```

Usa simbolo centrato con spazio sufficiente.

Non comprimere wordmark dentro icone quadrate.

## Social

Prevedi almeno:

* versione orizzontale;
* simbolo quadrato;
* versione leggibile su fondo chiaro;
* versione leggibile su fondo scuro.

Non usare screenshot del logo.

## Mappe

Logo non deve confondersi con marker territoriali.

Mantieni distinzione tra:

* identità del progetto;
* punti geografici;
* categorie;
* layer.

## Fotografie

Logo sovrapposto a foto solo quando necessario.

Posizione preferenziale:

* angolo con spazio libero;
* area a basso dettaglio;
* contrasto controllato.

Non coprire elementi importanti della fotografia.

## Animazione

Logo normalmente statico.

Animazione ammessa solo per:

* intro;
* loading iniziale;
* microinterazione specifica.

Animazione deve essere breve.

Non animare logo continuamente.

Rispetta:

```css
@media (prefers-reduced-motion: reduce) {
  /* disable non-essential logo animation */
}
```

## Uso editoriale

Il logo può comparire:

* copertine;
* mappe;
* schede;
* documenti;
* immagini social;
* materiali stampati.

Mantieni sempre proporzioni e clear space.

## Relazione con enti

Il logo del progetto non deve imitare:

* stemmi comunali;
* loghi istituzionali;
* marchi regionali;
* simboli ufficiali;
* identità di associazioni.

Loghi di enti esterni devono mantenere asset e regole propri.

Non suggerire patrocinio o collaborazione tramite semplice affiancamento visivo.

## File

Organizza asset:

```text
brand/
  logo.svg
  logo-dark.svg
  logo-light.svg
  symbol.svg
  symbol-dark.svg
  symbol-light.svg
```

Aggiungi PNG solo quando richiesto da piattaforma specifica.

## Naming

Usa nomi file descrittivi e stabili.

Preferire:

```text
logo.svg
logo-light.svg
logo-dark.svg
symbol.svg
```

Evitare:

```text
logo-final.svg
logo-final-2.svg
logo-new-real-final.svg
```

## Versionamento

Modifiche al logo richiedono aggiornamento documentato.

Non sostituire asset senza verificare:

* header;
* footer;
* favicon;
* manifest;
* social preview;
* stampa;
* dark mode.

## Anti-regressione

Prima di modificare logo:

1. verifica file sorgente;
2. verifica tutte le occorrenze;
3. verifica dimensioni;
4. verifica contrasto;
5. verifica mobile;
6. verifica favicon;
7. verifica dark mode;
8. verifica eventuali materiali esterni.

Non modificare singoli utilizzi per correggere un problema globale.

## Regola finale

**Logo semplice. Proporzioni intatte. Colore controllato. SVG first.**

Logo identifica progetto.

**Il territorio rimane protagonista.**
