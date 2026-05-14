<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <script>!function(){try{var p=JSON.parse(localStorage.getItem('rsm_prefs_v1'))||{},r=document.documentElement,s={sm:'14px',md:'16px',lg:'18px',xl:'20px'},t=p.theme;var ok=t==='chiaro'||t==='scuro'||t==='auto';t=ok?t:'chiaro';r.dataset.theme=t==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'scuro':'chiaro'):t;r.dataset.themePref=t;r.dataset.fontsize=p.fontsize||'md';r.style.fontSize=s[p.fontsize]||'16px';r.dataset.density=p.uiDensity||'comfortable';if(p.contrast)r.dataset.contrast='high';else delete r.dataset.contrast;}catch(e){}}();</script>
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profilo – Rivalta sul Mincio</title>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" media="print" onload="this.onload=null;this.media='all'" />
  <noscript><link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" /></noscript>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.onload=null;this.media='all'" />
  <noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" /></noscript>
  <link rel="stylesheet" href="/theme.css" />
  <style>
    /* ── Background & page shell ── */
    body[data-page="profile"] {
      position: relative;
      color: var(--rsm-text);
      overflow-x: hidden;
      background:
        radial-gradient(circle at 14% 18%, rgba(31, 191, 125, 0.16), transparent 30%),
        radial-gradient(circle at 86% 16%, rgba(74, 155, 255, 0.16), transparent 34%),
        radial-gradient(circle at 78% 76%, rgba(139, 92, 246, 0.14), transparent 36%),
        linear-gradient(180deg, var(--rsm-bg) 0%, var(--rsm-paper) 48%, var(--rsm-bg) 100%);
    }

    body[data-page="profile"]::before,
    body[data-page="profile"]::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    body[data-page="profile"]::before {
      opacity: 0.18;
      background-image:
        radial-gradient(circle at 1px 1px, rgba(11, 13, 20, 0.14) 0.6px, transparent 1.2px),
        radial-gradient(circle at 1px 1px, rgba(11, 13, 20, 0.08) 0.6px, transparent 1.2px);
      background-size: 24px 24px, 36px 36px;
      background-position: 0 0, 12px 14px;
      mix-blend-mode: multiply;
    }

    body[data-page="profile"]::after {
      opacity: 0.9;
      background:
        radial-gradient(ellipse at 22% 24%, rgba(31, 191, 125, 0.14), transparent 42%),
        radial-gradient(ellipse at 74% 20%, rgba(74, 155, 255, 0.14), transparent 44%),
        radial-gradient(ellipse at 66% 78%, rgba(139, 92, 246, 0.10), transparent 46%);
      animation: prof-aurora 26s ease-in-out infinite;
    }

    @keyframes prof-aurora {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50%       { transform: translate3d(1.5%, -1.5%, 0) scale(1.05); }
    }

    .rsm-profile-page {
      position: relative;
      z-index: 1;
    }

    /* ── Hero section ── */
    .rsm-profile-hero {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      padding: clamp(88px, 10vw, 120px) 0 clamp(40px, 5vw, 64px);
    }

    .rsm-profile-hero__inner {
      width: min(100% - 40px, 680px);
      margin: 0 auto;
    }

    /* ── Profile glass card ── */
    .rsm-profile-card {
      position: relative;
      display: grid;
      gap: var(--rsm-s-6);
      padding: clamp(24px, 3.5vw, 40px);
    }

    .rsm-profile-card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
      opacity: 0.8;
    }

    /* ── Identity row ── */
    .rsm-profile-identity {
      display: flex;
      align-items: flex-start;
      gap: var(--rsm-s-5);
    }

    .rsm-profile-avatar {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 20px;
      display: grid;
      place-items: center;
      font-size: 2.4rem;
      background: rgba(31, 191, 125, 0.10);
      box-shadow: var(--rsm-sh-md);
    }

    .rsm-profile-info {
      flex: 1;
      min-width: 0;
    }

    /* hide the kicker ::before line when inside profile card */
    .rsm-profile-card .rsm-kicker::before {
      display: none;
    }

    .rsm-profile-pulse {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: 50%;
      background: var(--rsm-emerald);
      box-shadow: 0 0 0 4px rgba(31, 191, 125, 0.18);
      animation: prof-pulse 2.8s ease-in-out infinite;
    }

    @keyframes prof-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(31, 191, 125, 0.18); }
      50%       { box-shadow: 0 0 0 8px rgba(31, 191, 125, 0.07); }
    }

    .rsm-profile-username {
      font-family: var(--rsm-font-display);
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 700;
      line-height: 0.96;
      letter-spacing: -0.04em;
      margin: var(--rsm-s-2) 0 var(--rsm-s-1);
      color: var(--rsm-text-strong);
    }

    .rsm-profile-username em {
      font-style: italic;
      background: linear-gradient(95deg, var(--rsm-emerald) 0%, var(--rsm-azure) 52%, var(--rsm-violet) 100%);
      background-size: 220% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: prof-grad 9s ease-in-out infinite alternate;
    }

    @keyframes prof-grad {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rsm-profile-displayname {
      font-size: var(--rsm-text-small);
      color: var(--rsm-text-soft);
      margin-bottom: var(--rsm-s-3);
      font-weight: 500;
    }

    .rsm-profile-bio {
      font-size: 0.9rem;
      color: var(--rsm-text);
      line-height: 1.5;
      margin-bottom: var(--rsm-s-3);
      max-width: 38ch;
    }

    .rsm-profile-chips {
      display: flex;
      gap: var(--rsm-s-2);
      flex-wrap: wrap;
    }

    .rsm-pchip {
      display: inline-flex;
      align-items: center;
      height: 26px;
      padding: 0 10px;
      border-radius: var(--rsm-r-pill);
      border: 1px solid var(--rsm-line-2);
      background: var(--rsm-glass);
      font-family: var(--rsm-font-mono);
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--rsm-text-soft);
      backdrop-filter: var(--rsm-blur-sm);
      -webkit-backdrop-filter: var(--rsm-blur-sm);
    }

    .rsm-pchip--admin {
      color: var(--rsm-emerald);
      border-color: rgba(31, 191, 125, 0.28);
      background: rgba(31, 191, 125, 0.08);
    }

    /* ── Metrics ── */
    .rsm-profile-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--rsm-s-5);
      padding-top: var(--rsm-s-5);
      border-top: 1px solid var(--rsm-line);
    }

    .rsm-profile-metric strong {
      display: block;
      font-family: var(--rsm-font-display);
      font-size: clamp(2rem, 4.5vw, 2.8rem);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--rsm-text-strong);
      margin-bottom: var(--rsm-s-1);
    }

    .rsm-profile-metric span {
      display: block;
      font-family: var(--rsm-font-mono);
      font-size: var(--rsm-text-tiny);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--rsm-text-soft);
    }

    /* ── Posts section ── */
    .rsm-profile-posts {
      padding: var(--rsm-s-12) 0 var(--rsm-s-20);
    }

    .rsm-profile-posts__inner {
      width: min(100% - 40px, 1200px);
      margin: 0 auto;
    }

    .rsm-profile-posts-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--rsm-s-4);
      margin-bottom: var(--rsm-s-6);
    }

    .rsm-profile-posts-head .rsm-h2 em {
      font-style: italic;
      font-family: var(--rsm-font-display);
      background: linear-gradient(95deg, var(--rsm-emerald) 0%, var(--rsm-azure) 52%, var(--rsm-violet) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .rsm-profile-posts-head .rsm-kicker::before { display: none; }

    .rsm-profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--rsm-s-3);
    }

    /* ── Post card ── */
    .rsm-pcard {
      position: relative;
      overflow: hidden;
      isolation: isolate;
      border-radius: var(--rsm-r-2xl);
      border: 1px solid var(--rsm-line);
      background: var(--rsm-glass-strong);
      box-shadow: var(--rsm-sh-md);
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      transition:
        transform 280ms var(--rsm-ease-spring),
        box-shadow 280ms var(--rsm-ease-out);
    }

    .rsm-pcard::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent);
      pointer-events: none;
      z-index: 1;
    }

    .rsm-pcard:hover {
      transform: translateY(-3px);
      box-shadow: var(--rsm-sh-xl);
    }

    .rsm-pcard-img {
      height: 140px;
      overflow: hidden;
      position: relative;
      display: grid;
      place-items: center;
      background: rgba(31, 191, 125, 0.05);
    }

    .rsm-pcard-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .rsm-pcard-img svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .rsm-pcard-cat {
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--rsm-glass-strong);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-family: var(--rsm-font-mono);
      font-size: 0.68rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--rsm-r-pill);
      letter-spacing: 0.07em;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.36);
      color: var(--rsm-text-strong);
      text-decoration: none;
      z-index: 1;
    }

    .rsm-pcard-body {
      padding: var(--rsm-s-4) var(--rsm-s-5);
    }

    .rsm-pcard-meta {
      font-family: var(--rsm-font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--rsm-text-soft);
      margin-bottom: var(--rsm-s-2);
    }

    .rsm-pcard-title {
      font-family: var(--rsm-font-display);
      font-size: 1rem;
      font-weight: 650;
      color: var(--rsm-text-strong);
      line-height: 1.25;
      margin-bottom: var(--rsm-s-2);
      letter-spacing: -0.02em;
    }

    .rsm-pcard-title a {
      color: inherit;
      text-decoration: none;
      transition: color 0.15s;
    }

    .rsm-pcard-title a:hover { color: var(--rsm-azure); }

    .rsm-pcard-exc {
      font-size: 0.84rem;
      color: var(--rsm-text-soft);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: var(--rsm-s-3);
    }

    .rsm-pcard-foot {
      padding-top: var(--rsm-s-3);
      border-top: 1px solid var(--rsm-line);
    }

    .rsm-pcard-read {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--rsm-font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--rsm-emerald);
      text-decoration: none;
      transition: gap 0.15s, color 0.15s;
    }

    .rsm-pcard-read:hover { gap: 8px; color: var(--rsm-azure); }

    /* ── Empty state ── */
    .rsm-profile-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--rsm-s-16) var(--rsm-s-5);
      border: 1px dashed var(--rsm-line-2);
      border-radius: var(--rsm-r-2xl);
      color: var(--rsm-text-soft);
    }

    .rsm-profile-empty span {
      font-size: 2.5rem;
      display: block;
      margin-bottom: var(--rsm-s-3);
    }

    .rsm-profile-empty p { font-size: 0.9rem; }

    /* ── Skeleton ── */
    .rsm-skel {
      background: linear-gradient(90deg,
        rgba(37, 63, 53, 0.06) 25%,
        rgba(37, 63, 53, 0.12) 50%,
        rgba(37, 63, 53, 0.06) 75%
      );
      background-size: 400% 100%;
      animation: prof-shimmer 1.4s ease-in-out infinite;
      border-radius: 8px;
    }

    @keyframes prof-shimmer { to { background-position: -400% 0; } }

    /* ── Reveal animation ── */
    [data-reveal] {
      opacity: 0;
      transform: translateY(20px);
      transition:
        opacity 0.55s var(--rsm-ease-out),
        transform 0.55s var(--rsm-ease-out);
    }

    [data-reveal].is-visible { opacity: 1; transform: none; }

    /* ── Responsive ── */
    @media (max-width: 560px) {
      .rsm-profile-identity { flex-direction: column; }
      .rsm-profile-hero { align-items: flex-start; }
    }

    /* ── Dark mode ── */
    html[data-theme="scuro"] body[data-page="profile"] {
      background:
        radial-gradient(circle at 14% 18%, rgba(31, 191, 125, 0.12), transparent 30%),
        radial-gradient(circle at 86% 16%, rgba(74, 155, 255, 0.12), transparent 34%),
        radial-gradient(circle at 78% 76%, rgba(139, 92, 246, 0.10), transparent 36%),
        linear-gradient(180deg, #090c15 0%, #0f1320 48%, #090c15 100%);
    }

    html[data-theme="scuro"] body[data-page="profile"]::before {
      opacity: 0.22;
      mix-blend-mode: screen;
    }

    html[data-theme="scuro"] .rsm-pcard-cat {
      background: rgba(10, 14, 24, 0.86);
      border-color: rgba(255,255,255,0.10);
    }

    html[data-theme="scuro"] .rsm-skel {
      background: linear-gradient(90deg,
        rgba(150, 190, 175, 0.08) 25%,
        rgba(150, 190, 175, 0.16) 50%,
        rgba(150, 190, 175, 0.08) 75%
      );
      background-size: 400% 100%;
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      body[data-page="profile"]::after,
      .rsm-profile-pulse,
      .rsm-profile-username em,
      [data-reveal] {
        animation: none !important;
        transition: none !important;
      }

      [data-reveal] { opacity: 1 !important; transform: none !important; }
    }

  </style>
</head>
<body data-page="profile">

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="grad-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d8b89"/><stop offset="100%" stop-color="#0F2A30"/></linearGradient>
  <linearGradient id="grad-marsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5fb085"/><stop offset="100%" stop-color="#15433a"/></linearGradient>
  <linearGradient id="grad-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c084"/><stop offset="100%" stop-color="#c0392b"/></linearGradient>
  <linearGradient id="grad-spring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8d8a8"/><stop offset="100%" stop-color="#2d8b60"/></linearGradient>
  <linearGradient id="grad-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a2f3a"/><stop offset="100%" stop-color="#030d12"/></linearGradient>
</defs></svg>

<!--PARTIAL:nav-->

<main class="rsm-profile-page">

  <!-- ── Hero ── -->
  <section class="rsm-profile-hero" aria-labelledby="profile-title">
    <div class="rsm-profile-hero__inner">

      <article class="rsm-profile-card rsm-card rsm-card--glass" data-reveal>

        <div class="rsm-profile-identity">
          <div class="rsm-profile-avatar rsm-skel" id="avatar" aria-hidden="true"></div>

          <div class="rsm-profile-info">
            <p class="rsm-kicker">
              <span class="rsm-profile-pulse" aria-hidden="true"></span>
              <span>Profilo autore</span>
              <span aria-hidden="true">&middot;</span>
              <span>Rivalta sul Mincio</span>
            </p>
            <h1 class="rsm-profile-username rsm-skel" id="username"
                style="width:180px;height:30px;margin:8px 0 6px"
                aria-label="Nome utente"></h1>
            <p class="rsm-profile-displayname rsm-skel" id="displayname"
               style="width:120px;height:14px;margin-bottom:12px"></p>
            <p class="rsm-profile-bio" id="bio"></p>
            <div class="rsm-profile-chips" id="chips"></div>
          </div>
        </div>

        <div class="rsm-profile-metrics" role="list" aria-label="Statistiche profilo">
          <div class="rsm-profile-metric" role="listitem">
            <strong class="rsm-skel" id="stat-posts"
                    style="width:52px;height:42px" aria-label="Articoli pubblicati"></strong>
            <span>Articoli pubblicati</span>
          </div>
          <div class="rsm-profile-metric" role="listitem">
            <strong class="rsm-skel" id="stat-since"
                    style="width:130px;height:22px" aria-label="Data iscrizione"></strong>
            <span>Membro da</span>
          </div>
        </div>

      </article>

    </div>
  </section>

  <!-- ── Posts ── -->
  <section class="rsm-profile-posts" aria-labelledby="posts-title">
    <div class="rsm-profile-posts__inner">

      <div class="rsm-profile-posts-head">
        <div>
          <p class="rsm-kicker"><span>Feed autore</span></p>
          <h2 class="rsm-h2" id="posts-title">Articoli <em>pubblicati</em></h2>
        </div>
        <span class="rsm-small" id="posts-count"></span>
      </div>

      <div class="rsm-profile-grid" id="posts-grid"></div>

    </div>
  </section>

</main>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="supabase.config.js"></script>
<script src="categories.client.js"></script>
<script>
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = id => document.getElementById(id);
const fmt  = iso => new Date(iso).toLocaleDateString('it-IT', {day:'numeric', month:'short', year:'numeric'});
const fmtY = iso => new Date(iso).toLocaleDateString('it-IT', {month:'long', year:'numeric'});
const canonicalCategory  = v => window.RSM_CATEGORIES ? window.RSM_CATEGORIES.canonical(v)   : String(v||'').trim();
const categoryHref       = v => window.RSM_CATEGORIES ? window.RSM_CATEGORIES.categoryHref(v) : ('category?name='+encodeURIComponent(canonicalCategory(v)));
const escapeHtml = v => String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const isValidHttpsUrl = v => {
  if (!v || typeof v !== 'string') return false;
  try { return new URL(v).protocol === 'https:'; } catch (_) { return false; }
};

const ILL = {
  festival:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-sunset)"/><g fill="#143B43" opacity=".85"><rect x="40" y="72" width="60" height="58"/><polygon points="32,72 70,44 108,72"/><rect x="100" y="58" width="80" height="72"/><polygon points="92,58 140,24 188,58"/><rect x="240" y="52" width="70" height="78"/><polygon points="232,52 275,18 318,52"/></g></svg>`,
  heron:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-marsh)"/><rect x="0" y="82" width="400" height="48" fill="url(#grad-water)"/><g transform="translate(180 10)"><path d="M22 64 L20 100" stroke="#0F2A30" stroke-width="2.5" stroke-linecap="round"/><path d="M5 48 Q25 34 60 46 Q80 52 90 62 Q82 72 65 70 L30 72 Q10 68 5 48Z" fill="#0F2A30"/><path d="M55 50 Q45 22 50 3" stroke="#0F2A30" stroke-width="6" stroke-linecap="round" fill="none"/><ellipse cx="52" cy="0" rx="9" ry="6" fill="#0F2A30" transform="rotate(-15 52 0)"/><path d="M58 -1 L76 -4" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round"/></g></svg>`,
  cycling:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-spring)"/><path d="M0,92 Q200,114 400,92 L400,130 L0,130Z" fill="url(#grad-water)"/><g transform="translate(170 52)"><circle cx="0" cy="20" r="13" fill="none" stroke="#0F2A30" stroke-width="2.5"/><circle cx="40" cy="20" r="13" fill="none" stroke="#0F2A30" stroke-width="2.5"/><path d="M0,20 L15,-2 L30,20 L40,20" stroke="#0F2A30" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="22" cy="-20" r="6" fill="#0F2A30"/></g></svg>`,
  village:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-deep)"/><circle cx="320" cy="26" r="18" fill="#EAF4F4" opacity=".8"/><circle cx="313" cy="22" r="16" fill="#0F2A30"/><g fill="#0F2A30"><rect x="30" y="82" width="50" height="48"/><polygon points="22,82 55,56 88,82"/><rect x="148" y="44" width="22" height="86"/><polygon points="142,44 159,22 176,44"/><rect x="170" y="92" width="50" height="38"/><polygon points="162,92 195,66 228,92"/></g></svg>`,
  reeds:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-marsh)"/><rect x="0" y="84" width="400" height="46" fill="url(#grad-water)"/><g stroke="#143B43" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M20,130 L20,60"/><path d="M50,130 L50,52"/><path d="M80,130 L80,66"/><path d="M310,130 L310,72"/><path d="M340,130 L340,56"/><path d="M370,130 L370,64"/></g><g fill="#5b3a1f"><ellipse cx="20" cy="58" rx="3" ry="8"/><ellipse cx="50" cy="50" rx="3" ry="8"/><ellipse cx="80" cy="64" rx="3" ry="8"/><ellipse cx="340" cy="54" rx="3" ry="8"/></g></svg>`,
  nature:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-water)"/><ellipse cx="100" cy="118" rx="38" ry="8" fill="#43A047"/><ellipse cx="220" cy="92" rx="45" ry="9" fill="#43A047"/><ellipse cx="360" cy="122" rx="40" ry="8" fill="#43A047"/></svg>`,
  fishing:`<svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="130" fill="url(#grad-deep)"/><g transform="translate(80 54)"><path d="M0,0 L100,0 L92,22 L8,22Z" fill="#0F2A30"/><g transform="translate(40 -38)"><circle cx="5" cy="0" r="6" fill="#0F2A30"/><path d="M-2,5 L-5,30 L0,38 L8,38 L12,30 L8,5Z" fill="#0F2A30"/><path d="M8,12 L40,-15" stroke="#5b3a1f" stroke-width="2" stroke-linecap="round"/></g></g><rect x="0" y="84" width="400" height="46" fill="url(#grad-water)"/></svg>`,
};

const un = new URLSearchParams(location.search).get('u');

(async function () {
  /* Reveal animation on scroll */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.05 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

  /* Redirect to own profile if ?u= is missing */
  if (!un) {
    try {
      const { data: { session: s } } = await sb.auth.getSession();
      if (s?.user) {
        const { data: me } = await sb.from('profiles').select('username').eq('id', s.user.id).single();
        if (me?.username) { location.replace('profile?u=' + me.username); return; }
      }
    } catch (_) {}
    location.href = 'login';
    return;
  }

  const {data:prof, error:pe} = await sb.from('profiles').select('*').eq('username', un).single();
  if (pe || !prof) {
    document.querySelector('.rsm-profile-card').innerHTML = '<p style="padding:48px;text-align:center;color:var(--rsm-text-soft)">Profilo non trovato.</p>';
    return;
  }
  document.title = `@${prof.username} – Rivalta sul Mincio`;

  /* Avatar */
  const av = $('avatar');
  av.classList.remove('rsm-skel');
  av.style.background = prof.avatar_color || '#1f3d2e';
  av.textContent = prof.avatar_emoji || '🌿';

  /* Name */
  $('username').outerHTML  = `<h1 class="rsm-profile-username" id="username">@<em>${escapeHtml(prof.username)}</em></h1>`;
  $('displayname').outerHTML = `<p class="rsm-profile-displayname" id="displayname">${escapeHtml(prof.display_name || prof.username)}</p>`;

  /* Chips */
  const roleLabels = { admin:'Admin', user:'Utente', reader:'Lettore' };
  const chipsHtml = [];
  if (prof.comune) chipsHtml.push(`<span class="rsm-pchip">${escapeHtml(prof.comune)}</span>`);
  chipsHtml.push(`<span class="rsm-pchip ${prof.role === 'admin' ? 'rsm-pchip--admin' : ''}">${roleLabels[prof.role] || 'Utente'}</span>`);
  $('chips').innerHTML = chipsHtml.join('');
  if (prof.bio) $('bio').textContent = prof.bio;

  /* Stats */
  const {count} = await sb.from('posts').select('id', {count:'exact', head:true}).eq('user_id', prof.id).eq('published', true);
  const pe2 = $('stat-posts'); pe2.classList.remove('rsm-skel'); pe2.style = ''; pe2.textContent = count || 0;
  const se  = $('stat-since'); se.classList.remove('rsm-skel');  se.style  = ''; se.textContent  = fmtY(prof.created_at);

  /* Posts */
  const {data:posts} = await sb.from('posts')
    .select('id,title,excerpt,category,image_type,image_url,published_at')
    .eq('user_id', prof.id).eq('published', true)
    .order('published_at', {ascending: false});

  const grid = $('posts-grid');
  if (!posts || posts.length === 0) {
    grid.innerHTML = '<div class="rsm-profile-empty"><p>Nessun articolo pubblicato ancora.</p></div>';
    return;
  }
  $('posts-count').textContent = `${posts.length} articol${posts.length === 1 ? 'o' : 'i'}`;

  grid.innerHTML = posts.map(p => {
    const cat = canonicalCategory(p.category) || 'Territorio';
    const banner = isValidHttpsUrl(p.image_url)
      ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title || 'Articolo')}" loading="lazy">`
      : (ILL[p.image_type] || ILL.nature);
    return `<article class="rsm-pcard">
      <div class="rsm-pcard-img">
        <a class="rsm-pcard-cat" href="${categoryHref(cat)}">${escapeHtml(cat)}</a>
        ${banner}
      </div>
      <div class="rsm-pcard-body">
        <div class="rsm-pcard-meta">${fmt(p.published_at)}</div>
        <div class="rsm-pcard-title"><a href="post?id=${p.id}">${escapeHtml(p.title || 'Articolo')}</a></div>
        ${p.excerpt ? `<div class="rsm-pcard-exc">${escapeHtml(p.excerpt)}</div>` : ''}
        <div class="rsm-pcard-foot"><a href="post?id=${p.id}" class="rsm-pcard-read">Leggi →</a></div>
      </div>
    </article>`;
  }).join('');
})();
</script>
<link rel="stylesheet" href="/partials/footbar.css?v=12" />
<style data-rsm-foot-critical>
  .rsm-foot {
    --rsm-foot-bg-1: #051c2c;
    --rsm-foot-bg-2: #082649;
    --rsm-foot-bg-3: #2a1147;
    --rsm-foot-ink: var(--rsm-text-on-dark, #f9fbff);
    --rsm-foot-ink-soft: var(--rsm-text-on-dark-soft, rgba(222, 236, 255, 0.78));
    --rsm-foot-ink-mid: var(--rsm-text-on-dark-dim, rgba(194, 216, 245, 0.58));
    --rsm-foot-line: rgba(160, 208, 255, 0.16);
    --rsm-foot-line-strong: rgba(180, 218, 255, 0.34);
    margin-top: 0 !important;
    color: var(--rsm-foot-ink-soft) !important;
    background:
      radial-gradient(ellipse at 14% -10%, rgba(102, 255, 214, 0.18), transparent 38%),
      radial-gradient(ellipse at 80% -8%, rgba(126, 188, 255, 0.22), transparent 42%),
      radial-gradient(ellipse at 100% 100%, rgba(196, 122, 255, 0.20), transparent 48%),
      linear-gradient(160deg, #051c2c 0%, #082649 50%, #2a1147 100%) !important;
    border-top: 1px solid var(--rsm-foot-line-strong) !important;
  }
</style>
<footer class="rsm-foot" role="contentinfo" data-component="section/footer" data-rsm-foot>
  <div class="rsm-foot__aurora" aria-hidden="true">
    <span class="rsm-foot__blob rsm-foot__blob--a"></span>
    <span class="rsm-foot__blob rsm-foot__blob--b"></span>
    <span class="rsm-foot__blob rsm-foot__blob--c"></span>
  </div>
  <div class="rsm-foot__grain" aria-hidden="true"></div>
  <div class="rsm-foot__hairline" aria-hidden="true"></div>

  <div class="rsm-foot__container">

    <!-- ───── HERO STRIP ───── -->
    <section class="rsm-foot__hero" data-rsm-reveal>
      <div class="rsm-foot__hero-left">
        <p class="rsm-foot__eyebrow">
          <span class="rsm-foot__eyebrow-dot" aria-hidden="true"></span>
          <span>Pro Loco</span>
          <span class="rsm-foot__eyebrow-sep" aria-hidden="true">·</span>
          <span>Parco del Mincio</span>
          <span class="rsm-foot__eyebrow-sep" aria-hidden="true">·</span>
          <span>Mantova</span>
        </p>
        <h2 class="rsm-foot__display">
          <span class="rsm-foot__display-line">Ecoturismo,</span>
          <span class="rsm-foot__display-line">cultura,</span>
          <span class="rsm-foot__display-line"><em class="rsm-foot__display-em">tradizioni d&rsquo;acqua</em>.</span>
        </h2>
        <p class="rsm-foot__lead">
          Promozione turistica, culturale e ambientale del borgo di Rivalta sul Mincio,
          nel cuore del Parco Regionale del Mincio.
        </p>
      </div>

      <form class="rsm-foot__news" aria-label="Iscrizione newsletter" onsubmit="event.preventDefault();this.classList.add('is-sent');">
        <p class="rsm-foot__news-kicker">
          <span class="rsm-foot__news-num">01</span>
          <span>Newsletter</span>
        </p>
        <h3 class="rsm-foot__news-title">Resta sulle <em>rive</em>.</h3>
        <p class="rsm-foot__news-copy">Eventi, sagre e novità dal Mincio. Niente spam, una mail al mese.</p>
        <div class="rsm-foot__news-row">
          <button class="rsm-btn rsm-btn--ghost magnetic rsm-foot__news-cta" type="button" data-modal-open="newsletter-modal" aria-label="Iscriviti alla newsletter">
            <span>Iscriviti alla newsletter</span>
            <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
          </button>
          <span class="rsm-foot__news-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3"/>
              <path d="M3.5 7.5l8.5 6 8.5-6"/>
            </svg>
          </span>
          <input class="rsm-foot__news-input" type="email" required placeholder="la-tua-email@dominio.it" aria-label="Email" autocomplete="email" />
          <button class="rsm-foot__news-btn" type="submit" aria-label="Iscriviti alla newsletter">
            <span class="rsm-foot__news-btn-text">Iscriviti</span>
            <span class="rsm-foot__news-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
        </div>
        <p class="rsm-foot__news-ok" aria-live="polite">Grazie · ci sentiamo presto.</p>
      </form>
    </section>

    <!-- ───── MARQUEE BAND ───── -->
    <div class="rsm-foot__band" aria-hidden="true">
      <div class="rsm-foot__band-track">
        <span class="rsm-foot__band-group">
          <span class="rsm-foot__band-item">Festa del Pesce</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Valli del Mincio</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Sagra del Luccio</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Ecoturismo</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Borgo storico</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Parco Regionale</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Cucina d&rsquo;acqua dolce</span><span class="rsm-foot__band-dot"></span>
        </span>
        <span class="rsm-foot__band-group" aria-hidden="true">
          <span class="rsm-foot__band-item">Festa del Pesce</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Valli del Mincio</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Sagra del Luccio</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Ecoturismo</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Borgo storico</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Parco Regionale</span><span class="rsm-foot__band-dot"></span>
          <span class="rsm-foot__band-item">Cucina d&rsquo;acqua dolce</span><span class="rsm-foot__band-dot"></span>
        </span>
      </div>
    </div>

    <!-- ───── MAIN GRID ───── -->
    <section class="rsm-foot__main" data-rsm-reveal>

      <div class="rsm-foot__brand">
        <a class="rsm-foot__lockup" href="/" aria-label="Home Pro Loco Rivalta sul Mincio">
          <span class="rsm-foot__logo">
            <img src="/img/favicon.png" alt="" width="56" height="56" />
          </span>
          <span class="rsm-foot__lockup-text">
            <strong>Rivalta</strong>
            <em>Sul Mincio · A.P.S.</em>
          </span>
        </a>

        <ul class="rsm-foot__contacts">
          <li>
            <a class="rsm-foot__contact" href="mailto:info@prolocorivalta.mn.it">
              <span class="rsm-foot__contact-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="3"/>
                  <path d="M3.5 7.5l8.5 6 8.5-6"/>
                </svg>
              </span>
              <span class="rsm-foot__contact-body">
                <span class="rsm-foot__contact-key">Email</span>
                <span class="rsm-foot__contact-val">info@prolocorivalta.mn.it</span>
              </span>
              <span class="rsm-foot__contact-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a class="rsm-foot__contact" href="tel:+393398995680">
              <span class="rsm-foot__contact-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>
                </svg>
              </span>
              <span class="rsm-foot__contact-body">
                <span class="rsm-foot__contact-key">Telefono</span>
                <span class="rsm-foot__contact-val">+39 339 899 5680</span>
              </span>
              <span class="rsm-foot__contact-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <div class="rsm-foot__contact rsm-foot__contact--static">
              <span class="rsm-foot__contact-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s7-7.6 7-13a7 7 0 0 0-14 0c0 5.4 7 13 7 13z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </span>
              <span class="rsm-foot__contact-body">
                <span class="rsm-foot__contact-key">Sede</span>
                <span class="rsm-foot__contact-val">Via Porto, 31 &mdash; 46040 Rivalta sul Mincio (MN)</span>
              </span>
            </div>
          </li>
        </ul>

        <div class="rsm-foot__socials" aria-label="Social">
          <a class="rsm-foot__social" href="https://www.facebook.com/prolocoamicidirivalta/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3z"/>
            </svg>
            <span class="rsm-foot__social-tip">Facebook</span>
          </a>
          <a class="rsm-foot__social" href="https://www.instagram.com/prolocrivalta" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>
            </svg>
            <span class="rsm-foot__social-tip">Instagram</span>
          </a>
          <a class="rsm-foot__social" href="mailto:info@prolocorivalta.mn.it" aria-label="Scrivici una email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3"/>
              <path d="M3.5 7.5l8.5 6 8.5-6"/>
            </svg>
            <span class="rsm-foot__social-tip">Email</span>
          </a>
        </div>
      </div>

      <nav class="rsm-foot__col" aria-label="Esplora">
        <p class="rsm-foot__col-head">
          <span class="rsm-foot__col-num">01</span>
          <span class="rsm-foot__col-title">Esplora</span>
        </p>
        <ul class="rsm-foot__links">
          <li><a href="/"><span>Home</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/#festa"><span>Festa del Pesce</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/#eventi"><span>Eventi</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/#galleria"><span>Galleria</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/#territorio"><span>Territorio</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/storia"><span>Storia del sito</span><i aria-hidden="true">↗</i></a></li>
        </ul>
      </nav>

      <nav class="rsm-foot__col" aria-label="Area utente">
        <p class="rsm-foot__col-head">
          <span class="rsm-foot__col-num">02</span>
          <span class="rsm-foot__col-title">Area</span>
        </p>
        <ul class="rsm-foot__links">
          <li><a href="/login"><span>Accedi</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/dashboard"><span>Dashboard</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/write"><span>Scrivi un post</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/profile"><span>Profilo</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/preferenze"><span>Preferenze</span><i aria-hidden="true">↗</i></a></li>
        </ul>
      </nav>

      <nav class="rsm-foot__col" aria-label="Legale">
        <p class="rsm-foot__col-head">
          <span class="rsm-foot__col-num">03</span>
          <span class="rsm-foot__col-title">Legale</span>
        </p>
        <ul class="rsm-foot__links">
          <li><a href="/privacy"><span>Privacy</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/cookie"><span>Cookie</span><i aria-hidden="true">↗</i></a></li>
          <li><a href="/note-legali"><span>Note legali</span><i aria-hidden="true">↗</i></a></li>
        </ul>
      </nav>
    </section>

    <!-- ───── BOTTOM BAR ───── -->
    <section class="rsm-foot__bottom" data-rsm-reveal>
      <span class="rsm-foot__copy">
        &copy; <span data-rsm-year>2026</span>
        <span class="rsm-foot__copy-sep" aria-hidden="true">·</span>
        Pro Loco Rivalta sul Mincio A.P.S.
      </span>
      <span class="rsm-foot__credit">
        <span>
          Creato con cura da
          <span class="rsm-foot__author">Alberto Pecchini</span>
          per la comunità rivaltese
        </span>
        <span class="rsm-foot__copy-sep" aria-hidden="true">·</span>
        <span class="rsm-foot__author-soon">sito autore in arrivo</span>
      </span>
      <button class="rsm-foot__top" type="button" data-rsm-top aria-label="Torna in cima">
        <span class="rsm-foot__top-text">In cima</span>
        <span class="rsm-foot__top-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </span>
      </button>
    </section>
  </div>
</footer>
<script>
(function(){
  var root = document.querySelector('[data-rsm-foot]');
  if (!root) return;

  var y = root.querySelector('[data-rsm-year]');
  if (y) y.textContent = new Date().getFullYear();

  var top = root.querySelector('[data-rsm-top]');
  if (top) top.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    root.querySelectorAll('[data-rsm-reveal]').forEach(function(n){ io.observe(n); });
  } else {
    root.querySelectorAll('[data-rsm-reveal]').forEach(function(n){ n.classList.add('is-in'); });
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    var aurora = root.querySelector('.rsm-foot__aurora');
    if (aurora) {
      var rect = null, raf = 0, x = 0.5, y2 = 0.5;
      var onMove = function(ev){
        if (!rect) rect = root.getBoundingClientRect();
        x = (ev.clientX - rect.left) / rect.width;
        y2 = (ev.clientY - rect.top) / rect.height;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      var apply = function(){
        raf = 0;
        aurora.style.setProperty('--mx', (x * 100).toFixed(2) + '%');
        aurora.style.setProperty('--my', (y2 * 100).toFixed(2) + '%');
      };
      var onLeave = function(){ rect = null; aurora.style.removeProperty('--mx'); aurora.style.removeProperty('--my'); };
      var onResize = function(){ rect = null; };
      root.addEventListener('mousemove', onMove, { passive: true });
      root.addEventListener('mouseleave', onLeave);
      window.addEventListener('resize', onResize);
    }
  }
})();
</script>
</body>
</html>
