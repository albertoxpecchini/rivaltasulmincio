# OSM.md

## Scopo

Definisci uso di **OpenStreetMap** per **Rivalta sul Mincio — il paese, in ogni suo dato**.

OpenStreetMap è fonte geografica primaria del progetto per dati cartografici e territoriali disponibili.

Sito:

```text
https://www.openstreetmap.org/
```

## Principio

Usa OSM per rappresentare ciò che esiste fisicamente o geograficamente.

Esempi:

* strade;
* edifici;
* sentieri;
* parcheggi;
* fermate;
* attività;
* servizi;
* punti di interesse;
* corsi d'acqua;
* aree verdi;
* infrastrutture;
* elementi geografici.

Non usare OSM come fonte primaria per:

* orari ufficiali;
* comunicati;
* allerte;
* eventi non mappati;
* dati amministrativi non presenti;
* informazioni editoriali.

Per questi dati usa fonti specifiche.

## OSM come dataset

Separare chiaramente:

```text
OpenStreetMap
↓
dati geografici
↓
normalizzazione progetto
↓
database / JSON
↓
mappa + ricerca + schede
```

Non inserire direttamente logica OSM nei componenti UI.

## API

Quando possibile usa API appropriate.

### Overpass API

Usa **Overpass API** per interrogazioni geografiche complesse.

Esempi:

* tutte attività;
* tutti parcheggi;
* tutte fermate;
* tutti edifici;
* tutti servizi;
* elementi entro area Rivalta.

Non interrogare Overpass direttamente a ogni caricamento pagina.

Preferire sincronizzazione/cache.

### Nominatim

Usa **Nominatim** per:

* geocoding;
* reverse geocoding;
* ricerca indirizzi;

quando compatibile con policy e limiti del servizio.

Non usarlo come motore di ricerca ad alto traffico senza rispettarne policy e rate limit.

## Tile

Mappa interattiva può usare tile OSM o provider compatibile.

Non presumere che `tile.openstreetmap.org` sia CDN gratuita illimitata.

Verifica sempre:

* policy tile;
* usage policy;
* User-Agent;
* caching;
* attribution;
* limiti traffico.

Per produzione ad alto traffico valuta provider tile dedicato.

## Attribution

Quando usi dati OSM, mostra attribuzione appropriata.

Formato minimo tipico:

```text
© OpenStreetMap contributors
```

Link:

```text
https://www.openstreetmap.org/copyright
```

Attribuzione deve essere leggibile nella mappa e non nascosta.

## Licenza

OpenStreetMap usa:

**ODbL — Open Data Commons Open Database License**

Claude deve verificare requisiti aggiornati prima di redistribuire dati derivati.

Non assumere che dati OSM siano "senza condizioni".

## Dati derivati

Quando progetto modifica, filtra o combina dati OSM:

mantieni tracciabilità della provenienza.

Esempio:

```json
{
  "source": "OpenStreetMap",
  "sourceUrl": "https://www.openstreetmap.org/",
  "license": "ODbL"
}
```

Quando possibile conserva anche:

```text
osmType
osmId
```

## OSM ID

Ogni elemento OSM importante può mantenere identificatore originale.

Esempio:

```ts
type OSMReference = {
  osmType: "node" | "way" | "relation";
  osmId: number;
};
```

Questo permette:

* aggiornamento;
* deduplicazione;
* tracciabilità;
* collegamento alla fonte.

## URL elemento

Quando disponibile:

```text
https://www.openstreetmap.org/node/...
https://www.openstreetmap.org/way/...
https://www.openstreetmap.org/relation/...
```

Non costruire URL con ID errato.

## Import geografico

Importa solamente elementi pertinenti a Rivalta sul Mincio.

Non scaricare intera Lombardia se non necessaria.

Definisci area tramite:

* confine amministrativo quando affidabile;
* bounding box;
* polygon;
* relazione OSM appropriata.

## Area Rivalta

Rivalta deve essere identificata come luogo geografico reale.

Non usare soltanto stringa `"Rivalta"` per query.

Disambiguare:

```text
Rivalta sul Mincio
Comune di Rodigo
Provincia di Mantova
Lombardia
Italia
```

## Query Overpass

Le query devono essere:

* specifiche;
* limitate geograficamente;
* efficienti;
* versionate quando importanti.

Esempio concettuale:

```text
[out:json];
area["name"="Rivalta sul Mincio"]->.searchArea;
(
  nwr["amenity"](area.searchArea);
  nwr["shop"](area.searchArea);
);
out center;
```

Non usare query generiche enormi in produzione.

Prima verifica che area identificata sia corretta.

## Tipi OSM

Gestisci almeno:

```text
node
way
relation
```

Per `way` e `relation`, usa `center` o geometria reale quando necessario.

Non assumere che ogni elemento abbia coordinate dirette.

## Geometrie

Supporta:

* Point;
* LineString;
* Polygon;
* MultiPolygon.

Per UI semplice puoi usare centroidi.

Per visualizzazione territoriale precisa conserva geometria quando necessaria.

## Tags

OSM usa tag chiave/valore.

Esempi:

```text
amenity=pharmacy
amenity=school
shop=supermarket
highway=road
leisure=park
natural=water
tourism=...
```

Non codificare manualmente ogni combinazione nei componenti.

Crea mapper centralizzato.

## Mapping categorie

Crea normalizzazione:

```text
OSM tag
↓
categoria progetto
↓
icona
↓
colore
↓
tipo scheda
```

Esempio:

```text
amenity=pharmacy
        ↓
Servizi
        ↓
Farmacia
        ↓
icona Pharmacy
```

Categorie progetto devono essere stabili anche quando OSM cambia dettagli.

## Dati incompleti

OSM può contenere dati mancanti.

Non trasformare assenza tag in informazione negativa.

Esempio:

```text
phone assente
```

significa:

**telefono non disponibile da OSM**

non:

**telefono inesistente**.

## Dati errati

Il progetto non deve correggere direttamente OSM da interfaccia utente salvo workflow esplicito.

Se dato appare errato:

* segnala;
* verifica altra fonte;
* collega elemento OSM;
* valuta modifica su OSM separatamente.

Non sovrascrivere silenziosamente dati OSM.

## Modifiche OSM

Il progetto non deve modificare automaticamente OpenStreetMap.

Eventuale editing richiede workflow separato e deliberato.

Non inserire API write token OSM nel frontend.

Non inserire credenziali OSM nel repository.

## Dati locali + OSM

Quando stessa entità esiste in OSM e dataset locale:

collega record invece di duplicarlo.

Schema:

```ts
{
  id: "business-001",
  name: "...",
  osm: {
    osmType: "node",
    osmId: 123456
  },
  ...
}
```

## Priorità dati

Per informazioni geografiche:

```text
OSM
>
dataset geografico ufficiale specifico
>
altre fonti geografiche
```

Per informazioni non geografiche:

```text
fonte tematica competente
>
OSM
```

Esempio:

Orari Comune:

```text
Comune di Rodigo
>
OSM
```

Posizione attività:

```text
OSM
+
fonte attività
```

## Conflitti

Se OSM e fonte ufficiale differiscono:

non scegliere automaticamente.

Salva provenienza.

Esempio:

```text
Posizione OSM: ...
Indirizzo ufficiale: ...
```

Poi determina quale informazione serve allo specifico contesto.

## Attività

Per attività locali OSM può fornire:

* nome;
* categoria;
* indirizzo;
* posizione;
* sito;
* telefono;
* orari quando presenti.

Non assumere completezza.

Per attività ufficialmente attive, confronta con fonte diretta quando necessario.

## Attività chiuse

OSM può indicare elementi rimossi o modificati.

Non cancellare automaticamente archivio progetto.

Mantieni distinzione:

```text
OSM current
project archive
```

## Strade

OSM è fonte primaria per rete stradale visualizzata.

Supporta:

* nome;
* classificazione;
* geometria;
* senso unico;
* accesso;
* superficie;
* limite quando disponibile;
* percorsi pedonali/ciclabili quando mappati.

Non mostrare attributo come certo se tag manca.

## Numeri civici

Quando disponibili usa:

```text
addr:housenumber
addr:street
addr:postcode
```

Normalizza senza perdere dato originale.

Non inventare civici mancanti.

## Edifici

Supporta:

* footprint;
* livelli quando presenti;
* tipo;
* nome;
* uso.

Non inferire uso dell'edificio solamente dalla forma.

## Servizi

Map servizi tramite tag OSM.

Esempi:

```text
amenity
healthcare
office
public_transport
leisure
```

Mappatura categoria centralizzata.

## Natura

Supporta:

* acqua;
* verde;
* boschi;
* aree naturali;
* sentieri;
* punti panoramici;
* elementi ambientali.

Quando area è parte di Riserva Naturale, verifica anche fonte istituzionale.

OSM descrive geometria.

Fonte istituzionale descrive status e tutela.

## Mincio

Per Mincio usa geometrie OSM per rappresentazione cartografica.

Dati come:

* livello;
* portata;
* allerta;
* qualità acqua;

devono arrivare da fonti specifiche.

Non dedurli da OSM.

## Riserva Naturale Valli del Mincio

OSM può fornire geometria o POI.

Status, vincoli e informazioni ufficiali devono essere verificati tramite fonte istituzionale competente.

Non usare OSM come prova giuridica del confine se serve precisione normativa.

## Ricerca

Ricerca globale deve includere dati OSM normalizzati.

Esempi:

```text
Via Roma
farmacia
parcheggio
chiesa
argine
sentiero
```

Indicatore fonte:

```text
OpenStreetMap
```

quando risultato deriva direttamente da OSM.

## Schede

Scheda elemento OSM può mostrare:

```text
Nome
Categoria
Indirizzo
Mappa
Attributi disponibili
Fonte
Ultimo aggiornamento
```

Non mostrare tutti i raw tag all'utente normale.

Prevedi eventualmente "Dati tecnici" per utenti avanzati.

## Raw OSM

Mantieni raw data separati dalla normalizzazione quando necessario.

Struttura possibile:

```text
data/
  osm/
    raw/
    normalized/
```

Non duplicare dataset enormi senza motivo.

## Sincronizzazione

Definisci processo:

```text
fetch
↓
validate
↓
normalize
↓
deduplicate
↓
diff
↓
update
↓
cache
```

Non sostituire dataset cieco senza confronto.

## Diff

Confronta:

* aggiunti;
* modificati;
* rimossi;
* spostati;
* rinominati.

Questo permette aggiornamenti controllati.

## Frequenza

Non interrogare OSM inutilmente.

Frequenza dipende dal tipo dato.

Indicazione:

```text
mappa live:
provider tile

POI:
sync periodica

dataset stabile:
cache lunga

ricerca:
indice locale
```

## Cache

Cache deve avere:

* timestamp;
* fonte;
* versione/schema;
* eventuale expiry.

Non presentare cache vecchia come live.

## Rate limit

Rispetta limiti del provider.

Non fare:

```text
una richiesta Overpass per ogni card
```

Precarica dataset necessario.

## Fallback

Se servizio OSM temporaneamente non disponibile:

* usa cache valida;
* mostra mappa disponibile quando possibile;
* non bloccare resto del sito.

Stato possibile:

```text
Dati cartografici temporaneamente non aggiornabili.
Ultimo aggiornamento: ...
```

## Tile offline/cache

Non creare sistema di tile caching aggressivo senza verificare policy provider.

Per esigenze elevate usa provider compatibile e documentato.

## Performance mappa

Ottimizza:

* numero marker;
* clustering;
* layer;
* geometrie;
* viewport;
* lazy loading;
* query.

Non renderizzare migliaia di marker individuali senza clustering.

## Clustering

Quando molti POI sono visibili:

```text
marker singoli
↓
cluster
```

Cluster deve mostrare conteggio.

Zoom deve espandere progressivamente.

## Mobile

Mappa deve supportare:

* pinch zoom;
* pan;
* tap marker;
* bottom sheet;
* geolocalizzazione solo con consenso browser.

Non richiedere posizione utente per mostrare Rivalta.

## Desktop

Supporta:

* mouse wheel;
* drag;
* zoom;
* hover quando utile;
* pannello laterale;
* tastiera per controlli UI.

## Geolocalizzazione utente

Quando usata:

* chiedi permesso browser;
* spiega funzione;
* non salvare posizione senza necessità;
* non inviare coordinate a server senza motivo.

## Sicurezza

Non esporre:

* API key segrete;
* credenziali provider;
* token write OSM;
* secret server.

Chiavi pubbliche consentite solo quando provider le considera pubblicabili.

## SEO

Mappa non deve essere unico contenuto indicizzabile.

Ogni luogo importante deve avere contenuto HTML accessibile.

Esempio:

```text
/mappa
/luoghi/chiesa-di-rivalta
/attivita/...
```

Mappa arricchisce contenuto.

Non sostituisce contenuto semanticamente leggibile.

## Accessibilità

Mappa interattiva deve avere alternativa informativa.

Ogni elemento selezionabile deve avere:

* nome;
* categoria;
* stato;
* posizione testuale quando utile.

Non rendere mappa unico modo per scoprire informazione.

## Attribution UI

Mantieni attribuzione OSM sempre accessibile.

Esempio:

```text
© OpenStreetMap contributors
```

Link copyright.

Se provider tile richiede ulteriore attribuzione, aggiungila.

## Screenshot

Non usare screenshot statici della mappa come soluzione predefinita.

Preferire mappa interattiva quando esplorazione geografica è necessaria.

## Test

Verifica:

```text
[ ] attribution
[ ] tile provider
[ ] Overpass
[ ] Nominatim
[ ] rate limit
[ ] cache
[ ] clustering
[ ] mobile
[ ] desktop
[ ] keyboard
[ ] accessibility
[ ] source URLs
[ ] OSM IDs
[ ] deduplication
[ ] geometry
[ ] stale data
```

## Anti-regressione

Prima di modificare integrazione OSM:

1. controlla provider;
2. controlla policy;
3. controlla query;
4. controlla area;
5. controlla schema;
6. controlla attribution;
7. controlla cache;
8. controlla performance;
9. controlla mobile;
10. controlla eventuali duplicati.

## Regola finale

**OSM descrive geografia. Fonte ufficiale descrive amministrazione. Fonte tematica descrive dati specialistici.**

Usa OSM profondamente.

Non usarlo per informazioni che OSM non può garantire.

Mantieni sempre:

**fonte + ID + licenza + timestamp + geometria + normalizzazione.**
