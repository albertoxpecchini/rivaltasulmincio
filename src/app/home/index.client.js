(function () {
  var SPRITES = '/vendor/bootstrap-italia/svg/sprites.svg';
  var grid = document.getElementById('posts-grid');
  var statusEl = document.getElementById('news-status');
  var emptyEl = document.getElementById('news-empty');
  if (!grid) return;

  function escapeHtml(v) {
    return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmt(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function isHttps(u) { try { return new URL(u).protocol === 'https:'; } catch (_) { return false; } }

  if (typeof SUPABASE_URL === 'undefined' || String(SUPABASE_URL).includes('your-project') || typeof supabase === 'undefined') {
    if (statusEl) statusEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  sb.from('posts')
    .select('id,title,excerpt,category,badge,badge_color,image_url,published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(9)
    .then(function (res) {
      if (statusEl) statusEl.style.display = 'none';
      var rows = (res && res.data) || [];
      if (res.error || !rows.length) {
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }
      grid.innerHTML = rows.map(function (post) {
        var href = '/post?id=' + encodeURIComponent(post.id);
        var media = isHttps(post.image_url)
          ? '<a href="' + href + '"><img class="rsm-post-thumb" src="' + escapeHtml(post.image_url) + '" alt="" loading="lazy" /></a>'
          : '<a href="' + href + '"><span class="rsm-post-thumb rsm-post-thumb--empty"></span></a>';
        return '<div class="col-12 col-sm-6 col-lg-4">' +
          '<div class="card-wrapper h-100"><div class="card card-bg h-100">' +
            media +
            '<div class="card-body">' +
              '<div class="d-flex align-items-center gap-2 mb-2">' +
                '<span class="badge bg-primary">' + escapeHtml(post.badge || post.category || 'News') + '</span>' +
                '<span class="text-muted small">' + escapeHtml(fmt(post.published_at)) + '</span>' +
              '</div>' +
              '<h3 class="card-title h5"><a href="' + href + '">' + escapeHtml(post.title || 'Articolo') + '</a></h3>' +
              '<p class="card-text">' + escapeHtml(post.excerpt || '') + '</p>' +
              '<a class="read-more" href="' + href + '"><span class="text">Leggi articolo</span>' +
                '<svg class="icon"><use href="' + SPRITES + '#it-arrow-right"></use></svg></a>' +
            '</div>' +
          '</div></div>' +
        '</div>';
      }).join('');
    });
})();