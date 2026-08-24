/* ============================================================================
   ORIGIN ARCHIVE — app.js
   サイトを動かす本体。ページ生成・ルーティング・検索など。
   通常はこのファイルを編集する必要はありません。設定を増やしたいときは
   data/ 配下のファイルと index.html の <script> 行だけを編集してください。
   ============================================================================ */

const ICONS = {
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  person:'<circle cx="12" cy="8" r="3.6"/><path d="M5 21c0-4 3-6.5 7-6.5S19 17 19 21"/>',
  people:'<circle cx="8.5" cy="8" r="3.1"/><circle cx="16" cy="9" r="2.6"/><path d="M3 21c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6M14 21c0-2.8 1.8-4.8 4-4.8s4.5 2 4.5 4.8"/>',
  crystal:'<path d="M12 2 19 9 12 22 5 9Z"/><path d="M5 9h14M9 9l3-7M15 9l-3-7"/>',
  chip:'<rect x="7" y="7" width="10" height="10" rx="1.6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  flag:'<path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/>',
  leaf:'<path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Z"/><path d="M5 19c3-6 7-9 12-11"/>',
  org:'<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8 8.3 10.5 16M16 8.3 13.5 16M8.4 7h7.2"/>',
  shrine:'<path d="M4 9h16M6 9V6M18 9V6M4 6h16M6 22V9M18 22V9M9 22v-6h6v6"/>',
  scale:'<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3.2 3.2 0 0 0 6 0zM19 7l-3 6a3.2 3.2 0 0 0 6 0z"/>',
  book:'<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
};

function catByKey(key){ return CATEGORIES.find(c => c.key === key); }

function setBackgroundTheme(theme){
  // CATEGORIES から動的に生成しているため、カテゴリーを追加・変更しても
  // ここを手動で書き換える必要はない
  const themes = CATEGORIES.map(c => "theme-" + c.key);

  document.body.classList.remove(...themes);

  if(theme){
    document.body.classList.add("theme-" + theme);
  }
}

function articleById(id){ return ARTICLES.find(a => a.id === id); }
function articlesInCat(key){ return ARTICLES.filter(a => a.cat === key); }
function iconSvg(key, cls){ return `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[key]||''}</svg>`; }

function navLinkFor(c){ return `<a href="#/category/${c.key}">${c.name}</a>`; }

function renderNav(){
  // 常時表示するのは primary:true が付いたカテゴリーのみ。
  // それ以外は自動的に「その他」メニューへまとまる。
  const primary = CATEGORIES.filter(c => c.primary);
  const rest = CATEGORIES.filter(c => !c.primary);

  const restLinks =
    rest.map(navLinkFor).join('') +
    `<a href="#/categories">全カテゴリー</a>` +
    `<a href="#/articles">全記事一覧</a>`;

  const nav =
    primary.map(navLinkFor).join('') +
    `
    <div class="nav-more" id="nav-more">
      <button class="nav-more-btn" onclick="toggleNavMore(event)">その他 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
      <div class="nav-more-menu" id="nav-more-menu">${restLinks}</div>
    </div>
    `;

  document.getElementById('main-nav').innerHTML = nav;
}

function toggleNavMore(e){
  e.stopPropagation();
  document.getElementById('nav-more').classList.toggle('open');
}
document.addEventListener('click', () => {
  const el = document.getElementById('nav-more');
  if(el) el.classList.remove('open');
});

function relatedChip(ref){
  const a = articleById(ref);
  if(a){ return `<a class="related-chip" href="#/article/${a.id}">${a.title}</a>`; }
  return `<span class="related-chip" onclick="toastMsg('「${ref}」— 詳細ページは準備中です')">${ref}</span>`;
}

function renderBlocks(blocks){
  return blocks.map(b => {
    if(b.t === 'p') return `<p>${b.text}</p>`;
    if(b.t === 'h3') return `<h3>${b.text}</h3>`;
    if(b.t === 'quote') return `<blockquote class="${b.warn?'warn':''}">${b.text}</blockquote>`;
    if(b.t === 'list') return `<ul>${b.items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    if(b.t === 'info') return `<div class="info-card-row">${b.items.map(i=>`<div class="info-card"><div class="info-card-label">${i.label}</div><div class="info-card-value">${i.value}</div></div>`).join('')}</div>`;
    if(b.t === 'table')
      return `
        <div class="table-wrap">
          <table class="archive-table">
            <thead><tr>${b.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      `;
    return '';
  }).join('');
}

/* ---------------- ホーム ---------------- */
function categoryCount(c){
  if(c.renderMode === 'glossary') return GLOSSARY.length;
  return articlesInCat(c.key).length;
}

function articleCardHtml(a){
  const cat = catByKey(a.cat);
  const colorStyle = cat ? ` style="--cat-color:${cat.color}"` : '';
  if(a.cat === 'character'){
    const imgInner = a.image
      ? `<img src="${a.image}" alt="${a.title}" onerror="this.closest('.character-card-image').classList.add('no-image'); this.remove();">`
      : '';
    return `
      <a class="article-card character-card" href="#/article/${a.id}"${colorStyle}>
        <div class="character-card-image${a.image ? '' : ' no-image'}">
          ${imgInner}
          <span class="no-image-label">NO IMAGE</span>
        </div>
        <div class="article-card-title">${a.title}</div>
        <div class="article-card-lede">${a.lede}</div>
      </a>`;
  }
  return `
    <a class="article-card" href="#/article/${a.id}"${colorStyle}>
      <div class="article-card-title">${a.title}</div>
      <div class="article-card-lede">${a.lede}</div>
    </a>`;
}

function catCardHtml(c){
  return `
    <a class="cat-card" href="#/category/${c.key}" style="--cat-color:${c.color}">
      <div class="cat-icon">${iconSvg(c.icon)}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-desc">${c.desc}</div>
      <div class="cat-count">${categoryCount(c)}項目</div>
    </a>`;
}

function renderHome(){

  setBackgroundTheme(null);

  document.getElementById('home-hero').style.display = 'block';

  const grid = CATEGORIES.map(catCardHtml).join('');

  const recent = ARTICLES.slice(0, 6).map(a => `
    <a class="update-row" href="#/article/${a.id}">
      <span class="update-date">${a.updated}</span>
      <span class="update-name">${a.title}</span>
      <span class="update-cat">${catByKey(a.cat).name}</span>
    </a>`).join('');

  document.getElementById('app').innerHTML = `
    <section class="section">
      <div class="section-inner">
        <div class="section-head">
          <div>
            <div class="section-title">EXPLORE</div>
            <div class="section-sub">世界を探索する</div>
          </div>
        </div>
        <div class="category-grid" id="category-grid">${grid}</div>
      </div>
    </section>
    <section class="section" style="padding-top:0;">
      <div class="section-inner">
        <div class="section-head">
          <div>
            <div class="section-title">最近更新された項目</div>
            <div class="section-sub">RECENTLY UPDATED</div>
          </div>
        </div>
        <div class="update-list">${recent || '<div class="empty-state">まだ記事がありません。</div>'}</div>
      </div>
    </section>`;
  initCardObserver();
}

/* ---------------- 全カテゴリーページ ---------------- */
function renderCategoriesIndexPage(){

  setBackgroundTheme(null);
  document.getElementById('home-hero').style.display = 'none';

  const grid = CATEGORIES.map(catCardHtml).join('');

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a><span>/</span>
        <span style="color:var(--text-primary)">全カテゴリー</span>
      </div>
      <div class="title-block fade-seq" style="border-bottom:none;padding-bottom:20px;">
        <span class="cat-badge">ALL CATEGORIES</span>
        <h1 style="font-size:clamp(28px,4vw,42px);">全カテゴリー</h1>
        <p class="lede">オリジンの資料集は、${CATEGORIES.length}のカテゴリーで構成されています。</p>
      </div>
    </div>
    <div class="wrap" style="padding-top:8px;padding-bottom:100px;">
      <div class="category-grid">${grid}</div>
    </div>
  `;
  initCardObserver();
}

/* ---------------- カテゴリーページ ---------------- */
function timelineHtml(){
  return TIMELINE.length === 0
    ? `<div class="empty-state">まだ年表となる出来事の設定がありません。<br>設定は今後追加される予定です。</div>`
    : `<div class="timeline-list">${TIMELINE.map(ev => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-era">${ev.era}</div>
          <div class="timeline-title">${ev.title} <span class="timeline-tag">${ev.tag}</span></div>
          <div class="timeline-desc">${ev.desc}</div>
        </div>`).join('')}</div>`;
}

function renderGlossaryPage(c){
  const bg = document.getElementById('bg-icon');
  if(bg){ bg.innerHTML = iconSvg(c.icon); }

  if(GLOSSARY.length === 0){
    return `<div class="empty-state">まだ用語が登録されていません。<br>設定は今後追加される予定です。</div>`;
  }

  const sorted = GLOSSARY.slice().sort((a,b) => (a.reading||a.term).localeCompare(b.reading||b.term, 'ja'));

  return `<div class="glossary-list">${sorted.map(g => `
    <div class="glossary-term-card">
      <div class="glossary-term">${g.term}</div>
      <div class="glossary-def">${g.def}</div>
      ${g.articleId ? `<a class="glossary-link" href="#/article/${g.articleId}">関連記事を見る →</a>` : ''}
    </div>`).join('')}</div>`;
}

function renderCategoryPage(key){

  setBackgroundTheme(key);

  const c = catByKey(key);

  if(!c){
    render404();
    return;
  }

  const bg = document.getElementById("bg-icon");
  if(bg){ bg.innerHTML = iconSvg(c.icon); }

  document.getElementById("home-hero").style.display = "none";

  let body;

  if(c.renderMode === 'glossary'){
    body = renderGlossaryPage(c);
  }else{
    const arts = articlesInCat(key);
    body = arts.length === 0
      ? `<div class="empty-state">この分類にはまだ記事がありません。<br>設定は今後追加される予定です。</div>`
      : `<div class="article-grid${arts.some(a=>a.cat==='character')?' character-grid':''}">${arts.map(articleCardHtml).join("")}</div>`;

    if(c.subLink){
      body += `<a class="btn btn-ghost sublink-btn" href="${c.subLink.route}" style="--cat-color:${c.color}">${c.subLink.label} →</a>`;
    }
  }

  document.getElementById("app").innerHTML = `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a>
        <span>/</span>
        <span style="color:var(--text-primary)">${c.name}</span>
      </div>
      <div class="title-block fade-seq" style="border-bottom:none;padding-bottom:36px;">
        <span class="cat-badge">${c.name} — CATEGORY</span>
        <h1 style="font-size:clamp(28px,4vw,42px);">${c.name}</h1>
        <p class="lede">${c.desc}</p>
      </div>
    </div>
    <div class="wrap" style="padding-top:8px;padding-bottom:100px;">
      ${body}
    </div>
  `;
}

/* ---------------- 歴史年表（専用ページ） ---------------- */
function renderHistoryTimelinePage(){
  setBackgroundTheme('history');
  document.getElementById('home-hero').style.display = 'none';

  const bg = document.getElementById('bg-icon');
  if(bg){ bg.innerHTML = iconSvg('clock'); }

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a><span>/</span>
        <a href="#/category/history">歴史</a><span>/</span>
        <span style="color:var(--text-primary)">歴史年表</span>
      </div>
      <div class="title-block fade-seq" style="border-bottom:none;padding-bottom:36px;">
        <span class="cat-badge">HISTORY TIMELINE</span>
        <h1 style="font-size:clamp(28px,4vw,42px);">歴史年表</h1>
        <p class="lede">オリジンの歴史の流れを、時系列でまとめています。個々の出来事について詳しく知りたい場合は歴史カテゴリーの記事を参照してください。</p>
      </div>
    </div>
    <div class="wrap" style="padding-top:8px;padding-bottom:100px;">
      ${timelineHtml()}
      <a class="btn btn-ghost sublink-btn" href="#/category/history" style="--cat-color:${catByKey('history').color}">← 歴史の記事一覧へ戻る</a>
    </div>
  `;
}

/* ---------------- 世界地図（専用ページ） ---------------- */
function renderWorldMapPage(){
  setBackgroundTheme('city');
  document.getElementById('home-hero').style.display = 'none';

  const bg = document.getElementById('bg-icon');
  if(bg){ bg.innerHTML = iconSvg('flag'); }

  const cities = articlesInCat('city');
  const cityColor = catByKey('city').color;
  const nodes = cities.map(a => `
    <a class="map-node" href="#/article/${a.id}" style="--cat-color:${cityColor}">
      <span class="map-node-dot"></span>
      <span class="map-node-name">${a.title}</span>
    </a>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a><span>/</span>
        <a href="#/category/city">都市</a><span>/</span>
        <span style="color:var(--text-primary)">世界地図</span>
      </div>
      <div class="title-block fade-seq" style="border-bottom:none;padding-bottom:36px;">
        <span class="cat-badge">WORLD MAP</span>
        <h1 style="font-size:clamp(28px,4vw,42px);">世界地図</h1>
        <p class="lede">オリジンに存在する都市の一覧です。都市間の位置関係・地形などの地理設定はまだ届いていないため、実際の地図ではなく一覧形式で表示しています。設定が届き次第、実際の地図表示に更新される予定です。</p>
      </div>
    </div>
    <div class="wrap" style="padding-top:8px;padding-bottom:100px;">
      <div class="map-node-grid">${nodes || '<div class="empty-state">まだ都市が登録されていません。</div>'}</div>
      <a class="btn btn-ghost sublink-btn" href="#/category/city" style="--cat-color:${catByKey('city').color}">← 都市の記事一覧へ戻る</a>
    </div>
  `;
}
let articleIndexSort = 'updated';

function renderAllArticles(){

  setBackgroundTheme(null);
  document.getElementById('home-hero').style.display = 'none';

  let list = ARTICLES.slice();

  if(articleIndexSort === 'updated'){
    list.sort((a,b) => b.updated.localeCompare(a.updated));
  }else if(articleIndexSort === 'title'){
    list.sort((a,b) => a.title.localeCompare(b.title, 'ja'));
  }else if(articleIndexSort === 'category'){
    list.sort((a,b) => a.cat.localeCompare(b.cat));
  }

  const rows = list.map(a => {
    const c = catByKey(a.cat);
    return `
      <a class="article-index-card theme-${a.cat}" style="--category-color:${c ? c.color : ''}" href="#/article/${a.id}">
        <div>
          <div class="article-index-title">${a.title}</div>
          <div class="article-index-lede">${a.lede}</div>
        </div>
        <div class="article-index-meta">
          <span class="article-index-cat">${c ? c.name : a.cat}</span>
          <span>${a.updated}</span>
        </div>
      </a>
    `;
  }).join('');

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a><span>/</span>
        <span style="color:var(--text-primary)">全記事一覧</span>
      </div>
      <div class="title-block fade-seq" style="border-bottom:none;padding-bottom:20px;">
        <span class="cat-badge">ALL ARTICLES</span>
        <h1 style="font-size:clamp(28px,4vw,42px);">全記事一覧</h1>
        <p class="lede">オリジンに関するすべての資料を、更新日・名前・カテゴリーで並び替えて見られます。</p>
        <div class="index-sort">
          <button onclick="setArticleSort('updated')">更新順</button>
          <button onclick="setArticleSort('title')">名前順</button>
          <button onclick="setArticleSort('category')">カテゴリ順</button>
        </div>
      </div>
    </div>
    <div class="wrap article-index-wrap">
      <div class="article-index-list">${rows || '<div class="empty-state">まだ記事がありません。</div>'}</div>
    </div>
  `;
}

function setArticleSort(type){
  articleIndexSort = type;
  renderAllArticles();
}

/* ---------------- 記事ページ ---------------- */
function renderArticlePage(id){

  const a = articleById(id);

  document.getElementById('home-hero').style.display = 'none';
  if(!a){ render404(); return; }

  setBackgroundTheme(a.cat);

  const c = catByKey(a.cat);

  const toc = a.sections.map(s => `<a href="#${s.id}">${s.title}</a>`).join('');
  const miniCats = CATEGORIES.map(cc => `<a href="#/category/${cc.key}" class="${cc.key===a.cat?'active':''}">${cc.name}</a>`).join('');
  const sectionsHtml = a.sections.map(s => `<h2 id="${s.id}">${s.title}</h2>${renderBlocks(s.blocks)}`).join('');
  const related = (a.related||[]).map(relatedChip).join('');

  const isCity = a.cat === 'city';
  const isCharacter = a.cat === 'character';
  const accentStyle = isCity && a.accentColor ? ` style="--city-accent:${a.accentColor};background:${a.accentColor}11;"` : '';
  const imageHtml = (a.image && !isCharacter) ? `<div class="article-hero-image-wrap"><img class="article-hero-image" src="${a.image}" alt="${a.title}" onerror="this.parentElement.style.display='none'"></div>` : '';
  const portraitHtml = isCharacter ? `
    <div class="character-portrait${a.image ? '' : ' no-image'}">
      ${a.image ? `<img src="${a.image}" alt="${a.title}" onerror="this.closest('.character-portrait').classList.add('no-image'); this.remove();">` : ''}
      <span class="no-image-label">NO IMAGE</span>
    </div>` : '';

  document.getElementById('app').innerHTML = `
    <div class="page-header ${isCity?'city-page':''}"${accentStyle}>
      ${isCity ? '<div class="city-banner-strip"></div>' : ''}
      <div class="breadcrumb">
        <a href="#/">ORIGIN ARCHIVE</a><span>/</span>
        <a href="#/category/${c.key}">${c.name}</a><span>/</span>
        <span style="color:var(--text-primary)">${a.title}</span>
      </div>
      <div class="title-block fade-seq ${isCharacter?'character-title-block':''}">
        ${portraitHtml}
        <span class="cat-badge">${c.name}</span>
        <h1>${a.title}</h1>
        <p class="lede">${a.lede}</p>
        <div class="meta-row"><span>更新日：${a.updated}</span><span>カテゴリ：${c.name}</span></div>
      </div>
      ${imageHtml}
    </div>
    <div class="body-wrap ${isCity?'city-page':''}"${accentStyle}>
      <aside class="sidebar">
        <div><div class="side-block-title">目次</div><nav class="toc-list" id="toc-list">${toc}</nav></div>
        <div><div class="side-block-title">カテゴリー</div><nav class="mini-cat-list">${miniCats}</nav></div>
        <div><div class="side-block-title">資料集を探す</div>
          <div class="btn btn-ghost" style="width:100%; justify-content:center;" onclick="openSearch()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.4" y2="16.4"/></svg>
            検索する
          </div>
        </div>
      </aside>
      <div class="article-content">
        <div class="content-card">
          ${sectionsHtml}
          ${a.related && a.related.length ? `<h2>関連項目</h2><div class="related-links">${related}</div>` : ''}
        </div>
        <a class="back-top-link" href="#/">← 資料集トップへ戻る</a>
      </div>
    </div>`;
  initScrollSpy();
}

/* ---------------- ルーター ---------------- */
/* ---------------- 404 ---------------- */
function render404(){
  setBackgroundTheme(null);
  document.getElementById('home-hero').style.display = 'none';

  document.getElementById('app').innerHTML = `
    <div class="not-found-page">
      <div class="not-found-mark">?</div>
      <h1>資料が見つかりませんでした</h1>
      <p class="lede">お探しのページは存在しないか、移動または削除された可能性があります。<br>URLをご確認いただくか、下記からお探しください。</p>
      <div class="hero-cta" style="margin-top:32px;">
        <a class="btn btn-primary" href="#/">トップページへ</a>
        <a class="btn btn-ghost" href="#/categories">カテゴリーから探す</a>
        <a class="btn btn-ghost" href="#" onclick="event.preventDefault();openSearch();">検索する</a>
      </div>
    </div>
  `;
}

function router(){

  const hash = location.hash;

  if(hash === '#/articles'){
    renderAllArticles();
  }else if(hash === '#/categories'){
    renderCategoriesIndexPage();
  }else if(hash === '#/history/timeline'){
    renderHistoryTimelinePage();
  }else if(hash === '#/city/map'){
    renderWorldMapPage();
  }else if(hash.startsWith('#/article/')){
    renderArticlePage(hash.replace('#/article/',''));
  }else if(hash.startsWith('#/category/')){
    renderCategoryPage(hash.replace('#/category/',''));
  }else if(hash === '' || hash === '#/' || hash === '#'){
    renderHome();
  }else if(hash.startsWith('#/')){
    render404();
  }else{
    // ページ内アンカー（目次リンクなど）は無視
    return;
  }

  window.scrollTo({ top:0, behavior:'auto' });
}

window.addEventListener('hashchange', router);

/* ---------------- トースト ---------------- */
let toastTimer;
function toastMsg(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------------- 検索 ---------------- */
function buildSearchIndex(){
  const fromArticles = ARTICLES.map(a => ({name:a.title, cat:catByKey(a.cat).name, articleId:a.id}));
  const fromGlossary = GLOSSARY.filter(g => !ARTICLES.find(a=>a.id===g.articleId)).map(g => ({name:g.term, cat:'用語集', articleId:g.articleId||null}));
  return [...fromArticles, ...fromGlossary];
}
const SEARCH_INDEX = buildSearchIndex();

function openSearch(){
  document.getElementById('search-overlay').classList.add('open');
  document.getElementById('search-input').value = '';
  runSearch('');
  setTimeout(()=>document.getElementById('search-input').focus(), 60);
}
function closeSearch(){ document.getElementById('search-overlay').classList.remove('open'); }
function runSearch(q){
  const results = document.getElementById('search-results');
  const filtered = q.trim()==='' ? SEARCH_INDEX : SEARCH_INDEX.filter(i => i.name.includes(q) || i.cat.includes(q));
  if(filtered.length === 0){
    results.innerHTML = `<div class="search-empty">「${q}」に一致する項目が見つかりませんでした</div>`;
    return;
  }
  results.innerHTML = filtered.map(i => `
    <div class="search-result-item" onclick="closeSearch(); ${i.articleId ? `location.hash='#/article/${i.articleId}';` : `toastMsg('詳細ページは準備中です');`}">
      <span class="sr-name">${i.name}</span><span class="sr-cat">${i.cat}</span>
    </div>`).join('');
}
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeSearch();
  if((e.metaKey || e.ctrlKey) && e.key === 'k'){ e.preventDefault(); openSearch(); }
});

/* ---------------- テーマ切替（TECH MODE / MAGIC MODE） ---------------- */
function setMode(mode){
  // mode: 'tech' (dark) または 'magic' (light)
  document.documentElement.setAttribute('data-theme', mode === 'tech' ? 'dark' : 'light');
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  if(mode === 'magic'){ initParticles(); }
}

function initParticles(){
  const layer = document.getElementById('bg-particles');
  if(!layer || layer.dataset.built) return;
  layer.dataset.built = '1';
  let html = '';
  for(let i=0; i<44; i++){
    const left = Math.random()*100;
    const top = Math.random()*100;
    const size = (Math.random()*2 + 1.2).toFixed(1);
    const delay = (Math.random()*6).toFixed(2);
    const dur = (3 + Math.random()*4).toFixed(2);
    html += `<span class="star" style="left:${left}%; top:${top}%; width:${size}px; height:${size}px; animation-delay:${delay}s; animation-duration:${dur}s;"></span>`;
  }
  layer.innerHTML = html;
}

/* ---------------- カードのフェードイン ---------------- */
function initCardObserver(){
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); } });
  }, {threshold:0.1});
  document.querySelectorAll('.cat-card').forEach(el => obs.observe(el));
}

/* ---------------- 目次スクロールスパイ ---------------- */
function initScrollSpy(){
  const links = Array.from(document.querySelectorAll('#toc-list a'));
  const targets = links.map(l => document.querySelector(l.getAttribute('href')));
  window.onscroll = () => {
    let current = targets[0];
    const pos = window.scrollY + 140;
    targets.forEach(t => { if(t && t.offsetTop <= pos) current = t; });
    links.forEach(l => l.classList.toggle('active', current && l.getAttribute('href') === '#' + current.id));
  };
}

/* ---------------- 初期化 ---------------- */
renderNav();
router();
if(!location.hash) renderHome();
setMode(document.documentElement.getAttribute('data-theme') === 'dark' ? 'tech' : 'magic');
