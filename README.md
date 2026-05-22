<p align="center">
  <img src="img/favicon.png" width="96" alt="Logo Rivalta sul Mincio" />
</p>

<h1 align="center">Rivalta sul Mincio</h1>

<p align="center">
  Sito ufficiale della Pro Loco di Rivalta sul Mincio (MN)<br/>
  Piattaforma di promozione turistica, notizie e community per il borgo nel cuore del Parco Regionale del Mincio
</p>

<p align="center">
  <a href="https://www.rivaltasulmincio.it"><strong>www.rivaltasulmincio.it</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versione-2.0-blue?style=flat-square" alt="versione" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-43853d?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Bootstrap%20Italia-2.x-0066CC?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap Italia" />
  <img src="https://img.shields.io/badge/Vercel-deploy-black?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/github/last-commit/albertoxpecchini/rivaltasulmincio?style=flat-square&color=green&label=ultimo%20commit" alt="Ultimo commit" />
  <img src="https://img.shields.io/github/repo-size/albertoxpecchini/rivaltasulmincio?style=flat-square&label=dimensione" alt="Dimensione repo" />
</p>

---

## Cos'è

**Rivalta sul Mincio** è la piattaforma digitale ufficiale della Pro Loco di Rivalta sul Mincio, frazione di Rodigo (MN). Non è un semplice sito vetrina: è una piattaforma completa con sistema di autenticazione, editor di contenuti con AI integrata, community, commenti, like e gestione articoli.

Il backend è interamente basato su **Supabase** (PostgreSQL + Auth + RLS). Il server è **Node.js puro**, senza framework. Il design segue il sistema **Bootstrap Italia** (la libreria UI istituzionale italiana).

---

## Funzioni principali

### Homepage pubblica
- Hero con video MP4 delle Valli del Mincio
- Carousel fotografici multi-tema (paesaggi, eventi, natura)
- Sezioni contenuto: esperienze naturalistiche, Festa del Pesce, news, contatti
- Pagina **Origini** — fotogallery storica del borgo con atlante immagini
- Schema.org JSON-LD completo (Organization, WebSite, TouristDestination, Festival)
- Open Graph e Twitter Cards per la condivisione social
- SEO: meta canonici, geo-tag, markup strutturato

### Autenticazione e sicurezza
- Accesso con email e password via Supabase Auth (JWT)
- Rate limiting client-side: blocco dopo 5 tentativi in 10 minuti (lock 15 min)
- Reset password tramite email
- Row-Level Security (RLS) su tutte le tabelle del database
- Funzioni SQL `is_admin()` e `is_member()` per il controllo degli accessi
- Trigger anti-spam sui contenuti (parole bloccate, titolo breve, troppi link)
- Security headers HTTP: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`
- Protezione path traversal lato server

### Editor articoli (Write)
L'editor è il cuore della piattaforma: un form strutturato con anteprima live e integrazione AI.

- **Campi contenuto**: titolo, sottotitolo, estratto, testo, categoria, tono, livello lettura, pubblico target
- **Campi evento**: data inizio/fine, orario, luogo, indirizzo, organizzatore, contatti, link prenotazione, prezzo
- **Campi media**: immagine di copertina con upload diretto (Supabase Storage), link Instagram, fonte
- **Campi SEO**: keywords, tag, riferimenti esterni, note interne
- **AI autofill** via Gemini Vision: carica una foto o incolla testo → i campi vengono compilati automaticamente
- Anteprima live del post con indicatore di stato (bozza / pubblicato)
- Contatore parole e tempo di lettura stimato
- Salvataggio bozza e pubblicazione separati
- Modifica post esistente (`/write?edit=<id>`)

### Dashboard utente
- KPI personali: articoli pubblicati, bozze in corso, like totali ricevuti
- Lista bozze con tasto "Riprendi" per tornare all'editor
- Lista articoli pubblicati con link di visualizzazione e modifica
- Accesso rapido al profilo e alla scrittura di un nuovo articolo

### Community — Post e commenti
- Visualizzazione articolo con immagine copertina, metadati evento e corpo del testo
- Sistema commenti con invio, moderazione automatica e policy di visibilità
- Sistema like con contatore in tempo reale
- Badge categoria colorati per tipo contenuto
- Regole di convivenza mostrate a ogni utente prima di commentare

### Profilo utente
- Profilo pubblico con avatar emoji/colore, bio e comune
- Pagina di modifica profilo (username, display_name, bio, comune)

### Pagine di servizio
- **Privacy Policy** (GDPR)
- **Cookie Policy** con gestione dei consensi
- **Note Legali**
- **Storia del sito** — cronologia dello sviluppo

---

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| **Server** | Node.js 18+ (HTTP nativo, zero framework) |
| **Frontend** | HTML5 · CSS3 · JavaScript ES2020+ vanilla |
| **UI Kit** | Bootstrap Italia 2.x |
| **Database** | PostgreSQL via Supabase |
| **Autenticazione** | Supabase Auth (JWT) |
| **Storage** | Supabase Storage (immagini copertina) |
| **AI** | Google Gemini Vision (autofill editor) |
| **Deployment** | Vercel (serverless, `server.js` come entry point) |
| **Font** | Cabinet Grotesk · Fraunces · JetBrains Mono |

---

## Pagine e route

| Pagina | Route | Descrizione |
|---|---|---|
| Homepage | `/` | Hero video, carousel, esperienze, news |
| Origini | `/origini` | Fotogallery storica del borgo |
| Categoria | `/category` | Articoli filtrati per categoria |
| Articolo | `/post` | Visualizzazione articolo con commenti e like |
| Privacy | `/privacy` | Informativa privacy GDPR |
| Cookie | `/cookie` | Gestione cookie e consensi |
| Note Legali | `/note-legali` | Termini e condizioni |
| Storia | `/storia` | Cronologia sviluppo sito |
| **Login** | `/login` | Accesso con email/password |
| **Reset** | `/reset` | Recupero password via email |
| **Dashboard** | `/dashboard` | Area personale, bozze e articoli |
| **Scrivi** | `/write` | Editor articoli con AI |
| **Profilo** | `/profile` | Profilo pubblico utente |
| **Modifica profilo** | `/modifica-profilo` | Modifica dati e avatar |
| `/me` | → `/dashboard` | Redirect permanente (308) |

---

## Avvio locale

```bash
npm install
npm run dev
# → http://localhost:2858
```

### Configurare Supabase in locale

Il progetto legge le credenziali Supabase da `supabase.config.js`. In locale puoi cambiarle senza toccare il codice:

1. Apri `/db-test`
2. Incolla **Project URL** e **Anon Key** dal tuo progetto Supabase
3. Premi **Salva e ricarica**

La configurazione viene salvata in `localStorage` (`rsm_supabase_config_v1`) e viene usata da tutte le pagine. In produzione questi override vengono ignorati.

In alternativa, passala una sola volta via URL:

```
/db-test?sbUrl=https://TUO-PROGETTO.supabase.co&sbKey=LA_TUA_ANON_KEY
```

---

## Setup database Supabase

Per un database nuovo, esegui nel **SQL Editor** di Supabase:

```
supabase-complete-setup.sql
```

Lo script crea le tabelle, gli indici, i trigger e le policy RLS:

| Tabella | Scopo |
|---|---|
| `profiles` | Dati utente, ruolo (`admin` / `user` / `reader`) |
| `posts` | Articoli con tutti i campi dell'editor |
| `categories` | Categorie contenuto |
| `comments` | Commenti ai post |
| `post_likes` | Like ai post |
| `user_settings` | Preferenze UI per utente |
| `notifications` | Notifiche community |
| `reports` | Segnalazioni contenuti |
| `site_stats` | Statistiche aggregate del sito |
| `site_releases` | Log delle versioni |

Per aggiornare un database esistente usa i file di migrazione:

| File | Scopo |
|---|---|
| `supabase-migration-write-fields.sql` | Aggiunge i campi estesi all'editor |
| `supabase-migration-newsletter.sql` | Aggiunge il modulo newsletter |
| `supabase-migration-draft-content-fix.sql` | Permette bozze senza contenuto minimo |
| `supabase-security.sql` | Riscrive le policy RLS (solo per DB esistenti) |

---

## Deployment

Il sito è deployato su **Vercel** in modalità serverless. Ogni push su `main` genera automaticamente un nuovo deployment.

`vercel.json` instrada tutte le route verso `server.js`:

```json
{ "routes": [{ "src": "/(.*)", "dest": "/server.js" }] }
```

**Variabili d'ambiente Vercel:**

| Variabile | Descrizione |
|---|---|
| `GEMINI_API_KEY` | Chiave API Google Gemini (AI autofill) |

---

## Struttura del repository

```
rivaltasulmincio/
├── index                  # Homepage
├── origini                # Fotogallery storica
├── category               # Pagina categoria
├── post                   # Singolo articolo
├── login / reset          # Autenticazione
├── dashboard              # Area utente
├── write                  # Editor articoli
├── profile                # Profilo pubblico
├── modifica-profilo       # Modifica dati utente
├── privacy / cookie / note-legali / storia
├── server.js              # HTTP server Node.js
├── security.client.js     # Rate limiting e filtri frontend
├── supabase.config.js     # Configurazione Supabase (singleton)
├── rsm-bi.css             # Override CSS Bootstrap Italia
├── supabase-complete-setup.sql
├── supabase-migration-*.sql
├── vercel.json
├── package.json
├── img/                   # Immagini statiche + atlante fotografico
├── partials/              # Navbar, footer e newsletter (HTML + JS)
├── scripts/               # Script di manutenzione (Node.js ESM)
└── vendor/                # Bootstrap Italia (bundle locale)
```

---

## Contatti

- **Sito**: [www.rivaltasulmincio.it](https://www.rivaltasulmincio.it)
- **Email**: info@prolocorivalta.mn.it
- **Telefono**: +39 339 899 5680
- **Facebook**: [prolocrivaltasulmincio](https://www.facebook.com/prolocrivaltasulmincio)
- **Instagram**: [prolocrivalta](https://www.instagram.com/prolocrivalta)
- **Indirizzo**: Via Porto, 31 — Rivalta sul Mincio, 46040 (MN)

---

<p align="center">
  <em>Pro Loco Rivalta sul Mincio · Frazione di Rodigo · Parco Regionale del Mincio</em>
</p>
