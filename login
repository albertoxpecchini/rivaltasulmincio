<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <script>!function(){try{var p=JSON.parse(localStorage.getItem('rsm_prefs_v1'))||{},r=document.documentElement,s={sm:'14px',md:'16px',lg:'18px',xl:'20px'},t=p.theme;var ok=t==='chiaro'||t==='scuro'||t==='auto';t=ok?t:'chiaro';r.dataset.theme=t==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'scuro':'chiaro'):t;r.dataset.themePref=t;r.dataset.fontsize=p.fontsize||'md';r.style.fontSize=s[p.fontsize]||'16px';r.dataset.density=p.uiDensity||'comfortable';if(p.contrast)r.dataset.contrast='high';else delete r.dataset.contrast;}catch(e){}}();</script>
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accedi | Rivalta sul Mincio</title>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,650;1,9..144,550&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
      --warn:       #b45309;
      --radius:     14px;
      --radius-sm:  10px;
      --shadow:     0 26px 80px rgba(37, 63, 53, 0.14);
      --shadow-card: 0 2px 24px rgba(37, 63, 53, 0.09), 0 0 0 1px rgba(37, 63, 53, 0.07);
      --ease:       cubic-bezier(0.32, 0.72, 0, 1);
      --sans:       "Cabinet Grotesk", system-ui, sans-serif;
      --serif:      "Fraunces", Georgia, serif;
      --transition: 0.22s cubic-bezier(0.32, 0.72, 0, 1);
    }

    html, body { min-height: 100%; }

    body {
      font-family: var(--sans);
      background:
        radial-gradient(circle at 14% 8%, rgba(198, 164, 98, 0.28), transparent 28rem),
        radial-gradient(circle at 88% 2%, rgba(47, 107, 103, 0.16), transparent 34rem),
        linear-gradient(135deg, var(--cream), #efe5d2 54%, #f8f2e8);
      color: var(--ink);
      line-height: 1.6;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.16;
      background-image:
        radial-gradient(circle at 12% 18%, rgba(23, 34, 29, 0.11) 0 1px, transparent 1px),
        radial-gradient(circle at 77% 54%, rgba(23, 34, 29, 0.08) 0 1px, transparent 1px);
      background-size: 23px 23px, 31px 31px;
      mix-blend-mode: multiply;
    }

    a { color: var(--marsh); text-decoration: none; }
    a:hover { color: var(--water); }

    .container {
      width: min(1180px, 100% - 36px);
      margin-inline: auto;
      position: relative;
      z-index: 1;
    }

    /* ===== NAV ISLAND (identica a index) ===== */
    .brand-mark {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-mark img {
      width: 42px;
      height: 42px;
      object-fit: cover;
      display: block;
    }

    .nav-home-btn {
      border: 0;
      border-radius: 999px;
      background: var(--marsh);
      color: var(--paper);
      min-height: 42px;
      padding: 0 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-family: var(--sans);
      font-weight: 800;
      font-size: 0.86rem;
      text-decoration: none;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
      transition: transform var(--transition), background var(--transition);
      white-space: nowrap;
    }

    .nav-home-btn:hover {
      background: var(--ink);
      color: var(--paper);
      transform: translateY(-1px);
    }

    /* ===== PAGE ===== */
    .page { padding-block: 112px 64px; }

    /* ===== AUTH LAYOUT ===== */
    .auth-layout {
      display: grid;
      grid-template-columns: 1fr minmax(260px, 340px);
      gap: 24px;
      align-items: start;
    }

    /* ===== BENTO PANEL ===== */
    .bento-panel {
      order: 2;
      position: sticky;
      top: 100px;
    }

    .bento-grid {
      display: grid;
      gap: 6px;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "hero      hero"
        "posts     members"
        "likes     comuni"
        "cats      highlight"
        "quote     quote";
    }

    .bcard {
      background: var(--paper);
      border-radius: var(--radius);
      border: 1px solid var(--line);
      box-shadow: 0 2px 12px rgba(37, 63, 53, 0.06);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .bnum {
      font-family: var(--serif);
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 4px;
    }

    .blabel {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-soft);
      line-height: 1.3;
    }

    .bcard-hero {
      grid-area: hero;
      padding: 18px 20px 16px;
    }

    .bcard-hero::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--marsh), var(--reed), var(--water));
      border-radius: var(--radius) var(--radius) 0 0;
    }

    .hero-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .logo-mark {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid var(--line);
    }

    .logo-mark img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      display: block;
    }

    .logo-copy { line-height: 1.15; }

    .logo-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: -0.02em;
    }

    .logo-sub {
      font-size: 0.66rem;
      color: rgba(23, 34, 29, 0.46);
      font-style: italic;
      margin-top: 2px;
    }

    .hero-eyebrow {
      font-size: 0.66rem;
      font-weight: 800;
      color: var(--marsh);
      text-transform: uppercase;
      letter-spacing: 0.13em;
      margin-bottom: 7px;
    }

    .hero-tagline {
      font-family: var(--serif);
      font-size: 22px;
      font-weight: 650;
      color: var(--ink);
      letter-spacing: -0.03em;
      line-height: 1.08;
    }

    .hero-tagline-muted {
      font-family: var(--serif);
      font-size: 22px;
      font-weight: 650;
      color: rgba(23, 34, 29, 0.34);
      letter-spacing: -0.03em;
      line-height: 1.08;
    }

    .hero-date {
      font-size: 10px;
      font-weight: 600;
      color: rgba(23, 34, 29, 0.38);
      margin-top: 10px;
      letter-spacing: 0.05em;
    }

    .bcard-posts     { grid-area: posts; }
    .bcard-members   { grid-area: members; }
    .bcard-likes     { grid-area: likes; }
    .bcard-comuni    { grid-area: comuni; }
    .bcard-cats      { grid-area: cats; }

    .bcard-highlight {
      grid-area: highlight;
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(150deg, var(--marsh) 0%, var(--water) 55%, #4a9e7c 100%);
      border-color: transparent;
      padding: 14px 10px;
    }

    .bcard-highlight .bnum {
      font-family: var(--sans);
      font-size: 14px;
      font-weight: 800;
      color: var(--paper);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 4px;
    }

    .bcard-highlight .blabel { font-size: 11px; color: rgba(255, 250, 240, 0.75); font-weight: 600; }
    .bcard-highlight .bsub   { font-size: 10px; color: rgba(255, 250, 240, 0.42); margin-top: 4px; }

    .bcard-quote {
      grid-area: quote;
      background: var(--paper);
      padding: 18px 22px;
    }

    .bcard-quote::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, var(--marsh), var(--reed));
      border-radius: var(--radius) 0 0 var(--radius);
    }

    .quote-text {
      font-family: var(--serif);
      font-size: 15px;
      font-weight: 500;
      font-style: italic;
      color: var(--ink);
      letter-spacing: -0.01em;
      line-height: 1.48;
    }

    .quote-text em { color: var(--water); font-style: normal; font-weight: 650; }

    /* ===== AUTH PANEL ===== */
    .auth-panel { order: 1; min-width: 0; }

    .auth-card {
      border-radius: 20px;
      border: 1px solid var(--line);
      background: var(--paper);
      box-shadow: var(--shadow-card);
      padding: 30px 32px;
      position: relative;
      overflow: hidden;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--marsh), var(--reed));
      border-radius: 20px 20px 0 0;
    }

    .view { display: none; animation: fadeIn 0.24s var(--ease); }
    .view.is-active { display: block; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: none; }
    }

    .view-head { margin-bottom: 20px; }

    .view-step {
      font-size: 0.66rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--marsh);
      font-weight: 800;
      margin-bottom: 6px;
    }

    .view-head h2 {
      font-family: var(--serif);
      font-size: 2rem;
      font-weight: 650;
      line-height: 1.05;
      margin-bottom: 8px;
      letter-spacing: -0.03em;
      color: var(--ink);
    }

    .view-head p {
      font-size: 0.86rem;
      color: var(--ink-soft);
    }

    .link-btn {
      appearance: none;
      border: none;
      background: none;
      font: inherit;
      font-size: 0.86rem;
      color: var(--water);
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .link-btn:hover { color: var(--marsh); }

    .msg-slot { min-height: 6px; margin-bottom: 10px; }

    .notice {
      border-radius: 10px;
      border: 1px solid transparent;
      padding: 10px 13px;
      font-size: 0.82rem;
      line-height: 1.5;
    }

    .notice.info    { background: rgba(37, 63, 53, 0.07);  border-color: rgba(37, 63, 53, 0.2);  color: var(--marsh); }
    .notice.success { background: rgba(47, 107, 103, 0.07); border-color: rgba(47, 107, 103, 0.2); color: var(--water); }
    .notice.error   { background: rgba(184, 50, 50, 0.06);  border-color: rgba(184, 50, 50, 0.18); color: var(--err); }

    form { display: grid; gap: 13px; }
    .field { display: grid; gap: 5px; }

    .field > span,
    .group-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(23, 34, 29, 0.48);
      font-weight: 800;
    }

    .field input,
    .field textarea,
    .field select {
      width: 100%;
      border-radius: 10px;
      border: 1.5px solid rgba(37, 63, 53, 0.15);
      background: var(--cream);
      color: var(--ink);
      font-size: 0.88rem;
      font-family: var(--sans);
      padding: 10px 13px;
      transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
      -webkit-appearance: none;
    }

    .field select option { background: var(--paper); color: var(--ink); }

    .field textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    .field input::placeholder,
    .field textarea::placeholder { color: rgba(23, 34, 29, 0.26); }

    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      outline: none;
      border-color: var(--water);
      box-shadow: 0 0 0 3px rgba(47, 107, 103, 0.13);
      background: var(--paper);
    }

    .field small { color: var(--ink-soft); font-size: 0.73rem; }

    .row-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .input-with-action { position: relative; }
    .input-with-action input { padding-right: 88px; }

    .input-action {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: rgba(37, 63, 53, 0.1);
      color: var(--marsh);
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 8px;
      padding: 5px 8px;
      cursor: pointer;
      font-family: var(--sans);
    }

    .input-action:hover { background: rgba(37, 63, 53, 0.17); }

    .btn {
      appearance: none;
      border: none;
      border-radius: 999px;
      font-family: var(--sans);
      font-size: 0.9rem;
      font-weight: 800;
      padding: 12px 22px;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition), background var(--transition), opacity var(--transition);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: -0.01em;
    }

    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-primary {
      background: var(--marsh);
      color: var(--paper);
      box-shadow: 0 6px 20px rgba(37, 63, 53, 0.26);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--ink);
      transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(23, 34, 29, 0.3);
    }

    .btn-ghost {
      background: var(--cream);
      color: var(--ink);
      border: 1.5px solid var(--line);
    }

    .btn-ghost:hover:not(:disabled) {
      border-color: rgba(37, 63, 53, 0.28);
      background: var(--mist);
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
      margin-bottom: 16px;
    }

    .steps span {
      width: 14px;
      height: 3px;
      border-radius: 2px;
      background: var(--line);
      display: inline-block;
      transition: width var(--transition), background var(--transition);
    }

    .steps span.active { width: 28px; background: var(--marsh); }

    .email-pill {
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(37, 63, 53, 0.07);
      color: var(--marsh);
      padding: 5px 12px;
      font-size: 0.75rem;
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }

    .identity-preview {
      border-radius: 12px;
      border: 1px solid var(--line);
      background: rgba(37, 63, 53, 0.04);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .preview-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--marsh);
      color: var(--paper);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(37, 63, 53, 0.28);
      flex-shrink: 0;
    }

    .preview-name {
      font-weight: 800;
      font-size: 0.9rem;
      color: var(--ink);
    }

    .preview-meta { font-size: 0.76rem; color: var(--ink-soft); }

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
      border-radius: 8px;
      border: 1.5px solid transparent;
      background: rgba(37, 63, 53, 0.06);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform var(--transition), border-color var(--transition), background var(--transition);
      font-size: 1rem;
    }

    .emoji-grid label:hover { transform: translateY(-1px); background: rgba(37, 63, 53, 0.1); }

    .emoji-grid input:checked + label {
      border-color: var(--marsh);
      background: rgba(37, 63, 53, 0.12);
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
      border-color: var(--ink);
      box-shadow: 0 0 0 2px rgba(37, 63, 53, 0.38);
      transform: scale(1.1);
    }

    .check-wrap {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 11px 13px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(37, 63, 53, 0.03);
    }

    .check-wrap input {
      margin-top: 2px;
      width: 15px;
      height: 15px;
      accent-color: var(--marsh);
      flex-shrink: 0;
    }

    .check-wrap span { color: var(--ink-soft); font-size: 0.78rem; line-height: 1.5; }
    .check-wrap strong { color: var(--marsh); }

    .verify-box {
      border-radius: 14px;
      border: 1px solid var(--line);
      background: linear-gradient(155deg, rgba(37, 63, 53, 0.07), rgba(198, 164, 98, 0.06));
      padding: 18px;
      margin-bottom: 12px;
    }

    .verify-icon {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(37, 63, 53, 0.13);
      font-size: 1.2rem;
      margin-bottom: 10px;
    }

    .verify-box h3 {
      font-family: var(--serif);
      font-size: 1.4rem;
      font-weight: 650;
      margin-bottom: 7px;
      letter-spacing: -0.02em;
      color: var(--ink);
    }

    .verify-box p { color: var(--ink-soft); font-size: 0.86rem; margin-bottom: 5px; }

    .verify-email {
      font-weight: 700;
      color: var(--water);
      word-break: break-word;
    }

    .inline-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .inline-actions .link-btn {
      text-decoration: none;
      border-bottom: 1px dashed rgba(37, 63, 53, 0.26);
      line-height: 1.35;
    }

    .inline-actions .link-btn:hover { border-bottom-color: rgba(37, 63, 53, 0.5); }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 860px) {
      .auth-layout { grid-template-columns: 1fr; }
      .bento-panel { position: static; order: 2; }
      .auth-panel  { order: 1; }
    }

    @media (max-width: 720px) {
      .container   { width: min(1180px, 100% - 24px); }
      .auth-card   { padding: 20px; border-radius: 16px; }
      .row-2       { grid-template-columns: 1fr; }
      .btn-row     { flex-direction: column; }
      .emoji-grid  { grid-template-columns: repeat(8, minmax(0, 1fr)); }
      .nav-island  { padding: 6px 8px 6px 10px; }
      .brand-name span { display: none; }
      .site-header { top: 10px; }
    }
  </style>
  <link rel="stylesheet" href="/theme.css" />
</head>
<body>

  <header class="site-header" id="site-header">
    <div class="nav-island">
      <a class="brand" href="/" aria-label="Pro Loco Rivalta sul Mincio">
        <span class="brand-mark">
          <img src="/img/favicon.png" alt="Logo Rivalta sul Mincio" width="42" height="42">
        </span>
        <span class="brand-name">
          <strong>Rivalta sul Mincio</strong>
          <span>Parco del Mincio &middot; Mantova</span>
        </span>
      </a>
      <div></div>
      <a href="/" class="nav-home-btn">&#8592; Home</a>
    </div>
  </header>

  <main class="page">
    <div class="container auth-layout">

      <!-- LEFT: Auth panel -->
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
              <a href="/" class="link-btn">Torna alla home</a>
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
              <h2>Completa l&rsquo;identita locale</h2>
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
                Finche l&rsquo;email non e verificata non puoi usare l&rsquo;account in modo operativo ne pubblicare contenuti.
              </p>
            </div>

            <div class="msg-slot" id="msg-verify"></div>

            <div class="btn-row">
              <button class="btn btn-primary" id="verify-to-login" type="button">Ho verificato, torno al login</button>
              <button class="btn btn-ghost" id="verify-to-register" type="button">Usa un&rsquo;altra email</button>
            </div>
          </section>

        </article>
      </section>

      <!-- RIGHT: Bento stats panel -->
      <aside class="bento-panel" aria-label="Community overview">
        <div class="bento-grid">

          <div class="bcard bcard-hero">
            <div class="hero-logo">
              <div class="logo-mark">
                <img src="/img/favicon.png" alt="Logo Rivalta sul Mincio" width="40" height="40">
              </div>
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
            <div class="bnum" style="font-size:26px;color:var(--marsh)">75 km</div>
            <div class="blabel">Lunghezza del Mincio</div>
          </div>

          <div class="bcard bcard-members">
            <div class="bnum" style="font-size:26px;color:var(--water)">14K ha</div>
            <div class="blabel">Area Parco del Mincio</div>
          </div>

          <div class="bcard bcard-likes">
            <div class="bnum" style="font-size:26px;color:#4a9e7c">200+</div>
            <div class="blabel">Specie ornitologiche</div>
          </div>

          <div class="bcard bcard-comuni">
            <div class="bnum" style="font-size:26px;color:var(--clay)">13</div>
            <div class="blabel">Comuni lungo il Mincio</div>
          </div>

          <div class="bcard bcard-cats">
            <div class="bnum" style="font-size:26px;color:var(--reed)">1984</div>
            <div class="blabel">Istituzione Parco</div>
          </div>

          <div class="bcard bcard-highlight">
            <div class="bnum">Riserva</div>
            <div class="blabel">Naturale<br>Regionale</div>
            <div class="bsub">Parco del Mincio</div>
          </div>

          <div class="bcard bcard-quote">
            <div class="quote-text">&ldquo;Dove il <em>Garda</em> incontra il <em>Po</em>, nasce una comunita.&rdquo;</div>
          </div>

        </div>
      </aside>

    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script src="supabase.config.js"></script>
  <script src="security.client.js"></script>
  <script>
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const byId = (id) => document.getElementById(id);

    const COMMUNITY_RULES_VERSION = '2026-04';
    const EMOJIS = ['\u{1F33F}', '\u{1F9A2}', '\u{1F30A}', '\u{1F3A3}', '\u{1F338}', '\u{1F98B}', '\u{1F33E}', '\u{1F33B}', '\u{1F9DC}', '\u{1F420}', '\u{1F343}', '\u{1F33C}', '\u{1F986}', '\u{1F4A7}', '⭐', '\u{1F319}'];
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
        window.location.href = "/";
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
  <!--PARTIAL:footer-->
</body>
</html>
