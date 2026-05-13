(function () {
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

  /* ── Supabase helpers ──────────────────────────────────────── */
  function canUseSupabase() {
    return typeof supabase !== 'undefined'
      && typeof supabase.createClient === 'function'
      && typeof SUPABASE_URL !== 'undefined'
      && !String(SUPABASE_URL || '').includes('your-project');
  }

  function createClient() {
    if (window.RSM_SUPABASE && typeof window.RSM_SUPABASE.createClient === 'function') {
      return window.RSM_SUPABASE.createClient();
    }
    if (!canUseSupabase()) return null;
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /* ── Dropdown profilo ──────────────────────────────────────── */
  function getCurrentPath() {
    return String(window.location.pathname || '').toLowerCase();
  }

  function closeDropdown() {
    var dropdown = $('#profileDropdown');
    var button = $('#profileBtn');
    var header = $('[data-rsm-topbar]');
    if (dropdown) dropdown.classList.remove('open');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (header) header.classList.remove('menu-open');
  }

  function item(label, href, active, primary, iconClass) {
    var icon = iconClass ? '<i class="' + iconClass + '" aria-hidden="true"></i>' : '';
    return '<a href="' + href + '" role="menuitem" class="' + (active ? 'active ' : '') + (primary ? 'item-primary' : '') + '"><span>' + icon + '<span>' + label + '</span></span><span aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span></a>';
  }

  function buildMenu(username, color, emoji, email) {
    var current = getCurrentPath();
    var queryUser = new URLSearchParams(window.location.search).get('u');
    var safeUsername = escapeHtml(username || 'utente');
    var safeEmail = escapeHtml(email || 'account attivo');
    var safePage = escapeHtml((window.location.pathname || '/').replace(/^\//, '') || 'home');
    var profileHref = 'profile?u=' + encodeURIComponent(username || 'utente');
    var isProfile = current.indexOf('profile') >= 0;
    var isDashboard = current.indexOf('/dashboard') >= 0 || current.indexOf('/me') >= 0;
    var isWrite = current.indexOf('write') >= 0;
    var isCategory = current.indexOf('/category') >= 0;
    var isPreferences = current.indexOf('preferenze') >= 0;
    var isReset = current.indexOf('reset') >= 0;
    var isEditProfile = current.indexOf('modifica-profilo') >= 0;
    var isStoria = current.indexOf('storia') >= 0;
    var isPrivacy = current.indexOf('privacy') >= 0;
    var isCookie = current.indexOf('cookie') >= 0;
    var isNoteLegali = current.indexOf('note-legali') >= 0;
    var canEditProfile = (isProfile && queryUser === username) || isEditProfile;
    var accent = escapeHtml(color || '#2f6b67');
    var avatar = emoji ? escapeHtml(emoji) : '<i class="fa-solid fa-user" aria-hidden="true"></i>';
    var editItem = canEditProfile
      ? item('Modifica profilo', 'modifica-profilo', isEditProfile, false, 'fa-solid fa-user-pen')
      : '';

    return '<div class="profile-menu" id="profileMenu">'
      + '<button class="profile-btn" id="profileBtn" type="button" aria-haspopup="true" aria-expanded="false">'
      + '<span class="profile-avatar" style="background:' + accent + '">' + avatar + '</span>'
      + '<span>@' + safeUsername + '</span>'
      + '</button>'
      + '<div class="profile-dropdown" id="profileDropdown" role="menu" aria-label="Menu navigazione">'
      + '<div class="profile-dropdown__meta"><strong>@' + safeUsername + '</strong><span>' + safeEmail + '</span><span>Pagina: ' + safePage + '</span></div>'
      + '<div class="profile-dropdown__sep"></div>'
      + '<div class="profile-dropdown__section-title">Navigazione</div>'
      + item('Profilo', profileHref, isProfile && !isEditProfile, false, 'fa-solid fa-user')
      + item('Dashboard', '/dashboard', isDashboard, false, 'fa-solid fa-gauge-high')
      + editItem
      + item('Scrivi', 'write', isWrite, true, 'fa-solid fa-pen-nib')
      + item('Categorie', '/category', isCategory, false, 'fa-solid fa-folder-open')
      + item('Aspetto', 'preferenze', isPreferences, false, 'fa-solid fa-palette')
      + item('Reimposta Password', 'reset', isReset, false, 'fa-solid fa-key')
      + '<div class="profile-dropdown__sep"></div>'
      + '<div class="profile-dropdown__section-title">Sito</div>'
      + item('Storia', '/storia', isStoria, false, 'fa-solid fa-landmark')
      + item('Privacy', '/privacy', isPrivacy, false, 'fa-solid fa-shield-halved')
      + item('Cookie', '/cookie', isCookie, false, 'fa-solid fa-cookie-bite')
      + item('Note legali', '/note-legali', isNoteLegali, false, 'fa-solid fa-scale-balanced')
      + '<div class="profile-dropdown__sep"></div>'
      + '<button type="button" data-action="logout" class="danger" role="menuitem"><span><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Esci</span></span><span aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span></button>'
      + '</div></div>';
  }

  function bindMenu(client) {
    var menu = $('#profileMenu');
    var button = $('#profileBtn');
    var dropdown = $('#profileDropdown');
    var header = $('[data-rsm-topbar]');
    if (!menu || !button || !dropdown) return;

    var autoCloseTimer = null;
    var leaveTimer = null;

    function clearAutoCloseTimer() {
      if (!autoCloseTimer) return;
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    function scheduleAutoClose() {
      clearAutoCloseTimer();
      autoCloseTimer = setTimeout(function () {
        closeDropdown();
      }, 10000);
    }

    function openDropdown() {
      dropdown.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      if (header) header.classList.add('menu-open');
      scheduleAutoClose();
    }

    function clearLeaveTimer() {
      if (!leaveTimer) return;
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }

    button.addEventListener('click', function (event) {
      /* apertura solo hover, niente toggle su click */
      event.preventDefault();
      event.stopPropagation();
    });

    menu.addEventListener('mouseenter', function () {
      clearLeaveTimer();
      openDropdown();
    });

    menu.addEventListener('mouseleave', function () {
      clearLeaveTimer();
      leaveTimer = setTimeout(function () {
        clearAutoCloseTimer();
        closeDropdown();
      }, 120);
    });

    $all('[data-action="logout"]', dropdown).forEach(function (logoutButton) {
      logoutButton.addEventListener('click', function () {
        clearAutoCloseTimer();
        client.auth.signOut().then(function () {
          window.location.reload();
        });
      });
    });

    $all('a', dropdown).forEach(function (link) {
      link.addEventListener('click', closeDropdown);
    });
  }

  /* ── Auth render ───────────────────────────────────────────── */
  function renderGuest(nav) {
    nav.innerHTML = '<a href="login" class="nav-login"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i><span>Accedi</span></a>';
  }

  function renderSession(nav, session, profile) {
    var emailName = String(session.user && session.user.email || 'profilo').split('@')[0] || 'profilo';
    var username = (profile && profile.username) || emailName;
    nav.innerHTML = buildMenu(username, profile && profile.avatar_color, profile && profile.avatar_emoji, session.user && session.user.email);
  }

  /* ── Ricerca ───────────────────────────────────────────────── */
  var SEARCH_INDEX = [
    { title: 'Intro',                 desc: 'La panoramica iniziale su Rivalta e il Mincio', url: '/#intro',      icon: 'fa-solid fa-house' },
    { title: 'Festa del Pesce',       desc: 'Date, menu e dettagli della festa',            url: '/#festa',      icon: 'fa-solid fa-fish-fins' },
    { title: 'Eventi',                desc: 'Calendario di appuntamenti e iniziative',      url: '/#eventi',     icon: 'fa-solid fa-calendar-days' },
    { title: 'Galleria',              desc: 'Foto e video dal territorio',                  url: '/#galleria',   icon: 'fa-solid fa-camera-retro' },
    { title: 'Territorio',            desc: 'Atlante, valli ed esperienze sul Mincio',      url: '/#territorio', icon: 'fa-solid fa-tree' },
    { title: 'Contatti',              desc: 'Come raggiungerci e scriverci',                url: '/#contatti',   icon: 'fa-solid fa-map-location-dot' },
    { title: 'Categorie',             desc: 'Tutti gli argomenti e le sezioni',         url: '/category', icon: 'fa-solid fa-folder-open' },
    { title: 'Dashboard',             desc: 'Il tuo spazio personale',                  url: '/dashboard',icon: 'fa-solid fa-gauge-high' },
    { title: 'Scrivi un articolo',    desc: 'Pubblica contenuti sul sito',              url: '/write',    icon: 'fa-solid fa-pen-nib' },
    { title: 'Comunità',              desc: 'Le persone e i luoghi di Rivalta',         url: '/category', icon: 'fa-solid fa-users' },
    { title: 'Profilo utente',        desc: 'Visualizza e modifica il tuo profilo',     url: '/profile',  icon: 'fa-solid fa-user' },
    { title: 'Preferenze aspetto',    desc: 'Tema, font e impostazioni visive',         url: '/preferenze',icon: 'fa-solid fa-sliders' },
    { title: 'Pro Loco Rivalta',      desc: "L'associazione del territorio",            url: '/',         icon: 'fa-solid fa-landmark' },
  ];

  function searchItems(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(function (r) {
      return r.title.toLowerCase().indexOf(q) >= 0
          || r.desc.toLowerCase().indexOf(q) >= 0;
    }).slice(0, 7);
  }

  function renderResults(results, query) {
    var list = $('#searchResults');
    if (!list) return;
    if (!query.trim()) { list.innerHTML = ''; return; }
    if (!results.length) {
      list.innerHTML = '<li class="search-empty">Nessun risultato per «<em>' + escapeHtml(query) + '</em>»</li>';
      return;
    }
    list.innerHTML = results.map(function (r) {
      return '<li><a class="search-result-item" href="' + escapeHtml(r.url) + '">'
        + '<span class="search-result-icon" aria-hidden="true"><i class="' + escapeHtml(r.icon) + '"></i></span>'
        + '<span class="search-result-body">'
        + '<span class="search-result-title">' + escapeHtml(r.title) + '</span>'
        + '<span class="search-result-desc">' + escapeHtml(r.desc) + '</span>'
        + '</span>'
        + '<span class="search-result-arrow" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>'
        + '</a></li>';
    }).join('');
  }

  function syncPanelHeight(panel, inner) {
    panel.style.height = panel.classList.contains('open')
      ? inner.scrollHeight + 'px'
      : '0';
  }

  function initSearch() {
    var toggle = $('#searchToggle');
    var panel  = $('#searchPanel');
    if (!toggle || !panel) return;
    var inner  = panel.querySelector('.search-panel-inner');
    var input  = $('#searchInput');
    if (!inner || !input) return;

    function openSearch() {
      panel.classList.add('open');
      panel.removeAttribute('aria-hidden');
      toggle.setAttribute('aria-expanded', 'true');
      syncPanelHeight(panel, inner);
      input.focus();
    }

    function closeSearch() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      syncPanelHeight(panel, inner);
      input.value = '';
      renderResults([], '');
    }

    toggle.addEventListener('click', function () {
      panel.classList.contains('open') ? closeSearch() : openSearch();
    });

    window.addEventListener('resize', function () {
      if (panel.classList.contains('open')) syncPanelHeight(panel, inner);
    });

    var debounce;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var q = input.value;
      debounce = setTimeout(function () {
        renderResults(searchItems(q), q);
        syncPanelHeight(panel, inner);
      }, 110);
    });

    $all('.search-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-q') || '';
        renderResults(searchItems(input.value), input.value);
        syncPanelHeight(panel, inner);
        input.focus();
      });
    });

    /* '/' apre la ricerca quando non si è in un campo testo */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (panel.classList.contains('open')) { closeSearch(); toggle.focus(); }
        else closeDropdown();
        return;
      }
      if (e.key === '/' && !panel.classList.contains('open')) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          openSearch();
        }
      }
    });

    /* click fuori chiude */
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('open')) return;
      var header = $('[data-rsm-topbar]');
      if (header && !header.contains(e.target)) closeSearch();
    }, { capture: true });
  }

  /* ── Init topbar (auth) ────────────────────────────────────── */
  async function initTopbar() {
    var nav = $('#nav-auth');
    if (!nav) return;

    var client = createClient();
    if (!client) {
      renderGuest(nav);
      return;
    }

    async function resolveProfile(session) {
      if (!session || !session.user || !session.user.id) return null;
      try {
        var result = await client.from('profiles')
          .select('username,avatar_emoji,avatar_color')
          .eq('id', session.user.id)
          .maybeSingle();
        return result && result.data ? result.data : null;
      } catch (_) {
        return null;
      }
    }

    async function render(session) {
      if (!session) { renderGuest(nav); return; }
      var profile = await resolveProfile(session);
      renderSession(nav, session, profile);
      bindMenu(client);
    }

    /* document-level listeners (una sola volta) */
    if (!window.__RSM_TOPBAR_BOUND__) {
      document.addEventListener('click', function (event) {
        var menu = $('#profileMenu');
        if (menu && !menu.contains(event.target)) closeDropdown();
      }, { capture: true });
      window.__RSM_TOPBAR_BOUND__ = true;
    }

    client.auth.onAuthStateChange(function (_event, session) {
      render(session);
    });

    try {
      var result = await client.auth.getSession();
      await render(result && result.data ? result.data.session : null);
    } catch (_) {
      renderGuest(nav);
    }
  }

  initSearch();
  initTopbar();
})();
