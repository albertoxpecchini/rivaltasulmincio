# Due adulti in una sola iscrizione — programma di lavoro

**Documento di lavoro · Color Walk, 20 settembre 2026**

Come si arriva a un'iscrizione che porta **più di un maggiorenne**, con le
responsabilità divise: chi compila risponde di sé e dei minori che iscrive, ogni
altro adulto risponde di sé. Una mail, una fattura, un pagamento, più nomi in
registro.

> Questo è un documento di lavoro e sta in un file, non su una pagina del sito —
> la stessa regola con cui il 4 settembre è stata tolta `/color-walk-domande`. Si
> aggiorna man mano che i passi si fanno: spuntare qui è parte del lavoro.

**Il vincolo che comanda tutto:** le iscrizioni sono **aperte** e c'è gente che
sta pagando. Ogni passo di questo programma è pensato per non rompere niente a
chi è già iscritto e per non fermare chi si sta iscrivendo adesso.

---

## In rete dal 6 settembre 2026, 14:37

**Pubblicato.** I sette commit del ramo `due-adulti` sono su `main` in
avanzamento diretto, la storia è rimasta lineare, e il deploy è vivo: da questo
momento chi apre `/color-walk` può iscrivere fino a quattro maggiorenni in una
sola iscrizione.

La prova finale, prima di unire, è passata in tutte e otto le voci: 92 prove
verdi e 0 fallite; un'iscrizione con un adulto solo identica a prima in
scrittura, lettura ed elenco; 20 € con due adulti e 30 € con due adulti e due
minori; il ritorno da PayPal che conta giusto da 1 a 12 persone; il build senza
errori nuovi; e i testi coerenti fra loro in 30 controlli.

Dopo la pubblicazione, controllato in rete: `/color-walk`, `/color-walk-modulo`
e `/iscritti` rispondono 200 e portano il codice nuovo; il regolamento
pubblicato dice quattro maggiorenni, il 18 settembre per la cessione e la data
di aggiornamento giusta; `/api/iscritti-color-walk` risponde 401 senza chiave.
E soprattutto **la funzione dell'iscrizione si carica**: un colpo sul campo
trappola torna 400 col messaggio giusto, che è la prova che `MAX_ADULTI` si
importa davvero — se non si importasse, ogni iscrizione darebbe 500 e le pagine
non lo direbbero.

**Resta la prova vera del passo 2.5**, che nessuno può fare al posto di una
persona e che adesso si fa sul sito vivo: un'iscrizione con due adulti
scegliendo **contanti**. Nasce una fattura vera, parte una mail vera, non si
muove un euro. Si guarda che la mail dica «2 maggiorenni · 20 €» e porti tutti
e due i nomi, che la pagina iscritti mostri una scheda con due adulti e il
conto persone giusto, e che il CSV abbia due righe `maggiorenne` con la seconda
a **Responsabile vuoto**. Poi si annulla quella fattura dal pannello di PayPal:
annullata, sparisce dall'elenco da sé.

**Se qualcosa va storto**, il modo di tornare indietro è quello scritto in
fondo: si torna indietro solo la parte che scrive, e le iscrizioni con due
adulti eventualmente già registrate continuano a leggersi, perché la parte che
legge resta.

---

## Dove siamo — 6 settembre 2026

**Fase 1, Fase 2 e Fase 3 fatte**, in sette commit, e adesso su `main`.

Il sito legge e scrive un'iscrizione con più maggiorenni. La lettera `B` è il
maggiorenne accompagnato, `A` resta chi compila; fattura, ordine, ricevuta,
elenco degli organizzatori, CSV e ritorno dal pagamento contano tutti in
persone. Il modulo ha un secondo `<template>` e una seconda macchina delle
righe, copiata da quella dei minori come diceva il programma. Regolamento,
modulo cartaceo, le due pagine che portano l'occhiello, la ricevuta e la
pagina di chi organizza dicono tutti la stessa cosa del modulo.

Le prove sono passate da **70 a 92**, 0 fallite: `prova-iscrizione` 44,
`prova-conferma` 17, `prova-iscritti` 31. Quelle che contano di più sono le
tre che proteggono chi è già iscritto — un'iscrizione con un adulto solo si
legge e si scrive identica, `adulti` è un elenco vuoto invece che assente
anche sulla riga della fattura illeggibile, e la bozza senza la chiave nuova
si riprende senza inciampare.

**La Fase 3 è stata rifatta da capo** il 6 settembre, leggendo i testi per
intero invece dei soli punti elencati qui sotto. La prima passata ne aveva
saltati quattro, e non erano dettagli: il punto 8 faceva autorizzare l'uso
dell'immagine di un adulto a un altro adulto; il punto 9 non elencava i dati
dei maggiorenni accompagnati, cioè un'informativa incompleta; il punto 10
faceva accettare il regolamento al posto loro; e nessun punto diceva il fatto
nuovo più semplice di tutti — **un'iscrizione è una mail sola**, e chi viene
iscritto da un altro non riceve niente. La ricevuta adesso lo dice, ma solo
quando i maggiorenni sono più d'uno.

Fuori dal regolamento: l'occhiello viveva in **due** pagine e su `/comunita`
era rimasto quello vecchio; la pagina di chi organizza avvisava che dentro ci
sono «i nomi dei minori», e adesso ci sono anche codici fiscali di maggiorenni
che il modulo non l'hanno compilato loro.

**E una cosa che non c'entra con i maggiorenni**, trovata nella stessa lettura
e committata a parte: `_build/email/evento.json` era rimasto alla scadenza che
il regolamento ha corretto il 4 settembre. Ogni ricevuta già spedita dice
«Scrivici entro il **13 settembre**» e ripete i «sette giorni prima», mentre il
regolamento dice le 23:59 di venerdì 18. Cinque giorni di differenza su una
cosa che riguarda chi ha già pagato. Adesso combaciano.
**Quello che le prove non toccano** è il codice che gira nel browser. Il CSV,
l'elenco «Cammina con sé», l'ordine dei campi, il conto in parole, il totale,
la bozza e il corpo mandato alla funzione sono stati verificati a parte,
prendendo il frammento vero dal file e facendolo girare su un dato finto. È
così che è saltato fuori un `\s` diventato `s` nella pulizia del codice
fiscale: senza quella prova sarebbe arrivato in rete.

**Resta la prova vera del passo 2.5**, che nessuno può fare al posto di una
persona: un'iscrizione con due adulti scegliendo **contanti**, per vedere la
mail vera, la scheda vera e il CSV vero. Non muove un euro, e la fattura si
annulla dal pannello di PayPal.

**Le decisioni prese:** D1 → **quattro** maggiorenni, capofila compreso.
D4 → **una casella sola** con due dichiarazioni, e la frase su chi dichiara di
avere il consenso degli adulti che iscrive. D2, D3 e D5 come proposti qui.

**Tre scelte fatte per strada**, diverse da come le immaginava il programma:

- il conto delle persone nella ricevuta usa `quanti` e non `tutti.length`,
  perché con la formula del programma una fattura senza maggiorenni sarebbe
  passata da «1 persona» a «0» — un caso storto che non c'era ragione di
  cambiare adesso;
- la data di nascita del maggiorenne accompagnato tiene il `min="1900-01-01"`
  del capofila invece di non averne nessuno: è la stessa persona, e la stessa
  validazione;
- i due contenitori delle righe sono diventati griglie con un `gap`. Senza,
  due riquadri consecutivi si toccavano bordo a bordo — succedeva già ai
  minori, e non me la sono sentita di aggiungere il secondo contenitore
  lasciando il difetto a tutti e due.

---

## Indice

0. [In rete](#in-rete-dal-6-settembre-2026-1437)
0. [Dove siamo](#dove-siamo--6-settembre-2026)
1. [Le cinque decisioni](#le-cinque-decisioni)
2. [La strategia: prima leggere, poi scrivere](#la-strategia-prima-leggere-poi-scrivere)
3. [Fase 0 — il ramo e la base](#fase-0--il-ramo-e-la-base)
4. [Fase 1 — la lettura](#fase-1--la-lettura--fatta) — fatta
5. [Fase 2 — la scrittura](#fase-2--la-scrittura--fatta) — fatta
6. [Fase 3 — i testi](#fase-3--i-testi--fatta) — fatta
7. [Le sei trappole](#le-sei-trappole)
8. [La prova finale](#la-prova-finale)
9. [Come si torna indietro](#come-si-torna-indietro)

---

## Le cinque decisioni

Da confermare **prima** di toccare il codice. Sono le uniche cose che questo
programma non può decidere da sé.

**D1 — Quanti adulti per iscrizione.**
Proposta: **fino a 4** (un capofila più tre). Costa esattamente quanto farne due,
perché la macchina delle righe ripetute c'è già ed è la stessa dei minori; è un
`MAX_ADULTI` accanto a `MAX_MINORI` in `api/_paypal.mjs`, e cambiarlo dopo è una
cifra sola. Con 4 ci sta la coppia, ci stanno i nonni, e chi ne ha di più compila
due volte.

**D2 — La lettera del ruolo.**
Ogni riga della fattura porta già una lettera: `A` chi si iscrive, `M` i minori.
L'adulto accompagnato prende **`B`**. Non si riusa `A` perché il registro deve
poter dire *chi ha in carico i minori* e *chi risponde solo di sé*: è la
differenza che questa modifica esiste per rappresentare, e se le due si
confondono in una lettera sola non si recuperano più.

**D3 — Il codice fiscale del secondo adulto: obbligatorio.**
Stessa ragione per cui è obbligatorio quello del capofila, scritta al punto 3 del
regolamento: serve a dare certezza su chi si assume una responsabilità. Il
secondo adulto se ne assume una — la propria — quindi il codice glielo si chiede.
Il codice viene già controllato contro la data di nascita dichiarata; per lui
vale uguale.

**D4 — La dichiarazione, e il suo limite.**
La casella resta **una**, ma il testo diventa due dichiarazioni: il capofila per
sé e per i minori che iscrive, ogni altro adulto per sé. E va detto per intero,
sul modulo e nel regolamento, che **chi compila dichiara di avere il consenso
degli adulti che iscrive**.

È il punto più debole del modello nuovo e va scelto sapendolo: al banchetto ogni
adulto firma il proprio, qui uno spunta per tutti. Non esiste una formulazione
che lo renda una firma. Se non va bene, l'unica alternativa vera è restare a
un'iscrizione per adulto.

**D5 — Le persone, non i moduli.**
Il tetto è **300 partecipanti** e si conta in persone. Ogni conto di persone che
oggi fa `1 + minori` deve diventare `adulti + minori`, o il tetto si sfonda senza
che nessuno lo veda. I punti sono elencati al passo 1.2 e non se ne può saltare
uno.

---

## La strategia: prima leggere, poi scrivere

È la parte più importante del programma, ed è il motivo per cui questo si può
fare a iscrizioni aperte.

Il registro sono le fatture PayPal. **Prima si insegna a tutto il sito a leggere**
una fattura con due adulti — senza che nessuno ne scriva ancora una. Si pubblica:
non cambia niente, non si vede niente, i 70 controlli restano verdi. **Poi** si
insegna al modulo a scriverne una.

Fra le due fasi il sito è in uno stato sicuro: sa leggere una cosa che non esiste
ancora. Il contrario — scrivere prima e leggere poi — vuol dire che per qualche
minuto esistono iscrizioni vere che l'elenco delle sacche non sa mostrare. Quel
minuto è esattamente il guaio che non ci si può permettere.

E dà il piano di ritirata gratis: se la Fase 2 va storta si torna indietro solo
lei, e le iscrizioni con due adulti già registrate **continuano a leggersi**,
perché la Fase 1 resta.

---

## Fase 0 — il ramo e la base

**0.1** Un ramo suo, non `main`:

```
git switch -c due-adulti
```

**0.2** La base da cui si parte, da rileggere ogni volta:

```
node prova-iscrizione.mjs && node prova-conferma.mjs && node prova-iscritti.mjs
```

Oggi: **29 + 15 + 26 = 70 passate, 0 fallite**. Questo numero è il metro di tutto
quello che segue. PayPal non viene mai chiamato: `fetch` è sostituito da un banco
di prova, quindi si può girare quante volte si vuole senza toccare niente di
vero.

---

## Fase 1 — la lettura — fatta

Si pubblica alla fine di questa fase e **non cambia niente di visibile**.

### 1.1 — `api/_paypal.mjs`: il ruolo nuovo

Tre modifiche in un file solo.

**Il tetto**, accanto a `MAX_MINORI` (oggi riga 78):

```js
export const MAX_ADULTI = 4; // capofila compreso
```

**L'etichetta della voce**: oggi `voce()` (riga 302) sceglie la fascia con un
ternario su `"A"`. Con tre ruoli diventa una tabella:

```js
const FASCIA = { A: "maggiorenne", B: "maggiorenne", M: "dai 6 ai 17 anni" };
```

`B` si chiama «maggiorenne» come `A`: è il nome che si legge nel pannello di
PayPal e sulla ricevuta, e lì la differenza non serve a nessuno. La differenza
sta nella lettera, che la legge il codice.

**`personeDa()`** (riga 345) è il cuore. Oggi fa
`if (ruolo === "A" && !adulto) adulto = persona; else minori.push(persona)` —
cioè **un secondo adulto finirebbe zitto in mezzo ai minori**. Diventa:

```js
export function personeDa(fattura) {
  let capofila = null;
  const adulti = [];
  const minori = [];

  for (const v of fattura?.items || []) {
    const [ruolo, nome = "", /* … */] = String(v.description || "").split("|");
    if (ruolo !== "A" && ruolo !== "B" && ruolo !== "M") continue;
    // … la persona si compone come adesso …

    if (ruolo === "M") minori.push(persona);
    else if (!capofila) capofila = persona;   // la prima A è il capofila
    else adulti.push(persona);                // ogni altro adulto
  }

  return { adulto: capofila, adulti, minori };
}
```

Due cose non casuali:

- **la chiave `adulto` resta**, e resta il capofila. Così i cinque punti che già
  la usano continuano a funzionare identici: si aggiunge `adulti`, non si
  riscrive quello che c'è.
- **una lettera sconosciuta si salta**, non diventa un minore. È la regola che
  tiene in piedi le fatture già scritte e quelle che si scriveranno dopo di noi.

*Verifica:* `node prova-conferma.mjs && node prova-iscritti.mjs` — 41 passate,
perché le fatture di prova hanno una `A` sola e devono leggersi esattamente come
prima.

### 1.2 — I cinque punti che leggono

**a) `api/_posta.mjs`, `ricevuta()`** (riga 125). Il modello HTML della mail **non
si tocca**: `{{VOCE_ADULTI}}` e `{{IMPORTO_ADULTI}}` esistono già, sono solo
riempiti con un `"1 maggiorenne"` scritto a mano.

```js
const { adulto, adulti, minori } = personeDa(fattura);
const tutti = [adulto, ...adulti].filter(Boolean);
const n = tutti.length || 1;

const centAdulti = tutti.length
  ? tutti.reduce((s, a) => s + a.importoCent, 0)
  : QUOTA_ADULTO_CENT;

const voceAdulti = `Iscrizione — ${n} ${n === 1 ? "maggiorenne" : "maggiorenni"}`;
const partecipanti = [...tutti, ...minori] /* … */;
// persone: tutti.length + minori.length
```

Il testo semplice della mail si compone già da `voceAdulti`: non si tocca.

**b) `api/iscritti-color-walk.mjs`** (righe 194, 242-258, 281). Quattro punti:

```js
let { adulto, adulti, minori } = personeDa(f);          // riga 194, e di nuovo a 208
// …
adulti: adulti.map(({ nome, cognome, dataNascita, codiceFiscale }) => ({ /* … */ })),
importoCent: importoDi(f, [adulto, ...adulti, ...minori]),
// …
persone: iscritti.reduce((n, i) => n + 1 + (i.adulti || []).length + i.minori.length, 0),
```

E nel ramo della fattura illeggibile (riga 216) va messo `adulti: []`, o la
pagina troverà un `undefined` dove si aspetta un elenco.

**c) `api/iscrizione-color-walk.mjs`, `verifica()`** (riga 258): è quello che
risponde al ritorno dal pagamento.

```js
persone: adulto ? 1 + adulti.length + minori.length : 0,
```

**d) `api/conferma-color-walk.mjs`: niente.** Verificato: il webhook non nomina
mai né `adulto` né `minori`, passa la fattura intera a `ricevuta()` e basta. È il
file che non si apre.

**e) `_build/iscritti.body.html`** — la pagina di chi organizza, sette punti,
tutti meccanici:

| Oggi alla riga | Cosa fa | Cosa diventa |
|---|---|---|
| 794 | `var persone = 1 + minori.length` | più `(i.adulti \|\| []).length` |
| 893-915 | l'elenco «Cammina con sé» | prima gli adulti, poi i minori, ognuno con la sua fascia scritta |
| 934 | il testo su cui si cerca | ci entrano anche i nomi degli adulti |
| 997 | il filtro `minori` | resta com'è: filtra chi porta minori, ed è giusto così |
| 1017 | le persone della selezione | più `adulti.length` |
| 1078 | i numeri nelle pastiglie | resta com'è |
| 1295 | il CSV | una riga per ogni adulto |

Il CSV è già pronto e non se ne era accorto nessuno: ha una colonna **Fascia** e
una colonna **Responsabile**. L'adulto accompagnato esce con fascia
`maggiorenne` e **Responsabile vuoto** — che è esattamente il modello: risponde
di sé.

Nell'elenco della scheda ogni persona si prende il suo quadratino da spuntare in
stampa, adulti compresi: al banco si spunta la persona.

### 1.3 — Le prove della lettura

In `prova-iscritti.mjs` e `prova-conferma.mjs`, una fattura finta con `A` + `B` +
`M`, e si controlla che:

- la scheda esca con `adulti` pieno e il capofila al posto suo;
- `persone` conti tre;
- l'importo sia 25 € (10 + 10 + 5);
- la ricevuta dica «2 maggiorenni» e «20 €» sulla riga degli adulti;
- **una fattura con la sola `A` esca identica a prima** — è il controllo che
  protegge chi è già iscritto, ed è il più importante dei cinque.

### 1.4 — Si pubblica

```
node build.mjs && git add -A && git commit && git push
```

Da questo momento una fattura con due adulti verrebbe letta bene da tutto il
sito. Non ne esiste ancora nessuna, e per chi guarda non è cambiato niente: è il
punto del programma in cui si è al sicuro.

---

## Fase 2 — la scrittura — fatta

### 2.1 — `api/_paypal.mjs`: la fattura e l'ordine

`componiFattura()` (riga 316) e `creaOrdine()` (riga 537) prendono un parametro
in più, `adulti = []`, e le voci diventano:

```js
items: [
  voce(adulto, "A", QUOTA_ADULTO_CENT),
  ...adulti.map((a) => voce(a, "B", QUOTA_ADULTO_CENT)),
  ...minori.map((m) => voce(m, "M", QUOTA_MINORE_CENT)),
],
```

In `creaOrdine` c'è anche un totale scritto a mano (riga 538), ed è l'unico posto
del sistema dove una cifra si somma due volte:

```js
const totaleCent =
  QUOTA_ADULTO_CENT * (1 + adulti.length) + QUOTA_MINORE_CENT * minori.length;
```

`primary_recipients` resta il **capofila**: è il suo indirizzo, è a lui che
arriva la mail.

### 2.2 — `api/iscrizione-color-walk.mjs`: chi entra e a che prezzo

Nella `iscrivi()`, dopo il capofila e prima dei minori:

```js
const grezziA = Array.isArray(req.body?.adulti) ? req.body.adulti : [];
if (grezziA.length > MAX_ADULTI - 1) return res.status(400).json({ errore: /* … */ });

const adulti = [];
for (let i = 0; i < grezziA.length; i++) {
  const esito = leggiPersona(grezziA[i], {
    minimo: 18,
    massimo: 120,
    chi: `Adulto ${i + 2}`,
    cfObbligatorio: true,
  });
  if (esito.errore) return res.status(400).json({ errore: esito.errore });
  adulti.push(esito.persona);
}

const totaleCent =
  QUOTA_ADULTO_CENT * (1 + adulti.length) + minori.length * QUOTA_MINORE_CENT;
```

Due cose da non dimenticare qui:

- **il messaggio dei 18 anni è scritto per il capofila.** In `leggiPersona`
  (riga 200) il ramo `minimo === 18` risponde *«per iscriversi bisogna essere
  maggiorenni: i minori li iscrive un adulto insieme a sé»*, che a un adulto
  accompagnato non dice niente di utile. Serve un ramo che dica: *«Adulto 2: il
  20 settembre non ha ancora 18 anni — va messo fra i minori che cammini con
  te»*.
- **i codici fiscali doppi.** Due adulti con lo stesso codice, o uno uguale a
  quello del capofila, si rifiutano. Costa tre righe ed evita la famiglia che
  iscrive due volte la stessa persona e paga 10 € di troppo.

E `adulti` va passato a `componiFattura`, a `creaOrdine` e alla `descrizione`
dell'ordine.

### 2.3 — Le prove della scrittura

In `prova-iscrizione.mjs`, il banco guarda **il corpo della fattura mandata a
PayPal**. I casi:

- due adulti, zero minori → totale **20 €**, due voci, ruoli `A` e `B`;
- due adulti e due minori → **30 €**, quattro voci;
- il secondo adulto senza codice fiscale → **rifiutato**;
- il secondo adulto con un codice che non torna con la sua data → **rifiutato**;
- un minorenne mandato fra gli adulti → **rifiutato**, col messaggio che gli dice
  dove va messo;
- più di `MAX_ADULTI` → **rifiutato**;
- `adulti` che arriva come stringa, o `null`, o pieno di spazzatura → non deve
  buttare giù la funzione;
- **un'iscrizione con un adulto solo → identica a prima.**

### 2.4 — Il modulo: `_build/color-walk.body.html`

È il pezzo più grosso, ed è tutto copia e adatta: la macchina delle righe
ripetute esiste già per i minori.

**Il modello.** Un secondo `<template id="cr-modello-adulto">` accanto a
`cr-modello-minore`, uguale nella struttura, diverso in quattro cose: i `data-id`
passano da `m-` a `a-`; l'`input[type=date]` ha `max="2008-09-20"` e nessun
`min`; il codice fiscale è **`required`** e perde l'etichetta «facoltativo»; i
testi d'aiuto dicono che questa persona risponde di sé.

**La macchina.** Un `#cr-adulti`, un tasto `#cr-piu-adulto`, un array `righeA`,
una `aggiungiAdulto()`.

> **Copiare `aggiungiMinore`, non generalizzarla.** Dentro ci sono il giro del
> fuoco, la validazione per riga, la numerazione, il togli, il legame con la
> bozza. Trasformarla in una funzione parametrica mentre la gente si iscrive è il
> modo di rompere la cosa che funziona per far posto a quella che non c'è ancora.
> Si duplica; si unificherà dopo il 20, con calma, se ne varrà la pena.

**Il punto che regala metà del lavoro:** `ordine()` (riga 1471) è l'unico posto
dove si assembla la fila dei campi. Basta infilarci `righeA` **fra `CAMPI` e le
righe dei minori**:

```js
fila = CAMPI.slice();
for (var i = 0; i < righeA.length; i++) fila = fila.concat(righeA[i].campi);
for (var i = 0; i < righe.length; i++) fila = fila.concat(righe[i].campi);
```

…e vengono da sé il conto «x di y» dell'avanzamento, l'ordine di tabulazione,
l'Invio che porta al campo dopo e la validazione. Va chiamata `rimescola()`
quando una riga di adulti nasce o muore, come si fa già per i minori.

**Il conto** (riga 1700) e **`totaleCent()`** (riga 1722):

```js
var quantiA = 1 + righeA.length;
var somma = quantiA * QUOTA_ADULTO + righe.length * QUOTA_MINORE;
```

e la voce diventa *«2 maggiorenni 10 € ciascuno · 1 ragazzo 5 €»*.

**La bozza** (riga 1819): una chiave nuova `d.b` accanto a `d.m`. In lettura
(riga 1873) **deve reggere la sua assenza**: mentre si pubblica c'è gente con il
modulo mezzo compilato in una scheda aperta, e quella bozza la chiave nuova non
ce l'ha.

**L'invio** (riga 2048): `adulti: adulti` nel corpo, costruito come i minori.

**La dichiarazione** (riga 988) e **le righe in fondo** (riga 971): il testo
di D4.

### 2.5 — La prova vera, prima di pubblicare a tutti

Non serve pagare per provarla. Si fa un'iscrizione **vera** con due adulti
scegliendo **contanti**: nasce una fattura vera, parte una mail vera, e non si
muove un euro. Si controlla che:

- la mail dica **«2 maggiorenni · 20 €»** e porti tutti e due i nomi in «Chi è
  iscritto»;
- la pagina iscritti mostri **una scheda con due adulti** e il conto persone
  giusto;
- il CSV abbia due righe `maggiorenne`, la seconda con **Responsabile vuoto**.

Poi si annulla quella fattura dal pannello di PayPal: annullata, sparisce
dall'elenco da sé.

---

## Fase 3 — i testi — fatta

Non è la rifinitura: se il sito dice una cosa e il modulo ne fa un'altra, la
dichiarazione di responsabilità vale meno. Va **insieme** alla Fase 2, non dopo.

- **`_build/color-walk-regolamento.body.html`**
  - **punto 2** — «Per iscriversi bisogna essere maggiorenni»: aggiungere che
    un'iscrizione può portarne più d'uno, ognuno responsabile di sé.
  - **punto 3** — i dati raccolti: il codice fiscale degli adulti accompagnati è
    obbligatorio, e va detto perché.
  - **punto 4** — «fino a otto minori»: aggiungere il tetto degli adulti.
  - **punto 7** — la responsabilità: la divisione, e la frase su chi spunta la
    casella per chi.
- **`_build/color-walk-modulo.body.html`** — il modulo cartaceo. Al banco ogni
  adulto firma il suo: qui la differenza col modulo online va detta, non
  nascosta.
- **`_build/color-walk.body.html`** — l'occhiello della sezione iscrizione, che
  oggi dice «Si iscrive un maggiorenne, che può aggiungere i minori a suo
  carico».
- `node build.mjs` e si guarda che le pagine escano.

---

## Le sei trappole

**1. Il memo non si tocca.** `leggiMemo` (`_paypal.mjs`, riga 285) spacca sul `|`
e mette **tutto quello che viene dopo il terzo campo** dentro `note`. Aggiungere
un campo in fondo vuol dire che la nota si porta dentro il campo nuovo;
aggiungerlo in mezzo vuol dire che **la nota di ogni iscrizione già registrata
sparisce**. In tutte e due le direzioni si rompe il passato. Se serve registrare
qualcosa sul consenso del secondo adulto, va nelle voci della fattura, non nel
memo.

**2. La bozza vecchia.** Vedi 2.4: `riprendiBozza` non deve inciampare su una
bozza senza adulti.

**3. Non generalizzare la macchina delle righe.** Vedi 2.4.

**4. Il messaggio d'errore dei 18 anni.** Vedi 2.2.

**5. `personeDa` resta tollerante.** Una lettera sconosciuta si salta. Mai un
`else` che raccatta tutto quello che non ha riconosciuto: è così che oggi un
secondo adulto diventerebbe un ragazzino di dieci anni.

**6. Le persone, non i moduli.** Il tetto dei 300 e il conto in fondo all'elenco
si contano in persone: sono i punti di 1.2b e 1.2c, e saltarne uno vuol dire un
tetto che non tiene. Al contrario, **`MAX_NON_PAGATE` (tre iscrizioni non pagate
per indirizzo) non si tocca**: con due adulti in un'iscrizione una coppia ne
consuma una invece di due, che è un miglioramento gratis.

---

## La prova finale

Prima di portare il ramo su `main`:

- [ ] `node prova-iscrizione.mjs && node prova-conferma.mjs && node prova-iscritti.mjs` — **più di 70 passate, 0 fallite**
- [ ] un'iscrizione con **un adulto solo** si comporta esattamente come prima: stessa mail, stessa scheda, stesso importo
- [ ] un'iscrizione con **due adulti e nessun minore** fa 20 €, una mail, una scheda, due nomi
- [ ] un'iscrizione con **due adulti e due minori** fa 30 €
- [ ] le iscrizioni **già registrate prima di tutto questo** si leggono identiche in elenco e nel CSV
- [ ] il ritorno da PayPal dice il numero di persone giusto
- [ ] `node build.mjs` senza errori nuovi
- [ ] regolamento, modulo cartaceo e modulo online **dicono la stessa cosa**

Si pubblica **in un'ora morta** — non il sabato pomeriggio, non la sera — e si
guarda la pagina iscritti per un quarto d'ora.

---

## Come si torna indietro

La divisione in due fasi è il piano di ritirata.

- **Se va storta la Fase 2** (il modulo, l'endpoint): si torna indietro solo lei.
  La Fase 1 resta pubblicata, quindi le iscrizioni con due adulti eventualmente
  già registrate **continuano a leggersi bene** in elenco, nelle mail e nel CSV.
  Non si perde nessuno.
- **Se va storta la Fase 1**: non è successo niente a nessuno, perché non esiste
  ancora una fattura che la usi. Si torna indietro e basta.
- **Quello che non si può disfare** sono le fatture già scritte. Ma non serve
  disfarle: una fattura con `A` + `B` è leggibile per sempre da `personeDa`, ed è
  per questo che la lettera nuova si aggiunge invece di riusare `A`.
