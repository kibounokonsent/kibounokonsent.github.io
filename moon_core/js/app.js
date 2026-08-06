const ICONS = {
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  flag:'<path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  crystal:'<path d="M12 2l7 6-2.5 12h-9L5 8z"/>',
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  org:'<circle cx="12" cy="6" r="2.4"/><circle cx="6" cy="17" r="2.4"/><circle cx="18" cy="17" r="2.4"/><path d="M12 8.4V13M8 15.6l2.2-2M16 15.6l-2.2-2"/>',
  creature:'<path d="M12 3c4 0 7 3 7 8s-3 9-7 9-7-4-7-9 3-8 7-8z"/><circle cx="9.5" cy="10" r="0.8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10" r="0.8" fill="currentColor" stroke="none"/>',
  shrine:'<path d="M4 21V10l8-6 8 6v11"/><path d="M2 10h20"/><path d="M9 21v-7h6v7"/>',
  person:'<circle cx="12" cy="8" r="3.6"/><path d="M5 21c0-4 3-6.5 7-6.5S19 17 19 21"/>',
  book:'<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  leaf:'<path d="M4 20c8 0 14-6 14-14 0 0-10 0-14 6-3 4-2 8 0 8z"/><path d="M4 20c0-4 2-8 6-10"/>',
  scale:'<path d="M12 3v18M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
};

function catByKey(key){ return CATEGORIES.find(c => c.key === key); }

function setBackgroundTheme(theme){
  const themes = [
    "theme-world",
    "theme-history",
    "theme-life",
    "theme-tech",
    "theme-substance",
    "theme-nation",
    "theme-creature",
    "theme-org",
    "theme-mutant",
    "theme-culture",
    "theme-law",
    "theme-glossary"
  ];

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

  // ヘッダーには主要カテゴリーを表示
  const main = [
    'world',
    'history',
    'tech',
    'mutant',
    'nation',
    'glossary'
  ];

  const nav =
    main.map(k => navLinkFor(catByKey(k))).join('') +
    `
      <a href="#/articles">
        全記事一覧
      </a>
    `;

  document.getElementById('main-nav').innerHTML = nav;
}

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
    if(b.t === 'cities') return `<div class="city-grid">${b.items.map(c=>`<div class="city-card"><div class="city-card-name">${c.name}</div><div class="city-card-role">${c.role}</div><div class="city-card-desc">${c.desc}</div></div>`).join('')}</div>`;
    if(b.t === 'facilities') return `${b.items.map(fc=>`<div class="facility-item"><div class="facility-name">${fc.name}</div><div class="facility-desc">${fc.desc}</div></div>`).join('')}`;
    if(b.t === 'table')
  return `
    <div class="table-wrap">
      <table class="archive-table">
        <thead>
          <tr>
            ${b.headers.map(h=>`<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${b.rows.map(r=>`
            <tr>
              ${r.map(c=>`<td>${c}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
    return '';
  }).join('');
}

/* ---------------- ホーム ---------------- */
function renderHome(){

  setBackgroundTheme(null);

  document.getElementById('home-hero').style.display = 'block';
  const grid = CATEGORIES.map(c => {
    const count = c.renderMode === 'glossary' ? GLOSSARY.length : (c.renderMode === 'timeline' ? TIMELINE.length : articlesInCat(c.key).length);
    return `
    <a class="cat-card" href="#/category/${c.key}">
      <div class="cat-icon">${iconSvg(c.icon)}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-desc">${c.desc}</div>
      <div class="cat-count">${count}項目</div>
    </a>`;
  }).join('');

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
            <div class="section-title">カテゴリー</div>
            <div class="section-sub">CATEGORIES — ${CATEGORIES.length} SECTIONS</div>
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
        <div class="update-list">${recent}</div>
      </div>
    </section>`;
  initCardObserver();
}

/* ---------------- カテゴリーページ ---------------- */
function renderCategoryPage(key){

  setBackgroundTheme(key);

  const c = catByKey(key);

  if(!c){
    renderHome();
    return;
  }

  // 背景アイコンを切り替え
  const bg = document.getElementById("bg-icon");
  if(bg){
    bg.innerHTML = iconSvg(c.icon);
  }

  document.getElementById("home-hero").style.display = "none";

  let body = "";
  const note = c.note ? `<div class="cat-note">${c.note}</div>` : "";

  if(c.renderMode === "glossary"){

    body = `
      <div class="glossary-list">
        ${GLOSSARY.map(g=>`
          <div class="glossary-item">

            <div class="glossary-term"
              onclick="${
                g.articleId
                ? `location.hash='#/article/${g.articleId}'`
                : `toastMsg('「${g.term}」— 詳細ページは準備中です')`
              }">

              ${g.term}

              ${
                g.articleId
                ? `<span class="glossary-link-icon">記事を見る</span>`
                : ""
              }

            </div>

            <div class="glossary-def">
              ${g.def}
            </div>

          </div>
        `).join("")}
      </div>
    `;

}else if(c.renderMode==="history"){

    const arts = ARTICLES.filter(a=>a.cat==="history");

    body = `
        ${note}

        <div class="hero-cta history-entry">

    <a class="btn btn-ghost" href="#/history/timeline">
        歴史年表を見る
    </a>

</div>

        <div class="article-grid">

            ${arts.map(a=>`

                <a class="article-card" href="#/article/${a.id}">

                    <div class="article-card-title">
                        ${a.title}
                    </div>

                    <div class="article-card-lede">
                        ${a.lede}
                    </div>

                </a>

            `).join("")}

        </div>
    `;

}else{

    const arts = articlesInCat(key);

    if(arts.length===0){

      body = `
        ${note}
        <div class="empty-state">
          この分類にはまだ記事がありません。<br>
          設定は今後追加される予定です。
        </div>
      `;

    }else{

      body = `
        ${note}

        <div class="article-grid">

  ${arts.map(a=>`

            <a class="article-card"
               href="#/article/${a.id}">

                <div class="article-card-title">
                  ${a.title}
                </div>

                <div class="article-card-lede">
                  ${a.lede}
                </div>

            </a>

          `).join("")}

        </div>
      `;

    }

  }

  document.getElementById("app").innerHTML = `

    <div class="page-header">

      <div class="breadcrumb">
        <a href="#/">MOON CORE</a>
        <span>/</span>
        <span style="color:var(--text-primary)">
          ${c.name}
        </span>
      </div>

      <div class="title-block fade-seq"
           style="border-bottom:none;padding-bottom:36px;">

        <span class="cat-badge">
          ${c.name} — CATEGORY
        </span>

        <h1 style="font-size:clamp(28px,4vw,42px);">
          ${c.name}
        </h1>

        <p class="lede">
          ${c.desc}
        </p>

      </div>

    </div>

    <div class="wrap"
         style="padding-top:8px;padding-bottom:100px;">

      ${body}

    </div>

  `;

}

function renderHistoryPage(title, subtitle, body, breadcrumbText){

  document.getElementById("app").innerHTML = `

    <div class="page-header">

      <div class="breadcrumb">
        <a href="#/">MOON CORE</a>
        <span>/</span>
        <a href="#/category/history">歴史</a>
        <span>/</span>
        <span>${breadcrumbText}</span>
      </div>

      <div class="title-block">
        <span class="cat-badge">HISTORY</span>
        <h1>${title}</h1>
        <p class="lede">
          ${subtitle}
        </p>
      </div>

    </div>

    <div class="wrap">
      ${body}
    </div>

  `;

}

function renderHistoryArticles(){

  setBackgroundTheme("history");
  document.getElementById("home-hero").style.display = "none";

  const arts = articlesInCat("history");

  const body = arts.length === 0
    ? `
      <div class="empty-state">
        歴史記事はまだありません。
      </div>
    `
    : `
      <div class="article-grid">

        ${arts.map(a=>`

          <a class="article-card"
             href="#/article/${a.id}">

            <div class="article-card-title">
              ${a.title}
            </div>

            <div class="article-card-lede">
              ${a.lede}
            </div>

          </a>

        `).join("")}

      </div>
    `;

  renderHistoryPage("歴史記事","世界史を詳しく解説した資料一覧です。", body, "歴史記事");

}

function renderHistoryTimeline(){

  setBackgroundTheme("history");
  document.getElementById("home-hero").style.display = "none";

  let body = "";

  if(TIMELINE.length === 0){

    body = `
      <div class="empty-state">
        年表はまだありません。
      </div>
    `;

  }else{

    body = `
      <div class="timeline-list">

        ${TIMELINE.map(ev=>`

          <div class="timeline-item">

            <div class="timeline-dot"></div>

            <div class="timeline-content">

              <div class="timeline-era">
                ${ev.era}
                ${ev.tag ? `<span class="timeline-tag">${ev.tag}</span>` : ""}
              </div>

              <div class="timeline-title">
                ${ev.title}
              </div>

              <div class="timeline-desc">
                ${ev.desc}
              </div>

            </div>

          </div>

        `).join("")}

      </div>
    `;
  }

  renderHistoryPage("歴史年表","統合暦の出来事を年代順に閲覧できます。", body, "歴史年表");

}

/* ---------------- 全記事一覧 ---------------- */

let articleIndexSort = 'updated';

function renderAllArticles(){

  setBackgroundTheme(null);
  document.getElementById("home-hero").style.display = "none";


let list = [...ARTICLES];


if(articleIndexSort === 'updated'){

  list.sort((a,b)=>
    b.updated.localeCompare(a.updated)
  );

}else if(articleIndexSort === 'title'){

  list.sort((a,b)=>
    a.title.localeCompare(b.title,"ja")
  );

}else if(articleIndexSort === 'category'){

  list.sort((a,b)=>
    catByKey(a.cat).name.localeCompare(catByKey(b.cat).name,"ja")
  );

}


  const rows = list.map(a=>`

    <a class="article-index-card theme-${a.cat}"
   href="#/article/${a.id}">

      <div class="article-index-main">

        <div class="article-index-title">
          ${a.title}
        </div>

        <div class="article-index-lede">
          ${a.lede || "詳細情報は資料ページを参照してください。"}
        </div>

      </div>


      <div class="article-index-meta">

        <span class="article-index-cat">
          ${catByKey(a.cat).name}
        </span>

        <span class="article-index-date">
          ${a.updated}
        </span>

      </div>

    </a>

  `).join("");



  document.getElementById("app").innerHTML = `

    <div class="page-header">

      <div class="breadcrumb">

        <a href="#/">MOON CORE</a>

        <span>/</span>

        <span style="color:var(--text-primary)">
          全記事一覧
        </span>

      </div>


      <div class="title-block fade-seq">

        <span class="cat-badge">
          ARTICLE INDEX
        </span>


        <h1>
          全記事一覧
        </h1>


        <p class="lede">

  MOON COREに登録されている
  すべての記事一覧です。<br>

  現在登録資料：
  <strong>${ARTICLES.length}項目</strong>

</p>


<div class="index-sort">

  <button onclick="setArticleSort('updated')">
    更新順
  </button>


  <button onclick="setArticleSort('title')">
    名前順
  </button>


  <button onclick="setArticleSort('category')">
    カテゴリ順
  </button>


      </div>

    </div>




    <div class="wrap article-index-wrap">

      <div class="article-index-list">

        ${rows}

      </div>

    </div>

  `;

}

/* ---------------- 全記事一覧 並び替え ---------------- */

function setArticleSort(type){

  articleIndexSort = type;

  renderAllArticles();

}

/* ---------------- 記事ページ ---------------- */
function renderArticlePage(id){

  const a = articleById(id);

  if(a){
    setBackgroundTheme(a.cat);
  }
  document.getElementById('home-hero').style.display = 'none';
  if(!a){ renderHome(); return; }

  // 背景テーマを切り替える
  CATEGORIES.forEach(c => {
    document.body.classList.remove("theme-" + c.key);
  });

  document.body.classList.add("theme-" + a.cat);

  const c = catByKey(a.cat);

  const toc = a.sections.map(s => `<a href="#${s.id}">${s.title}</a>`).join('');
  const miniCats = CATEGORIES.map(cc => `<a href="#/category/${cc.key}" class="${cc.key===a.cat?'active':''}">${cc.name}</a>`).join('');
  const sectionsHtml = a.sections.map(s => `<h2 id="${s.id}">${s.title}</h2>${renderBlocks(s.blocks)}`).join('');
  const related = (a.related||[]).map(relatedChip).join('');
  const isNation = a.cat === 'nation';
  const accentStyle = isNation && a.accentColor ? ` style="--nation-accent:${a.accentColor};background:${a.accentColor}11;"` : '';
  const flagHtml = isNation ? `<div class="flag-box">${a.flagUrl ? `<img src="${a.flagUrl}" alt="${a.title}の国旗" onerror="this.parentElement.innerHTML='国旗&lt;br&gt;（未設定）'">` : '国旗<br>（未設定）'}</div>` : '';
  const imageHtml = a.image ? `<div class="article-hero-image-wrap"><img class="article-hero-image" src="${a.image}" alt="${a.title}" onerror="this.parentElement.style.display='none'"></div>` : '';

const creatureImageHtml = a.imageUrl ? `<div class="creature-icon-wrap"><img class="creature-icon-image" src="${a.imageUrl}" alt="${a.title}" onerror="this.parentElement.style.display='none'"></div>` : '';

  document.getElementById('app').innerHTML = `
    <div class="page-header ${isNation?'nation-page':''}"${accentStyle}>
      ${isNation ? '<div class="nation-banner-strip"></div>' : ''}
      <div class="breadcrumb">
        <a href="#/">MOON CORE</a><span>/</span>
        <a href="#/category/${c.key}">${c.name}</a><span>/</span>
        <span style="color:var(--text-primary)">${a.title}</span>
      </div>
      <div class="title-block fade-seq">
        ${isNation ? `<div class="nation-header-row">${flagHtml}<div>` : ''}
        <span class="cat-badge">${c.name}</span>
        <h1>${a.title}</h1>
        <p class="lede">${a.lede}</p>
        <div class="meta-row"><span>更新日：文明統合暦 ${a.updated}</span><span>カテゴリ：${c.name}</span></div>
        ${isNation ? `</div></div>` : ''}
      </div>
      ${isNation ? '' : creatureImageHtml}
${imageHtml}
    </div>
    <div class="body-wrap ${isNation?'nation-page':''}"${accentStyle}>
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
function router(){

  const hash = location.hash;

if(hash === '#/articles'){

  renderAllArticles();

} else if(hash === '#/history/articles'){

  renderHistoryArticles();

} else if(hash === '#/history/timeline'){

  renderHistoryTimeline();

} else if(hash.startsWith('#/article/')){

    renderArticlePage(hash.replace('#/article/',''));

  } else if(hash.startsWith('#/category/')){

    renderCategoryPage(hash.replace('#/category/',''));

  } else if(hash === '' || hash === '#/' || hash === '#'){

    renderHome();

  } else {

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
  const fromGlossary = GLOSSARY.filter(g => !ARTICLES.find(a=>a.id===g.articleId)).map(g => ({name:g.term, cat:'用語集', articleId:null}));
  return fromArticles.concat(fromGlossary);
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
    <div class="search-result-item" onclick="${i.articleId ? `closeSearch(); location.hash='#/article/${i.articleId}';` : `closeSearch(); toastMsg('「${i.name}」— 詳細ページは準備中です')`}">
      <span class="sr-name">${i.name}</span><span class="sr-cat">${i.cat}</span>
    </div>`).join('');
}
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeSearch();
  if((e.metaKey || e.ctrlKey) && e.key === 'k'){ e.preventDefault(); openSearch(); }
});

/* ---------------- テーマ切替 ---------------- */
function toggleTheme(){
  const html = document.documentElement;
  html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
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
