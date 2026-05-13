(function () {
  var DECORATED_ATTR = 'data-rsm-iconized';
  var SHELL_CLASS = 'rsm-icon-shell';
  var ICON_CLASS = 'rsm-inline-icon';
  var TEXT_CLASS = 'rsm-icon-text';
  var DEFAULT_ICON = 'fa-solid fa-sparkles';
  var MIN_PARAGRAPH_LENGTH = 8;
  var route = (window.location.pathname || '/').replace(/\/+/g, '/').replace(/\/+$/, '') || '/';
  var pageKey = route === '/' ? 'home' : route.slice(1);

  var PAGE_ICONS = {
    home: 'fa-solid fa-water',
    login: 'fa-solid fa-right-to-bracket',
    dashboard: 'fa-solid fa-gauge-high',
    write: 'fa-solid fa-pen-nib',
    profile: 'fa-solid fa-user',
    category: 'fa-solid fa-folder-open',
    post: 'fa-solid fa-newspaper',
    preferenze: 'fa-solid fa-sliders',
    'modifica-profilo': 'fa-solid fa-user-pen',
    reset: 'fa-solid fa-key',
    'db-test': 'fa-solid fa-flask-vial',
    storia: 'fa-solid fa-clock-rotate-left',
    privacy: 'fa-solid fa-shield-halved',
    cookie: 'fa-solid fa-cookie-bite',
    'note-legali': 'fa-solid fa-scale-balanced'
  };

  var CONTEXT_ICONS = [
    { selector: '#newsletter-modal', icon: 'fa-solid fa-envelope' },
    { selector: '#banner, #intro', icon: 'fa-solid fa-water' },
    { selector: '#mappa', icon: 'fa-solid fa-compass' },
    { selector: '#festa', icon: 'fa-solid fa-fish-fins' },
    { selector: '#eventi', icon: 'fa-solid fa-calendar-days' },
    { selector: '#galleria', icon: 'fa-solid fa-camera-retro' },
    { selector: '#territorio', icon: 'fa-solid fa-tree' },
    { selector: '#contatti', icon: 'fa-solid fa-map-location-dot' },
    { selector: '#view-login', icon: 'fa-solid fa-right-to-bracket' },
    { selector: '#view-register1', icon: 'fa-solid fa-user-plus' },
    { selector: '#view-register2', icon: 'fa-solid fa-id-card' },
    { selector: '#view-forgot', icon: 'fa-solid fa-key' },
    { selector: '#view-verify', icon: 'fa-solid fa-envelope-open' },
    { selector: '#dashboard', icon: 'fa-solid fa-gauge-high' },
    { selector: '#analytics', icon: 'fa-solid fa-chart-line' },
    { selector: '#contenuti', icon: 'fa-solid fa-pen-nib' },
    { selector: '#media', icon: 'fa-solid fa-bell' },
    { selector: '.rsm-write__intro', icon: 'fa-solid fa-pen-nib' },
    { selector: '.rsm-write__editor', icon: 'fa-solid fa-file-lines' },
    { selector: '.rsm-write__side', icon: 'fa-solid fa-chart-column' },
    { selector: '.rsm-profile-hero', icon: 'fa-solid fa-user' },
    { selector: '.rsm-profile-posts', icon: 'fa-solid fa-newspaper' },
    { selector: '.rsm-category-hero', icon: 'fa-solid fa-folder-open' },
    { selector: '.rsm-category-feed', icon: 'fa-solid fa-layer-group' },
    { selector: '#article-body, .content', icon: 'fa-solid fa-newspaper' },
    { selector: '#discussion, .comment-card', icon: 'fa-solid fa-comments' },
    { selector: '.release-card, .commit-block', icon: 'fa-solid fa-code-commit' },
    { selector: '.numbers-bento, .uptime-row', icon: 'fa-solid fa-chart-line' },
    { selector: '.timeline-entry', icon: 'fa-solid fa-code-branch' }
  ];

  var BASE_TARGETS = [
    'h1', 'h2', 'h3', 'p',
    '.rsm-h1', '.rsm-h2', '.rsm-kicker', '.rsm-lead', '.rsm-body',
    '.rsm-banner__title', '.rsm-banner__sub', '.rsm-modal__title',
    '.page-title', '.page-eyebrow', '.page-sub',
    '.card-title', '.section-title', '.section-kicker', '.section-label',
    '.timeline-heading', '.timeline-date',
    '.hero-eyebrow', '.hero-title', '.hero-subtitle',
    '.bc-kicker', '.bc-title', '.bc-sub', '.bc-stat-label', '.bc-stat-sub', '.bc-kpi-lbl', '.bc-kpi-meta',
    '.post-title', '.post-lead', '.reading-kicker', '.discussion-note', '.note-line',
    '.rsm-category-title', '.rsm-profile-username',
    '.rsm-write__kicker', '.rsm-write__side-title', '.rsm-write__side-text',
    '.rsm-atlas-note', '.rsm-atlas-guide', '.rsm-valli__drop',
    '.release-changes-title', '.release-vname', '.release-date-text', '.rel-msg', '.rel-author',
    '.fn-card-title', '.error-wrap h2', '.error-wrap p'
  ];
  var DOC_TARGETS = ['h1', 'h2', 'h3', 'p', '.doc-eyebrow', '.doc-title', '.doc-meta', '.toc-title', '.section-title', '.highlight-box'];
  var HERO_TARGETS = ['h1', 'p', '.hero-eyebrow', '.hero-title', '.hero-subtitle'];
  var PAGE_WRAP_TARGETS = ['p', '.section-label', '.timeline-heading', '.timeline-date', '.fn-card-title', '.release-changes-title', '.release-vname', '.release-date-text', '.rel-msg', '.rel-author'];
  var NEWSLETTER_TARGETS = ['.rsm-kicker', '.rsm-modal__title', '.rsm-lead'];
  var POST_TARGETS = ['h1', 'h2', 'h3', 'p', '.post-title', '.post-lead', '.reading-kicker', '.discussion-note'];
  var TARGET_SELECTOR = [
    'main :is(' + BASE_TARGETS.join(', ') + ')',
    '.doc-wrap :is(' + DOC_TARGETS.join(', ') + ')',
    '.hero :is(' + HERO_TARGETS.join(', ') + ')',
    '.page-wrap :is(' + PAGE_WRAP_TARGETS.join(', ') + ')',
    '#newsletter-modal :is(' + NEWSLETTER_TARGETS.join(', ') + ')',
    '#wrap :is(' + POST_TARGETS.join(', ') + ')'
  ].join(', ');

  function resolveIcon(node) {
    for (var i = 0; i < CONTEXT_ICONS.length; i += 1) {
      if (node.closest(CONTEXT_ICONS[i].selector)) return CONTEXT_ICONS[i].icon;
    }
    return PAGE_ICONS[pageKey] || DEFAULT_ICON;
  }

  function resolveTone(node) {
    if (node.matches('.rsm-kicker, .doc-eyebrow, .doc-meta, .toc-title, .section-kicker, .section-label, .timeline-date, .hero-eyebrow, .page-eyebrow, .bc-kicker, .bc-stat-label, .bc-kpi-lbl, .bc-kpi-meta, .reading-kicker, .discussion-note, .rsm-write__kicker, .release-changes-title, .release-date-text, .rel-author')) {
      return 'soft';
    }
    if (node.matches('p, .rsm-lead, .rsm-body, .hero-subtitle, .page-sub, .bc-sub, .bc-stat-sub, .post-lead, .note-line, .rsm-write__side-text, .rsm-atlas-note, .rsm-atlas-guide, .rsm-valli__drop, .highlight-box, .rel-msg, .error-wrap p')) {
      return 'muted';
    }
    return 'default';
  }

  function shouldDecorate(node) {
    if (!node || node.nodeType !== 1 || node.getAttribute(DECORATED_ATTR) === 'true') return false;
    if (node.closest('.rsm-foot, footer, nav, button, label, a, .emoji-grid, [aria-hidden="true"]')) return false;
    if (node.querySelector('input, textarea, select, button')) return false;
    var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
    if (node.matches('p') && text.length < MIN_PARAGRAPH_LENGTH) return false;
    return true;
  }

  function decorate(node) {
    if (!shouldDecorate(node)) return;

    var shell = document.createElement('span');
    shell.className = SHELL_CLASS;

    var iconWrap = document.createElement('span');
    iconWrap.className = ICON_CLASS;
    iconWrap.setAttribute('aria-hidden', 'true');

    var icon = document.createElement('i');
    icon.className = resolveIcon(node);
    icon.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(icon);

    var textWrap = document.createElement('span');
    textWrap.className = TEXT_CLASS;

    while (node.firstChild) {
      textWrap.appendChild(node.firstChild);
    }

    shell.appendChild(iconWrap);
    shell.appendChild(textWrap);
    node.appendChild(shell);
    node.classList.add('rsm-iconized');
    node.dataset.rsmIconTone = resolveTone(node);
    node.setAttribute(DECORATED_ATTR, 'true');
  }

  function decorateAll() {
    document.querySelectorAll(TARGET_SELECTOR).forEach(decorate);
  }

  function decorateTree(node) {
    if (!node || node.nodeType !== 1) return;
    if (typeof node.matches === 'function' && node.matches(TARGET_SELECTOR)) {
      decorate(node);
    }
    if (typeof node.querySelectorAll === 'function') {
      node.querySelectorAll(TARGET_SELECTOR).forEach(decorate);
    }
  }

  decorateAll();

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
        decorateTree(node);
      });
    });
  });

  [
    document.querySelector('main'),
    document.querySelector('.doc-wrap'),
    document.querySelector('.hero'),
    document.querySelector('.page-wrap'),
    document.querySelector('#newsletter-modal'),
    document.querySelector('#wrap')
  ].filter(Boolean).forEach(function (root) {
    observer.observe(root, { childList: true, subtree: true });
  });
}());
