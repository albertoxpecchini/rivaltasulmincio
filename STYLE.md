# STYLE.md

## Scopo

Definisci linguaggio visivo completo di **Rivalta sul Mincio — il paese, in ogni suo dato**.

Il design deve comunicare:

**territorio + dati + cartografia + archivio + contemporaneità**

Non sembrare:

* sito turistico generico;
* portale comunale tradizionale;
* dashboard aziendale;
* template SaaS;
* blog.

Deve sembrare un **atlante digitale locale moderno**.

## Principi

### 1. Dati prima della decorazione

Ogni elemento visivo deve aiutare:

* leggere;
* cercare;
* confrontare;
* localizzare;
* capire;
* esplorare.

Rimuovi elementi puramente decorativi quando occupano spazio senza aggiungere informazione.

### 2. Gerarchia forte

Ogni pagina deve avere gerarchia evidente:

1. titolo;
2. contesto;
3. dato principale;
4. contenuto;
5. fonte;
6. azioni secondarie.

Non rendere tutti gli elementi visivamente equivalenti.

### 3. Aspetto editoriale

Usa composizioni simili a:

* atlanti;
* mappe;
* archivi;
* pubblicazioni territoriali;
* schede documentali;
* guide cartografiche.

Evita estetica da landing page commerciale.

### 4. Precisione grafica

Allineamenti, dimensioni, spaziature e proporzioni devono seguire sistema coerente.

Niente:

* elementi casualmente centrati;
* margini arbitrari;
* card di dimensioni incoerenti;
* font casuali;
* radius eccessivi senza motivo.

## Linguaggio visivo

### Superfici

Prediligi:

* superfici chiare;
* fondi neutri;
* pannelli leggibili;
* separazioni sottili;
* contrasto controllato.

Usa superfici più marcate solo per:

* mappe;
* dati importanti;
* stati;
* elementi interattivi.

### Linee

Le linee possono richiamare:

* confini cartografici;
* griglie;
* percorsi;
* coordinate;
* separatori editoriali.

Usale con moderazione.

### Griglia

La pagina deve avere struttura modulare.

Contenuto principale:

* massimo controllo della larghezza;
* colonne coerenti;
* ritmo verticale costante;
* grandi spazi solo quando servono alla gerarchia.

La mappa può rompere la griglia tradizionale quando migliora esplorazione.

## Layout

### Homepage

Struttura consigliata:

Hero informativo.

Ricerca globale.

Mappa principale.

Panoramica numerica.

Categorie principali.

Aggiornamenti recenti.

Contenuti territoriali.

Fonti.

Footer.

La homepage deve permettere di iniziare esplorazione senza leggere lunghi testi.

### Pagine archivio

Usa:

* titolo;
* descrizione breve;
* filtri;
* ricerca;
* conteggio risultati;
* elenco o griglia;
* paginazione o caricamento progressivo.

### Pagine dettaglio

Ogni dettaglio deve avere:

* nome;
* categoria;
* posizione;
* descrizione;
* dati;
* mappa;
* informazioni correlate;
* fonte;
* aggiornamento.

### Pagine dati

Privilegia:

* numeri;
* grafici;
* mappe;
* tabelle;
* confronti temporali.

Riduci paragrafi non necessari.

## Card

Le card servono per raggruppare informazioni.

Ogni card deve avere:

* gerarchia;
* titolo;
* contenuto principale;
* eventuale metadato;
* eventuale fonte;
* eventuale azione.

Non trasformare ogni singolo dato in una card.

Evita:

* ombre pesanti;
* gradienti casuali;
* immagini ovunque;
* testi centrati senza motivo.

## Mappe

La mappa è componente primaria.

Deve poter occupare spazio importante nella composizione.

Interazione minima:

* zoom;
* pan;
* selezione;
* filtri;
* layer;
* ricerca.

Marker e layer devono essere leggibili anche con molti elementi.

Le informazioni cartografiche devono avere priorità sui contenuti decorativi.

## Tipografia

La tipografia deve distinguere chiaramente:

* titolo pagina;
* titolo sezione;
* titolo scheda;
* corpo;
* dato numerico;
* metadato;
* fonte;
* testo secondario.

Numeri importanti possono usare dimensioni maggiori.

Le fonti devono essere leggibili ma subordinate.

## Colori

Palette territoriale controllata.

Direzione visiva:

* verde vegetazione;
* verde muschio;
* tonalità acqua;
* neutri caldi;
* bianco sporco;
* nero morbido.

Non usare troppi colori.

Il colore deve comunicare:

* categoria;
* stato;
* interazione;
* importanza;
* orientamento.

Non usare colore solo per rendere interfaccia più "bella".

## Immagini

Le immagini devono avere funzione documentale.

Preferire:

* panorami reali;
* dettagli architettonici;
* territorio;
* Mincio;
* Valli del Mincio;
* attività locali;
* eventi;
* fotografie storiche.

Immagini devono mantenere proporzioni coerenti.

No collage casuali.

## Icone

Icone semplici e tecniche.

Usa stesso sistema iconografico in tutto sito.

Icona deve avere significato chiaro.

Non usare icone decorative senza funzione.

## Microinterazioni

Animazioni brevi e discrete.

Usale per:

* comparsa contenuti;
* cambio stato;
* apertura pannelli;
* hover;
* caricamento;
* transizioni mappa.

Evita animazioni continue.

Evita effetti spettacolari che rallentano consultazione.

## Motion

Movimento deve spiegare relazione tra stati.

Esempio:

Apertura scheda:
pannello entra in modo breve e prevedibile.

Cambio filtro:
risultati aggiornano senza movimento eccessivo.

Mappa:
transizioni morbide solo quando aiutano orientamento.

Preferenza:

**chiarezza > spettacolarità**

## Responsive

Desktop:

* più colonne;
* mappe ampie;
* strumenti laterali;
* dati affiancati.

Tablet:

* riduci colonne;
* conserva gerarchia.

Mobile:

* una colonna;
* controlli facilmente raggiungibili;
* card compatte;
* mappe utilizzabili con touch;
* filtri apribili;
* testo leggibile senza zoom.

Non fare semplice "desktop compresso".

Ridisegna componenti quando necessario.

## Accessibilità

Target minimo:

**WCAG 2.2 AA**

Garantisci:

* contrasto adeguato;
* focus visibile;
* navigazione tastiera;
* target touch adeguati;
* testo ridimensionabile;
* alt text;
* struttura semantica;
* supporto `prefers-reduced-motion`.

Non usare colore come unico indicatore.

## Stati

Ogni componente interattivo deve definire:

* default;
* hover;
* focus;
* active;
* disabled;
* loading;
* empty;
* error;
* success quando necessario.

## Densità informativa

Il progetto contiene molti dati.

Mantieni densità alta senza creare confusione.

Preferisci:

* metadati compatti;
* righe informative;
* tabelle;
* filtri;
* disclosure;
* sezioni collassabili;
* pannelli laterali.

Evita pagine composte soltanto da grandi blocchi vuoti.

## Coerenza

Stesso significato = stesso componente.

Stesso componente = stesso comportamento.

Stesso dato = stesso formato.

Stessa categoria = stesso linguaggio visivo.

Non creare varianti grafiche senza necessità.

## Fonti

Le fonti devono essere visibili ma non dominanti.

Formato consigliato:

`Fonte: OpenStreetMap`
`Aggiornato: 20 settembre 2026`

Per dati dinamici indicare aggiornamento automatico quando applicabile.

## Errori

Errore deve essere chiaro.

Non mostrare stack trace agli utenti.

Usa messaggi comprensibili.

Esempio:

**Dati non disponibili**

`Fonte non raggiungibile. Riprova più tardi.`

## Loading

Preferire skeleton o placeholder strutturati.

Non usare spinner giganteschi.

La struttura della pagina deve restare stabile durante caricamento.

## Empty state

Quando non esistono risultati:

* comunica chiaramente assenza;
* conserva ricerca e filtri;
* suggerisci modifica filtro solo quando utile.

Esempio:

**Nessun risultato**

`Non sono presenti elementi corrispondenti ai filtri selezionati.`

## SEO visuale

Ogni pagina deve essere leggibile anche senza JavaScript quando tecnicamente possibile.

Contenuto principale deve avere struttura semantica.

Titoli devono seguire gerarchia corretta.

## Performance

Priorità:

1. contenuto;
2. struttura;
3. interazione;
4. immagini;
5. animazioni.

Non sacrificare performance per effetti grafici.

Ottimizza:

* immagini;
* font;
* JavaScript;
* mappe;
* API;
* rendering;
* lazy loading.

## Regola anti-template

Non usare pattern visivi tipici di template generici senza adattarli al progetto.

Ogni scelta deve rafforzare identità di:
**Rivalta + territorio + dati + mappa + archivio.**

## Regola finale

**Meno decorazione. Più informazione.**

**Meno effetto. Più precisione.**

**Meno portale turistico. Più atlante digitale.**
