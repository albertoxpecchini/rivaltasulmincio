<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profilo – Rivalta sul Mincio</title>
  <meta name="robots" content="noindex" />
  <style>
    /* ── Profile header ──────────────────────────────────── */
    .prof-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 24px 0 20px;
      border-bottom: 1px solid #e3e7ee;
      flex-wrap: wrap;
    }
    .prof-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -.02em;
      flex-shrink: 0;
      user-select: none;
    }
    .prof-info { flex: 1; min-width: 200px; }
    .prof-eyebrow {
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #0073e6;
      margin-bottom: 4px;
    }
    .prof-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a2744;
      margin: 0 0 3px;
      line-height: 1.2;
    }
    .prof-displayname { font-size: .9rem; color: #5a6882; margin: 0 0 7px; }
    .prof-bio { font-size: .9rem; color: #344054; margin: 6px 0 10px; line-height: 1.55; }
    .prof-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
    .prof-stats { font-size: .82rem; color: #5a6882; }
    .prof-stats strong { color: #1a2744; }
    /* ── Owner action buttons ────────────────────────────── */
    .prof-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid #e3e7ee;
    }
    .prof-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 15px;
      border-radius: 999px;
      font-size: .8rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: 1.5px solid #dde2ec;
      background: #fff;
      color: #1a2744;
      transition: border-color .15s, background .15s, color .15s;
    }
    .prof-btn:hover { border-color: #0073e6; color: #0073e6; background: #f0f5ff; text-decoration: none; }
    .prof-btn--primary { background: #0073e6; color: #fff; border-color: #0073e6; }
    .prof-btn--primary:hover { background: #005db3; border-color: #005db3; color: #fff; }
    /* ── Featured post ───────────────────────────────────── */
    .feat-kicker {
      font-size: .67rem;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #5a6882;
      margin: 22px 0 10px;
    }
    .feat-card {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 0;
      border: 1px solid #e3e7ee;
      border-radius: 14px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      background: #fff;
      transition: border-color .15s, box-shadow .15s;
    }
    .feat-card:hover { border-color: #0073e6; box-shadow: 0 4px 18px rgba(0,115,230,.1); text-decoration: none; color: inherit; }
    @media (max-width: 640px) {
      .feat-card { grid-template-columns: 1fr; }
      .feat-img-wrap { order: -1; }
    }
    .feat-body { padding: 20px 22px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
    .feat-cat-row { display: flex; align-items: center; gap: 8px; }
    .feat-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 700;
      color: #fff;
    }
    .feat-date { font-size: .78rem; color: #5a6882; }
    .feat-title { font-size: 1.2rem; font-weight: 700; color: #1a2744; line-height: 1.3; margin: 0; }
    .feat-excerpt { font-size: .88rem; color: #45526b; line-height: 1.6; margin: 0; }
    .feat-cta { font-size: .82rem; font-weight: 600; color: #0073e6; margin-top: 4px; }
    .feat-img-wrap { overflow: hidden; }
    .feat-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 200px; }
    .feat-img-empty { width: 100%; min-height: 200px; background: #e8ecf3; display: block; }
    /* ── More posts ──────────────────────────────────────── */
    .more-kicker {
      font-size: .67rem;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #5a6882;
      margin: 26px 0 10px;
    }
    /* ── Skeleton ─────────────────────────────────────────── */
    .skel { background: linear-gradient(90deg,#e8ecf3 25%,#f4f6f9 50%,#e8ecf3 75%); background-size: 400% 100%; animation: skel 1.4s ease infinite; border-radius: 8px; }
    @keyframes skel { 0%{background-position:100% 50%} 100%{background-position:0 50%} }
    @media (prefers-reduced-motion:reduce) { .skel { animation: none; background: #e8ecf3; } }
  </style>
</head>
<body>

<!--PARTIAL:nav-->

<main class="container rsm-page" id="prof-main" style="padding-bottom: 3rem">
  <div id="prof-header-wrap">
    <div class="prof-header">
      <div class="prof-avatar skel" style="width:72px;height:72px"></div>
      <div class="prof-info">
        <div class="skel" style="width:60px;height:12px;margin-bottom:8px"></div>
        <div class="skel" style="width:180px;height:28px;margin-bottom:6px"></div>
        <div class="skel" style="width:120px;height:14px;margin-bottom:10px"></div>
        <div class="skel" style="width:200px;height:14px"></div>
      </div>
    </div>
  </div>
  <div id="prof-body">
    <div class="feat-kicker skel" style="width:160px;height:12px;margin-top:22px"></div>
    <div class="skel" style="height:180px;border-radius:14px;margin-top:10px"></div>
  </div>
</main>

<!--PARTIAL:footer-->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/supabase.config.js"></script>
<script>
(async function () {
  'use strict';

  const sb = window.RSM_SUPABASE.createClient();

  function escapeHtml(v) {
    return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function fmt(iso) { return iso ? new Date(iso).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}) : ''; }
  function fmtM(iso) { return iso ? new Date(iso).toLocaleDateString('it-IT',{month:'long',year:'numeric'}) : ''; }
  function canonCat(v) { return window.RSM_CATEGORIES ? window.RSM_CATEGORIES.canonical(v) : String(v||'').trim(); }
  function isUrl(v) { if(!v||typeof v!=='string') return false; try { return new URL(v).protocol==='https:'; } catch(_){ return false; } }

  var CAT_COLOR = {
    'Ambiente':'#2d6a4f','Anniversari':'#6d28d9','Assemblea':'#374151','Canoa':'#0e7490',
    'Ciclismo':'#b45309','Cultura':'#6b21a8','Enogastronomia':'#991b1b','Eventi':'#1d4ed8',
    'Festa del Pesce':'#155e75','Iniziative':'#0369a1','Love-luccio':'#9d174d','Mincio-art':'#166534',
    'Natale':'#b91c1c','Natura':'#15803d','Rassegna Stampa':'#334155','Sagre':'#92400e',
    'Sport':'#dc2626','Tesseramento':'#4338ca','Turismo':'#1e40af','Video':'#111827'
  };
  function catColor(c) { return CAT_COLOR[c] || '#374151'; }

  var headerWrap = document.getElementById('prof-header-wrap');
  var bodyWrap   = document.getElementById('prof-body');

  /* ── redirect if no ?u param ─────────────────────────── */
  var un = new URLSearchParams(location.search).get('u');
  if (!un) {
    try {
      var sd = await sb.auth.getSession();
      var s  = sd.data && sd.data.session;
      if (s && s.user) {
        var me = await sb.from('profiles').select('username').eq('id', s.user.id).single();
        if (me.data && me.data.username) { location.replace('/profile?u=' + me.data.username); return; }
      }
    } catch(_) {}
    location.href = '/login';
    return;
  }

  /* ── load profile ─────────────────────────────────────── */
  var profRes = await sb.from('profiles').select('*').eq('username', un).single();
  if (profRes.error || !profRes.data) {
    headerWrap.innerHTML = '<p class="text-muted mt-4">Profilo non trovato.</p>';
    bodyWrap.innerHTML   = '';
    return;
  }
  var prof = profRes.data;
  document.title = '@' + prof.username + ' – Rivalta sul Mincio';

  /* ── check ownership ──────────────────────────────────── */
  var isOwner = false;
  try {
    var sData = await sb.auth.getSession();
    var sess  = sData.data && sData.data.session;
    if (sess && sess.user && sess.user.id === prof.id) isOwner = true;
  } catch(_) {}

  /* ── load posts ───────────────────────────────────────── */
  var postsRes = await sb.from('posts')
    .select('id,title,excerpt,category,image_url,published_at', { count: 'exact' })
    .eq('user_id', prof.id)
    .eq('published', true)
    .order('published_at', { ascending: false });

  var posts      = postsRes.data || [];
  var postCount  = postsRes.count != null ? postsRes.count : posts.length;

  /* ── build header ─────────────────────────────────────── */
  var roleLabels = { admin:'Admin', user:'Utente', reader:'Lettore' };
  var roleLbl    = roleLabels[prof.role] || 'Utente';
  var chipsHtml  = (prof.comune
    ? '<span class="chip chip-simple"><span class="chip-label">' + escapeHtml(prof.comune) + '</span></span>'
    : '')
    + '<span class="chip chip-simple' + (prof.role === 'admin' ? ' chip-primary' : '') + '"><span class="chip-label">' + roleLbl + '</span></span>';

  function getInitials(displayName, username) {
    var name = ((displayName || username || '?')).trim();
    var parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  var actionsHtml = isOwner
    ? '<div class="prof-actions">'
      + '<a href="/write" class="prof-btn prof-btn--primary">Scrivi articolo</a>'
      + '<a href="/dashboard" class="prof-btn">Dashboard</a>'
      + '</div>'
    : '';

  headerWrap.innerHTML =
    '<div class="prof-header">'
    + '<div class="prof-avatar" style="background:' + escapeHtml(prof.avatar_color || '#1f3d2e') + '">'
    + escapeHtml(getInitials(prof.display_name, prof.username))
    + '</div>'
    + '<div class="prof-info">'
    + '<div class="prof-eyebrow">Profilo autore · Rivalta sul Mincio</div>'
    + '<h1 class="prof-name">@' + escapeHtml(prof.username) + '</h1>'
    + (prof.display_name && prof.display_name !== prof.username
        ? '<p class="prof-displayname">' + escapeHtml(prof.display_name) + '</p>'
        : '')
    + (prof.bio ? '<p class="prof-bio">' + escapeHtml(prof.bio) + '</p>' : '')
    + '<div class="prof-chips">' + chipsHtml + '</div>'
    + '<div class="prof-stats"><strong>' + postCount + '</strong> articol' + (postCount === 1 ? 'o' : 'i')
    + ' pubblicat' + (postCount === 1 ? 'o' : 'i')
    + ' &nbsp;·&nbsp; Membro da <strong>' + fmtM(prof.created_at) + '</strong></div>'
    + actionsHtml
    + '</div>'
    + '</div>';

  /* ── build body ───────────────────────────────────────── */
  if (!posts.length) {
    bodyWrap.innerHTML = '<div class="callout note mt-4">Nessun articolo pubblicato ancora.</div>';
    return;
  }

  var SPRITES = '/vendor/bootstrap-italia/svg/sprites.svg';

  /* featured = first post */
  var feat      = posts[0];
  var featCat   = canonCat(feat.category) || 'Territorio';
  var featColor = catColor(featCat);
  var featHref  = '/post?id=' + encodeURIComponent(feat.id);
  var featMedia = isUrl(feat.image_url)
    ? '<div class="feat-img-wrap"><img src="' + escapeHtml(feat.image_url) + '" alt="" loading="lazy" /></div>'
    : '<div class="feat-img-wrap"><div class="feat-img-empty"></div></div>';

  var html =
    '<div class="feat-kicker">Ultimo articolo pubblicato</div>'
    + '<a class="feat-card" href="' + featHref + '">'
    + '<div class="feat-body">'
    + '<div class="feat-cat-row">'
    + '<span class="feat-badge" style="background:' + featColor + '">' + escapeHtml(featCat) + '</span>'
    + '<span class="feat-date">' + fmt(feat.published_at) + '</span>'
    + '</div>'
    + '<div class="feat-title">' + escapeHtml(feat.title || 'Articolo') + '</div>'
    + (feat.excerpt ? '<div class="feat-excerpt">' + escapeHtml(feat.excerpt) + '</div>' : '')
    + '<span class="feat-cta">Leggi articolo →</span>'
    + '</div>'
    + featMedia
    + '</a>';

  /* rest of posts */
  var rest = posts.slice(1);
  if (rest.length > 0) {
    html += '<div class="more-kicker">Altri articoli &nbsp;·&nbsp; ' + rest.length + ' articol' + (rest.length === 1 ? 'o' : 'i') + '</div>';
    html += '<div class="row g-3">';
    html += rest.map(function (p) {
      var cat   = canonCat(p.category) || 'Territorio';
      var color = catColor(cat);
      var href  = '/post?id=' + encodeURIComponent(p.id);
      var media = isUrl(p.image_url)
        ? '<a href="' + href + '"><img class="rsm-post-thumb" src="' + escapeHtml(p.image_url) + '" alt="" loading="lazy"></a>'
        : '<a href="' + href + '"><span class="rsm-post-thumb rsm-post-thumb--empty"></span></a>';
      return '<div class="col-12 col-sm-6 col-lg-4">'
        + '<div class="card-wrapper h-100"><div class="card card-bg h-100">'
        + media
        + '<div class="card-body">'
        + '<div class="d-flex align-items-center gap-2 mb-2">'
        + '<span style="background:' + color + ';color:#fff;display:inline-block;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700">' + escapeHtml(cat) + '</span>'
        + '<span class="text-muted small">' + fmt(p.published_at) + '</span>'
        + '</div>'
        + '<h3 class="card-title h5"><a href="' + href + '">' + escapeHtml(p.title || 'Articolo') + '</a></h3>'
        + (p.excerpt ? '<p class="card-text">' + escapeHtml(p.excerpt) + '</p>' : '')
        + '<a class="read-more" href="' + href + '"><span class="text">Leggi articolo</span>'
        + '<svg class="icon"><use href="' + SPRITES + '#it-arrow-right"></use></svg></a>'
        + '</div></div></div>'
        + '</div>';
    }).join('');
    html += '</div>';
  }

  bodyWrap.innerHTML = html;
})();
</script>

<!-- Vercel Speed Insights -->
<script type="module">
  import { injectSpeedInsights } from '/_vercel/speed-insights/package/@vercel/speed-insights/dist/index.mjs';
  injectSpeedInsights();
</script>

</body>
</html>
