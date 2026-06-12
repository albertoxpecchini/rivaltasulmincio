(function () {
      'use strict';

      /* ──────────────────────────────────────────────
         VERSIONE — fonte unica: storage Supabase.
         Il valore reale arriva da site_stats.version
         (aggiornato dalla CI a ogni release). FALLBACK
         qui sotto solo finché lo storage non risponde:
         per cambiare versione si aggiorna package.json
         → la CI propaga il valore ovunque su questa pagina.
      ────────────────────────────────────────────── */
      var SITE_VERSION_FALLBACK = 'v2.1';

      function formatVersion(raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v) return '';
        v = v.replace(/^(\d+\.\d+)\.0$/, '$1'); // nasconde la patch .0: 2.1.0 → 2.1
        return /^v/i.test(v) ? v : 'v' + v;
      }

      // Applica la versione a TUTTI i punti della pagina in un colpo solo.
      function applyVersion(raw) {
        var v = formatVersion(raw) || SITE_VERSION_FALLBACK;
        ['ver-hero', 'ver-lead', 'ver-live', 'ver-tl', 'rel-vname'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.textContent = v;
        });
      }
      applyVersion(null); // mostra subito il fallback, poi lo storage sovrascrive

      /* ── Anno footer ── */
      var yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      /* ── Date in italiano ── */
      var MONTHS_SHORT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
      var MONTHS_LONG  = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
                          'luglio','agosto','settembre','ottobre','novembre','dicembre'];

      function formatDateIT(iso) {
        var d = new Date(iso);
        return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear() +
          ' · ' + String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ':' +
          String(d.getSeconds()).padStart(2, '0');
      }
      function formatDayIT(date) {
        return date.getDate() + ' ' + MONTHS_LONG[date.getMonth()] + ' ' + date.getFullYear();
      }

      // "Oggi" nella timeline: sempre la data reale di oggi.
      var todayEl = document.getElementById('tl-today');
      if (todayEl) todayEl.textContent = formatDayIT(new Date());

      function setText(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
      }
      function setHTML(id, val) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = val;
      }
      function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      /* ── Counter animato per tile statici ── */
      function animateCounter(el, target, duration) {
        var start = 0, step = target / (duration / 16);
        var t = setInterval(function () {
          start += step;
          if (start >= target) { start = target; clearInterval(t); }
          el.textContent = Math.round(start).toLocaleString('it-IT');
        }, 16);
      }
      var tileObserver = new IntersectionObserver(function (obs) {
        obs.forEach(function (e) {
          if (!e.isIntersecting) return;
          var num = e.target.querySelector('.num');
          if (!num || num.classList.contains('loading')) return;
          var raw = num.textContent.replace(/\./g, '').replace(/,/g, '');
          var val = parseInt(raw, 10);
          if (!isNaN(val) && val > 1) animateCounter(num, val, 900);
          tileObserver.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('.number-tile:not([data-live])').forEach(function (t) { tileObserver.observe(t); });

      /* ══════════════════════════════════════════
         UPTIME — aggiorna ogni secondo
      ══════════════════════════════════════════ */
      // Origine del sito = commit di fondazione 0eea33d (26 apr 2026, 19:54:08 CEST).
      var LAUNCH = new Date('2026-04-26T19:54:08+02:00');

      function pad2(n) { return n < 10 ? '0' + n : String(n); }

      var elDays  = document.getElementById('u-days');
      var elHours = document.getElementById('u-hours');
      var elMin   = document.getElementById('u-min');
      var elSec   = document.getElementById('u-sec');

      function tickUptime() {
        var diff = Math.max(0, Date.now() - LAUNCH.getTime());
        var totalSeconds = Math.floor(diff / 1000);
        var days    = Math.floor(totalSeconds / 86400);
        var hours   = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;
        if (elDays)  elDays.textContent  = days;
        if (elHours) elHours.textContent = pad2(hours);
        if (elMin)   elMin.textContent   = pad2(minutes);
        if (elSec)   elSec.textContent   = pad2(seconds);
      }

      tickUptime();
      setInterval(tickUptime, 1000);

      /* ══════════════════════════════════════════
         SUPABASE — site_stats + contatori live
      ══════════════════════════════════════════ */
      function numIT(n) {
        return Number(n).toLocaleString('it-IT');
      }

      function setTileValue(id, rawValue) {
        var tile = document.getElementById(id);
        if (!tile) return;
        var num = tile.querySelector('.num');
        if (!num) return;
        var next = Number(rawValue);
        if (isNaN(next)) { num.textContent = '–'; num.classList.remove('loading'); return; }
        var wasLoading = num.classList.contains('loading');
        num.classList.remove('loading');
        if (wasLoading) {
          animateCounter(num, next, 700);
        } else {
          num.textContent = numIT(next);
        }
      }

      function fetchStats() {
        if (!window.supabase || typeof SUPABASE_URL === 'undefined') return;
        var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        db.from('site_stats').select('key, value').then(function (r) {
          if (!r.data) return;
          var s = {};
          r.data.forEach(function (row) { s[row.key] = row.value; });

          function n(v)  { return v || '–'; }
          function ni(v) { return v ? numIT(v) : '–'; }

          // Versione: fonte unica dallo storage → ovunque sulla pagina.
          if (s.version) applyVersion(s.version);

          setTileValue('tile-deploy', s.deployments);
          setTileValue('tile-files',  s.files);
          setTileValue('tile-lines',  s.lines_of_code);
          setTileValue('tile-pages',  s.pages);
          setTileValue('tile-videos', s.videos);
          setTileValue('tile-images', s.images);
          setTileValue('tile-npm',    s.npm_deps);
          setTileValue('tile-words',  s.filtered_words);

          setText('pill-deploy', n(s.deployments));
          setText('pill-lines',  ni(s.lines_of_code));
          setText('pill-files',  n(s.files));
          setText('pill-pages',  n(s.pages));

          setText('sub-pages',  n(s.pages));
          setText('sub-lines',  ni(s.lines_of_code));
          setText('sub-deploy', n(s.deployments));

          setText('txt-lines-index', ni(s.lines_index));
          setText('txt-sec-lines',   n(s.sec_client_lines));
          setText('txt-rl-attempts', n(s.rate_limit_attempts));
          setText('txt-rl-window',   n(s.rate_limit_window));
          setText('txt-rl-lock',     n(s.rate_limit_lock));
          setText('txt-words-tl',    n(s.filtered_words));
          setText('txt-deploy-h',    n(s.deployments));
          setText('txt-deploy-t',    n(s.deployments));

          setText('fc-index',       ni(s.lines_index));
          setText('fc-origini',     ni(s.lines_origini));
          setText('fc-login',       ni(s.lines_login));
          setText('fc-dashboard',   ni(s.lines_dashboard));
          setText('fc-write',       ni(s.lines_write));
          setText('fc-post',        ni(s.lines_post));
          setText('fc-profile',     ni(s.lines_profile));
          setText('fc-reset',       ni(s.lines_reset));
          setText('fc-privacy',     ni(s.lines_privacy));
          setText('fc-cookie',      ni(s.lines_cookie));
          setText('fc-note-legali', ni(s.lines_note_legali));

          setText('fc-rl-a', n(s.rate_limit_attempts));
          setText('fc-rl-w', n(s.rate_limit_window));
          setText('fc-rl-l', n(s.rate_limit_lock));

          setText('txt-deploy-stack', n(s.deployments));

          setText('txt-rl-sec-a',  n(s.rate_limit_attempts));
          setText('txt-rl-sec-w',  n(s.rate_limit_window));
          setText('txt-rl-sec-l',  n(s.rate_limit_lock));
          setText('txt-words-sec', n(s.filtered_words));
        });

        db.from('posts').select('*', { count: 'exact', head: true }).eq('published', true)
          .then(function (r) { setTileValue('tile-posts', r.count); });

        db.from('profiles').select('*', { count: 'exact', head: true })
          .then(function (r) { setTileValue('tile-members', r.count); });

        db.from('comments').select('*', { count: 'exact', head: true }).eq('is_hidden', false)
          .then(function (r) { setTileValue('tile-comments', r.count); });

        db.from('post_likes').select('*', { count: 'exact', head: true })
          .then(function (r) { setTileValue('tile-likes', r.count); });
      }

      fetchStats();
      setInterval(fetchStats, 60000);

      /* ══════════════════════════════════════════
         CHANGELOG + COMMIT LIVE (da /api/changelog)
      ══════════════════════════════════════════ */
      function renderChangelogFallback(message) {
        setText('rel-hash', '—');
        setText('rel-msg', message || 'Changelog non disponibile');
        setText('rel-author', '');
        setText('rel-date', '');
        setHTML('rel-changes', '<li style="opacity:.6">Dettagli non disponibili al momento.</li>');
        setHTML('rel-commits', '<li style="opacity:.5">Nessun commit recente disponibile.</li>');
      }

      fetch('/api/changelog', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('http-' + r.status);
          return r.json();
        })
        .then(function (data) {
          if (!data || (typeof data !== 'object')) {
            renderChangelogFallback('Changelog non disponibile');
            return;
          }

          setText('rel-hash',   data.sha     || '—');
          var topMsg = data.message || '—';
          var topFiles = Number(data.files_changed || 0);
          setText('rel-msg', topMsg);
          setText('rel-author', (data.author || '') + (topFiles ? (' · ' + topFiles + ' file') : ''));
          if (data.date) setText('rel-date', formatDateIT(data.date));

          var linkEl = document.getElementById('rel-link');
          if (linkEl && data.url) { linkEl.href = data.url; linkEl.style.display = 'inline'; }

          var changes = Array.isArray(data.changes) ? data.changes : [];
          if (changes.length) {
            setHTML('rel-changes', changes.map(function (c) {
              return '<li>' + esc(c) + '</li>';
            }).join(''));
          } else {
            setHTML('rel-changes', '<li style="opacity:.5">Nessuna nota disponibile.</li>');
          }

          var recentCommits = Array.isArray(data.recent_commits) ? data.recent_commits : [];
          if (recentCommits.length) {
            setHTML('rel-commits', recentCommits.map(function (c) {
              var when = c.date ? formatDateIT(c.date) : 'data non disponibile';
              var fileLabel = Number(c.files_changed || 0) + ' file cambiati';
              var fileList = Array.isArray(c.changed_files) && c.changed_files.length
                ? c.changed_files.join(', ')
                : 'Nessun dettaglio file disponibile';
              return '<li>' +
                '<div class="d-flex justify-content-between gap-2"><code>' + esc(c.short_sha || c.sha || '—') + '</code><span class="text-muted small">' + esc(when) + '</span></div>' +
                '<div>' + esc(c.message || 'Aggiornamento sito') + '</div>' +
                '<div class="text-muted small">' + esc(fileLabel + ' · ' + fileList) + '</div>' +
              '</li>';
            }).join(''));
          } else {
            setHTML('rel-commits', '<li style="opacity:.5">Nessun commit recente disponibile.</li>');
          }
        })
        .catch(function () {
          renderChangelogFallback('Changelog non raggiungibile');
        });

    })();