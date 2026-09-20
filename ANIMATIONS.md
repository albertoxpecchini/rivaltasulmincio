# ANIMATIONS.md

## Scopo

Definisci sistema animazioni per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Animazioni devono essere visivamente forti, moderne e curate.

Devono però restare:

* fluide;
* rapide;
* controllabili;
* accessibili;
* performanti;
* coerenti con atlante digitale.

## Principio

**Animazione bella = movimento con funzione.**

Usa animazioni per:

* attirare attenzione;
* spiegare transizioni;
* mostrare gerarchia;
* collegare mappa e contenuti;
* rendere interazioni percepibili;
* dare profondità all'interfaccia.

Non animare ogni elemento.

## Librerie

Usa librerie mature invece di costruire tutto manualmente.

Stack preferito:

### GSAP

Usa **GSAP** per:

* animazioni complesse;
* timeline;
* sequenze;
* reveal;
* testo;
* scroll;
* SVG;
* microinterazioni avanzate;
* animazioni coordinate tra più elementi.

GSAP è libreria primaria per motion avanzato.

### Lenis

Usa **Lenis** per smooth scrolling quando compatibile con architettura del progetto.

Usalo con moderazione.

Smooth scroll non deve alterare:

* accessibilità;
* comportamento tastiera;
* anchor navigation;
* scroll nativo su mobile.

### Motion One / Web Animations API

Usa per interazioni piccole quando GSAP sarebbe eccessivo.

Preferenza:

* CSS transitions per casi semplici;
* Web Animations / Motion per casi medi;
* GSAP per casi complessi.

Non aggiungere librerie duplicate per risolvere stesso problema.

## Gerarchia strumenti

Usa questa priorità:

```text
CSS transition
↓
CSS keyframes
↓
Web Animations API / Motion
↓
GSAP
```

Passa a livello superiore solo quando quello precedente non basta.

## Fable 5.1

Il progetto viene sviluppato tramite **Claude Code / Fable 5.1**.

Claude deve:

* verificare dipendenze già presenti;
* riutilizzare librerie installate;
* non introdurre librerie duplicate;
* controllare compatibilità con stack esistente;
* mantenere bundle sotto controllo;
* organizzare motion in componenti riutilizzabili.

Non installare nuove librerie senza verificare prima `package.json`.

## Filosofia visiva

Movimento deve ricordare:

* cartografia;
* esplorazione;
* dati che emergono;
* pannelli che scorrono;
* coordinate;
* livelli geografici;
* archivio che si apre;
* territorio che viene esplorato.

Evitare estetica:

* gaming;
* SaaS generico;
* crypto;
* portfolio da agency;
* dashboard con effetti casuali.

## Motion language

Caratteristiche:

**smooth + precise + restrained + tactile**

Movimenti possono essere sofisticati.

Non devono diventare rumorosi.

## Timing

Scala consigliata:

```text
80ms   instant
120ms  micro
180ms  fast
240ms  standard
320ms  medium
450ms  complex
650ms  cinematic
900ms+ evitare salvo intro specifiche
```

UI quotidiana deve restare prevalentemente sotto `320ms`.

## Easing

Preferenze:

```text
ease-out
power2.out
power3.out
expo.out
circ.out
```

Per entrate forti:

```text
power4.out
expo.out
```

Per movimento fisico:

```text
back.out
elastic.out
```

Usare `elastic` con estrema moderazione.

Non usare stesso easing ovunque.

## Intro homepage

Hero può avere sequenza:

```text
background
↓
griglia
↓
titolo
↓
sottotitolo
↓
ricerca
↓
mappa
↓
statistiche
```

Animazioni sfalsate.

Non ritardare accesso ai contenuti.

Hero deve diventare utilizzabile subito.

## Reveal

Elementi entrano con combinazione:

* opacity;
* translateY;
* clip-path;
* scale minima.

Esempio:

```text
opacity 0 → 1
y 24px → 0
duration 600ms
ease expo.out
```

Evita grandi spostamenti.

## Stagger

Usa stagger per:

* liste;
* card;
* categorie;
* statistiche;
* risultati ricerca.

Esempio GSAP:

```js
gsap.from(".card", {
  opacity: 0,
  y: 24,
  duration: 0.55,
  stagger: 0.06,
  ease: "power3.out"
});
```

Stagger deve aumentare percezione di struttura.

Non ritardare decine di elementi uno dopo l'altro.

## Hero title

Titoli grandi possono usare:

* split text;
* clip reveal;
* line reveal;
* fade + translate.

Evita animazioni lettera-per-lettera lente.

Preferisci animare parole o righe.

## Testo

Animazione testo deve preservare leggibilità.

Non usare:

* scrambling;
* lettere casuali;
* glitch;
* testo che lampeggia.

Eccezione solo per elemento grafico specifico e molto breve.

## Numeri

Statistiche possono animarsi da:

```text
0 → valore reale
```

Solo quando valore è già noto.

Esempio:

```text
0
...
2.847
```

Duration indicativa:

`600–1000ms`

Non animare continuamente.

Per utenti screen reader, valore finale deve essere disponibile senza dipendere dall'animazione.

## Counter

Usa GSAP o utility dedicata.

Arrotondamenti devono rispettare dato originale.

Mai modificare informazione reale durante visualizzazione finale.

## Card hover

Hover elegante:

```text
translateY(-2px)
border-color change
shadow leggermente maggiore
```

Durata:

`160–240ms`

Non usare:

```text
scale(1.08)
```

su card normali.

## Button hover

Possibili effetti:

* background transition;
* border transition;
* icon translate;
* underline;
* micro scale.

Scale massima indicativa:

```text
1.02
```

Non fare pulsanti "saltare".

## Button icon

Esempio:

```text
ArrowRight
```

può spostarsi leggermente a destra al hover.

```text
x: 0 → 3px
```

Durata breve.

## Navigation

Elemento attivo può usare:

* underline animata;
* pill che si sposta;
* indicatore laterale;
* background shared layout.

Preferenza:

**shared indicator**

Indicatore si muove tra destinazioni invece di ricrearsi.

## Page transitions

SPA può usare transizione breve:

```text
current page
opacity 1 → 0.96
new page
opacity 0 → 1
```

oppure:

```text
clip-path
scale minima
```

Non usare transizioni lunghe tra pagine informative.

## View Transitions

Quando browser e architettura lo permettono, valuta **View Transitions API**.

Usala per:

* cambio pagina;
* apertura dettaglio;
* immagini;
* elementi condivisi.

Fallback deve essere automatico.

Non rendere View Transitions requisito funzionale.

## Mappa

Mappa ha motion specifico.

### Marker

Marker può:

* comparire con scale;
* fade;
* bounce minimo al selezionamento.

Evitare bounce continuo.

### Selezione

Quando utente seleziona luogo:

```text
marker
↓
highlight
↓
map pan
↓
panel reveal
```

Movimenti devono essere collegati.

### Pannello

Scheda luogo può entrare:

```text
y: 24px → 0
opacity: 0 → 1
```

oppure da lato:

```text
x: 32px → 0
```

## Scroll storytelling

Usa GSAP ScrollTrigger solo quando scroll deve controllare realmente contenuto.

Possibili sezioni:

* evoluzione territoriale;
* cronologia;
* paesaggio;
* mappa storica;
* dati demografici.

Non trasformare ogni pagina in esperienza scrollytelling.

## Parallax

Usalo raramente.

Preferenza:

```text
5–20px
```

Non creare forti effetti parallax.

Su mobile disabilita quando necessario.

## SVG

SVG può avere animazioni avanzate.

Esempi:

* linee cartografiche che si disegnano;
* confini che compaiono;
* coordinate;
* percorsi;
* icone.

GSAP + SVG particolarmente adatto.

Evita migliaia di nodi SVG animati contemporaneamente.

## Griglia cartografica

Elementi decorativi possono comparire con:

```text
opacity
scale
clip-path
stroke-dashoffset
```

Devono restare secondari al dato.

## Loading

Usa skeleton animato molto leggero.

Preferire:

```text
opacity
gradient shimmer molto lento
```

Non usare spinner enormi.

## Skeleton

Animazione indicativa:

```text
duration: 1.2s–1.8s
loop: infinite
```

Fermare animazione quando contenuto arriva.

## Error

Errore non deve "shake".

Evita animazione aggressiva.

Mostra semplicemente stato con fade breve.

## Success

Success può usare:

* check reveal;
* stroke animation;
* opacity;
* scale minima.

Duration:

`200–450ms`

## Modal

Apertura:

```text
overlay opacity
0 → 1
```

```text
dialog
opacity 0 → 1
scale 0.98 → 1
y 8px → 0
```

Chiusura deve essere più rapida.

## Drawer

Entrata laterale:

```text
x: ±100% → 0
```

Con easing controllato.

Non lasciare pannello in movimento durante interazione.

## Dropdown

Usa:

```text
opacity
scaleY
translateY
```

Durata:

`120–180ms`

Non fare animazioni elaborate per menu semplici.

## Tooltip

Fast.

```text
opacity 0 → 1
translateY 4px → 0
```

Durata:

`120–160ms`

## Accordion

Anima altezza con tecnica appropriata.

Non usare `height: auto` con transition CSS diretta.

Preferire soluzione robusta con:

* grid;
* measured height;
* Web Animations;
* GSAP.

Chevron ruota separatamente:

```text
0deg → 180deg
```

## Search

Campo ricerca può avere:

* focus expansion;
* icon transition;
* result reveal;
* matched item highlight.

Non animare ogni carattere digitato.

## Filtri

Quando filtro cambia:

* mantieni layout stabile;
* aggiorna risultati;
* anima soltanto cambiamenti necessari.

Evitare flash completo della pagina.

## Liste

Quando elemento viene aggiunto/rimosso:

* animate entry;
* animate exit;
* mantenere posizione degli altri elementi quando possibile.

FLIP technique può essere usata per riordinamento.

GSAP è adatto.

## Tabelle

Non animare tutte le righe quando arrivano dati.

Preferire:

* opacity globale;
* skeleton;
* highlight temporaneo della riga modificata.

## Grafici

Grafico può entrare con:

* line draw;
* bar grow;
* point fade.

Duration:

`500–900ms`

Valori finali devono restare immediatamente accessibili.

## Timeline

Timeline storica può usare:

* linea che si disegna;
* nodi che compaiono;
* contenuti stagger.

ScrollTrigger adatto.

Non rallentare lettura.

## Image reveal

Foto possono usare:

```text
clip-path
scale
opacity
```

Preferenza:

```text
clip-path + opacity
```

Scale molto piccola:

`1.03 → 1`

Non fare zoom evidente.

## Hover fotografie

Effetti possibili:

* scale `1.02`;
* overlay leggero;
* caption reveal.

Non usare effetti Instagram-style.

## Cursor

Custom cursor generalmente non necessario.

Non sostituire cursore standard su mobile.

Su desktop usarlo solo per esperienze molto specifiche.

Default:

**cursor nativo**

## Scroll behavior

Mantieni anchor link utilizzabili.

CSS:

```css
html {
  scroll-behavior: smooth;
}
```

solo quando non crea problemi di accessibilità o navigazione.

Lenis non deve sostituire completamente comportamento nativo senza motivo.

## Reduced motion

Obbligatorio:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ma non limitarti a CSS.

GSAP deve rispettare stessa preferenza.

Esempio:

```js
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!reduceMotion) {
  // enhanced animation
}
```

## Mobile

Mobile deve avere animazioni più brevi e meno numerose.

Riduci:

* parallax;
* scroll effects;
* grandi trasformazioni;
* elementi simultanei.

Touch interaction deve restare immediata.

## Performance

Mai animare continuamente:

* `top`;
* `left`;
* `width`;
* `height`;

quando puoi usare:

```text
transform
opacity
```

Preferire proprietà compositor-friendly.

## GPU

Non aggiungere `will-change` a tutto.

Usalo solo per elementi che stanno realmente per essere animati.

Rimuovilo quando animazione lunga termina quando necessario.

## Layout shift

Animazioni non devono causare CLS.

Dimensioni finali devono essere prevedibili.

Non animare layout critico causando reflow inutile.

## 60 FPS

Obiettivo:

**movimento fluido**

Controlla:

* frame rate;
* main thread;
* paint;
* layout;
* memory;
* GPU.

Se animazione complessa rallenta dispositivo medio, ridurla.

## Lazy animation

Non iniziare animazioni fuori viewport inutilmente.

Usa:

* IntersectionObserver;
* ScrollTrigger;
* viewport detection.

## Reuse

Crea utility/componenti:

```text
FadeIn
Reveal
Stagger
PageTransition
ModalTransition
DrawerTransition
ListTransition
CountUp
MapMarkerTransition
```

Non duplicare timeline in ogni pagina.

## Timeline centralizzate

Esempio struttura:

```text
src/
  animations/
    config.ts
    easing.ts
    durations.ts
    reveal.ts
    hover.ts
    page.ts
    map.ts
    modal.ts
    reducedMotion.ts
```

Ogni animazione riutilizzabile deve vivere qui o struttura equivalente.

## Config

Centralizza:

```js
const motion = {
  duration: {
    fast: 0.18,
    normal: 0.32,
    slow: 0.6
  },
  ease: {
    standard: "power3.out",
    enter: "expo.out"
  }
};
```

Non spargere valori casuali nel progetto.

## Debug

In sviluppo prevedi possibilità di:

* disabilitare motion;
* rallentare motion;
* vedere markers ScrollTrigger;
* verificare overflow;
* controllare animazioni duplicate.

Non lasciare debug visibile production.

## Anti-regressione

Prima di aggiungere animazione:

1. verifica utilità;
2. cerca animazione esistente;
3. riusa token;
4. verifica mobile;
5. verifica reduced motion;
6. verifica performance;
7. verifica CLS;
8. verifica tastiera;
9. verifica touch;
10. verifica dispositivi medi.

## Regola assoluta

**Animazioni possono essere "fighe". Non possono essere inutili.**

Il progetto deve dare sensazione di prodotto premium tramite:

**timing + easing + transizioni + gerarchia + fluidità**

non tramite quantità infinita di effetti.

## Regola finale

**Use GSAP for hero, SVG, map, scroll storytelling and complex sequences. Use CSS for simple UI. Use Lenis only when justified. Respect reduced motion. Keep data usable at every frame.**
