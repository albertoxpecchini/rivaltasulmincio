# Rivalta sul Mincio — Sito Ufficiale Pro Loco

Sito ufficiale della **Pro Loco di Rivalta sul Mincio**, frazione di Rodigo (MN).  
Promozione turistica, culturale e ambientale del borgo nel cuore del **Parco Regionale del Mincio**.

🌐 **[www.rivaltasulmincio.it](https://www.rivaltasulmincio.it)**  
📍 Via Porto, 31 — Rivalta sul Mincio, 46040 MN  
📞 +39 339 899 5680 · ✉️ info@prolocorivalta.mn.it

---

## La storia del sito

### Fase 1 — Ideazione e costruzione (aprile 2026)

Il progetto nasce dall'esigenza della Pro Loco di avere una presenza online moderna, accessibile e rappresentativa del borgo e delle sue tradizioni. Niente template, niente WordPress: il sito viene costruito da zero, con HTML puro, CSS custom e JavaScript vanilla, per avere controllo totale su ogni pixel e ogni millisecondo di caricamento.

Il focus iniziale è la **homepage**: un'esperienza visiva immersiva con video delle Valli del Mincio, carousel fotografici, sezioni dedicate all'ecoturismo, alla Festa del Pesce (40ª edizione 2025 — in corso dal 1985) e ai percorsi naturalistici.

### Fase 2 — Sistema di autenticazione e community (aprile–maggio 2026)

Viene integrato **Supabase** come backend: database PostgreSQL, autenticazione JWT, Row-Level Security. Nascono le pagine per la community: login, dashboard utente, editor di post, profilo pubblico, modifica profilo. Il sito diventa una piattaforma, non solo un depliant digitale.

### Fase 3 — Sicurezza, accessibilità e rifinitura (maggio 2026)

Viene scritto `security.client.js`: rate limiting client-side (5 tentativi / 10 min, blocco 15 min), filtro contenuti inappropriati in italiano, gestione localStorage con fallback in memoria. Le pagine legali (privacy, cookie, note legali) vengono redatte e rese disponibili. Il sistema di preferenze utente introduce supporto per tema chiaro/scuro, 4 dimensioni di testo, densità UI e modalità alto contrasto.

### Versione 1.0 — Prima release ufficiale

| Campo | Valore |
|---|---|
| **Data commit** | Lunedì 4 maggio 2026, ore 22:11:56 (CEST +0200) |
| **Hash** | `ab399aa7927720ae882630460e11079a57d82902` |
| **Autore** | Alberto Pecchini |
| **Versione** | `04052026` |
| **File committati** | 45 file |
| **Righe di codice** | 16.630 righe |
| **Deployment** | 125 deployment su Vercel |

---

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| **Server** | Node.js (HTTP nativo, nessun framework) |
| **Frontend** | HTML5 + CSS3 + JavaScript ES5/ES6+ vanilla |
| **Database** | PostgreSQL via Supabase |
| **Autenticazione** | Supabase Auth (JWT) |
| **Animazioni** | Anime.js v4.4.1 |
| **Carousel** | Swiper.js v12.1.4 |
| **Deployment** | Vercel (serverless) |
| **Font** | Cabinet Grotesk (sans) + Fraunces (serif) |

---

## Pagine e funzioni

### Pagine pubbliche

| Pagina | Route | Righe | Descrizione |
|---|---|---|---|
| Homepage | `/` | 3.641 | Hero video, carousel, esperienze, galleria, Festa del Pesce, news, contatti |
| Categoria | `/category` | 448 | Browsing per categoria degli articoli |
| Singolo post | `/post` | 1.158 | Visualizzazione articolo con commenti |
| Privacy Policy | `/privacy` | 676 | Informativa privacy GDPR |
| Cookie Policy | `/cookie` | 644 | Gestione cookie e consensi |
| Note Legali | `/note-legali` | 582 | Termini e condizioni d'uso |
| Storia | `/storia` | — | Cronologia e funzioni del sito |

### Area autenticata

| Pagina | Route | Righe | Descrizione |
|---|---|---|---|
| Login | `/login` | 1.725 | Accesso con email/password, rate limiting |
| Reset password | `/reset` | 576 | Recupero credenziali via email |
| Dashboard | `/dashboard` | 2.134 | Area personale, gestione contenuti |
| Scrivi | `/write` | 1.224 | Editor post con upload immagini |
| Profilo | `/profile` | 711 | Profilo pubblico utente |
| Modifica profilo | `/modifica-profilo` | 616 | Modifica dati anagrafici e bio |
| Preferenze | `/preferenze` | 873 | Tema, font, densità, contrasto, notifiche |

### Utility

| Pagina | Route | Righe | Descrizione |
|---|---|---|---|
| Test database | `/db-test` | 549 | Diagnostica connessione Supabase |

---

## Funzioni principali

### Homepage
- Hero con video MP4 (fallback GIF) delle Valli del Mincio
- Carousel immagini con Swiper.js (4 foto hero, 5 foto galleria, 4 foto valli)
- Sezione esperienze: "Dal livello dell'acqua", "La valle a pedali", "Aironi"
- Sezione Festa del Pesce (40ª edizione luglio 2025, tradizione dal 1985)
- News dinamiche
- Sezione contatti
- Markup Schema.org: Organization, WebSite, TouristDestination, Festival
- Open Graph + Twitter Cards per condivisione social
- Coordinate geografiche: 45.181°N, 10.665°E

### Autenticazione e sicurezza
- Login con Supabase Auth (email + password)
- Token JWT, sessioni persistenti
- Rate limiting: blocco dopo 5 tentativi in 10 minuti (lock 15 minuti)
- Filtro parole inappropriate in italiano (11 termini)
- Row-Level Security (RLS) su tutte le tabelle sensibili
- Funzioni SQL `is_admin()` e `is_member()` per autorizzazione
- Security headers HTTP: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`
- Path traversal protection lato server
- Redirect permanente (308) per URL legacy con `.html`

### Preferenze utente
- **Tema**: chiaro / scuro / auto (segue sistema)
- **Dimensione testo**: sm (14px) / md (16px) / lg (18px) / xl (20px)
- **Densità UI**: compatta / normale / spaziosa
- **Alto contrasto**: attributo `data-contrast="high"` con palette e focus rinforzati
- **Privacy commenti**: pubblica / solo membri / disabilitata
- **Notifiche**: mai / settimanale / immediata
- Persistenza via `localStorage` con chiave `rsm_prefs_v1`
- Applicazione immediata senza refresh (script inline `<head>`)

### SEO
- Tag canonici, meta description, meta keywords
- Schema.org JSON-LD completo
- Meta geo (`geo.region`, `geo.position`, `ICBM`)
- `robots: index, follow, max-image-preview:large`

### Performance
- Asset statici cachati 24h (`max-age=86400`) in produzione
- Pagine HTML servite con `no-store` (sempre fresche)
- Font preconnect per ridurre latenza
- Video con doppio formato MP4+GIF per compatibilità massima

### Routing server
- Clean URL senza estensione `.html` (308 redirect automatico)
- `/index` → `/` (308)
- `/me` → `/dashboard` (308)
- Protezione path traversal
- 403 su tentativi di accesso fuori root
- 404 personalizzato

---

## Struttura repository

```
rivaltasulmincio/
├── index               # Homepage (3.641 righe)
├── login               # Autenticazione
├── dashboard           # Area utente
├── write               # Editor post
├── post                # Singolo articolo
├── preferenze          # Impostazioni utente
├── profile             # Profilo pubblico
├── modifica-profilo    # Modifica dati
├── category            # Pagina categoria
├── reset               # Reset password
├── privacy             # Privacy Policy
├── cookie              # Cookie Policy
├── note-legali         # Note Legali
├── storia              # Storia del sito
├── db-test             # Test database
├── server.js           # HTTP server Node.js
├── security.client.js  # Sicurezza frontend
├── supabase.config.js  # Configurazione Supabase
├── supabase-complete-setup.sql  # Setup database completo (schema + RLS)
├── supabase-security.sql  # Layer sicurezza/RLS per database gia esistenti
├── vercel.json         # Configurazione deployment Vercel
├── package.json        # Dipendenze
├── img/                # Immagini (12 file)
└── video/              # Video (9 file MP4+GIF)
```

---

## Avvio locale

```bash
npm install
npm run dev
# → http://localhost:2858
```

### Collegamento rapido a Supabase

Il progetto legge Supabase da `supabase.config.js`, ma ora puoi cambiarlo senza modificare il codice solo in ambiente locale (`localhost` / `127.0.0.1`):

1. Apri `/db-test`
2. Incolla `Project URL` e `Anon Key`
3. Premi `Salva e ricarica`

La configurazione viene salvata nel browser in `localStorage` con chiave `rsm_supabase_config_v1` e viene riusata da tutte le pagine (`/login`, `/dashboard`, `/write`, `/post`, `/profile`, `/category`, `/`). Fuori dall'ambiente locale questi override vengono ignorati.

In alternativa puoi passare una configurazione una sola volta via URL:

```text
/db-test?sbUrl=https://TUO-PROGETTO.supabase.co&sbKey=LA_TUA_ANON_KEY
```

Dopo il primo caricamento il sito salva automaticamente questi valori e rimuove i parametri dalla barra indirizzi.

### Bootstrap database Supabase

Per un database nuovo esegui in Supabase SQL Editor:

1. `supabase-complete-setup.sql`

Lo script crea e collega tra loro:

- `profiles` e `posts`
- `categories`, `user_settings`, `comments`, `reports`
- `post_likes`, `notifications`, `site_stats`, `site_releases`
- trigger `updated_at`, filtri anti-spam e policy RLS

`supabase-migration-add-import-columns.sql` resta utile solo per aggiornare un database vecchio: in un setup nuovo le colonne import (`image_url`, `source_url`, `event_date`) sono gia incluse nello script completo.

---

## Deployment

Il sito è deployato su **Vercel** in modalità serverless. Ogni push su `main` genera un nuovo deployment automatico.

```
125 deployment completati al 4 maggio 2026
```

Configurazione in `vercel.json`: tutte le route vengono gestite da `server.js` (`"src": "/(.*)", "dest": "/server.js"`).

---

## Identità visiva

| Token | Valore | Uso |
|---|---|---|
| `--marsh` | `#253f35` | Verde palude — colore primario |
| `--water` | `#2f6b67` | Verde acqua — interazioni |
| `--clay` | `#b8663f` | Terracotta — accenti |
| `--reed` | `#c6a462` | Sabbia/canna — dettagli |
| `--cream` | `#f7f0e4` | Crema — sfondi |
| `--ink` | `#17221d` | Verde scuro — testo |

---

## Contatti e social

- **Sito**: [www.rivaltasulmincio.it](https://www.rivaltasulmincio.it)
- **Email**: info@prolocorivalta.mn.it
- **Telefono**: +39 339 899 5680
- **Facebook**: [prolocrivaltasulmincio](https://www.facebook.com/prolocrivaltasulmincio)
- **Instagram**: [prolocrivalta](https://www.instagram.com/prolocrivalta)
- **Indirizzo**: Via Porto, 31 — Rivalta sul Mincio, 46040 (MN)

---

*Pro Loco Rivalta sul Mincio · Frazione di Rodigo · Parco Regionale del Mincio*
