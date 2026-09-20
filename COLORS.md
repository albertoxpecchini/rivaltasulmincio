# COLORS.md

## Scopo

Definisci sistema colori ufficiale di **Rivalta sul Mincio — il paese, in ogni suo dato**.

Palette deve richiamare:

* Mincio
* Valli del Mincio
* vegetazione
* campagna mantovana
* cartografia
* documentazione
* archivi

Colori devono restare sobri, leggibili e funzionali.

## Principio

Non assegnare colore a ogni elemento.

Usa colore per:

* identità;
* gerarchia;
* stato;
* categoria;
* orientamento;
* interazione;
* dati geografici.

Neutri costituiscono maggior parte interfaccia.

## Colori base

### Background principale

```css
--color-background: #F7F6F1;
```

Bianco caldo. Fondo principale sito.

### Background secondario

```css
--color-surface: #FFFFFF;
```

Usato per card, pannelli, modali e contenitori.

### Fondo secondario caldo

```css
--color-surface-warm: #EEEDE6;
```

Usato per sezioni editoriali e separazione visiva.

## Testo

### Testo principale

```css
--color-text: #18201C;
```

Usato per titoli e testo principale.

### Testo secondario

```css
--color-text-secondary: #56615B;
```

Usato per descrizioni, metadati e contenuti secondari.

### Testo disabilitato

```css
--color-text-muted: #8B938E;
```

Usato solo quando contenuto deve apparire non interattivo o secondario.

## Verde territorio

### Verde principale

```css
--color-primary: #315E49;
```

Colore identitario principale.

Usi:

* CTA principali;
* link;
* elementi attivi;
* controlli principali;
* elementi di navigazione selezionati.

### Verde scuro

```css
--color-primary-dark: #244635;
```

Usato per:

* hover;
* focus;
* titoli speciali;
* elementi ad alto contrasto.

### Verde chiaro

```css
--color-primary-light: #DDE8DF;
```

Usato per:

* badge;
* sfondi informativi;
* selezioni leggere;
* categorie ambientali.

### Verde molto chiaro

```css
--color-primary-soft: #EDF3ED;
```

Usato per grandi superfici secondarie.

## Acqua / Mincio

### Blu acqua

```css
--color-water: #4B7C7A;
```

Usato per:

* Mincio;
* corsi d'acqua;
* layer acqua;
* dati idrologici.

### Blu acqua chiaro

```css
--color-water-light: #DCEBE9;
```

Usato per sfondi e aree selezionate.

Non usare blu generico per elementi non collegati all'acqua.

## Terra

### Terra

```css
--color-earth: #8A735A;
```

Usato per:

* agricoltura;
* suolo;
* sentieri rurali;
* elementi territoriali specifici.

### Terra chiara

```css
--color-earth-light: #E9E1D6;
```

Usato per fondi secondari.

## Giallo segnaletico

```css
--color-warning: #B98224;
```

Usato per:

* avvisi;
* dati da verificare;
* condizioni temporanee.

Non usare per decorazione.

### Warning soft

```css
--color-warning-light: #F4E8CC;
```

## Rosso

```css
--color-danger: #A4473F;
```

Usato per:

* errori;
* dati critici;
* azioni distruttive.

### Danger soft

```css
--color-danger-light: #F2DCDA;
```

## Successo

```css
--color-success: #3F7651;
```

Usato per:

* operazioni completate;
* dati confermati;
* stato attivo quando semanticamente appropriato.

### Success soft

```css
--color-success-light: #DDEBE0;
```

## Bordi

### Bordo principale

```css
--color-border: #D8D9D2;
```

### Bordo forte

```css
--color-border-strong: #B9BCB4;
```

### Bordo sottile

```css
--color-border-subtle: #E7E7E1;
```

Bordi devono separare, non decorare.

## Mappe

Usa colori distinti per layer senza trasformare mappa in arcobaleno.

Schema:

```css
--map-water: #7FA9A5;
--map-green: #78936F;
--map-park: #A8B99B;
--map-road: #D0CCC2;
--map-road-major: #B5AEA2;
--map-building: #DDD9D0;
--map-boundary: #8F938A;
--map-label: #26312B;
```

Colori mappa devono mantenere contrasto sufficiente anche con molti layer.

## Categorie

Assegna colore categoria solo quando migliora riconoscimento.

### Attività

```css
--category-business: #315E49;
```

### Servizi

```css
--category-services: #586B73;
```

### Cultura

```css
--category-culture: #75605C;
```

### Sport

```css
--category-sport: #6D7545;
```

### Natura

```css
--category-nature: #527451;
```

### Mobilità

```css
--category-mobility: #66716B;
```

### Eventi

```css
--category-events: #8A6E3F;
```

### Storia

```css
--category-history: #765F4A;
```

Non usare colore categoria come sfondo pieno di grandi sezioni.

## Dark mode

Prevedi dark mode solo se implementazione resta coerente con identità.

Palette separata:

```css
--dark-background: #111613;
--dark-surface: #19201C;
--dark-surface-warm: #222822;
--dark-text: #EDF1EC;
--dark-text-secondary: #B8C0BA;
--dark-text-muted: #7F8982;
--dark-border: #343C36;
```

Adatta colori principali per mantenere contrasto.

Non invertire semplicemente tutti i colori.

## Trasparenze

Usa trasparenza solo quando funzione richiede:

* overlay mappa;
* pannelli flottanti;
* modali;
* gradienti di leggibilità;
* stati hover.

Evita superfici trasparenti ovunque.

## Gradients

Gradienti non fanno parte del linguaggio visivo principale.

Usali solo quando servono per:

* leggibilità testo sopra fotografie;
* transizione mappa;
* overlay.

Evita gradienti decorativi.

## Fotografie

Non applicare filtro colore globale alle fotografie.

Color grading deve restare naturale.

Fotografie devono documentare territorio reale.

## Contrasto

Target minimo:

**WCAG 2.2 AA**

Testo normale:

* contrasto minimo 4.5:1.

Testo grande:

* contrasto minimo 3:1.

Elementi grafici e componenti interattivi devono mantenere contrasto sufficiente.

Non usare:

* verde chiaro su bianco per testo;
* grigio chiaro su bianco;
* testo trasparente;
* colori pastello come testo principale.

## Focus

Focus deve essere sempre visibile.

Usa:

```css
outline: 2px solid var(--color-primary);
outline-offset: 3px;
```

Non rimuovere `outline` senza sostituzione accessibile.

## Hover

Hover deve aumentare riconoscibilità.

Non modificare eccessivamente saturazione.

Preferire:

* variazione superficie;
* bordo;
* contrasto;
* colore leggermente più scuro.

## Active

Stato attivo deve essere evidente anche senza colore.

Combina:

* colore;
* bordo;
* peso tipografico;
* icona;
* posizione.

## Disabled

Elementi disabilitati devono mantenere leggibilità sufficiente.

Non usare opacità estrema.

Preferire colore attenuato + stato non interattivo.

## Grafici

Grafici devono usare palette coerente.

Non usare colori casuali generati automaticamente.

Quando confronto non richiede colori distinti, preferire scala monocromatica.

Quando colore rappresenta categoria, usare colori categoria definiti.

Quando colore rappresenta valore, usare scala continua.

Mai comunicare informazione soltanto tramite colore.

## Tabelle

Usa colore minimo.

Preferire:

* righe alternate molto leggere;
* bordi;
* intestazioni;
* indicatori di stato.

Tabelle devono restare leggibili in stampa e dark mode.

## Stampa

Prevedi versione print-friendly.

Riduci:

* sfondi pieni;
* ombre;
* trasparenze;
* colori non necessari.

Mantieni differenze semantiche leggibili anche in scala di grigi quando possibile.

## Token CSS

Tutti colori devono derivare da variabili centralizzate.

Non inserire valori hex casuali nei componenti.

Non duplicare stesso colore con nomi differenti.

Esempio:

```css
.button-primary {
  background: var(--color-primary);
  color: #FFFFFF;
}

.button-primary:hover {
  background: var(--color-primary-dark);
}
```

## Regola

Nuovo colore richiede motivo concreto.

Prima cerca token esistente.

Se token esistente non basta, aggiungi colore al sistema e documentalo qui.

Non introdurre colore per singola pagina.

## Regola finale

**Palette piccola. Contrasto alto. Colore semantico. Territorio riconoscibile.**

Il verde identifica territorio e natura.

L'acqua identifica Mincio e sistemi idrici.

Terra identifica paesaggio rurale.

Neutri costruiscono struttura.

Rosso, giallo e verde servono solo a comunicare stati.

## Fonte ufficiale

```css
--color-official: #1877F2;
```

Usato solo per l'icona del badge «fonte ufficiale» definito in `OFFICIAL-SOURCES.md`.

Contrasto su bianco circa 3.9:1: sufficiente per un'icona, non per testo. Il testo accanto al badge usa `--color-text-secondary`.

Non usare questo blu per categorie, link o elementi non collegati alla verifica della fonte.
