(function () {
  var SPRITES = '/vendor/bootstrap-italia/svg/sprites.svg';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }
  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function icon(name) {
    return '<svg class="icon icon-sm"><use href="' + SPRITES + '#' + name + '"></use></svg>';
  }

  /* ── Supabase helpers ──────────────────────────────────────── */
  function createClient() {
    if (window.RSM_SUPABASE && typeof window.RSM_SUPABASE.createClient === 'function') {
      try { return window.RSM_SUPABASE.createClient(); } catch (_) { return null; }
    }
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') return null;
    if (typeof SUPABASE_URL === 'undefined' || String(SUPABASE_URL || '').includes('your-project')) return null;
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function authSlots() {
    return $all('#nav-auth, #nav-auth-mobile');
  }

  /* ── Auth render ───────────────────────────────────────────── */
  function guestHtml() {
    return '<a class="btn btn-primary btn-sm btn-icon" href="/login">' +
      icon('it-user') + '<span>Accedi</span></a>';
  }

  function menuHtml(username, email) {
    var u = escapeHtml(username || 'utente');
    var e = escapeHtml(email || 'account attivo');
    var profileHref = '/profile?u=' + encodeURIComponent(username || 'utente');
    function it(label, href, name) {
      return '<li><a class="dropdown-item list-item" href="' + href + '">' + icon(name) + '<span>' + label + '</span></a></li>';
    }
    return '<div class="dropdown">' +
      '<button class="btn btn-primary btn-sm dropdown-toggle btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
        icon('it-user') + '<span>@' + u + '</span></button>' +
      '<div class="dropdown-menu dropdown-menu-end">' +
        '<div class="link-list-wrapper">' +
          '<ul class="link-list">' +
            '<li><span class="dropdown-item text-muted small">' + e + '</span></li>' +
            '<li><span class="divider"></span></li>' +
            it('Profilo', profileHref, 'it-user') +
            it('Dashboard', '/dashboard', 'it-pa') +
            it('Scrivi', '/write', 'it-pencil') +
            it('Categorie', '/category', 'it-folder') +
            it('Reimposta password', '/reset', 'it-key') +
            '<li><span class="divider"></span></li>' +
            '<li><a class="dropdown-item list-item" href="#" data-action="logout">' + icon('it-logout') + '<span>Esci</span></a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderAuth(html, client) {
    authSlots().forEach(function (slot) { slot.innerHTML = html; });
    if (client) {
      $all('[data-action="logout"]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          client.auth.signOut().then(function () { window.location.reload(); });
        });
      });
    }
  }

  async function initAuth() {
    if (!authSlots().length) return;
    var client = createClient();
    if (!client) { renderAuth(guestHtml(), null); return; }

    async function resolveProfile(session) {
      if (!session || !session.user || !session.user.id) return null;
      try {
        var res = await client.from('profiles')
          .select('username,avatar_emoji,avatar_color')
          .eq('id', session.user.id)
          .maybeSingle();
        return res && res.data ? res.data : null;
      } catch (_) { return null; }
    }

    async function render(session) {
      if (!session) { renderAuth(guestHtml(), client); return; }
      var profile = await resolveProfile(session);
      var emailName = String(session.user && session.user.email || 'profilo').split('@')[0] || 'profilo';
      var username = (profile && profile.username) || emailName;
      renderAuth(menuHtml(username, session.user && session.user.email), client);
    }

    client.auth.onAuthStateChange(function (_event, session) { render(session); });
    try {
      var result = await client.auth.getSession();
      await render(result && result.data ? result.data.session : null);
    } catch (_) {
      renderAuth(guestHtml(), client);
    }
  }

  /* ── Ricerca ───────────────────────────────────────────────── */
  var SEARCH_INDEX = [
    { title: 'Intro',              desc: 'Panoramica su Rivalta e il Mincio',       url: '/#intro' },
    { title: 'Festa del Pesce',    desc: 'Date, menu e dettagli della festa',       url: '/#festa' },
    { title: 'Eventi',             desc: 'Calendario di appuntamenti e iniziative', url: '/#eventi' },
    { title: 'Galleria',           desc: 'Foto e video dal territorio',             url: '/#galleria' },
    { title: 'Territorio',         desc: 'Atlante, valli ed esperienze sul Mincio', url: '/#territorio' },
    { title: 'Contatti',           desc: 'Come raggiungerci e scriverci',           url: '/#contatti' },
    { title: 'Categorie',          desc: 'Tutti gli argomenti e le sezioni',        url: '/category' },
    { title: 'Origini di Rivalta', desc: 'Le origini storiche del borgo',           url: '/origini' },
    { title: 'Storia del sito',    desc: 'Come è nato e cresciuto il sito',         url: '/storia' },
    { title: 'Dashboard',          desc: 'Il tuo spazio personale',                 url: '/dashboard' },
    { title: 'Scrivi un articolo', desc: 'Pubblica contenuti sul sito',             url: '/write' },
    { title: 'Profilo utente',     desc: 'Visualizza e modifica il tuo profilo',    url: '/profile' },
    { title: 'Pro Loco Rivalta',   desc: "L'associazione del territorio",           url: '/' }
  ];

  function searchItems(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(function (r) {
      return r.title.toLowerCase().indexOf(q) >= 0 || r.desc.toLowerCase().indexOf(q) >= 0;
    }).slice(0, 8);
  }

  function renderResults(results, query) {
    var list = $('#searchResults');
    if (!list) return;
    if (!query.trim()) { list.innerHTML = ''; return; }
    if (!results.length) {
      list.innerHTML = '<li><span class="list-item text-muted">Nessun risultato per «' + escapeHtml(query) + '»</span></li>';
      return;
    }
    list.innerHTML = results.map(function (r) {
      return '<li><a class="list-item" href="' + escapeHtml(r.url) + '">' +
        '<span class="d-flex flex-column">' +
          '<span class="fw-semibold">' + escapeHtml(r.title) + '</span>' +
          '<small class="text-muted">' + escapeHtml(r.desc) + '</small>' +
        '</span></a></li>';
    }).join('');
  }

  function initSearch() {
    var input = $('#searchInput');
    var modal = $('#searchModal');
    if (!input) return;

    var debounce;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var q = input.value;
      debounce = setTimeout(function () { renderResults(searchItems(q), q); }, 110);
    });

    $all('.rsm-search-chips .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-q') || '';
        renderResults(searchItems(input.value), input.value);
        input.focus();
      });
    });

    if (modal) {
      modal.addEventListener('shown.bs.modal', function () { input.focus(); });
    }

    /* '/' apre la ricerca quando non si è in un campo testo */
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || !modal || !window.bootstrap || !window.bootstrap.Modal) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      window.bootstrap.Modal.getOrCreateInstance(modal).show();
    });
  }

  /* ── Newsletter ────────────────────────────────────────────── */
  function initNewsletter() {
    var form = $('#newsletter-modal-form');
    var input = $('#newsletter-modal-email');
    var status = $('#newsletter-modal-status');
    var btn = $('#newsletter-modal-btn');
    var wrap = $('#newsletter-modal-form-wrap');
    var success = $('#newsletter-modal-success');
    if (!form || !input || !status) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Inserisci un indirizzo email valido.';
        status.className = 'form-text small mt-1 text-danger';
        input.focus();
        return;
      }
      if (btn) btn.disabled = true;
      status.textContent = 'Invio in corso…';
      status.className = 'form-text small mt-1 text-muted';

      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.ok) {
            form.reset();
            status.textContent = '';
            if (wrap) wrap.classList.add('d-none');
            if (success) success.classList.remove('d-none');
            if (btn) btn.classList.add('d-none');
          } else {
            status.textContent = (data && data.error) || 'Errore durante l\'iscrizione. Riprova.';
            status.className = 'form-text small mt-1 text-danger';
            if (btn) btn.disabled = false;
          }
        })
        .catch(function () {
          status.textContent = 'Errore di rete. Controlla la connessione e riprova.';
          status.className = 'form-text small mt-1 text-danger';
          if (btn) btn.disabled = false;
        });
    });
  }

  initAuth();
  initSearch();
  initNewsletter();
})();
