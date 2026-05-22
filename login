<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accedi | Rivalta sul Mincio</title>
  <meta name="theme-color" content="#ffffff" />
  <script>!function(){try{var p=JSON.parse(localStorage.getItem('rsm_prefs_v1'))||{},r=document.documentElement,s={sm:'14px',md:'16px',lg:'18px',xl:'20px'},t=p.theme;var ok=t==='chiaro'||t==='scuro'||t==='auto';t=ok?t:'chiaro';t=t==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'scuro':'chiaro'):t;r.dataset.theme=t;r.dataset.themePref=ok?p.theme:'chiaro';r.dataset.fontsize=p.fontsize||'md';r.style.fontSize=s[p.fontsize]||'16px';r.dataset.density=p.uiDensity||'comfortable';if(p.contrast)r.dataset.contrast='high';else delete r.dataset.contrast;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t==='scuro'?'#0a0c14':'#ffffff';}catch(e){}}();</script>

  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" media="print" onload="this.onload=null;this.media='all'" />
  <noscript><link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" /></noscript>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.onload=null;this.media='all'" />
  <noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" /></noscript>
  <link rel="stylesheet" href="/theme.css" />

  <style>
    body[data-page="login"] {
      position: relative;
      font-family: 'Syne', var(--rsm-font-sans);
      color: var(--rsm-text);
      overflow-x: hidden;
      background:
        radial-gradient(circle at 14% 18%, rgba(31, 191, 125, 0.16), transparent 30%),
        radial-gradient(circle at 86% 16%, rgba(74, 155, 255, 0.16), transparent 34%),
        radial-gradient(circle at 78% 76%, rgba(139, 92, 246, 0.14), transparent 36%),
        linear-gradient(180deg, var(--rsm-bg) 0%, var(--rsm-paper) 48%, var(--rsm-bg) 100%);
    }

    .rsm-login-page,
    .rsm-login-page *,
    .rsm-login-page *::before,
    .rsm-login-page *::after {
      box-sizing: border-box;
    }

    body[data-page="login"] button,
    body[data-page="login"] input,
    body[data-page="login"] select,
    body[data-page="login"] textarea {
      font: inherit;
    }

    body[data-page="login"]::before,
    body[data-page="login"]::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    body[data-page="login"]::before {
      opacity: 0.18;
      background-image:
        radial-gradient(circle at 1px 1px, rgba(11, 13, 20, 0.14) 0.6px, transparent 1.2px),
        radial-gradient(circle at 1px 1px, rgba(11, 13, 20, 0.08) 0.6px, transparent 1.2px);
      background-size: 24px 24px, 36px 36px;
      background-position: 0 0, 12px 14px;
      mix-blend-mode: multiply;
    }

    body[data-page="login"]::after {
      opacity: 0.9;
      background:
        radial-gradient(ellipse at 22% 24%, rgba(31, 191, 125, 0.14), transparent 42%),
        radial-gradient(ellipse at 74% 20%, rgba(74, 155, 255, 0.14), transparent 44%),
        radial-gradient(ellipse at 66% 78%, rgba(139, 92, 246, 0.10), transparent 46%);
      animation: rsm-login-aurora 26s ease-in-out infinite;
    }

    .rsm-login-page {
      position: relative;
      z-index: 1;
    }

    body[data-page="login"] .rsm-foot {
      margin-top: 0 !important;
      background:
        radial-gradient(ellipse at 14% -10%, rgba(102, 255, 214, 0.18), transparent 38%),
        radial-gradient(ellipse at 80% -8%, rgba(126, 188, 255, 0.22), transparent 42%),
        radial-gradient(ellipse at 100% 100%, rgba(196, 122, 255, 0.20), transparent 48%),
        linear-gradient(160deg, #051c2c 0%, #082649 50%, #2a1147 100%);
    }

    .rsm-login-hero {
      position: relative;
      min-height: 100dvh;
      padding: clamp(72px, 7vw, 104px) 0 clamp(18px, 2.4vw, 30px);
      overflow: hidden;
      isolation: isolate;
      display: flex;
      align-items: center;
    }

    .rsm-login-hero > .rsm-container {
      width: min(100% - 40px, 1460px);
      margin-block: auto;
    }

    .rsm-login-hero .rsm-hero__accent {
      position: absolute;
      width: 130%;
      height: 130%;
      top: -15%;
      left: -15%;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(ellipse at 18% 22%, rgba(46, 224, 170, 0.18), transparent 48%),
        radial-gradient(ellipse at 82% 78%, rgba(167, 119, 255, 0.18), transparent 48%),
        radial-gradient(ellipse at 50% 50%, rgba(86, 156, 255, 0.10), transparent 60%);
      animation: rsm-login-float 30s ease-in-out infinite;
    }

    .rsm-hero__layout.rsm-login-hero__layout {
      display: grid;
      grid-template-columns: minmax(0, 0.96fr) minmax(240px, 0.64fr) minmax(340px, 420px);
      align-items: stretch;
      gap: clamp(14px, 2vw, 22px);
    }

    .rsm-login-story {
      display: contents;
      min-width: 0;
    }

    .rsm-login-story,
    .rsm-login-copy,
    .rsm-login-support,
    .rsm-login-panel,
    .rsm-login-panel__card,
    .rsm-login-panel__card > *,
    .view,
    .rsm-login-form,
    .rsm-login-form .rsm-field,
    .input-with-action {
      min-width: 0;
    }

    .rsm-login-copy,
    .rsm-login-compass,
    .rsm-login-fact,
    .rsm-login-panel__card {
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }

    .rsm-login-copy::before,
    .rsm-login-compass::before,
    .rsm-login-panel__card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
      opacity: 0.8;
    }

    .rsm-login-copy,
    .rsm-login-compass,
    .rsm-login-panel__card {
      padding: clamp(18px, 2vw, 26px);
    }

    .rsm-login-copy:hover,
    .rsm-login-compass:hover,
    .rsm-login-fact:hover,
    .rsm-login-panel__card:hover {
      transform: none;
    }

    .rsm-login-copy {
      display: grid;
      grid-column: 1;
      grid-auto-rows: max-content;
      gap: 14px;
      align-content: start;
      height: 100%;
    }

    .rsm-login-copy > * {
      margin: 0;
    }

    .rsm-login-copy .rsm-edit-line {
      opacity: 1;
      transform: none;
      transition: none;
    }

    .rsm-login-kicker {
      font-family: var(--rsm-font-mono);
      color: var(--rsm-text-soft);
    }

    .rsm-login-kicker::before {
      display: none;
    }

    .rsm-login-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--rsm-emerald);
      box-shadow: 0 0 0 4px rgba(31, 191, 125, 0.18);
      animation: rsm-login-pulse 2.8s ease-in-out infinite;
    }

    .rsm-login-title {
      display: grid;
      gap: 0.05em;
      max-width: 8ch;
      font-family: var(--rsm-font-display);
      font-size: clamp(2.45rem, 4vw, 4.65rem);
      font-weight: 700;
      line-height: 0.93;
      letter-spacing: -0.05em;
    }

    .rsm-login-title em,
    .rsm-login-compass__head h2 em,
    .rsm-login-view__head h2 em {
      font-style: italic;
      font-family: var(--rsm-font-display);
      font-weight: 500;
      background: linear-gradient(95deg, var(--rsm-emerald) 0%, var(--rsm-azure) 50%, var(--rsm-violet) 100%);
      background-size: 220% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: rsm-login-grad-flow 9s ease-in-out infinite alternate;
    }

    .rsm-login-copy .rsm-lead {
      max-width: 48ch;
      font-family: inherit;
      font-size: clamp(0.96rem, 1vw, 1.08rem);
      line-height: 1.46;
      color: var(--rsm-text);
    }

    .rsm-login-copy .rsm-button-row {
      gap: 12px;
      margin-top: 0;
    }

    .rsm-hero__metrics.rsm-login-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 0;
      padding-top: 14px;
      border-top: 1px solid var(--rsm-line);
    }

    .rsm-metric {
      display: grid;
      gap: 6px;
    }

    .rsm-metric strong {
      display: block;
      font-family: var(--rsm-font-display);
      font-size: clamp(1.65rem, 2vw, 2.2rem);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--rsm-text-strong);
    }

    .rsm-metric span {
      display: block;
      font-family: var(--rsm-font-mono);
      font-size: var(--rsm-text-tiny);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--rsm-text-soft);
    }

    .rsm-login-support {
      grid-column: 2;
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-content: start;
      align-self: stretch;
      height: 100%;
    }

    .rsm-login-compass {
      display: grid;
      grid-auto-rows: max-content;
      gap: 14px;
      align-content: start;
      height: 100%;
    }

    .rsm-login-compass__head {
      margin-bottom: 0;
      max-width: none;
      gap: 10px;
    }

    .rsm-login-compass__head .rsm-h2 {
      font-family: var(--rsm-font-display);
      font-size: clamp(1.3rem, 1.45vw, 1.72rem);
      line-height: 1;
    }

    .rsm-login-compass__head .rsm-kicker {
      color: var(--rsm-text-soft);
    }

    .rsm-login-paths {
      display: grid;
      gap: 8px;
    }

    .rsm-login-path {
      display: grid;
      gap: 4px;
      width: 100%;
      min-height: 56px;
      padding: 16px 18px;
      border: 1px solid rgba(148, 163, 184, 0.34);
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(245, 248, 252, 0.92));
      color: #111827;
      text-align: left;
      cursor: pointer;
      box-shadow:
        0 10px 24px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.78);
      transition:
        transform 320ms var(--rsm-ease-spring),
        border-color 320ms var(--rsm-ease-out),
        box-shadow 320ms var(--rsm-ease-out),
        background 320ms var(--rsm-ease-out);
      -webkit-backdrop-filter: blur(16px) saturate(135%);
      backdrop-filter: blur(16px) saturate(135%);
    }

    .rsm-login-path strong {
      font-family: var(--rsm-font-display);
      font-size: 0.94rem;
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: #0f172a;
    }

    .rsm-login-path span {
      font-family: inherit;
      font-size: 0.84rem;
      color: #475569;
      line-height: 1.35;
    }

    .rsm-login-path:hover,
    .rsm-login-path[aria-pressed="true"] {
      border-color: rgba(59, 130, 246, 0.32);
    }

    .rsm-login-path:hover:not([aria-pressed="true"]) {
      transform: translateY(-2px);
      box-shadow:
        0 14px 32px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.88);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.96));
    }

    .rsm-login-path[aria-pressed="true"] {
      transform: translateY(1px);
      box-shadow:
        inset 0 2px 6px rgba(15, 23, 42, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 0 0 2px rgba(59, 130, 246, 0.14);
      background: linear-gradient(180deg, rgba(243, 247, 255, 0.98), rgba(236, 242, 250, 0.96));
    }

    .rsm-login-path.rsm-login-path--brand,
    .rsm-login-path.rsm-login-path--ghost {
      padding: 16px 18px;
      border-radius: 999px;
      gap: 6px;
      box-shadow:
        0 10px 24px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.78);
      transition:
        transform 320ms var(--rsm-ease-spring),
        box-shadow 320ms var(--rsm-ease-out),
        background 320ms var(--rsm-ease-out),
        border-color 320ms var(--rsm-ease-out);
    }

    .rsm-login-path.rsm-login-path--brand strong,
    .rsm-login-path.rsm-login-path--ghost strong {
      font-family: 'Syne', 'Cabinet Grotesk', system-ui, sans-serif;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.005em;
      line-height: 1.02;
    }

    .rsm-login-path.rsm-login-path--brand span,
    .rsm-login-path.rsm-login-path--ghost span {
      font-family: 'Syne', var(--rsm-font-sans);
      font-size: 0.82rem;
      line-height: 1.35;
    }

    .rsm-login-path.rsm-login-path--brand {
      border-color: rgba(148, 163, 184, 0.34);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 247, 251, 0.94));
      color: #111827;
      text-shadow: none;
      box-shadow:
        0 10px 24px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.78);
    }

    .rsm-login-path.rsm-login-path--brand strong {
      color: #0f172a;
    }

    .rsm-login-path.rsm-login-path--brand span {
      color: #475569;
    }

    .rsm-login-path.rsm-login-path--brand:hover:not([aria-pressed="true"]) {
      transform: translateY(-2px);
      border-color: rgba(59, 130, 246, 0.32);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(247, 250, 255, 0.97));
      box-shadow:
        0 14px 32px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.88);
    }

    .rsm-login-path.rsm-login-path--brand[aria-pressed="true"] {
      transform: translateY(1px);
      border-color: rgba(59, 130, 246, 0.36);
      background: linear-gradient(180deg, rgba(242, 246, 255, 0.99), rgba(233, 240, 250, 0.97));
      box-shadow:
        inset 0 2px 6px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.92),
        0 0 0 2px rgba(59, 130, 246, 0.14);
    }

    .rsm-login-path.rsm-login-path--ghost {
      border-color: rgba(148, 163, 184, 0.34);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 247, 251, 0.94));
      color: #111827;
      backdrop-filter: blur(16px) saturate(135%);
      -webkit-backdrop-filter: blur(16px) saturate(135%);
      box-shadow:
        0 10px 24px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.78);
    }

    .rsm-login-path.rsm-login-path--ghost strong {
      color: #0f172a;
    }

    .rsm-login-path.rsm-login-path--ghost span {
      color: #475569;
    }

    .rsm-login-path.rsm-login-path--ghost:hover:not([aria-pressed="true"]) {
      transform: translateY(-2px);
      border-color: rgba(59, 130, 246, 0.32);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(247, 250, 255, 0.97));
      box-shadow:
        0 14px 32px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.88);
    }

    .rsm-login-path.rsm-login-path--ghost[aria-pressed="true"] {
      transform: translateY(1px);
      border-color: rgba(59, 130, 246, 0.36);
      background: linear-gradient(180deg, rgba(242, 246, 255, 0.99), rgba(233, 240, 250, 0.97));
      box-shadow:
        inset 0 2px 6px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.92),
        0 0 0 2px rgba(59, 130, 246, 0.14);
    }

    .rsm-login-showcase {
      display: none;
      gap: 10px;
    }

    .rsm-hero__media.rsm-login-media {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 2.7;
      min-height: 156px;
      max-width: none;
      max-height: none;
      margin-inline: 0;
      border-radius: var(--rsm-r-3xl);
      overflow: hidden;
      box-shadow: var(--rsm-sh-xl);
      isolation: isolate;
    }

    .rsm-hero__media.rsm-login-media::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.32);
      pointer-events: none;
    }

    .rsm-login-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .rsm-login-media__veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(8, 11, 18, 0.06), rgba(8, 11, 18, 0.7));
    }

    .rsm-login-media__content {
      position: absolute;
      inset: auto 0 0 0;
      display: grid;
      gap: 4px;
      padding: 14px;
      color: var(--rsm-text-on-dark);
    }

    .rsm-login-media__content .rsm-kicker {
      color: var(--rsm-text-on-dark-dim);
    }

    .rsm-login-media__content strong {
      font-family: var(--rsm-font-display);
      font-size: 1.05rem;
      line-height: 1.04;
      letter-spacing: -0.04em;
    }

    .rsm-login-media__content span {
      font-size: 0.82rem;
      color: var(--rsm-text-on-dark-soft);
      line-height: 1.4;
    }

    .rsm-login-facts {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .rsm-login-fact {
      display: grid;
      gap: 6px;
      min-height: 100%;
      padding: 14px;
    }

    .rsm-login-fact .rsm-kicker {
      color: var(--rsm-text-soft);
    }

    .rsm-login-fact strong {
      font-family: var(--rsm-font-display);
      font-size: 0.92rem;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: var(--rsm-text-strong);
    }

    .rsm-login-fact p {
      margin: 0;
      font-size: 0.82rem;
      color: var(--rsm-text-soft);
      line-height: 1.35;
    }

    .rsm-login-panel {
      grid-column: 3;
      position: static;
      top: auto;
      align-self: stretch;
      height: 100%;
    }

    .rsm-login-panel__card {
      display: grid;
      grid-auto-rows: max-content;
      gap: 16px;
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: calc(100dvh - 144px);
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      align-content: start;
      justify-items: stretch;
      scrollbar-gutter: stable;
      box-shadow: 0 24px 72px rgba(11, 13, 20, 0.16), var(--rsm-sh-md);
    }

    .rsm-login-panel__top {
      display: grid;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--rsm-line);
    }

    .rsm-login-panel__eyebrow {
      color: var(--rsm-text-soft);
    }

    .rsm-login-panel__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .view {
      display: none;
      gap: 14px;
    }

    .view.is-active {
      display: grid;
      animation: rsm-login-view-in var(--rsm-dur-base) var(--rsm-ease-out);
    }

    .rsm-login-view.is-active {
      animation-name: rsm-login-view-fade;
    }

    .rsm-login-view__head {
      display: grid;
      gap: 8px;
    }

    .rsm-login-view__head .rsm-h1 {
      font-family: var(--rsm-font-display);
      font-size: clamp(1.45rem, 1.8vw, 2rem);
      line-height: 0.98;
    }

    .rsm-login-view__head .rsm-body,
    .rsm-login-view__head p {
      margin: 0;
      color: var(--rsm-text-soft);
    }

    .msg-slot {
      min-height: 0;
    }

    .notice {
      padding: 10px 12px;
      border: 1px solid var(--rsm-line);
      border-radius: var(--rsm-r-lg);
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.5;
      box-shadow: var(--rsm-sh-sm);
    }

    .notice.info {
      background: rgba(74, 155, 255, 0.08);
      border-color: rgba(74, 155, 255, 0.18);
      color: #1f4f99;
    }

    .notice.success {
      background: rgba(31, 191, 125, 0.10);
      border-color: rgba(31, 191, 125, 0.22);
      color: #0c6c47;
    }

    .notice.error {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.18);
      color: #a12f2f;
    }

    .rsm-login-form {
      display: grid;
      gap: 12px;
    }

    .rsm-login-form .rsm-input,
    .rsm-login-form .rsm-select,
    .rsm-login-form .rsm-textarea {
      width: 100%;
      max-width: 100%;
    }

    .rsm-login-form .rsm-field,
    .rsm-login-form .group-label {
      display: grid;
      gap: var(--rsm-s-2);
    }

    .rsm-login-form .group-label {
      margin: 0;
      font-family: var(--rsm-font-mono);
      font-size: var(--rsm-text-eyebrow);
      font-weight: 500;
      letter-spacing: var(--rsm-tracking-wide);
      text-transform: uppercase;
      color: var(--rsm-text-soft);
    }

    .rsm-login-form small {
      color: var(--rsm-text-soft);
      font-size: var(--rsm-text-small);
      line-height: 1.45;
    }

    .rsm-login-view--register2 {
      gap: 16px;
    }

    .rsm-login-view--register2 .rsm-login-view__head {
      gap: 6px;
    }

    .rsm-login-view--register2 .rsm-login-view__head .rsm-h1 {
      font-size: clamp(1.28rem, 1.5vw, 1.78rem);
    }

    .rsm-login-view--register2 .rsm-body {
      font-size: 0.92rem;
    }

    .rsm-login-view--register2 .email-pill {
      min-height: 30px;
      padding: 0 10px;
    }

    .rsm-login-view--register2 .identity-preview {
      padding: 12px 14px;
    }

    /* Form: colonna unica, un campo per riga */
    .rsm-reg2-layout {
      display: grid;
      gap: 16px;
    }

    .rsm-reg2-layout .rsm-button-row {
      margin-top: 6px;
    }

    /* Emoji + colore affiancati — unica eccezione 2 colonne */
    .rsm-reg2-avatar-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .rsm-login-view--register2 .group-label {
      font-size: 0.72rem;
      margin-bottom: 6px;
    }

    .rsm-login-view--register2 .rsm-field small {
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .rsm-login-view--register2 .emoji-grid label {
      min-height: 42px;
      font-size: 1.2rem;
    }

    .rsm-login-view--register2 .color-grid label {
      min-height: 36px;
    }

    .rsm-login-view--register2 .check-wrap {
      padding: 12px 14px;
    }

    .rsm-login-view--register2 .check-wrap span {
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .rsm-login-view--register2 .check-wrap a {
      color: var(--rsm-text-strong);
      text-decoration: underline;
      text-underline-offset: 0.16em;
      font-weight: 700;
    }

    .row-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .input-with-action {
      position: relative;
    }

    .input-with-action .rsm-input {
      padding-right: 82px;
    }

    .input-action {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      min-height: 34px;
      padding: 0 10px;
      border: 1px solid var(--rsm-line);
      border-radius: var(--rsm-r-pill);
      background: var(--rsm-glass-strong);
      color: var(--rsm-text-strong);
      font-family: var(--rsm-font-mono);
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        transform var(--rsm-dur-fast) var(--rsm-ease-out),
        border-color var(--rsm-dur-fast) var(--rsm-ease-out),
        background var(--rsm-dur-fast) var(--rsm-ease-out);
      -webkit-backdrop-filter: var(--rsm-blur-sm);
      backdrop-filter: var(--rsm-blur-sm);
    }

    .input-action:hover {
      transform: translateY(calc(-50% - 1px));
      border-color: var(--rsm-line-3);
      background: rgba(255,255,255,0.94);
    }

    .rsm-login-button-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 0;
    }

    .rsm-login-button-row--hero-match {
      gap: var(--rsm-s-3);
    }

    .rsm-login-button-row .rsm-btn {
      width: 100%;
      min-height: 46px;
      padding: 6px 6px 6px 16px;
    }

    .rsm-login-button-row--hero-match .rsm-btn {
      min-height: 56px !important;
      padding: 0 26px !important;
      gap: 0 !important;
      font-family: 'Syne', 'Cabinet Grotesk', system-ui, sans-serif !important;
      font-weight: 700 !important;
      letter-spacing: -0.005em !important;
      border-radius: 999px !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      background: rgba(255, 255, 255, 0.12) !important;
      color: var(--rsm-text-strong) !important;
      backdrop-filter: blur(16px) saturate(135%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(135%) !important;
      box-shadow:
        0 18px 38px rgba(11, 13, 20, 0.16),
        0 2px 6px rgba(11, 13, 20, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.26) !important;
      transition:
        transform 320ms var(--rsm-ease-spring),
        box-shadow 320ms var(--rsm-ease-out),
        background 320ms var(--rsm-ease-out) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow:
        0 24px 54px rgba(11, 13, 20, 0.18),
        0 10px 22px rgba(74, 155, 255, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.32) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn:active {
      transform: translateY(-1px) scale(0.98) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn--brand {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06)) padding-box,
        linear-gradient(120deg, rgba(47, 224, 188, 0.95) 0%, rgba(74, 155, 255, 0.95) 52%, rgba(90, 129, 255, 0.95) 100%) border-box !important;
      color: #07111f !important;
      text-shadow: none !important;
      box-shadow:
        0 18px 42px rgba(74, 155, 255, 0.24),
        0 10px 24px rgba(31, 191, 125, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.14),
        inset 0 1px 0 rgba(255, 255, 255, 0.34) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn--brand:hover {
      box-shadow:
        0 26px 58px rgba(74, 155, 255, 0.28),
        0 14px 30px rgba(31, 191, 125, 0.16),
        0 0 0 1px rgba(255, 255, 255, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.42) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn--ghost {
      background: var(--rsm-panel-dark) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      color: #ffffff !important;
      backdrop-filter: blur(16px) saturate(135%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(135%) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 16px 36px rgba(11,13,20,0.18) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn--ghost:hover {
      background: linear-gradient(145deg, rgba(14, 18, 30, 0.98), rgba(28, 33, 50, 0.96)) !important;
      border-color: rgba(255,255,255,0.12) !important;
      box-shadow:
        0 24px 56px rgba(11,13,20,0.22),
        inset 0 1px 0 rgba(255,255,255,0.12) !important;
    }

    .rsm-login-button-row--hero-match .rsm-btn .rsm-btn-icon {
      display: none !important;
    }

    .rsm-login-page .rsm-btn,
    .rsm-login-page .rsm-login-link {
      min-height: 56px;
      padding: 0 26px;
      border-radius: 999px;
      font-family: 'Syne', var(--rsm-font-sans);
      font-weight: 700;
      letter-spacing: -0.005em;
      text-decoration: none;
      backdrop-filter: blur(16px) saturate(135%);
      -webkit-backdrop-filter: blur(16px) saturate(135%);
      box-shadow:
        0 18px 38px rgba(11, 13, 20, 0.16),
        0 2px 6px rgba(11, 13, 20, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.26);
      transition:
        transform 320ms var(--rsm-ease-spring),
        box-shadow 320ms var(--rsm-ease-out),
        background 320ms var(--rsm-ease-out);
    }

    .rsm-login-page .rsm-btn {
      gap: 0;
    }

    .rsm-login-page [data-view-link][aria-pressed="true"] {
      transform: none;
    }

    .rsm-login-page .rsm-btn[data-view-link][aria-pressed="true"] {
      box-shadow:
        0 0 0 2px rgba(74, 155, 255, 0.16),
        0 18px 38px rgba(11, 13, 20, 0.16),
        0 2px 6px rgba(11, 13, 20, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.26);
    }

    .rsm-login-page .rsm-btn[data-view-link][aria-pressed="true"]:hover,
    .rsm-login-page .rsm-btn[data-view-link][aria-pressed="true"]:active {
      transform: none;
    }

    .rsm-login-page .rsm-btn[data-view-link][aria-pressed="true"] .rsm-btn-icon {
      transform: none;
    }

    .rsm-login-page .rsm-btn > span:not(.rsm-btn-icon),
    .rsm-login-page .rsm-login-link {
      position: relative;
      z-index: 1;
    }

    .rsm-login-page .rsm-btn .rsm-btn-icon {
      display: none !important;
    }

    .rsm-login-page .rsm-btn--brand {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06)) padding-box,
        linear-gradient(120deg, rgba(47, 224, 188, 0.95) 0%, rgba(74, 155, 255, 0.95) 52%, rgba(90, 129, 255, 0.95) 100%) border-box;
      color: #07111f;
      text-shadow: none;
      box-shadow:
        0 18px 42px rgba(74, 155, 255, 0.24),
        0 10px 24px rgba(31, 191, 125, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.14),
        inset 0 1px 0 rgba(255, 255, 255, 0.34);
    }

    .rsm-login-page .rsm-btn--brand:hover {
      transform: translateY(-2px);
      box-shadow:
        0 26px 58px rgba(74, 155, 255, 0.28),
        0 14px 30px rgba(31, 191, 125, 0.16),
        0 0 0 1px rgba(255, 255, 255, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.42);
    }

    .rsm-login-page .rsm-btn--ghost,
    .rsm-login-page .rsm-login-link {
      background: var(--rsm-panel-dark);
      border-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 16px 36px rgba(11,13,20,0.18);
    }

    .rsm-login-page .rsm-btn--ghost:hover,
    .rsm-login-page .rsm-login-link:hover {
      transform: translateY(-2px);
      background: linear-gradient(145deg, rgba(14, 18, 30, 0.98), rgba(28, 33, 50, 0.96));
      border-color: rgba(255,255,255,0.12);
      box-shadow:
        0 24px 56px rgba(11,13,20,0.22),
        inset 0 1px 0 rgba(255,255,255,0.12);
    }

    .rsm-login-page .rsm-login-link--text {
      display: inline-block;
      width: auto;
      min-height: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: none;
      box-shadow: none;
      color: var(--rsm-text-strong);
      font: inherit;
      font-weight: inherit;
      letter-spacing: inherit;
      text-decoration-line: underline;
      text-decoration-color: currentColor;
      text-decoration-thickness: 1.5px;
      text-underline-offset: 0.18em;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }

    .rsm-login-page .rsm-login-link--text:hover,
    .rsm-login-page .rsm-login-link--text:active {
      transform: none;
      background: none;
      box-shadow: none;
      border: 0;
      color: var(--rsm-azure);
      text-decoration-thickness: 2px;
    }

    .rsm-login-page .rsm-login-link--text:focus-visible {
      outline: 2px solid var(--rsm-azure);
      outline-offset: 3px;
    }

    .rsm-login-page .rsm-btn--ghost {
      color: var(--rsm-text-on-dark);
      background: var(--rsm-panel-dark);
      border-color: rgba(255,255,255,0.08);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 36px rgba(11,13,20,0.18);
    }

    .rsm-login-page .rsm-btn--ghost .rsm-btn-icon {
      color: var(--rsm-ink);
      background: rgba(255,255,255,0.92);
    }

    .rsm-login-page .rsm-btn--ghost:hover {
      color: var(--rsm-text-on-dark);
      background: linear-gradient(145deg, rgba(14, 18, 30, 0.98), rgba(28, 33, 50, 0.96));
      box-shadow: 0 24px 56px rgba(11,13,20,0.22), inset 0 1px 0 rgba(255,255,255,0.12);
    }

    .rsm-login-button-row .rsm-btn .rsm-btn-icon,
    .rsm-login-copy .rsm-btn .rsm-btn-icon {
      width: 32px;
      height: 32px;
    }


    .rsm-login-inline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.9rem;
    }

    .rsm-login-link {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex: 0 0 auto;
      width: fit-content;
    }

    .rsm-login-steps {
      display: flex;
      gap: 8px;
    }

    .rsm-login-steps span {
      width: 38px;
      height: 6px;
      border-radius: var(--rsm-r-pill);
      background: var(--rsm-surface-2);
    }

    .rsm-login-steps span.active {
      background: var(--rsm-accent-grad-strong);
      box-shadow: var(--rsm-sh-glow-azure);
    }

    .email-pill {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      min-height: 34px;
      padding: 0 12px;
      border-radius: var(--rsm-r-pill);
      border: 1px solid var(--rsm-line);
      background: var(--rsm-glass);
      color: var(--rsm-text-strong);
      font-family: var(--rsm-font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .identity-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid var(--rsm-line);
      border-radius: var(--rsm-r-2xl);
      background: var(--rsm-glass);
      box-shadow: var(--rsm-sh-sm);
      -webkit-backdrop-filter: var(--rsm-blur-sm);
      backdrop-filter: var(--rsm-blur-sm);
    }

    .preview-avatar {
      width: 52px;
      height: 52px;
      flex: 0 0 52px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      font-size: 1.6rem;
      color: #ffffff;
      box-shadow: var(--rsm-sh-md);
      background: #1f6f8b;
    }

    .preview-name {
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--rsm-text-strong);
    }

    .preview-meta {
      margin-top: 4px;
      font-size: 0.86rem;
      color: var(--rsm-text-soft);
      line-height: 1.45;
    }

    .emoji-grid,
    .color-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    .emoji-grid input,
    .color-grid input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .emoji-grid label,
    .color-grid label {
      cursor: pointer;
      transition:
        transform var(--rsm-dur-fast) var(--rsm-ease-out),
        box-shadow var(--rsm-dur-fast) var(--rsm-ease-out),
        border-color var(--rsm-dur-fast) var(--rsm-ease-out),
        background var(--rsm-dur-fast) var(--rsm-ease-out);
    }

    .emoji-grid label {
      min-height: 42px;
      display: grid;
      place-items: center;
      border: 1px solid var(--rsm-line);
      border-radius: 18px;
      background: var(--rsm-glass);
      font-size: 1.3rem;
      box-shadow: var(--rsm-sh-sm);
      -webkit-backdrop-filter: var(--rsm-blur-sm);
      backdrop-filter: var(--rsm-blur-sm);
    }

    .color-grid label {
      min-height: 36px;
      border-radius: 14px;
      border: 2px solid transparent;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.38), var(--rsm-sh-sm);
    }

    .emoji-grid input:checked + label,
    .color-grid input:checked + label {
      transform: translateY(-2px);
      border-color: rgba(74, 155, 255, 0.36);
      box-shadow: var(--rsm-sh-md);
    }

    .check-wrap {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid var(--rsm-line);
      border-radius: var(--rsm-r-xl);
      background: var(--rsm-glass);
      box-shadow: var(--rsm-sh-sm);
      -webkit-backdrop-filter: var(--rsm-blur-sm);
      backdrop-filter: var(--rsm-blur-sm);
    }

    .check-wrap input {
      width: 18px;
      height: 18px;
      margin-top: 3px;
      flex: 0 0 18px;
      accent-color: var(--rsm-azure);
    }

    .check-wrap span {
      line-height: 1.55;
      color: var(--rsm-text);
    }

    .check-wrap strong {
      color: var(--rsm-text-strong);
    }

    .verify-box {
      display: grid;
      gap: 10px;
      padding: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: var(--rsm-r-2xl);
      background: var(--rsm-panel-dark);
      color: var(--rsm-text-on-dark);
      box-shadow: var(--rsm-sh-lg);
    }

    .verify-icon {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: rgba(255,255,255,0.12);
      font-size: 1.25rem;
    }

    .verify-box h3 {
      margin: 0;
      font-family: var(--rsm-font-display);
      font-size: 1.2rem;
      line-height: 1.02;
      letter-spacing: -0.04em;
    }

    .verify-box p {
      margin: 0;
      font-size: 0.88rem;
      color: var(--rsm-text-on-dark-soft);
      line-height: 1.45;
    }

    .verify-email {
      color: #ffffff;
      font-weight: 700;
    }

    .rsm-edit-line {
      opacity: 0;
      transform: translateY(14px);
      transition:
        opacity var(--rsm-dur-slow) var(--rsm-ease-out),
        transform var(--rsm-dur-slow) var(--rsm-ease-out);
    }

    .rsm-display-1 .rsm-edit-line {
      display: block;
    }

    .rsm-hero__main.is-visible .rsm-edit-line:nth-child(1),
    .rsm-login-copy.is-visible .rsm-edit-line:nth-child(1) { transition-delay: 80ms; }
    .rsm-hero__main.is-visible .rsm-edit-line:nth-child(2),
    .rsm-login-copy.is-visible .rsm-edit-line:nth-child(2) { transition-delay: 180ms; }
    .rsm-hero__main.is-visible .rsm-edit-line:nth-child(3),
    .rsm-login-copy.is-visible .rsm-edit-line:nth-child(3) { transition-delay: 280ms; }
    .rsm-hero__main.is-visible .rsm-edit-line:nth-child(4),
    .rsm-login-copy.is-visible .rsm-edit-line:nth-child(4) { transition-delay: 380ms; }
    .rsm-hero__main.is-visible .rsm-edit-line,
    .rsm-login-copy.is-visible .rsm-edit-line {
      opacity: 1;
      transform: translateY(0);
    }

    [data-reveal] {
      opacity: 0;
      transform: translateY(24px);
      transition:
        opacity var(--rsm-dur-slow) var(--rsm-ease-out),
        transform var(--rsm-dur-slow) var(--rsm-ease-out);
    }

    [data-reveal].is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    @keyframes rsm-login-view-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes rsm-login-view-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes rsm-login-aurora {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(1.5%, -1.5%, 0) scale(1.05); }
    }

    @keyframes rsm-login-float {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(2%, -2%, 0) scale(1.03); }
    }

    @keyframes rsm-login-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px rgba(31, 191, 125, 0.18); }
      50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(31, 191, 125, 0.08); }
    }

    @keyframes rsm-login-grad-flow {
      from { background-position: 0% 50%; }
      to { background-position: 100% 50%; }
    }

    html[data-theme="scuro"] body[data-page="login"] {
      background:
        radial-gradient(circle at 14% 18%, rgba(31, 191, 125, 0.12), transparent 30%),
        radial-gradient(circle at 86% 16%, rgba(74, 155, 255, 0.12), transparent 34%),
        radial-gradient(circle at 78% 76%, rgba(139, 92, 246, 0.10), transparent 36%),
        linear-gradient(180deg, #090c15 0%, #0f1320 48%, #090c15 100%);
    }

    html[data-theme="scuro"] body[data-page="login"]::before {
      opacity: 0.22;
      mix-blend-mode: screen;
    }

    html[data-theme="scuro"] .notice.info {
      background: rgba(74, 155, 255, 0.16);
      border-color: rgba(74, 155, 255, 0.24);
      color: #c2dcff;
    }

    html[data-theme="scuro"] .notice.success {
      background: rgba(31, 191, 125, 0.16);
      border-color: rgba(31, 191, 125, 0.26);
      color: #b8edd2;
    }

    html[data-theme="scuro"] .notice.error {
      background: rgba(239, 68, 68, 0.16);
      border-color: rgba(239, 68, 68, 0.24);
      color: #fecaca;
    }

    html[data-theme="scuro"] .input-action:hover {
      background: rgba(32, 36, 52, 0.96);
    }

    html[data-theme="scuro"] .rsm-login-media__veil {
      background: linear-gradient(180deg, rgba(7, 9, 16, 0.08), rgba(7, 9, 16, 0.82));
    }

    html[data-density="compact"] body[data-page="login"] .rsm-login-copy,
    html[data-density="compact"] body[data-page="login"] .rsm-login-compass,
    html[data-density="compact"] body[data-page="login"] .rsm-login-panel__card {
      padding: 22px;
    }

    html[data-density="compact"] body[data-page="login"] .rsm-login-fact {
      padding: 18px;
    }

    @media (min-width: 1101px) and (max-height: 760px) {
      .rsm-login-hero {
        min-height: 100dvh;
        padding-top: 56px;
        padding-bottom: 12px;
      }

      .rsm-login-copy,
      .rsm-login-compass,
      .rsm-login-panel__card {
        padding: 16px;
      }

      .rsm-login-title {
        font-size: clamp(2.2rem, 3.3vw, 3.7rem);
      }

      .rsm-login-copy .rsm-lead {
        font-size: 0.92rem;
      }

      .rsm-hero__media.rsm-login-media {
        min-height: 136px;
      }
    }

    @media (max-width: 1100px) {
      .rsm-hero__layout.rsm-login-hero__layout,
      .rsm-login-support {
        grid-template-columns: 1fr;
      }

      .rsm-login-panel {
        grid-column: 1;
        grid-row: 2;
      }

      .rsm-login-support {
        grid-column: 1;
        grid-row: 3;
      }

      .rsm-login-copy {
        grid-column: 1;
        grid-row: 1;
      }

      .rsm-login-hero {
        min-height: auto;
        display: block;
        padding: clamp(92px, 14vw, 112px) 0 28px;
      }

      .rsm-login-panel__card {
        max-height: none;
        overflow: visible;
      }
    }

    @media (max-width: 780px) {
      .rsm-login-story {
        display: none;
      }

      .rsm-login-support {
        grid-row: 2;
      }

      .rsm-login-panel {
        grid-row: 1;
      }

      .rsm-login-hero__layout {
        grid-template-columns: 1fr;
      }

      .rsm-reg2-avatar-row {
        grid-template-columns: 1fr;
      }

      .rsm-login-copy,
      .rsm-login-support,
      .rsm-login-panel {
        order: 0;
      }
    }

    @media (max-width: 780px) {
      .rsm-hero__metrics.rsm-login-metrics,
      .rsm-login-facts,
      .row-2,
      .rsm-reg2-avatar-row {
        grid-template-columns: 1fr;
      }

      .emoji-grid,
      .color-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @media (max-width: 600px) {
      .rsm-login-view--register2 {
        gap: 8px;
      }

      .rsm-login-view--register2 .rsm-login-view__head .rsm-h1 {
        font-size: clamp(1.16rem, 4.2vw, 1.5rem);
      }

      .rsm-login-view--register2 .rsm-body,
      .rsm-login-view--register2 .rsm-field small,
      .rsm-login-view--register2 .check-wrap span {
        font-size: 0.8rem;
      }

      .rsm-login-view--register2 .rsm-login-form {
        gap: 8px;
      }

      .rsm-login-view--register2 .emoji-grid label {
        min-height: 34px;
        font-size: 1rem;
      }

      .rsm-login-view--register2 .color-grid label {
        min-height: 30px;
      }

      .rsm-login-view--register2 .rsm-login-button-row .rsm-btn {
        min-height: 48px;
      }

      .rsm-login-copy,
      .rsm-login-compass,
      .rsm-login-panel__card,
      .rsm-login-fact {
        padding: 22px;
      }

      .rsm-login-title {
        max-width: none;
      }

      .rsm-login-path {
        padding: 14px 16px;
      }

      .rsm-login-button-row,
      .rsm-login-inline,
      .rsm-button-row {
        flex-direction: column;
        align-items: stretch;
      }

      .rsm-login-inline {
        align-items: flex-start;
      }

      .rsm-login-button-row .rsm-btn {
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body[data-page="login"]::after,
      .rsm-login-hero .rsm-hero__accent,
      .rsm-login-pulse,
      .rsm-login-title em,
      .rsm-login-compass__head h2 em,
      .rsm-login-view__head h2 em {
        animation: none !important;
      }

      [data-reveal],
      .rsm-edit-line,
      .view.is-active,
      .rsm-login-path,
      .rsm-btn,
      .input-action,
      .emoji-grid label,
      .color-grid label {
        transition: none !important;
      }

      [data-reveal],
      .rsm-edit-line {
        opacity: 1 !important;
        transform: none !important;
      }
    }

    .c1 { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--bs-primary, #06c); }
    .c2 { color: #555; font-size: .9rem; }
    .ipzs-validator { color: #d9364f; font-size: .8rem; min-height: 1.2em; }
    .view { display: none; }
    .view.is-active { display: block; }
  </style>
</head>
<body data-page="login">

<!--PARTIAL:nav-->

    <main id="main" class="container rsm-page">
  <div class="row">
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
    <div class="col">
      <div class="row">
        <div id="title" class="mb-4 col">
          <p class="c1">
            <strong>ACCESSO · RIVALTA SUL MINCIO</strong>
          </p>
          <h1>Accedi al sito</h1>
        </div>
      </div>
    </div>
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
  </div>

  <div class="row">
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
    <div class="col mx-0 mx-sm-n4">
      <div class="card-wrapper card-space">
        <div class="card card-bg card-bg-small-none card-big py-0 mx-0 mx-md-1">
          <div class="card-body p-0 p-sm-4">
            <div class="row">
              <div class="col-12">

                <!-- LOGIN -->
                <section class="view is-active" id="view-login">
                  <h2>Entra con le tue credenziali</h2>

                  <div id="msg-login" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"><br><br></div>
                  </div>

                  <div class="mt-3">
                    <form method="POST" action="#" id="loginUP" novalidate>
                      <div class="form-row">
                        <div class="form-group col mb-5">
                          <div class="input-group">
                            <label for="login-email" class="sr-only active" style="transition: none;">Email</label>
                            <input type="email" class="form-control" id="login-email" name="username" placeholder="Email" value="" autocomplete="email" tabindex="1">
                          </div>
                          <div class="ipzs-validator" id="usernameError">&nbsp;</div>
                        </div>
                      </div>
                      <div class="form-row">
                        <div class="form-group col mb-2">
                          <div class="input-group">
                            <label for="login-password" class="sr-only active" style="transition: none;">Password</label>
                            <input type="password" class="form-control input-password" id="login-password" name="password" placeholder="Password" value="" autocomplete="current-password" tabindex="2">
                            <span class="password-icon" aria-hidden="true">
                              <svg class="password-icon-visible icon icon-primary icon-sm d-none"><use xlink:href="/vendor/bootstrap-italia/svg/sprites.svg#it-password-visible"></use></svg>
                              <svg class="password-icon-invisible icon icon-primary icon-sm"><use xlink:href="/vendor/bootstrap-italia/svg/sprites.svg#it-password-invisible"></use></svg>
                            </span>
                          </div>
                          <div class="ipzs-validator" id="passwordError">&nbsp;</div>
                        </div>
                      </div>
                      <div class="mt-1 pb-1">
                        <p class="c2">Hai dimenticato la password? <strong><a href="#" id="login-to-forgot" class="text-nowrap">Richiedine una nuova.</a></strong></p>
                      </div>
                      <div class="row buttons mt-4 pb-3">
                        <div class="col-12 col-md-5 text-center mb-3 pr-md-3">
                          <a href="/" class="btn btn-outline-primary w-100 text-nowrap">Annulla</a>
                        </div>
                        <div class="col-12 col-md-7 text-center">
                          <button type="submit" class="btn btn-primary w-100" id="btn-login" data-default-label="Procedi" data-loading-label="Accesso in corso..."><span data-btn-label>Procedi</span></button>
                        </div>
                      </div>
                    </form>
                  </div>
                </section>

                <!-- FORGOT -->
                <section class="view" id="view-forgot">
                  <h2>Reimposta la password</h2>
                  <p class="c2">Ti inviamo una email con il link di reset.</p>

                  <div id="msg-forgot" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"></div>
                  </div>

                  <div class="mt-3">
                    <form id="form-forgot" novalidate>
                      <div class="form-row">
                        <div class="form-group col mb-5">
                          <div class="input-group">
                            <label for="forgot-email" class="sr-only active" style="transition: none;">Email</label>
                            <input type="email" class="form-control" id="forgot-email" placeholder="Email" autocomplete="email" required />
                          </div>
                        </div>
                      </div>
                      <div class="row buttons mt-4 pb-3">
                        <div class="col-12 col-md-5 text-center mb-3 pr-md-3">
                          <button type="button" id="forgot-back-login" class="btn btn-outline-primary w-100 text-nowrap">Annulla</button>
                        </div>
                        <div class="col-12 col-md-7 text-center">
                          <button type="submit" class="btn btn-primary w-100" id="btn-forgot" data-default-label="Invia email reset" data-loading-label="Invio in corso..."><span data-btn-label>Invia email reset</span></button>
                        </div>
                      </div>
                    </form>
                  </div>
                </section>

                <!-- VERIFY -->
                <section class="view" id="view-verify">
                  <h2>Controlla la tua email</h2>

                  <div id="msg-verify" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"></div>
                  </div>

                  <div class="callout note">
                    <div class="callout-title">Link di conferma inviato</div>
                    <p>Abbiamo inviato un link di conferma a: <strong id="verify-email-target">la tua email</strong></p>
                    <p class="mb-0">Finché l'email non è verificata non puoi usare l'account in modo operativo né pubblicare contenuti.</p>
                  </div>
                  <div class="row buttons mt-4 pb-3">
                    <div class="col-12 col-md-7 text-center">
                      <button type="button" id="verify-to-login" class="btn btn-primary w-100 text-nowrap"><span data-btn-label>Ho verificato, torno al login</span></button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
  </div>

</main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script src="supabase.config.js"></script>
  <script src="security.client.js"></script>
  <script>
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const byId = (id) => document.getElementById(id);

    const COMMUNITY_RULES_VERSION = '2026-04';
    const state = { view: 'login', verifyEmail: '' };

    const RATE_LIMITS = {
      login: { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockMs: 15 * 60 * 1000 },
      magic: { maxAttempts: 4, windowMs: 15 * 60 * 1000, lockMs: 20 * 60 * 1000 },
      forgot: { maxAttempts: 4, windowMs: 30 * 60 * 1000, lockMs: 30 * 60 * 1000 }
    };

    function isEmailConfirmed(user) { return Boolean(user && (user.email_confirmed_at || user.confirmed_at)); }

    function setView(viewName) {
      document.querySelectorAll('.view').forEach((view) => view.classList.remove('is-active'));
      const target = byId('view-' + viewName);
      if (target) {
        target.classList.add('is-active');
        state.view = viewName;
      }
    }

    let loginPanelHeightFrame = 0;

    function syncLoginPanelHeight() {
      const card = byId('login-panel-card');
      if (!card) return;

      const cardWidth = Math.ceil(card.getBoundingClientRect().width);
      if (!cardWidth) return;

      const views = Array.from(card.querySelectorAll('.view'));
      if (!views.length) return;

      const measureHost = document.createElement('div');
      measureHost.setAttribute('aria-hidden', 'true');
      measureHost.style.position = 'absolute';
      measureHost.style.left = '-10000px';
      measureHost.style.top = '0';
      measureHost.style.width = cardWidth + 'px';
      measureHost.style.visibility = 'hidden';
      measureHost.style.pointerEvents = 'none';
      measureHost.style.overflow = 'visible';

      document.body.appendChild(measureHost);

      let tallest = 0;

      try {
        views.forEach((view, index) => {
          const clone = card.cloneNode(true);
          clone.removeAttribute('id');
          clone.style.minHeight = '0';
          clone.style.maxHeight = 'none';
          clone.style.height = 'auto';
          clone.style.overflow = 'visible';
          clone.style.width = cardWidth + 'px';
          clone.style.margin = '0';
          clone.style.boxShadow = 'none';
          clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
          clone.querySelectorAll('.view').forEach((clonedView, clonedIndex) => {
            clonedView.classList.toggle('is-active', clonedIndex === index);
          });
          measureHost.appendChild(clone);

          const height = Math.ceil(clone.getBoundingClientRect().height);
          if (height > tallest) tallest = height;

          clone.remove();
        });
      } finally {
        measureHost.remove();
      }

      const viewportCap = Math.max(0, Math.floor(window.innerHeight - 144));
      const nextHeight = viewportCap > 0 ? Math.min(tallest, viewportCap) : tallest;
      card.style.minHeight = nextHeight > 0 ? nextHeight + 'px' : '';
    }

    function scheduleLoginPanelHeightSync() {
      if (loginPanelHeightFrame) cancelAnimationFrame(loginPanelHeightFrame);
      loginPanelHeightFrame = requestAnimationFrame(syncLoginPanelHeight);
    }

    function showMessage(targetId, type, text) {
      const slot = byId(targetId);
      if (!slot) return;
      slot.innerHTML = '';
      if (!text) { slot.innerHTML = '<div class="col"></div>'; return; }
      const variant = type === 'error' ? 'alert-danger' : (type === 'success' ? 'alert-success' : 'alert-info');
      const col = document.createElement('div');
      col.className = 'col';
      const box = document.createElement('div');
      box.className = 'alert ' + variant;
      box.setAttribute('role', 'alert');
      box.textContent = text;
      col.appendChild(box);
      slot.appendChild(col);
    }

    function clearMessages() {
      showMessage('msg-login', 'info', '');
      showMessage('msg-forgot', 'info', '');
      showMessage('msg-verify', 'info', '');
    }

    function setButtonLoading(buttonId, loading, defaultLabel, loadingLabel) {
      const button = byId(buttonId);
      if (!button) return;

      const labelTarget = button.querySelector('[data-btn-label]');
      const nextLabel = loading ? (loadingLabel || button.dataset.loadingLabel || 'Attendere...') : (defaultLabel || button.dataset.defaultLabel || '');

      button.disabled = loading;
      button.setAttribute('aria-busy', loading ? 'true' : 'false');

      if (labelTarget) {
        labelTarget.textContent = nextLabel;
        return;
      }

      button.textContent = nextLabel;
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

    async function ensureProfileForUser(user) {
      const { data: existing, error: existingError } = await sb.from('profiles').select('id, username').eq('id', user.id).maybeSingle();
      if (existingError) return { ok: false, message: 'Accesso riuscito, ma il controllo profilo ha dato errore.' };
      if (existing) return { ok: true, created: false };
      return { ok: true, created: false };
    }

    function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

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

      setButtonLoading('btn-magic', true, 'Invia link magico', 'Invio in corso...');

      const redirectUrl = new URL('profile', window.location.href).toString();
      const { error } = await sb.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: redirectUrl, shouldCreateUser: false }
      });

      setButtonLoading('btn-magic', false, 'Invia link magico', 'Invio in corso...');

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

      setButtonLoading('btn-login', true, 'Procedi', 'Accesso in corso...');

      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });

      setButtonLoading('btn-login', false, 'Procedi', 'Accesso in corso...');

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
      window.location.href = loginProf && loginProf.username ? 'profile?u=' + loginProf.username : 'profile';
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
      window.location.href = restoreProf && restoreProf.username ? 'profile?u=' + restoreProf.username : 'profile';
    }

    function initReveal() {
      const nodes = document.querySelectorAll('[data-reveal]');
      if (!nodes.length) return;
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || !('IntersectionObserver' in window)) {
        nodes.forEach((node) => node.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8%' });

      nodes.forEach((node) => observer.observe(node));
    }

    function initMagneticButtons() {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      document.querySelectorAll('.magnetic').forEach((button) => {
        button.addEventListener('pointermove', (event) => {
          const rect = button.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          button.style.setProperty('--mx', x + '%');
          button.style.setProperty('--my', y + '%');
        });

        button.addEventListener('pointerleave', () => {
          button.style.removeProperty('--mx');
          button.style.removeProperty('--my');
        });
      });
    }

    function bindEvents() {
      byId('loginUP').addEventListener('submit', submitLogin);
      byId('form-forgot').addEventListener('submit', submitForgot);

      document.querySelectorAll('[data-view-link]').forEach((control) => {
        control.addEventListener('click', () => {
          clearMessages();
          const targetView = control.getAttribute('data-view-link');
          if (targetView === 'forgot') {
            byId('forgot-email').value = byId('login-email').value.trim();
          }
          if (targetView === 'login' && state.verifyEmail) {
            byId('login-email').value = state.verifyEmail;
          }
          setView(targetView);
        });
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
    }

    function init() {
      bindEvents();
      initReveal();
      document.querySelectorAll('.rsm-login-copy, .rsm-login-support, .rsm-login-panel').forEach((node) => {
        node.classList.add('is-visible');
      });
      initMagneticButtons();
      applyVerifiedQueryMessage();
      scheduleLoginPanelHeightSync();
      window.addEventListener('resize', scheduleLoginPanelHeightSync, { passive: true });
      restoreActiveSession();
    }

    init();
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