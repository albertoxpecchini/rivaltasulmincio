# ICONS.md

## Scopo

Definisci sistema icone ufficiale per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Icone devono aiutare utente a:

* capire;
* riconoscere;
* navigare;
* filtrare;
* localizzare;
* distinguere categorie;
* interpretare dati.

Non usare icone come semplice decorazione.

## Sistema principale

Usa **SVG**.

Preferenze:

* vettoriale;
* leggero;
* scalabile;
* accessibile;
* modificabile via CSS;
* coerente tra dispositivi.

Non usare PNG per icone UI.

Non usare icon font come sistema principale.

## Libreria

Scegli una sola libreria principale coerente.

Preferenza:

**Lucide Icons**

Motivi:

* stile lineare;
* geometria coerente;
* ampia copertura;
* SVG;
* buona leggibilità;
* facile personalizzazione.

Non mescolare liberamente Lucide, Font Awesome, Material Icons e altre librerie.

## Stile

Icone devono avere:

* tratto uniforme;
* geometria semplice;
* pochi dettagli;
* angoli coerenti;
* proporzioni coerenti.

Look generale:

**cartografico + editoriale + tecnico**

Evitare icone troppo giocose.

## Stroke

Valore base:

```css
--icon-stroke-width: 1.75px;
```

Per elementi più piccoli:

```css
--icon-stroke-width-small: 1.5px;
```

Per elementi importanti:

```css
--icon-stroke-width-strong: 2px;
```

Non cambiare stroke casualmente tra componenti.

## Dimensioni

Scala principale:

```text
12px
14px
16px
18px
20px
24px
32px
40px
48px
```

Uso indicativo:

`12–14px` micro metadata

`16px` UI compatta

`18px` controlli standard

`20px` navigazione

`24px` pulsanti e indicatori principali

`32–48px` statistiche, categorie o empty state

Non usare 40px per una normale icona dentro pulsante.

## Allineamento

Icona deve allinearsi otticamente al testo.

Esempio:

```css
.icon {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
}
```

Con testo:

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
```

Non usare margini arbitrari per centrare icone.

## Colore

Icone ereditano colore dal componente quando possibile.

Esempio:

```css
.icon {
  color: currentColor;
}
```

Non assegnare un colore diverso a ogni icona.

Usa colori semantici quando icona rappresenta stato.

Esempi:

* verde = confermato;
* giallo = attenzione;
* rosso = errore;
* blu acqua = acqua/Mincio.

## Icone decorative

Icona decorativa deve usare:

```html
aria-hidden="true"
```

Non aggiungere label accessibile duplicata.

## Icone informative

Quando icona comunica informazione non presente nel testo:

```html
aria-label="Parcheggio"
```

oppure usa testo associato visibile.

Non affidarti solo alla forma dell'icona.

## Pulsanti solo icona

Ogni pulsante senza testo visibile deve avere nome accessibile.

Esempio:

```html
<button aria-label="Chiudi">
  ...
</button>
```

Non creare pulsanti icon-only senza `aria-label` o nome equivalente.

## Tooltip

Tooltip può spiegare azioni icon-only.

Non usare tooltip come unico meccanismo per accessibilità.

Su touch:

* non dipendere da hover;
* label deve restare disponibile tramite nome accessibile o UI.

## Categorie territoriali

Usa sistema coerente.

### Natura

Icone tipo:

* `TreePine`
* `Leaf`
* `Sprout`

### Acqua

Icone tipo:

* `Waves`
* `Droplets`
* `Ship`

### Strade

Icone tipo:

* `Road`
* `Map`
* `Navigation`

### Mobilità

Icone tipo:

* `Bus`
* `Bike`
* `Car`
* `ParkingSquare`

### Attività

Icone tipo:

* `Store`
* `ShoppingBag`
* `Utensils`
* `Coffee`

### Servizi

Icone tipo:

* `Building2`
* `Landmark`
* `CircleHelp`

### Cultura

Icone tipo:

* `Library`
* `BookOpen`
* `Music`

### Sport

Icone tipo:

* `Dumbbell`
* `Bike`
* `Trophy`

### Eventi

Icone tipo:

* `CalendarDays`
* `PartyPopper`
* `Ticket`

### Storia

Icone tipo:

* `Clock3`
* `Archive`
* `Landmark`

Usa icone realmente disponibili nella versione installata.

Non assumere nomi senza verificarli.

## Mappe

Marker devono essere semplici.

Non trasformare ogni categoria in marker dettagliato.

Priorità:

1. posizione;
2. categoria;
3. selezione.

Marker selezionato deve distinguersi chiaramente.

## Marker

Scala consigliata:

```text
24px default
28px selected
32px active/highlight
```

Evita marker enormi che coprono mappa.

## Marker personalizzati

Creare SVG custom solo quando libreria non copre significato necessario.

Custom icon deve rispettare:

* stessa stroke;
* stessa proporzione;
* stesso sistema colori;
* stessa griglia;
* stessa dimensione ottica.

## Navigazione

Icone possono accompagnare:

* Home;
* Mappa;
* Dati;
* Attività;
* Servizi;
* Luoghi;
* Eventi;
* Storia;
* Natura.

Icona non deve sostituire testo in navigazione principale desktop.

## Azioni

Sistema coerente:

* ricerca = `Search`
* chiudi = `X`
* menu = `Menu`
* indietro = `ArrowLeft`
* avanti = `ArrowRight`
* apri = `ExternalLink`
* filtra = `SlidersHorizontal`
* ordina = `ArrowUpDown`
* scarica = `Download`
* condividi = `Share2`
* copia = `Copy`
* posizione = `MapPin`
* informazioni = `Info`

Usa sempre stesso significato per stessa icona.

## Direzione

Non usare una stessa icona per significati diversi.

Esempio:

`ArrowRight` = vai avanti.

`ExternalLink` = apre risorsa esterna.

`Navigation` = orientamento/posizione.

## Stati

Definisci icone per:

* loading;
* success;
* warning;
* error;
* offline;
* dati mancanti;
* dati da verificare.

Esempio:

```text
CircleCheck
TriangleAlert
CircleX
WifiOff
Database
```

## Empty state

Usa una sola icona principale.

Non costruire illustrazioni complesse usando decine di icone.

## Tabelle

Icone devono essere secondarie rispetto al dato.

Usale per:

* stato;
* azione;
* ordinamento;
* espansione.

Non mettere icone decorative in ogni cella.

## Card

Icona può introdurre categoria.

Posizione preferita:

* vicino titolo;
* non sopra ogni riga;
* non ripetuta inutilmente.

## Fonti

Icone utili:

```text
ExternalLink
BookOpen
FileText
Link
CalendarDays
```

Mantieni dimensione 14–16px.

## Foto

Non sovrapporre icone decorative sulle fotografie salvo controllo, zoom o azione reale.

## Touch

Target interattivo minimo consigliato:

**44 × 44px**

Icona può essere 18–24px dentro area maggiore.

Non usare 18px di target totale.

## Motion

Icone possono animarsi solo quando stato cambia.

Esempi:

* chevron ruota;
* menu apre;
* loading ruota;
* check appare.

Evita:

* bounce continuo;
* rotazioni decorative;
* pulsazioni infinite.

Rispetta:

```css
@media (prefers-reduced-motion: reduce) {
  /* disable non-essential icon animation */
}
```

## Performance

Preferire SVG inline o sistema già bundlato.

Evita richieste HTTP separate per ogni icona.

Non caricare intera libreria se bundler permette tree-shaking.

## SVG

SVG deve avere:

```html
fill="none"
stroke="currentColor"
```

quando compatibile con stile scelto.

Rimuovi metadata inutili.

Ottimizza SVG custom.

## Accessibilità SVG

Icona decorativa:

```html
aria-hidden="true"
focusable="false"
```

Icona informativa deve avere nome accessibile tramite contesto.

Non aggiungere testo SVG invisibile senza motivo.

## Contrasto

Icone informative devono rispettare contrasto richiesto per componenti non testuali.

Non usare icone quasi invisibili su fondo chiaro.

Stato non deve dipendere solo dal colore.

## Responsive

Riduci dimensione dove necessario, ma non sotto soglia leggibile.

Non usare dimensione differente solo per smartphone senza motivo.

## Consistenza

Stessa funzione:

**stessa icona**

Stessa categoria:

**stesso stile**

Stesso componente:

**stessa dimensione**

Non sostituire icona casualmente tra pagine.

## Anti-regressione

Prima di aggiungere icona:

1. cerca icona già usata;
2. verifica significato;
3. verifica libreria;
4. verifica dimensione;
5. verifica accessibilità;
6. verifica mobile;
7. verifica contrasto.

Non creare duplicati semantici.

## Regola finale

**SVG first. One icon system. One meaning per icon. Consistent stroke. Accessible names. No decorative overload.**

Le icone devono rendere Rivalta più facile da leggere, cercare e esplorare.
