<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accedi | Rivalta sul Mincio</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" href="/img/favicon.png" type="image/png" />
  <style>
    .c1 { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--bs-primary, #06c); }
    .c2 { color: #555; font-size: .9rem; }
    .ipzs-validator { color: #d9364f; font-size: .8rem; min-height: 1.2em; }
    .view { display: none; }
    .view.is-active { display: block; }
  </style>
</head>
<body>

<!--PARTIAL:nav-->

<main id="main" class="container rsm-page">

  <div class="row">
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
    <div class="col">
      <div class="row">
        <div id="title" class="mb-4 col">
          <p class="c1">
            <strong>ACCESSO · RIVALTA SUL MINCIO</strong>
          </p>
          <h1>Accedi al sito</h1>
        </div>
      </div>
    </div>
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
  </div>

  <div class="row">
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
    <div class="col mx-0 mx-sm-n4">
      <div class="card-wrapper card-space">
        <div class="card card-bg card-bg-small-none card-big py-0 mx-0 mx-md-1">
          <div class="card-body p-0 p-sm-4">
            <div class="row">
              <div class="col-12">

                <!-- LOGIN -->
                <section class="view is-active" id="view-login">
                  <h2>Entra con le tue credenziali</h2>

                  <div id="msg-login" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"><br><br></div>
                  </div>

                  <div class="mt-3">
                    <form method="POST" action="#" id="loginUP" novalidate>
                      <div class="form-row">
                        <div class="form-group col mb-5">
                          <div class="input-group">
                            <label for="login-email" class="sr-only active" style="transition: none;">Email</label>
                            <input type="email" class="form-control" id="login-email" name="username" placeholder="Email" value="" autocomplete="email" tabindex="1">
                          </div>
                          <div class="ipzs-validator" id="usernameError">&nbsp;</div>
                        </div>
                      </div>
                      <div class="form-row">
                        <div class="form-group col mb-2">
                          <div class="input-group">
                            <label for="login-password" class="sr-only active" style="transition: none;">Password</label>
                            <input type="password" class="form-control input-password" id="login-password" name="password" placeholder="Password" value="" autocomplete="current-password" tabindex="2">
                            <span class="password-icon" aria-hidden="true">
                              <svg class="password-icon-visible icon icon-primary icon-sm d-none"><use xlink:href="/vendor/bootstrap-italia/svg/sprites.svg#it-password-visible"></use></svg>
                              <svg class="password-icon-invisible icon icon-primary icon-sm"><use xlink:href="/vendor/bootstrap-italia/svg/sprites.svg#it-password-invisible"></use></svg>
                            </span>
                          </div>
                          <div class="ipzs-validator" id="passwordError">&nbsp;</div>
                        </div>
                      </div>
                      <div class="mt-1 pb-1">
                        <p class="c2">Hai dimenticato la password? <strong><a href="#" id="login-to-forgot" class="text-nowrap">Richiedine una nuova.</a></strong></p>
                      </div>
                      <div class="row buttons mt-4 pb-3">
                        <div class="col-12 col-md-5 text-center mb-3 pr-md-3">
                          <a href="/" class="btn btn-outline-primary w-100 text-nowrap">Annulla</a>
                        </div>
                        <div class="col-12 col-md-7 text-center">
                          <button type="submit" class="btn btn-primary w-100" id="btn-login" data-default-label="Procedi" data-loading-label="Accesso in corso..."><span data-btn-label>Procedi</span></button>
                        </div>
                      </div>
                    </form>
                  </div>
                </section>

                <!-- FORGOT -->
                <section class="view" id="view-forgot">
                  <h2>Reimposta la password</h2>
                  <p class="c2">Ti inviamo una email con il link di reset.</p>

                  <div id="msg-forgot" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"></div>
                  </div>

                  <div class="mt-3">
                    <form id="form-forgot" novalidate>
                      <div class="form-row">
                        <div class="form-group col mb-5">
                          <div class="input-group">
                            <label for="forgot-email" class="sr-only active" style="transition: none;">Email</label>
                            <input type="email" class="form-control" id="forgot-email" placeholder="Email" autocomplete="email" required />
                          </div>
                        </div>
                      </div>
                      <div class="row buttons mt-4 pb-3">
                        <div class="col-12 col-md-5 text-center mb-3 pr-md-3">
                          <button type="button" id="forgot-back-login" class="btn btn-outline-primary w-100 text-nowrap">Annulla</button>
                        </div>
                        <div class="col-12 col-md-7 text-center">
                          <button type="submit" class="btn btn-primary w-100" id="btn-forgot" data-default-label="Invia email reset" data-loading-label="Invio in corso..."><span data-btn-label>Invia email reset</span></button>
                        </div>
                      </div>
                    </form>
                  </div>
                </section>

                <!-- VERIFY -->
                <section class="view" id="view-verify">
                  <h2>Controlla la tua email</h2>

                  <div id="msg-verify" class="row mb-4 mx-n2" role="status" aria-live="polite">
                    <div class="col"></div>
                  </div>

                  <div class="callout note">
                    <div class="callout-title">Link di conferma inviato</div>
                    <p>Abbiamo inviato un link di conferma a: <strong id="verify-email-target">la tua email</strong></p>
                    <p class="mb-0">Finché l'email non è verificata non puoi usare l'account in modo operativo né pubblicare contenuti.</p>
                  </div>
                  <div class="row buttons mt-4 pb-3">
                    <div class="col-12 col-md-7 text-center">
                      <button type="button" id="verify-to-login" class="btn btn-primary w-100 text-nowrap"><span data-btn-label>Ho verificato, torno al login</span></button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-1 col-md-2 col-lg-1 d-none d-sm-flex"></div>
  </div>

</main>

<!--PARTIAL:footer-->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/supabase.config.js"></script>
<script src="/security.client.js"></script>
<script>
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
</script>

</body>
</html>
