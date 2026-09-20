# IMAGES.md

## Scopo

Definisci gestione immagini per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Le immagini hanno funzione principalmente:

* documentale;
* geografica;
* storica;
* editoriale;
* informativa.

Non usare immagini solo per riempire spazio.

## Principio

Ogni immagine deve avere almeno uno scopo chiaro:

* mostrare un luogo;
* documentare un'attività;
* rappresentare territorio;
* raccontare storia;
* mostrare evento;
* identificare elemento geografico;
* accompagnare contenuto editoriale.

## Priorità fonti

Preferenza:

1. fotografie originali del progetto;
2. fotografie fornite da soggetti locali con autorizzazione;
3. archivi pubblici;
4. immagini con licenza compatibile;
5. immagini ufficiali di enti o attività;
6. altre fonti autorizzate.

Non usare immagini prese casualmente da Google Immagini o social.

## Verifica diritti

Prima di pubblicare immagine verifica:

* autore;
* fonte;
* licenza;
* permesso d'uso;
* eventuale attribuzione;
* eventuali restrizioni;
* eventuali persone riconoscibili;
* eventuali marchi.

Ogni immagine esterna deve avere provenienza documentata.

## Metadati

Prevedi schema:

```json
{
  "id": "img-001",
  "src": "/images/...",
  "alt": "...",
  "title": "...",
  "caption": "...",
  "credit": "...",
  "author": "...",
  "source": "...",
  "sourceUrl": "...",
  "license": "...",
  "dateTaken": "...",
  "datePublished": "...",
  "location": {
    "lat": 0,
    "lng": 0
  }
}
```

Non rendere obbligatori campi non disponibili.

## Alt text

Alt text deve descrivere funzione e contenuto reale.

Buono:

```text
Argine del Mincio a Rivalta sul Mincio
```

Non usare:

```text
immagine
foto bella
Rivalta
```

Per immagine decorativa:

```html
alt=""
```

Non usare descrizioni inutili.

## Didascalie

Usa didascalia quando aggiunge contesto.

Formato possibile:

```text
Argine del Mincio, Rivalta sul Mincio.
```

Per fotografie storiche:

```text
Rivalta sul Mincio, fotografia storica.
```

Aggiungi anno quando verificato.

## Crediti

Mostra credito quando richiesto dalla licenza o utile alla provenienza.

Esempio:

```text
Foto: Mario Rossi
```

oppure:

```text
Fonte: Archivio XYZ
Licenza: CC BY 4.0
```

Non nascondere attribuzione richiesta.

## Formati

Preferenza:

1. AVIF;
2. WebP;
3. JPEG per fotografie quando necessario;
4. PNG per trasparenze o grafica;
5. SVG per grafica vettoriale.

Non usare PNG per fotografie normali.

## Compressione

Ottimizza immagini prima della pubblicazione.

Obiettivo:

* qualità visiva alta;
* file minimo possibile;
* nessuna compressione distruttiva evidente.

Non servire immagini 5000px a componenti che ne mostrano 500px.

## Responsive images

Usa `srcset` e `sizes` quando utile.

Esempio:

```html
<img
  src="/images/rivalta-800.webp"
  srcset="
    /images/rivalta-480.webp 480w,
    /images/rivalta-800.webp 800w,
    /images/rivalta-1200.webp 1200w,
    /images/rivalta-1600.webp 1600w
  "
  sizes="(max-width: 768px) 100vw, 1200px"
  alt="..."
  width="1600"
  height="900"
/>
```

Evita immagini sovradimensionate.

## Lazy loading

Immagini fuori viewport:

```html
loading="lazy"
```

Immagini principali above-the-fold possono essere caricate normalmente.

Non lazy-loadare automaticamente hero principale se peggiora LCP.

## Dimensioni

Definisci dimensioni coerenti.

Indicazioni:

```text
thumbnail: 320px
small: 640px
medium: 1024px
large: 1440px
hero: 1920px
```

Non creare versioni inutili.

## Aspect ratio

Mantieni rapporti prevedibili.

Standard consigliati:

```text
16:9
4:3
3:2
1:1
```

Usa rapporto diverso solo quando contenuto lo richiede.

## Crop

Non tagliare elementi importanti.

Per fotografie territoriali:

```css
object-fit: cover;
```

solo quando crop è accettabile.

Per documenti e fotografie storiche complete:

```css
object-fit: contain;
```

quando necessario.

## Hero

Hero fotografico deve essere usato solo quando immagine rappresenta realmente Rivalta.

Evita:

* stock photo;
* paesaggi generici della Lombardia;
* immagini di altri comuni;
* immagini artificialmente costruite per sembrare Rivalta.

## Fotografie territoriali

Categorie utili:

* Mincio;
* Valli del Mincio;
* centro abitato;
* strade;
* edifici;
* attività;
* agricoltura;
* paesaggio;
* fauna;
* flora;
* eventi;
* sport;
* vita quotidiana.

## Fotografie storiche

Mantieni metadati separati:

* periodo;
* anno quando noto;
* autore;
* archivio;
* fonte;
* descrizione;
* eventuale posizione;
* eventuale materiale originale.

Non modernizzare o alterare contenuto storico senza indicarlo.

## Eventi

Fotografie di eventi possono essere associate a:

```text
event
date
location
organizer
source
```

Non usare fotografia di un'edizione precedente per rappresentare automaticamente edizione attuale.

Indica anno quando necessario.

## Attività

Fotografia attività deve corrispondere realmente all'attività.

Aggiorna immagine quando:

* attività cambia sede;
* insegna cambia;
* locale cambia;
* immagine non rappresenta più situazione attuale.

Mantieni vecchie immagini nell'archivio quando hanno valore storico.

## Persone

Evita pubblicazione inutile di dati personali.

Per persone riconoscibili considera:

* contesto;
* finalità;
* autorizzazione quando necessaria;
* normativa applicabile.

Non costruire profili personali non richiesti.

## Minori

Massima cautela.

Non pubblicare fotografie identificative di minori senza base giuridica o autorizzazione appropriata.

## Documenti

Documenti storici, mappe, manifesti e volantini devono mantenere:

* qualità sufficiente;
* proporzioni;
* fonte;
* data;
* autore quando noto.

Non usare immagini di documenti come semplice decorazione.

## Mappe

Mappe e screenshot devono indicare fonte quando necessario.

Per mappe dinamiche preferire dati geografici reali alla semplice immagine raster.

Non usare screenshot OSM come sostituto della mappa interattiva quando non serve.

## Immagini generate con AI

Non presentare immagini generate come fotografie documentali reali.

Se immagine AI è usata:

* dichiarare natura sintetica quando rilevante;
* non usarla come prova di stato reale del territorio;
* non attribuirle luogo o evento reale se non documentati.

## Placeholder

Non lasciare placeholder generici in produzione.

Evitare:

```text
image-placeholder.jpg
photo.jpg
placeholder.png
```

Quando immagine reale manca:

```text
Immagine non disponibile
```

oppure componente visuale neutro.

## Nomenclatura

Usa nomi descrittivi:

```text
rivalta-municipio.jpg
rivalta-mincio-argine.webp
rivalta-chiesa-centro.webp
rivalta-valli-micio-2026.webp
```

Evita:

```text
IMG_001.jpg
DSC_4837.jpg
final-final.jpg
```

## Directory

Struttura consigliata:

```text
public/
  images/
    places/
    businesses/
    events/
    history/
    nature/
    streets/
    services/
    archive/
    ui/
```

Non mescolare fotografie editoriali e asset UI.

## File originali

Mantieni originali fuori dalla directory pubblica quando non devono essere esposti direttamente.

Struttura possibile:

```text
assets/
  originals/
  processed/
```

## Metadata EXIF

Rimuovi EXIF sensibili quando non necessari.

Controlla soprattutto:

* GPS;
* dispositivo;
* nome autore personale;
* timestamp;
* metadati non necessari.

Mantieni metadati utili solo quando pubblicazione è intenzionale.

## Privacy geografica

Non esporre coordinate precise di:

* abitazioni private;
* soggetti vulnerabili;
* luoghi sensibili;

quando precisione non è necessaria.

La precisione geografica deve avere scopo documentale reale.

## Accessibilità

Immagini informative devono avere alt text.

Immagini decorative devono essere ignorate da screen reader.

Testo dentro immagini non deve sostituire testo HTML quando informazione è importante.

## Contrasto

Testo sovrapposto a fotografie richiede fondo o overlay sufficiente.

Non assumere che fotografia garantisca contrasto.

## Gallerie

Galleria deve supportare:

* apertura immagine;
* didascalia;
* credito;
* navigazione;
* chiusura;
* tastiera;
* touch.

Modal deve avere focus management corretto.

## Lightbox

Lightbox deve:

* avere nome accessibile;
* poter essere chiusa con `Esc`;
* mantenere focus;
* impedire scroll pagina quando necessario;
* mostrare immagine completa;
* mostrare fonte quando prevista.

## Fotografie panoramiche

Usale per:

* paesaggio;
* Mincio;
* Valli;
* viste territoriali.

Non abusare di hero panoramici.

## Mappe fotografiche

Quando una fotografia è associata a coordinate, mostra eventualmente:

* posizione;
* direzione;
* data;
* luogo.

Questo crea collegamento tra archivio fotografico e atlante.

## Performance

Controlla:

* peso totale pagina;
* LCP;
* dimensioni reali;
* lazy loading;
* cache;
* formato;
* compression ratio.

Una pagina con 30 fotografie deve restare utilizzabile anche su rete mobile.

## CDN

Quando hosting lo supporta, usa CDN per immagini statiche.

Cache immagini versionate a lungo.

## Cache busting

Usa filename hashati quando pipeline lo richiede:

```text
rivalta-mincio-a82d91.webp
```

Non usare query string casuali per ogni immagine salvo necessità.

## Fallback

Ogni immagine deve avere comportamento definito quando caricamento fallisce.

Esempio:

```text
Immagine non disponibile
```

Non lasciare spazio completamente vuoto.

## Sfondi

Non usare fotografie come `background-image` quando immagine contiene informazione che necessita di alt text.

Per immagini informative preferire `<img>`.

## SEO

Quando pertinente:

* filename descrittivo;
* alt;
* caption;
* metadata;
* pagina associata;
* structured data quando appropriato.

Non fare keyword stuffing negli alt.

## Anti-regressione

Prima di aggiungere immagine:

1. verifica fonte;
2. verifica licenza;
3. verifica reale corrispondenza con Rivalta;
4. ottimizza file;
5. definisci alt;
6. definisci dimensioni;
7. verifica mobile;
8. verifica performance;
9. verifica eventuali dati EXIF;
10. verifica attribuzione.

## Regola finale

**Immagine deve documentare. Fonte deve essere tracciabile. File deve essere leggero. Alt deve essere utile.**

Mai usare fotografia generica per fingere autenticità locale.
