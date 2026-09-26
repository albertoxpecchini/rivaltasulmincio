# WEATHER.md

## Scopo

Definisci integrazione meteo per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Fonte locale di riferimento richiesta:

```text
https://www.meteomincio.it/
```

Non assumere struttura, API o dati disponibili su `meteomincio.it` senza verificarli nel progetto.

## Principio

Meteo deve essere trattato come **dato locale**, non come decorazione.

Mostra quando disponibile:

* temperatura;
* temperatura percepita;
* condizioni;
* precipitazioni;
* probabilità precipitazioni;
* vento;
* raffiche;
* direzione vento;
* umidità;
* pressione;
* visibilità;
* indice UV;
* alba;
* tramonto;
* dati giornalieri;
* previsione oraria;
* previsione giornaliera;
* eventuali dati sul Mincio.

## Fonte principale

Usa `meteomincio.it` quando fornisce dati utilizzabili per Rivalta sul Mincio.

Claude deve prima verificare:

* pagina specifica Rivalta;
* endpoint API;
* JSON incorporati;
* feed;
* dati strutturati;
* URL dinamici;
* eventuali script che contengono dati;
* licenza;
* condizioni d'uso;
* attribuzione richiesta.

Non fare scraping se esiste API o feed ufficiale.

## Regola fonte

Non copiare manualmente previsioni nel repository.

Previsioni cambiano continuamente.

Preferire:

```text
meteomincio.it
        ↓
fetch/API/feed
        ↓
normalizzazione
        ↓
Weather component
```

## Fallback

Prevedi fallback solo quando fonte primaria non è disponibile.

Ordine:

```text
MeteoMincio
↓
fonte meteorologica secondaria documentata
↓
dato non disponibile
```

Non mischiare dati provenienti da fonti diverse senza indicarlo.

## Schema dati

Normalizza dati in formato interno:

```ts
type WeatherData = {
  location: {
    name: string;
    lat?: number;
    lon?: number;
  };
  observedAt?: string;
  temperature?: number;
  feelsLike?: number;
  condition?: string;
  precipitation?: number;
  precipitationProbability?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  visibility?: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  source: string;
  sourceUrl: string;
  updatedAt: string;
};
```

Usa solo campi realmente disponibili.

Non inventare valori mancanti.

## Località

Default:

```text
Rivalta sul Mincio
Comune di Rodigo
Mantova
Lombardia
Italia
```

Coordinate devono provenire da fonte geografica verificabile.

Non usare coordinate inventate.

## Homepage

Il meteo è il primo modulo dopo l'apertura (deciso il 26 settembre 2026: prima era un blocco compatto e secondario).

In primo piano, il pannello di adesso:

```text
ADESSO · Rivalta sul Mincio                  ● LIVE

18°          VENTO        PIOGGIA OGGI   UMIDITÀ
Sereno       8 km/h NE    0,0 mm         72 %
Percepita    Raffica …    Mese …         Pressione …

Aggiornato alle …   Fonte: MeteoMincio
```

Sotto, l'approfondimento:

* prossime ore, in una striscia che scorre di lato;
* prossimi giorni: condizione, minima, massima, pioggia;
* dalla stazione: estremi di oggi, raffica, pressione e tendenza, punto di rugiada, pioggia del mese e dell'anno, indice UV.

La pagina `/meteo` resta quella completa.

## Pagina meteo

Prevedi:

```text
/meteo
```

Sezione:

```text
Condizioni attuali
Previsione oraria
Previsione giornaliera
Vento
Precipitazioni
Sole
Dati locali
Fonte
```

## Previsione oraria

Mostra intervalli compatti:

```text
09:00
18°
☀

10:00
19°
☀

11:00
21°
🌤
```

Icone devono seguire `ICONS.md`.

Non usare emoji se sistema icone UI non le prevede.

## Previsione giornaliera

Mostra:

```text
oggi
domani
...
```

con:

* minima;
* massima;
* condizione;
* precipitazioni;
* vento quando disponibile.

## Grafici

Quando dati temporali sono disponibili, visualizza:

* temperatura;
* precipitazioni;
* vento.

Grafici devono seguire `COLORS.md`.

Non usare colori casuali.

Non nascondere valori numerici dietro grafici.

## Mincio

Quando fonte rende disponibili dati pertinenti, crea sezione:

**Condizioni del Mincio**

Possibili dati:

* livello;
* temperatura acqua;
* portata;
* stato idrologico;
* dati collegati alle Valli del Mincio.

Ogni valore deve avere fonte specifica.

Non confondere dato meteorologico con dato idrologico.

## Aggiornamento

Mostra sempre:

```text
Aggiornato alle 21:30
```

oppure:

```text
Ultimo aggiornamento: 20 settembre 2026, 21:30
```

Timestamp deve rappresentare reale aggiornamento del dato.

Non usare timestamp locale del browser come falso aggiornamento fonte.

## Cache

Previsioni possono essere cache-ate per evitare richieste inutili.

Cache duration deve dipendere dalla frequenza della fonte.

Esempio:

```text
current weather: pochi minuti
hourly forecast: decine di minuti
daily forecast: più lunga
```

Non fissare tempi arbitrari senza considerare fonte e rate limit.

## Error state

Quando fonte non risponde:

```text
Meteo temporaneamente non disponibile.
```

Non mostrare dati vecchi senza indicare che sono dati precedenti.

Possibile:

```text
Ultimo dato disponibile: ...
```

## Loading

Usa skeleton compatto.

Non bloccare homepage intera in attesa del meteo.

Meteo è contenuto secondario.

## Offline

Se esiste dato cache recente:

```text
Ultimo dato disponibile
```

con timestamp.

Non presentarlo come dato attuale.

## API

Isola integrazione:

```text
src/
  services/
    weather/
      meteomincio.ts
      normalize.ts
      types.ts
```

Componente UI non deve conoscere struttura originale della fonte.

## Adapter

Crea adapter dedicato:

```ts
interface WeatherProvider {
  getCurrent(location: string): Promise<WeatherData>;
  getForecast(location: string): Promise<WeatherForecast>;
}
```

Questo permette sostituzione fonte senza modificare UI.

## Attribution

Mostra fonte in modo chiaro:

```text
Fonte: MeteoMincio
```

Link:

```text
https://www.meteomincio.it/
```

Segui eventuali requisiti di attribuzione specifici della fonte.

## Licenza

Prima della pubblicazione verifica:

* possibilità di riutilizzo;
* API terms;
* scraping terms;
* attribuzione;
* redistribuzione;
* caching;
* uso commerciale.

Non archiviare o redistribuire dati se condizioni fonte lo vietano.

## SEO

Pagina `/meteo` può includere:

* titolo locale;
* data aggiornamento;
* contenuto testuale;
* struttura semantica.

Non creare contenuti SEO artificiali basati su dati meteorologici ripetuti.

## Accessibility

Meteo deve essere comprensibile senza colore.

Esempio:

```text
18°C · Sereno
```

non soltanto:

```text
[icona sole]
```

Grafici devono avere valori accessibili.

## Responsive

Mobile:

```text
condizioni attuali
↓
orario scroll orizzontale
↓
giorni
↓
dettagli
```

Desktop:

```text
condizioni | previsione | dettagli
```

Non creare tabella oraria troppo larga su mobile.

## Motion

Animazioni ammesse:

* cambio temperatura;
* aggiornamento icona;
* comparsa dati;
* grafico;
* transizione forecast.

Non animare continuamente sole, nuvole o vento solo per decorazione.

Rispetta `ANIMATIONS.md`.

## Performance

Meteo non deve bloccare:

* rendering;
* interazione;
* mappa;
* contenuto principale.

Carica dati in modo asincrono.

Evita richieste duplicate tra homepage e `/meteo`.

Condividi cache/store quando architettura lo permette.

## Accuratezza

Non trasformare previsioni in certezze.

Usa terminologia della fonte.

Precipitazioni devono distinguere correttamente:

* quantità;
* probabilità;
* intensità.

Non chiamare "pioggia" una probabilità senza precipitazione osservata.

## Data freshness

Visualizza stato:

```text
live
aggiornato
cache
non disponibile
```

solo quando stato è realmente noto.

## Anti-regressione

Prima di modificare integrazione:

1. verifica `meteomincio.it`;
2. verifica endpoint attuale;
3. verifica schema risposta;
4. verifica licenza;
5. verifica timestamp;
6. verifica fallback;
7. verifica cache;
8. verifica mobile;
9. verifica accessibilità;
10. verifica console e network.

Non basarsi su endpoint inventati.

## Regola finale

**Meteo locale, fonte tracciabile, dato aggiornato, fallback chiaro.**

`meteomincio.it` deve essere integrato come fonte dati, non semplicemente mostrato dentro un iframe quando esiste un'integrazione dati migliore.
