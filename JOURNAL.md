# JOURNAL.md

## Scopo

Definisci sistema **GIORNALE** di **Rivalta sul Mincio — il paese, in ogni suo dato**.

Il giornale vive direttamente in **HOME**.

Non è blog generico.

È sezione editoriale locale per:

* notizie;
* avvisi;
* aggiornamenti;
* eventi;
* cronaca;
* territorio;
* comunità;
* informazioni utili;
* comunicazioni temporanee.

I contenuti vengono **caricati manualmente dall'amministratore tramite Claude Code / Fable 5.1** o tramite sistema editoriale del progetto.

Claude deve conoscere già struttura, regole, tipi e comportamento.

---

# PRINCIPIO

Ogni articolo deve rispondere rapidamente a:

**cosa è successo?**

**dove?**

**quando?**

**chi riguarda?**

**fonte?**

**cosa deve sapere utente?**

Quando informazione non è disponibile, non inventarla.

---

# GIORNALE IN HOME

Homepage deve avere una sezione visibile:

```text
GIORNALE

Ultime notizie da Rivalta sul Mincio

[articolo principale]
[articolo]
[articolo]
[articolo]

Vedi tutto
```

La sezione deve essere aggiornata automaticamente leggendo dataset giornale.

Non scrivere articoli direttamente dentro componente Home.

---

# GERARCHIA HOME

## Articolo principale

Mostra contenuto più rilevante o più recente secondo regole editoriali.

Componente grande.

Contiene:

* categoria;
* titolo;
* estratto;
* immagine quando disponibile;
* data;
* località;
* eventuale badge urgenza.

## Articoli secondari

Mostra 3–6 contenuti.

Layout responsive coerente con `RESPONSIVE.md`.

## Ultimi aggiornamenti

Mostra contenuti recenti in formato compatto.

## Link archivio

```text
Vedi tutto il giornale
```

porta a:

```text
/giornale
```

---

# TIPI DI CONTENUTO

Il sistema deve supportare almeno questi tipi.

## 1. BREAKING

Informazione urgente.

Esempi:

* strada chiusa;
* emergenza locale;
* interruzione servizio;
* comunicazione urgente;
* situazione ambientale rilevante.

UI:

```text
BREAKING
Titolo
```

Usa colore di stato.

Non abusare del tipo.

---

## 2. CRONACA

Fatti locali verificabili.

Esempi:

* incidente;
* intervento;
* evento rilevante;
* cambiamento locale;
* fatto di interesse pubblico.

Separare sempre fatto da commento.

---

## 3. AVVISO

Comunicazione pratica.

Esempi:

* modifica viabilità;
* chiusura;
* manutenzione;
* interruzione acqua;
* lavori;
* variazione servizio.

Deve mostrare chiaramente:

* cosa cambia;
* periodo;
* area interessata;
* eventuale azione richiesta.

---

## 4. EVENTO

Evento futuro.

Esempi:

* festa;
* sagra;
* torneo;
* concerto;
* incontro;
* iniziativa;
* manifestazione.

Campi obbligatori consigliati:

```text
data
ora
luogo
organizzatore
```

Quando disponibile:

```text
prezzo
prenotazione
contatti
link
```

---

## 5. CULTURA

Contenuti culturali locali.

Esempi:

* mostra;
* presentazione;
* libro;
* musica;
* teatro;
* patrimonio;
* iniziativa culturale.

---

## 6. SPORT

Contenuti sportivi locali.

Esempi:

* partite;
* risultati;
* tornei;
* iscrizioni;
* società sportive;
* manifestazioni.

---

## 7. ASSOCIAZIONI

Contenuti provenienti da associazioni locali.

Esempi:

* comunicazioni;
* iniziative;
* raccolte;
* attività;
* convocazioni;
* eventi.

Indicare associazione come autore/organizzazione.

---

## 8. SCUOLA

Contenuti scolastici.

Esempi:

* calendario;
* comunicazioni;
* iscrizioni;
* attività;
* progetti;
* risultati;
* variazioni.

---

## 9. TERRITORIO

Aggiornamenti sul territorio.

Esempi:

* lavori;
* arredo urbano;
* manutenzione;
* viabilità;
* infrastrutture;
* aree verdi;
* edifici;
* argini.

---

## 10. AMBIENTE

Contenuti ambientali.

Esempi:

* Mincio;
* Valli del Mincio;
* vegetazione;
* fauna;
* qualità ambientale;
* acqua;
* attività di tutela.

---

## 11. NATURA

Contenuti naturalistici.

Esempi:

* avvistamenti;
* flora;
* fauna;
* stagionalità;
* percorsi;
* osservazioni.

Separare osservazione locale da dato scientifico.

---

## 12. METEO

Contenuto meteorologico editoriale.

Esempi:

* fenomeni intensi;
* allerte;
* condizioni particolari;
* impatti sul territorio.

Previsioni normali restano nel componente meteo.

Non duplicare automaticamente forecast come articoli.

---

## 13. ACQUA / MINCIO

Contenuti collegati a:

* livello Mincio;
* situazione idrologica;
* chiusure;
* manutenzioni;
* navigazione;
* eventi sul fiume.

Non confondere dati idrologici con meteo.

---

## 14. COMMERCIO

Aggiornamenti attività locali.

Esempi:

* nuova apertura;
* cambio sede;
* chiusura;
* riapertura;
* novità;
* attività storica.

Non trasformare articolo in pubblicità se contenuto è puramente informativo.

---

## 15. AGRICOLTURA

Contenuti territoriali agricoli.

Esempi:

* stagionalità;
* iniziative agricole;
* produzioni;
* eventi rurali;
* cambiamenti territoriali.

---

## 16. COMUNITÀ

Vita sociale locale.

Esempi:

* iniziative;
* volontariato;
* raccolte;
* celebrazioni;
* ricorrenze;
* progetti comunitari.

---

## 17. STORIA

Contenuti storici.

Esempi:

* anniversari;
* fotografie storiche;
* documenti;
* personaggi;
* edifici;
* trasformazioni del paese.

Indicare sempre periodo o data quando disponibile.

---

## 18. MEMORIA LOCALE

Testimonianze e materiali locali.

Può contenere:

* racconti;
* fotografie;
* documenti;
* testimonianze;
* ricordi.

Distinguere sempre testimonianza da fatto documentato.

---

## 19. VIABILITÀ

Contenuti relativi a:

* strade;
* chiusure;
* deviazioni;
* lavori;
* parcheggi;
* traffico;
* modifiche temporanee.

Può essere collegato a elementi geografici.

---

## 20. TRASPORTI

Contenuti su:

* autobus;
* fermate;
* variazioni servizio;
* trasporto scolastico;
* mobilità.

---

## 21. SERVIZI

Aggiornamenti pratici su servizi locali.

Esempi:

* farmacia;
* poste;
* servizi pubblici;
* raccolta rifiuti;
* manutenzioni;
* sportelli.

---

## 22. COMUNE

Notizie relative al Comune di Rodigo quando riguardano direttamente Rivalta sul Mincio.

Non presentare automaticamente ogni notizia del Comune come notizia di Rivalta.

---

## 23. PROVINCIA / REGIONE

Usare solo quando informazione ha impatto diretto o rilevante per Rivalta.

Non importare automaticamente comunicati non pertinenti.

---

## 24. LAVORI PUBBLICI

Contenuti dedicati a:

* cantieri;
* manutenzioni;
* asfaltature;
* illuminazione;
* opere;
* infrastrutture.

---

## 25. SICUREZZA

Comunicazioni riguardanti sicurezza pubblica o condizioni territoriali.

Massima precisione.

Non pubblicare informazioni sensibili non necessarie.

---

## 26. PROTEZIONE CIVILE

Contenuti ufficiali:

* allerte;
* emergenze;
* esercitazioni;
* comunicazioni;
* prevenzione.

Fonte deve essere indicata.

---

## 27. SALUTE PUBBLICA

Usare solo per comunicazioni pubbliche pertinenti e verificabili.

Non pubblicare dati personali o sanitari identificativi.

---

## 28. NECROLOGIO / LUTTO

Supportare solo quando esiste contenuto autorizzato e appropriato.

Non creare automaticamente profili personali.

---

## 29. ECONOMIA LOCALE

Contenuti su:

* attività economiche;
* iniziative;
* progetti;
* trasformazioni commerciali;
* occupazione locale quando dati affidabili disponibili.

---

## 30. FOTO DAL PAESE

Post brevi basati su fotografia.

Esempi:

* alba;
* Mincio;
* stagione;
* evento;
* cambiamento urbano.

Non sostituire con fotografia generica.

---

## 31. VIDEO

Articolo con video locale.

Può avere:

```text
videoUrl
thumbnail
caption
credit
```

Non autoplay audio.

---

## 32. DOCUMENTO

Contenuto centrato su:

* PDF;
* ordinanza;
* avviso;
* comunicato;
* documento storico.

Mostra sintesi + documento originale.

---

## 33. APPROFONDIMENTO

Articolo lungo.

Usalo per:

* storia;
* territorio;
* ambiente;
* analisi dati;
* spiegazioni.

Può contenere:

* immagini;
* mappe;
* grafici;
* tabelle;
* timeline;
* fonti.

---

## 34. DATI

Articolo costruito attorno a dataset.

Esempi:

* popolazione;
* attività;
* eventi;
* viabilità;
* statistiche.

Mostra fonte e periodo di riferimento.

---

## 35. ANNIVERSARIO

Contenuto legato a ricorrenza locale.

Esempi:

* anniversario storico;
* anniversario associazione;
* ricorrenza edificio;
* evento passato.

---

## 36. RETROSPETTIVA

Ricostruzione di fatto o evento passato.

Usa datazione precisa.

---

## 37. AGGIORNAMENTO

Aggiornamento di articolo esistente.

Esempio:

```text
Aggiornamento — 18:40
```

Non creare automaticamente nuovo articolo per ogni piccola correzione.

---

## 38. CORREZIONE

Quando articolo precedente contiene errore.

Mantieni trasparenza:

```text
Correzione:
...
```

Non cancellare storia editoriale quando correzione deve essere tracciata.

---

# SCHEMA ARTICOLO

Ogni articolo deve seguire schema centralizzato.

```ts
type JournalArticle = {
  id: string;

  type: JournalType;

  title: string;
  subtitle?: string;
  excerpt?: string;
  content: string;

  status:
    | "draft"
    | "scheduled"
    | "published"
    | "updated"
    | "archived";

  featured?: boolean;
  breaking?: boolean;

  publishedAt: string;
  updatedAt?: string;

  author?: string;
  organization?: string;

  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };

  event?: {
    startsAt?: string;
    endsAt?: string;
    venue?: string;
    organizer?: string;
    price?: string;
    bookingUrl?: string;
  };

  image?: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
  };

  gallery?: string[];

  videoUrl?: string;

  documentUrl?: string;

  source?: {
    name: string;
    url?: string;
  };

  tags?: string[];

  relatedPlaces?: string[];
  relatedBusinesses?: string[];
  relatedEvents?: string[];

  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
};
```

Non rendere obbligatori campi non pertinenti.

---

# STATUS

## Draft

Non visibile pubblico.

## Scheduled

Pubblicazione programmata.

## Published

Visibile.

## Updated

Articolo pubblicato con modifica successiva.

## Archived

Non più prioritario ma conservato.

Non cancellare contenuto storico senza motivo.

---

# DATA E ORARIO

Salva timestamp ISO 8601.

Esempio:

```text
2026-09-20T18:40:00+02:00
```

Visualizza in formato italiano:

```text
20 settembre 2026, 18:40
```

Mostra "oggi" o "ieri" solo nell'interfaccia compatta.

Pagina articolo deve mostrare data reale.

---

# TITOLI

Titolo deve essere:

* specifico;
* breve;
* informativo;
* non sensazionalistico.

Preferire:

```text
Via X chiusa per lavori fino a venerdì
```

Evitare:

```text
INCREDIBILE! STRADA COMPLETAMENTE DISTRUTTA!!!
```

---

# EXCERPT

Massimo una o due frasi.

Deve spiegare articolo senza duplicare titolo.

Non generare estratti casuali se autore ne fornisce uno.

---

# CONTENUTO

Supportare almeno:

* paragrafi;
* titoli;
* liste;
* citazioni;
* immagini;
* link;
* tabelle;
* callout;
* mappe;
* embed autorizzati.

Non inserire HTML arbitrario senza sanitizzazione.

---

# FONTI

Ogni articolo informativo dovrebbe avere fonte quando contenuto deriva da fonte esterna.

Formato:

```text
Fonte: Comune di Rodigo
```

oppure:

```text
Fonte: MeteoMincio
```

oppure:

```text
Fonte: [nome fonte]
```

Link alla fonte quando disponibile.

---

# ATTRIBUZIONE

Separare:

```text
Fonte
Autore
Fotografo
Organizzatore
```

Non usare questi campi come sinonimi.

---

# LOCALITÀ

Articolo può collegarsi a:

* luogo;
* strada;
* attività;
* servizio;
* evento;
* coordinate.

Esempio:

```json
"relatedPlaces": ["place-023"]
```

Questo permette collegamenti automatici tra giornale e atlante.

---

# TAG

Tag devono essere utili alla ricerca.

Esempi:

```text
mincio
valli
viabilità
scuola
evento
sport
ambiente
```

Non creare sinonimi inutili.

Usa tassonomia controllata.

---

# ARTICOLI IN EVIDENZA

`featured: true` significa articolo evidenziabile.

Non significa automaticamente articolo principale per sempre.

Home deve applicare ordine:

1. breaking attivo;
2. featured recente;
3. contenuto recente;
4. archivio.

Mai mostrare articolo vecchio solo perché `featured` senza limite temporale.

---

# BREAKING

`breaking: true` deve avere durata controllata.

Prevedi:

```ts
breakingUntil?: string;
```

Dopo scadenza:

```text
breaking = false
```

Non lasciare "BREAKING" permanente.

---

# PINNED

Prevedi:

```ts
pinned?: boolean;
```

Usalo per comunicazioni operative importanti.

Esempi:

* lavori;
* chiusure;
* avvisi;
* eventi prossimi.

Non usare pin per promozione.

---

# PRIORITÀ

Prevedi valore:

```ts
priority?: 1 | 2 | 3 | 4 | 5;
```

Uso:

```text
1 = ordinario
2 = rilevante
3 = importante
4 = urgente
5 = emergenza
```

Priorità deve essere editoriale, non automatica.

---

# SCORING HOME

Home può calcolare ordine combinando:

* recenza;
* priorità;
* breaking;
* featured;
* prossimità temporale evento;
* rilevanza locale.

Non usare algoritmo opaco che rende impossibile capire perché articolo appare.

Per dataset piccoli, ordinamento semplice è preferibile.

---

# EVENTI

Per articoli tipo `event`:

Mostra automaticamente:

```text
DATA
ORA
LUOGO
ORGANIZZATORE
```

Se evento è passato:

```text
Evento concluso
```

Articolo resta nell'archivio.

---

# AVVISI TEMPORANEI

Avvisi possono avere:

```ts
validFrom?: string;
validUntil?: string;
```

Quando scaduti:

* rimuovere dalla priorità Home;
* conservare in archivio;
* non cancellare.

---

# GALLERIE

Galleria può collegarsi ad articolo.

Ogni immagine deve seguire `IMAGES.md`.

Supporta:

* caption;
* credit;
* alt;
* ordine;
* apertura lightbox.

---

# MAPPA NELL'ARTICOLO

Articolo territoriale può mostrare mappa.

Possibili dati:

```text
location
relatedPlaces
relatedStreets
relatedEvents
```

La mappa deve usare dati reali.

Non creare coordinate a mano quando esiste elemento già presente nel database.

---

# ARTICOLI CORRELATI

Mostra automaticamente:

```text
Articoli correlati
```

Basandosi su:

* categoria;
* tag;
* luogo;
* attività;
* evento;
* prossimità temporale.

Non mostrare articoli casuali.

---

# ARCHIVIO

Pagina:

```text
/giornale
```

Funzioni:

* ricerca;
* categoria;
* anno;
* mese;
* tag;
* località;
* fonte.

---

# URL

Slug leggibile:

```text
/giornale/2026/09/via-roma-chiusa-per-lavori
```

Slug stabile.

Non cambiare URL a ogni modifica titolo.

---

# SEO

Ogni articolo deve supportare:

* title;
* description;
* canonical;
* Open Graph;
* `Article` structured data;
* data pubblicazione;
* data modifica;
* autore quando disponibile;
* immagine quando disponibile.

Non usare structured data per dati non visibili nella pagina.

---

# SOCIAL PREVIEW

Ogni articolo dovrebbe generare:

```text
og:title
og:description
og:image
og:url
```

Immagine deve essere realmente associata all'articolo.

---

# SITEMAP

Articoli pubblicati devono entrare nella sitemap quando appropriato.

Draft e scheduled non devono comparire pubblicamente.

---

# ACCESSIBILITÀ

Articolo deve usare struttura semantica:

```html
<article>
  <header>...</header>
  <div>...</div>
</article>
```

Titoli gerarchici.

Link comprensibili.

Immagini con alt.

Video con controlli accessibili.

---

# MEDIA

Supporta:

```text
image
gallery
video
document
map
embed
```

Non usare media come sostituto del testo informativo.

---

# SICUREZZA

Contenuti caricati manualmente devono essere sanitizzati.

Mai consentire script arbitrari.

Gestire:

* HTML;
* URL;
* iframe;
* file;
* immagini;
* embed.

Whitelist per embed esterni.

---

# MODIFICA ARTICOLO

Quando Claude modifica articolo esistente:

* mantieni `id`;
* mantieni URL;
* aggiorna `updatedAt`;
* non modificare `publishedAt`;
* non perdere fonte;
* non perdere immagini;
* non duplicare articolo.

---

# VERSIONAMENTO

Per modifiche importanti prevedi storico:

```ts
revisions?: {
  id: string;
  createdAt: string;
  changes: string;
}[];
```

Non obbligare revisioni complete se sistema è volutamente statico.

---

# DATI MANUALI

Poiché contenuti vengono caricati manualmente, sistema deve essere semplice.

Formato consigliato:

```text
data/
  journal/
    2026/
      2026-09.json
```

oppure:

```text
data/
  journal.json
```

Scegli struttura coerente con dimensione reale dataset.

Non frammentare inutilmente piccoli dataset.

---

# GENERAZIONE DA CLAUDE

Claude Code / Fable 5.1 deve poter ricevere una richiesta come:

```text
Crea articolo giornale:
tipo: avviso
titolo: ...
data: ...
luogo: ...
testo: ...
fonte: ...
```

Claude deve:

1. validare campi;
2. scegliere schema corretto;
3. generare ID;
4. creare slug;
5. inserire fonte;
6. impostare timestamp;
7. collegare entità esistenti;
8. verificare duplicati;
9. aggiornare dataset;
10. verificare rendering Home;
11. verificare pagina articolo;
12. verificare archivio.

Non creare duplicati.

---

# DUPLICATI

Prima di creare articolo cerca:

* stesso titolo;
* stesso evento;
* stessa data;
* stesso luogo;
* stesso slug;
* stesso ID esterno quando presente.

Se articolo esiste:

**aggiorna**, non duplicare.

---

# CORREZIONI

Errore fattuale deve essere corretto.

Quando correzione è significativa:

```text
Correzione pubblicata il ...
```

Non nascondere modifica importante.

---

# CONTENUTI SCADUTI

Non cancellare automaticamente.

Classifica:

```text
active
expired
archived
```

Home mostra solo contenuti rilevanti.

Archivio conserva memoria.

---

# ORDINE CRONOLOGICO

Default:

**più recente prima**

Eccezioni:

* breaking;
* pinned;
* featured;
* eventi futuri;
* contenuti editorialmente prioritari.

---

# HOME MOBILE

Mobile deve mostrare rapidamente:

```text
GIORNALE

[Breaking se presente]

[Articolo principale]

[2–4 articoli]

Vedi tutto
```

Non creare muro di card.

---

# HOME DESKTOP

Può usare:

```text
┌───────────────────────────────┐
│         ARTICOLO PRINCIPALE   │
├──────────────┬────────────────┤
│ articolo     │ articolo       │
├──────────────┴────────────────┤
│ ultimi aggiornamenti          │
└───────────────────────────────┘
```

Layout reale deve seguire `GRID.md`.

---

# REDAZIONE

Il sistema deve distinguere:

```text
dato
notizia
opinione
evento
avviso
documento
```

Non presentare opinione come fatto.

Per contenuti controversi mantenere formulazione attribuita e verificabile.

---

# PUBBLICAZIONE

Prima di pubblicare verifica:

* titolo;
* categoria;
* data;
* fonte;
* località;
* immagine;
* link;
* grammatica;
* duplicati;
* slug;
* mobile;
* SEO.

---

# CHECKLIST CLAUDE

Ogni nuova notizia:

```text
[ ] tipo corretto
[ ] titolo preciso
[ ] testo completo
[ ] data corretta
[ ] fonte
[ ] località
[ ] immagine verificata
[ ] slug
[ ] ID univoco
[ ] nessun duplicato
[ ] collegamenti esistenti
[ ] Home aggiornata
[ ] archivio aggiornato
[ ] SEO aggiornato
[ ] responsive verificato
```

---

# REGOLA EDITORIALE

Non tutto deve diventare articolo.

Usa articolo quando informazione ha valore nel tempo o interesse locale.

Usa dataset quando informazione è strutturale.

Usa evento quando informazione è principalmente appuntamento.

Usa avviso quando informazione è operativa e temporanea.

Usa mappa quando posizione è parte centrale dell'informazione.

Usa documento quando fonte primaria è il documento.

---

# REGOLA FINALE

**GIORNALE = informazione locale strutturata.**

Home mostra ciò che conta adesso.

Archivio conserva ciò che è successo.

Mappa collega notizie al territorio.

Dati collegano articoli alle entità reali.

Fonti rendono contenuto verificabile.

Claude deve poter creare, aggiornare, correggere, archiviare e collegare ogni articolo senza inventare dati né rompere struttura del progetto.
