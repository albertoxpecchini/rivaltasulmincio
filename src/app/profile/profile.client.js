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