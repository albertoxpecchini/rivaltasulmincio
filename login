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
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
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
  </style>
</head>
<body data-page="login">

<!--PARTIAL:nav-->

  <main id="main" class="rsm-login-page">
    <section class="rsm-section rsm-hero rsm-login-hero" aria-labelledby="login-title">
      <span class="rsm-hero__accent" aria-hidden="true"></span>
      <div class="rsm-container">
        <div class="rsm-hero__layout rsm-login-hero__layout">
          <div class="rsm-login-story">
            <div class="rsm-login-copy rsm-card rsm-card--glass rsm-hero__main" data-reveal>
              <p class="rsm-kicker rsm-login-kicker rsm-edit-line">
                <span class="rsm-login-pulse" aria-hidden="true"></span>
                <span>Accesso locale</span>
                <span aria-hidden="true">&middot;</span>
                <span>Rivalta sul Mincio</span>
              </p>
              <h1 class="rsm-display-1 rsm-login-title" id="login-title">
                <span class="rsm-edit-line">Entra nel <em>borgo</em></span>
                <span class="rsm-edit-line">digitale del <em>Mincio</em></span>
              </h1>
              <p class="rsm-lead rsm-edit-line">Accesso con password o link magico, registrazione guidata in due passaggi e recupero account dentro una pagina che usa lo stesso linguaggio editoriale della home.</p>
              <div class="rsm-button-row rsm-edit-line">
                <button class="rsm-btn rsm-btn--brand magnetic" type="button" data-view-link="login" aria-pressed="true">
                  <span data-btn-label>Accedi ora</span>
                  <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                </button>
                <button class="rsm-btn rsm-btn--ghost magnetic" type="button" data-view-link="register1" aria-pressed="false">
                  <span data-btn-label>Crea account</span>
                  <span class="rsm-btn-icon" aria-hidden="true">+</span>
                </button>
              </div>
              <div class="rsm-hero__metrics rsm-login-metrics">
                <div class="rsm-metric"><strong>3</strong><span>Accessi possibili</span></div>
                <div class="rsm-metric"><strong>2</strong><span>Step registrazione</span></div>
                <div class="rsm-metric"><strong>1</strong><span>Profilo locale</span></div>
              </div>
            </div>

            <div class="rsm-login-support">
              <section class="rsm-login-compass rsm-card rsm-card--glass" aria-labelledby="login-paths-title" data-reveal>
                <div class="rsm-section-head rsm-login-compass__head">
                  <p class="rsm-kicker"><span>Percorsi</span></p>
                  <h2 class="rsm-h2" id="login-paths-title">Scegli il <em>passaggio</em> giusto</h2>
                </div>
                <div class="rsm-login-paths">
                  <button class="rsm-login-path rsm-login-path--brand" type="button" data-view-link="login" aria-pressed="true">
                    <strong>Login password</strong>
                    <span>Email e password per chi ha gia un account verificato.</span>
                  </button>
                  <button class="rsm-login-path rsm-login-path--ghost" type="button" data-view-link="register1" aria-pressed="false">
                    <strong>Registrazione guidata</strong>
                    <span>Due passaggi per creare un profilo con identita locale e regole accettate.</span>
                  </button>
                  <button class="rsm-login-path rsm-login-path--ghost" type="button" data-view-link="forgot" aria-pressed="false">
                    <strong>Reset e recupero</strong>
                    <span>Invio rapido del link di ripristino se hai perso l'accesso.</span>
                  </button>
                </div>
              </section>

              <div class="rsm-login-showcase" data-reveal>
                <div class="rsm-hero__media rsm-login-media">
                  <img src="/img/mantova-laghi-aerea.jpg" alt="Veduta aerea del Mincio e del territorio di Rivalta" loading="eager" decoding="async" />
                  <div class="rsm-login-media__veil" aria-hidden="true"></div>
                  <div class="rsm-login-media__content">
                    <p class="rsm-kicker rsm-kicker--center">Profilo locale</p>
                    <strong>Un solo accesso per storie, eventi e comunita.</strong>
                    <span>Forme, superfici e gerarchie arrivano dallo stesso impianto visivo della home.</span>
                  </div>
                </div>

                <div class="rsm-login-facts">
                  <article class="rsm-login-fact rsm-card rsm-card--glass">
                    <p class="rsm-kicker">Community</p>
                    <strong>Regole chiare</strong>
                    <p>Accettazione obbligatoria delle regole della comunita durante la registrazione.</p>
                  </article>
                  <article class="rsm-login-fact rsm-card rsm-card--glass">
                    <p class="rsm-kicker">Verifica</p>
                    <strong>Email prima di tutto</strong>
                    <p>Senza conferma dell'email l'account non puo diventare operativo.</p>
                  </article>
                </div>
              </div>
            </div>
          </div>

          <aside class="rsm-login-panel" data-reveal>
            <div class="rsm-card rsm-card--glass rsm-login-panel__card" id="login-panel-card">
              <div class="rsm-login-panel__top">
                <p class="rsm-kicker rsm-login-panel__eyebrow"><span>Accesso account</span></p>
                <div class="rsm-login-panel__chips" aria-hidden="true">
                  <span class="rsm-tag rsm-tag--emerald">password</span>
                  <span class="rsm-tag rsm-tag--azure">magic link</span>
                  <span class="rsm-tag rsm-tag--violet">verifica</span>
                </div>
              </div>

              <section class="view rsm-login-view is-active" id="view-login" aria-label="Login">
                <div class="rsm-login-view__head">
                  <p class="rsm-kicker rsm-login-kicker">
                    <span class="rsm-login-pulse" aria-hidden="true"></span>
                    <span>Bentornato</span>
                  </p>
                  <h2 class="rsm-h1">Accedi al tuo <em>account</em></h2>
                  <p class="rsm-body">Non hai ancora un account? <button class="rsm-login-link rsm-login-link--text" type="button" id="login-to-register">Registrati ora</button></p>
                </div>

                <div class="msg-slot" id="msg-login" role="status" aria-live="polite"></div>

                <form id="form-login" class="rsm-login-form" novalidate>
                  <div class="rsm-field">
                    <label for="login-email">Email</label>
                    <input class="rsm-input" type="email" id="login-email" autocomplete="email" placeholder="tu@email.it" required />
                  </div>

                  <div class="rsm-field">
                    <label for="login-password">Password</label>
                    <div class="input-with-action">
                      <input class="rsm-input" type="password" id="login-password" autocomplete="current-password" placeholder="Inserisci la password" required />
                      <button class="input-action" type="button" data-toggle="login-password">Mostra</button>
                    </div>
                  </div>

                  <div class="rsm-button-row rsm-login-button-row">
                    <button class="rsm-btn rsm-btn--brand magnetic" id="btn-login" type="submit" data-default-label="Accedi" data-loading-label="Accesso in corso...">
                      <span data-btn-label>Accedi</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                    </button>
                    <button class="rsm-btn rsm-btn--ghost magnetic" id="btn-magic" type="button" data-default-label="Invia link magico" data-loading-label="Invio in corso...">
                      <span data-btn-label>Invia link magico</span>
                      <span class="rsm-btn-icon" aria-hidden="true">+</span>
                    </button>
                  </div>
                </form>

                <div class="rsm-login-inline">
                  <button class="rsm-login-link rsm-login-link--text" type="button" id="login-to-forgot">Password dimenticata?</button>
                  <a class="rsm-login-link rsm-login-link--text" href="/">Torna alla home</a>
                </div>
              </section>

              <section class="view rsm-login-view" id="view-register1" aria-label="Registrazione passo 1">
                <div class="rsm-login-steps" aria-hidden="true">
                  <span class="active"></span>
                  <span></span>
                </div>

                <div class="rsm-login-view__head">
                  <p class="rsm-kicker rsm-login-kicker"><span>Registrazione 1 di 2</span></p>
                  <h2 class="rsm-h1">Crea il tuo <em>account</em></h2>
                  <p class="rsm-body">Hai gia un profilo? <button class="rsm-login-link rsm-login-link--text" type="button" id="reg1-to-login">Vai al login</button></p>
                </div>

                <div class="msg-slot" id="msg-reg1" role="status" aria-live="polite"></div>

                <form id="form-reg1" class="rsm-login-form" novalidate>
                  <div class="rsm-field">
                    <label for="reg1-email">Email</label>
                    <input class="rsm-input" type="email" id="reg1-email" autocomplete="email" placeholder="nome@email.it" required />
                  </div>

                  <div class="rsm-field">
                    <label for="reg1-password">Password</label>
                    <div class="input-with-action">
                      <input class="rsm-input" type="password" id="reg1-password" autocomplete="new-password" placeholder="Almeno 6 caratteri" minlength="6" required />
                      <button class="input-action" type="button" data-toggle="reg1-password">Mostra</button>
                    </div>
                  </div>

                  <div class="rsm-field">
                    <label for="reg1-password2">Conferma password</label>
                    <div class="input-with-action">
                      <input class="rsm-input" type="password" id="reg1-password2" autocomplete="new-password" placeholder="Ripeti la password" minlength="6" required />
                      <button class="input-action" type="button" data-toggle="reg1-password2">Mostra</button>
                    </div>
                  </div>

                  <div class="rsm-button-row rsm-login-button-row rsm-login-button-row--hero-match">
                    <button class="rsm-btn rsm-btn--brand magnetic" id="btn-reg1-next" type="submit" data-default-label="Continua" data-loading-label="Controllo in corso...">
                      <span data-btn-label>Continua</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                    </button>
                    <button class="rsm-btn rsm-btn--ghost magnetic" type="button" id="reg1-back-home">
                      <span data-btn-label>Annulla</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </form>
              </section>

              <section class="view rsm-login-view" id="view-register2" aria-label="Registrazione passo 2">
                <div class="rsm-login-steps" aria-hidden="true">
                  <span></span>
                  <span class="active"></span>
                </div>

                <div class="rsm-login-view__head">
                  <p class="rsm-kicker rsm-login-kicker"><span>Registrazione 2 di 2</span></p>
                  <h2 class="rsm-h1">Completa il <em>profilo</em></h2>
                  <p class="rsm-body">Username, bio, comune e consenso.</p>
                </div>

                <p class="email-pill" id="reg2-email-pill">Email: -</p>
                <div class="msg-slot" id="msg-reg2" role="status" aria-live="polite"></div>

                <div class="identity-preview">
                  <div class="preview-avatar" id="preview-avatar" aria-hidden="true">&#127807;</div>
                  <div>
                    <div class="preview-name" id="preview-name">@username</div>
                    <div class="preview-meta" id="preview-comune">Comune non impostato</div>
                  </div>
                </div>

                <form id="form-reg2" class="rsm-login-form rsm-reg2-layout" novalidate>

                  <div class="rsm-field">
                    <label for="reg2-username">Nome utente</label>
                    <input class="rsm-input" type="text" id="reg2-username" maxlength="30" autocomplete="username" placeholder="esempio_utente" required />
                    <small>Min 3 caratteri: lettere, numeri, underscore.</small>
                  </div>

                  <div class="rsm-field">
                    <label for="reg2-display">Il tuo nome</label>
                    <input class="rsm-input" type="text" id="reg2-display" maxlength="60" placeholder="Nome pubblico" required />
                  </div>

                  <div class="rsm-field">
                    <label for="reg2-comune">Dove vivi?</label>
                    <select class="rsm-select" id="reg2-comune" required>
                      <option value="">Seleziona...</option>
                      <option value="Rivalta sul Mincio">Rivalta sul Mincio</option>
                      <option value="Rodigo">Rodigo</option>
                      <option value="Fossato">Fossato</option>
                      <option value="Fuori comune">Fuori comune</option>
                    </select>
                  </div>

                  <div class="rsm-reg2-avatar-row">
                    <div>
                      <div class="group-label">Scegli il tuo simbolo</div>
                      <div class="emoji-grid" id="avatar-emoji-grid"></div>
                    </div>
                    <div>
                      <div class="group-label">Colore</div>
                      <div class="color-grid" id="avatar-color-grid"></div>
                    </div>
                  </div>

                  <div class="rsm-field">
                    <label for="reg2-bio">Raccontaci di te</label>
                    <textarea class="rsm-textarea" id="reg2-bio" maxlength="240" placeholder="Breve descrizione" required></textarea>
                    <small>Max 240 caratteri.</small>
                  </div>

                  <label class="check-wrap" for="reg2-rules">
                    <input type="checkbox" id="reg2-rules" />
                    <span>Dichiaro di accettare i <a class="rsm-reg2-terms-link" href="/note-legali">termini e condizioni</a>.</span>
                  </label>

                  <div class="rsm-button-row rsm-login-button-row">
                    <button class="rsm-btn rsm-btn--brand magnetic" id="btn-signup" type="submit" data-default-label="Conferma e chiudi" data-loading-label="Conferma...">
                      <span data-btn-label>Conferma e chiudi</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                    </button>
                    <button class="rsm-btn rsm-btn--ghost magnetic" id="reg2-back" type="button">
                      <span data-btn-label>Indietro</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&larr;</span>
                    </button>
                  </div>
                </form>
              </section>

              <section class="view rsm-login-view" id="view-forgot" aria-label="Password dimenticata">
                <div class="rsm-login-view__head">
                  <p class="rsm-kicker rsm-login-kicker"><span>Recupero account</span></p>
                  <h2 class="rsm-h1">Reimposta la <em>password</em></h2>
                  <p class="rsm-body">Ti inviamo una email con il link di reset.</p>
                </div>

                <div class="msg-slot" id="msg-forgot" role="status" aria-live="polite"></div>

                <form id="form-forgot" class="rsm-login-form" novalidate>
                  <div class="rsm-field">
                    <label for="forgot-email">Email</label>
                    <input class="rsm-input" type="email" id="forgot-email" autocomplete="email" placeholder="tu@email.it" required />
                  </div>

                  <div class="rsm-button-row rsm-login-button-row">
                    <button class="rsm-btn rsm-btn--brand magnetic" id="btn-forgot" type="submit" data-default-label="Invia email reset" data-loading-label="Invio in corso...">
                      <span data-btn-label>Invia email reset</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                    </button>
                    <button class="rsm-btn rsm-btn--ghost magnetic" id="forgot-back-login" type="button">
                      <span data-btn-label>Torna al login</span>
                      <span class="rsm-btn-icon" aria-hidden="true">&larr;</span>
                    </button>
                  </div>
                </form>
              </section>

              <section class="view rsm-login-view" id="view-verify" aria-label="Verifica email">
                <div class="verify-box">
                  <div class="verify-icon" aria-hidden="true">&#9993;&#65039;</div>
                  <h3>Controlla la tua email</h3>
                  <p>Abbiamo inviato un link di conferma a: <span class="verify-email" id="verify-email-target">la tua email</span></p>
                  <p>Finche l'email non e verificata non puoi usare l'account in modo operativo ne pubblicare contenuti.</p>
                </div>

                <div class="msg-slot" id="msg-verify" role="status" aria-live="polite"></div>

                <div class="rsm-button-row rsm-login-button-row">
                  <button class="rsm-btn rsm-btn--brand magnetic" id="verify-to-login" type="button">
                    <span data-btn-label>Ho verificato, torno al login</span>
                    <span class="rsm-btn-icon" aria-hidden="true">&rarr;</span>
                  </button>
                  <button class="rsm-btn rsm-btn--ghost magnetic" id="verify-to-register" type="button">
                    <span data-btn-label>Usa un'altra email</span>
                    <span class="rsm-btn-icon" aria-hidden="true">@</span>
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </section>
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

    function syncViewTriggers(viewName) {
      document.querySelectorAll('[data-view-link]').forEach((control) => {
        control.setAttribute('aria-pressed', control.getAttribute('data-view-link') === viewName ? 'true' : 'false');
      });
    }

    function setView(viewName) {
      const views = document.querySelectorAll('.view');
      views.forEach((view) => view.classList.remove('is-active'));
      const target = byId('view-' + viewName);
      if (target) {
        target.classList.add('is-active');
        state.view = viewName;
        syncViewTriggers(viewName);
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

    function validEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      window.location.href = loginProf && loginProf.username ? 'profile?u=' + loginProf.username : 'profile';
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

      byId('reg2-email-pill').textContent = 'Email: ' + email;
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
        showMessage('msg-reg2', 'error', 'Inserisci il nome.');
        return;
      }

      if (!comune) {
        showMessage('msg-reg2', 'error', 'Seleziona il comune di riferimento.');
        return;
      }

      if (!bio || bio.length < 8) {
        showMessage('msg-reg2', 'error', 'Inserisci una bio di almeno 8 caratteri.');
        return;
      }

      if (!rulesAccepted) {
        showMessage('msg-reg2', 'error', 'Devi accettare i termini e condizioni.');
        return;
      }

      setButtonLoading('btn-signup', true, 'Crea account', 'Creo account...');

      const { data: usernameRows, error: usernameCheckError } = await sb
        .from('profiles')
        .select('id')
        .eq('username', username)
        .limit(1);

      if (usernameCheckError) {
        setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');
        showMessage('msg-reg2', 'error', "Impossibile verificare ora l'username. Riprova tra poco.");
        return;
      }

      if (Array.isArray(usernameRows) && usernameRows.length > 0) {
        setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');
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

      setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');

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
      byId('form-login').addEventListener('submit', submitLogin);
      byId('btn-magic').addEventListener('click', submitMagicLink);
      byId('form-reg1').addEventListener('submit', submitRegisterStep1);
      byId('form-reg2').addEventListener('submit', submitRegisterStep2);
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
        window.location.href = '/';
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
      syncViewTriggers(state.view);
      bindEvents();
      buildAvatarPickers();
      updateIdentityPreview();
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

<!--PARTIAL:footer-->
</body>
</html>