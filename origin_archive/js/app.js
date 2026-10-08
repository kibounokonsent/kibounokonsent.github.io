/* ============================================================================
   js/app.js — 全体のつなぎ（タイトル → 世界地図 → 都市 → 資料室）
   通常は編集不要。
   ============================================================================ */
(function () {
  const $ = OA.$;
  const worldView = $('#world-view'), veil = $('#veil');
  let selected = null;

  /* ---------- 表示の明るさ ---------- */
  const theme = OA.store.get('theme', null);
  if (theme) document.documentElement.dataset.theme = theme;
  $('#btn-theme').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; OA.store.set('theme', next);
  });

  /* ---------- 世界地図 ---------- */
  if (!window.THREE) {
    worldView.innerHTML = '<p style="color:#fff;padding:120px 16px;text-align:center">3D表示の部品（three.js）を読み込めませんでした。ネットにつながった状態で開き直してください。</p>';
  } else {
    OA.World.init($('#world-canvas'), $('#labels'));
  }

  const chips = $('#layer-chips');
  const chipDefs = [{ id: 'all', name: '全体', en: 'ALL' }].concat(ORIGIN.world.layers);
  chips.innerHTML = chipDefs.map(l => `<button type="button" class="chip" data-layer="${l.id}" aria-pressed="${l.id === 'all'}">${OA.esc(l.name)}<small>${OA.esc(l.en)}</small></button>`).join('');
  chips.addEventListener('click', e => {
    const b = e.target.closest('[data-layer]'); if (!b) return;
    closeFocus(false); OA.World.setLayer(b.dataset.layer);
  });
  OA.World.onLayer = id => chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.layer === id));

  // 都市を選んだとき
  OA.World.onSelect = c => {
    selected = c;
    const card = $('#focus-card');
    if (!c) {
      const o = ORIGIN.world.origin;
      $('#focus-type').textContent = ORIGIN.world.en;
      $('#focus-name').textContent = o.name; $('#focus-en').textContent = o.en;
      $('#focus-summary').textContent = o.summary;
      $('#focus-facts').innerHTML = '';
      $('#focus-enter').hidden = true;
    } else {
      const L = OA.layerOf(c.layer);
      $('#focus-type').textContent = c.type + ' · ' + L.name;
      $('#focus-name').textContent = c.name; $('#focus-en').textContent = c.en;
      $('#focus-summary').textContent = c.summary || '';
      $('#focus-facts').innerHTML = [['特徴', c.features.join('、')], ['文化', c.culture.join('、')], ['役割', c.role]]
        .map(([k, v]) => `<dt>${k}</dt><dd>${OA.esc(v)}</dd>`).join('');
      $('#focus-enter').hidden = false;
    }
    card.hidden = false;
    $('#city-list').hidden = true;
  };
  function closeFocus(moveCam = true) { $('#focus-card').hidden = true; selected = null; if (moveCam) OA.World.unfocus(); }
  $('#focus-close').addEventListener('click', () => closeFocus());
  $('#focus-enter').addEventListener('click', () => selected && enterCity(selected.id));
  $('#focus-read').addEventListener('click', () => OA.Archive.open(selected ? selected.id : ORIGIN.world.origin.article));

  /* ---------- 都市へ入る・戻る ---------- */
  function enterCity(id, opts = {}) {
    const c = OA.city(id); if (!c) return;
    $('#focus-card').hidden = true;
    OA.World.enter(id, () => {
      veil.classList.add('on');
      setTimeout(() => {
        OA.World.stop(); worldView.hidden = true;
        OA.City.open(c, opts);
        try { history.replaceState(null, '', '#' + id); } catch (e) {}
        requestAnimationFrame(() => veil.classList.remove('on'));
      }, 700);
    });
  }
  function backToWorld(thenFocus = true) {
    const c = OA.City.current();
    veil.classList.add('on');
    setTimeout(() => {
      OA.City.close(); $('#city-info').hidden = true;
      worldView.hidden = false; OA.World.start();
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      if (c && thenFocus) OA.World.focus(c.id);
      veil.classList.remove('on');
    }, 600);
  }
  $('#city-back').addEventListener('click', () => backToWorld());
  $('#brand').addEventListener('click', () => {
    $('#archive').hidden || OA.Archive.close();
    if (!$('#city-view').hidden) backToWorld(false); else closeFocus();
  });

  // 資料室・会話から別の街へ
  function goCity(id, opts) {
    $('#archive').hidden = true;
    const inCity = !$('#city-view').hidden;
    const go = () => {
      OA.World.focus(id);
      if (opts.enter) setTimeout(() => enterCity(id, opts), 1500);
    };
    if (inCity) {
      if (OA.City.current().id === id && opts.enter) { if (opts.focusX) OA.City.panTo(opts.focusX); return; }
      veil.classList.add('on');
      setTimeout(() => { OA.City.close(); worldView.hidden = false; OA.World.start(); veil.classList.remove('on'); go(); }, 600);
    } else go();
  }
  OA.Archive.onGoCity = goCity;

  /* ---------- 都市の中 ---------- */
  OA.City.init();
  OA.City.onArticle = id => OA.Archive.open(id);
  $('#city-info-btn').addEventListener('click', () => {
    const c = OA.City.current(), L = OA.layerOf(c.layer);
    const chars = ORIGIN.characters.filter(ch => ch.city === c.id);
    $('#city-info-body').innerHTML = `
      <p class="eyebrow">${OA.esc(c.type)} · ${OA.esc(L.name)}</p>
      <h2 class="panel-title">${OA.esc(c.name)}</h2>
      <p>${OA.esc(c.summary || '')}</p>
      <dl class="facts"><dt>特徴</dt><dd>${OA.esc(c.features.join('、'))}</dd><dt>文化</dt><dd>${OA.esc(c.culture.join('、'))}</dd><dt>役割</dt><dd>${OA.esc(c.role)}</dd></dl>
      <p class="clist-layer">調べられる場所</p>
      <ul class="clist">${(c.spots || []).map(s => `<li><button type="button" data-pan="${s.x}"><span class="cdot" style="--c:var(--accent)"></span><span class="cname">${OA.esc(s.name)}</span></button></li>`).join('')}</ul>
      ${chars.length ? `<p class="clist-layer">この街にいる人物</p><ul class="clist">${chars.map(ch => `<li><button type="button" data-pan="${ch.x}"><span class="cdot" style="--c:#fff;border:1px solid var(--muted);border-radius:50%;transform:none"></span><span class="cname">${OA.esc(ch.name)}</span></button></li>`).join('')}</ul>` : ''}
      <div class="focus-actions" style="margin-top:20px"><button type="button" class="btn btn-primary" data-read="${c.id}">資料室で読む</button></div>`;
    $('#city-info').hidden = false;
  });
  $('#city-info').addEventListener('click', e => {
    const p = e.target.closest('[data-pan]'); if (p) { OA.City.panTo(+p.dataset.pan); if (innerWidth < 720) $('#city-info').hidden = true; }
    const r = e.target.closest('[data-read]'); if (r) OA.Archive.open(r.dataset.read);
  });
  $('#city-info-close').addEventListener('click', () => { $('#city-info').hidden = true; });

  /* ---------- 都市一覧 ---------- */
  function renderCityList() {
    let h = '';
    for (const L of ORIGIN.world.layers) {
      const list = ORIGIN.cities.filter(c => c.layer === L.id);
      if (!list.length) continue;
      h += `<p class="clist-layer">${OA.esc(L.name)} <small>${OA.esc(L.en)}</small></p><ul class="clist">` +
        list.map(c => `<li><button type="button" data-city="${c.id}"><span class="cdot" style="--c:${c.color}"></span><span class="cname">${OA.esc(c.name)}</span><span class="ctype">${OA.esc(c.type)}</span></button></li>`).join('') + '</ul>';
    }
    $('#city-list-body').innerHTML = h;
  }
  renderCityList();
  $('#btn-cities').addEventListener('click', () => { const p = $('#city-list'); p.hidden = !p.hidden; });
  $('#city-list-close').addEventListener('click', () => { $('#city-list').hidden = true; });
  $('#city-list-body').addEventListener('click', e => {
    const b = e.target.closest('[data-city]'); if (!b) return;
    $('#city-list').hidden = true; goCity(b.dataset.city, { enter: false });
  });

  /* ---------- 資料室 ---------- */
  OA.Archive.init();
  $('#btn-archive').addEventListener('click', () => OA.Archive.open());
  // 記事中の [[リンク]] は資料室の中で開く
  document.addEventListener('click', e => {
    const a = e.target.closest('.alink[data-article]'); if (a && $('#archive').hidden) OA.Archive.open(a.dataset.article);
  });

  /* ---------- タイトル ---------- */
  const hash = decodeURIComponent(location.hash.slice(1));
  if (window.THREE) OA.World.start();
  $('#intro-go').addEventListener('click', () => {
    $('#intro').classList.add('gone');
    OA.World.intro(() => {
      if (hash && OA.city(hash)) goCity(hash, { enter: false });
    });
    if (hash && !OA.city(hash) && OA.Archive.has(hash)) OA.Archive.open(hash);
  });
})();
