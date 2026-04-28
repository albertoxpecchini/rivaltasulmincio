(function (global) {
  'use strict';

  var CATEGORY_ORDER = [
    'Eventi',
    'Territorio',
    'Vita locale',
    'Avvisi',
    'Richieste',
    'Storie'
  ];

  var LEGACY_TO_CANONICAL = {
    'eventi': 'Eventi',
    'territorio': 'Territorio',
    'vita locale': 'Vita locale',
    'avvisi': 'Avvisi',
    'richieste': 'Richieste',
    'storie': 'Storie',
    'il luccio': 'Storie',
    'fauna': 'Territorio',
    'ambiente': 'Territorio',
    'ecoturismo': 'Territorio',
    'storia': 'Storie'
  };

  var BADGE_COLOR_BY_CATEGORY = {
    'Eventi': 'green',
    'Territorio': 'default',
    'Vita locale': 'default',
    'Avvisi': 'green',
    'Richieste': 'green',
    'Storie': 'default'
  };

  function canonical(input) {
    var raw = String(input || '').trim();
    if (!raw) return '';

    var normalized = raw.toLowerCase();
    if (LEGACY_TO_CANONICAL[normalized]) {
      return LEGACY_TO_CANONICAL[normalized];
    }

    for (var i = 0; i < CATEGORY_ORDER.length; i += 1) {
      if (CATEGORY_ORDER[i].toLowerCase() === normalized) {
        return CATEGORY_ORDER[i];
      }
    }

    return raw;
  }

  function isKnown(input) {
    var cat = canonical(input);
    return CATEGORY_ORDER.indexOf(cat) >= 0;
  }

  function all() {
    return CATEGORY_ORDER.slice();
  }

  function badgeColor(input) {
    var cat = canonical(input);
    return BADGE_COLOR_BY_CATEGORY[cat] || 'default';
  }

  function toSlug(input) {
    return canonical(input)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function categoryHref(input) {
    var cat = canonical(input);
    return 'category?name=' + encodeURIComponent(cat || '');
  }

  global.RSM_CATEGORIES = {
    all: all,
    canonical: canonical,
    isKnown: isKnown,
    badgeColor: badgeColor,
    toSlug: toSlug,
    categoryHref: categoryHref
  };
})(window);
