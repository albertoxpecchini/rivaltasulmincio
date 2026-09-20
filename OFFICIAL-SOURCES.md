# OFFICIAL-SOURCES.md

## Scopo

Definisci sistema **fonte ufficiale** per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Fonte istituzionale principale per informazioni ufficiali:

```text
Comune di Rodigo
https://www.comune.rodigo.mn.it/
```

Il Comune di Rodigo è riferimento principale per informazioni amministrative ufficiali relative a Rivalta sul Mincio quando pubblicate dal Comune.

## Principio

Informazione ufficiale deve essere chiaramente distinguibile da:

* dati geografici;
* stampa locale;
* attività private;
* associazioni;
* testimonianze;
* contenuti editoriali;
* fonti secondarie.

Usa un sistema visivo simile al **badge verificato** dei social.

Non chiamarlo "certificato" se certificazione non esiste.

## Badge ufficiale

Nome interno:

```text
official
```

Aspetto:

```text
✓ blu
```

Il badge indica:

> **Fonte ufficiale verificata**

Non indica:

* qualità del contenuto;
* approvazione editoriale del progetto;
* patrocinio;
* collaborazione;
* accuratezza di contenuti provenienti da altre fonti.

## Badge UI

Esempio:

```text
Comune di Rodigo   ✓
Fonte ufficiale
```

oppure compatto:

```text
Comune di Rodigo  [✓]
```

Tooltip:

```text
Fonte ufficiale del Comune di Rodigo
```

Su mobile mostra badge compatto.

## Regola fondamentale

Il badge deve comparire solo quando origine informazione è effettivamente il Comune o risorsa ufficiale direttamente riconducibile al Comune.

Non assegnare badge perché:

* sito sembra istituzionale;
* dominio sembra credibile;
* attività dichiara di essere ufficiale;
* articolo cita il Comune;
* fonte secondaria parla del Comune.

## Dominio ufficiale

Dominio principale:

```text
https://www.comune.rodigo.mn.it/
```

Risorse ospitate sul dominio possono essere trattate come ufficiali quando appartengono effettivamente al Comune.

Verifica sempre contesto e pagina.

Non considerare automaticamente ufficiale ogni URL esterno semplicemente collegato dal sito.

## Informazioni ufficiali da integrare

Prevedi raccolta strutturata di:

### Uffici

* nome ufficio;
* competenza;
* indirizzo;
* piano;
* telefono;
* email;
* PEC;
* orari;
* responsabile quando pubblicato;
* servizi;
* pagina ufficiale.

### Sedi

* Comune;
* uffici;
* biblioteca;
* scuole quando informazioni comunali;
* impianti;
* strutture pubbliche;
* altri edifici pubblici.

### Orari

Supporta:

* lunedì;
* martedì;
* mercoledì;
* giovedì;
* venerdì;
* sabato;
* domenica;
* festività;
* chiusure straordinarie;
* appuntamento obbligatorio.

Non trasformare orario assente in "chiuso".

Usa:

```text
Orario non disponibile
```

quando fonte non fornisce dato.

### Contatti

Supporta:

```text
telefono
email
PEC
fax
sito
modulo online
social ufficiale
```

Mostra ogni contatto con tipo corretto.

Non confondere email ordinaria e PEC.

### Avvisi

Importa o collega:

* avvisi;
* comunicazioni;
* ordinanze;
* chiusure;
* modifiche servizi;
* lavori;
* scadenze;
* comunicazioni amministrative.

Ogni avviso deve avere:

```text
titolo
data
validità
fonte
URL ufficiale
categoria
```

### Aller­te

Supporta:

* allerte;
* comunicazioni Protezione Civile;
* rischio idraulico;
* rischio meteorologico;
* chiusure;
* emergenze;
* comunicazioni urgenti.

Distinguere:

```text
allerta ufficiale
avviso
notizia
previsione
```

Non trasformare previsione meteo in allerta comunale.

### Documenti

Supporta:

* PDF;
* determine quando pertinenti;
* ordinanze;
* modulistica;
* regolamenti;
* comunicati;
* calendari;
* documentazione pubblica.

Linkare documento originale.

Non ospitare copia locale se non necessario.

### Eventi

Quando evento è pubblicato dal Comune:

```text
Fonte ufficiale
```

Se evento è semplicemente citato dal Comune ma organizzato da terzi:

```text
Fonte: Comune di Rodigo
Organizzatore: [ente reale]
```

Non confondere fonte con organizzatore.

## Schema fonte

```ts
type OfficialSource = {
  id: string;

  name: string;
  type: "municipality" | "public-office" | "public-service" | "other";

  url: string;
  domain: string;

  verified: boolean;
  verifiedAt?: string;

  badge: "official";

  contact?: {
    phone?: string;
    email?: string;
    pec?: string;
    address?: string;
  };

  lastChecked?: string;
};
```

## Schema informazione ufficiale

```ts
type OfficialInformation = {
  id: string;

  title: string;
  category:
    | "office"
    | "hours"
    | "contact"
    | "alert"
    | "notice"
    | "ordinance"
    | "service"
    | "event"
    | "document"
    | "closure"
    | "works"
    | "other";

  content?: string;

  source: OfficialSource;

  sourceUrl: string;

  publishedAt?: string;
  validFrom?: string;
  validUntil?: string;

  updatedAt?: string;

  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };

  status:
    | "active"
    | "expired"
    | "archived";
};
```

## Uffici in Home

Quando esiste informazione importante dal Comune, Home può mostrare blocco:

```text
COMUNE DI RODIGO

● Informazioni ufficiali

Uffici
Orari
Avvisi
Allerte
Servizi
Contatti

[Visita sito ufficiale]
```

Non trasformare Home in portale comunale.

Il Comune resta una fonte dentro atlante.

## Sezione ufficiale

Prevedi:

```text
/ufficiale
```

oppure:

```text
/fonti/comune-rodigo
```

Contenuti:

* informazioni comunali;
* uffici;
* contatti;
* orari;
* avvisi;
* allerte;
* documenti;
* servizi;
* link ufficiali.

## Schede ufficiali

Ogni informazione ufficiale può mostrare:

```text
✓ Fonte ufficiale

Comune di Rodigo

Titolo
Contenuto

Pubblicato: ...
Aggiornato: ...

[Apri fonte ufficiale]
```

## Dati aggiornati

Visualizza:

```text
Ultima verifica:
20 settembre 2026
```

oppure:

```text
Verifica automatica:
20 settembre 2026, 21:20
```

Non mostrare "aggiornato" se hai solo verificato che pagina esiste.

Distinguere:

```text
pubblicato
aggiornato
verificato dal progetto
```

## Sincronizzazione

Quando tecnicamente possibile:

```text
Comune di Rodigo
        ↓
pagina / feed / API / dataset
        ↓
parser
        ↓
normalizzazione
        ↓
dataset locale
        ↓
UI
```

Preferenza:

1. API;
2. JSON;
3. RSS/feed;
4. dati strutturati;
5. pagina ufficiale;
6. scraping solo quando necessario e consentito.

## No copia inutile

Non duplicare integralmente grandi pagine del Comune.

Conserva:

* dati necessari;
* metadati;
* URL originale;
* timestamp;
* fonte.

Linkare la pagina ufficiale quando contenuto completo è già disponibile.

## Aggiornamenti

Per informazioni dinamiche:

* controlla periodicamente;
* aggiorna dataset;
* conserva data ultimo controllo;
* mantieni contenuti scaduti nell'archivio quando utili.

## Scadenza

Informazioni temporanee possono avere:

```ts
validFrom
validUntil
```

Quando `validUntil` è passato:

* rimuovi priorità Home;
* mantieni archivio;
* mantieni fonte;
* marca come scaduto.

## Conflitto fonti

Priorità per informazione amministrativa:

```text
Comune di Rodigo
>
altre fonti istituzionali pertinenti
>
stampa locale
>
fonti secondarie
>
contenuti utenti
```

Se fonti ufficiali diverse sono in conflitto:

non scegliere arbitrariamente.

Mostra fonte, data e differenza.

## Contenuti di Rivalta

Quando Comune pubblica informazione specificamente relativa a Rivalta sul Mincio:

assegna collegamento territoriale:

```ts
relatedPlaces: ["rivalta-sul-mincio"]
```

Così informazione appare anche in:

* pagina Rivalta;
* mappa quando pertinente;
* archivio;
* ricerca;
* Home.

## Ricerca

La ricerca deve includere fonti ufficiali.

Esempi:

```text
"orari Comune"
"ufficio anagrafe"
"avviso Rivalta"
"ordinanza"
"PEC"
"servizi"
```

Badge visibile nei risultati ufficiali.

## Filtri

Archivio ufficiale filtrabile per:

* categoria;
* ufficio;
* data;
* stato;
* validità;
* fonte.

## Badge nei risultati

Esempio:

```text
Via X chiusa per lavori

✓ Comune di Rodigo
20 settembre 2026
```

Contenuti non ufficiali non devono avere stesso badge.

## Colore badge

Usa blu dedicato.

Definisci token in `COLORS.md`:

```css
--color-official: #1877F2;
```

Valore può essere modificato durante implementazione dopo verifica contrasto.

Non usare blu badge per categorie normali.

## Icona badge

Preferire:

```text
CircleCheck
```

oppure simbolo SVG equivalente.

Icona deve seguire `ICONS.md`.

Non usare immagine screenshot di badge Instagram.

Il riferimento Instagram riguarda **concetto visivo**, non copia del componente.

## Accessibilità

Badge deve avere testo o label accessibile:

```html
<span aria-label="Fonte ufficiale">
  ...
</span>
```

Non comunicare ufficialità soltanto tramite colore.

## Link

Pulsante:

```text
Apri fonte ufficiale
```

deve aprire URL originale.

Quando apre sito esterno, comportamento deve essere coerente con `INTEGRATIONS.md` / policy link.

## Sicurezza

Non considerare automaticamente affidabile contenuto solo perché URL appartiene al Comune.

Verifica:

* dominio;
* HTTPS;
* pagina;
* contesto;
* data;
* autenticità;
* eventuale redirect.

## Privacy

Non importare automaticamente:

* dati personali non necessari;
* numeri personali di dipendenti;
* email personali;
* informazioni riservate.

Pubblica solo informazioni istituzionali pertinenti già rese pubbliche dalla fonte e necessarie al servizio.

## Social ufficiali

Se Comune indica social ufficiali sul proprio sito, possono essere collegati come canali ufficiali.

Badge ufficiale deriva dalla verifica della fonte, non dal semplice username.

## Email

Distinguere:

```text
email
PEC
```

Esempi schema:

```ts
contactType: "email" | "pec"
```

Non mostrare PEC come email normale senza etichetta.

## Orari

Supporta orari multipli nello stesso giorno:

```text
09:00–12:30
14:00–16:30
```

Supporta:

```text
su appuntamento
chiuso
orario straordinario
festivo
```

## Allerte Home

Quando esiste allerta ufficiale attiva, Home può mostrare banner:

```text
✓ COMUNICAZIONE UFFICIALE

[ Titolo ]

Valida fino al ...
Comune di Rodigo

[Leggi]
```

Banner deve avere priorità elevata senza oscurare l'intero sito.

## Breaking ufficiale

Un comunicato ufficiale può diventare `breaking` solo quando contenuto realmente urgente.

Non ogni comunicato comunale è breaking.

## Storico

Mantieni archivio:

```text
2026
2025
2024
...
```

quando dati disponibili.

Non eliminare automaticamente vecchie comunicazioni.

## Provenienza

Ogni record ufficiale deve mantenere:

```text
source
sourceUrl
publishedAt
updatedAt
lastChecked
```

Questi dati sono parte del record, non testo libero.

## Metodo di verifica

Claude deve poter verificare:

```text
1. dominio
2. pagina
3. contenuto
4. data
5. validità
6. collegamento a Rivalta
7. duplicato
8. eventuale aggiornamento
```

## Claude Code / Fable 5.1

Claude deve già conoscere questa regola:

> Quando serve informazione ufficiale su Rivalta sul Mincio o Rodigo, controlla prima il sito ufficiale del Comune di Rodigo.

Prima di creare dato ufficiale:

* cerca fonte;
* verifica pagina;
* estrai solo dati pertinenti;
* conserva URL;
* conserva data;
* collega Rivalta;
* evita duplicati;
* aggiorna record esistente quando necessario.

Non inventare informazioni mancanti.

## Regola finale

**Comune di Rodigo = fonte istituzionale primaria per informazioni comunali ufficiali.**

**Badge blu = fonte ufficiale verificata.**

**Badge non significa approvazione del progetto.**

Ogni informazione ufficiale deve restare collegata alla propria fonte originale.
