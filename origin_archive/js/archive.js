/* ============================================================================
   js/archive.js — 資料室（記事の一覧・記事・検索）
   通常は編集不要。記事は data/articles/ に追加してください。
   ============================================================================ */
(function () {
  const A = OA.Archive = {};
  let root, nav, main, search, all = [], current = null;
  A.onGoCity = () => {}; A.onClose = () => {};

  const catName = id => (ORIGIN.categories.find(c => c.id === id) || { name: id }).name;
  const byId = id => all.find(a => a.id === id);

  function renderNav() {
    let h = `<button type="button" class="anav-item${!current ? ' on' : ''}" data-home="1">資料室のはじめに</button>`;
    for (const cat of ORIGIN.categories) {
      const items = all.filter(a => a.cat === cat.id);
      h += `<p class="anav-cat"><span>${OA.esc(cat.name)}</span><span>${OA.esc(cat.en)}</span></p>`;
      if (!items.length) h += `<p class="anav-item empty">まだありません</p>`;
      for (const a of items) h += `<button type="button" class="anav-item${current === a.id ? ' on' : ''}" data-article="${a.id}">${OA.esc(a.title)}</button>`;
    }
    nav.innerHTML = h;
  }

  function card(a) {
    return `<button type="button" class="card" data-article="${a.id}"><span class="eyebrow">${OA.esc(catName(a.cat))}</span><span class="card-t">${OA.esc(a.title)}</span><span class="card-s">${OA.esc(a.lede || '')}</span></button>`;
  }

  function renderHome() {
    current = null;
    let h = `<div class="article"><p class="eyebrow">ORIGIN ARCHIVE</p><h1 class="home-h">オリジン資料室</h1>
      <p class="article-lede">地図の上で見つけたものを、ここで読み返せます。</p>`;
    for (const cat of ORIGIN.categories) {
      const items = all.filter(a => a.cat === cat.id);
      if (!items.length) continue;
      h += `<section class="home-sec"><h2>${OA.esc(cat.name)} <span>${OA.esc(cat.en)}</span></h2><div class="cards">${items.map(card).join('')}</div></section>`;
    }
    main.innerHTML = h + '</div>'; main.scrollTop = 0; renderNav();
  }

  function renderArticle(id) {
    const a = byId(id); if (!a) return renderHome();
    current = id;
    const c = a.city ? OA.city(a.city) : null;
    const ch = a.char ? OA.char(a.char) : null;
    let h = `<article class="article">${a.deco ? `<div class="deco deco-${a.deco}" aria-hidden="true"></div>` : ''}
      <header class="article-head">
        <div class="article-cat"><span class="eyebrow">${OA.esc(catName(a.cat))}</span>${a.sample ? '<span class="badge">サンプル</span>' : ''}</div>
        <h1>${OA.esc(a.title)}</h1>
        ${a.en ? `<p class="article-en">${OA.esc(a.en)}</p>` : ''}
        ${a.lede ? `<p class="article-lede">${OA.esc(a.lede)}</p>` : ''}
        ${a.updated ? `<p class="article-meta">更新 ${OA.esc(a.updated)}</p>` : ''}
        <div class="article-actions">
          ${c ? `<button type="button" class="btn btn-primary" data-go-city="${c.id}">この街へ行く</button><button type="button" class="btn" data-map-city="${c.id}">地図で見る</button>` : ''}
          ${ch && OA.city(ch.city) ? `<button type="button" class="btn btn-primary" data-go-char="${ch.id}">会いに行く</button>` : ''}
        </div>
      </header>`;
    if (a.image) h += `<figure class="article-fig"><img src="${OA.esc(a.image)}" alt="${OA.esc(a.title)}"></figure>`;
    if (a.facts && a.facts.length) h += `<dl class="facts">${a.facts.map(([k, v]) => `<dt>${OA.esc(k)}</dt><dd>${OA.esc(v)}</dd>`).join('')}</dl>`;
    h += `<div class="article-body">${OA.renderBody(a.body)}</div>`;
    const rel = (a.related || []).map(byId).filter(Boolean);
    if (rel.length) h += `<section class="related"><p class="eyebrow">関連する資料</p><div class="related-list">${rel.map(r => `<button type="button" class="btn" data-article="${r.id}">${OA.esc(r.title)}</button>`).join('')}</div></section>`;
    main.innerHTML = h + '</article>'; main.scrollTop = 0; renderNav();
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }

  function renderSearch(q) {
    q = q.trim(); if (!q) return current ? renderArticle(current) : renderHome();
    const hits = all.filter(a => [a.title, a.en, a.lede, OA.plain(a.body), (a.facts || []).flat().join(' ')].join(' ').toLowerCase().includes(q.toLowerCase()));
    main.innerHTML = `<div class="article"><p class="eyebrow">SEARCH</p><h1 class="home-h">「${OA.esc(q)}」の資料</h1>
      ${hits.length ? `<div class="cards">${hits.map(card).join('')}</div>` : `<p class="empty">見つかりませんでした。言葉を短くすると見つかることがあります。</p>`}</div>`;
  }

  A.init = function () {
    root = OA.$('#archive'); nav = OA.$('#archive-nav'); main = OA.$('#archive-main'); search = OA.$('#search');
    all = OA.allArticles();
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-article],[data-home],[data-go-city],[data-map-city],[data-go-char]');
      if (!t) return;
      if (t.dataset.home) { search.value = ''; renderHome(); }
      else if (t.dataset.article) { search.value = ''; renderArticle(t.dataset.article); }
      else if (t.dataset.goCity) A.onGoCity(t.dataset.goCity, { enter: true });
      else if (t.dataset.mapCity) A.onGoCity(t.dataset.mapCity, { enter: false });
      else if (t.dataset.goChar) { const ch = OA.char(t.dataset.goChar); A.onGoCity(ch.city, { enter: true, focusX: ch.x, highlight: ch.id }); }
    });
    search.addEventListener('input', () => renderSearch(search.value));
    OA.$('#archive-close').addEventListener('click', () => A.close());
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) A.close(); });
  };
  A.open = function (id) {
    root.hidden = false;
    if (id && byId(id)) renderArticle(id); else renderHome();
  };
  A.close = function () { root.hidden = true; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} A.onClose(); };
  A.has = id => !!byId(id);
})();
