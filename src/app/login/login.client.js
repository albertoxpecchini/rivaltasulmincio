const sb = window.RSM_SUPABASE.createClient();
    const byId = (id) => document.getElementById(id);

    const COMMUNITY_RULES_VERSION = '2026-04';

    const state = { view: 'login', verifyEmail: '' };

    const RATE_LIMITS = {
      login: { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockMs: 15 * 60 * 1000 },
      magic: { maxAttempts: 4, windowMs: 15 * 60 * 1000, lockMs: 20 * 60 * 1000 },
      forgot: { maxAttempts: 4, windowMs: 30 * 60 * 1000, lockMs: 30 * 60 * 1000 }
    };

    function isEmailConfirmed(user) { return Boolean(user && (user.email_confirmed_at || user.confirmed_at)); }

    function setView(viewName) {
      document.querySelectorAll('.view').forEach((view) => view.classList.remove('is-active'));
      const target = byId('view-' + viewName);
      if (target) {
        target.classList.add('is-active');
        state.view = viewName;
      }
    }

    function showMessage(targetId, type, text) {
      const slot = byId(targetId);
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

    function clearMessages() {
      showMessage('msg-login', 'info', '');
      showMessage('msg-forgot', 'info', '');
      showMessage('msg-verify', 'info', '');
    }

    function setButtonLoading(buttonId, loading, defaultLabel, loadingLabel) {
      const button = byId(buttonId);
      if (!button) return;
      const labelTarget = button.querySelector('[data-btn-label]');
      const nextLabel = loading ? (loadingLabel || button.dataset.loadingLabel || 'Attendere...') : (defaultLabel || button.dataset.defaultLabel || '');
      button.disabled = loading;
      button.setAttribute('aria-busy', loading ? 'true' : 'false');
      if (labelTarget) { labelTarget.textContent = nextLabel; return; }
      button.textContent = nextLabel;
    }

    function humanizeAuthError(error, fallback) {
      const fallbackText = fallback || 'Operazione non riuscita. Riprova.';
      if (!error || !error.message) return fallbackText;
      const raw = String(error.message).toLowerCase();
      if (raw.includes('invalid login credentials')) return 'Email o password non corrette.';
      if (raw.includes('email not confirmed')) return 'Email non ancora verificata.';
      if (raw.includes('already registered') || raw.includes('already exists')) return 'Questa email risulta gia registrata.';
      if (raw.includes('password should be at least')) return 'La password deve avere almeno 6 caratteri.';
      if (raw.includes('rate limit')) return 'Troppi tentativi. Riprova tra poco.';
      return fallbackText;
    }

    function checkRateLimit(action, identity, cfg) {
      if (!window.RSM_SECURITY) return { ok: true, retryAfterMs: 0 };
      return window.RSM_SECURITY.checkRateLimit(action, identity, cfg);
    }
    function rememberRateFailure(action, identity, cfg) {
      if (!window.RSM_SECURITY) return;
      window.RSM_SECURITY.recordRateFailure(action, identity, cfg);
    }
    function clearRateFailures(action, identity) {
      if (!window.RSM_SECURITY) return;
      window.RSM_SECURITY.clearRateFailures(action, identity);
    }
    function rateLimitMessage(base, retryAfterMs) {
      if (!window.RSM_SECURITY) return base;
      return base + ' Riprova tra ' + window.RSM_SECURITY.formatRetry(retryAfterMs) + '.';
    }

    function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    function ensureProfileForUser(user) {
      return sb.from('profiles').select('id, username').eq('id', user.id).maybeSingle().then(({ data: existing, error: existingError }) => {
        if (existingError) return { ok: false, message: 'Accesso riuscito, ma il controllo profilo ha dato errore.' };
        if (existing) return { ok: true, created: false };
        return { ok: true, created: false, incompleteMetadata: true };
      });
    }

    async function submitLogin(event) {
      event.preventDefault();
      showMessage('msg-login', 'info', '');
      const email = byId('login-email').value.trim();
      const password = byId('login-password').value;
      if (!email || !password) { showMessage('msg-login', 'error', 'Compila email e password.'); return; }
      const loginLimit = checkRateLimit('login_password', email, RATE_LIMITS.login);
      if (!loginLimit.ok) {
        showMessage('msg-login', 'error', rateLimitMessage('Troppi tentativi di accesso.', loginLimit.retryAfterMs));
        return;
      }
      setButtonLoading('btn-login', true, 'Procedi', 'Accesso in corso...');
      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
      setButtonLoading('btn-login', false, 'Procedi', 'Accesso in corso...');
      if (error) {
        rememberRateFailure('login_password', email, RATE_LIMITS.login);
        showMessage('msg-login', 'error', humanizeAuthError(error, 'Non siamo riusciti ad accedere.'));
        return;
      }
      clearRateFailures('login_password', email);
      const user = data && data.user ? data.user : null;
      if (!user) { showMessage('msg-login', 'error', 'Sessione non valida. Riprova.'); return; }
      if (!isEmailConfirmed(user)) {
        await sb.auth.signOut();
        state.verifyEmail = user.email || email;
        byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
        showMessage('msg-verify', 'info', 'Prima verifica la tua email. Senza conferma non puoi accedere o pubblicare.');
        setView('verify');
        return;
      }
      const ensured = await ensureProfileForUser(user);
      if (!ensured.ok) { showMessage('msg-login', 'error', ensured.message || 'Errore durante il controllo profilo.'); return; }
      const { data: loginProf } = await sb.from('profiles').select('username').eq('id', user.id).single();
      window.location.href = loginProf && loginProf.username ? '/profile?u=' + loginProf.username : '/profile';
    }

    async function submitForgot(event) {
      event.preventDefault();
      showMessage('msg-forgot', 'info', '');
      const email = byId('forgot-email').value.trim();
      if (!email || !validEmail(email)) { showMessage('msg-forgot', 'error', 'Inserisci una email valida.'); return; }
      const forgotLimit = checkRateLimit('forgot_password', email, RATE_LIMITS.forgot);
      if (!forgotLimit.ok) {
        showMessage('msg-forgot', 'error', rateLimitMessage('Hai richiesto troppi reset password in poco tempo.', forgotLimit.retryAfterMs));
        return;
      }
      const resetRedirect = new URL('reset', window.location.href).toString();
      setButtonLoading('btn-forgot', true, 'Invia email reset', 'Invio in corso...');
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: resetRedirect });
      setButtonLoading('btn-forgot', false, 'Invia email reset', 'Invio in corso...');
      if (error) {
        rememberRateFailure('forgot_password', email, RATE_LIMITS.forgot);
        showMessage('msg-forgot', 'error', humanizeAuthError(error, 'Invio email di reset non riuscito.'));
        return;
      }
      clearRateFailures('forgot_password', email);
      showMessage('msg-forgot', 'success', 'Email inviata. Controlla la posta e anche la cartella spam.');
    }

    function applyVerifiedQueryMessage() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === '1') {
        setView('login');
        showMessage('msg-login', 'success', 'Email verificata con successo. Ora puoi accedere.');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      }
    }

    async function restoreActiveSession() {
      const { data, error } = await sb.auth.getSession();
      if (error || !data || !data.session || !data.session.user) return;
      const user = data.session.user;
      if (!isEmailConfirmed(user)) {
        await sb.auth.signOut();
        state.verifyEmail = user.email || '';
        byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
        showMessage('msg-verify', 'info', 'Sessione trovata ma email non confermata. Verifica prima di accedere.');
        setView('verify');
        return;
      }
      const ensured = await ensureProfileForUser(user);
      if (!ensured.ok) { setView('login'); showMessage('msg-login', 'error', ensured.message || 'Errore nel controllo profilo.'); return; }
      const { data: restoreProf } = await sb.from('profiles').select('username').eq('id', user.id).single();
      window.location.href = restoreProf && restoreProf.username ? '/profile?u=' + restoreProf.username : '/profile';
    }

    function bindEvents() {
      byId('loginUP').addEventListener('submit', submitLogin);
      byId('form-forgot').addEventListener('submit', submitForgot);
      byId('login-to-forgot').addEventListener('click', (e) => {
        e.preventDefault();
        clearMessages();
        byId('forgot-email').value = byId('login-email').value.trim();
        setView('forgot');
      });
      byId('forgot-back-login').addEventListener('click', () => { clearMessages(); setView('login'); });
      byId('verify-to-login').addEventListener('click', () => {
        clearMessages();
        setView('login');
        if (state.verifyEmail) byId('login-email').value = state.verifyEmail;
      });
    }

    function init() {
      bindEvents();
      applyVerifiedQueryMessage();
      restoreActiveSession();
    }

    init();