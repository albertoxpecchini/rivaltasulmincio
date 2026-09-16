# Color Walk — dove siamo, 16 settembre sera

La camminata è **giovedì 20 settembre**. Questo foglio serve a chi riprende
in mano la cosa: cosa funziona, cosa no, e cosa fare il giorno stesso.

---

## In due righe

PayPal ha cominciato a rifiutare a caso, e i contanti non dipendono più da
lui: li comanda un registro nostro su Supabase. Iscrizioni e pagamenti
online funzionano. Il banco di giovedì funziona.

---

## Cosa funziona adesso

| cosa | stato |
|---|---|
| iscriversi dal sito (online e contanti) | funziona |
| pagare online, soldi sul conto PayPal | funziona |
| mail di conferma | funziona |
| `/iscritti`, elenco e totali | funziona |
| spunta «segna incassati» + torna indietro | funziona, provato |
| correggere un'iscrizione | **da riprovare** — vedi sotto |

---

## Il guasto di fondo, che non è nostro

Dal 16 settembre sera l'**Invoicing di PayPal rifiuta a intermittenza**.
La stessa identica fattura, spedita due volte a dieci minuti di distanza:
una volta passa, una volta no. Il rifiuto è muto —
`REQUEST_REJECTED`, «contact customer service» — e non dice quale sia il
problema.

Verificato che **non** è:

- il permesso Invoicing (il gettone lo dichiara);
- le credenziali (creare ed elencare le fatture funziona);
- il conto sbagliato (25+ fatture lette, sono le nostre);
- il contenuto della fattura (stesso input, esito diverso a dieci minuti).

**Cosa fare:** chiamare l'assistenza PayPal Business dalla chat del
Business Dashboard, con un debug_id in mano (per esempio
`b6fd5273d5e28`). Non è urgente: il sito va avanti lo stesso.

---

## Come sono fatti i soldi adesso

**Contanti → registro nostro.** Tabella `incassi_contanti` su Supabase.
La spunta scrive lì, e da quel momento la persona è pagata per l'elenco.
PayPal non viene chiamato per niente: rifiuterebbe, e la verità è nel
registro.

**Online → PayPal.** Lì i soldi passano davvero da lui ed è lui a sapere
se sono arrivati. Il checkout è un ordine a sé e non dipende dalle
fatture, per questo ha continuato a funzionare tutta la sera.

Se Supabase non risponde, `/iscritti` lo scrive in rosso accanto al
conteggio: «registro dei contanti non raggiungibile». Se compare, i
contanti incassati non si vedono — l'elenco lo dice invece di far credere
che quelle persone non abbiano pagato.

---

## Giovedì 20, al banco

1. Apri `/iscritti` col telefono.
2. Arriva qualcuno che paga in contanti → **«segna incassati»**. È
   rapido, e si può tornare indietro se sbagli.
3. Se in cima compare l'avviso rosso sul registro, **fermati e segna i
   nomi su carta**: le spunte non si stanno salvando.

Due persone possono spuntare insieme: un indice unico impedisce che la
stessa iscrizione venga incassata due volte.

---

## Dopo la camminata

Le fatture su PayPal sono rimaste indietro (in bozza, o senza il
pagamento segnato). Non è un problema per l'elenco, che legge dal
registro. Per rimetterle in riga:

```
PAYPAL_CLIENT_ID=… PAYPAL_CLIENT_SECRET=… node _build/fatture-in-bozza.mjs
```

Legge e stampa, non tocca niente. Con `--spedisci` prova a spedirle
davvero. Vuole le chiavi **live**: il `.env` locale punta alla sandbox.

---

## Rimasto in sospeso

- **Correggere un'iscrizione online**: sistemato in `bb40d2e` ma non
  riprovato dopo il deploy. Il numero nuovo ora nasce dall'orologio (16
  caratteri) invece di allungare il vecchio fino a 28, che sforava il
  tetto di 25 di PayPal. **Da provare.**
- **Iscrizione di prova da cancellare**: «Prova Registro», 10 €, contanti,
  note «PROVA TECNICA registro contanti». Va tolta prima di giovedì.
- **Fattura di prova su PayPal**: `INV2-SB6F-DQW2-2ASC-ZVK9`, 1,00 €,
  riferimento `PROVA-TECNICA`. Innocua — l'elenco filtra per riferimento e
  non la vede — ma si può togliere dal pannello.
- **Lentezza di `/iscritti`**: legge tutte le fatture da PayPal a ogni
  apertura. Con 40 persone regge; non è stato guardato.

---

## Se qualcosa si rompe

I log di Vercel hanno la risposta, e vanno guardati **prima** di
ipotizzare: progetto `rivaltasulmincio`, filtro `level: error`, finestre
corte (45 minuti — quelle lunghe vanno in timeout).

Stasera ho sbagliato quattro diagnosi di fila ragionando sul nome del
campo nell'errore invece di aprire i log. `invoiceId` è il nome che PayPal
dà ad almeno tre campi diversi: il percorso della chiamata
(`POST /v2/invoicing/invoices/…/send`) non è ambiguo, il nome del campo sì.

---

## I commit di stasera

```
bb40d2e  Correggere un'iscrizione del sito non sfora piu
ab093e3  Il contante non chiama PayPal, e una correzione non sfora piu
4db8ee2  La spunta del contante risponde subito
aff3110  L'elenco dice quando non puo fidarsi dei contanti
6fb46f0  Il contante lo comanda il registro, non PayPal       ← il pezzo grosso
0d1d8b2  La risposta di PayPal per intero, quando rifiuta
1d3cd9a  Sapere quali fatture sono rimaste indietro
7f1a181  Una fattura che non si spedisce non ferma chi si iscrive
f3e32ad  Chi ripreme il modulo arriva a pagare                 ← inutile, non fa danno
```
