# CONTENT.md

## Scopo

Definisci il sistema di **composizione** dei testi del progetto: il corpo degli articoli del giornale e delle notizie.

Il campo `content` di un articolo non è testo semplice e non è HTML.

È **Markdown ristretto**: un dialetto che riconosce i costrutti necessari a una notizia e nient'altro.

Chi scrive un articolo scrive testo. Il sistema decide come quel testo diventa pagina.

---

# PRINCIPIO

Il testo deve restare **leggibile nel dataset**.

Un articolo aperto in `journal.json` deve potersi leggere e correggere anche senza vederlo reso.

Per questo la composizione usa segni brevi, non etichette.

Non si scrive HTML dentro `content`.

Non si incolla HTML da altre fonti.

Chi scrive non sceglie colori, corpi o spaziature: sceglie **che cosa è** un blocco, non come appare.

---

# SICUREZZA

Regola assoluta (JOURNAL.md «SICUREZZA»):

**tutto ciò che non è riconosciuto è testo, e come testo viene escapato.**

Conseguenze:

* `<script>` scritto in un articolo compare come testo, non viene eseguito;
* `<b>` scritto in un articolo compare come testo, non diventa grassetto;
* un collegamento `javascript:` o `data:` non diventa collegamento: resta la scrittura originale, visibile, così l'errore si nota e si corregge;
* nessun markup arriva alla pagina se non è stato generato dal progetto.

Non esiste un modo, per chi scrive un articolo, di inserire HTML arbitrario.

Questo è voluto e non va aggirato.

---

# I BLOCCHI

## H1 · H2 · H3

```text
# Titolo
## Titolo
### Titolo
```

I livelli sono **relativi al corpo dell'articolo**, non alla pagina.

Nella pagina dell'articolo il titolo vero è l'`h1`. Perciò:

```text
#   → <h2>
##  → <h3>
### → <h4>
```

La gerarchia del documento resta corretta e l'articolo non ha mai due `h1` (JOURNAL.md «ACCESSIBILITÀ»).

Dentro il testo i titoli sono più piccoli di quelli delle sezioni di pagina: un titolo interno non deve competere col titolo dell'articolo.

## Sottotitolo

```text
%% Il sottotitolo che spiega il titolo
```

Sta **sotto un titolo** e lo chiarisce.

Non è un titolo a sua volta: non entra nella gerarchia, non compare negli indici.

Resta attaccato al titolo che lo precede.

## Testo normale

Il paragrafo è il blocco predefinito: qualunque riga non riconosciuta come altro.

Un a capo singolo non spezza il paragrafo, come in Markdown. Una riga vuota lo chiude.

```text
Questa riga
e questa riga
formano un solo paragrafo.
```

## Testo secondario

```text
// Una precisazione di contorno.
```

Corpo ridotto, colore attenuato.

Per contorno e precisazioni.

**Mai per l'informazione principale**: quello che conta si scrive in un paragrafo normale.

## Link

```text
[testo](/percorso-interno)
[testo](https://esempio.it)
[scrivi](mailto:info@esempio.it)
[chiama](tel:+390376000000)
```

Protocolli ammessi: `http`, `https`, `mailto`, `tel`, più i percorsi interni (`/...`) e le àncore (`#...`).

Tutto il resto non diventa collegamento.

I collegamenti verso il web escono con `rel="noopener noreferrer"`.

Nel corpo del testo i link sono **sempre sottolineati**: il colore da solo non basta.

Dentro l'etichetta si può comporre: `[il **Palio** delle contrade](/giornale)`.

## Citazione

```text
> La citazione sta qui, e può
> andare avanti su più righe.
> — Nome di chi parla
```

L'ultima riga che comincia con `—` (o `--`) diventa l'attribuzione.

L'attribuzione è facoltativa.

Barra d'accento a sinistra, nessun virgolettato decorativo.

## Elenco puntato

```text
- prima voce
- seconda voce
- terza voce
```

Anche con `*` al posto di `-`.

Una voce continua sulla riga successiva se questa è rientrata.

## Elenco numerato

```text
1. primo passo
2. secondo passo
```

Il numero di partenza viene rispettato:

```text
5. riprende da cinque
6. e prosegue
```

## Tabella

```text
| Contrada  | ! Punti | Regata |
|---|---:|:--:|
| ! Filanda | 12      | sì     |
| ! Roccolo | 9,5     | no     |
```

La seconda riga fissa l'allineamento per colonna:

```text
|---|      sinistra
|---:|     destra
|:--:|     centro
```

`!` in testa a una cella la rende **intestazione di riga** (`<th scope="row">`): si usa per la prima colonna quando nomina la riga.

Una cella di soli numeri va a destra anche senza indicazione: le cifre si leggono incolonnate.

La griglia la detta l'intestazione: le righe più corte si completano con un trattino, quelle più lunghe si tagliano. Una tabella storta nel testo non diventa una tabella rotta nella pagina.

Le tabelle scorrono in orizzontale nel loro contenitore, senza trascinare la pagina (RESPONSIVE.md).

## Badge / etichetta

```text
[[BREAKING]]
[[Iscrizioni aperte]]
```

Rende l'etichetta rettangolare mono del progetto (`.tag`, STYLE.md «BADGE»).

Si usa **dentro il testo**, per marcare uno stato o una condizione.

Non sostituisce il tipo dell'articolo, che è un campo del dataset, non una scrittura.

## Nota

```text
>> [Titolo] Il testo della nota.
>> Una nota può anche non avere titolo.
```

Riquadro chiaro con accento a sinistra.

Per ciò che affianca la notizia: una condizione, un avvertimento, una precisazione operativa.

Il titolo è facoltativo e viene reso come micro-etichetta.

## Codice inline

```text
Il file è `journal.json` e l'ID è `article-001`.
```

Mono, riquadrato.

Per nomi di file, identificativi, codici, valori tecnici.

Dentro il codice inline non si compone nulla: quello che c'è dentro è letterale.

## Blocco codice

````text
```json
{ "id": "article-001" }
```
````

Il linguaggio è facoltativo e, quando c'è, si legge in alto a destra.

Il blocco scorre per conto suo, senza trascinare la pagina.

Una recinzione mai chiusa arriva in fondo al testo: meglio mostrare il contenuto che perderlo in silenzio.

Il contenuto dei blocchi di codice **non entra nella ricerca**: cercare «const» non deve portare a un articolo sulla sagra.

## Markdown convertito in HTML

È il sistema stesso: il testo in `content` è Markdown ristretto e viene convertito in HTML a build time, durante il prerender.

Non c'è conversione nel browser, e nessuna libreria esterna.

La conversione è **a whitelist**: si riconosce ciò che è previsto qui, il resto è testo.

---

# COMPOSIZIONE IN RIGA

Vale dentro paragrafi, voci di elenco, celle di tabella, citazioni e note:

```text
**forte**
*enfasi*
`codice`
[testo](url)
[[etichetta]]
```

L'enfasi vuole testo attaccato agli asterischi: `*parola*` è corsivo, `3 * 4` resta una moltiplicazione.

---

# TESTO SEMPLICE

Dagli stessi blocchi si ricava il testo senza markup. Serve a:

* **la ricerca**, che deve trovare una parola scritta dentro una tabella o un elenco, non solo nell'estratto;
* **l'estratto automatico**, quando l'articolo non ne dichiara uno.

Un `excerpt` scritto a mano **non viene mai sovrascritto** (JOURNAL.md «EXCERPT»).

---

# DOVE STA

```text
src/content/
  parse.ts     testo  → blocchi
  render.ts    blocchi → HTML
  inline.ts    composizione in riga, link sicuri
  text.ts      blocchi → testo semplice, estratto
src/types/content.ts   i tipi dei blocchi
```

Lo stile sta in `src/styles/components.css`, sezione «Composizione del contenuto».

La colonna di testo (`.prose`) sta in `base.css`.

---

# REGOLE DI RESA

I blocchi usano i **componenti già in uso nel resto del sito**: `.tag` per i badge, `.table` per le tabelle, `.caption` per le attribuzioni, `.label` per i titoli delle note.

Un articolo non inventa uno stile suo.

Il ritmo verticale nasce da un solo margine superiore per blocco: nessun blocco spinge in basso il precedente, e il primo non stacca dall'intestazione della pagina.

---

# QUANDO NON USARE UN BLOCCO

**Tabella**: solo quando i dati si confrontano per colonna. Due valori non sono una tabella.

**Codice**: solo per contenuto tecnico vero. Non per far risaltare una frase.

**Nota**: solo per ciò che affianca la notizia. Se l'informazione è centrale, è un paragrafo.

**Badge**: solo per uno stato. Non per decorare.

**Testo secondario**: mai per ciò che il lettore deve sapere.

---

# REGOLA FINALE

**La composizione serve l'informazione, non la decora.**

Chi scrive dichiara che cosa è un blocco.

Il sistema decide come appare.

Quello che non è riconosciuto resta testo, sempre, e non diventa mai markup.
