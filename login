<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accedi | Rivalta sul Mincio</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" href="/img/favicon.png" type="image/png" />
</head>
<body>

<!--PARTIAL:nav-->

<main id="main" class="container rsm-page">
  <div class="row justify-content-center">
    <div class="col-12 col-lg-7 col-xl-6">

      <p class="text-primary fw-semibold text-uppercase small mb-1">Accesso locale · Rivalta sul Mincio</p>
      <h1>Entra nel borgo digitale del Mincio</h1>
      <p class="lead">Accesso con password o link magico, registrazione guidata in due passaggi e recupero account.</p>

      <div class="d-flex flex-wrap gap-2 mb-4">
        <button class="btn btn-primary magnetic" type="button" data-view-link="login" aria-pressed="true">Accedi</button>
        <button class="btn btn-outline-primary magnetic" type="button" data-view-link="register1" aria-pressed="false">Crea account</button>
        <button class="btn btn-outline-secondary magnetic" type="button" data-view-link="forgot" aria-pressed="false">Recupera</button>
      </div>

      <div class="card-wrapper" id="login-panel-card">
        <div class="card card-bg">
          <div class="card-body">

            <!-- LOGIN -->
            <section class="view is-active" id="view-login" aria-label="Login">
              <h2 class="h4">Accedi al tuo account</h2>
              <p class="text-muted">Non hai ancora un account? <button class="btn btn-link p-0 align-baseline" type="button" id="login-to-register">Registrati ora</button></p>
              <div class="msg-slot" id="msg-login" role="status" aria-live="polite"></div>
              <form id="form-login" novalidate>
                <div class="form-group">
                  <label for="login-email">Email</label>
                  <input class="form-control" type="email" id="login-email" autocomplete="email" placeholder="tu@email.it" required />
                </div>
                <div class="form-group">
                  <label for="login-password">Password</label>
                  <div class="input-group">
                    <input class="form-control" type="password" id="login-password" autocomplete="current-password" placeholder="Inserisci la password" required />
                    <button class="btn btn-outline-secondary" type="button" data-toggle="login-password">Mostra</button>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                  <button class="btn btn-primary magnetic" id="btn-login" type="submit" data-default-label="Accedi" data-loading-label="Accesso in corso..."><span data-btn-label>Accedi</span></button>
                  <button class="btn btn-outline-primary magnetic" id="btn-magic" type="button" data-default-label="Invia link magico" data-loading-label="Invio in corso..."><span data-btn-label>Invia link magico</span></button>
                </div>
              </form>
              <div class="mt-3 d-flex gap-3 flex-wrap">
                <button class="btn btn-link p-0" type="button" id="login-to-forgot">Password dimenticata?</button>
                <a class="btn btn-link p-0" href="/">Torna alla home</a>
              </div>
            </section>

            <!-- REGISTER 1 -->
            <section class="view" id="view-register1" aria-label="Registrazione passo 1">
              <h2 class="h4">Crea il tuo account <span class="badge bg-secondary">1 di 2</span></h2>
              <p class="text-muted">Hai già un profilo? <button class="btn btn-link p-0 align-baseline" type="button" id="reg1-to-login">Vai al login</button></p>
              <div class="msg-slot" id="msg-reg1" role="status" aria-live="polite"></div>
              <form id="form-reg1" novalidate>
                <div class="form-group">
                  <label for="reg1-email">Email</label>
                  <input class="form-control" type="email" id="reg1-email" autocomplete="email" placeholder="nome@email.it" required />
                </div>
                <div class="form-group">
                  <label for="reg1-password">Password</label>
                  <div class="input-group">
                    <input class="form-control" type="password" id="reg1-password" autocomplete="new-password" placeholder="Almeno 6 caratteri" minlength="6" required />
                    <button class="btn btn-outline-secondary" type="button" data-toggle="reg1-password">Mostra</button>
                  </div>
                </div>
                <div class="form-group">
                  <label for="reg1-password2">Conferma password</label>
                  <div class="input-group">
                    <input class="form-control" type="password" id="reg1-password2" autocomplete="new-password" placeholder="Ripeti la password" minlength="6" required />
                    <button class="btn btn-outline-secondary" type="button" data-toggle="reg1-password2">Mostra</button>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                  <button class="btn btn-primary magnetic" id="btn-reg1-next" type="submit" data-default-label="Continua" data-loading-label="Controllo in corso..."><span data-btn-label>Continua</span></button>
                  <button class="btn btn-outline-secondary magnetic" type="button" id="reg1-back-home"><span data-btn-label>Annulla</span></button>
                </div>
              </form>
            </section>

            <!-- REGISTER 2 -->
            <section class="view" id="view-register2" aria-label="Registrazione passo 2">
              <h2 class="h4">Completa il profilo <span class="badge bg-secondary">2 di 2</span></h2>
              <p class="email-pill text-muted" id="reg2-email-pill">Email: -</p>
              <div class="msg-slot" id="msg-reg2" role="status" aria-live="polite"></div>

              <div class="d-flex align-items-center gap-2 mb-3">
                <div class="avatar size-md" id="preview-avatar" aria-hidden="true"><p>🌿</p></div>
                <div>
                  <div class="fw-semibold" id="preview-name">@username</div>
                  <div class="text-muted small" id="preview-comune">Comune non impostato</div>
                </div>
              </div>

              <form id="form-reg2" novalidate>
                <div class="form-group">
                  <label for="reg2-username">Nome utente</label>
                  <input class="form-control" type="text" id="reg2-username" maxlength="30" autocomplete="username" placeholder="esempio_utente" required />
                  <small class="form-text">Min 3 caratteri: lettere, numeri, underscore.</small>
                </div>
                <div class="form-group">
                  <label for="reg2-display">Il tuo nome</label>
                  <input class="form-control" type="text" id="reg2-display" maxlength="60" placeholder="Nome pubblico" required />
                </div>
                <div class="form-group">
                  <label for="reg2-comune">Dove vivi?</label>
                  <select class="form-select" id="reg2-comune" required>
                    <option value="">Seleziona...</option>
                    <option value="Rivalta sul Mincio">Rivalta sul Mincio</option>
                    <option value="Rodigo">Rodigo</option>
                    <option value="Fossato">Fossato</option>
                    <option value="Fuori comune">Fuori comune</option>
                  </select>
                </div>
                <div class="row g-3">
                  <div class="col-12 col-sm-7">
                    <div class="text-uppercase small text-muted mb-1">Scegli il tuo simbolo</div>
                    <div class="emoji-grid" id="avatar-emoji-grid"></div>
                  </div>
                  <div class="col-12 col-sm-5">
                    <div class="text-uppercase small text-muted mb-1">Colore</div>
                    <div class="color-grid" id="avatar-color-grid"></div>
                  </div>
                </div>
                <div class="form-group mt-3">
                  <label for="reg2-bio">Raccontaci di te</label>
                  <textarea class="form-control" id="reg2-bio" maxlength="240" rows="3" placeholder="Breve descrizione" required></textarea>
                  <small class="form-text">Max 240 caratteri.</small>
                </div>
                <div class="form-check mt-2">
                  <input type="checkbox" class="form-check-input" id="reg2-rules" />
                  <label class="form-check-label" for="reg2-rules">Dichiaro di accettare i <a href="/note-legali">termini e condizioni</a>.</label>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                  <button class="btn btn-primary magnetic" id="btn-signup" type="submit" data-default-label="Conferma e chiudi" data-loading-label="Conferma..."><span data-btn-label>Conferma e chiudi</span></button>
                  <button class="btn btn-outline-secondary magnetic" id="reg2-back" type="button"><span data-btn-label>Indietro</span></button>
                </div>
              </form>
            </section>

            <!-- FORGOT -->
            <section class="view" id="view-forgot" aria-label="Password dimenticata">
              <h2 class="h4">Reimposta la password</h2>
              <p class="text-muted">Ti inviamo una email con il link di reset.</p>
              <div class="msg-slot" id="msg-forgot" role="status" aria-live="polite"></div>
              <form id="form-forgot" novalidate>
                <div class="form-group">
                  <label for="forgot-email">Email</label>
                  <input class="form-control" type="email" id="forgot-email" autocomplete="email" placeholder="tu@email.it" required />
                </div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                  <button class="btn btn-primary magnetic" id="btn-forgot" type="submit" data-default-label="Invia email reset" data-loading-label="Invio in corso..."><span data-btn-label>Invia email reset</span></button>
                  <button class="btn btn-outline-secondary magnetic" id="forgot-back-login" type="button"><span data-btn-label>Torna al login</span></button>
                </div>
              </form>
            </section>

            <!-- VERIFY -->
            <section class="view" id="view-verify" aria-label="Verifica email">
              <div class="callout note">
                <div class="callout-title">Controlla la tua email</div>
                <p>Abbiamo inviato un link di conferma a: <strong class="verify-email" id="verify-email-target">la tua email</strong></p>
                <p class="mb-0">Finché l'email non è verificata non puoi usare l'account in modo operativo né pubblicare contenuti.</p>
              </div>
              <div class="msg-slot" id="msg-verify" role="status" aria-live="polite"></div>
              <div class="d-flex flex-wrap gap-2 mt-3">
                <button class="btn btn-primary magnetic" id="verify-to-login" type="button"><span data-btn-label>Ho verificato, torno al login</span></button>
                <button class="btn btn-outline-secondary magnetic" id="verify-to-register" type="button"><span data-btn-label>Usa un'altra email</span></button>
              </div>
            </section>

          </div>
        </div>
      </div>

    </div>
  </div>
</main>

<!--PARTIAL:footer-->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/supabase.config.js"></script>
<script src="/security.client.js"></script>
<script>
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const byId = (id) => document.getElementById(id);

    const COMMUNITY_RULES_VERSION = '2026-04';
    const EMOJIS = ['\u{1F33F}', '\u{1F9A2}', '\u{1F30A}', '\u{1F3A3}', '\u{1F338}', '\u{1F98B}', '\u{1F33E}', '\u{1F33B}', '\u{1F9DC}', '\u{1F420}', '\u{1F343}', '\u{1F33C}', '\u{1F986}', '\u{1F4A7}', '⭐', '\u{1F319}'];
    const COLORS = ['#1F6F8B', '#2E7D32', '#3A8C8A', '#4A6FA5', '#C62828', '#F57F17', '#0F2A30', '#6D4C41'];

    const state = { view: 'login', regAccount: { email: '', password: '' }, verifyEmail: '' };

    const RATE_LIMITS = {
      login: { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockMs: 15 * 60 * 1000 },
      magic: { maxAttempts: 4, windowMs: 15 * 60 * 1000, lockMs: 20 * 60 * 1000 },
      forgot: { maxAttempts: 4, windowMs: 30 * 60 * 1000, lockMs: 30 * 60 * 1000 }
    };

    function sanitizeUsername(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9_]/g, '').trim(); }
    function isEmailConfirmed(user) { return Boolean(user && (user.email_confirmed_at || user.confirmed_at)); }
    function normalizeBio(value) { return String(value || '').trim().replace(/\s+/g, ' '); }

    function syncViewTriggers(viewName) {
      document.querySelectorAll('[data-view-link]').forEach((control) => {
        control.setAttribute('aria-pressed', control.getAttribute('data-view-link') === viewName ? 'true' : 'false');
      });
    }

    function setView(viewName) {
      document.querySelectorAll('.view').forEach((view) => view.classList.remove('is-active'));
      const target = byId('view-' + viewName);
      if (target) {
        target.classList.add('is-active');
        state.view = viewName;
        syncViewTriggers(viewName);
      }
    }

    function showMessage(targetId, type, text) {
      const slot = byId(targetId);
      if (!slot) return;
      slot.innerHTML = '';
      if (!text) return;
      const variant = type === 'error' ? 'alert-danger' : (type === 'success' ? 'alert-success' : 'alert-info');
      const box = document.createElement('div');
      box.className = 'alert ' + variant;
      box.setAttribute('role', 'alert');
      box.textContent = text;
      slot.appendChild(box);
    }

    function clearMessages() {
      showMessage('msg-login', 'info', '');
      showMessage('msg-reg1', 'info', '');
      showMessage('msg-reg2', 'info', '');
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

    function togglePasswordVisibility(inputId, trigger) {
      const input = byId(inputId);
      if (!input || !trigger) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      trigger.textContent = show ? 'Nascondi' : 'Mostra';
    }

    function buildAvatarPickers() {
      const emojiGrid = byId('avatar-emoji-grid');
      const colorGrid = byId('avatar-color-grid');
      if (!emojiGrid || !colorGrid) return;
      emojiGrid.innerHTML = '';
      colorGrid.innerHTML = '';
      EMOJIS.forEach((emoji, idx) => {
        const id = 'reg-emoji-' + idx;
        const checked = idx === 0 ? 'checked' : '';
        emojiGrid.insertAdjacentHTML('beforeend',
          '<input type="radio" name="reg-emoji" id="' + id + '" value="' + emoji + '" ' + checked + '>' +
          '<label for="' + id + '">' + emoji + '</label>');
      });
      COLORS.forEach((color, idx) => {
        const id = 'reg-color-' + idx;
        const checked = idx === 0 ? 'checked' : '';
        colorGrid.insertAdjacentHTML('beforeend',
          '<input type="radio" name="reg-color" id="' + id + '" value="' + color + '" ' + checked + '>' +
          '<label for="' + id + '" style="background:' + color + '"></label>');
      });
      document.querySelectorAll('input[name="reg-emoji"], input[name="reg-color"]').forEach((el) => {
        el.addEventListener('change', updateIdentityPreview);
      });
    }

    function getSelectedAvatar() {
      const selectedEmoji = document.querySelector('input[name="reg-emoji"]:checked');
      const selectedColor = document.querySelector('input[name="reg-color"]:checked');
      return {
        emoji: selectedEmoji ? selectedEmoji.value : '\u{1F33F}',
        color: selectedColor ? selectedColor.value : '#1F6F8B'
      };
    }

    function updateIdentityPreview() {
      const usernameInput = byId('reg2-username');
      const displayInput = byId('reg2-display');
      const comuneInput = byId('reg2-comune');
      const previewAvatar = byId('preview-avatar');
      const previewName = byId('preview-name');
      const previewComune = byId('preview-comune');
      if (!usernameInput || !displayInput || !comuneInput || !previewAvatar || !previewName || !previewComune) return;
      const sanitized = sanitizeUsername(usernameInput.value);
      if (usernameInput.value !== sanitized) usernameInput.value = sanitized;
      const displayName = displayInput.value.trim();
      const comune = comuneInput.value || 'Comune non impostato';
      const avatar = getSelectedAvatar();
      previewAvatar.querySelector('p').textContent = avatar.emoji;
      previewAvatar.style.background = avatar.color;
      previewName.textContent = displayName || (sanitized ? '@' + sanitized : '@username');
      previewComune.textContent = comune;
    }

    async function ensureProfileForUser(user) {
      const { data: existing, error: existingError } = await sb.from('profiles').select('id, username').eq('id', user.id).maybeSingle();
      if (existingError) return { ok: false, message: 'Accesso riuscito, ma il controllo profilo ha dato errore.' };
      if (existing) return { ok: true, created: false };
      const metadata = user.user_metadata || {};
      const username = sanitizeUsername(metadata.username || '');
      const displayName = String(metadata.display_name || '').trim();
      const comune = String(metadata.comune || '').trim();
      const bio = normalizeBio(metadata.bio || '');
      const avatarEmoji = String(metadata.avatar_emoji || '').trim();
      const avatarColor = String(metadata.avatar_color || '').trim();
      const metadataComplete = username.length >= 3 && displayName && comune && avatarEmoji && avatarColor;
      if (!metadataComplete) return { ok: true, created: false, incompleteMetadata: true };
      const payload = {
        id: user.id, username: username, display_name: displayName,
        bio: bio || null, comune: comune, avatar_emoji: avatarEmoji, avatar_color: avatarColor,
        role: comune === 'Fuori comune' ? 'reader' : 'user'
      };
      const { error: insertError } = await sb.from('profiles').insert(payload);
      if (insertError) {
        if (insertError.code === '23505') return { ok: true, created: false, incompleteMetadata: true };
        return { ok: false, message: 'Accesso riuscito, ma non siamo riusciti a creare il profilo.' };
      }
      return { ok: true, created: true };
    }

    function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    async function submitMagicLink() {
      showMessage('msg-login', 'info', '');
      const email = byId('login-email').value.trim();
      if (!email || !validEmail(email)) {
        showMessage('msg-login', 'error', 'Inserisci una email valida per ricevere il link magico.');
        return;
      }
      const magicLimit = checkRateLimit('magic_link', email, RATE_LIMITS.magic);
      if (!magicLimit.ok) {
        showMessage('msg-login', 'error', rateLimitMessage('Troppi tentativi di invio link magico.', magicLimit.retryAfterMs));
        return;
      }
      setButtonLoading('btn-magic', true, 'Invia link magico', 'Invio in corso...');
      const redirectUrl = new URL('profile', window.location.href).toString();
      const { error } = await sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirectUrl, shouldCreateUser: false } });
      setButtonLoading('btn-magic', false, 'Invia link magico', 'Invio in corso...');
      if (error) {
        rememberRateFailure('magic_link', email, RATE_LIMITS.magic);
        showMessage('msg-login', 'error', humanizeAuthError(error, 'Invio link magico non riuscito.'));
        return;
      }
      clearRateFailures('magic_link', email);
      showMessage('msg-login', 'success', 'Link magico inviato. Apri la mail e clicca il link per accedere.');
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
      setButtonLoading('btn-login', true, 'Accedi', 'Accesso in corso...');
      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
      setButtonLoading('btn-login', false, 'Accedi', 'Accesso in corso...');
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

    function submitRegisterStep1(event) {
      event.preventDefault();
      showMessage('msg-reg1', 'info', '');
      const email = byId('reg1-email').value.trim();
      const password = byId('reg1-password').value;
      const confirmPassword = byId('reg1-password2').value;
      if (!email || !password || !confirmPassword) { showMessage('msg-reg1', 'error', 'Compila tutti i campi richiesti.'); return; }
      if (!validEmail(email)) { showMessage('msg-reg1', 'error', 'Inserisci una email valida.'); return; }
      if (password.length < 6) { showMessage('msg-reg1', 'error', 'La password deve avere almeno 6 caratteri.'); return; }
      if (password !== confirmPassword) { showMessage('msg-reg1', 'error', 'Le password non coincidono.'); return; }
      state.regAccount.email = email;
      state.regAccount.password = password;
      byId('reg2-email-pill').textContent = 'Email: ' + email;
      byId('forgot-email').value = email;
      setView('register2');
    }

    async function submitRegisterStep2(event) {
      event.preventDefault();
      showMessage('msg-reg2', 'info', '');
      const usernameRaw = byId('reg2-username').value;
      const username = sanitizeUsername(usernameRaw);
      byId('reg2-username').value = username;
      const displayName = byId('reg2-display').value.trim();
      const comune = byId('reg2-comune').value;
      const bio = normalizeBio(byId('reg2-bio').value);
      const rulesAccepted = byId('reg2-rules').checked;
      const avatar = getSelectedAvatar();
      if (!state.regAccount.email || !state.regAccount.password) {
        showMessage('msg-reg2', 'error', 'Dati account mancanti. Riparti dal passo 1.');
        setView('register1');
        return;
      }
      if (username.length < 3) { showMessage('msg-reg2', 'error', 'Username non valido: minimo 3 caratteri con lettere, numeri o underscore.'); return; }
      if (!displayName) { showMessage('msg-reg2', 'error', 'Inserisci il nome.'); return; }
      if (!comune) { showMessage('msg-reg2', 'error', 'Seleziona il comune di riferimento.'); return; }
      if (!bio || bio.length < 8) { showMessage('msg-reg2', 'error', 'Inserisci una bio di almeno 8 caratteri.'); return; }
      if (!rulesAccepted) { showMessage('msg-reg2', 'error', 'Devi accettare i termini e condizioni.'); return; }
      setButtonLoading('btn-signup', true, 'Crea account', 'Creo account...');
      const { data: usernameRows, error: usernameCheckError } = await sb.from('profiles').select('id').eq('username', username).limit(1);
      if (usernameCheckError) {
        setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');
        showMessage('msg-reg2', 'error', "Impossibile verificare ora l'username. Riprova tra poco.");
        return;
      }
      if (Array.isArray(usernameRows) && usernameRows.length > 0) {
        setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');
        showMessage('msg-reg2', 'error', 'Username gia in uso. Scegline uno diverso.');
        return;
      }
      const acceptedAt = new Date().toISOString();
      const redirectUrl = new URL('login?verified=1', window.location.href).toString();
      const metadata = {
        username: username, display_name: displayName, comune: comune, bio: bio,
        avatar_emoji: avatar.emoji, avatar_color: avatar.color,
        community_rules_accepted: true, community_rules_accepted_at: acceptedAt,
        community_rules_version: COMMUNITY_RULES_VERSION
      };
      const { error: signUpError } = await sb.auth.signUp({
        email: state.regAccount.email, password: state.regAccount.password,
        options: { emailRedirectTo: redirectUrl, data: metadata }
      });
      setButtonLoading('btn-signup', false, 'Crea account', 'Creo account...');
      if (signUpError) { showMessage('msg-reg2', 'error', humanizeAuthError(signUpError, 'Registrazione non riuscita.')); return; }
      await sb.auth.signOut();
      state.verifyEmail = state.regAccount.email;
      byId('verify-email-target').textContent = state.verifyEmail || 'la tua email';
      showMessage('msg-verify', 'success', "Registrazione completata. Apri la tua email e conferma l'account prima del login.");
      setView('verify');
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
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
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
      if (!ensured.ok) {
        setView('login');
        showMessage('msg-login', 'error', ensured.message || 'Errore nel controllo profilo.');
        return;
      }
      const { data: restoreProf } = await sb.from('profiles').select('username').eq('id', user.id).single();
      window.location.href = restoreProf && restoreProf.username ? '/profile?u=' + restoreProf.username : '/profile';
    }

    function bindEvents() {
      byId('form-login').addEventListener('submit', submitLogin);
      byId('btn-magic').addEventListener('click', submitMagicLink);
      byId('form-reg1').addEventListener('submit', submitRegisterStep1);
      byId('form-reg2').addEventListener('submit', submitRegisterStep2);
      byId('form-forgot').addEventListener('submit', submitForgot);
      document.querySelectorAll('[data-view-link]').forEach((control) => {
        control.addEventListener('click', () => {
          clearMessages();
          const targetView = control.getAttribute('data-view-link');
          if (targetView === 'forgot') byId('forgot-email').value = byId('login-email').value.trim();
          if (targetView === 'login' && state.verifyEmail) byId('login-email').value = state.verifyEmail;
          setView(targetView);
        });
      });
      byId('login-to-register').addEventListener('click', () => { clearMessages(); setView('register1'); });
      byId('reg1-to-login').addEventListener('click', () => { clearMessages(); setView('login'); });
      byId('login-to-forgot').addEventListener('click', () => { clearMessages(); byId('forgot-email').value = byId('login-email').value.trim(); setView('forgot'); });
      byId('forgot-back-login').addEventListener('click', () => { clearMessages(); setView('login'); });
      byId('verify-to-login').addEventListener('click', () => { clearMessages(); setView('login'); if (state.verifyEmail) byId('login-email').value = state.verifyEmail; });
      byId('verify-to-register').addEventListener('click', () => { clearMessages(); setView('register1'); });
      byId('reg2-back').addEventListener('click', () => { clearMessages(); setView('register1'); });
      byId('reg1-back-home').addEventListener('click', () => { window.location.href = '/'; });
      byId('reg2-username').addEventListener('input', updateIdentityPreview);
      byId('reg2-display').addEventListener('input', updateIdentityPreview);
      byId('reg2-comune').addEventListener('change', updateIdentityPreview);
      document.querySelectorAll('[data-toggle]').forEach((trigger) => {
        trigger.addEventListener('click', () => { togglePasswordVisibility(trigger.getAttribute('data-toggle'), trigger); });
      });
    }

    function init() {
      syncViewTriggers(state.view);
      bindEvents();
      buildAvatarPickers();
      updateIdentityPreview();
      applyVerifiedQueryMessage();
      restoreActiveSession();
    }

    init();
</script>

</body>
</html>
