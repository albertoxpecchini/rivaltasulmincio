(async function () {
  'use strict';

  const sb      = window.RSM_SUPABASE.createClient();
  const params  = new URLSearchParams(location.search);
  const id      = params.get('id');
  const wrap    = document.getElementById('post-content');
  const pagMain = document.getElementById('page-main');

  /* ── state ───────────────────────────────────────────────── */
  var viewerSession    = null;
  var viewerProfile    = null;
  var activePost       = null;
  var commentsCache    = [];
  var commentPrivacy   = 'all';
  var likesCount       = 0;
  var viewerLikedPost  = false;

  var COMMENT_RATE_CFG = { maxAttempts: 6,  windowMs: 10 * 60 * 1000,       lockMs: 30 * 60 * 1000 };
  var REPORT_RATE_CFG  = { maxAttempts: 4,  windowMs: 24 * 60 * 60 * 1000,  lockMs: 24 * 60 * 60 * 1000 };
  var LIKE_RATE_CFG    = { maxAttempts: 20, windowMs: 10 * 60 * 1000,       lockMs: 10 * 60 * 1000 };

  /* ── category colors ─────────────────────────────────────── */
  var CAT_COLOR = {
    'Ambiente': '#2d6a4f',     'Anniversari': '#6d28d9',  'Assemblea': '#374151',
    'Canoa': '#0e7490',        'Ciclismo': '#b45309',     'Cultura': '#6b21a8',
    'Enogastronomia': '#991b1b','Eventi': '#1d4ed8',      'Festa del Pesce': '#155e75',
    'Iniziative': '#0369a1',   'Love-luccio': '#9d174d',  'Mincio-art': '#166534',
    'Natale': '#b91c1c',       'Natura': '#15803d',       'Rassegna Stampa': '#334155',
    'Sagre': '#92400e',        'Sport': '#dc2626',        'Tesseramento': '#4338ca',
    'Turismo': '#1e40af',      'Video': '#111827'
  };

  /* ── utilities ───────────────────────────────────────────── */
  function isMissingRelationError(error) {
    var msg = String((error && error.message) || '').toLowerCase();
    return !!error && (
      error.code === '42P01' || error.code === 'PGRST205'
      || msg.indexOf('does not exist') >= 0 || msg.indexOf('could not find the table') >= 0
    );
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function catColor(cat) { return CAT_COLOR[cat] || '#374151'; }

  function canonicalCategory(v) {
    return window.RSM_CATEGORIES ? window.RSM_CATEGORIES.canonical(v) : String(v || '').trim();
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T00:00:00') : new Date(iso);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function fmtDateShort(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderInlineText(text) {
    return escapeHtml(text || '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function getContentBlocks(text) {
    return String(text || '').split(/\n\s*\n+/).map(function (b) { return b.trim(); }).filter(Boolean);
  }
  function getBlockLines(block) {
    return String(block || '').split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
  }
  function normalizeBlockText(block) { return getBlockLines(block).join(' '); }

  function parseListMarker(line) {
    var u = String(line || '').match(/^[-*+•–]\s+(.+)$/);
    if (u) return { type: 'ul', text: u[1].trim() };
    var o = String(line || '').match(/^\d+[.)]\s+(.+)$/);
    if (o) return { type: 'ol', text: o[1].trim() };
    return null;
  }
  function parseListBlock(block) {
    var lines = getBlockLines(block);
    if (lines.length < 2) return null;
    var type = null; var items = [];
    for (var i = 0; i < lines.length; i++) {
      var item = parseListMarker(lines[i]);
      if (!item) return null;
      if (!type) type = item.type;
      if (type !== item.type) return null;
      items.push(item.text);
    }
    return items.length ? { type: type, items: items } : null;
  }
  function getSequenceItem(block) {
    var text = normalizeBlockText(block);
    if (!text || /^#{1,6}\s+/.test(text) || /^>\s?/.test(text)) return null;
    var marked = parseListMarker(text);
    if (marked) return marked;
    if (text.length > 140 || /[.!?;:]$/.test(text)) return null;
    return { type: 'ul', text: text };
  }
  function collectSequenceBlocks(blocks, startIndex) {
    var items = []; var type = null; var index = startIndex;
    while (index < blocks.length) {
      var item = getSequenceItem(blocks[index]);
      if (!item) break;
      if (!type) type = item.type;
      if (type !== item.type) break;
      items.push(item.text); index++;
    }
    return items.length >= 2
      ? { type: type || 'ul', items: items, consumed: index - startIndex }
      : { type: null, items: [], consumed: 0 };
  }
  function collectSequenceLines(lines) {
    var items = []; var type = null;
    for (var i = 0; i < lines.length; i++) {
      var item = getSequenceItem(lines[i]);
      if (!item) return { type: null, items: [] };
      if (!type) type = item.type;
      if (type !== item.type) return { type: null, items: [] };
      items.push(item.text);
    }
    return items.length >= 2 ? { type: type || 'ul', items: items } : { type: null, items: [] };
  }
  function renderList(type, items) {
    return '<' + type + '>' + items.map(function (i) { return '<li>' + renderInlineText(i) + '</li>'; }).join('') + '</' + type + '>';
  }
  function getReadingStats(text) {
    var raw = String(text || '');
    var blocks = getContentBlocks(raw);
    var headingCount = 0; var paragraphCount = 0;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var lines = getBlockLines(block);
      var normalized = normalizeBlockText(block);
      if (/^#{1,6}\s+/.test(block)) { headingCount++; continue; }
      if (/^>\s?/.test(block)) { paragraphCount++; continue; }
      if (parseListBlock(block)) { paragraphCount++; continue; }
      if (lines.length > 2 && /:$/.test(lines[0])) {
        var seq = collectSequenceLines(lines.slice(1));
        if (seq.items.length) { paragraphCount += 2; continue; }
      }
      if (/:$/.test(normalized)) {
        var bseq = collectSequenceBlocks(blocks, i + 1);
        if (bseq.items.length) { paragraphCount += 2; i += bseq.consumed; continue; }
      }
      paragraphCount++;
    }
    return { headingCount: headingCount, paragraphCount: Math.max(1, paragraphCount) };
  }
  function renderContent(text) {
    if (!text) return '';
    var blocks = getContentBlocks(text);
    var html = [];
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var lines = getBlockLines(block);
      var normalized = normalizeBlockText(block);
      var headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        var level = Math.min(4, Math.max(2, headingMatch[1].length + 1));
        html.push('<h' + level + '>' + renderInlineText(headingMatch[2].trim()) + '</h' + level + '>');
        continue;
      }
      if (/^>\s?/.test(block)) {
        var quote = block.replace(/^>\s?/gm, '').split(/\n+/).map(function (l) { return renderInlineText(l.trim()); }).join('<br>');
        html.push('<blockquote>' + quote + '</blockquote>');
        continue;
      }
      var ml = parseListBlock(block);
      if (ml) { html.push(renderList(ml.type, ml.items)); continue; }
      if (lines.length > 2 && /:$/.test(lines[0])) {
        var seq2 = collectSequenceLines(lines.slice(1));
        if (seq2.items.length) {
          html.push('<p>' + renderInlineText(lines[0]) + '</p>');
          html.push(renderList(seq2.type, seq2.items));
          continue;
        }
      }
      if (/:$/.test(normalized)) {
        var bseq2 = collectSequenceBlocks(blocks, i + 1);
        if (bseq2.items.length) {
          html.push('<p>' + renderInlineText(normalized) + '</p>');
          html.push(renderList(bseq2.type, bseq2.items));
          i += bseq2.consumed;
          continue;
        }
      }
      html.push('<p>' + lines.map(function (l) { return renderInlineText(l.trim()); }).join('<br>') + '</p>');
    }
    return html.join('');
  }

  /* ── BRANCH: list vs detail ──────────────────────────────── */
  if (!id) {
    renderListView();
    return;
  }

  /* ─────────────────────────────────────────────────────────
     DETAIL VIEW
  ───────────────────────────────────────────────────────── */
  if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.includes('your-project')) {
    wrap.innerHTML = '<div class="error-wrap"><h2>Configurazione mancante</h2><p>Supabase non configurato.</p><a href="/post" class="btn btn-primary">← Torna alle notizie</a></div>';
    return;
  }

  pagMain.classList.add('rsm-article');
  await loadViewerContext();

  var postResult = await sb.from('posts').select('*').eq('id', id).eq('published', true).single();
  var post = postResult.data;
  var postError = postResult.error;

  if (postError || !post) {
    wrap.innerHTML = '<div class="error-wrap"><h2>Articolo non trovato</h2><p>L\'articolo non esiste o non è ancora pubblicato.</p><a href="/post" class="btn btn-primary">← Torna alle notizie</a></div>';
    return;
  }

  document.title = post.title + ' – Pro Loco Rivalta sul Mincio';
  activePost = Object.assign({}, post, { category: canonicalCategory(post.category) || 'Territorio' });

  var isAuthor = !!(viewerSession && viewerSession.user && viewerSession.user.id === activePost.user_id);

  var cat    = activePost.category;
  var color  = catColor(cat);
  var stats  = getReadingStats(activePost.content);
  var readingShape = stats.headingCount ? (stats.headingCount + ' sezioni') : (stats.paragraphCount + ' paragrafi');
  var readingEntry = activePost.image_url ? 'apertura visiva' : 'testo diretto';

  var isImportedAuthor = activePost.author_username === 'proloco';
  var authorHref = (!isImportedAuthor && activePost.author_username) ? 'profile?u=' + encodeURIComponent(activePost.author_username) : '';
  var authorFooterHtml = isImportedAuthor
    ? '<a href="https://rivaltasulmincio.com" class="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener">rivaltasulmincio.com →</a>'
    : (activePost.author_username ? '<a href="' + authorHref + '" class="btn btn-outline-secondary btn-sm">Autore: @' + escapeHtml(activePost.author_username) + ' →</a>' : '');

  /* scheduled date chip at top */
  var schedHtml = activePost.event_start_at
    ? '<span class="post-sched">Programmato per il ' + escapeHtml(fmtDate(activePost.event_start_at)) + '</span>'
    : '';

  /* event box */
  var evKeys = ['event_start_at', 'event_time_text', 'location_text', 'address_text', 'organizer', 'contacts', 'price_text', 'booking_url'];
  var hasEvent = evKeys.some(function (k) { return !!activePost[k]; });
  var eventBoxHtml = '';
  if (hasEvent) {
    var rows = [];
    if (activePost.event_start_at)   rows.push('<dt>Data</dt><dd>' + escapeHtml(fmtDate(activePost.event_start_at)) + '</dd>');
    if (activePost.event_time_text)  rows.push('<dt>Orario</dt><dd>' + escapeHtml(activePost.event_time_text) + '</dd>');
    if (activePost.location_text)    rows.push('<dt>Luogo</dt><dd>' + escapeHtml(activePost.location_text) + '</dd>');
    if (activePost.address_text)     rows.push('<dt>Indirizzo</dt><dd>' + escapeHtml(activePost.address_text) + '</dd>');
    if (activePost.organizer)        rows.push('<dt>Organizzatore</dt><dd>' + escapeHtml(activePost.organizer) + '</dd>');
    if (activePost.contacts)         rows.push('<dt>Contatti</dt><dd>' + escapeHtml(activePost.contacts) + '</dd>');
    if (activePost.price_text)       rows.push('<dt>Ingresso</dt><dd>' + escapeHtml(activePost.price_text) + '</dd>');
    var ctaUrl  = String((activePost.cta_url || activePost.booking_url) || '').trim();
    var ctaText = String((activePost.cta_text || (activePost.booking_url ? 'Prenota ora' : '')) || '').trim();
    var ctaBtnHtml = (ctaUrl && ctaText)
      ? '<div class="event-cta"><a href="' + escapeHtml(ctaUrl) + '" class="btn btn-primary btn-sm" target="_blank" rel="noopener">' + escapeHtml(ctaText) + '</a></div>'
      : '';
    eventBoxHtml = '<div class="event-box"><div class="event-kicker">Dettagli evento</div><dl class="event-dl">' + rows.join('') + '</dl>' + ctaBtnHtml + '</div>';
  }

  /* tags + keywords */
  var allTags = (activePost.tags || []).concat(activePost.keywords || []).filter(Boolean);
  var tagsHtml = allTags.length
    ? '<div class="post-tags">' + allTags.map(function (t) { return '<span class="post-tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>'
    : '';

  /* extra links */
  var linkPills = [];
  if (activePost.instagram_url) {
    linkPills.push('<a href="' + escapeHtml(activePost.instagram_url) + '" class="post-link-pill" target="_blank" rel="noopener">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
      + 'Post Instagram</a>');
  }
  if (activePost.source_url) {
    linkPills.push('<a href="' + escapeHtml(activePost.source_url) + '" class="post-link-pill" target="_blank" rel="noopener">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
      + 'Fonte originale</a>');
  }
  var linksHtml = linkPills.length ? '<div class="post-links">' + linkPills.join('') + '</div>' : '';

  var imgSafe    = activePost.image_url ? escapeHtml(activePost.image_url) : '';
  var titleSafe  = escapeHtml(activePost.title || 'Articolo');

  var authorBarHtml = isAuthor
    ? '<div class="author-bar">'
      + '<span class="author-bar-label">⚙ Gestisci articolo</span>'
      + '<div class="author-bar-actions">'
      + '<a href="/write?edit=' + encodeURIComponent(activePost.id) + '" class="author-btn">✏ Modifica</a>'
      + '<button class="author-btn author-btn--warn" id="hide-post-btn" type="button">👁 Nascondi al pubblico</button>'
      + '<button class="author-btn author-btn--danger" id="delete-post-btn" type="button">🗑 Elimina articolo</button>'
      + '</div>'
      + '</div>'
    : '';

  wrap.innerHTML =
    '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:1.5rem">'
    +  '<a href="/post" class="btn btn-outline-secondary btn-sm">← Torna alle notizie</a>'
    +  '<a href="/" class="btn btn-outline-secondary btn-sm">Home</a>'
    + '</div>'
    + authorBarHtml
    + '<div class="post-layout">'
    +   '<div class="post-main">'
    +     '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:.75rem">'
    +       '<span class="cat-badge" style="background:' + color + '">' + escapeHtml(cat) + '</span>'
    +       schedHtml
    +     '</div>'
    +     '<h1 class="post-title">' + titleSafe + '</h1>'
    +     (activePost.subtitle ? '<p class="post-subtitle">' + escapeHtml(activePost.subtitle) + '</p>' : '')
    +     (activePost.excerpt  ? '<p class="post-lead">'     + escapeHtml(activePost.excerpt)  + '</p>' : '')
    +     '<div class="reading-brief">'
    +       '<span class="reading-kicker">Guida di lettura</span>'
    +       '<span class="reading-chip">' + readingShape + '</span>'
    +       '<span class="reading-chip">' + readingEntry + '</span>'
    +     '</div>'
    +     (imgSafe ? '<div class="post-img-mob"><img src="' + imgSafe + '" alt="' + titleSafe + '" loading="lazy" /></div>' : '')
    +     eventBoxHtml
    +     '<div class="content" id="article-body">' + renderContent(activePost.content) + '</div>'
    +     tagsHtml
    +     linksHtml
    +     '<div class="post-pub-date">Pubblicato il ' + escapeHtml(fmtDate(activePost.published_at)) + '</div>'
    +     '<div class="post-footer">'
    +       '<a href="/post" class="btn btn-outline-secondary btn-sm">← Tutte le notizie</a>'
    +       authorFooterHtml
    +     '</div>'
    +     '<div class="post-reactions">'
    +       '<button class="like-btn" id="like-btn" type="button" aria-pressed="false">'
    +         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +           '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
    +         '</svg>'
    +         '<span id="like-count">0</span>'
    +       '</button>'
    +       '<span class="like-hint" id="like-hint"></span>'
    +     '</div>'
    +     '<section class="discussion-sec" id="discussion">'
    +       '<h2>Commenti</h2>'
    +       '<div id="discussion-msg" class="disc-msg" style="display:none"></div>'
    +       '<div class="comment-composer">'
    +         '<form id="comment-form">'
    +           '<textarea id="comment-text" placeholder="Scrivi un commento rispettoso e costruttivo..."></textarea>'
    +           '<div class="comment-composer-btns">'
    +             '<button class="btn btn-primary btn-sm" id="comment-submit" type="submit">Pubblica</button>'
    +             '<button class="btn btn-outline-secondary btn-sm" id="report-post-btn" type="button">Segnala post</button>'
    +           '</div>'
    +         '</form>'
    +       '</div>'
    +       '<div id="comments-list" class="comments-list"><p class="text-muted small">Caricamento commenti...</p></div>'
    +     '</section>'
    +     '<section class="related-sec">'
    +       '<div class="related-kicker">Leggi anche</div>'
    +       '<div class="related-grid" id="related-posts">'
    +         '<div class="skel" style="height:180px;border-radius:12px"></div>'
    +         '<div class="skel" style="height:180px;border-radius:12px"></div>'
    +         '<div class="skel" style="height:180px;border-radius:12px"></div>'
    +       '</div>'
    +     '</section>'
    +   '</div>'
    +   '<aside class="post-aside">'
    +     (imgSafe ? '<figure class="post-aside-fig"><img src="' + imgSafe + '" alt="' + titleSafe + '" loading="lazy" /></figure>' : '')
    +     '<div class="aside-rules">'
    +       '<div class="aside-rules-kicker">Regole di convivenza</div>'
    +       '<ul class="aside-rules-list">'
    +         '<li>Rispetta le persone: niente insulti o attacchi personali.</li>'
    +         '<li>Resta sul tema e usa un linguaggio costruttivo.</li>'
    +       '</ul>'
    +     '</div>'
    +   '</aside>'
    + '</div>';

  await resolveCommentPrivacy();
  bindDiscussionHandlers();
  await loadLikes();
  syncCommentComposerState();
  await loadComments();
  await loadRelatedPosts(id);

  window.editComment   = editComment;
  window.deleteComment = deleteComment;

  /* ─────────────────────────────────────────────────────────
     LIST VIEW
  ───────────────────────────────────────────────────────── */
  function renderListView() {
    if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.includes('your-project') || typeof supabase === 'undefined') {
      wrap.innerHTML = '<p class="text-muted">Configura Supabase per visualizzare i post.</p>';
      return;
    }
    var SPRITES   = '/vendor/bootstrap-italia/svg/sprites.svg';
    var allCats   = window.RSM_CATEGORIES ? window.RSM_CATEGORIES.all() : [];
    var requested = canonicalCategory(params.get('name') || '');
    var activeCat = allCats.includes(requested) ? requested : 'all';
    var isAll     = activeCat === 'all';

    function catUrl(c) { return c === 'all' ? '/post' : '/post?name=' + encodeURIComponent(c); }

    var chipsHtml = [{ label: 'Tutto', value: 'all' }]
      .concat(allCats.map(function (c) { return { label: c, value: c }; }))
      .map(function (item) {
        var active = item.value === activeCat ? ' chip-primary' : '';
        return '<a class="chip chip-simple' + active + '" href="' + catUrl(item.value) + '">'
          + '<span class="chip-label">' + escapeHtml(item.label) + '</span></a>';
      }).join('');

    document.title = (isAll ? 'Tutti i post' : activeCat) + ' - Rivalta sul Mincio';

    wrap.innerHTML =
      '<p class="text-primary fw-semibold text-uppercase small mb-1">Archivio Rivalta sul Mincio</p>'
      + '<h1>' + (isAll ? 'Tutti i post' : escapeHtml(activeCat)) + '</h1>'
      + '<p class="text-muted lead">' + (isAll
          ? 'Archivio completo di tutti i post pubblicati: eventi, territorio, vita locale e storie della comunità.'
          : 'Articoli pubblicati nella categoria ' + escapeHtml(activeCat) + '.')
      + '</p>'
      + '<nav class="d-flex flex-wrap gap-2 my-3" aria-label="Categorie">' + chipsHtml + '</nav>'
      + '<div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">'
      +   '<h2 class="h5 mb-0">' + (isAll ? 'Ultimi articoli' : 'Archivio ' + escapeHtml(activeCat)) + '</h2>'
      +   '<span class="badge bg-secondary" id="feed-count">In caricamento</span>'
      + '</div>'
      + '<div class="row g-3" id="posts-grid"></div>'
      + '<div class="callout note" id="posts-empty" style="display:none"></div>';

    var postsGrid = document.getElementById('posts-grid');
    var emptyEl   = document.getElementById('posts-empty');
    var countEl   = document.getElementById('feed-count');

    sb.from('posts')
      .select('id,title,excerpt,category,image_url,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(function (res) {
        if (res.error) {
          if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.textContent = 'Errore: ' + res.error.message; }
          if (countEl) countEl.textContent = '0 articoli';
          return;
        }
        var rows = (res.data || [])
          .map(function (p) { return Object.assign({}, p, { category: canonicalCategory(p.category) || 'Territorio' }); })
          .filter(function (p) { return isAll || p.category === activeCat; });

        if (!rows.length) {
          if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.textContent = isAll ? 'Nessun articolo disponibile.' : 'Nessun articolo in questa categoria.'; }
          if (countEl) countEl.textContent = '0 articoli';
          return;
        }

        if (countEl) countEl.textContent = rows.length + (rows.length === 1 ? ' articolo' : ' articoli');
        if (postsGrid) postsGrid.innerHTML = rows.map(function (p) {
          var pColor = catColor(p.category);
          var href  = '/post?id=' + encodeURIComponent(p.id);
          var media = p.image_url
            ? '<a href="' + href + '"><img class="rsm-post-thumb" src="' + escapeHtml(p.image_url) + '" alt="" loading="lazy" /></a>'
            : '<a href="' + href + '"><span class="rsm-post-thumb rsm-post-thumb--empty"></span></a>';
          var dateStr = p.published_at ? new Date(p.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          return '<div class="col-12 col-sm-6 col-lg-4">'
            + '<div class="card-wrapper h-100"><div class="card card-bg h-100">'
            + media
            + '<div class="card-body">'
            + '<div class="d-flex align-items-center gap-2 mb-2">'
            + '<span style="background:' + pColor + ';color:#fff;display:inline-block;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700">' + escapeHtml(p.category) + '</span>'
            + '<span class="text-muted small">' + escapeHtml(dateStr) + '</span>'
            + '</div>'
            + '<h3 class="card-title h5"><a href="' + href + '">' + escapeHtml(p.title || 'Articolo') + '</a></h3>'
            + '<p class="card-text">' + escapeHtml(p.excerpt || '') + '</p>'
            + '<a class="read-more" href="' + href + '"><span class="text">Leggi articolo</span>'
            + '<svg class="icon"><use href="' + SPRITES + '#it-arrow-right"></use></svg></a>'
            + '</div></div></div></div>';
        }).join('');
      });
  }

  /* ── related posts ────────────────────────────────────────── */
  async function loadRelatedPosts(currentId) {
    var res = await sb.from('posts')
      .select('id,title,category,image_url,published_at')
      .eq('published', true)
      .neq('id', currentId)
      .order('published_at', { ascending: false })
      .limit(3);

    var grid = document.getElementById('related-posts');
    if (!grid) return;

    if (!res.data || !res.data.length) {
      var sec = grid.closest('.related-sec');
      if (sec) sec.style.display = 'none';
      return;
    }

    grid.innerHTML = res.data.map(function (p) {
      var pCat   = canonicalCategory(p.category) || 'Territorio';
      var pColor = catColor(pCat);
      var href   = '/post?id=' + encodeURIComponent(p.id);
      var thumb  = p.image_url
        ? '<img class="rel-thumb" src="' + escapeHtml(p.image_url) + '" alt="" loading="lazy" />'
        : '<span class="rel-thumb-empty"></span>';
      return '<a class="rel-card" href="' + href + '">'
        + thumb
        + '<div class="rel-body">'
        + '<div class="rel-meta">'
        + '<span class="rel-badge" style="background:' + pColor + '">' + escapeHtml(pCat) + '</span>'
        + '<span class="rel-date">' + escapeHtml(fmtDateShort(p.published_at)) + '</span>'
        + '</div>'
        + '<div class="rel-title">' + escapeHtml(p.title || 'Articolo') + '</div>'
        + '</div></a>';
    }).join('');
  }

  /* ── auth / viewer context ────────────────────────────────── */
  async function loadViewerContext() {
    var sessionData = await sb.auth.getSession();
    viewerSession = (sessionData.data && sessionData.data.session) || null;
    if (!viewerSession) { viewerProfile = null; return; }
    var profileRes = await sb.from('profiles')
      .select('id,username,role,avatar_emoji,avatar_color')
      .eq('id', viewerSession.user.id)
      .single();
    viewerProfile = profileRes.data || null;
  }

  /* ── discussion UI helpers ────────────────────────────────── */
  function showDiscussionMessage(message, type) {
    var box = document.getElementById('discussion-msg');
    if (!box) return;
    if (!message) { box.style.display = 'none'; box.className = 'disc-msg'; box.textContent = ''; return; }
    var mod = type === 'err' ? 'disc-msg--err' : (type === 'ok' ? 'disc-msg--ok' : 'disc-msg--info');
    box.style.display = 'block';
    box.className = 'disc-msg ' + mod;
    box.textContent = message;
  }

  function syncLikeUi() {
    var btn   = document.getElementById('like-btn');
    var count = document.getElementById('like-count');
    var hint  = document.getElementById('like-hint');
    if (!btn || !count) return;
    btn.classList.toggle('active', viewerLikedPost);
    btn.setAttribute('aria-pressed', viewerLikedPost ? 'true' : 'false');
    count.textContent = String(Math.max(0, likesCount));
    if (hint) {
      if (!viewerSession) {
        hint.textContent = 'Accedi per mettere Mi piace.';
      } else if (viewerLikedPost) {
        hint.textContent = 'Hai messo Mi piace a questo articolo.';
      } else {
        hint.textContent = 'Un Mi piace per utente.';
      }
    }
  }

  function disableLikeUi(reason) {
    var btn  = document.getElementById('like-btn');
    var hint = document.getElementById('like-hint');
    if (btn) btn.disabled = true;
    if (hint && reason) hint.textContent = reason;
  }

  async function createInteractionNotification(type, commentId) {
    if (!viewerSession || !viewerSession.user || !viewerSession.user.id) return;
    if (!activePost || !activePost.id || !activePost.user_id) return;
    if (activePost.user_id === viewerSession.user.id) return;
    var actor   = viewerProfile && viewerProfile.username ? ('@' + viewerProfile.username) : 'Un utente';
    var message = type === 'comment' ? actor + ' ha commentato il tuo articolo.' : actor + ' ha messo Mi piace al tuo articolo.';
    var payload = {
      user_id: activePost.user_id,
      actor_id: viewerSession.user.id,
      actor_username: (viewerProfile && viewerProfile.username) || null,
      post_id: activePost.id,
      comment_id: commentId || null,
      type: type,
      message: message,
      is_read: false
    };
    var res = await sb.from('notifications').insert(payload);
    if (!res.error) return;
    var errMsg = String((res.error && res.error.message) || '').toLowerCase();
    if (isMissingRelationError(res.error) || errMsg.indexOf('duplicate key') >= 0) return;
    console.warn('[notifications] insert failed:', res.error.message);
  }

  /* ── likes ────────────────────────────────────────────────── */
  async function loadLikes() {
    var likeBtn = document.getElementById('like-btn');
    if (!likeBtn || !activePost || !activePost.id) return;
    var countRes = await sb.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', activePost.id);
    if (countRes.error) {
      if (isMissingRelationError(countRes.error)) { disableLikeUi('Like non attivi: applica supabase-security.sql.'); return; }
      disableLikeUi('Like temporaneamente non disponibili.');
      return;
    }
    likesCount = countRes.count || 0;
    viewerLikedPost = false;
    if (viewerSession && viewerSession.user && viewerSession.user.id) {
      var likeRes = await sb.from('post_likes').select('id').eq('post_id', activePost.id).eq('user_id', viewerSession.user.id).maybeSingle();
      if (!likeRes.error) viewerLikedPost = !!likeRes.data;
    }
    syncLikeUi();
  }

  async function toggleLike() {
    var likeBtn = document.getElementById('like-btn');
    if (likeBtn && likeBtn.disabled) return;
    if (!viewerSession || !viewerProfile) { showDiscussionMessage('Accedi per mettere Mi piace.', 'err'); return; }
    if (!activePost || !activePost.id) return;
    if (window.RSM_SECURITY) {
      var likeLimit = window.RSM_SECURITY.checkRateLimit('like_toggle', viewerSession.user.id, LIKE_RATE_CFG);
      if (!likeLimit.ok) { showDiscussionMessage('Troppi click su Mi piace. Riprova tra ' + window.RSM_SECURITY.formatRetry(likeLimit.retryAfterMs) + '.', 'err'); return; }
    }
    if (viewerLikedPost) {
      var delRes = await sb.from('post_likes').delete().eq('post_id', activePost.id).eq('user_id', viewerSession.user.id);
      if (delRes.error) { showDiscussionMessage('Operazione Mi piace non riuscita: ' + delRes.error.message, 'err'); return; }
      viewerLikedPost = false; likesCount = Math.max(0, likesCount - 1); syncLikeUi(); showDiscussionMessage('Mi piace rimosso.', 'ok'); return;
    }
    var payload = { post_id: activePost.id, user_id: viewerSession.user.id, actor_username: viewerProfile.username || null };
    var insRes = await sb.from('post_likes').insert(payload);
    if (insRes.error) {
      var errMsg = String((insRes.error && insRes.error.message) || '').toLowerCase();
      if (errMsg.indexOf('duplicate key') >= 0) { viewerLikedPost = true; await loadLikes(); return; }
      if (isMissingRelationError(insRes.error)) { disableLikeUi('Like non attivi: applica supabase-security.sql.'); return; }
      showDiscussionMessage('Operazione Mi piace non riuscita: ' + insRes.error.message, 'err'); return;
    }
    viewerLikedPost = true; likesCount++; syncLikeUi(); showDiscussionMessage('Mi piace registrato.', 'ok');
    await createInteractionNotification('like', null);
  }

  /* ── comments ────────────────────────────────────────────── */
  function canViewerComment() {
    if (commentPrivacy === 'none') return { ok: false, reason: 'I commenti sono disattivati.' };
    if (!viewerSession || !viewerProfile) return { ok: false, reason: 'Accedi per poter commentare.' };
    if (commentPrivacy === 'members' && !['user', 'admin'].includes(viewerProfile.role || '')) return { ok: false, reason: 'Solo i membri verificati possono commentare.' };
    return { ok: true, reason: '' };
  }

  function syncCommentComposerState() {
    var status    = canViewerComment();
    var textarea  = document.getElementById('comment-text');
    var submitBtn = document.getElementById('comment-submit');
    if (!textarea || !submitBtn) return;
    textarea.disabled  = !status.ok;
    submitBtn.disabled = !status.ok;
    if (!status.ok) { textarea.placeholder = status.reason; showDiscussionMessage(status.reason, ''); }
    else { textarea.placeholder = 'Scrivi un commento rispettoso e costruttivo...'; showDiscussionMessage('', ''); }
  }

  async function resolveCommentPrivacy() {
    if (!activePost || !activePost.user_id) { commentPrivacy = 'all'; return; }
    var res = await sb.from('user_settings').select('comment_privacy').eq('user_id', activePost.user_id).maybeSingle();
    commentPrivacy = (res.data && res.data.comment_privacy) || 'all';
  }

  function renderComments() {
    var list = document.getElementById('comments-list');
    if (!list) return;
    if (!commentsCache.length) { list.innerHTML = '<p class="text-muted small">Nessun commento ancora. Inizia tu la discussione.</p>'; return; }
    var nowTs = Date.now();
    list.innerHTML = commentsCache.map(function (comment) {
      var author    = comment.author_username ? '@' + escapeHtml(comment.author_username) : 'Utente';
      var ownComment = !!(viewerSession && comment.user_id === viewerSession.user.id);
      var createdAt  = new Date(comment.created_at).getTime();
      var canEdit    = ownComment && (nowTs - createdAt) <= (10 * 60 * 1000);
      return '<div class="comment-item">'
        + '<div class="comment-head">'
        + '<span class="comment-author">' + author + '</span>'
        + '<time class="comment-time">' + new Date(comment.created_at).toLocaleString('it-IT') + '</time>'
        + '</div>'
        + '<div class="comment-body">' + escapeHtml(comment.content) + '</div>'
        + (canEdit || ownComment
          ? '<div class="comment-ftr">'
            + (canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" onclick="editComment(\'' + comment.id + '\')">Modifica</button>' : '')
            + (ownComment ? '<button class="btn btn-outline-secondary btn-sm" type="button" onclick="deleteComment(\'' + comment.id + '\')">Elimina</button>' : '')
            + '</div>'
          : '')
        + '</div>';
    }).join('');
  }

  async function loadComments() {
    var list = document.getElementById('comments-list');
    if (!list || !activePost || !activePost.id) return;
    var res = await sb.from('comments').select('id,post_id,user_id,author_username,content,created_at,is_hidden').eq('post_id', activePost.id).eq('is_hidden', false).order('created_at', { ascending: true });
    if (res.error) {
      if (isMissingRelationError(res.error)) { list.innerHTML = '<p class="text-muted small">Commenti non disponibili: applica supabase-security.sql su Supabase.</p>'; return; }
      list.innerHTML = '<p class="text-muted small">Errore caricamento commenti: ' + escapeHtml(res.error.message) + '</p>'; return;
    }
    commentsCache = res.data || [];
    renderComments();
  }

  async function submitComment(event) {
    event.preventDefault();
    var textarea = document.getElementById('comment-text');
    if (!textarea || !viewerSession || !viewerProfile || !activePost || !activePost.id) { showDiscussionMessage('Accedi per poter commentare.', 'err'); return; }
    var access = canViewerComment();
    if (!access.ok) { showDiscussionMessage(access.reason, 'err'); return; }
    var content = textarea.value.trim();
    if (!content) { showDiscussionMessage('Il commento non può essere vuoto.', 'err'); return; }
    if (window.RSM_SECURITY) {
      var commentLimit = window.RSM_SECURITY.checkRateLimit('comment_write', viewerSession.user.id, COMMENT_RATE_CFG);
      if (!commentLimit.ok) { showDiscussionMessage('Stai commentando troppo velocemente. Riprova tra ' + window.RSM_SECURITY.formatRetry(commentLimit.retryAfterMs) + '.', 'err'); return; }
      var safety = window.RSM_SECURITY.evaluateTextSafety(content, { minChars: 3, maxChars: 1200, maxLinks: 2, maxRepeatedChar: 6, maxRepeatedLine: 3 });
      if (!safety.ok) { window.RSM_SECURITY.recordRateFailure('comment_write', viewerSession.user.id, COMMENT_RATE_CFG); showDiscussionMessage(safety.message, 'err'); return; }
    }
    var payload = { post_id: activePost.id, user_id: viewerSession.user.id, author_username: viewerProfile.username || null, content: content, is_hidden: false };
    var res = await sb.from('comments').insert(payload).select('id').single();
    if (res.error) {
      if (window.RSM_SECURITY) window.RSM_SECURITY.recordRateFailure('comment_write', viewerSession.user.id, COMMENT_RATE_CFG);
      if (isMissingRelationError(res.error)) { showDiscussionMessage('Commenti non attivi nel database. Esegui supabase-security.sql.', 'err'); return; }
      showDiscussionMessage('Commento non salvato: ' + res.error.message, 'err'); return;
    }
    if (window.RSM_SECURITY) window.RSM_SECURITY.clearRateFailures('comment_write', viewerSession.user.id);
    await createInteractionNotification('comment', (res.data && res.data.id) || null);
    textarea.value = '';
    showDiscussionMessage('Commento pubblicato.', 'ok');
    await loadComments();
  }

  async function editComment(commentId) {
    if (!viewerSession) return;
    var comment = commentsCache.find(function (c) { return c.id === commentId; });
    if (!comment || comment.user_id !== viewerSession.user.id) return;
    if (Date.now() - new Date(comment.created_at).getTime() > 10 * 60 * 1000) { showDiscussionMessage('Puoi modificare un commento solo entro 10 minuti.', 'err'); return; }
    var next = prompt('Modifica commento:', comment.content || '');
    if (next === null) return;
    var content = String(next).trim();
    if (!content) { showDiscussionMessage('Il commento non può essere vuoto.', 'err'); return; }
    if (window.RSM_SECURITY) {
      var safety = window.RSM_SECURITY.evaluateTextSafety(content, { minChars: 3, maxChars: 1200, maxLinks: 2, maxRepeatedChar: 6, maxRepeatedLine: 3 });
      if (!safety.ok) { showDiscussionMessage(safety.message, 'err'); return; }
    }
    var res = await sb.from('comments').update({ content: content }).eq('id', commentId);
    if (res.error) { showDiscussionMessage('Modifica non riuscita: ' + res.error.message, 'err'); return; }
    showDiscussionMessage('Commento aggiornato.', 'ok');
    await loadComments();
  }

  async function deleteComment(commentId) {
    if (!viewerSession) return;
    var comment = commentsCache.find(function (c) { return c.id === commentId; });
    if (!comment || comment.user_id !== viewerSession.user.id) return;
    if (!confirm('Eliminare questo commento?')) return;
    var res = await sb.from('comments').delete().eq('id', commentId);
    if (res.error) { showDiscussionMessage('Eliminazione non riuscita: ' + res.error.message, 'err'); return; }
    showDiscussionMessage('Commento eliminato.', 'ok');
    await loadComments();
  }

  async function reportPost() {
    if (!viewerSession || !activePost || !activePost.id) { showDiscussionMessage('Accedi per inviare una segnalazione.', 'err'); return; }
    if (window.RSM_SECURITY) {
      var reportLimit = window.RSM_SECURITY.checkRateLimit('report_write', viewerSession.user.id, REPORT_RATE_CFG);
      if (!reportLimit.ok) { showDiscussionMessage('Hai inviato troppe segnalazioni. Riprova tra ' + window.RSM_SECURITY.formatRetry(reportLimit.retryAfterMs) + '.', 'err'); return; }
    }
    var reason = prompt('Motivo segnalazione (es: spam, offese, disinformazione):', 'spam');
    if (reason === null) return;
    var reasonText = String(reason || '').trim();
    if (!reasonText || reasonText.length < 3) { showDiscussionMessage('Inserisci un motivo valido (min 3 caratteri).', 'err'); return; }
    if (reasonText.length > 120) { showDiscussionMessage('Motivo troppo lungo.', 'err'); return; }
    var details = prompt('Dettagli (opzionale):', '') || '';
    var detailsText = String(details).trim();
    if (detailsText.length > 1000) { showDiscussionMessage('Dettagli troppo lunghi.', 'err'); return; }
    var links = (reasonText + '\n' + detailsText).match(/https?:\/\/|www\./gi);
    if (links && links.length > 1) { showDiscussionMessage('Segnalazione bloccata: troppi link.', 'err'); return; }
    var payload = { post_id: activePost.id, reporter_id: viewerSession.user.id, reason: reasonText, details: detailsText || null, status: 'pending' };
    var res = await sb.from('reports').insert(payload);
    if (res.error) {
      if (window.RSM_SECURITY) window.RSM_SECURITY.recordRateFailure('report_write', viewerSession.user.id, REPORT_RATE_CFG);
      var errMsg = String((res.error && res.error.message) || '').toLowerCase();
      if (errMsg.indexOf('duplicate key') >= 0) { showDiscussionMessage('Hai già segnalato questo contenuto.', 'err'); return; }
      if (isMissingRelationError(res.error)) { showDiscussionMessage('Segnalazioni non attive nel database. Esegui supabase-security.sql.', 'err'); return; }
      showDiscussionMessage('Segnalazione non inviata: ' + res.error.message, 'err'); return;
    }
    if (window.RSM_SECURITY) window.RSM_SECURITY.clearRateFailures('report_write', viewerSession.user.id);
    showDiscussionMessage('Segnalazione inviata alla moderazione. Grazie.', 'ok');
  }

  /* ── author controls ────────────────────────────────────── */
  async function hidePost() {
    if (!isAuthor || !activePost || !activePost.id) return;
    var btn = document.getElementById('hide-post-btn');
    if (!confirm('Nascondere questo articolo al pubblico? Sarà salvato come bozza.')) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Attendere…'; }
    var res = await sb.from('posts').update({ published: false, published_at: null }).eq('id', activePost.id);
    if (res.error) {
      if (btn) { btn.disabled = false; btn.textContent = '👁 Nascondi al pubblico'; }
      showDiscussionMessage('Operazione non riuscita: ' + res.error.message, 'err'); return;
    }
    showDiscussionMessage('Articolo nascosto. Verrai reindirizzato alla dashboard…', 'ok');
    setTimeout(function () { location.href = '/dashboard'; }, 1500);
  }

  async function deletePost() {
    if (!isAuthor || !activePost || !activePost.id) return;
    var btn = document.getElementById('delete-post-btn');
    if (!confirm('Eliminare definitivamente questo articolo? L\'operazione non può essere annullata.')) return;
    if (!confirm('Sei sicuro? L\'articolo sarà cancellato per sempre.')) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Eliminazione…'; }
    var res = await sb.from('posts').delete().eq('id', activePost.id);
    if (res.error) {
      if (btn) { btn.disabled = false; btn.textContent = '🗑 Elimina articolo'; }
      showDiscussionMessage('Eliminazione non riuscita: ' + res.error.message, 'err'); return;
    }
    showDiscussionMessage('Articolo eliminato. Verrai reindirizzato…', 'ok');
    setTimeout(function () { location.href = '/post'; }, 1500);
  }

  function bindDiscussionHandlers() {
    var form      = document.getElementById('comment-form');
    var reportBtn = document.getElementById('report-post-btn');
    var likeBtn   = document.getElementById('like-btn');
    var hideBtn   = document.getElementById('hide-post-btn');
    var deleteBtn = document.getElementById('delete-post-btn');
    if (form)      form.addEventListener('submit', submitComment);
    if (reportBtn) reportBtn.addEventListener('click', reportPost);
    if (likeBtn)   likeBtn.addEventListener('click', toggleLike);
    if (hideBtn)   hideBtn.addEventListener('click', hidePost);
    if (deleteBtn) deleteBtn.addEventListener('click', deletePost);
  }

})();