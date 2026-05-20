<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profilo – Rivalta sul Mincio</title>
  <meta name="robots" content="noindex" />
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="grad-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d8b89"/><stop offset="100%" stop-color="#0F2A30"/></linearGradient>
  <linearGradient id="grad-marsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5fb085"/><stop offset="100%" stop-color="#15433a"/></linearGradient>
  <linearGradient id="grad-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c084"/><stop offset="100%" stop-color="#c0392b"/></linearGradient>
  <linearGradient id="grad-spring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8d8a8"/><stop offset="100%" stop-color="#2d8b60"/></linearGradient>
  <linearGradient id="grad-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a2f3a"/><stop offset="100%" stop-color="#030d12"/></linearGradient>
</defs></svg>

<!--PARTIAL:nav-->

<main class="container rsm-page">

  <div class="card-wrapper rsm-profile-card">
    <div class="card card-bg">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div class="rsm-profile-avatar rsm-skel" id="avatar" aria-hidden="true"></div>
          <div>
            <p class="text-primary fw-semibold text-uppercase small mb-1">Profilo autore · Rivalta sul Mincio</p>
            <h1 class="rsm-skel" id="username" style="width:180px;height:30px" aria-label="Nome utente"></h1>
            <p class="rsm-skel" id="displayname" style="width:120px;height:14px"></p>
            <p id="bio"></p>
            <div class="d-flex flex-wrap gap-2" id="chips"></div>
          </div>
        </div>
        <div class="row text-center mt-3 g-3">
          <div class="col-6"><strong class="rsm-skel h3 d-block" id="stat-posts" style="width:52px;height:42px" aria-label="Articoli pubblicati"></strong><span class="small text-muted">Articoli pubblicati</span></div>
          <div class="col-6"><strong class="rsm-skel d-block" id="stat-since" style="width:130px;height:22px" aria-label="Data iscrizione"></strong><span class="small text-muted">Membro da</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="d-flex justify-content-between align-items-center mt-4 mb-3">
    <h2 class="h4 mb-0" id="posts-title">Articoli pubblicati</h2>
    <span class="text-muted small" id="posts-count"></span>
  </div>
  <div class="row g-3" id="posts-grid"></div>

</main>

<!--PARTIAL:footer-->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/supabase.config.js"></script>
<script>
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = id => document.getElementById(id);
const fmt  = iso => new Date(iso).toLocaleDateString('it-IT', {day:'numeric', month:'short', year:'numeric'});
const fmtY = iso => new Date(iso).toLocaleDateString('it-IT', {month:'long', year:'numeric'});
const canonicalCategory  = v => window.RSM_CATEGORIES ? window.RSM_CATEGORIES.canonical(v)   : String(v||'').trim();
const categoryHref       = v => window.RSM_CATEGORIES ? window.RSM_CATEGORIES.categoryHref(v) : ('/category?name='+encodeURIComponent(canonicalCategory(v)));
const escapeHtml = v => String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const isValidHttpsUrl = v => {
  if (!v || typeof v !== 'string') return false;
  try { return new URL(v).protocol === 'https:'; } catch (_) { return false; }
};

const un = new URLSearchParams(location.search).get('u');

(async function () {
  if (!un) {
    try {
      const { data: { session: s } } = await sb.auth.getSession();
      if (s?.user) {
        const { data: me } = await sb.from('profiles').select('username').eq('id', s.user.id).single();
        if (me?.username) { location.replace('/profile?u=' + me.username); return; }
      }
    } catch (_) {}
    location.href = '/login';
    return;
  }

  const {data:prof, error:pe} = await sb.from('profiles').select('*').eq('username', un).single();
  if (pe || !prof) {
    document.querySelector('.rsm-profile-card').innerHTML = '<div class="card card-bg"><div class="card-body text-center text-muted">Profilo non trovato.</div></div>';
    return;
  }
  document.title = `@${prof.username} – Rivalta sul Mincio`;

  const av = $('avatar');
  av.classList.remove('rsm-skel');
  av.style.background = prof.avatar_color || '#1f3d2e';
  av.textContent = prof.avatar_emoji || '🌿';

  $('username').outerHTML  = `<h1 id="username">@${escapeHtml(prof.username)}</h1>`;
  $('displayname').outerHTML = `<p class="text-muted" id="displayname">${escapeHtml(prof.display_name || prof.username)}</p>`;

  const roleLabels = { admin:'Admin', user:'Utente', reader:'Lettore' };
  const chipsHtml = [];
  if (prof.comune) chipsHtml.push(`<span class="chip chip-simple"><span class="chip-label">${escapeHtml(prof.comune)}</span></span>`);
  chipsHtml.push(`<span class="chip chip-simple ${prof.role === 'admin' ? 'chip-primary' : ''}"><span class="chip-label">${roleLabels[prof.role] || 'Utente'}</span></span>`);
  $('chips').innerHTML = chipsHtml.join('');
  if (prof.bio) $('bio').textContent = prof.bio;

  const {count} = await sb.from('posts').select('id', {count:'exact', head:true}).eq('user_id', prof.id).eq('published', true);
  const pe2 = $('stat-posts'); pe2.classList.remove('rsm-skel'); pe2.style = ''; pe2.textContent = count || 0;
  const se  = $('stat-since'); se.classList.remove('rsm-skel');  se.style  = ''; se.textContent  = fmtY(prof.created_at);

  const {data:posts} = await sb.from('posts')
    .select('id,title,excerpt,category,image_type,image_url,published_at')
    .eq('user_id', prof.id).eq('published', true)
    .order('published_at', {ascending: false});

  const grid = $('posts-grid');
  if (!posts || posts.length === 0) {
    grid.innerHTML = '<div class="col-12"><div class="callout note">Nessun articolo pubblicato ancora.</div></div>';
    return;
  }
  $('posts-count').textContent = `${posts.length} articol${posts.length === 1 ? 'o' : 'i'}`;

  grid.innerHTML = posts.map(p => {
    const cat = canonicalCategory(p.category) || 'Territorio';
    const href = '/post?id=' + p.id;
    const media = isValidHttpsUrl(p.image_url)
      ? `<a href="${href}"><img class="rsm-post-thumb" src="${escapeHtml(p.image_url)}" alt="" loading="lazy"></a>`
      : `<a href="${href}"><span class="rsm-post-thumb rsm-post-thumb--empty"></span></a>`;
    return `<div class="col-12 col-sm-6 col-lg-4">
      <div class="card-wrapper h-100"><div class="card card-bg h-100">
        ${media}
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <a class="badge bg-primary text-decoration-none" href="${categoryHref(cat)}">${escapeHtml(cat)}</a>
            <span class="text-muted small">${fmt(p.published_at)}</span>
          </div>
          <h3 class="card-title h5"><a href="${href}">${escapeHtml(p.title || 'Articolo')}</a></h3>
          ${p.excerpt ? `<p class="card-text">${escapeHtml(p.excerpt)}</p>` : ''}
          <a class="read-more" href="${href}"><span class="text">Leggi articolo</span></a>
        </div>
      </div></div>
    </div>`;
  }).join('');
})();
</script>

</body>
</html>
