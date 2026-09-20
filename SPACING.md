# SPACING.md

## Scopo

Definisci sistema spaziature per **Rivalta sul Mincio — il paese, in ogni suo dato**.

Obiettivo:

* ritmo visivo coerente;
* densità informativa controllata;
* allineamenti precisi;
* responsive prevedibile;
* nessun margine arbitrario.

## Principio

Usa scala spaziature centralizzata.

Non inventare valori casuali dentro componenti.

Preferisci multipli coerenti di 4px.

## Scala base

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */
}
```

Usa scala sopra come riferimento principale.

## Regola 4px

Spaziature standard devono essere multipli di 4px.

Eccezioni ammesse solo quando richieste da:

* tipografia;
* icone;
* elementi nativi;
* allineamento ottico;
* vincoli di sistema.

Non creare valori come:

```text
13px
17px
23px
29px
37px
```

senza motivo documentato.

## Gap

Preferisci `gap` per layout flex e grid.

Esempio:

```css
display: flex;
gap: var(--space-4);
```

Evita margini individuali quando `gap` risolve problema.

## Spaziatura testo

### Titolo + descrizione

```text
8–16px
```

### Titolo + contenuto

```text
16–24px
```

### Paragrafi

```text
16–24px
```

Dipende da lunghezza e densità.

Non separare ogni paragrafo con 48px.

## Sezioni

Separazione standard:

```text
48–96px
```

Desktop può usare più spazio.

Mobile deve ridurre spazio quando necessario.

Indicazione:

```css
section {
  padding-block: clamp(3rem, 7vw, 6rem);
}
```

## Container

Definisci padding orizzontale centralizzato.

```css
:root {
  --container-padding-mobile: 1rem;
  --container-padding-tablet: 2rem;
  --container-padding-desktop: 3rem;
}
```

Usa `clamp()` quando utile.

## Container massimo

Contenuto editoriale deve avere larghezza controllata.

Esempio:

```css
.container {
  width: min(100% - 2rem, 1440px);
  margin-inline: auto;
}
```

Adatta valore al layout reale.

Non rendere tutto full-width.

## Gutter

Desktop:

```text
24–48px
```

Tablet:

```text
20–32px
```

Mobile:

```text
16–20px
```

Gutter deve restare coerente tra pagine.

## Grid gap

Scala consigliata:

```text
4px   micro
8px   compatto
12px  piccolo
16px  standard
24px  medio
32px  grande
48px  molto grande
```

Non usare sempre 32px.

Densità deve dipendere dal contenuto.

## Card

Padding standard:

```text
16px
20px
24px
```

Indicazione:

* card compatta: 16px;
* card standard: 20px;
* card importante: 24px.

Evita card con 40–48px di padding senza ragione.

## Pannelli

Pannelli informativi:

```text
20–32px
```

Pannelli mappa possono usare padding più compatto.

## Tabelle

Celle standard:

```text
12px 16px
```

Tabelle dense:

```text
8px 12px
```

Non ridurre sotto soglia leggibile.

## Form

Gap verticale standard:

```text
16px
```

Gruppi logici:

```text
24–32px
```

Label + input:

```text
6–8px
```

Errore sotto input:

```text
4–8px
```

## Pulsanti

Padding indicativo:

```text
8px 14px
10px 16px
12px 20px
```

Dipende dalla dimensione.

Target touch deve restare almeno 44×44px quando interattivo.

## Navigazione

Gap tra elementi:

```text
8–24px
```

Non comprimere menu fino a rendere difficile selezione.

## Header

Padding verticale deve restare compatto.

Indicazione:

```text
12–20px
```

Header non deve occupare inutilmente parte viewport.

## Footer

Footer può avere spaziatura maggiore.

Indicazione:

```text
48–80px
```

Dividi aree tramite struttura e non tramite grandi vuoti.

## Mappa

Controlli mappa:

```text
8–12px
```

Tra controlli distinti:

```text
8px
```

Pannelli mappa:

```text
12–20px
```

Evita controlli troppo lontani tra loro.

## Schede dettaglio

Schema:

```text
titolo
  ↓ 8–16px
meta
  ↓ 16–24px
contenuto principale
  ↓ 24–32px
contenuti secondari
  ↓ 24px
fonte
```

Mantieni gerarchia verticale prevedibile.

## Statistiche

Numero e label:

```text
4–8px
```

Gruppi statistici:

```text
16–32px
```

Sezione statistiche:

```text
32–64px
```

Non trasformare ogni statistica in blocco enorme.

## Badge

Padding:

```text
4px 8px
```

Per badge grandi:

```text
6px 10px
```

Badge deve rimanere compatto.

## Icona + testo

Gap standard:

```text
8px
```

Compatto:

```text
6px
```

Ampio:

```text
12px
```

Non usare margini casuali.

## Liste

Elemento lista:

```text
8–16px
```

Separazione tra gruppi:

```text
24–32px
```

Liste dense devono restare scansionabili.

## Breadcrumb

Gap:

```text
6–8px
```

Padding verticale:

```text
8–12px
```

Non occupare spazio eccessivo.

## Modali

Padding:

```text
24px
```

Su mobile:

```text
16–20px
```

Gap titolo/contenuto:

```text
16px
```

Gap azioni:

```text
12px
```

## Drawer

Padding desktop:

```text
24px
```

Mobile:

```text
16px
```

Mantenere spazio sufficiente per gesture e chiusura.

## Empty state

Padding:

```text
32–64px
```

In mobile:

```text
24–32px
```

Non creare enorme spazio vuoto.

## Error state

Usa struttura compatta:

```text
titolo
  ↓ 8px
descrizione
  ↓ 16px
azione
```

## Responsive

Non mantenere automaticamente stessa spaziatura a ogni breakpoint.

Usa:

```css
padding-block: clamp(3rem, 6vw, 6rem);
```

quando serve interpolazione fluida.

Riduci principalmente:

* padding pagina;
* gap griglia;
* separazione sezioni;
* padding card.

Mantieni invece stabili gli spazi che influenzano usabilità:

* target touch;
* label/input;
* controlli;
* icone.

## Breakpoint

Breakpoint devono dipendere dal layout, non dalla presenza di dispositivi specifici.

Valori indicativi:

```text
640px
768px
1024px
1280px
1440px
```

Non creare breakpoint per ogni modello smartphone.

## Vertical rhythm

Mantieni ritmo costante.

Preferenza:

```text
4
8
12
16
24
32
48
64
96
```

La stessa scala deve ricorrere in:

* card;
* sezioni;
* pannelli;
* form;
* tipografia;
* navigazione.

## Spazio negativo

Spazio vuoto deve separare livelli di informazione.

Non usarlo per fare sembrare sito "premium" senza migliorare lettura.

Priorità:

**gerarchia > aria > decorazione**

## Full-width

Sezione può usare intera viewport quando necessario.

Contenuto interno deve mantenere container.

Esempio:

```css
.section {
  width: 100%;
}

.section__inner {
  width: min(100% - 2rem, 1440px);
  margin-inline: auto;
}
```

## Allineamento

Elementi correlati devono condividere:

* asse;
* padding;
* baseline;
* griglia.

Evita elementi che iniziano a x casuali.

## Spaziatura ottica

Valore matematico può essere modificato per percezione visiva.

Esempi:

* icona vicino testo;
* logo;
* elementi circolari;
* font con ascender/descender particolari.

Correzione ottica ammessa.

Deve restare locale e documentata.

## CSS

Preferisci token.

Esempio:

```css
.card {
  padding: var(--space-6);
  gap: var(--space-4);
}

.section {
  padding-block: var(--space-16);
}
```

Non:

```css
.card {
  padding: 23px;
  gap: 17px;
}
```

## Anti-regressione

Prima di aggiungere nuova spaziatura:

1. cerca token esistente;
2. verifica componente simile;
3. riusa scala;
4. controlla desktop;
5. controlla mobile;
6. controlla densità;
7. verifica overflow.

Non introdurre valore nuovo per risolvere singolo pixel senza necessità.

## Regola finale

**4px base. Pochi token. Gap coerenti. Container stabile. Mobile non è desktop piccolo.**

Spaziatura deve organizzare dati di Rivalta.

Mai usare spazio come decorazione.
