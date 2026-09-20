La base deve essere il contratto architetturale del progetto: `FUNDAMENTA.md`. Deve funzionare anche prima che esistano gli altri `.md`, ma predisporre riferimenti che Claude userà quando arriveranno.

# FUNDAMENTA.md

## Identità

Progetto:

**Rivalta sul Mincio — il paese, in ogni suo dato**

Descrizione:

Atlante digitale completo di Rivalta sul Mincio, frazione del Comune di Rodigo, provincia di Mantova.

Il progetto raccoglie, collega e presenta:

* territorio;
* cartografia;
* dati;
* attività;
* servizi;
* uffici;
* persone solo quando pubblicamente e legittimamente rilevanti;
* eventi;
* giornale;
* storia;
* natura;
* ambiente;
* mobilità;
* documenti;
* fonti ufficiali;
* contenuti fotografici.

Principio:

> Se riguarda Rivalta e può essere documentato in modo affidabile, il progetto deve poterlo rappresentare.

---

# OBIETTIVO

Costruisci da zero un prodotto web completo.

Non costruire:

* semplice sito vetrina;
* blog;
* portale turistico;
* dashboard generica;
* copia del sito comunale.

Costruisci:

**atlante digitale locale + archivio + giornale + mappa + sistema dati.**

---

# STATO INIZIALE

Repository parte con:

**Vite installato e funzionante.**

Assumi che:

* progetto sia quasi vuoto;
* architettura non esista ancora;
* dipendenze applicative possano non esistere;
* dataset locali possano non esistere.

Claude deve prima ispezionare repository.

Non presumere struttura che non esiste.

Non cancellare file utili senza motivo.

---

# REGOLA MASTER

Prima di scrivere codice:

1. analizza repository;
2. analizza `package.json`;
3. identifica framework Vite realmente presente;
4. identifica entry point;
5. identifica dipendenze;
6. identifica file esistenti;
7. identifica configurazione;
8. costruisci architettura minima;
9. installa solo dipendenze necessarie;
10. crea fondamenta;
11. verifica build;
12. verifica dev server.

Non partire immediatamente da UI complessa.

---

# STACK

Stack iniziale:

```text
Vite
TypeScript quando compatibile con progetto
HTML
CSS
JavaScript / TypeScript
```

Aggiungi librerie solo quando hanno funzione concreta.

Possibili dipendenze future:

```text
React / Vue / altro framework
GSAP
Lenis
Leaflet / MapLibre / altra libreria cartografica
Lucide
libreria grafici
validazione schema
router
```

La tecnologia reale deve essere determinata dal repository.

Non imporre React se progetto non lo usa.

Non introdurre framework inutile.

---

# ARCHITETTURA

Separare chiaramente:

```text
UI
↓
componenti
↓
pagine
↓
servizi
↓
fonti dati
↓
dataset
```

Mai mescolare tutto dentro `App`.

## Struttura obiettivo

Adatta nomi alla tecnologia reale, ma mantieni separazione concettuale:

```text
src/
  app/
  components/
  pages/
  layouts/
  data/
  services/
  lib/
  hooks/
  utils/
  styles/
  animations/
  map/
  journal/
  weather/
  official/
  search/

public/
  images/
  icons/
  brand/

data/
  journal/
  places/
  businesses/
  services/
  events/
  history/
  nature/
  sources/
  osm/
```

Non creare directory vuote solo per rispettare schema.

Crea quando servono.

---

# SEPARAZIONE DATI / UI

Regola assoluta:

**I dati non devono essere hardcodati nei componenti quando possono vivere in dataset o servizi.**

Esempio errato:

```ts
const places = [
  { name: "..." }
];
```

dentro componente UI.

Preferire:

```text
dataset
↓
service
↓
component
```

Eccezione:

dati puramente grafici o configurazioni statiche minime possono restare nel componente.

---

# MODELLO DATI

Entità principali previste:

```text
Place
Business
Service
Office
Street
Event
JournalArticle
Association
School
Document
Photo
Source
Weather
OSMFeature
Alert
```

Ogni entità deve avere:

* ID stabile;
* nome;
* tipo;
* fonte quando pertinente;
* data aggiornamento quando pertinente;
* collegamenti ad altre entità quando utili.

Non creare schema definitivo enorme in anticipo.

Schema evolve nei relativi `.md`.

---

# ID

Ogni entità deve avere ID stabile.

Formato semplice:

```text
place-001
business-001
event-001
article-001
```

Oppure UUID quando architettura lo richiede.

Non usare nome come identificatore.

Non cambiare ID per modifiche editoriali.

---

# RELAZIONI

Il progetto deve poter collegare dati.

Esempio:

```text
Articolo
↓
Evento
↓
Luogo
↓
Coordinate OSM
↓
Attività
↓
Fonte ufficiale
```

Non duplicare informazione quando può essere collegata.

---

# FONTI

Ogni dato esterno deve mantenere provenienza.

Concetto minimo:

```ts
type SourceReference = {
  name: string;
  url?: string;
  type?: string;
  checkedAt?: string;
};
```

Fonti principali previste:

```text
Comune di Rodigo
OpenStreetMap
MeteoMincio
ISTAT
Regione Lombardia
Provincia di Mantova
ARPA Lombardia
Protezione Civile
altre fonti ufficiali
stampa locale
fonti locali verificabili
```

Le fonti saranno definite in dettaglio nei futuri `.md`.

Non inventare URL o API.

---

# GERARCHIA DELLE FONTI

Fonte dipende dal tipo di informazione.

Esempio:

```text
informazione amministrativa
→ Comune

geografia
→ OpenStreetMap

meteo
→ MeteoMincio o fonte meteorologica definita

ambiente specialistico
→ ente competente

cronaca
→ fonte giornalistica verificabile
```

Non usare una singola fonte per tutto.

Se due fonti confliggono:

mantieni entrambe e documenta differenza.

---

# OFFICIAL

Il progetto deve distinguere contenuto ufficiale.

Fonte comunale primaria prevista:

```text
https://www.comune.rodigo.mn.it/
```

Informazioni ufficiali possono includere:

* uffici;
* orari;
* email;
* PEC;
* indirizzi;
* servizi;
* avvisi;
* allerte;
* ordinanze;
* documenti;
* eventi;
* comunicazioni.

Il concetto di **badge ufficiale** sarà definito in `OFFICIAL-SOURCES.md`.

Non creare badge ufficiale per fonti non verificate.

---

# OSM

OpenStreetMap costituisce infrastruttura geografica fondamentale.

Può alimentare:

* mappa;
* strade;
* edifici;
* attività;
* servizi;
* parcheggi;
* fermate;
* sentieri;
* acqua;
* verde;
* punti di interesse.

Dettagli in:

```text
OSM.md
MAP.md
GEOJSON.md
```

Non creare ora integrazioni OSM invasive se architettura non è pronta.

---

# METEO

Meteo deve essere integrabile come servizio dati separato.

Fonte locale prevista:

```text
https://www.meteomincio.it/
```

Non hardcodare previsioni.

Dettagli in futuro:

```text
WEATHER.md
API.md
```

---

# GIORNALE

Il giornale è parte strutturale della Home.

Deve supportare:

* notizie;
* cronaca;
* avvisi;
* breaking;
* eventi;
* cultura;
* sport;
* associazioni;
* scuola;
* territorio;
* ambiente;
* natura;
* meteo;
* Mincio;
* commercio;
* agricoltura;
* comunità;
* storia;
* memoria locale;
* viabilità;
* trasporti;
* servizi;
* Comune;
* documenti;
* approfondimenti;
* dati;
* aggiornamenti;
* correzioni.

I contenuti saranno caricati manualmente tramite Claude Code / Fable 5.1.

Claude deve poter:

* creare;
* modificare;
* correggere;
* archiviare;
* collegare;
* verificare duplicati.

Dettagli completi in:

```text
JOURNAL.md
```

---

# HOME

Home deve essere aggregatore principale.

Elementi previsti:

```text
identità
ricerca
giornale
mappa
meteo
dati rapidi
categorie
luoghi
attività
servizi
eventi
natura
fonti
```

Non caricare tutto simultaneamente.

Home deve prioritizzare informazioni utili.

---

# RICERCA

Ricerca deve essere globale.

Può cercare:

```text
luoghi
strade
attività
servizi
eventi
articoli
uffici
documenti
fonti
```

Ricerca futura deve poter interrogare più dataset senza duplicare logica.

Preparare architettura per indice unificato.

---

# MAPPA

La mappa è componente fondamentale.

Deve poter collegare:

```text
luogo
↓
coordinate
↓
entità
↓
dati
↓
scheda
```

Mappa non deve contenere tutta logica applicativa.

Separare:

```text
map engine
map data
map UI
```

---

# PAGINE

Prevedi almeno:

```text
/
 /mappa
 /giornale
 /dati
 /attivita
 /servizi
 /luoghi
 /strade
 /eventi
 /storia
 /natura
 /ambiente
 /mobilita
 /meteo
 /uffici
 /fonti
 /archivio
```

Aggiungi pagine dettaglio con slug o ID.

Non creare route prima di avere contenuto reale quando non necessario.

---

# COMPONENTI

Componenti devono essere riutilizzabili.

Categorie:

```text
layout
navigation
content
data
map
journal
weather
official
forms
feedback
media
```

Regola:

stesso problema = stesso componente.

Non duplicare card, badge, modal, source label o map panel per singola pagina.

---

# DESIGN SYSTEM

Il design system viene definito progressivamente tramite:

```text
BRAND.md
STYLE.md
COLORS.md
TYPOGRAPHY.md
FONT.md
ICONS.md
LOGO.md
IMAGES.md
SPACING.md
BORDERS.md
SHADOWS.md
RADIUS.md
GRID.md
RESPONSIVE.md
ANIMATIONS.md
TRANSITIONS.md
MOTION.md
```

Questi documenti sono **contratti del progetto**, non semplice documentazione.

Quando uno esiste:

Claude deve rispettarlo.

Quando uno non esiste:

Claude deve seguire `FUNDAMENTA.md` senza inventare sistema completamente nuovo.

Quando documento futuro introduce una regola più specifica:

regola specifica prevale sulla regola generica.

---

# DOCUMENTI FUTURI

Il progetto sarà definito progressivamente con `.md`.

Categorie previste:

## Identità

```text
BRAND.md
STYLE.md
COLORS.md
TYPOGRAPHY.md
FONT.md
ICONS.md
LOGO.md
IMAGES.md
```

## Layout

```text
SPACING.md
BORDERS.md
SHADOWS.md
RADIUS.md
GRID.md
RESPONSIVE.md
```

## Motion

```text
ANIMATIONS.md
TRANSITIONS.md
MOTION.md
```

## Componenti

```text
COMPONENTS.md
LAYOUT.md
NAVIGATION.md
HEADER.md
FOOTER.md
BUTTONS.md
FORMS.md
INPUTS.md
CARDS.md
MODALS.md
DROPDOWNS.md
TOOLTIPS.md
TABLES.md
BADGES.md
TAGS.md
ALERTS.md
NOTIFICATIONS.md
LOADERS.md
EMPTY-STATES.md
ERROR-STATES.md
HOVER.md
FOCUS.md
ACCESSIBILITY.md
```

## Contenuti

```text
CONTENT.md
TEXTS.md
COPY.md
SEO.md
METADATA.md
STRUCTURED-DATA.md
LOCAL-SEO.md
SITEMAP.md
ROBOTS.md
OPEN-GRAPH.md
```

## Dati

```text
DATA.md
DATA-SCHEMA.md
DATA-SOURCES.md
DATA-MODEL.md
DATA-VALIDATION.md
DATA-QUALITY.md
DATA-ARCHIVE.md
DATA-IMPORT.md
DATA-EXPORT.md
DATA-UPDATE.md
```

## Geografia

```text
MAP.md
LAYERS.md
MARKERS.md
GEOMETRY.md
GEOJSON.md
OSM.md
OVERPASS.md
GEOCODING.md
ROUTES.md
BOUNDARIES.md
```

## API

```text
API.md
API-CONTRACTS.md
ENDPOINTS.md
FETCHING.md
CACHING.md
RATE-LIMITING.md
INTEGRATIONS.md
WEBHOOKS.md
CRON.md
SYNC.md
```

## Architettura

```text
ARCHITECTURE.md
STACK.md
FOLDERS.md
ROUTES.md
STATE.md
STORAGE.md
CONFIG.md
ENVIRONMENT.md
DEPENDENCIES.md
CONVENTIONS.md
```

## Sicurezza

```text
SECURITY.md
PRIVACY.md
COOKIES.md
GDPR.md
VALIDATION.md
TESTING.md
QA.md
PERFORMANCE.md
MONITORING.md
CHANGELOG.md
```

## Dominio Rivalta

```text
JOURNAL.md
WEATHER.md
OFFICIAL-SOURCES.md
PLACES.md
STREETS.md
BUSINESSES.md
SERVICES.md
EVENTS.md
ASSOCIATIONS.md
SCHOOLS.md
NATURE.md
ENVIRONMENT.md
DEMOGRAPHICS.md
TRANSPORT.md
PHOTOS.md
ARCHIVE.md
SOURCES.md
METHODOLOGY.md
```

I file possono essere aggiunti, eliminati o accorpati quando architettura reale lo richiede.

La lista è roadmap, non obbligo di creare file inutili.

---

# ORDINE DELLA DOCUMENTAZIONE

Quando costruisci progetto da zero, crea documentazione in questo ordine:

```text
01 FUNDAMENTA.md
02 BRAND.md
03 STYLE.md
04 COLORS.md
05 TYPOGRAPHY.md
06 FONT.md
07 ICONS.md
08 LOGO.md
09 IMAGES.md
10 SPACING.md
11 BORDERS.md
12 SHADOWS.md
13 RADIUS.md
14 GRID.md
15 RESPONSIVE.md
16 ANIMATIONS.md
17 TRANSITIONS.md
18 MOTION.md

19 COMPONENTS.md
20 LAYOUT.md
21 NAVIGATION.md
22 HEADER.md
23 FOOTER.md
24 BUTTONS.md
25 FORMS.md
26 INPUTS.md
27 CARDS.md
28 MODALS.md
29 DROPDOWNS.md
30 TOOLTIPS.md
31 TABLES.md
32 BADGES.md
33 TAGS.md
34 ALERTS.md
35 NOTIFICATIONS.md
36 LOADERS.md
37 EMPTY-STATES.md
38 ERROR-STATES.md
39 HOVER.md
40 FOCUS.md
41 ACCESSIBILITY.md

42 DATA.md
43 DATA-SCHEMA.md
44 DATA-MODEL.md
45 DATA-SOURCES.md
46 DATA-VALIDATION.md
47 DATA-QUALITY.md
48 DATA-UPDATE.md
49 DATA-ARCHIVE.md

50 MAP.md
51 LAYERS.md
52 MARKERS.md
53 GEOMETRY.md
54 GEOJSON.md
55 OSM.md
56 OVERPASS.md
57 GEOCODING.md
58 ROUTES.md
59 BOUNDARIES.md

60 API.md
61 API-CONTRACTS.md
62 ENDPOINTS.md
63 FETCHING.md
64 CACHING.md
65 RATE-LIMITING.md
66 INTEGRATIONS.md
67 SYNC.md
68 CRON.md
69 WEBHOOKS.md

70 CONTENT.md
71 TEXTS.md
72 COPY.md
73 SEO.md
74 METADATA.md
75 STRUCTURED-DATA.md
76 LOCAL-SEO.md
77 SITEMAP.md
78 ROBOTS.md
79 OPEN-GRAPH.md

80 JOURNAL.md
81 WEATHER.md
82 OFFICIAL-SOURCES.md
83 PLACES.md
84 STREETS.md
85 BUSINESSES.md
86 SERVICES.md
87 EVENTS.md
88 ASSOCIATIONS.md
89 SCHOOLS.md
90 NATURE.md
91 ENVIRONMENT.md
92 DEMOGRAPHICS.md
93 TRANSPORT.md
94 PHOTOS.md
95 ARCHIVE.md
96 SOURCES.md
97 METHODOLOGY.md

98 ARCHITECTURE.md
99 STACK.md
100 FOLDERS.md
101 ROUTES.md
102 STATE.md
103 STORAGE.md
104 CONFIG.md
105 ENVIRONMENT.md
106 DEPENDENCIES.md
107 CONVENTIONS.md

108 SECURITY.md
109 PRIVACY.md
110 COOKIES.md
111 GDPR.md
112 TESTING.md
113 QA.md
114 PERFORMANCE.md
115 MONITORING.md
116 CHANGELOG.md
```

Questo ordine è operativo.

Non significa che tutti file debbano essere creati prima del codice.

---

# REGOLA DI PRECEDENZA

Quando più documenti definiscono stessa area:

```text
specifico > generale
```

Esempio:

```text
GRID.md
>
STYLE.md
>
FUNDAMENTA.md
```

Ma nessun documento può contraddire requisiti fondamentali di:

* sicurezza;
* accessibilità;
* provenienza dati;
* correttezza informativa.

---

# REGOLA FUTURI MD

Ogni nuovo `.md` deve:

1. dichiarare scopo;
2. definire regole;
3. evitare duplicazioni;
4. riferirsi ai documenti esistenti;
5. non contraddire fondamenta senza motivo;
6. definire token quando necessario;
7. definire anti-regressione;
8. contenere regola finale.

Claude deve trattare tutti `.md` come specifica tecnica cumulativa.

Non leggerne soltanto ultimo file.

---

# CLAUDE CODE / FABLE 5.1

Prima di modificare codice:

```text
leggi FUNDAMENTA.md
↓
leggi MD pertinenti
↓
ispeziona repository
↓
implementa
↓
testa
↓
correggi
```

Non rileggere automaticamente ogni file del progetto a ogni modifica se non necessario.

Leggi almeno:

```text
FUNDAMENTA.md
+
documenti pertinenti alla modifica
```

Esempio:

Modifica colori:

```text
FUNDAMENTA
BRAND
STYLE
COLORS
```

Modifica responsive:

```text
FUNDAMENTA
GRID
SPACING
RESPONSIVE
```

Modifica giornale:

```text
FUNDAMENTA
DATA
JOURNAL
CONTENT
```

Modifica OSM:

```text
FUNDAMENTA
DATA
MAP
OSM
```

---

# DIPENDENZE

Prima di installare pacchetto:

1. verifica `package.json`;
2. controlla se problema è già risolto da dipendenza esistente;
3. verifica compatibilità;
4. valuta bundle;
5. installa solo se necessario.

Non installare librerie equivalenti.

Esempio:

non usare tre librerie per animazioni.

Scegli sistema coerente.

---

# CSS

Centralizza token.

Evita valori arbitrari.

Usa:

```text
colors
spacing
typography
radius
borders
shadows
motion
breakpoints
```

dai relativi documenti.

Non creare CSS locale per risolvere problema già coperto da sistema.

---

# TYPESCRIPT

Quando progetto usa TypeScript:

tipi condivisi devono essere centralizzati.

Esempio:

```text
src/
  types/
```

oppure struttura equivalente.

Non definire stesso tipo in più componenti.

---

# ERROR HANDLING

Ogni servizio esterno deve gestire:

```text
loading
success
empty
error
stale
offline
```

Non mostrare stack trace utente.

Non confondere:

```text
dato assente
```

con:

```text
servizio non disponibile
```

---

# PERFORMANCE

Performance è requisito architetturale.

Priorità:

```text
content
→ structure
→ interaction
→ enhancement
```

Non bloccare Home con:

* mappe pesanti;
* font inutili;
* immagini enormi;
* richieste duplicate;
* animazioni costose.

---

# ACCESSIBILITÀ

Accessibilità non è aggiunta finale.

È requisito dalla prima implementazione.

Target:

**WCAG 2.2 AA quando applicabile.**

Ogni componente futuro deve essere progettato accessibile.

---

# MOBILE

Mobile first.

Target touch:

```text
minimo 44 × 44px
```

Mappa, ricerca e giornale devono funzionare bene su smartphone.

Non costruire desktop e poi comprimere.

---

# SEO

Contenuto principale deve essere semanticamente rappresentato.

Mappa e JavaScript non possono essere unico accesso a informazione importante.

---

# DATI VERIFICABILI

Non inventare:

* coordinate;
* orari;
* contatti;
* statistiche;
* nomi;
* eventi;
* allerte;
* previsioni;
* fonti.

Dato mancante:

```text
Dato non disponibile
```

Dato dubbio:

```text
Da verificare
```

---

# PRIVACY

Non raccogliere dati personali senza necessità.

Non pubblicare dati privati soltanto perché tecnicamente reperibili.

Informazioni pubbliche istituzionali possono essere mostrate solo quando pertinenti allo scopo del progetto.

---

# ARCHIVIO

Non cancellare automaticamente dati passati.

Preferire stato:

```text
active
expired
archived
```

Questo vale soprattutto per:

* eventi;
* giornale;
* attività;
* documenti;
* avvisi.

---

# MODIFICHE

Prima di modifica strutturale importante:

analizza dipendenze.

Non cambiare API, schema o componente condiviso senza verificare utilizzi.

Dopo modifica:

```text
typecheck
lint
build
test
```

quando strumenti esistono.

---

# REGOLA ANTI-CAOS

Non aggiungere codice perché "potrebbe servire".

Non creare:

* componenti duplicati;
* utility duplicate;
* dataset duplicati;
* API wrapper duplicati;
* CSS paralleli;
* configurazioni parallele.

Ogni nuova struttura deve avere funzione reale.

---

# REGOLA ANTI-OVERENGINEERING

Progetto deve essere completo, non inutilmente complesso.

Preferire:

```text
semplice + modulare + aggiornabile
```

a:

```text
astratto + complesso + difficile da mantenere
```

Aggiungere complessità solo quando requisito reale la giustifica.

---

# REGOLA DI SVILUPPO

Costruisci per strati:

```text
fondamenta
↓
architettura
↓
design system
↓
componenti
↓
dati
↓
servizi
↓
mappa
↓
giornale
↓
integrazioni
↓
rifinitura
```

Non tentare implementazione totale in una singola fase.

---

# REGOLA DI VERIFICA

Ogni milestone deve lasciare progetto funzionante.

Non accumulare decine di cambiamenti non verificati.

Dopo ogni sistema importante:

```text
build
↓
run
↓
inspect
↓
fix
```

---

# REGOLA DEL PROGETTO

Il progetto deve poter crescere da:

```text
Vite vuoto
```

a:

```text
atlante digitale completo di Rivalta
```

senza dover riscrivere architettura principale.

Ogni futuro `.md` aggiunge precisione.

Nessun futuro `.md` deve rendere inutilizzabili fondamenta già corrette.

---

# REGOLA FINALE

**Prima struttura. Poi sistema. Poi dati. Poi interfaccia. Poi effetti.**

**Dati separati dalla UI. Fonti sempre tracciabili. Componenti riutilizzabili. Mobile first. Accessibilità nativa. Performance sempre attiva.**

Quando un dettaglio non è ancora definito:

**non inventarlo.**

Prepara struttura per definirlo nel relativo `.md` futuro.
