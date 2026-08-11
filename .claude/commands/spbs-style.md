---
description: Converte contenuto/componenti/pagine nello stile del sito (design system .sb-) 1:1
argument-hint: [file, componente, markup incollato o descrizione di ciò da restilizzare]
---

# /spbs-style

Converti **$ARGUMENTS** nello stile del sito **1:1** — cioè nella stessa identica grammatica
visiva del design system `.sb-` («piattaforma», rifatto sulla home di Supabase), non in uno stile
"ispirato". Se `$ARGUMENTS` è vuoto, chiedi cosa restilizzare (un file/componente del repo, markup
incollato, o la descrizione di qualcosa di nuovo da costruire).

## 0. Prima di tutto: rileggi i token veri, non fidarti della memoria

I valori qui sotto sono un estratto fedele al momento in cui questo comando è stato scritto, ma
`src/app/home.css` è l'unica fonte di verità e può essere cambiato da allora. Prima di applicare
qualsiasi colore/misura:

- `grep -n "^  --sb-" src/app/home.css` per i token del tema chiaro (blocco `.sb-home`) e scuro
  (blocco `html.dark .sb-home`, riga ~52).
- Se serve la palette estesa (ombre, gradienti, colori del codice, contrasto), leggi anche
  [`src/app/site/PaletteModal.tsx`](src/app/site/PaletteModal.tsx) — è la stessa cosa che il sito
  mostra dal footer → «Palette».
- Se il target assomiglia a una pagina già esistente (bio, archivio, trivia, …), leggi anche il suo
  CSS colocato (`src/app/<pagina>/*.css` o `src/app/site/*.css`) per non reinventare pattern che
  esistono già.

## 1. I token (estratto — verifica sempre col punto 0)

**Chiaro (default, `.sb-home`):**
`--sb-bg:#fcfcfc` `--sb-bg-alt:#f8f8f8` `--sb-surface-75:#fbfbfb` `--sb-surface-100:#f6f6f6`
`--sb-surface-200:#f0f0f0` `--sb-overlay:rgba(0,0,0,.05)` `--sb-border:#e8e8e8`
`--sb-border-strong:#dbdbdb` `--sb-border-stronger:#c7c7c7` `--sb-fg:#171717` `--sb-fg-light:#525252`
`--sb-fg-lighter:#6f6f6f` `--sb-fg-muted:#8f8f8f` `--sb-brand:hsl(153,60%,53%)`
`--sb-brand-text:hsl(153,86%,28%)` `--sb-btn-bg:hsl(151,67%,67%)` `--sb-btn-bd:hsla(155,78%,40%,.75)`
`--sb-btn-bg-hover:hsl(151,63%,60%)` `--sb-btn-fg:#101010`
`--sb-shadow-card:0 4px 20px -6px rgba(0,0,0,.1)`

**Scuro (`html.dark .sb-home`, stessi nomi ridichiarati — MAI un foglio a parte):**
`--sb-bg:#141414` `--sb-bg-alt:#181818` `--sb-fg:#ededed` `--sb-fg-light:#b4b4b4`
`--sb-brand:hsl(153,60%,53%)` (identico ai due temi) `--sb-brand-text:hsl(155,100%,42%)`
`--sb-btn-bg:hsl(155,100%,19%)` `--sb-btn-fg:#ffffff`
`--sb-shadow-card:0 4px 24px -6px rgba(0,0,0,.55)`

**Regola d'oro sul colore:** palette **neutra** (solo grigi) ovunque + **un'unica tinta**, il verde
brand. L'arancio Ubuntu (`#e95420`) è identità storica documentata, non un secondo accento attivo.
Non introdurre mai un secondo colore vivo per "distinguere" qualcosa — si distingue con peso,
spaziatura o bordo, non con un altro hue.

**Tipografia:** `"Ubuntu", Geneva, Tahoma, sans-serif` (+ Ubuntu Mono per codice; Lora solo su
`/festa`, eccezione nota). Base `16px` / `line-height: 1.5`. Pesi quasi sempre 400/500, mai bold
pesante sui titoli.

## 2. Grammatica strutturale (i pezzi da riusare, non da reinventare)

- **Wrapper unico:** tutto ciò che usa il design system vive dentro `.sb-home` (mette bg, colore,
  font). Il tema scuro è nativo: `html.dark .sb-home` ridichiara le stesse custom property, non è
  un secondo file.
- **Contenitore/sezione:** `.sb-container` (`max-width: 80rem`, padding orizzontale
  `clamp(1.25rem, 4vw, 5rem)`); `.sb-section` (padding verticale `clamp(4rem, 8vw, 6rem)`).
- **UN SOLO fondale, `position: fixed`, per tutta la pagina** (`.sb-bg` con due veli radiali verde
  + ciano, `.sb-bg-grid` con griglia tecnica che si dissolve verso il basso via `mask-image`).
  **Nessuna sezione ha un bordo o un bg proprio**: da una sezione all'altra non deve esserci mai una
  riga di confine, il contenuto scorre trasparente sopra il fondale. Se il target ha sezioni con
  sfondi alternati o divisori netti, questo va rimosso: è il primo errore da evitare.
- **Nav:** `sticky top:0`, sfondo semitrasparente sfocato (`color-mix` + `backdrop-filter: blur(10px)
  saturate(140%)`), alta `64px`, **senza bordo in cima** — il bordo/ombra compaiono solo dopo lo
  scroll (`.sb-nav--scrolled`). Voci di menu con un filo verde che si apre da sinistra sotto la voce
  al hover (`::after` scaleX).
- **Bottoni** (`.sb-btn`, h `38px`, `32px` la variante `--sm`, radius `6px`, bordo 1px sempre):
  `--primary` (bg/bordo brand-tinted), `--secondary` (bg neutro + bordo), `--ghost` (trasparente).
- **Link testuali:** colore `--sb-brand-text`, nessun sottolineato di default, freccia/icona che
  trasla di qualche px al hover (`.sb-link`).
- **Card/pannelli:** bordo `--sb-border-strong`, radius `10–12px`, `box-shadow: var(--sb-shadow-card)`;
  variante con bordo-gradiente 1px (`.sb-panel` esterno + `.sb-panel-inner` interno pieno) per i
  pannelli tipo "dashboard"/switcher di codice.
- **Pillole/badge:** radius `999px` sempre (mai un radius intermedio su elementi tondi).
- **Scala dei radius effettiva nel resto del sito:** `4px` (dettagli minuti) · `6px` (bottoni, nav
  link) · `8px` · `10–12px` (card/pannelli) · `999px` (pillole) · `50%` (pallini/avatar).
- **Naming nuove classi:** se il target è (o diventa) una pagina/sezione nuova del sito, le classi
  nuove prendono il prefisso di quella pagina, `.sb-<pagina>-*` (es. `.sb-bio-*`, `.sb-ctl-*` per la
  ControlBar), **mai** classi generiche senza prefisso. Il CSS va in un file colocato accanto al
  componente e importato da lì — non un foglio monolitico in più.
- Ogni colore/ombra/bordo nel CSS nuovo si scrive con `var(--sb-*)`, **mai** hex/hsl hard-coded
  (le uniche eccezioni sono dentro i due blocchi di token stessi).

## 3. Movimento — cosa NON aggiungere

Il sito ha **rimosso deliberatamente** reveal-allo-scroll, fade-in/slide-up a cascata, loop CSS
decorativi infiniti e riflessi che seguono il cursore nei pannelli: "scorrere una pagina non è un
evento da annunciare". Quando restilizzi qualcosa che nella sorgente ha animazioni-annuncio
(fade-up on scroll, stagger reveal, ecc.), **non portarle**: il contenuto compare e basta.

Se il target ha bisogno di movimento reale (intro di una hero al caricamento, contatori, micro-hover
magnetico), usa la stessa disciplina del sito:
- `gsap` + `gsap.matchMedia()`: `prefers-reduced-motion` **spegne** ogni animazione autonoma; gli
  effetti da puntatore montano solo sotto `(hover: hover) and (pointer: fine)`.
- Tutto si smonta con `mm.revert()` al cambio pagina/unmount — niente doppioni.
- **Non spezzare mai testo traducibile** in span per lettera/parola (il motore i18n cammina sui nodi
  di testo — vedi `src/app/i18n/translateDom.ts`); se un nodo non va mai tradotto, marcalo
  `data-no-i18n` invece.

## 4. Accessibilità minima da portare sempre

`:focus-visible` con outline verde brand (`outline: 2px solid var(--sb-brand)`), landmark semantici
(`main`/`nav[aria-label]`/`header`/`footer`), `aria-labelledby` sui modali, contrasto verificabile
con la finestra Palette del sito.

## 5. Procedura

1. Individua cosa sta chiedendo l'utente in `$ARGUMENTS`: un file/componente esistente nel repo da
   riscrivere, markup/CSS incollato da fuori, oppure la descrizione a parole di qualcosa di nuovo.
2. Esegui il punto 0 (rileggi i token veri) e, se il target somiglia a una pagina esistente, apri
   anche il suo CSS colocato prima di scrivere qualsiasi cosa.
3. Mappa ogni pezzo della sorgente sull'equivalente `.sb-` già esistente (hero → `.sb-hero`, bottone
   → `.sb-btn--*`, griglia di feature → griglia di `.sb-card`, pannello con codice → `.sb-panel` +
   switcher, ecc.) invece di inventare markup parallelo. Crea classi nuove solo per strutture che
   davvero non esistono già, seguendo il naming del punto 2.
4. Preserva **funzione e contenuto** della sorgente — è una restilizzazione, non una riscrittura del
   comportamento — a meno che l'utente non abbia chiesto anche modifiche funzionali.
5. Applica il tema scuro nativo (nessun secondo foglio: le classi lette dentro `html.dark .sb-home`
   ereditano già i token giusti) e verifica entrambi i temi.
6. Se il progetto ha un dev server avviabile, mostra il risultato in browser (light + dark) prima di
   dichiarare finito; se non è possibile, dillo esplicitamente invece di assumere che sia corretto.
