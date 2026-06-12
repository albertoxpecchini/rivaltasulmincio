(function () {
  if (typeof SUPABASE_URL === 'undefined') return;

  const sb    = window.RSM_SUPABASE.createClient();
  const byId  = (id) => document.getElementById(id);

  /* ── View switching ───────────────────────────────────── */
  function setView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    const t = byId('view-' + name);
    if (t) t.classList.add('is-active');
  }

  /* ── Alert messages ───────────────────────────────────── */
  function showMessage(type, text) {
    const slot = byId('msg-reset');
    if (!slot) return;
    slot.innerHTML = '';
    if (!text) { slot.innerHTML = '<div class="col"></div>'; return; }
    const variant = type === 'error' ? 'alert-danger' : (type === 'success' ? 'alert-success' : 'alert-info');
    const col = document.createElement('div');
    col.className = 'col';
    const box = document.createElement('div');
    box.className = 'alert ' + variant;
    box.setAttribute('role', 'alert');
    box.textContent = text;
    col.appendChild(box);
    slot.appendChild(col);
  }

  /* ── Button loading state ─────────────────────────────── */
  function setButtonLoading(loading) {
    const btn = byId('btn-reset');
    if (!btn) return;
    const lbl = btn.querySelector('[data-btn-label]');
    btn.disabled = loading;
    btn.setAttribute('aria-busy', loading ? 'true' : 'false');
    const next = loading
      ? (btn.dataset.loadingLabel || 'Attendere…')
      : (btn.dataset.defaultLabel || 'Imposta password');
    if (lbl) lbl.textContent = next; else btn.textContent = next;
  }

  /* ── Strength meter ───────────────────────────────────── */
  byId('pwd1').addEventListener('input', function () {
    const v = this.value;
    let s = 0;
    if (v.length >= 8)            s++;
    if (/[A-Z]/.test(v))          s++;
    if (/[0-9]/.test(v))          s++;
    if (/[^A-Za-z0-9]/.test(v))   s++;
    const labels = ['', 'Debole', 'Discreta', 'Buona', 'Ottima'];
    const colors  = ['', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success'];
    const bar = byId('str-bar');
    bar.className  = 'progress-bar' + (v.length && s ? ' ' + colors[s] : '');
    bar.style.width = (v.length ? s * 25 : 0) + '%';
    byId('str-label').textContent = v.length ? labels[s] : '';
  });

  /* ── Auth state ───────────────────────────────────────── */
  let _ready = false;

  sb.auth.onAuthStateChange(function (event, session) {
    if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session && !_ready) {
      _ready = true;
      setView('form');
    }
  });

  // Fallback: if onAuthStateChange doesn't fire within 2s, check manually
  setTimeout(function () {
    if (_ready) return;
    sb.auth.getSession().then(function ({ data: { session } }) {
      if (session) {
        _ready = true;
        setView('form');
      } else {
        setView('invalid');
      }
    });
  }, 2000);

  /* ── Submit handler ───────────────────────────────────── */
  async function doReset(e) {
    if (e) e.preventDefault();
    showMessage('info', '');
    const p1   = byId('pwd1').value;
    const p2   = byId('pwd2').value;
    const err2 = byId('pwd2-error');
    if (err2) err2.innerHTML = '&nbsp;';

    if (!p1 || p1.length < 8) {
      showMessage('error', 'La password deve essere di almeno 8 caratteri.');
      return;
    }
    if (p1 !== p2) {
      if (err2) err2.textContent = 'Le password non coincidono.';
      showMessage('error', 'Le due password non coincidono.');
      return;
    }

    setButtonLoading(true);
    const { error } = await sb.auth.updateUser({ password: p1 });
    setButtonLoading(false);

    if (error) {
      showMessage('error', error.message || 'Errore durante l\'aggiornamento della password.');
      return;
    }

    setView('success');
    setTimeout(function () { window.location.href = '/login'; }, 3000);
  }

  byId('form-reset').addEventListener('submit', doReset);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && byId('view-form').classList.contains('is-active')) {
      e.preventDefault();
      doReset();
    }
  });
})();