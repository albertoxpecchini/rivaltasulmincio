(() => {
  const sb = window.RSM_SUPABASE.createClient();
  const $ = id => document.getElementById(id);
  const editId = new URLSearchParams(location.search).get('edit');
  let editPostOriginal = null;
  let currentUserId = null;

  const CATEGORIES = window.RSM_CATEGORIES ? window.RSM_CATEGORIES.all() : [
    'Ambiente','Assemblea','Ciclismo','Cultura','Enogastronomia','Eventi',
    'Iniziative','Natura','Sagre','Sport','Turismo','Video'
  ];

  const CAT_COLOR = {
    'Ambiente':       '#2d6a4f',
    'Anniversari':    '#6d28d9',
    'Assemblea':      '#374151',
    'Canoa':          '#0e7490',
    'Ciclismo':       '#b45309',
    'Cultura':        '#6b21a8',
    'Enogastronomia': '#991b1b',
    'Eventi':         '#1d4ed8',
    'Festa del Pesce':'#155e75',
    'Iniziative':     '#0369a1',
    'Love-luccio':    '#9d174d',
    'Mincio-art':     '#166534',
    'Natale':         '#b91c1c',
    'Natura':         '#15803d',
    'Rassegna Stampa':'#334155',
    'Sagre':          '#92400e',
    'Sport':          '#dc2626',
    'Tesseramento':   '#4338ca',
    'Turismo':        '#1e40af',
    'Video':          '#111827',
  };

  function csv(v) { return String(v||'').split(',').map(s=>s.trim()).filter(Boolean); }
  function esc(t) { return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function fmtDate(iso) {
    if (!iso) return null;
    try {
      const d = iso.length <= 10 ? new Date(iso + 'T12:00:00') : new Date(iso);
      return d.toLocaleDateString('it-IT', {day:'numeric', month:'long', year:'numeric'});
    }
    catch { return iso; }
  }

  /* ── AI scan ── */
  function setAiStatus(state, msg) {
    const bar = $('ai-status-bar');
    bar.className = 'ai-status-bar ' + state;
    if (state === 'reading') {
      bar.innerHTML = '<span class="ai-spin"></span> AI sta leggendo l\'immagine…';
    } else if (state === 'done') {
      bar.innerHTML = '✓ Campi compilati dall\'AI — rivedi e pubblica';
    } else if (state === 'error') {
      bar.innerHTML = '⚠ ' + (msg || 'AI non disponibile, compila manualmente');
    } else {
      bar.className = 'ai-status-bar';
    }
  }

  function setSelectIfValid(id, value) {
    const el = $(id);
    if (!el || !value) return;
    const opt = Array.from(el.options).find(o => o.value === value);
    if (opt) el.value = value;
  }

  function setInputIfEmpty(id, value) {
    const el = $(id);
    if (!el || el.value.trim()) return;
    el.value = value || '';
  }

  function isoToDateLocal(iso) {
    if (!iso) return '';
    try {
      const d = iso.length <= 10 ? iso : new Date(iso).toISOString().slice(0, 10);
      return d;
    } catch { return ''; }
  }

  function applyAiFields(f) {
    setInputIfEmpty('f-title',    f.title    || '');
    setInputIfEmpty('f-subtitle', f.subtitle || '');
    setInputIfEmpty('f-excerpt',  f.excerpt  || '');
    setInputIfEmpty('f-content',  f.content  || '');
    setSelectIfValid('f-category',      f.category      || '');
    setSelectIfValid('f-tone',          f.tone          || '');
    setSelectIfValid('f-reading-level', f.reading_level || '');
    setSelectIfValid('f-target',        f.target_audience || '');
    setInputIfEmpty('f-location',    f.location_text || '');
    setInputIfEmpty('f-address',     f.address_text  || '');
    setInputIfEmpty('f-organizer',   f.organizer     || '');
    setInputIfEmpty('f-contacts',    f.contacts      || '');
    setInputIfEmpty('f-booking-url', f.booking_url   || '');
    setInputIfEmpty('f-price',       f.price_text    || '');
    setInputIfEmpty('f-cta',         f.cta_text      || '');
    setInputIfEmpty('f-cta-url',     f.cta_url       || '');
    setInputIfEmpty('f-event-time',  f.event_time_text || '');
    setInputIfEmpty('f-ig-url',      f.instagram_url  || '');
    const evStart = $('f-event-start');
    if (evStart && !evStart.value && f.event_start_at) evStart.value = isoToDateLocal(f.event_start_at);
    const evEnd = $('f-event-end');
    if (evEnd && !evEnd.value && f.event_end_at) evEnd.value = isoToDateLocal(f.event_end_at);
    const kwEl = $('f-keywords');
    if (kwEl && !kwEl.value.trim() && Array.isArray(f.keywords) && f.keywords.length) kwEl.value = f.keywords.join(', ');
    const tagsEl = $('f-tags');
    if (tagsEl && !tagsEl.value.trim() && Array.isArray(f.tags) && f.tags.length) tagsEl.value = f.tags.join(', ');
    updateCounts();
  }

  /* ── upload immagine ── */
  function initUpload(session) {
    const area    = $('img-upload-area');
    const fileIn  = $('f-image-file');
    const thumb   = $('img-thumb');
    const ph      = $('img-placeholder');
    const label   = $('up-label');
    const sub     = $('up-sub');
    const prog    = $('up-progress');
    const bar     = $('up-bar');
    const btn     = $('up-btn');
    const rmv     = $('up-remove');
    const urlIn   = $('f-image-url');

    function showThumb(url) {
      thumb.src = url;
      thumb.classList.add('visible');
      ph.style.display = 'none';
      area.classList.add('has-image');
      rmv.style.display = '';
    }
    function reset() {
      thumb.src = ''; thumb.classList.remove('visible');
      ph.style.display = ''; area.classList.remove('has-image');
      rmv.style.display = 'none';
      label.textContent = 'Carica immagine copertina';
      sub.textContent = 'JPG · PNG · WebP · HEIC · DNG · RAW · CR2 · NEF · ARW e altri';
      prog.classList.remove('visible'); bar.style.width = '0%';
      fileIn.value = '';
    }

    async function uploadFile(file) {
      // valida sessione e rimuovi token corrotto
      const { data: { session: freshSession } } = await sb.auth.getSession();
      const token = freshSession?.access_token;
      if (token && !/^[^.]+\.[^.]+\.[^.]+$/.test(token)) {
        await sb.auth.signOut();
        label.textContent = 'Sessione scaduta, ricarica la pagina.';
        return;
      }

      const uid = freshSession?.user?.id || 'anon';
      const ext = file.name.split('.').pop().toLowerCase();
      const path = uid + '/' + Date.now() + '-' + Math.random().toString(36).slice(2,7) + '.' + ext;

      label.textContent = 'Caricamento…';
      sub.textContent = file.name;
      prog.classList.add('visible'); bar.style.width = '20%';

      const { data, error } = await sb.storage.from('post-images').upload(path, file, {
        cacheControl: '31536000', upsert: false, contentType: file.type || 'application/octet-stream'
      });
      if (error) {
        label.textContent = 'Errore: ' + error.message;
        bar.style.width = '0%'; prog.classList.remove('visible');
        return;
      }
      bar.style.width = '100%';
      const { data: pub } = sb.storage.from('post-images').getPublicUrl(data.path);
      const publicUrl = pub.publicUrl;
      urlIn.value = publicUrl;
      urlIn.dispatchEvent(new Event('input'));
      showThumb(publicUrl);
      label.textContent = file.name;
      sub.textContent = (file.size / 1024).toFixed(0) + ' KB · caricato';
      setTimeout(() => { prog.classList.remove('visible'); bar.style.width = '0%'; }, 800);
      updateCounts(); // aggiorna subito la preview con la copertina

      // scansione AI
      setAiStatus('reading');
      try {
        const aiRes = await fetch('/api/ai/scan-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ imageUrl: publicUrl })
        });
        if (aiRes.ok) {
          const fields = await aiRes.json();
          if (fields.error) { setAiStatus('error', fields.error); }
          else {
            applyAiFields(fields);
            urlIn.value = publicUrl; // ripristina copertina dopo fill AI
            updateCounts();
            setAiStatus('done');
          }
        } else {
          const err = await aiRes.json().catch(() => ({}));
          setAiStatus('error', err.error || 'Errore ' + aiRes.status);
        }
      } catch (e) {
        setAiStatus('error', e.message);
      }
    }

    btn.addEventListener('click', () => fileIn.click());
    area.addEventListener('click', e => { if (e.target !== btn && e.target !== rmv) fileIn.click(); });
    fileIn.addEventListener('change', () => { if (fileIn.files[0]) uploadFile(fileIn.files[0]); });

    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => {
      e.preventDefault(); area.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f) uploadFile(f);
    });

    rmv.addEventListener('click', e => {
      e.stopPropagation();
      reset();
      urlIn.value = '';
      urlIn.dispatchEvent(new Event('input'));
    });

    urlIn.addEventListener('input', () => {
      const v = urlIn.value.trim();
      if (v && !thumb.classList.contains('visible')) showThumb(v);
      else if (!v) reset();
    });
  }

  /* ── anteprima live ── */
  function renderPreview() {
    const title    = $('f-title').value.trim();
    const subtitle = $('f-subtitle').value.trim();
    const excerpt  = $('f-excerpt').value.trim();
    const content  = $('f-content').value.trim();
    const category = $('f-category').value;
    const imageUrl = $('f-image-url').value.trim();
    const cta      = $('f-cta').value.trim();
    const ctaUrl   = $('f-cta-url').value.trim();
    const tags     = csv($('f-tags').value);
    const evStart  = $('f-event-start').value;
    const evEnd    = $('f-event-end').value;
    const evTime   = $('f-event-time').value.trim();
    const location = $('f-location').value.trim();
    const address  = $('f-address').value.trim();
    const org      = $('f-organizer').value.trim();
    const contacts = $('f-contacts').value.trim();
    const price    = $('f-price').value.trim();
    const booking  = $('f-booking-url').value.trim();

    if (!title && !content) {
      $('preview-body').innerHTML = '<div class="pv-empty">Inizia a compilare per vedere l\'anteprima.</div>';
      return;
    }

    const hasMeta = evStart || evEnd || location || org || price;
    const meta = hasMeta ? `<dl class="pv-meta-table">
      ${evStart ? `<dt>Inizio</dt><dd>${esc(fmtDate(evStart))}</dd>` : ''}
      ${evEnd   ? `<dt>Fine</dt><dd>${esc(fmtDate(evEnd))}</dd>` : ''}
      ${evTime  ? `<dt>Orario</dt><dd>${esc(evTime)}</dd>` : ''}
      ${location? `<dt>Luogo</dt><dd>${esc(location)}</dd>` : ''}
      ${address ? `<dt>Indirizzo</dt><dd>${esc(address)}</dd>` : ''}
      ${org     ? `<dt>Organizzatore</dt><dd>${esc(org)}</dd>` : ''}
      ${contacts? `<dt>Contatti</dt><dd>${esc(contacts)}</dd>` : ''}
      ${price   ? `<dt>Ingresso</dt><dd>${esc(price)}</dd>` : ''}
    </dl>` : '';

    const ctaHtml = (cta && ctaUrl)
      ? `<a class="pv-cta" href="${esc(ctaUrl)}" target="_blank" rel="noopener">${esc(cta)}</a>`
      : (cta ? `<span class="pv-cta" style="opacity:.5;cursor:default">${esc(cta)}</span>` : '');

    const tagsHtml = tags.length
      ? `<div class="pv-tags">${tags.map(t=>`<span class="pv-tag">${esc(t)}</span>`).join('')}</div>`
      : '';

    const coverHtml = imageUrl
      ? `<img class="pv-cover" src="${esc(imageUrl)}" alt="${esc(title)}" onerror="this.style.display='none'" />`
      : `<div class="pv-cover-empty">Nessuna immagine copertina</div>`;

    const bookingHtml = booking
      ? `<div style="margin-top:.5rem;font-size:.75rem;color:#5a6882">Prenotazione: <a href="${esc(booking)}" target="_blank" rel="noopener">${esc(booking.replace(/^https?:\/\//,''))}</a></div>`
      : '';

    const catColor = CAT_COLOR[category] || '#1d4ed8';
    const dateLabel = evStart ? 'Programmato per il ' + fmtDate(evStart) : 'Bozza';
    $('preview-body').innerHTML = `
      <div class="pv-badges">${category ? `<span class="badge" style="background:${catColor};color:#fff">${esc(category)}</span>` : ''}</div>
      <div class="pv-meta">
        <span>${esc(dateLabel)}</span>
        ${category ? `<span>·</span><span style="color:${catColor};font-weight:600">${esc(category)}</span>` : ''}
      </div>
      ${title ? `<div class="pv-title">${esc(title)}</div>` : ''}
      ${subtitle ? `<div class="pv-subtitle">${esc(subtitle)}</div>` : ''}
      ${excerpt ? `<div class="pv-lead">${esc(excerpt)}</div>` : ''}
      ${coverHtml}
      ${content ? `<div class="pv-content">${esc(content)}</div>` : ''}
      ${meta}
      ${bookingHtml}
      ${ctaHtml}
      ${tagsHtml}
    `;
  }

  /* ── JSON pane ── */
  function renderJsonPane() {
    const ta = $('f-json-payload');
    if (!ta || document.activeElement === ta) return;
    ta.value = JSON.stringify(buildPayload(false), null, 2);
  }

  function applyJsonToForm(f) {
    const setVal = (id, v) => { const el=$(id); if (el && v != null) el.value = v; };
    const setSelect = (id, v) => {
      const el=$(id); if (!el || !v) return;
      if (Array.from(el.options).some(o => o.value === v)) el.value = v;
    };
    setVal('f-title',       f.title       || '');
    setVal('f-subtitle',    f.subtitle    || '');
    setVal('f-excerpt',     f.excerpt     || '');
    setVal('f-content',     f.content     || '');
    setSelect('f-category',      f.category      || '');
    setSelect('f-tone',          f.tone          || '');
    setSelect('f-reading-level', f.reading_level || '');
    setSelect('f-target',        f.target_audience || '');
    setVal('f-location',    f.location_text   || '');
    setVal('f-address',     f.address_text    || '');
    setVal('f-organizer',   f.organizer       || '');
    setVal('f-contacts',    f.contacts        || '');
    setVal('f-booking-url', f.booking_url     || '');
    setVal('f-price',       f.price_text      || '');
    setVal('f-cta',         f.cta_text        || '');
    setVal('f-cta-url',     f.cta_url         || '');
    setVal('f-source-url',  f.source_url      || '');
    setVal('f-references',  f.references      || '');
    setVal('f-notes',       f.notes           || '');
    setVal('f-event-time',  f.event_time_text || '');
    setVal('f-ig-url',      f.instagram_url   || '');
    if (f.event_start_at) { const el=$('f-event-start'); if (el) el.value = isoToDateLocal(f.event_start_at); }
    if (f.event_end_at)   { const el=$('f-event-end');   if (el) el.value = isoToDateLocal(f.event_end_at); }
    if (Array.isArray(f.keywords)) { const el=$('f-keywords'); if (el) el.value = f.keywords.join(', '); }
    if (Array.isArray(f.tags))     { const el=$('f-tags');     if (el) el.value = f.tags.join(', '); }
    renderPreview();
    const counts = $('content-count');
    const words  = $('content-words');
    const c = ($('f-content') || {}).value || '';
    if (counts) counts.textContent = c.length;
    if (words)  words.textContent  = c.trim() ? c.trim().split(/\s+/).length : 0;
  }

  function initJsonPane() {
    const ta = $('f-json-payload');
    const badge = $('json-validity');
    if (!ta) return;
    ta.addEventListener('input', () => {
      try {
        const parsed = JSON.parse(ta.value);
        applyJsonToForm(parsed);
        if (badge) { badge.textContent = 'valido'; badge.style.color = '#3fb950'; }
      } catch {
        if (badge) { badge.textContent = 'JSON non valido'; badge.style.color = '#f85149'; }
      }
    });
  }

  /* ── contatori ── */
  function updateCounts() {
    const title = $('f-title').value;
    const excerpt = $('f-excerpt').value;
    const content = $('f-content').value;
    $('title-count').textContent = title.length;
    $('excerpt-count').textContent = excerpt.length;
    $('content-count').textContent = content.length;
    $('content-words').textContent = content.trim() ? content.trim().split(/\s+/).length : 0;
    renderPreview();
    renderJsonPane();
  }

  /* ── salvataggio ── */
  function setErr(msg) { const e=$('err-msg'); e.textContent=msg||''; e.style.display=msg?'block':'none'; if(msg) e.scrollIntoView({behavior:'smooth',block:'center'}); }
  function setOk(msg) { const e=$('ok-msg'); e.textContent=msg||''; e.style.display=msg?'block':'none'; }
  function setBtnLoading(id, loading) {
    const btn=$(id); if(!btn) return;
    const lbl=btn.querySelector('[data-btn-label]');
    btn.disabled=loading;
    if(lbl) {
      if(loading) { lbl.textContent='Attendere…'; return; }
      if(id==='btn-draft') { lbl.textContent='Salva bozza'; return; }
      lbl.textContent = editId ? 'Aggiorna' : 'Pubblica';
    }
  }

  function buildPayload(published) {
    const content=$('f-content').value;
    const now=new Date().toISOString();
    const words=content.trim()?content.trim().split(/\s+/).length:0;
    return {
      ...(currentUserId ? { user_id: currentUserId } : {}),
      title:$('f-title').value.trim(), subtitle:$('f-subtitle').value.trim()||null,
      excerpt:$('f-excerpt').value.trim()||null, content,
      category:$('f-category').value, tone:$('f-tone').value,
      reading_level:$('f-reading-level').value, target_audience:$('f-target').value||null,
      event_start_at:$('f-event-start').value||null, event_end_at:$('f-event-end').value||null,
      event_time_text:$('f-event-time').value.trim()||null,
      location_text:$('f-location').value.trim()||null, address_text:$('f-address').value.trim()||null,
      organizer:$('f-organizer').value.trim()||null, contacts:$('f-contacts').value.trim()||null,
      booking_url:$('f-booking-url').value.trim()||null, price_text:$('f-price').value.trim()||null,
      image_url:$('f-image-url').value.trim()||null,
      cta_text:$('f-cta').value.trim()||null, cta_url:$('f-cta-url').value.trim()||null,
      keywords:csv($('f-keywords').value), tags:csv($('f-tags').value),
      source_url:$('f-source-url').value.trim()||null, instagram_url:$('f-ig-url').value.trim()||null,
      references:$('f-references').value.trim()||null,
      notes:$('f-notes').value.trim()||null,
      published, published_at:published?now:null
    };
  }

  async function save(published) {
    setErr(''); setOk('');
    const p=buildPayload(published);
    console.log('[write] save payload:', { published, user_id: p.user_id, title: p.title });
    if(!p.title||p.title.length<2) { setErr('Inserisci un titolo.'); return; }
    if(published && (!p.content||p.content.length<80)) { setErr('Testo troppo corto per pubblicare (min 80 caratteri).'); return; }
    const btnId=published?'btn-publish':'btn-draft';
    setBtnLoading(btnId,true);
    let error;
    if (editId) {
      if (published && editPostOriginal && editPostOriginal.published_at) {
        p.published_at = editPostOriginal.published_at;
      }
      const res = await sb.from('posts').update(p).eq('id', editId);
      console.log('[write] update res:', res);
      error = res.error;
    } else {
      const res = await sb.from('posts').insert(p);
      console.log('[write] insert res:', res);
      error = res.error;
    }
    setBtnLoading(btnId,false);
    if(error){
      const detail = error.code ? ' [' + error.code + ']' : '';
      console.error('[write] save error:', error);
      setErr('Salvataggio fallito: ' + error.message + detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Verifica immediata: il record è visibile con questo client?
    if (!editId && !published) {
      const { data: vrRows, error: vrErr } = await sb.from('posts')
        .select('id, published, user_id')
        .eq('user_id', currentUserId)
        .eq('published', false)
        .order('created_at', { ascending: false })
        .limit(3);
      console.log('[write] verify bozze dopo save:', { rows: vrRows, error: vrErr?.message });
    }
    $('pv-status').textContent=published?'pubblicato':'bozza salvata';
    setOk(editId ? 'Articolo aggiornato.' : (published ? 'Post pubblicato con successo.' : 'Bozza salvata.'));
    setTimeout(()=>{ location.href = editId ? '/post?id='+editId : '/dashboard'; },1200);
  }

  /* ── AI autofill ── */
  let aiImageData = null;
  let aiImageType = null;

  function aiSetErr(msg) { const e=$('ai-err'); e.textContent=msg||''; e.style.display=msg?'block':'none'; }
  function aiSetOk(msg) { const e=$('ai-result-ok'); e.textContent=msg||''; e.classList.toggle('visible',!!msg); }

  function fillFields(d) {
    const filled = [];
    function set(id, val) {
      if (!val && val !== 0) return;
      const el=$(id); if(!el) return;
      el.value = val;
      filled.push(el.labels?.[0]?.textContent?.replace(/\s*\*/,'').trim() || id);
    }
    set('f-title',         d.title);
    set('f-subtitle',      d.subtitle);
    set('f-excerpt',       d.excerpt);
    set('f-content',       d.content);
    if (d.category) {
      const sel=$('f-category');
      const opt=[...sel.options].find(o=>o.value.toLowerCase()===String(d.category).toLowerCase());
      if(opt){ sel.value=opt.value; filled.push('Categoria'); }
    }
    if (d.tone) {
      const sel=$('f-tone');
      const opt=[...sel.options].find(o=>o.value===String(d.tone).toLowerCase());
      if(opt){ sel.value=opt.value; filled.push('Tono'); }
    }
    if (d.target_audience) {
      const sel=$('f-target');
      const opt=[...sel.options].find(o=>o.value===String(d.target_audience).toLowerCase());
      if(opt){ sel.value=opt.value; filled.push('Pubblico'); }
    }
    if (d.event_start_at) {
      try {
        const v = isoToDateLocal(d.event_start_at);
        if(v) { $('f-event-start').value=v; filled.push('Data inizio'); }
      } catch(_){}
    }
    if (d.event_end_at) {
      try {
        const v = isoToDateLocal(d.event_end_at);
        if(v) { $('f-event-end').value=v; filled.push('Data fine'); }
      } catch(_){}
    }
    set('f-event-time',    d.event_time_text);
    set('f-location',      d.location_text);
    set('f-address',       d.address_text);
    set('f-organizer',     d.organizer);
    set('f-contacts',      d.contacts);
    set('f-price',         d.price_text);
    set('f-ig-url',        d.instagram_url);
    set('f-image-url',     d.image_url);
    set('f-source-url',    d.source_url);
    set('f-cta',           d.cta_text);
    set('f-cta-url',       d.cta_url);
    set('f-booking-url',   d.booking_url);
    set('f-references',    d.references);
    set('f-notes',         d.notes);
    if (d.reading_level) {
      const sel=$('f-reading-level');
      if(sel) { const opt=[...sel.options].find(o=>o.value===String(d.reading_level).toLowerCase()); if(opt){ sel.value=opt.value; filled.push('Livello'); } }
    }
    if (Array.isArray(d.keywords) && d.keywords.length) { set('f-keywords', d.keywords.join(', ')); }
    if (Array.isArray(d.tags)     && d.tags.length)     { set('f-tags',     d.tags.join(', ')); }
    updateCounts();
    return filled;
  }

  async function runAiAutofill() {
    aiSetErr(''); aiSetOk('');
    const spinner = $('ai-spinner');
    const btn = $('btn-ai-fill');
    const txt = $('ai-text-input').value.trim();
    const hasText = txt.length > 0;
    const hasImage = !!aiImageData;
    if (!hasText && !hasImage) { aiSetErr('Incolla del testo o carica una foto del volantino.'); return; }
    let body;
    if (hasImage && hasText) {
      body = JSON.stringify({ mode: 'both', text: txt, data: aiImageData, mediaType: aiImageType });
    } else if (hasImage) {
      body = JSON.stringify({ mode: 'image', data: aiImageData, mediaType: aiImageType });
    } else {
      body = JSON.stringify({ mode: 'text', text: txt });
    }
    btn.disabled = true;
    spinner.style.display = '';
    try {
      const res = await fetch('/api/ai-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      if (!res.ok) { aiSetErr(data.error || 'Errore del server (' + res.status + ').'); return; }
      const filled = fillFields(data);
      if (filled.length) {
        aiSetOk('✓ Compilato: ' + filled.join(', ') + '.');
      } else {
        aiSetErr('Nessun campo estratto. Prova con un testo più dettagliato.');
      }
    } catch(e) {
      aiSetErr('Errore di rete: ' + e.message);
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
    }
  }

  function initAiSection() {
    // Image upload
    const volArea = $('vol-upload-area');
    const volFile = $('ai-image-file');
    const volBtn  = $('vol-btn');

    function loadVolFile(file) {
      if (!file || !file.type.startsWith('image/')) { aiSetErr('Carica un file immagine valido.'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        const full = e.target.result;
        const comma = full.indexOf(',');
        aiImageData = full.slice(comma + 1);
        aiImageType = file.type;
        $('vol-label').textContent = file.name;
        $('vol-sub').textContent = (file.size / 1024).toFixed(0) + ' KB · ' + file.type;
        $('vol-icon').textContent = '🖼';
        volArea.classList.add('has-file');
        aiSetErr(''); aiSetOk('');
      };
      reader.readAsDataURL(file);
    }

    volBtn.addEventListener('click', (e) => { e.stopPropagation(); volFile.click(); });
    volArea.addEventListener('click', () => volFile.click());
    volFile.addEventListener('change', () => { if(volFile.files[0]) loadVolFile(volFile.files[0]); });
    volArea.addEventListener('dragover', e => { e.preventDefault(); volArea.classList.add('drag-over'); });
    volArea.addEventListener('dragleave', () => volArea.classList.remove('drag-over'));
    volArea.addEventListener('drop', e => {
      e.preventDefault(); volArea.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) loadVolFile(e.dataTransfer.files[0]);
    });

    $('btn-ai-fill').addEventListener('click', runAiAutofill);
  }

  /* ── init ── */
  async function init() {
    const {data:auth}=await sb.auth.getSession();
    if(!auth?.session){ location.href='/login'; return; }
    currentUserId = auth.session.user.id;

    initUpload(auth.session);
    $('f-category').innerHTML=CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');

    const allInputs=['f-title','f-subtitle','f-excerpt','f-content','f-keywords','f-tags',
      'f-cta','f-location','f-address','f-source-url','f-image-url','f-cta-url',
      'f-organizer','f-contacts','f-booking-url','f-price','f-event-time','f-ig-url','f-references','f-notes'];
    allInputs.forEach(id=>{ const el=$(id); if(el) el.addEventListener('input',updateCounts); });
    ['f-event-start','f-event-end','f-tone','f-reading-level','f-category','f-target']
      .forEach(id=>{ const el=$(id); if(el) el.addEventListener('change',updateCounts); });

    $('btn-draft').addEventListener('click',()=>save(false));
    $('btn-publish').addEventListener('click',()=>save(true));

    initJsonPane();
    initAiSection();

    if (editId) {
      const {data:post, error} = await sb.from('posts').select('*').eq('id', editId).eq('user_id', auth.session.user.id).single();
      if (error || !post) { setErr('Articolo non trovato o non sei l\'autore.'); return; }
      editPostOriginal = post;
      fillFields(post);
      document.title = 'Modifica articolo – Rivalta sul Mincio';
      const h1 = document.querySelector('h1');
      if (h1) h1.textContent = 'Modifica articolo';
      const publishLbl = document.querySelector('#btn-publish [data-btn-label]');
      if (publishLbl) publishLbl.textContent = 'Aggiorna';
    }

    updateCounts();
  }

  init().catch(e=>setErr('Errore: '+e.message));
})();