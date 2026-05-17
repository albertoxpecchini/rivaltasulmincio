(function () {
  var DECORATED_ATTR = 'data-rsm-iconized';
  var SHELL_CLASS = 'rsm-icon-shell';
  var ICON_CLASS = 'rsm-inline-icon';
  var TEXT_CLASS = 'rsm-icon-text';
  var DEFAULT_ICON = 'fa-solid fa-sparkles';
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

  var BASE_TARGETS = ['h1', 'h2'];
  var DOC_TARGETS = ['h1', 'h2'];
  var HERO_TARGETS = ['h1', 'h2'];
  var PAGE_WRAP_TARGETS = ['h1', 'h2'];
  var NEWSLETTER_TARGETS = ['h1', 'h2'];
  var POST_TARGETS = ['h1', 'h2'];
  var TARGET_SELECTOR = [
    'main :is(' + BASE_TARGETS.join(', ') + ')',
    '.doc-wrap :is(' + DOC_TARGETS.join(', ') + ')',
    '.hero :is(' + HERO_TARGETS.join(', ') + ')',
    '.page-wrap :is(' + PAGE_WRAP_TARGETS.join(', ') + ')',
    '#newsletter-modal :is(' + NEWSLETTER_TARGETS.join(', ') + ')',
    '#wrap :is(' + POST_TARGETS.join(', ') + ')'
  ].join(', ');

  function resolveIcon(node) {
    return PAGE_ICONS[pageKey] || DEFAULT_ICON;
  }

  function resolveTone(node) {
    return 'default';
  }

  function shouldDecorate(node) {
    if (!node || node.nodeType !== 1 || node.getAttribute(DECORATED_ATTR) === 'true') return false;
    if (node.closest('.rsm-foot, footer, nav, button, label, a, .emoji-grid, [aria-hidden="true"]')) return false;
    if (node.querySelector('input, textarea, select, button')) return false;
    if (!/^H[12]$/i.test(node.tagName || '')) return false;
    var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
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
