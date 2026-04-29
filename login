<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accedi | Rivalta sul Mincio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: #1F6F8B;
      --primary-dark: #174E63;
      --primary-soft: rgba(31,111,139,0.12);
      --accent: #34d399;
      --bg: #000;
      --surface: #1a1a1a;
      --surface-2: #222;
      --text: #f5f5f7;
      --text-muted: #6e6e73;
      --text-dim: #3a3a3c;
      --border: rgba(255,255,255,0.09);
      --border-focus: rgba(31,111,139,0.6);
      --ok: #34d399;
      --err: #ff6b6b;
      --warn: #F59E0B;
      --radius: 14px;
      --radius-sm: 10px;
      --shadow: 0 1px 12px rgba(0,0,0,0.5);
      --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
    }

    html, body { min-height: 100%; }

    body {
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      position: relative;
    }

    /* Crosshatch texture */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-conic-gradient(rgba(255,255,255,0.018) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px;
      pointer-events: none;
      z-index: 0;
    }

    a { color: var(--primary); text-decoration: none; }
    a:hover { color: var(--accent); }

    .container { width: min(1180px, 100% - 36px); margin-inline: auto; position: relative; z-index: 1; }

    /* ===== HEADER ===== */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 60;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      transition: box-shadow var(--transition);
    }

    .site-header.scrolled { box-shadow: 0 8px 24px rgba(0,0,0,0.6); }

    .header-inner {
      min-height: 62px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      padding-block: 10px;
    }

    .site-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      border: 1px solid rgba(31,111,139,0.38);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(31,111,139,0.5), rgba(46,125,50,0.42));
      font-size: 1rem;
    }

    .brand-copy { line-height: 1.1; }

    .brand-title {
      font-family: 'Sora', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: #f5f5f7;
      letter-spacing: -0.015em;
    }

    .brand-sub {
      font-size: 0.68rem;
      color: rgba(245,245,247,0.36);
      font-style: italic;
      margin-top: 1px;
    }

    .header-nav {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .header-nav a {
      color: rgba(245,245,247,0.6);
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 8px;
      padding: 6px 10px;
      transition: background var(--transition), color var(--transition);
    }

    .header-nav a:hover { color: #fff; background: rgba(255,255,255,0.09); }
    .header-nav a.active { color: #fff; background: rgba(255,255,255,0.11); }

    /* ===== PAGE LAYOUT ===== */
    .page { padding-block: 32px 60px; }

    .auth-layout {
      display: grid;
      grid-template-columns: 1fr minmax(340px, 420px);
      gap: 18px;
      align-items: start;
    }

    /* ===== BENTO PANEL (left) ===== */
    .bento-panel {
      position: sticky;
      top: 82px;
    }

    .bento-grid {
      display: grid;
      gap: 6px;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto auto auto;
      grid-template-areas:
        "hero      hero"
        "posts     members"
        "likes     comuni"
        "cats      highlight"
        "quote     quote";
    }

    .bcard {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .bnum {
      font-family: 'Sora', sans-serif;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 4px;
    }

    .blabel {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      line-height: 1.3;
    }

    /* Hero bento card */
    .bcard-hero {
      grid-area: hero;
      padding: 16px 18px 14px;
    }

    .bcard-hero::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1F6F8B, #34d399, #1F6F8B);
      border-radius: var(--radius) var(--radius) 0 0;
    }

    .hero-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .logo-mark {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(31,111,139,0.38);
      background: linear-gradient(135deg, rgba(31,111,139,0.5), rgba(46,125,50,0.42));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .logo-copy { line-height: 1.15; }

    .logo-name {
      font-family: 'Sora', sans-serif;
      font-size: 0.98rem;
      font-weight: 700;
      color: #f5f5f7;
      letter-spacing: -0.015em;
    }

    .logo-sub {
      font-size: 0.66rem;
      color: rgba(245,245,247,0.36);
      font-style: italic;
      margin-top: 2px;
    }

    .hero-eyebrow {
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 7px;
    }

    .hero-tagline {
      font-family: 'Sora', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #f5f5f7;
      letter-spacing: -0.03em;
      line-height: 1.08;
    }

    .hero-tagline-muted {
      font-family: 'Sora', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: -0.03em;
      line-height: 1.08;
    }

    .hero-date {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-dim);
      margin-top: 10px;
    }

    /* Stat bento cards */
    .bcard-posts     { grid-area: posts; }
    .bcard-members   { grid-area: members; }
    .bcard-likes     { grid-area: likes; }
    .bcard-comuni    { grid-area: comuni; }
    .bcard-cats      { grid-area: cats; }

    /* Highlight bento card */
    .bcard-highlight {
      grid-area: highlight;
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(150deg, #0F2A30 0%, #1F6F8B 55%, #34d399 100%);
      padding: 14px 10px;
    }

    .bcard-highlight .bnum { font-size: 18px; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; }
    .bcard-highlight .blabel { font-size: 11px; color: rgba(255,255,255,0.82); font-weight: 600; }
    .bcard-highlight .bsub { font-size: 10px; color: rgba(255,255,255,0.42); margin-top: 4px; }

    /* Quote bento card */
    .bcard-quote {
      grid-area: quote;
      background: var(--surface);
      border: 1px solid rgba(52,211,153,0.18);
      padding: 18px 22px;
      justify-content: center;
    }

    .bcard-quote::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #1F6F8B, #34d399);
      border-radius: var(--radius) 0 0 var(--radius);
    }

    .quote-text {
      font-family: 'Sora', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #f5f5f7;
      letter-spacing: -0.01em;
      line-height: 1.35;
    }

    .quote-text em { color: #34d399; font-style: normal; }

    /* ===== AUTH PANEL (right) ===== */
    .auth-panel { min-width: 0; }

    .auth-card {
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--surface);
      box-shadow: var(--shadow);
      padding: 24px;
    }

    .view { display: none; animation: fadeIn 0.24s var(--transition); }
    .view.is-active { display: block; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: none; }
    }

    .view-head { margin-bottom: 18px; }

    .view-step {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 5px;
    }

    .view-head h2 {
      font-family: 'Sora', sans-serif;
      font-size: 1.65rem;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 7px;
      letter-spacing: -0.025em;
      color: #f5f5f7;
    }

    .view-head p {
      font-size: 0.86rem;
      color: var(--text-muted);
    }

    .link-btn {
      appearance: none;
      border: none;
      background: none;
      font: inherit;
      font-size: 0.86rem;
      color: var(--accent);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .link-btn:hover { color: #6ee7b7; }

    .msg-slot { min-height: 6px; margin-bottom: 10px; }

    .notice {
      border-radius: 9px;
      border: 1px solid transparent;
      padding: 9px 11px;
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .notice.info    { background: rgba(31,111,139,0.14); border-color: rgba(31,111,139,0.3); color: #7ecde6; }
    .notice.success { background: rgba(52,211,153,0.12); border-color: rgba(52,211,153,0.28); color: #6ee7b7; }
    .notice.error   { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.28); color: #fca5a5; }

    form { display: grid; gap: 12px; }

    .field { display: grid; gap: 5px; }

    .field > span,
    .group-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--text-muted);
      font-weight: 700;
    }

    .field input,
    .field textarea,
    .field select {
      width: 100%;
      border-radius: 9px;
      border: 1.5px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: #f5f5f7;
      font-size: 0.88rem;
      font-family: inherit;
      padding: 10px 12px;
      transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
      -webkit-appearance: none;
    }

    .field select option { background: #1a1a1a; color: #f5f5f7; }

    .field textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    .field input::placeholder,
    .field textarea::placeholder { color: rgba(245,245,247,0.22); }

    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(31,111,139,0.18);
      background: rgba(31,111,139,0.07);
    }

    .field small { color: var(--text-muted); font-size: 0.73rem; }

    .row-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .input-with-action { position: relative; }
    .input-with-action input { padding-right: 84px; }

    .input-action {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: rgba(31,111,139,0.15);
      color: #7ecde6;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: 7px;
      padding: 5px 7px;
      cursor: pointer;
      font-family: inherit;
    }

    .input-action:hover { background: rgba(31,111,139,0.28); }

    .btn {
      appearance: none;
      border: none;
      border-radius: 10px;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 11px 14px;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition), background var(--transition), opacity var(--transition);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-primary {
      background: linear-gradient(135deg, #1F6F8B, #2E7D8A 54%, #2E7D32);
      color: #fff;
      box-shadow: 0 6px 18px rgba(31,111,139,0.32);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(31,111,139,0.42);
    }

    .btn-ghost {
      background: rgba(255,255,255,0.05);
      color: rgba(245,245,247,0.7);
      border: 1.5px solid rgba(255,255,255,0.1);
    }

    .btn-ghost:hover:not(:disabled) {
      border-color: rgba(31,111,139,0.4);
      background: rgba(31,111,139,0.1);
      color: #f5f5f7;
    }

    .btn-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .btn-row .btn { flex: 1 1 0; }

    .steps {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }

    .steps span {
      width: 14px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.1);
      display: inline-block;
      transition: width var(--transition), background var(--transition);
    }

    .steps span.active { width: 28px; background: var(--primary); }

    .email-pill {
      border-radius: 999px;
      border: 1px solid rgba(31,111,139,0.3);
      background: rgba(31,111,139,0.1);
      color: #7ecde6;
      padding: 5px 10px;
      font-size: 0.75rem;
      margin-bottom: 11px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .identity-preview {
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      padding: 11px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .preview-avatar {
      width: 44px;
      height: 44px;
      border-radius: 11px;
      background: var(--primary);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(15,42,48,0.4);
      flex-shrink: 0;
    }

    .preview-name {
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      color: #f5f5f7;
    }

    .preview-meta { font-size: 0.76rem; color: var(--text-muted); }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      gap: 4px;
      margin-bottom: 8px;
    }

    .emoji-grid input,
    .color-grid input { display: none; }

    .emoji-grid label {
      aspect-ratio: 1;
      border-radius: 7px;
      border: 1.5px solid transparent;
      background: rgba(255,255,255,0.05);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform var(--transition), border-color var(--transition), background var(--transition);
      font-size: 1rem;
    }

    .emoji-grid label:hover { transform: translateY(-1px); background: rgba(255,255,255,0.1); }

    .emoji-grid input:checked + label {
      border-color: var(--primary);
      background: rgba(31,111,139,0.2);
      transform: scale(1.06);
    }

    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .color-grid label {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition);
    }

    .color-grid label:hover { transform: scale(1.12); }

    .color-grid input:checked + label {
      border-color: #fff;
      box-shadow: 0 0 0 2px rgba(31,111,139,0.6);
      transform: scale(1.1);
    }

    .check-wrap {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 10px 11px;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
    }

    .check-wrap input {
      margin-top: 2px;
      width: 15px;
      height: 15px;
      accent-color: var(--primary);
      flex-shrink: 0;
    }

    .check-wrap span { color: rgba(245,245,247,0.65); font-size: 0.78rem; line-height: 1.45; }
    .check-wrap strong { color: #7ecde6; }

    .verify-box {
      border-radius: 12px;
      border: 1px solid rgba(31,111,139,0.22);
      background: linear-gradient(155deg, rgba(31,111,139,0.1), rgba(52,211,153,0.08));
      padding: 16px;
      margin-bottom: 10px;
    }

    .verify-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(31,111,139,0.22);
      font-size: 1.2rem;
      margin-bottom: 8px;
    }

    .verify-box h3 {
      font-family: 'Sora', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
      color: #f5f5f7;
    }

    .verify-box p { color: #7ecde6; font-size: 0.86rem; margin-bottom: 5px; }

    .verify-email {
      font-weight: 700;
      color: var(--accent);
      word-break: break-word;
    }

    .inline-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .inline-actions .link-btn {
      text-decoration: none;
      border-bottom: 1px dashed rgba(52,211,153,0.35);
      line-height: 1.35;
    }

    .inline-actions .link-btn:hover { border-bottom-color: rgba(110,231,183,0.6); }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 980px) {
      .auth-layout { grid-template-columns: 1fr; }
      .bento-panel { position: static; }
    }

    @media (max-width: 720px) {
      .container { width: min(1180px, 100% - 24px); }
      .auth-card { padding: 18px; }
      .row-2 { grid-template-columns: 1fr; }
      .btn-row { flex-direction: column; }
      .emoji-grid { grid-template-columns: repeat(8, minmax(0, 1fr)); }
      .header-inner { min-height: 54px; }
      .brand-sub { display: none; }
    }
  </style>


</head>
<body>

  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="site-brand" href="index" aria-label="Torna alla home">
        <span class="brand-mark" aria-hidden="true">&#127754;</span>
        <span class="brand-copy">
          <span class="brand-title">Rivalta sul Mincio</span>
          <span class="brand-sub">Comunita e territorio</span>
        </span>
      </a>
      <nav class="header-nav" aria-label="Navigazione">
        <a href="index">Home</a>
      </nav>
    </div>
  </header>

  <main class="page">
    <div class="container auth-layout">

      <!-- LEFT: Bento stats panel -->
      <aside class="bento-panel" aria-label="Community overview">
        <div class="bento-grid">

          <div class="bcard bcard-hero">
            <div class="hero-logo">
              <div class="logo-mark">&#127754;</div>
              <div class="logo-copy">
                <div class="logo-name">Rivalta sul Mincio</div>
                <div class="logo-sub">Parco del Mincio &middot; Mantova</div>
              </div>
            </div>
            <div class="hero-eyebrow">Territorio &amp; Natura</div>
            <div class="hero-tagline">Il fiume</div>
            <div class="hero-tagline">Mincio.</div>
            <div class="hero-tagline-muted">Dal Garda al Po.</div>
            <div class="hero-date">Rivalta sul Mincio &middot; Rodigo &middot; Fossato</div>
          </div>

          <div class="bcard bcard-posts">
            <div class="bnum" style="font-size:28px;color:#1F6F8B">75 km</div>
            <div class="blabel">Lunghezza del Mincio</div>
          </div>

          <div class="bcard bcard-members">
            <div class="bnum" style="font-size:28px;color:#00b4d8">14K ha</div>
            <div class="blabel">Area Parco del Mincio</div>
          </div>

          <div class="bcard bcard-likes">
            <div class="bnum" style="font-size:28px;color:#34d399">200+</div>
            <div class="blabel">Specie ornitologiche</div>
          </div>

          <div class="bcard bcard-comuni">
            <div class="bnum" style="font-size:28px;color:#ff6b6b">3</div>
            <div class="blabel">Comuni del progetto</div>
          </div>

          <div class="bcard bcard-cats">
            <div class="bnum" style="font-size:28px;color:#F59E0B">1984</div>
            <div class="blabel">Istituzione Parco</div>
          </div>

          <div class="bcard bcard-highlight">
            <div class="bnum">Riserva</div>
            <div class="blabel">Naturale<br>Regionale</div>
            <div class="bsub">Parco del Mincio</div>
          </div>

          <div class="bcard bcard-quote">
            <div class="quote-text">"Dove il <em>Garda</em> incontra il <em>Po</em>, nasce una comunita."</div>
          </div>

        </div>
      </aside>

      <!-- RIGHT: Auth panel -->
      <section class="auth-panel">
        <article class="auth-card">

          <!-- VIEW: Login -->
          <section class="view is-active" id="view-login" aria-label="Login">
            <div class="view-head">
              <p class="view-step">Bentornato</p>
              <h2>Accedi al tuo account</h2>
              <p>
                Non hai ancora un account?
                <button class="link-btn" type="button" id="login-to-register">Registrati ora</button>
              </p>
            </div>

            <div class="msg-slot" id="msg-login"></div>

            <form id="form-login" novalidate>
              <label class="field">
                <span>Email</span>
                <input type="email" id="login-email" autocomplete="email" placeholder="tu@email.it" required />
              </label>

              <label class="field">
                <span>Password</span>
                <div class="input-with-action">
                  <input type="password" id="login-password" autocomplete="current-password" placeholder="Inserisci la password" required />
                  <button class="input-action" type="button" data-toggle="login-password">Mostra</button>
                </div>
              </label>

              <button class="btn btn-primary" id="btn-login" type="submit">Accedi</button>
              <button class="btn btn-ghost" id="btn-magic" type="button">Invia link magico via email</button>
            </form>

            <div class="inline-actions">
              <button class="link-btn" type="button" id="login-to-forgot">Password dimenticata?</button>
              <a href="index" class="link-btn">Torna alla home</a>
            </div>
          </section>

          <!-- VIEW: Register step 1 -->
          <section class="view" id="view-register1" aria-label="Registrazione passo 1">
            <div class="steps" aria-hidden="true">
              <span class="active"></span><span></span>
            </div>

            <div class="view-head">
              <p class="view-step">Registrazione 1 di 2</p>
              <h2>Crea il tuo account</h2>
              <p>
                Hai gia un profilo?
                <button class="link-btn" type="button" id="reg1-to-login">Vai al login</button>
              </p>
            </div>

            <div class="msg-slot" id="msg-reg1"></div>

            <form id="form-reg1" novalidate>
              <label class="field">
                <span>Email</span>
                <input type="email" id="reg1-email" autocomplete="email" placeholder="nome@email.it" required />
              </label>

              <label class="field">
                <span>Password</span>
                <div class="input-with-action">
                  <input type="password" id="reg1-password" autocomplete="new-password" placeholder="Almeno 6 caratteri" minlength="6" required />
                  <button class="input-action" type="button" data-toggle="reg1-password">Mostra</button>
                </div>
              </label>

              <label class="field">
                <span>Conferma password</span>
                <div class="input-with-action">
                  <input type="password" id="reg1-password2" autocomplete="new-password" placeholder="Ripeti la password" minlength="6" required />
                  <button class="input-action" type="button" data-toggle="reg1-password2">Mostra</button>
                </div>
              </label>

              <div class="btn-row">
                <button class="btn btn-primary" id="btn-reg1-next" type="submit">Continua</button>
                <button class="btn btn-ghost" type="button" id="reg1-back-home">Annulla</button>
              </div>
            </form>
          </section>

          <!-- VIEW: Register step 2 -->
          <section class="view" id="view-register2" aria-label="Registrazione passo 2">
            <div class="steps" aria-hidden="true">
              <span></span><span class="active"></span>
            </div>

            <div class="view-head">
              <p class="view-step">Registrazione 2 di 2</p>
              <h2>Completa l'identita locale</h2>
              <p>Username unico e regole accettate sono obbligatori.</p>
            </div>

            <p class="email-pill" id="reg2-email-pill">Account: -</p>
            <div class="msg-slot" id="msg-reg2"></div>

            <div class="identity-preview">
              <div class="preview-avatar" id="preview-avatar" aria-hidden="true">&#127807;</div>
              <div>
                <div class="preview-name" id="preview-name">@username</div>
                <div class="preview-meta" id="preview-comune">Comune non impostato</div>
              </div>
            </div>

            <form id="form-reg2" novalidate>
              <div class="row-2">
                <label class="field">
                  <span>Username unico</span>
                  <input type="text" id="reg2-username" maxlength="30" autocomplete="username" placeholder="esempio_utente" required />
                  <small>Solo lettere minuscole, numeri e underscore, minimo 3.</small>
                </label>

                <label class="field">
                  <span>Nome visualizzato</span>
                  <input type="text" id="reg2-display" maxlength="60" placeholder="Come vuoi comparire" required />
                </label>
              </div>

              <label class="field">
                <span>Comune</span>
                <select id="reg2-comune" required>
                  <option value="">Seleziona...</option>
                  <option value="Rivalta sul Mincio">Rivalta sul Mincio</option>
                  <option value="Rodigo">Rodigo</option>
                  <option value="Fossato">Fossato</option>
                  <option value="Fuori comune">Fuori comune</option>
                </select>
              </label>

              <label class="field">
                <span>Bio breve</span>
                <textarea id="reg2-bio" maxlength="240" placeholder="Racconta in poche righe chi sei e perche sei qui" required></textarea>
                <small>Massimo 240 caratteri.</small>
              </label>

              <div>
                <p class="group-label">Avatar emoji</p>
                <div class="emoji-grid" id="avatar-emoji-grid"></div>
              </div>

              <div>
                <p class="group-label">Colore avatar</p>
                <div class="color-grid" id="avatar-color-grid"></div>
              </div>

              <label class="check-wrap" for="reg2-rules">
                <input type="checkbox" id="reg2-rules" />
                <span>
                  Dichiaro di accettare le <strong>regole della comunita</strong> (obbligatorio) versione 2026-04.
                </span>
              </label>

              <div class="btn-row">
                <button class="btn btn-primary" id="btn-signup" type="submit">Crea account e invia verifica</button>
                <button class="btn btn-ghost" id="reg2-back" type="button">Indietro</button>
              </div>
            </form>
          </section>

          <!-- VIEW: Forgot password -->
          <section class="view" id="view-forgot" aria-label="Password dimenticata">
            <div class="view-head">
              <p class="view-step">Recupero account</p>
              <h2>Reimposta la password</h2>
              <p>Ti inviamo una email con il link di reset.</p>
            </div>

            <div class="msg-slot" id="msg-forgot"></div>

            <form id="form-forgot" novalidate>
              <label class="field">
                <span>Email</span>
                <input type="email" id="forgot-email" autocomplete="email" placeholder="tu@email.it" required />
              </label>

              <div class="btn-row">
                <button class="btn btn-primary" id="btn-forgot" type="submit">Invia email reset</button>
                <button class="btn btn-ghost" id="forgot-back-login" type="button">Torna al login</button>
              </div>
            </form>
          </section>

          <!-- VIEW: Verify email -->
          <section class="view" id="view-verify" aria-label="Verifica email">
            <div class="verify-box">
              <div class="verify-icon" aria-hidden="true">&#9993;&#65039;</div>
              <h3>Controlla la tua email</h3>
              <p>
                Abbiamo inviato un link di conferma a:
                <span class="verify-email" id="verify-email-target">la tua email</span>
              </p>
              <p>
                Finche l'email non e verificata non puoi usare l'account in modo operativo ne pubblicare contenuti.
              </p>
            </div>

            <div class="msg-slot" id="msg-verify"></div>

            <div class="btn-row">
              <button class="btn btn-primary" id="verify-to-login" type="button">Ho verificato, torno al login</button>
              <button class="btn btn-ghost" id="verify-to-register" type="button">Usa un'altra email</button>
            </div>
          </section>

        </article>
      </section>

    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script src="supabase.config.js"></script>
  <script src="security.client.js"></script>
  <script>
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const byId = (id) => document.getElementById(id);

    const COMMUNITY_RULES_VERSION = '2026-04';
    const EMOJIS = ['\u{1F33F}', '\u{1F9A2}', '\u{1F30A}', '\u{1F3A3}', '\u{1F338}', '\u{1F98B}', '\u{1F33E}', '\u{1F33B}', '\u{1F9DC}', '\u{1F420}', '\u{1F343}', '\u{1F33C}', '\u{1F986}', '\u{1F4A7}', '\u{2B50}', '\u{1F319}'];
    const COLORS = ['#1F6F8B', '#2E7D32', '#3A8C8A', '#4A6FA5', '#C62828', '#F57F17', '#0F2A30', '#6D4C41'];

    const state = {
      view: 'login',
      regAccount: { email: '', password: '' },
      verifyEmail: ''
    };

    const RATE_LIMITS = {
      login: { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockMs: 15 * 60 * 1000 },
      magic: { maxAttempts: 4, windowMs: 15 * 60 * 1000, lockMs: 20 * 60 * 1000 },
      forgot: { maxAttempts: 4, windowMs: 30 * 60 * 1000, lockMs: 30 * 60 * 1000 }
    };

    function sanitizeUsername(value) {
      return String(value || '').toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    }

    function isEmailConfirmed(user) {
      return Boolean(user && (user.email_confirmed_at || user.confirmed_at));
    }

    function normalizeBio(value) {
      return String(value || '').trim().replace(/\s+/g, ' ');
    }

    function setView(viewName) {
      const views = document.querySelectorAll('.view');
      views.forEach((view) => view.classList.remove('is-active'));
      const target = byId('view-' + viewName);
      if (target) {
        target.classList.add('is-active');
        state.view = viewName;
      }
    }

    function showMessage(targetId, type, text) {
      const slot = byId(targetId);
      if (!slot) return;
      slot.innerHTML = '';
      if (!text) return;

      const box = document.createElement('div');
      box.className = 'notice ' + type;
      box.textContent = text;
      slot.appendChild(box);
    }

    function clearMessages() {
      showMessage('msg-login', 'info', '');
      showMessage('msg-reg1', 'info', '');
      showMessage('msg-reg2', 'info', '');
      showMessage('msg-forgot', 'info', '');
      showMessage('msg-verify', 'info', '');
    }

    function setButtonLoading(buttonId, loading, defaultLabel, loadingLabel) {
      const button = byId(buttonId);
      if (!button) return;

      if (loading) {
        button.disabled = true;
        button.textContent = loadingLabel || 'Attendere...';
        return;
      }

      button.disabled = false;
      button.textContent = defaultLabel;
    }

    function humanizeAuthError(error, fallback) {
      const fallbackText = fallback || 'Operazione non riuscita. Riprova.';
      if (!error || !error.message) return fallbackText;
      const raw = String(error.message).toLowerCase();

      if (raw.includes('invalid login credentials')) return 'Email o password non corrette.';
      if (raw.includes('email not confirmed')) return 'Email non ancora verificata.';
      if (raw.includes('already registered') || raw.includes('already exists')) return 'Questa email risulta gia registrata.';
      if (raw.includes('password should be at least')) return 'La password deve avere almeno 6 caratteri.';
      if (raw.includes('rate limit')) return 'Troppi tentativi. Riprova tra poco.';

      return fallbackText;
    }

    function checkRateLimit(action, identity, cfg) {
      if (!window.RSM_SECURITY) return { ok: true, retryAfterMs: 0 };
      return window.RSM_SECURITY.checkRateLimit(action, identity, cfg);
    }

    function rememberRateFailure(action, identity, cfg) {
      if (!window.RSM_SECURITY) return;
      window.RSM_SECURITY.recordRateFailure(action, identity, cfg);
    }

    function clearRateFailures(action, identity) {
      if (!window.RSM_SECURITY) return;
      window.RSM_SECURITY.clearRateFailures(action, identity);
    }

    function rateLimitMessage(base, retryAfterMs) {
      if (!window.RSM_SECURITY) return base;
      return base + ' Riprova tra ' + window.RSM_SECURITY.formatRetry(retryAfterMs) + '.';
    }

    function togglePasswordVisibility(inputId, trigger) {
      const input = byId(inputId);
      if (!input || !trigger) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      trigger.textContent = show ? 'Nascondi' : 'Mostra';
    }

    function buildAvatarPickers() {
      const emojiGrid = byId('avatar-emoji-grid');
      const colorGrid = byId('avatar-color-grid');
      if (!emojiGrid || !colorGrid) return;

      emojiGrid.innerHTML = '';
      colorGrid.innerHTML = '';

      EMOJIS.forEach((emoji, idx) => {
        const id = 'reg-emoji-' + idx;
        const checked = idx === 0 ? 'checked' : '';
        emojiGrid.insertAdjacentHTML(
          'beforeend',
          '<input type="radio" name="reg-emoji" id="' + id + '" value="' + emoji + '" ' + checked + '>' +
          '<label for="' + id + '">' + emoji + '</label>'
        );
      });

      COLORS.forEach((color, idx) => {
        const id = 'reg-color-' + idx;
        const checked = idx === 0 ? 'checked' : '';
        colorGrid.insertAdjacentHTML(
          'beforeend',
          '<input type="radio" name="reg-color" id="' + id + '" value="' + color + '" ' + checked + '>' +
          '<label for="' + id + '" style="background:' + color + '"></label>'
        );
      });

      document.querySelectorAll('input[name="reg-emoji"], input[name="reg-color"]').forEach((el) => {
        el.addEventListener('change', updateIdentityPreview);
      });
    }

    function getSelectedAvatar() {
      const selectedEmoji = document.querySelector('input[name="reg-emoji"]:checked');
      const selectedColor = document.querySelector('input[name="reg-color"]:checked');
      return {
        emoji: selectedEmoji ? selectedEmoji.value : '\u{1F33F}',
        color: selectedColor ? selectedColor.value : '#1F6F8B'
      };
    }

    function updateIdentityPreview() {
      const usernameInput = byId('reg2-username');
      const displayInput = byId('reg2-display');
      const comuneInput = byId('reg2-comune');
      const previewAvatar = byId('preview-avatar');
      const previewName = byId('preview-name');
      const previewComune = byId('preview-comune');

      if (!usernameInput || !displayInput || !comuneInput || !previewAvatar || !previewName || !previewComune) return;

      const sanitized = sanitizeUsername(usernameInput.value);
      if (usernameInput.value !== sanitized) {
        usernameInput.value = sanitized;
      }

      const displayName = displayInput.value.trim();
      const comune = comuneInput.value || 'Comune non impostato';
      const avatar = getSelectedAvatar();

      previewAvatar.textContent = avatar.emoji;
      previewAvatar.style.background = avatar.color;
      previewName.textContent = displayName || (sanitized ? '@' + sanitized : '@username');
      previewComune.textContent = comune;
    }

    async function ensureProfileForUser(user) {
      const { data: existing, error: existingError } = await sb
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle();

      if (existingError) {
        return { ok: false, message: 'Accesso riuscito, ma il controllo profilo ha dato errore.' };
      }

      if (existing) {
        return { ok: true, created: false };
      }

      const metadata = user.user_metadata || {};
      const username = sanitizeUsername(metadata.username || '');
      const displayName = String(metadata.display_name || '').trim();
      const comune = String(metadata.comune || '').trim();
      const bio = normalizeBio(metadata.bio || '');
      const avatarEmoji = String(metadata.avatar_emoji || '').trim();
      const avatarColor = String(metadata.avatar_color || '').trim();

      const metadataComplete = username.length >= 3 && displayName && comune && avatarEmoji && avatarColor;
      if (!metadataComplete) {
        return { ok: true, created: false, incompleteMetadata: true };
      }

      const payload = {
        id: user.id,
        username: username,
        display_name: displayName,
        bio: bio || null,
        comune: comune,
        avatar_emoji: avatarEmoji,
        avatar_color: avatarColor,
        role: comune === 'Fuori comune' ? 'reader' : 'user'
      };

      const { error: insertError } = await sb.from('profiles').insert(payload);

      if (insertError) {
        if (insertError.code === '23505') {
          return { ok: true, created: false, incompleteMetadata: true };
        }
        return { ok: false, message: 'Accesso riuscito, ma non siamo riusciti a creare il profilo.' };
      }

      return { ok: true, created: true };
    }

    async function submitMagicLink() {
      showMessage('msg-login', 'info', '');
      const email = byId('login-email').value.trim();
      if (!email || !validEmail(email)) {
        showMessage('msg-login', 'error', 'Inserisci una email valida per ricevere il link magico.');
        return;
      }

      const magicLimit = checkRateLimit('magic_link', email, RATE_LIMITS.magic);
      if (!magicLimit.ok) {
        showMessage('msg-login', 'error', rateLimitMessage('Troppi tentativi di invio link magico.', magicLimit.retryAfterMs));
        return;
      }

      setButtonLoading('btn-magic', true, 'Invia link magico via email', 'Invio in corso...');

      const redirectUrl = new URL('profile', window.location.href).toString();
      const { error } = await sb.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: redirectUrl, shouldCreateUser: false }
      });

      setButtonLoading('btn-magic', false, 'Invia link magico via email', 'Invio in corso...');

      if (error) {
        rememberRateFailure('magic_link', email, RATE_LIMITS.magic);
        showMessage('msg-login', 'error', humanizeAuthError(error, 'Invio link magico non riuscito.'));
        return;
      }

      clearRateFailures('magic_link', email);
      showMessage('msg-login', 'success', 'Link magico inviato. Apri la mail e clicca il link per accedere.');
    }

    async function submitLogin(event) {
      event.preventDefault();
      showMessage('msg-login', 'info', '');

      const email = byId('login-email').value.trim();
      const password = byId('login-password').value;

      if (!email || !password) {
        showMessage('msg-login', 'error', 'Compila email e password.');
        return;
      }

      const loginLimit = checkRateLimit('login_password', email, RATE_LIMITS.login);
      if (!loginLimit.ok) {
        showMessage('msg-login', 'error', rateLimitMessage('Troppi tentativi di accesso.', loginLimit.retryAfterMs));
        return;
      }

      setButtonLoading('btn-login', true, 'Accedi', 'Accesso in corso...');

      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });

      setButtonLoading('btn-login', false, 'Accedi', 'Accesso in corso...');

      if (error) {
        rememberRateFailure('login_password', email, RATE_LIMITS.login);
        showMessage('msg-login', 'error', humanizeAuthError(error, 'Non siamo riusciti ad accedere.'));
        return;
      }

      clearRateFailures('login_password', email);

      const user = data && data.user ? data.user : null;
      if (!user) {
        showMessage('msg-login', 'error', 'Sessione non valida. Riprova.');
        return;
      }

      if (!isEmailConfirmed(user)) {
        await sb.auth.signOut();
        state.verifyEmail = user.email || email;
        byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
        showMessage('msg-verify', 'info', 'Prima verifica la tua email. Senza conferma non puoi accedere o pubblicare.');
        setView('verify');
        return;
      }

      const ensured = await ensureProfileForUser(user);
      if (!ensured.ok) {
        showMessage('msg-login', 'error', ensured.message || 'Errore durante il controllo profilo.');
        return;
      }

      const { data: loginProf } = await sb.from('profiles').select('username').eq('id', user.id).single();
      window.location.href = loginProf?.username ? 'profile?u=' + loginProf.username : 'profile';
    }

    function validEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function submitRegisterStep1(event) {
      event.preventDefault();
      showMessage('msg-reg1', 'info', '');

      const email = byId('reg1-email').value.trim();
      const password = byId('reg1-password').value;
      const confirmPassword = byId('reg1-password2').value;

      if (!email || !password || !confirmPassword) {
        showMessage('msg-reg1', 'error', 'Compila tutti i campi richiesti.');
        return;
      }

      if (!validEmail(email)) {
        showMessage('msg-reg1', 'error', 'Inserisci una email valida.');
        return;
      }

      if (password.length < 6) {
        showMessage('msg-reg1', 'error', 'La password deve avere almeno 6 caratteri.');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('msg-reg1', 'error', 'Le password non coincidono.');
        return;
      }

      state.regAccount.email = email;
      state.regAccount.password = password;

      byId('reg2-email-pill').textContent = 'Account: ' + email;
      byId('forgot-email').value = email;
      setView('register2');
    }

    async function submitRegisterStep2(event) {
      event.preventDefault();
      showMessage('msg-reg2', 'info', '');

      const usernameRaw = byId('reg2-username').value;
      const username = sanitizeUsername(usernameRaw);
      byId('reg2-username').value = username;

      const displayName = byId('reg2-display').value.trim();
      const comune = byId('reg2-comune').value;
      const bio = normalizeBio(byId('reg2-bio').value);
      const rulesAccepted = byId('reg2-rules').checked;
      const avatar = getSelectedAvatar();

      if (!state.regAccount.email || !state.regAccount.password) {
        showMessage('msg-reg2', 'error', 'Dati account mancanti. Riparti dal passo 1.');
        setView('register1');
        return;
      }

      if (username.length < 3) {
        showMessage('msg-reg2', 'error', 'Username non valido: minimo 3 caratteri con lettere, numeri o underscore.');
        return;
      }

      if (!displayName) {
        showMessage('msg-reg2', 'error', 'Inserisci il nome visualizzato.');
        return;
      }

      if (!comune) {
        showMessage('msg-reg2', 'error', 'Seleziona il comune di riferimento.');
        return;
      }

      if (!bio || bio.length < 8) {
        showMessage('msg-reg2', 'error', 'Inserisci una bio breve di almeno 8 caratteri.');
        return;
      }

      if (!rulesAccepted) {
        showMessage('msg-reg2', 'error', 'Per registrarti devi accettare le regole della comunita.');
        return;
      }

      setButtonLoading('btn-signup', true, 'Crea account e invia verifica', 'Registrazione in corso...');

      const { data: usernameRows, error: usernameCheckError } = await sb
        .from('profiles')
        .select('id')
        .eq('username', username)
        .limit(1);

      if (usernameCheckError) {
        setButtonLoading('btn-signup', false, 'Crea account e invia verifica', 'Registrazione in corso...');
        showMessage('msg-reg2', 'error', "Impossibile verificare ora l'username. Riprova tra poco.");
        return;
      }

      if (Array.isArray(usernameRows) && usernameRows.length > 0) {
        setButtonLoading('btn-signup', false, 'Crea account e invia verifica', 'Registrazione in corso...');
        showMessage('msg-reg2', 'error', 'Username gia in uso. Scegline uno diverso.');
        return;
      }

      const acceptedAt = new Date().toISOString();
      const redirectUrl = new URL('login?verified=1', window.location.href).toString();

      const metadata = {
        username: username,
        display_name: displayName,
        comune: comune,
        bio: bio,
        avatar_emoji: avatar.emoji,
        avatar_color: avatar.color,
        community_rules_accepted: true,
        community_rules_accepted_at: acceptedAt,
        community_rules_version: COMMUNITY_RULES_VERSION
      };

      const { error: signUpError } = await sb.auth.signUp({
        email: state.regAccount.email,
        password: state.regAccount.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      setButtonLoading('btn-signup', false, 'Crea account e invia verifica', 'Registrazione in corso...');

      if (signUpError) {
        showMessage('msg-reg2', 'error', humanizeAuthError(signUpError, 'Registrazione non riuscita.'));
        return;
      }

      await sb.auth.signOut();

      state.verifyEmail = state.regAccount.email;
      byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
      showMessage('msg-verify', 'success', "Registrazione completata. Apri la tua email e conferma l'account prima del login.");
      setView('verify');
    }

    async function submitForgot(event) {
      event.preventDefault();
      showMessage('msg-forgot', 'info', '');

      const email = byId('forgot-email').value.trim();
      if (!email || !validEmail(email)) {
        showMessage('msg-forgot', 'error', 'Inserisci una email valida.');
        return;
      }

      const forgotLimit = checkRateLimit('forgot_password', email, RATE_LIMITS.forgot);
      if (!forgotLimit.ok) {
        showMessage('msg-forgot', 'error', rateLimitMessage('Hai richiesto troppi reset password in poco tempo.', forgotLimit.retryAfterMs));
        return;
      }

      const resetRedirect = new URL('reset', window.location.href).toString();
      setButtonLoading('btn-forgot', true, 'Invia email reset', 'Invio in corso...');

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirect
      });

      setButtonLoading('btn-forgot', false, 'Invia email reset', 'Invio in corso...');

      if (error) {
        rememberRateFailure('forgot_password', email, RATE_LIMITS.forgot);
        showMessage('msg-forgot', 'error', humanizeAuthError(error, 'Invio email di reset non riuscito.'));
        return;
      }

      clearRateFailures('forgot_password', email);
      showMessage('msg-forgot', 'success', 'Email inviata. Controlla la posta e anche la cartella spam.');
    }

    function applyVerifiedQueryMessage() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === '1') {
        setView('login');
        showMessage('msg-login', 'success', 'Email verificata con successo. Ora puoi accedere.');
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    async function restoreActiveSession() {
      const { data, error } = await sb.auth.getSession();
      if (error || !data || !data.session || !data.session.user) {
        return;
      }

      const user = data.session.user;

      if (!isEmailConfirmed(user)) {
        await sb.auth.signOut();
        state.verifyEmail = user.email || '';
        byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
        showMessage('msg-verify', 'info', 'Sessione trovata ma email non confermata. Verifica prima di accedere.');
        setView('verify');
        return;
      }

      const ensured = await ensureProfileForUser(user);
      if (!ensured.ok) {
        setView('login');
        showMessage('msg-login', 'error', ensured.message || 'Errore nel controllo profilo.');
        return;
      }

      const { data: restoreProf } = await sb.from('profiles').select('username').eq('id', user.id).single();
      window.location.href = restoreProf?.username ? 'profile?u=' + restoreProf.username : 'profile';
    }

    function bindEvents() {
      byId('form-login').addEventListener('submit', submitLogin);
      byId('btn-magic').addEventListener('click', submitMagicLink);
      byId('form-reg1').addEventListener('submit', submitRegisterStep1);
      byId('form-reg2').addEventListener('submit', submitRegisterStep2);
      byId('form-forgot').addEventListener('submit', submitForgot);

      byId('login-to-register').addEventListener('click', () => {
        clearMessages();
        setView('register1');
      });

      byId('reg1-to-login').addEventListener('click', () => {
        clearMessages();
        setView('login');
      });

      byId('login-to-forgot').addEventListener('click', () => {
        clearMessages();
        byId('forgot-email').value = byId('login-email').value.trim();
        setView('forgot');
      });

      byId('forgot-back-login').addEventListener('click', () => {
        clearMessages();
        setView('login');
      });

      byId('verify-to-login').addEventListener('click', () => {
        clearMessages();
        setView('login');
        if (state.verifyEmail) {
          byId('login-email').value = state.verifyEmail;
        }
      });

      byId('verify-to-register').addEventListener('click', () => {
        clearMessages();
        setView('register1');
      });

      byId('reg2-back').addEventListener('click', () => {
        clearMessages();
        setView('register1');
      });

      byId('reg1-back-home').addEventListener('click', () => {
        window.location.href = 'index';
      });

      byId('reg2-username').addEventListener('input', updateIdentityPreview);
      byId('reg2-display').addEventListener('input', updateIdentityPreview);
      byId('reg2-comune').addEventListener('change', updateIdentityPreview);

      document.querySelectorAll('[data-toggle]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const inputId = trigger.getAttribute('data-toggle');
          togglePasswordVisibility(inputId, trigger);
        });
      });

      const header = byId('site-header');
      window.addEventListener('scroll', () => {
        if (!header) return;
        if (window.scrollY > 8) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      });
    }

    function init() {
      bindEvents();
      buildAvatarPickers();
      updateIdentityPreview();
      applyVerifiedQueryMessage();
      restoreActiveSession();
    }

    init();
  </script>
</body>
</html>
