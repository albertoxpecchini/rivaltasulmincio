# Linee Guida UI - Rivalta sul Mincio

## Uso delle Icone (Emoji & Font Icons)

Per mantenere un design pulito, accessibile e professionale, l'uso delle icone all'interno del progetto deve seguire queste regole:

1. **Massimo 1 icona per sezione**: È consentita al massimo una sola icona per ogni sezione o blocco logico, per evitare sovraccarico visivo.
2. **Spaziatura obbligatoria**: Le icone devono sempre essere separate dal testo adiacente da almeno uno spazio (es. `<span><i class="icon"></i> Titolo</span>` oppure `🚀 Titolo`).
3. **Solo nei titoli e nelle barre di navigazione**: Le icone sono consentite esclusivamente per accompagnare i titoli (es. H1, H2) o all'interno delle barre di navigazione (navbar, sidebar) per facilitare il riconoscimento visivo.
4. **Non nel testo normale**: Evitare l'inserimento di icone e/o emoji all'interno di paragrafi, descrizioni o testo fluido.
5. **Nessun uso decorativo eccessivo o ripetitivo**: Non utilizzare icone ripetute o puramente decorative che non aggiungono valore semantico o funzionale.
6. **Coerenza stilistica**: Utilizzare icone dello stesso set o stile all'interno delle interfacce.

Queste regole si applicano a tutto il codice HTML, markdown e contenuti generati dinamicamente.

---

## Policy operativa (enforcement nel codice)

Per evitare ambiguità, nel progetto valgono anche queste regole operative:

1. **Titoli consentiti per icone automatiche**: solo `h1` e `h2`.
2. **Nessuna icona automatica su testo fluido**: vietato inserire icone in paragrafi, card testuali, commenti, liste articolo o descrizioni.
3. **Navigation-only per le barre**: le icone sono ammesse in topbar/menu di navigazione, con separazione testuale visibile.
4. **Una sola icona per elemento di navigazione**: evitare doppie icone decorative nello stesso item (es. icona + freccia extra).
5. **Footer e modali**: niente icone decorative nei contenuti non di navigazione.
6. **Set icone unico**: usare Font Awesome come set di riferimento per la UI.
7. **Spaziatura obbligatoria**: mantenere sempre separazione tra icona e testo (markup o spacing CSS equivalente).

## Eccezione funzionale

Le emoji usate come **avatar profilo utente** (`avatar_emoji`) sono trattate come contenuto identitario utente e non come icone decorative UI.

## Checklist rapida per PR

- [ ] Le icone sono solo in `h1`/`h2` o in elementi di navigazione.
- [ ] Non ci sono icone in testo normale, descrizioni, paragrafi o bottoni decorativi.
- [ ] Ogni link/menu item ha al massimo una sola icona.
- [ ] Icona e testo sono separati da spazio/gap leggibile.
- [ ] È usato un solo set di icone (Font Awesome).
