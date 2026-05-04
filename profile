<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <script>!function(){try{var p=JSON.parse(localStorage.getItem('rsm_prefs_v1'))||{},r=document.documentElement,s={sm:'14px',md:'16px',lg:'18px',xl:'20px'};if(p.theme&&p.theme!=='auto')r.dataset.theme=p.theme;if(p.fontsize)r.style.fontSize=s[p.fontsize]||'16px';if(p.uiDensity)r.dataset.density=p.uiDensity;if(p.contrast)r.style.filter='contrast(1.16)';}catch(e){}}();</script>
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profilo – Rivalta sul Mincio</title>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,650;1,9..144,550&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --ink:        #17221d;
      --ink-soft:   #31453b;
      --cream:      #f7f0e4;
      --paper:      #fffaf0;
      --mist:       #e4ddcf;
      --marsh:      #253f35;
      --marsh-2:    #3d6353;
      --water:      #2f6b67;
      --clay:       #b8663f;
      --reed:       #c6a462;
      --white:      #fffdf8;
      --line:       rgba(37, 63, 53, 0.15);
      --ok:         #2f6b67;
      --err:        #b83232;
      --radius:     14px;
      --shadow-card: 0 2px 24px rgba(37, 63, 53, 0.09), 0 0 0 1px rgba(37, 63, 53, 0.07);
      --sans:       "Cabinet Grotesk", system-ui, sans-serif;
      --serif:      "Fraunces", Georgia, serif;
      --transition: 0.22s cubic-bezier(0.32, 0.72, 0, 1);
    }

    body {
      font-family: var(--sans);
      background:
        radial-gradient(circle at 14% 8%, rgba(198, 164, 98, 0.28), transparent 28rem),
        radial-gradient(circle at 88% 2%, rgba(47, 107, 103, 0.16), transparent 34rem),
        linear-gradient(135deg, var(--cream), #efe5d2 54%, #f8f2e8);
      color: var(--ink);
      min-height: 100vh;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    body::before {
      content: '';
      position: fixed; inset: 0;
      z-index: 0; pointer-events: none;
      opacity: 0.16;
      background-image:
        radial-gradient(circle at 12% 18%, rgba(23, 34, 29, 0.11) 0 1px, transparent 1px),
        radial-gradient(circle at 77% 54%, rgba(23, 34, 29, 0.08) 0 1px, transparent 1px);
      background-size: 23px 23px, 31px 31px;
      mix-blend-mode: multiply;
    }

    a { color: var(--marsh); text-decoration: none; }
    a:hover { color: var(--water); }

    /* ── Nav Island ── */
    .site-header {
      position: fixed;
      top: 20px; left: 0; right: 0;
      z-index: 70;
      pointer-events: none;
    }

    .nav-island {
      position: relative;
      width: min(100% - 28px, 1240px);
      margin: 0 auto;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 18px;
      padding: 8px 10px 8px 12px;
      border: 1px solid rgba(255, 250, 240, 0.68);
      border-radius: 999px;
      background: rgba(247, 240, 228, 0.82);
      box-shadow: 0 18px 48px rgba(23, 34, 29, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      pointer-events: auto;
    }

    .brand {
      display: inline-flex; align-items: center; gap: 11px;
      min-width: 0; color: var(--ink); text-decoration: none;
    }

    .brand-mark {
      width: 42px; height: 42px; flex: 0 0 42px;
      border-radius: 14px; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }

    .brand-mark img {
      width: 42px; height: 42px; object-fit: cover; display: block;
    }

    .brand-name { display: grid; line-height: 1.02; letter-spacing: -0.02em; }
    .brand-name strong { font-size: 0.98rem; font-weight: 800; }
    .brand-name span { font-size: 0.72rem; color: rgba(23, 34, 29, 0.55); font-weight: 600; }

    #user-menu-wrap { display: flex; align-items: center; }

    .profile-btn {
      border: 0;
      border-radius: 999px;
      background: #253f35;
      color: #fffaf0;
      min-height: 42px;
      padding: 0 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      font-weight: 500;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
      transition: transform 420ms cubic-bezier(0.32, 0.72, 0, 1), background 420ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 420ms cubic-bezier(0.32, 0.72, 0, 1);
      cursor: pointer;
    }

    .profile-btn:hover {
      transform: translateY(-1px);
      background: #1f362e;
      box-shadow: 0 14px 30px rgba(23, 34, 29, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.20);
    }

    .profile-btn:active {
      transform: scale(0.98);
    }

    .profile-menu {
      position: relative;
    }

    .profile-avatar {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 1rem;
      line-height: 1;
    }

    .profile-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 12px);
      width: 230px;
      padding: 10px;
      border: 1px solid rgba(255, 250, 240, 0.58);
      border-radius: 24px;
      background: rgba(255, 250, 240, 0.94);
      box-shadow: 0 26px 80px rgba(37, 63, 53, 0.16);
      backdrop-filter: blur(20px);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px) scale(0.98);
      transition: opacity 360ms cubic-bezier(0.32, 0.72, 0, 1), transform 360ms cubic-bezier(0.32, 0.72, 0, 1), visibility 360ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .profile-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .profile-dropdown__section-title {
      padding: 8px 10px;
      font-size: 0.66rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(23, 34, 29, 0.5);
      font-weight: 900;
    }

    .profile-dropdown a,
    .profile-dropdown button {
      width: 100%;
      border: 0;
      background: transparent;
      color: #17221d;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 38px;
      padding: 0 10px;
      border-radius: 14px;
      font-weight: 750;
      text-align: left;
      transition: background 300ms cubic-bezier(0.32, 0.72, 0, 1), transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
      text-decoration: none;
      cursor: pointer;
    }

    .profile-dropdown a:hover,
    .profile-dropdown button:hover,
    .profile-dropdown .active {
      background: rgba(37, 63, 53, 0.08);
      transform: translateX(2px);
    }

    .profile-dropdown .danger { color: #8f3b28; }
    .profile-dropdown__sep { height: 1px; background: rgba(37, 63, 53, 0.15); margin: 8px 4px; }

    /* ── Page ── */
    .page {
      position: relative; z-index: 1;
      padding: 112px 20px 80px;
      display: flex; flex-direction: column; align-items: center; gap: 24px;
    }

    /* ── Bento grid ── */
    .bento {
      display: grid; width: 100%; max-width: 660px;
      gap: 6px; grid-template-columns: 1fr 1fr;
      grid-template-areas: "hero hero" "articles since";
    }

    /* ── Card base ── */
    .card {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow-card);
      padding: 16px 20px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }

    /* ── Hero card ── */
    .card-hero {
      grid-area: hero;
      flex-direction: row; align-items: flex-start; gap: 18px;
      padding: 22px 20px;
    }

    .card-hero::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--marsh), var(--reed), var(--water));
      border-radius: var(--radius) var(--radius) 0 0;
    }

    .avatar {
      width: 72px; height: 72px; border-radius: 16px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem; background: rgba(37,63,53,.1);
    }
    .avatar.skel { font-size: 0; }

    .hero-info { flex: 1; min-width: 0; }

    .hero-eyebrow {
      font-size: 10px; font-weight: 700; color: var(--marsh);
      text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px;
    }

    .hero-username {
      font-family: var(--serif); font-size: 22px; font-weight: 650;
      color: var(--ink); letter-spacing: -.02em; line-height: 1.1; margin-bottom: 3px;
    }

    .hero-displayname {
      font-size: 13px; color: var(--ink-soft); margin-bottom: 12px; font-weight: 500;
    }

    .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }

    .chip {
      border: 1px solid var(--line); border-radius: 999px;
      font-size: 11px; font-weight: 600; color: var(--ink-soft);
      padding: 3px 9px; background: rgba(37,63,53,.05);
    }

    .chip-admin {
      color: var(--reed); border-color: rgba(198,164,98,.4);
      background: rgba(198,164,98,.1);
    }

    .hero-bio { font-size: 13px; color: var(--ink-soft); line-height: 1.55; max-width: 320px; }

    /* ── Stat cards ── */
    .card-articles { grid-area: articles; }
    .card-since    { grid-area: since; }
    .card-articles .num { font-size: 2.4rem; color: var(--marsh); }
    .card-since .num    { font-size: 1.3rem; color: var(--water); }

    .num {
      font-family: var(--serif); font-weight: 650;
      letter-spacing: -.03em; line-height: 1; margin-bottom: 4px;
    }

    .stat-label { font-size: 12px; color: var(--ink-soft); font-weight: 500; line-height: 1.3; }

    /* ── Posts section ── */
    .posts-section { width: 100%; max-width: 900px; }

    .posts-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 10px;
    }

    .posts-header h2 {
      font-family: var(--serif); font-size: 22px; font-weight: 650;
      color: var(--ink); letter-spacing: -.02em;
    }

    .posts-count-tag { font-size: 12px; color: var(--ink-soft); font-weight: 600; }

    .grid-posts {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 8px;
    }

    /* ── Post card ── */
    .pcard {
      background: var(--paper); border-radius: var(--radius);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-card);
      overflow: hidden; transition: box-shadow .2s, transform .2s;
    }
    .pcard:hover { box-shadow: 0 14px 36px rgba(37,63,53,.14); transform: translateY(-3px); }

    .pcard-img { height: 130px; overflow: hidden; position: relative; background: rgba(37,63,53,.06); }
    .pcard-img svg { width: 100%; height: 100%; display: block; }

    .pcard-cat {
      position: absolute; top: 10px; left: 10px;
      background: rgba(255,250,240,.92); backdrop-filter: blur(4px);
      font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
      letter-spacing: .07em; text-transform: uppercase;
      border: 1px solid var(--line); color: var(--ink);
    }

    .pcard-body { padding: 14px 16px; }
    .pcard-meta { font-size: 11px; color: var(--ink-soft); margin-bottom: 6px; font-weight: 500; }

    .pcard-title {
      font-family: var(--serif); font-size: 15px; font-weight: 650;
      color: var(--ink); line-height: 1.35; margin-bottom: 8px; letter-spacing: -.01em;
    }
    .pcard-title a { color: var(--ink); transition: color .15s; }
    .pcard-title a:hover { color: var(--marsh); }

    .pcard-exc {
      font-size: 12px; color: var(--ink-soft); line-height: 1.55;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; margin-bottom: 12px;
    }

    .pcard-foot { padding-top: 10px; border-top: 1px solid var(--line); }

    .btn-read {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: var(--sans); font-size: 12px; font-weight: 700;
      color: var(--marsh); text-decoration: none; transition: gap .15s;
    }
    .btn-read:hover { gap: 8px; color: var(--water); }

    /* ── Empty ── */
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 48px 20px;
      border: 1px dashed var(--line); border-radius: var(--radius);
    }
    .empty-state span { font-size: 2.5rem; display: block; margin-bottom: 10px; }
    .empty-state p { font-size: 13px; color: var(--ink-soft); }

    /* ── Skeleton ── */
    .skel {
      background: linear-gradient(90deg, rgba(37,63,53,.06) 25%, rgba(37,63,53,.1) 50%, rgba(37,63,53,.06) 75%);
      background-size: 400% 100%; animation: shimmer 1.4s ease-in-out infinite; border-radius: 8px;
    }
    @keyframes shimmer { to { background-position: -400% 0; } }

    /* ── Responsive ── */
    @media (max-width: 560px) {
      .bento {
        grid-template-columns: 1fr;
        grid-template-areas: "hero" "articles" "since";
      }
      .card-hero { flex-direction: column; align-items: flex-start; }
      .page { padding: 100px 14px 60px; }
      .brand-name { display: none; }
    }

    /* ── Footer ── */
    .footer { color:rgba(255,250,240,.72); background:#101c18; padding:72px 0 34px; font-family:var(--sans); }
    .footer-container { width:min(100% - 44px, 1400px); margin:0 auto; }
    .footer-grid { display:grid; grid-template-columns:minmax(0,0.72fr) repeat(3,minmax(140px,0.22fr)); gap:clamp(24px,5vw,76px); align-items:start; }
    .footer h3,.footer h4 { margin:0 0 16px; color:var(--paper); letter-spacing:-0.02em; }
    .footer h3 { font-family:var(--serif); font-size:clamp(2rem,4vw,4.8rem); line-height:0.96; letter-spacing:-0.055em; }
    .footer p { max-width:540px; line-height:1.66; }
    .footer-links { list-style:none; padding:0; margin:0; display:grid; gap:10px; }
    .footer-links a { color:rgba(255,250,240,.68); font-weight:750; text-decoration:none; }
    .footer-links a:hover { color:var(--paper); }
    .footer-bottom { display:flex; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-top:64px; padding-top:24px; border-top:1px solid rgba(255,250,240,.12); font-size:0.86rem; }
    @media(max-width:760px){ .footer-grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="grad-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d8b89"/><stop offset="100%" stop-color="#0F2A30"/></linearGradient>
  <linearGradient id="grad-marsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5fb085"/><stop offset="100%" stop-color="#15433a"/></linearGradient>
  <linearGradient id="grad-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c084"/><stop offset="100%" stop-color="#c0392b"/></linearGradient>
  <linearGradient id="grad-spring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8d8a8"/><stop offset="100%" stop-color="#2d8b60"/></linearGradient>
  <linearGradient id="grad-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a2f3a"/><stop offset="100%" stop-color="#030d12"/></linearGradient>
</defs></svg>

<header class="site-header">
  <div class="nav-island">
    <a class="brand" href="/">
      <span class="brand-mark">
        <img src="/img/favicon.png" alt="Rivalta sul Mincio" />
      </span>
      <span class="brand-name">
        <strong>Rivalta sul Mincio</strong>
        <span>Parco del Mincio · Mantova</span>
      </span>
    </a>
    <div></div>
    <div id="user-menu-wrap"></div>
  </div>
</header>

<div class="page">

  <div class="bento">

    <!-- Hero: avatar + info -->
    <div class="card card-hero">
      <div class="avatar skel" id="avatar"></div>
      <div class="hero-info">
        <div class="hero-eyebrow">Profilo autore</div>
        <div class="hero-username skel" id="username" style="width:160px;height:22px;margin-bottom:5px"></div>
        <div class="hero-displayname skel" id="displayname" style="width:110px;height:13px;margin-bottom:14px"></div>
        <div class="chips" id="chips"></div>
        <div class="hero-bio" id="bio"></div>
      </div>
    </div>

    <!-- Articles count -->
    <div class="card card-articles">
      <div class="num skel" id="stat-posts" style="width:48px;height:38px"></div>
      <div class="stat-label">Articoli pubblicati</div>
    </div>

    <!-- Member since -->
    <div class="card card-since">
      <div class="num skel" id="stat-since" style="width:90px;height:24px"></div>
      <div class="stat-label">Membro da</div>
    </div>

  </div>

  <!-- Posts section -->
  <div class="posts-section">
    <div class="posts-header">
      <h2>Articoli</h2>
      <span class="posts-count-tag" id="posts-count"></span>
    </div>
    <div class="grid-posts" id="posts-grid"></div>
  </div>

</div>

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
const badgeColorByCategory = v => window.RSM_CATEGORIES ? window.RSM_CATEGORIES.badgeColor(v) : 'default';
const escapeHtml = v => String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

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

  let session = null;
  let viewer  = null;
  try {
    const {data} = await sb.auth.getSession();
    session = data?.session || null;
    if (session?.user?.id) {
      const {data: vd} = await sb.from('profiles')
        .select('username,avatar_emoji,avatar_color')
        .eq('id', session.user.id).single();
      viewer = vd;
    }
  } catch (_) {}

  /* ── Build user dropdown ── */
  (function buildUserMenu() {
    const wrap = document.getElementById('user-menu-wrap');
    if (!wrap) return;
    if (!session || !viewer) {
      wrap.innerHTML = `<a href="login" style="font-family:var(--sans);font-size:.82rem;font-weight:700;color:var(--paper);background:var(--marsh);border:none;border-radius:999px;padding:8px 18px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">🔑 Accedi</a>`;
      return;
    }
    const username      = viewer.username || 'utente';
    const emoji       = viewer.avatar_emoji || '🌿';
    const color         = viewer.avatar_color || '#253f35';
    const safe          = String(username).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const profileHref   = 'profile?u=' + encodeURIComponent(username);
    const isOwnProfile  = (viewer.username === un);
    function initials(value) {
      return String(value || 'utente').trim().slice(0, 2).toUpperCase();
    }

    function item(label, href, active, primary) {
      return '<a href="' + href + '" role="menuitem" class="' + (active ? 'active ' : '') + (primary ? 'item-primary' : '') + '"><span>' + label + '</span><span aria-hidden="true">&rarr;</span></a>';
    }

    const editItem = isOwnProfile
      ? item('Modifica profilo', 'modifica-profilo?u=' + encodeURIComponent(username), false, false)
      : '';

    wrap.innerHTML =
      '<div class="profile-menu" id="profileMenu">' +
        '<button class="profile-btn" id="profileBtn" type="button" aria-haspopup="true" aria-expanded="false">' +
          '<span class="profile-avatar" style="background:' + color + '">' + emoji + '</span>' +
          '<span>@' + safe + '</span>' +
        '</button>' +
        '<div class="profile-dropdown" id="profileDropdown" role="menu" aria-label="Menu navigazione">' +
          '<div class="profile-dropdown__section-title">Navigazione</div>' +
          item('Profilo', profileHref, true, false) +
          item('Dashboard', '/dashboard', false, false) +
          editItem +
          item('Scrivi', 'write', false, true) +
          item('Categorie', '/category', false, false) +
          item('Aspetto', 'preferenze', false, false) +
          item('Reimposta Password', 'reset', false, false) +
          '<div class="profile-dropdown__sep"></div>' +
          '<button type="button" data-action="logout" class="danger" role="menuitem"><span>Esci</span><span aria-hidden="true">&rarr;</span></button>' +
        '</div>' +
      '</div>';

    const btn = document.getElementById('profileBtn');
    const dd  = document.getElementById('profileDropdown');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    dd.querySelector('[data-action="logout"]').addEventListener('click', async () => {
      await sb.auth.signOut();
      window.location.href = '/';
    });
    dd.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      dd.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', (e) => {
      if (!document.getElementById('profileMenu')?.contains(e.target)) {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    }, { capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  const {data:prof, error:pe} = await sb.from('profiles').select('*').eq('username', un).single();
  if (pe || !prof) {
    document.querySelector('.bento').innerHTML = '<div class="card" style="grid-column:1/-1;padding:60px;text-align:center;color:var(--ink-soft)">Profilo non trovato.</div>';
    return;
  }
  document.title = `@${prof.username} – Rivalta sul Mincio`;

  /* Avatar (static) */
  const av = $('avatar');
  av.classList.remove('skel');
  av.style.background = prof.avatar_color || '#253f35';
  av.textContent = prof.avatar_emoji || '🌿';

  /* Name */
  $('username').outerHTML  = `<div class="hero-username"  id="username">@${escapeHtml(prof.username)}</div>`;
  $('displayname').outerHTML = `<div class="hero-displayname">${escapeHtml(prof.display_name || prof.username)}</div>`;

  /* Chips */
  const roleLabels = { admin:'⚙️ Admin', user:'👤 Utente', reader:'👁 Lettore' };
  const chipsHtml = [];
  if (prof.comune) chipsHtml.push(`<span class="chip">📍 ${escapeHtml(prof.comune)}</span>`);
  chipsHtml.push(`<span class="chip ${prof.role === 'admin' ? 'chip-admin' : ''}">${roleLabels[prof.role] || '👤 Utente'}</span>`);
  $('chips').innerHTML = chipsHtml.join('');
  if (prof.bio) $('bio').textContent = prof.bio;

  /* Stats */
  const {count} = await sb.from('posts').select('id', {count:'exact', head:true}).eq('user_id', prof.id).eq('published', true);
  const pe2 = $('stat-posts'); pe2.classList.remove('skel'); pe2.style = ''; pe2.textContent = count || 0;
  const se  = $('stat-since'); se.classList.remove('skel');  se.style  = ''; se.textContent  = fmtY(prof.created_at);

  /* Posts */
  const {data:posts} = await sb.from('posts')
    .select('id,title,excerpt,category,image_type,published_at')
    .eq('user_id', prof.id).eq('published', true)
    .order('published_at', {ascending: false});

  const grid = $('posts-grid');
  if (!posts || posts.length === 0) {
    grid.innerHTML = '<div class="empty-state"><span>📝</span><p>Nessun articolo pubblicato ancora.</p></div>';
    return;
  }
  $('posts-count').textContent = `${posts.length} articol${posts.length === 1 ? 'o' : 'i'}`;

  grid.innerHTML = posts.map(p => {
    const cat = canonicalCategory(p.category) || 'Territorio';
    return `<article class="pcard">
      <div class="pcard-img">
        <a class="pcard-cat" href="${categoryHref(cat)}">${escapeHtml(cat)}</a>
        ${ILL[p.image_type] || ILL.nature}
      </div>
      <div class="pcard-body">
        <div class="pcard-meta">${fmt(p.published_at)}</div>
        <div class="pcard-title"><a href="post?id=${p.id}">${escapeHtml(p.title || 'Articolo')}</a></div>
        ${p.excerpt ? `<div class="pcard-exc">${escapeHtml(p.excerpt)}</div>` : ''}
        <div class="pcard-foot"><a href="post?id=${p.id}" class="btn-read">Leggi →</a></div>
      </div>
    </article>`;
  }).join('');
})();
</script>

<footer class="footer" id="contatti">
  <div class="footer-container">
    <div class="footer-grid">
      <div>
        <h3>Pro Loco Rivalta sul Mincio</h3>
        <p>Ecoturismo, cultura locale, eventi, Sagra del Luccio e promozione ambientale nel cuore del Parco Regionale del Mincio.</p>
      </div>
      <nav aria-label="Sezioni">
        <h4>Esplora</h4>
        <ul class="footer-links">
          <li><a href="/#esperienze">Esperienze</a></li>
          <li><a href="/#galleria">Galleria</a></li>
          <li><a href="/#valli">Valli</a></li>
          <li><a href="/#news">News</a></li>
        </ul>
      </nav>
      <nav aria-label="Area utente">
        <h4>Area</h4>
        <ul class="footer-links">
          <li><a href="login">Accedi</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="write">Scrivi</a></li>
          <li><a href="profile">Profili</a></li>
        </ul>
      </nav>
      <nav aria-label="Legale e social">
        <h4>Link</h4>
        <ul class="footer-links">
          <li><a href="privacy">Privacy</a></li>
          <li><a href="cookie">Cookie</a></li>
          <li><a href="note-legali">Note legali</a></li>
          <li><a href="https://www.facebook.com/prolocoamicidirivalta/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          <li><a href="https://www.instagram.com/prolocrivalta" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="footer-year"></span> Pro Loco Rivalta sul Mincio A.P.S.</span>
      <span>Via Porto, 31 &ndash; 46040 Rivalta sul Mincio (MN)</span>
    </div>
  </div>
</footer>
<script>document.getElementById('footer-year').textContent=new Date().getFullYear();</script>
</body>
</html>
