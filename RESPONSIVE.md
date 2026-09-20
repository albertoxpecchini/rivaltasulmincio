# RESPONSIVE.md

## Scopo

Definisci matrice responsive per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Il progetto deve funzionare bene su ogni dispositivo reale.

Non progettare per modello specifico. Progetta per:

* dimensione viewport;
* input;
* densità;
* orientamento;
* capacità hardware;
* capacità rete.

## Principio

**Mobile first.**

Ogni componente parte da layout mobile.

Poi espande spazio e funzionalità quando viewport lo permette.

Non creare versione desktop e versione mobile completamente separate salvo necessità reale.

## Matrice dispositivi

| Classe        | Viewport indicativa | Input            | Layout        | Densità | Motion           | Mappa      |
| ------------- | ------------------: | ---------------- | ------------- | ------- | ---------------- | ---------- |
| XS Mobile     |           320–374px | Touch            | 1 colonna     | Alta    | Ridotta          | Full width |
| Mobile        |           375–479px | Touch            | 1 colonna     | Alta    | Standard ridotta | Full width |
| Large Mobile  |           480–639px | Touch            | 1–2 col.      | Media   | Standard         | Full width |
| Small Tablet  |           640–767px | Touch            | 2 col.        | Media   | Standard         | Ampia      |
| Tablet        |          768–1023px | Touch            | 2 col.        | Media   | Standard         | Ampia      |
| Small Desktop |         1024–1279px | Mouse + keyboard | 2–3 col.      | Media   | Completa         | Ampia      |
| Desktop       |         1280–1439px | Mouse + keyboard | 3 col.        | Media   | Completa         | Grande     |
| Large Desktop |         1440–1919px | Mouse + keyboard | 3–4 col.      | Bassa   | Completa         | Grande     |
| Ultra-wide    |             1920px+ | Mouse + keyboard | Max container | Bassa   | Completa         | Max        |

## Breakpoint

Usa breakpoint basati sul layout.

Valori iniziali:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1440px;
--breakpoint-ultra: 1920px;
```

Non aggiungere breakpoint per:

* iPhone specifico;
* Galaxy specifico;
* iPad specifico;
* modello notebook specifico.

Aggiungi breakpoint solo quando layout realmente necessita di cambio.

## Matrice funzionale

### XS Mobile — 320–374px

Priorità massima:

* leggibilità;
* touch;
* contenuto principale;
* ricerca;
* navigazione semplice.

Regole:

* 1 colonna;
* padding 16px;
* card compatte;
* pulsanti full-width quando appropriato;
* filtri in drawer;
* header compatto;
* mappa full-width;
* testo mai sotto soglia accessibile.

Nascondi elementi secondari quando spazio insufficiente.

Non nascondere informazioni essenziali.

Motion:

* no parallax;
* no effetti complessi;
* reveal brevi;
* transizioni rapide.

## Mobile — 375–479px

Layout:

* 1 colonna;
* padding 16–20px;
* card full-width;
* statistiche in griglia compatta;
* navigazione hamburger o bottom navigation quando appropriato.

Mappa:

* altezza minima utile;
* controlli grandi;
* pannelli bottom sheet preferibili a sidebar.

Motion:

* reveal;
* microinterazioni;
* transizioni pannello;
* marker selection.

Riduci stagger lunghi.

## Large Mobile — 480–639px

Consentire:

* 2 card affiancate quando contenuto lo permette;
* toolbar più ampia;
* ricerca con più controlli;
* statistiche 2×2.

Mappa può usare pannelli flottanti più compatti.

Motion quasi completo, ma niente effetti che richiedono GPU elevata.

## Small Tablet — 640–767px

Layout:

* 2 colonne quando possibile;
* navigation ancora touch-first;
* pannelli più grandi;
* tabelle con scroll orizzontale controllato quando necessario.

Mappa:

* controlli laterali possibili;
* pannello luogo può diventare side panel.

Motion standard.

## Tablet — 768–1023px

Layout:

* 2 colonne;
* alcune pagine 3 colonne;
* sidebar opzionale;
* filtri visibili quando spazio disponibile.

Header può diventare desktop-like.

Mappa può usare:

```text
mappa | pannello
```

quando viewport lo permette.

Touch rimane input principale.

Target interattivi:

**minimo 44×44px**

## Small Desktop — 1024–1279px

Mouse + keyboard disponibili.

Layout:

* 2–3 colonne;
* sidebar;
* filtri persistenti;
* tabelle complete;
* mappe con pannelli laterali.

Header completo.

Motion completo.

Hover attivo.

Focus tastiera obbligatorio.

## Desktop — 1280–1439px

Layout principale:

```text
sidebar / contenuto / eventuale pannello
```

oppure:

```text
contenuto / mappa
```

Container massimo consigliato:

```css
max-width: 1440px;
```

Non espandere testo su tutta viewport.

Mappa può utilizzare spazio extra.

Motion completo.

Scroll storytelling ammesso.

## Large Desktop — 1440–1919px

Aumenta spazio, non dimensione di ogni elemento.

Permetti:

* mappe grandi;
* dashboard dati più dense;
* sidebar;
* grafici affiancati;
* confronti;
* pannelli secondari.

Non creare:

* titoli enormi solo perché schermo è grande;
* card giganti;
* spazi vuoti artificiali.

## Ultra-wide — 1920px+

Contenuto deve restare controllato.

Regola:

```css
.container {
  width: min(100% - 6rem, 1600px);
  margin-inline: auto;
}
```

Valore esatto dipende dal layout.

Mappa può usare viewport extra.

Testo non deve diventare troppo largo.

Possibile struttura:

```text
sidebar | contenuto | mappa
```

oppure:

```text
contenuto | mappa | pannello dati
```

## Matrice input

| Input    | Hover    | Focus                  | Gesture           | Comportamento        |
| -------- | -------- | ---------------------- | ----------------- | -------------------- |
| Touch    | No       | Programmatico/keyboard | Swipe, pinch, tap | Touch-first          |
| Mouse    | Sì       | Sì                     | No                | Hover + click        |
| Keyboard | No       | Sì                     | No                | Full navigation      |
| Pen      | Limitato | Sì                     | Tap/swipe         | Come touch           |
| Trackpad | Sì       | Sì                     | Scroll/gesture    | Come mouse + gesture |

Non usare hover come unica modalità di accesso.

## Matrice orientamento

### Portrait

Priorità:

* contenuto;
* ricerca;
* elenco;
* bottom sheet;
* mappa.

### Landscape mobile

Usa spazio orizzontale aggiuntivo.

Non forzare stesso layout portrait.

Mappa può diventare più alta.

### Tablet landscape

Sidebar e mappa possono stare affiancate.

### Desktop

Usa orientamento naturalmente disponibile.

## Matrice performance

| Profilo   | Hardware | Motion   | Immagini          | Mappe          |
| --------- | -------- | -------- | ----------------- | -------------- |
| Low-end   | Limitato | Ridotta  | Compressione alta | Layer limitati |
| Mid-range | Medio    | Standard | Responsive        | Standard       |
| High-end  | Elevato  | Completa | Alta qualità      | Layer completi |

Non rilevare solo User Agent.

Usa capacità browser quando necessario.

## Reduced motion

Quando:

```css
prefers-reduced-motion: reduce
```

disabilita o riduci:

* parallax;
* scroll storytelling;
* reveal complessi;
* rotazioni;
* scale decorative;
* transizioni lunghe.

Mantieni transizioni funzionali minime.

GSAP deve rispettare stessa regola.

## Connessione lenta

Su rete lenta:

* carica immagini responsive;
* lazy-load;
* riduci immagini non essenziali;
* ritarda mappe secondarie;
* evita video automatici;
* mantieni contenuto testuale immediatamente disponibile.

Non bloccare contenuto principale per asset secondari.

## Matrice immagini

### XS/mobile

Usa:

```text
small / medium
```

### Tablet

Usa:

```text
medium / large
```

### Desktop

Usa:

```text
large
```

### Hero

Se viewport grande:

```text
1920px
```

solo quando necessario.

Non servire 1920px su mobile.

## Matrice mappa

### Mobile

```text
full width
bottom sheet
touch controls
limited visible layers
```

### Tablet

```text
map + compact panel
touch controls
more layers
```

### Desktop

```text
map + side panel
mouse controls
keyboard support
full layer controls
```

### Ultra-wide

```text
large map
persistent panels
expanded data context
```

## Matrice navigazione

### Mobile

```text
logo | search/menu
```

Menu:

* drawer;
* bottom sheet;
* full-screen navigation.

### Tablet

Header compatto con menu espandibile.

### Desktop

Navigazione primaria sempre visibile quando spazio disponibile.

### Ultra-wide

Non allungare menu inutilmente.

Usa max-width e gruppi logici.

## Matrice tabelle

### Mobile

Preferisci:

* colonne essenziali;
* scroll orizzontale;
* card alternative;
* righe espandibili.

Non comprimere testo fino a renderlo illeggibile.

### Tablet

Mostra più colonne.

### Desktop

Tabella completa.

### Ultra-wide

Aumenta spazio colonne, non font in modo sproporzionato.

## Matrice form

### Mobile

Input full-width.

Pulsanti full-width quando utile.

### Tablet

Campi possono affiancarsi.

### Desktop

Griglia campi.

### Ultra-wide

Mantieni max-width form.

Non creare input larghi 1000px.

## Matrice card

### Mobile

```text
1 colonna
```

### Tablet

```text
2 colonne
```

### Desktop

```text
3–4 colonne
```

### Ultra-wide

Non superare densità leggibile.

Usa max-width card.

## Matrice font

Font size deve usare valori fluidi dove utile.

Esempio:

```css
h1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
}
```

Non aumentare font indefinitamente su display grandi.

## Matrice spacing

Mobile:

```text
16px
```

Tablet:

```text
24px
```

Desktop:

```text
32px
```

Large desktop:

```text
32–48px
```

Usa token `SPACING.md`.

Non duplicare sistema.

## Matrice header

| Classe        | Header                |
| ------------- | --------------------- |
| XS            | compatto              |
| Mobile        | compatto              |
| Large Mobile  | compatto              |
| Small Tablet  | compatto/ibrido       |
| Tablet        | ibrido                |
| Small Desktop | desktop               |
| Desktop       | desktop               |
| Large Desktop | desktop               |
| Ultra-wide    | desktop con max-width |

Header deve restare stabile durante scroll quando sticky.

## Matrice footer

Mobile:

* sezioni collassabili quando utile.

Tablet:

* 2 colonne.

Desktop:

* 3–4 gruppi.

Ultra-wide:

* mantiene max-width.

## Container

Regola generale:

```css
.container {
  width: min(
    calc(100% - 2 * var(--page-padding)),
    var(--container-max)
  );
  margin-inline: auto;
}
```

Token:

```css
--container-max: 1440px;
```

Per layout mappa speciali può essere maggiore.

## Safe areas

Su dispositivi con notch e home indicator:

```css
padding-inline:
  max(var(--page-padding), env(safe-area-inset-left));
```

e:

```css
padding-bottom:
  max(var(--page-padding), env(safe-area-inset-bottom));
```

Usare safe area solo quando necessario.

## Touch target

Minimo:

```text
44 × 44px
```

Preferibile:

```text
48 × 48px
```

per controlli mappa e azioni frequenti.

## Hover media query

Non assumere hover su touch.

Usa:

```css
@media (hover: hover) and (pointer: fine) {
  /* hover interactions */
}
```

Per touch:

```css
@media (hover: none) and (pointer: coarse) {
  /* touch behavior */
}
```

## Pointer precision

Mouse:

* controlli compatti possibili.

Touch:

* controlli grandi;
* spacing maggiore;
* meno elementi contemporaneamente.

## Regola anti-overflow

A nessuna viewport il sito deve creare:

* scroll orizzontale accidentale;
* testo tagliato;
* pulsanti fuori viewport;
* mappa inutilizzabile;
* modali oltre schermo.

Testare almeno:

```text
320 × 568
375 × 667
390 × 844
430 × 932
768 × 1024
1024 × 768
1280 × 720
1440 × 900
1920 × 1080
2560 × 1440
```

Questi sono viewport di test, non target device specifici.

## Test responsive

Per ogni pagina verifica:

* layout;
* overflow;
* typography;
* immagini;
* mappa;
* touch;
* hover;
* keyboard;
* focus;
* modal;
* drawer;
* sticky;
* scroll;
* animation;
* reduced motion;
* loading;
* error state.

## Regola finale

**Viewport piccolo = meno spazio. Non meno contenuto essenziale.**

**Viewport grande = più spazio. Non elementi enormi.**

**Touch = target grandi. Mouse = precisione. Keyboard = accesso completo.**

Ogni componente deve avere comportamento definito in tutta matrice responsive.
