/* =========================================================
   魔天楼 ARCHIVE — app.js
   この書は塔の形をしている：↑昇塔（天使）／●地上（人の世）／↓降塔（悪魔）

   ルート：
     #/                    トップ
     #/r/{heaven|ground|abyss}   領域（その領域のすべての章と節）
     #/c/{章ID}             章（領域ページのその章へ。人物・用語集は専用ページ）
     #/a/{記事ID}[/{項目}]   記事（項目＝本文の見出し。直接そこへ飛ぶ）
     #/ch/{キャラID}         キャラクター
     #/ascend[/{階}]        昇塔の演出ページ（天界へ）
     #/descend[/{階}]       降塔の演出ページ（魔界へ）
     #/articles            すべての節
     #/search/{語}          検索結果
     #/horologium          世界の時計
     #/deep                深層
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var app = $('#app');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TYPE = {
    angel: { name: '天使', side: 'heaven' },
    demon: { name: '悪魔', side: 'abyss' },
    human: { name: '一般人', side: 'none' }
  };
  var REALM_SIDE = { heaven: 'heaven', abyss: 'abyss', ground: 'none', ref: 'none', deep: 'abyss' };

  /* ---------- データ索引 ---------- */
  var catById = {}; CATEGORIES.forEach(function (c) { catById[c.id] = c; });
  var realmById = {}; REALMS.forEach(function (r) { realmById[r.id] = r; });
  var artById = {}; ARTICLES.forEach(function (a) { artById[a.id] = a; });
  var chById = {}; CHARACTERS.forEach(function (c) { chById[c.id] = c; });
  var ALIASES = window.ALIASES || {};
  var BOOK = CATEGORIES.filter(function (c) { return realmById[c.realm]; });   // 章番号を振る章（昇塔→地上→降塔の順）

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

  /* 参照（記事ID・記事ID/項目・古いID）を解決する */
  function secKey(s, i) { return s.key || ('s' + (i + 1)); }
  function resolve(ref) {
    ref = ALIASES[ref] || ref;
    var p = String(ref).split('/'), a = artById[p[0]], sec = null;
    if (a && p[1]) (a.sections || []).forEach(function (s, i) { if (secKey(s, i) === p[1]) sec = s; });
    return { a: a, sec: sec, href: a ? '#/a/' + a.id + (p[1] ? '/' + p[1] : '') : '', title: a ? (sec && sec.h ? sec.h : a.title) : p[0] };
  }
  var REF_RE = /\[\[([^\]|]+)\|?([^\]]*)\]\]/g;
  function stripRefs(s) { return String(s || '').replace(REF_RE, function (_, id, label) { return label || resolve(id).title; }); }
  function rich(s) {
    return esc(s).replace(REF_RE, function (_, id, label) {
      var r = resolve(id), text = label || r.title;
      return r.a && visible(r.a) ? '<a class="ref" href="' + r.href + '">' + text + '</a>' : '<a class="ref missing" title="この節はまだ記されていない">' + text + '</a>';
    });
  }

  function realmOf(catId) { var c = catById[catId]; return c ? c.realm : 'ground'; }
  function sideOf(catId) { return REALM_SIDE[realmOf(catId)] || 'none'; }
  function side(catId) { return 'side-' + sideOf(catId); }
  function visible(a) { return (!a.deep || deepOpen()) && (!a.spoiler || spoilOK()); }
  function articlesIn(catId) { return ARTICLES.filter(function (a) { return a.cat === catId && visible(a); }); }
  function realmCats(rid) { return CATEGORIES.filter(function (c) { return c.realm === rid; }); }
  function realmArticles(rid) { var l = []; realmCats(rid).forEach(function (c) { l = l.concat(articlesIn(c.id)); }); return l; }
  function byDateDesc(a, b) { return (b.updated || '').localeCompare(a.updated || '') || a.title.localeCompare(b.title, 'ja'); }
  function countOf(c) { return c.id === 'character' ? CHARACTERS.filter(function (x) { return !x.spoiler || spoilOK(); }).length : c.id === 'glossary' ? GLOSSARY.length : articlesIn(c.id).length; }
  function unitOf(c) { return c.id === 'glossary' ? '語' : c.id === 'character' ? '名' : '節'; }

  /* 章と節：章（カテゴリー）を昇塔→地上→降塔の順に第一章から、記事を節として振る */
  function kan(n) { var d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']; if (n < 10) return d[n]; if (n < 20) return '十' + d[n - 10]; return d[Math.floor(n / 10)] + '十' + d[n % 10]; }
  function chapter(catId) { var i = BOOK.indexOf(catById[catId]); return i >= 0 ? '第' + kan(i + 1) + '章' : (catById[catId] || {}).name || ''; }
  function recCode(a) { var list = a.deep ? ARTICLES.filter(function (x) { return x.deep; }) : articlesIn(a.cat); return chapter(a.cat) + '　第' + kan(list.indexOf(a) + 1) + '節'; }
  function realmTag(rid) {
    var r = realmById[rid]; if (!r) return '';
    return '<span class="rtag rt-' + rid + '"><i>' + r.mark + '</i>' + esc(r.name) + '</span>';
  }

  /* 紋章 */
  function sigil(sideName) {
    var k = sideName === 'heaven' ? 'angel' : sideName === 'abyss' ? 'demon' : 'human';
    return '<span class="sigil ' + (sideName || 'none') + '" aria-hidden="true">' + emblem(k) + '</span>';
  }
  function embOfArticle(id) { return SIN_EMB.indexOf(id) >= 0 ? [id] : null; }
  function embOfKind(text) { for (var i = 0; i < KINDS.length; i++) if (text && String(text).indexOf(KINDS[i][1]) >= 0) return KINDS[i][0]; return ''; }
  function drawn(id, delay) {
    var ids = [].concat(id);
    return ids.map(function (k, i) { return '<span class="emb-wrap" style="--d:' + ((delay || 0) + i * 0.5) + 's">' + emblem(k, reduced ? '' : 'drawn') + '</span>'; }).join('');
  }
  function divider(kind) { return '<div class="wrap divider ' + (kind || 'heaven') + '" aria-hidden="true">' + emblem(kind === 'abyss' ? 'orn-demon' : 'orn-angel') + '</div>'; }

  /* ---------- 共通パーツ ---------- */
  function listRow(a, opt) {
    opt = opt || {};
    return '<a class="l-row ' + side(a.cat) + '" href="#/a/' + a.id + '">' +
      '<span class="code">' + (opt.realm ? realmTag(realmOf(a.cat)) + ' ' : '') + esc(opt.cat ? (catById[a.cat] || {}).name : recCode(a)) + '</span>' +
      '<h3>' + esc(a.title) + (a.reading ? '<small>' + esc(a.reading) + '</small>' : '') + '</h3><p>' + esc(stripRefs(a.summary)) + '</p></a>';
  }
  function crumbs(list) {
    return '<nav class="crumbs wrap" aria-label="現在地"><a href="#/">魔天楼</a>' + list.map(function (x) {
      return '<span class="sl">/</span>' + (x.href ? '<a href="' + x.href + '">' + (x.html || esc(x.t)) + '</a>' : '<span aria-current="page">' + (x.html || esc(x.t)) + '</span>');
    }).join('') + '</nav>';
  }
  function realmCrumb(rid) { var r = realmById[rid]; return r ? { html: realmTag(rid), href: '#/r/' + rid } : rid === 'deep' ? { t: '深層', href: '#/deep' } : { t: '資料' }; }
  function logoGradient() {
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="logoGrad" gradientUnits="userSpaceOnUse" x1="0" y1="46" x2="0" y2="313">' +
      '<stop offset="0" style="stop-color:var(--heaven)"/><stop offset=".40" style="stop-color:var(--text)"/><stop offset=".64" style="stop-color:var(--text)"/><stop offset="1" style="stop-color:var(--abyss)"/>' +
      '</linearGradient></defs></svg>';
  }
  /* 塔の階（昇塔は上から＝神級→化級、降塔は上から＝霊級→神級） */
  function floorsOf(rid) { return rid === 'heaven' ? TOWER.heaven.floors.slice().reverse() : rid === 'abyss' ? TOWER.abyss.floors : []; }
  function rankRef(rid, f) { var k = RANK_ID[f.name]; return (rid === 'heaven' ? 'angel-ranks/' : 'demon-ranks/') + k; }
  function firstSentence(t) { var i = String(t).indexOf('。'); return i > 0 ? t.slice(0, i + 1) : t; }

  /* ---------- トップ ---------- */
  function renderHome() {
    var recent = ARTICLES.filter(visible).sort(byDateDesc).slice(0, 5);
    app.innerHTML = logoGradient() +
      '<section class="wrap hero">' +
        '<div class="side-v l">人の世は、その間にある。</div>' +
        '<div class="hero-center">' +
          '<div class="verse up"><p>天使は、人を喰らう。</p><span class="latin">angeli homines devorant</span></div>' +
          '<div class="mark">' + rose('halo-rose', 'line') + logoSvg(reduced ? '' : 'drawn', 'url(#logoGrad)') + '</div>' +
          '<div class="verse down"><p>悪魔は、人と契約する。</p><span class="latin">daemones cum hominibus paciscuntur</span></div>' +
        '</div>' +
        '<div class="side-v r latin">Turris inter Caelum et Infernum</div>' +
      '</section>' +
      '<div class="wrap hero-foot">' +
        '<p>' + esc(SITE.lead).replace(/\n/g, '<br>') + '</p>' +
        '<div class="go"><a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>昇る</a><a class="link-arrow down" href="#/descend"><span class="dir">↓</span>潜る</a></div>' +
      '</div>' +

      '<section class="wrap section" id="index"><div class="sec-head"><span class="kicker"><b>壱</b><i>Sectio Turris</i></span><h2>塔の断面</h2><a class="more" href="#/articles">すべての節 →</a></div>' +
        '<p class="sec-lead">この書は、塔の形をしている。上は天使、下は悪魔、その間に人の世がある。</p>' +
        crossSection() + '</section>' +

      divider('heaven') +
      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>弐</b><i>Circulus Animarum</i></span><h2>魂の循環</h2><a class="more" href="#/a/soul-cycle">この節を読む →</a></div>' +
        '<div class="cycle"><div class="txt">' +
          '<p class="big">天使に殺された人は、天使になる。<br>天使が殺されると、その魂は人へ還る。</p>' +
          '<p class="muted">天使を討つことは、かつて喰われた誰かを人へ戻すことでもある。天使を裏切った悪魔は人の側に立ち、契約によって力を貸す。高位の悪魔が会得する人の姿は、その悪魔の前世の姿とされる。</p>' +
          actions('angel') +
        '</div>' + cycleDiagram() + '</div></section>' +

      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>参</b><i>Horologium</i></span><h2>世界の時計</h2><a class="more" href="#/horologium">時計の節 →</a></div>' + clockBlock(false) + '</section>' +

      divider('abyss') +
      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>肆</b><i>Nuper Scripta</i></span><h2>新たに記された節</h2><a class="more" href="#/articles">すべての節 →</a></div><div class="list">' +
        recent.map(function (a) { return listRow(a, { realm: true, cat: true }); }).join('') + '</div></section>';
  }
  /* 塔の断面：三つの領域を上から順に。この書の目次でもある */
  function crossSection() {
    var H = TOWER.heaven, A = TOWER.abyss;
    function band(r) {
      var cats = realmCats(r.id), fl = floorsOf(r.id), n = realmArticles(r.id).length;
      var floors = fl.length ? '<ol class="xs-floors" aria-label="' + esc(r.name) + 'の階">' + fl.map(function (f) {
        var ref = resolve(rankRef(r.id, f));
        return '<li' + (f.unknown ? ' class="unknown"' : '') + '><a href="' + (ref.href || '#/' + (r.id === 'heaven' ? 'ascend' : 'descend') + '/' + f.floor) + '"><span class="no">' + esc(f.floor) + '</span>' + esc(f.name) + '</a></li>';
      }).join('') + '</ol>' : '';
      return '<section class="xs-band realm-' + r.id + '">' +
        '<header class="xs-head"><a href="#/r/' + r.id + '" class="xs-title"><span class="mk" aria-hidden="true">' + r.mark + '</span><b>' + esc(r.name) + '</b><span class="latin">' + esc(r.la) + '</span></a>' +
          '<p class="xs-sub">' + esc(r.sub) + '<span class="n">' + n + ' 節</span></p><p class="xs-desc">' + esc(r.desc) + '</p>' + floors +
          '<a class="xs-open" href="#/r/' + r.id + '">' + esc(r.name) + 'の章をひらく →</a></header>' +
        '<div class="xs-cats">' + cats.map(function (c) {
          var items = c.id === 'character' ? CHARACTERS.filter(function (x) { return !x.spoiler || spoilOK(); }).map(function (ch) { return { href: '#/ch/' + ch.id, t: ch.name }; })
            : articlesIn(c.id).map(function (a) { return { href: '#/a/' + a.id, t: a.title }; });
          return '<div class="xs-cat"><a class="xs-cat-h" href="#/c/' + c.id + '"><span class="code">' + chapter(c.id) + '</span><b>' + esc(c.name) + '</b><small>' + countOf(c) + unitOf(c) + '</small></a>' +
            '<ul>' + items.map(function (x) { return '<li><a href="' + x.href + '">' + esc(x.t) + '</a></li>'; }).join('') + '</ul></div>';
        }).join('') + '</div></section>';
    }
    return '<div class="xsec">' +
      '<a class="xs-gate up" href="#/ascend/gate">' + miniDoor('heaven') + '<b>' + esc(H.gate.name) + '</b><span class="latin">' + esc(H.gate.latin) + '</span></a>' +
      REALMS.map(band).join('') +
      '<a class="xs-gate down" href="#/descend/gate">' + miniDoor('abyss') + '<b>' + esc(A.gate.name) + '</b><span class="latin">' + esc(A.gate.latin) + '</span></a>' +
      '<p class="xs-ref"><span>資料</span><a href="#/c/glossary">用語集</a><a href="#/articles">すべての節</a><a href="#/horologium">世界の時計</a>' + (deepOpen() ? '<a href="#/deep">深層</a>' : '') + '</p>' +
    '</div>';
  }
  function cycleDiagram() {
    return '<svg viewBox="0 0 460 420" role="img" aria-label="魂の循環の図：人は天使に殺されると天使になり、天使は殺されると人に還る。悪魔は人と契約する。">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" style="stroke:var(--muted)" stroke-width="1.4"/></marker></defs>' +
      '<circle cx="200" cy="210" r="150" fill="none" style="stroke:var(--line-2)"/>' +
      '<path d="M 62 150 A 150 150 0 0 1 150 68" fill="none" style="stroke:var(--heaven)" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<path d="M 338 270 A 150 150 0 0 1 250 352" fill="none" style="stroke:var(--muted)" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<circle cx="200" cy="60" r="5" style="fill:var(--heaven)"/><circle cx="200" cy="60" r="16" fill="none" style="stroke:var(--heaven)" opacity=".4"/>' +
      '<text x="200" y="32" text-anchor="middle" font-size="22" letter-spacing="6" style="fill:var(--heaven)">天使</text>' +
      '<circle cx="200" cy="360" r="5" style="fill:var(--text)"/>' +
      '<text x="200" y="398" text-anchor="middle" font-size="22" letter-spacing="6">人</text>' +
      '<text x="0" y="96" class="small">天使に殺される</text><text x="0" y="114" class="mono">anima → angelus</text>' +
      '<text x="296" y="322" class="small">殺され、魂が解放される</text><text x="296" y="340" class="mono">anima → homo</text>' +
      '<line x1="214" y1="356" x2="392" y2="236" style="stroke:var(--abyss)" stroke-dasharray="3 5" stroke-width="1.2"/>' +
      '<circle cx="400" cy="230" r="5" style="fill:var(--abyss)"/>' +
      '<text x="400" y="204" text-anchor="middle" font-size="22" letter-spacing="6" style="fill:var(--abyss)">悪魔</text>' +
      '<text x="296" y="282" class="small" transform="rotate(-34 296 282)">契約</text>' +
      '</svg>';
  }

  /* ---------- 神話の図像（薔薇窓・扉・翼・粒子） ---------- */
  var uid = 0;
  function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function rose(cls, tone) {
    var line = tone === 'line', cols = ['#9e1c26', '#2b4a7e', '#c9a227', '#3a6a52', '#5a2a7a', '#2b4a7e'];
    var st = line ? 'currentColor' : '#e8d39a', s = '<svg class="' + (cls || 'rose') + '" viewBox="-100 -100 200 200" aria-hidden="true">';
    s += '<circle r="97" fill="' + (line ? 'none' : '#1a1410') + '" stroke="' + st + '" stroke-width="' + (line ? .6 : 2.4) + '"/>';
    s += '<circle r="82" fill="none" stroke="' + st + '" stroke-width="' + (line ? .4 : 1) + '"/>';
    for (var i = 0; i < 12; i++) s += '<ellipse cx="0" cy="-58" rx="14" ry="29" transform="rotate(' + (i * 30) + ')" fill="' + (line ? 'none' : cols[i % 6]) + '" stroke="' + st + '" stroke-width="' + (line ? .5 : 1.4) + '" opacity=".95"/>';
    for (i = 0; i < 24; i++) s += '<circle cx="0" cy="-89" r="5" transform="rotate(' + (i * 15 + 7.5) + ')" fill="' + (line ? 'none' : cols[(i + 2) % 6]) + '" stroke="' + st + '" stroke-width="' + (line ? .4 : .9) + '"/>';
    for (i = 0; i < 12; i++) s += '<line x1="0" y1="-30" x2="0" y2="-97" transform="rotate(' + (i * 30 + 15) + ')" stroke="' + st + '" stroke-width="' + (line ? .4 : 1.6) + '"/>';
    s += '<circle r="30" fill="' + (line ? 'none' : '#2b4a7e') + '" stroke="' + st + '" stroke-width="' + (line ? .5 : 2) + '"/>';
    for (i = 0; i < 8; i++) s += '<ellipse cx="0" cy="-15" rx="5.5" ry="11" transform="rotate(' + (i * 45) + ')" fill="' + (line ? 'none' : '#9e1c26') + '" stroke="' + st + '" stroke-width="' + (line ? .4 : 1) + '"/>';
    return s + '<circle r="5" fill="' + (line ? 'currentColor' : '#fff3c8') + '"/></svg>';
  }
  var GATE_D = 'M0,533 V150 C0,92 52,38 97,0 C142,38 194,92 194,150 V533 Z';
  function gateShape(kind, cls) {
    var u = 'g' + (++uid), heaven = kind === 'heaven';
    var s = '<svg class="' + (cls || 'gate-shape') + '" viewBox="-60 -60 314 653" aria-hidden="true"><defs>';
    if (heaven) {
      s += '<radialGradient id="' + u + 'i" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#fbfaf6"/><stop offset="1" stop-color="#ece6d6"/></radialGradient>' +
        '<filter id="' + u + 'b" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>';
    } else {
      s += '<radialGradient id="' + u + 'i" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#000000"/><stop offset=".8" stop-color="#030001"/><stop offset="1" stop-color="#140306"/></radialGradient>' +
        '<filter id="' + u + 'b" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>';
    }
    s += '</defs>';
    if (heaven) {
      s += '<path class="aura" d="' + GATE_D + '" fill="#fff6dc" filter="url(#' + u + 'b)" opacity=".9"/>' +
        '<path d="' + GATE_D + '" fill="url(#' + u + 'i)" stroke="#d9c79a" stroke-width="1.5"/>' +
        '<path d="M14,533 V154 C14,104 58,56 97,22 C136,56 180,104 180,154 V533" fill="none" stroke="#e6d9b4" stroke-width=".8"/>';
    } else {
      s += '<path class="aura" d="' + GATE_D + '" fill="#5a0a10" filter="url(#' + u + 'b)" opacity=".75"/>' +
        '<path d="' + GATE_D + '" fill="url(#' + u + 'i)" stroke="#3a070c" stroke-width="1.5"/>' +
        '<path d="M14,533 V154 C14,104 58,56 97,22 C136,56 180,104 180,154 V533" fill="none" stroke="#24050a" stroke-width=".8"/>';
    }
    return s + '</svg>';
  }
  function miniDoor(kind) {
    return '<span class="mini-door ' + kind + '"><svg viewBox="0 0 194 533" aria-hidden="true"><path d="' + GATE_D + '"/></svg></span>';
  }
  var ART = window.ART_PATH || { featherWhite: 'assets/img/feather-white.svg', featherBlack: 'assets/img/feather-black.svg' };
  var WING = window.WING_PATH || { angel: 'assets/img/wing-angel.svg', demon: 'assets/img/wing-demon.svg', demonRaised: 'assets/img/wing-demon-raised.svg' };
  /* 三対の翼。.w（位置・反転）> b（揺れ：transformだけを動かす）> img（光：filterは動かさない） */
  function wings(kind) {
    var pairs = kind === 'heaven'
      ? [['up', WING.angel], ['mid', WING.angel], ['low', WING.angel]]
      : [['up', WING.demonRaised], ['mid', WING.demon], ['low', WING.demon]];
    return '<div class="wings six">' + pairs.map(function (p) {
      var im = '<b><img src="' + p[1] + '" alt="" decoding="async"></b>';
      return '<span class="w l ' + p[0] + '">' + im + '</span><span class="w r ' + p[0] + '">' + im + '</span>';
    }).join('') + '</div>';
  }
  /* 粒子（天界＝舞い落ちる羽根／魔界＝昇る火の粉） */
  function particles(kind, n) {
    var s = '<div class="particles ' + kind + '" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var fe = kind === 'feathers' || kind === 'blackfeathers' || kind === 'feathermass';
      var x = (rnd(i + 1) * 100).toFixed(1), dl = (rnd(i + 7) * -18).toFixed(1), du = (12 + rnd(i + 3) * 14).toFixed(1), sz = (fe ? 14 + rnd(i + 5) * 22 : 2 + rnd(i + 5) * 3).toFixed(1);
      s += '<i style="--x:' + x + '%;--d:' + dl + 's;--u:' + du + 's;--s:' + sz + 'px;--r:' + Math.round(rnd(i + 9) * 360) + 'deg">' +
        (fe ? '<img src="' + (kind === 'blackfeathers' ? ART.featherBlack : ART.featherWhite) + '" alt="" decoding="async">' : '') + '</i>';
    }
    return s + '</div>';
  }

  /* ---------- 塔（昇塔・降塔の演出ページ） ---------- */
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  function floorLinks(ids) {
    return '<div class="links">' + (ids || []).map(resolve).filter(function (r) { return r.a && visible(r.a); }).map(function (r) { return '<a href="' + r.href + '">' + esc(r.sec ? r.a.title + '・' + r.title : r.title) + '</a>'; }).join('') + '</div>';
  }
  function floorEmb(f, kind) {
    var id = RANK_ID[f.name], k = id ? (kind === 'heaven' ? 'a-' : 'd-') + id : '';
    return k && EMBLEMS[k] ? '<span class="fl-emb ' + (kind === 'heaven' ? 'ang' : 'dem') + '" aria-hidden="true">' + emblem(k, reduced ? '' : 'drawn') + '</span>' : '';
  }
  function floorBlock(f, kind) {
    var choirs = '';
    if (f.choirs) {
      choirs = '<ol class="choirs" aria-label="司級天使の九つの階位（上ほど高位）">' + f.choirs.slice().reverse().map(function (c, i, arr) {
        return '<li style="--k:' + ((arr.length - i) / arr.length).toFixed(2) + '"><i>' + ROMAN[arr.length - i] + '</i><span><b>' + esc(c.name) + '</b>' + (c.note ? '<small>' + esc(c.note) + '</small>' : '') + '</span></li>';
      }).join('') + '</ol>';
    }
    return '<section class="floor' + (f.unknown ? ' unknown' : '') + '" id="fl-' + f.floor + '" data-floor="' + f.floor + '">' +
      '<span class="no">' + esc(f.floor) + '</span>' + floorEmb(f, kind) + '<h2>' + esc(f.name) + '</h2><p>' + esc(f.text) + '</p>' + choirs + floorLinks(f.links) + '</section>';
  }
  function gateBlock(kind, g) {
    var stage = kind === 'heaven'
      ? '<div class="gate-stage heaven-stage">' + particles('feathers', 12) + wings('heaven') + gateShape('heaven') + '</div>'
      : '<div class="gate-stage abyss-stage">' + particles('embers', 18) + '<span class="smoke s1"></span><span class="smoke s2"></span><span class="smoke s3"></span>' + wings('abyss') + gateShape('abyss') + '</div>';
    var text = '<div class="latin">' + esc(g.latin) + '</div><h2>' + esc(g.name) + '</h2><p>' + esc(g.text) + '</p>' + floorLinks(g.links) +
      '<p class="gate-state ' + (deepOpen() ? 'open' : '') + '">' + esc(deepOpen() ? WD.deep.openText : (W.deep ? '核心を伏せて読んでいるため、門は閉ざされている。' : WD.deep.lockedText)) + '</p>' +
      (deepOpen() ? '<a class="link-arrow ' + (kind === 'heaven' ? 'up' : 'down') + '" href="#/deep"><span class="dir">' + (kind === 'heaven' ? '↑' : '↓') + '</span>門の向こうへ</a>' : '') +
      (kind === 'heaven' ? actions('angel') : actions('demon'));
    return '<section class="gate ' + kind + '-gate" id="fl-gate" data-floor="gate">' + (kind === 'heaven' ? stage + text : text + stage) + '</section>';
  }
  var towerIO = [];
  function renderTower(kind, target) {
    var heaven = kind === 'heaven', T = heaven ? TOWER.heaven : TOWER.abyss;
    var ground = '<section class="ground-floor" id="fl-G" data-floor="G"><span class="kicker"><i>Terra</i></span><h2>地上</h2><p>' + esc(TOWER.ground.text) + '</p>' +
      '<div class="row">' + (heaven ? '<a class="link-arrow down" href="#/descend"><span class="dir">↓</span>魔界へ潜る</a>' : '<a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>天界へ昇る</a>') +
      '<a class="link-arrow" href="#/r/' + (heaven ? 'heaven' : 'abyss') + '">' + (heaven ? '昇塔' : '降塔') + 'の章を読む</a><a class="link-arrow" href="#/r/ground">地上の章へ</a></div></section>';
    var head = '<header class="tower-head"><div class="latin">' + esc(T.latin) + '</div><h1>' + esc(T.title) + '</h1><p>' + (heaven ? '下から上へ。光が強くなるほど、天使は強くなる。' : '上から下へ。闇が深くなるほど、悪魔は強くなる。') + '</p></header>';
    var alt;
    if (heaven) {
      app.innerHTML = '<div class="tower heaven"><div class="shaft">' + head + gateBlock('heaven', T.gate) +
        T.floors.slice().reverse().map(function (f) { return floorBlock(f, 'heaven'); }).join('') + '</div>' + ground + '</div>';
      alt = ['gate'].concat(T.floors.slice().reverse().map(function (f) { return f.floor; })).concat(['G']);
      tintFloors();
    } else {
      app.innerHTML = '<div class="tower abyss">' + ground + '<div class="shaft">' + head + T.floors.map(function (f) { return floorBlock(f, 'abyss'); }).join('') + gateBlock('abyss', T.gate) + '</div></div>';
      alt = ['G'].concat(T.floors.map(function (f) { return f.floor; })).concat(['gate']);
    }
    var meter = document.createElement('nav');
    meter.className = 'altimeter'; meter.setAttribute('aria-label', '階');
    meter.innerHTML = alt.map(function (id) { return '<a href="#/' + (heaven ? 'ascend' : 'descend') + '/' + id + '" data-to="' + id + '">' + (id === 'gate' ? '門' : id) + '</a>'; }).join('');
    app.appendChild(meter);
    var floors = $$('.floor', app), links = $$('a', meter);
    // 見えている階だけ動かす（画面外の門の演出は止めておく）
    var seen = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); } }); }, { threshold: .35 });
    floors.forEach(function (el) { seen.observe(el); });
    var live = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); }); }, { rootMargin: '100px 0px' });
    $$('.gate-stage', app).forEach(function (el) { live.observe(el); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.dataset.to === e.target.dataset.floor); }); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('[data-floor]', app).forEach(function (el) { io.observe(el); });
    towerIO = [seen, live, io];
    var to = target ? document.getElementById('fl-' + target) : null;
    requestAnimationFrame(function () {
      if (to) to.scrollIntoView({ block: 'center' });
      else if (heaven) window.scrollTo(0, document.documentElement.scrollHeight);
      else window.scrollTo(0, 0);
    });
    return true;
  }
  // 天界は背景が下から上へ明るくなるので、階ごとに文字色を切り替える
  function tintFloors() {
    var tower = $('.tower.heaven'); if (!tower) return;
    var H = tower.offsetHeight;
    $$('.floor', tower).forEach(function (el) {
      var t = 1 - (el.offsetTop + el.offsetHeight / 2) / H, light = t > 0.5;
      el.style.setProperty('--f-ink', light ? '#1b1a20' : '#ece8e2');
      el.style.setProperty('--f-muted', light ? '#4a4a58' : '#a9a4ad');
    });
  }
  var rzT; window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(tintFloors, 150); });

  /* ---------- 領域（昇塔／地上／降塔） ---------- */
  function renderRealm(rid, focusCat) {
    var r = realmById[rid]; if (!r) return renderNotFound();
    var cats = realmCats(rid), sd = REALM_SIDE[rid], n = realmArticles(rid).length;
    var chips = '<nav class="chips" aria-label="' + esc(r.name) + 'の章">' + cats.map(function (c) {
      return '<a href="#/c/' + c.id + '" data-c="' + c.id + '"><span class="code">' + chapter(c.id) + '</span>' + esc(c.name) + '<small>' + countOf(c) + '</small></a>';
    }).join('') + '</nav>';
    var groups = cats.map(function (c) {
      var body;
      if (c.id === 'character') body = characterRows();
      else {
        var list = articlesIn(c.id);
        body = (c.id === 'contract' ? actions('contract') : '') + (list.length ? '<div class="list">' + list.map(function (a) { return listRow(a); }).join('') + '</div>' : '<div class="empty">まだ記されていない。</div>');
      }
      return '<section class="grp ' + side(c.id) + '" id="g-' + c.id + '"><header class="grp-head"><span class="code">' + chapter(c.id) + '</span><h2>' + esc(c.name) + '<i class="latin">' + esc(c.la) + '</i></h2>' +
        '<p>' + esc(c.desc) + '</p>' + (c.id === 'character' ? '<a class="more" href="#/c/character">人物の頁へ →</a>' : '') + '</header>' + body + '</section>';
    }).join('');
    app.innerHTML = crumbs([{ html: realmTag(rid) }]) +
      '<header class="wrap realm-head realm-' + rid + '">' + sigil(sd) +
        '<div class="rh-main"><div class="code"><span class="mk">' + r.mark + '</span>' + esc(r.la) + '</div><h1>' + esc(r.name) + '</h1><p class="rh-sub">' + esc(r.sub) + '</p><p class="rh-desc">' + esc(r.desc) + '</p>' +
          (r.tower ? '<a class="link-arrow ' + (rid === 'heaven' ? 'up' : 'down') + '" href="' + r.tower + '"><span class="dir">' + r.mark + '</span>' + (rid === 'heaven' ? '塔を昇る' : '塔を潜る') + '</a>' : '') + '</div>' +
        '<div class="count">' + n + '<small>節</small></div></header>' +
      '<div class="wrap">' + chips + '</div>' +
      '<div class="wrap realm-body side-' + sd + '"><div class="realm-main">' + (rid === 'heaven' ? actions('angel') : rid === 'abyss' ? actions('demon') : '') + groups + '</div>' +
        '<aside class="realm-side">' + realmSide(rid) + '</aside></div>';
    if (focusCat) requestAnimationFrame(function () { var g = document.getElementById('g-' + focusCat); if (g) g.scrollIntoView({ block: 'start' }); });
  }
  /* 領域の横に置く「塔の階」：その領域の階級へ直接飛べる */
  function realmSide(rid) {
    if (rid === 'ground') {
      return '<div class="panel"><h3 class="panel-h">塔のかたち<i class="latin">Forma Turris</i></h3>' +
        '<a class="pz up" href="#/r/heaven"><span>↑</span><b>昇塔</b><small>天使と天界・天使の階級</small></a>' +
        '<a class="pz here" href="#/r/ground"><span>●</span><b>地上</b><small>いまいる場所</small></a>' +
        '<a class="pz down" href="#/r/abyss"><span>↓</span><b>降塔</b><small>悪魔と魔界・悪魔の階級</small></a>' +
        '<a class="panel-more" href="#/a/rank-system">塔と階級を読む →</a></div>' +
        '<div class="panel"><h3 class="panel-h">資料<i class="latin">Index</i></h3><a class="panel-link" href="#/c/glossary">用語集<small>' + GLOSSARY.length + '語</small></a><a class="panel-link" href="#/articles">すべての節<small>' + ARTICLES.filter(visible).length + '節</small></a><a class="panel-link" href="#/horologium">世界の時計</a></div>';
    }
    var T = rid === 'heaven' ? TOWER.heaven : TOWER.abyss, fl = floorsOf(rid);
    var gate = '<a class="ld-row gate" href="' + (rid === 'heaven' ? '#/ascend/gate' : '#/descend/gate') + '"><span class="no">門</span>' + miniDoor(rid) + '<b>' + esc(T.gate.name) + '</b></a>';
    var rows = fl.map(function (f) {
      var ref = resolve(rankRef(rid, f)), ek = (rid === 'heaven' ? 'a-' : 'd-') + RANK_ID[f.name];
      return '<a class="ld-row' + (f.unknown ? ' unknown' : '') + '" href="' + ref.href + '"><span class="no">' + esc(f.floor) + '</span><span class="ld-emb">' + emblem(ek) + '</span><b>' + esc(f.name) + '</b><small>' + esc(f.unknown ? '確認されていない' : firstSentence(f.text)) + '</small></a>';
    }).join('');
    return '<div class="panel ladder ' + rid + '"><h3 class="panel-h">' + (rid === 'heaven' ? '天使の階級' : '悪魔の階級') + '<i class="latin">' + (rid === 'heaven' ? 'Gradus ad Caelum' : 'Gradus ad Infernum') + '</i></h3>' +
      (rid === 'heaven' ? gate + rows : rows + gate) +
      '<a class="panel-more" href="#/a/' + (rid === 'heaven' ? 'angel-ranks' : 'demon-ranks') + '">' + (rid === 'heaven' ? '天使' : '悪魔') + 'の階級を読む →</a>' +
      '<a class="panel-more" href="#/a/rank-system">天使と悪魔の階級をくらべる →</a></div>';
  }

  /* ---------- 章（人物・用語集は専用ページ。ほかは領域ページのその章へ） ---------- */
  function renderCategory(id) {
    var c = catById[id]; if (!c) return renderNotFound();
    if (id === 'deep') return renderDeep();
    if (!c.renderMode) return renderRealm(c.realm, id);
    var head = crumbs([realmCrumb(c.realm), { t: c.name }]) +
      '<header class="wrap page-head ' + side(id) + '">' + sigil(sideOf(id)) + '<div><div class="code">' + chapter(id) + '<i>' + esc(c.la || '') + '</i></div><h1>' + esc(c.name) + '</h1><p>' + esc(c.desc) + '</p></div>' +
      '<div class="count">' + countOf(c) + '<small>' + unitOf(c) + '</small></div></header>';
    app.innerHTML = head + '<section class="wrap ' + side(id) + '">' + (c.renderMode === 'character' ? characterList() : glossaryList()) + '</section>';
    bindCategory();
  }
  /* キャラクター */
  function forms(ch) { return ch.forms && ch.forms.length ? ch.forms : [{ rank: ch.rank || '', image: ch.image || '' }]; }
  function curForm(ch) { var f = forms(ch); return ch.current != null ? ch.current : f.length - 1; }
  function val(v) { return v ? esc(v) : '<span class="unwritten">まだ記されていない</span>'; }
  function csheet(ch, fi) {
    var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), f = fs[fi] || fs[0];
    var top = ch.type === 'demon' ? ['契約', 'Pactum', ch.contract] : ['所属', 'Ordo', ch.affiliation];
    var low = ch.type === 'demon' ? ['種類', 'Genus', ch.kind] : ch.type === 'angel' ? ['階位', 'Chorus', ch.hierarchy] : null;
    var re = ch.type === 'angel' && RANK_ID[f.rank] && EMBLEMS['a-' + RANK_ID[f.rank]] ? 'a-' + RANK_ID[f.rank] : ch.type === 'demon' ? sealKey(f.rank, embOfKind(ch.kind)) : '';
    var orn = ch.type === 'demon' ? 'orn-demon' : ch.type === 'angel' ? 'orn-angel' : 'orn-human';
    return '<div class="csheet side-' + t.side + ' t-' + ch.type + '">' +
      '<div class="cs-cell cs-name"><span class="lb">名前<i>Nomen</i></span><b>' + esc(ch.name) + '</b></div>' +
      '<div class="cs-band">' + emblem(orn, 'orn') +
        (ch.type === 'human' ? '' : '<span class="lb">階級</span><b class="cs-rank">' + val(f.rank) + '</b>') +
        '<span class="cs-seal">' + (re ? drawn(re) : emblem(ch.type)) + '</span>' +
        (low ? '<span class="lb">' + low[0] + '</span><b>' + val(low[2]) + '</b>' : '') +
        emblem(orn, 'orn flip') + '</div>' +
      '<div class="cs-cell cs-aff"><span class="lb">' + top[0] + '<i>' + top[1] + '</i></span><b>' + val(top[2]) + '</b></div>' +
      '<div class="cs-cell cs-look"><span class="lb">見た目<i>Species</i></span>' +
        (f.image ? '<figure><img class="cs-img" src="' + esc(f.image) + '" alt="' + esc(ch.name) + '（' + esc(f.rank) + '）の姿" decoding="async"></figure>' : '') +
        (ch.appearance ? '<p>' + esc(ch.appearance) + '</p>' : (f.image ? '' : '<p>' + val('') + '</p>')) + '</div>' +
      '<div class="cs-cell cs-set"><span class="lb">設定<i>Historia</i></span><p>' + val(ch.setting) + '</p></div>' +
    '</div>';
  }
  function characterRows() {
    if (!CHARACTERS.length) return '<div class="empty">まだ、この塔に名を残すものはいない。</div>';
    return '<div class="list">' + CHARACTERS.map(function (ch) {
      var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), fm = fs[curForm(ch)];
      if (ch.spoiler && !spoilOK()) return '<div class="l-row veiled"><span class="code">伏せられた名</span><h3>――</h3><p>物語の核心に触れるため伏せられている。</p></div>';
      return '<a class="l-row side-' + t.side + '" href="#/ch/' + ch.id + '"><span class="code">' + t.name + (fm.rank ? '・' + esc(fm.rank) : '') + '</span><h3>' + esc(ch.name) + '</h3><p>' + esc(ch.setting ? ch.setting.slice(0, 60) : (fs.length > 1 ? fs.map(function (x) { return x.rank; }).join(' → ') + 'と姿を変える。' : '')) + '</p></a>';
    }).join('') + '</div>';
  }
  function characterList() {
    var types = ['angel', 'human', 'demon'].filter(function (k) { return CHARACTERS.some(function (c) { return c.type === k; }); });
    var f = types.length > 1 ? '<div class="filter" role="group" aria-label="種別で絞り込む"><button type="button" data-type="" aria-pressed="true">すべて</button>' +
      types.map(function (k) { return '<button type="button" data-type="' + k + '" aria-pressed="false">' + TYPE[k].name + '</button>'; }).join('') + '</div>' : '';
    if (!CHARACTERS.length) return '<div class="empty">まだ、この塔に名を残すものはいない。</div>';
    return f + '<div class="ch-grid">' + CHARACTERS.map(function (ch) {
      var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), fm = fs[curForm(ch)];
      if (ch.spoiler && !spoilOK()) return '<div class="ch-card veiled"><figure></figure><div class="cap"><b>伏せられた名</b><span class="badge">核心</span></div></div>';
      return '<a class="ch-card side-' + t.side + '" data-type="' + ch.type + '" href="#/ch/' + ch.id + '"><figure>' + (fm.image ? '<img src="' + esc(fm.image) + '" alt="" loading="lazy" decoding="async">' : emblem(ch.type)) + '</figure>' +
        '<div class="cap"><b>' + esc(ch.name) + '</b><span class="badge side-' + t.side + '">' + t.name + (fm.rank ? '・' + esc(fm.rank) : '') + '</span></div>' +
        (fs.length > 1 ? '<small class="forms-note">' + fs.map(function (x) { return esc(x.rank); }).join(' → ') + '</small>' : '') + '</a>';
    }).join('') + '</div>';
  }
  var KANA = [['あ', 'あ-お'], ['か', 'か-ご'], ['さ', 'さ-ぞ'], ['た', 'た-ど'], ['な', 'な-の'], ['は', 'は-ぽ'], ['ま', 'ま-も'], ['や', 'ゃ-よ'], ['ら', 'ら-ろ'], ['わ', 'ゎ-ん']];
  function kanaRow(r) {
    var ch = (r || '').charAt(0);
    for (var i = 0; i < KANA.length; i++) { var rg = KANA[i][1].split('-'); if (ch >= rg[0] && ch <= rg[1]) return KANA[i][0]; }
    return '他';
  }
  function glossaryList() {
    var groups = {};
    GLOSSARY.slice().sort(function (a, b) { return (a.reading || a.term).localeCompare(b.reading || b.term, 'ja'); }).forEach(function (g) {
      var k = kanaRow(g.reading || g.term); (groups[k] = groups[k] || []).push(g);
    });
    var keys = KANA.map(function (k) { return k[0]; }).concat(['他']).filter(function (k) { return groups[k]; });
    return '<div class="filter" role="group" aria-label="行で絞り込む"><button type="button" data-row="" aria-pressed="true">すべて</button>' + keys.map(function (k) { return '<button type="button" data-row="' + k + '" aria-pressed="false">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="glossary">' + keys.map(function (k) {
        return '<div class="gl-group" data-row="' + k + '"><h2>' + k + '</h2><dl>' + groups[k].map(function (g) {
          var r = g.id ? resolve(g.id) : null;
          return '<dt>' + esc(g.term) + '</dt><dd>' + esc(g.desc) + (r && r.a && visible(r.a) ? ' <a class="to" href="' + r.href + '">' + esc(r.sec ? r.a.title + '・' + r.title : r.title) + ' →</a>' : '') + '</dd>';
        }).join('') + '</dl></div>';
      }).join('') + '</div>';
  }
  function bindCategory() {
    $$('.filter [data-type]', app).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.filter button', app).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var t = b.dataset.type;
        $$('.ch-card', app).forEach(function (card) { card.hidden = !!t && card.dataset.type !== t; });
      });
    });
    $$('.filter [data-row]', app).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.filter button', app).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var r = b.dataset.row;
        $$('.gl-group', app).forEach(function (g) { g.hidden = !!r && g.dataset.row !== r; });
      });
    });
  }

  /* ---------- 記事 ---------- */
  /* 左：その領域の目次 ／ 中：本文 ／ 右：情報欄とこの節の項 */
  function docNav(a) {
    var rid = a.deep ? 'deep' : realmOf(a.cat), r = realmById[rid];
    var cats = a.deep ? [{ id: 'deep', name: '深層' }] : realmCats(rid);
    return '<nav class="doc-nav" aria-label="この領域の目次"><a class="dn-realm rt-' + rid + '" href="' + (r ? '#/r/' + rid : '#/deep') + '">' + (r ? '<i>' + r.mark + '</i>' + esc(r.name) + '<small>' + esc(r.sub) + '</small>' : '深層') + '</a>' +
      cats.map(function (c) {
        var items = c.id === 'deep' ? ARTICLES.filter(function (x) { return x.deep && visible(x); }) : c.id === 'character' ? null : articlesIn(c.id);
        return '<div class="dn-cat"><a class="dn-cat-h" href="#/c/' + c.id + '">' + esc(c.name) + '</a>' + (items ? '<ul>' + items.map(function (x) {
          return '<li><a href="#/a/' + x.id + '"' + (x === a ? ' aria-current="page"' : '') + '>' + esc(x.title) + '</a></li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('') + '</nav>';
  }
  function renderArticle(id, sub) {
    var a = artById[id]; if (!a) return renderNotFound();
    var c = catById[a.cat] || {}, rid = a.deep ? 'deep' : c.realm;
    var trail = [realmCrumb(rid)].concat(a.deep ? [] : [{ t: c.name, href: '#/c/' + c.id }]);
    if (!visible(a)) { app.innerHTML = crumbs(trail.concat([{ t: '伏せられた節' }])) + '<section class="wrap section"><div class="empty">この節は、物語の核心に触れるため伏せられている。</div></section>'; return; }
    var toc = [];
    var sections = (a.sections || []).map(function (s, i) {
      var key = secKey(s, i);
      if (s.spoiler && !spoilOK()) return '<div class="veiled-sec" id="sec-' + key + '"><span class="latin">Velatum</span><b>伏せられた記述</b><p>ここから先には、物語の核心が記されている。</p></div>';
      var h = '';
      if (s.h) { toc.push({ key: key, h: s.h, emb: s.emb }); h += '<h2 id="sec-' + key + '"' + (s.emb ? ' class="has-emb"' : '') + '>' + (s.emb && EMBLEMS[s.emb] ? '<span class="h-emb" aria-hidden="true">' + emblem(s.emb) + '</span>' : '') + '<span>' + esc(s.h) + '</span></h2>'; }
      (s.p || []).forEach(function (p) { h += '<p>' + rich(p) + '</p>'; });
      if (s.list) h += '<ul>' + s.list.map(function (l) { return '<li>' + rich(l) + '</li>'; }).join('') + '</ul>';
      if (s.table) h += '<div class="table-wrap"><table><thead><tr>' + s.table.head.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        s.table.rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + rich(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      if (s.warn) h += '<div class="callout warn">' + rich(s.warn) + '</div>';
      if (s.note) h += '<div class="callout note">' + rich(s.note) + '</div>';
      return s.h ? '<section class="sec">' + h + '</section>' : h;
    }).join('');
    var ae = embOfArticle(a.id);
    var headIcon = ae ? drawn(ae) : a.cat === 'angel' ? emblem('angel') : a.cat === 'demon' ? emblem('demon') : icon(c.icon || 'book');
    var info = '<div class="infobox"><div class="ib-head">' + headIcon + '<span><span class="mono">' + recCode(a) + '</span><b>' + esc(a.title) + '</b></span></div>' +
      (a.info && a.info.length ? '<dl>' + a.info.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + rich(r[1]) + '</dd>'; }).join('') + '</dl>' : '') +
      '<div class="ib-foot">' + (realmById[rid] ? realmTag(rid) + '　' : '') + esc(c.name || '') + '<br>' + esc(a.updated) + ' 記</div></div>';
    var pageToc = toc.length > 1 ? '<nav class="page-toc" aria-label="この節の項"><h3>この節の項</h3><ol>' + toc.map(function (t) {
      return '<li><a href="#/a/' + a.id + '/' + t.key + '" data-sec="' + t.key + '">' + (t.emb && EMBLEMS[t.emb] ? emblem(t.emb) : '') + esc(t.h) + '</a></li>'; }).join('') + '</ol></nav>' : '';
    var rel = (a.related || []).map(function (r) { return resolve(r).a; }).filter(function (x) { return x && visible(x) && x !== a; });
    var seq = a.deep ? ARTICLES.filter(function (x) { return x.deep && visible(x); }) : realmArticles(rid), i = seq.indexOf(a), prev = seq[i - 1], next = seq[i + 1];
    app.innerHTML = crumbs(trail.concat([{ t: a.title }])) +
      '<div class="wrap doc ' + side(a.cat) + '">' + docNav(a) +
        '<article class="article">' +
          '<header class="article-head">' + (ae ? '<span class="sigil big ' + sideOf(a.cat) + '" aria-hidden="true">' + drawn(ae) + '</span>' : sigil(sideOf(a.cat))) +
            '<div class="meta"><span class="code">' + recCode(a) + '</span><span>' + esc(c.name || '') + '<i class="latin"> ' + esc(c.la || '') + '</i></span><span>' + esc(a.updated) + ' 記</span></div>' +
            '<h1>' + esc(a.title) + '</h1>' + (a.reading ? '<div class="reading">' + esc(a.reading) + '</div>' : '') +
            '<p class="summary">' + rich(a.summary) + '</p></header>' +
          '<div class="doc-aside-m">' + info + '</div>' +
          '<div class="article-body">' + sections + actions(ctxOf(a.cat, a.id)) + '</div>' +
          (rel.length ? '<section class="related"><h2>この節と結ばれた節</h2><div class="list">' + rel.map(function (x) { return listRow(x, { realm: x.cat !== a.cat, cat: true }); }).join('') + '</div></section>' : '') +
          '<nav class="pager" aria-label="前後の節">' +
            (prev ? '<a href="#/a/' + prev.id + '"><small>← 前の節</small><b>' + esc(prev.title) + '</b></a>' : '<span></span>') +
            (next ? '<a class="next" href="#/a/' + next.id + '"><small>次の節 →</small><b>' + esc(next.title) + '</b></a>' : '<span></span>') +
          '</nav>' +
        '</article>' +
        '<aside class="doc-aside">' + info + pageToc + '</aside>' +
      '</div>';
    bindPageToc();
    if (sub) requestAnimationFrame(function () { scrollToSec(sub, false); });
  }
  function scrollToSec(key, smooth) {
    var el = document.getElementById('sec-' + key); if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: smooth && !reduced ? 'smooth' : 'auto' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  /* 「この節の項」：いま読んでいる項に印を付ける */
  var tocIO = null;
  function bindPageToc() {
    var links = $$('.page-toc a', app); if (!links.length) return;
    var heads = $$('.article-body h2[id]', app);
    tocIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var k = e.target.id.slice(4); links.forEach(function (l) { l.classList.toggle('on', l.dataset.sec === k); }); } });
    }, { rootMargin: '-15% 0px -70% 0px' });
    heads.forEach(function (h) { tocIO.observe(h); });
  }

  /* ---------- キャラクター ---------- */
  function renderCharacter(id) {
    var ch = chById[id]; if (!ch) return renderNotFound();
    var trail = [realmCrumb('ground'), { t: 'キャラクター', href: '#/c/character' }];
    if (ch.spoiler && !spoilOK()) { app.innerHTML = crumbs(trail.concat([{ t: '伏せられた名' }])) + '<section class="wrap section"><div class="empty">この名は、物語の核心に触れるため伏せられている。</div></section>'; return; }
    var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), fi = curForm(ch);
    var rel = (ch.related || []).map(function (r) { return resolve(r).a; }).filter(function (x) { return x && visible(x); });
    var tabs = fs.length > 1 ? '<div class="form-tabs" role="tablist" aria-label="階級ごとの姿">' + fs.map(function (f, i) {
      return '<button type="button" role="tab" data-fi="' + i + '" aria-selected="' + (i === fi) + '"><b>' + esc(f.rank) + '</b><small>' + ROMAN[i + 1] + '</small></button>';
    }).join('<span class="arrow">→</span>') + '</div>' : '';
    app.innerHTML = crumbs(trail.concat([{ t: ch.name }])) +
      '<div class="wrap ch-page side-' + t.side + '">' +
        '<header class="article-head">' + sigil(t.side) + '<div class="meta"><span class="code">' + chapter('character') + '　第' + kan(CHARACTERS.indexOf(ch) + 1) + '名</span><span>' + t.name + '</span></div>' +
          '<h1>' + esc(ch.name) + '</h1>' + (ch.reading ? '<div class="reading">' + esc(ch.reading) + '</div>' : '') +
          (fs.length > 1 ? '<p class="summary">階級が上がるにつれて、その姿は変わっていく。</p>' : '') + '</header>' +
        tabs + '<div id="csheet-slot">' + csheet(ch, fi) + '</div>' +
        (rel.length ? '<section class="related"><h2>この名と結ばれた節</h2><div class="list">' + rel.map(function (x) { return listRow(x, { realm: true, cat: true }); }).join('') + '</div></section>' : '') +
      '</div>';
    $$('.form-tabs button', app).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.fi;
        $$('.form-tabs button', app).forEach(function (x) { x.setAttribute('aria-selected', x === b); });
        var slot = $('#csheet-slot'); slot.innerHTML = csheet(ch, i); slot.firstChild.classList.add('swap');
      });
    });
  }

  /* ---------- すべての節 ---------- */
  var listState = { sort: 'cat', realm: '' };
  function renderAll() {
    var list = ARTICLES.filter(function (a) { return visible(a) && !a.deep && (!listState.realm || realmOf(a.cat) === listState.realm); });
    var body;
    if (listState.sort === 'cat') {
      body = BOOK.filter(function (c) { return !listState.realm || c.realm === listState.realm; }).map(function (c) {
        var l = list.filter(function (a) { return a.cat === c.id; }); if (!l.length) return '';
        return '<section class="all-grp ' + side(c.id) + '"><h2><span class="code">' + chapter(c.id) + '</span>' + realmTag(c.realm) + esc(c.name) + '<small>' + l.length + '節</small></h2><div class="list">' + l.map(function (a) { return listRow(a); }).join('') + '</div></section>';
      }).join('');
    } else {
      list.sort(listState.sort === 'name' ? function (a, b) { return a.title.localeCompare(b.title, 'ja'); } : byDateDesc);
      body = '<div class="list">' + list.map(function (a) { return listRow(a, { realm: true, cat: true }); }).join('') + '</div>';
    }
    app.innerHTML = crumbs([{ t: '資料' }, { t: 'すべての節' }]) +
      '<header class="wrap page-head">' + sigil('none') + '<div><div class="code">Omnia<i>Liber Matenrou</i></div><h1>すべての節</h1><p>この書に記された、すべての節。章の順は、塔の上から下へ。</p></div><div class="count">' + list.length + '<small>節</small></div></header>' +
      '<section class="wrap"><div class="toolbar">' +
        '<div class="filter" role="group" aria-label="領域で絞り込む">' + [['', 'すべて']].concat(REALMS.map(function (r) { return [r.id, r.mark + ' ' + r.name]; })).map(function (x) {
          return '<button type="button" data-realm="' + x[0] + '" aria-pressed="' + (listState.realm === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
        '<label class="sel"><span>並び</span><select id="sort"><option value="cat">章の順</option><option value="date">新しく記された順</option><option value="name">名の順</option></select></label>' +
      '</div>' + body + '</section>';
    $('#sort').value = listState.sort;
    $('#sort').onchange = function () { listState.sort = this.value; renderAll(); };
    $$('[data-realm]', app).forEach(function (b) { b.onclick = function () { listState.realm = b.dataset.realm; renderAll(); }; });
  }

  /* ---------- 検索 ---------- */
  function buildIndex() {
    var idx = [];
    ARTICLES.forEach(function (a) {
      var body = (a.sections || []).map(function (s) { return [s.h, (s.p || []).join(' '), (s.list || []).join(' '), s.table ? s.table.rows.join(' ') : '', s.warn, s.note].join(' '); }).join(' ');
      var c = catById[a.cat] || {};
      idx.push({ a: a, kind: '節', side: side(a.cat), href: '#/a/' + a.id, title: a.title, sub: stripRefs(a.summary), where: (realmById[c.realm] ? realmById[c.realm].mark + ' ' : '') + (c.name || ''),
        key: a.title + ' ' + (a.reading || ''), keywords: (a.keywords || []).join(' ') + ' ' + stripRefs((a.info || []).join(' ')), body: stripRefs(body) });
    });
    GLOSSARY.forEach(function (g) {
      var r = g.id ? resolve(g.id) : null;
      idx.push({ kind: '用語', side: 'side-none', href: r && r.a ? r.href : '#/c/glossary', title: g.term, sub: g.desc, where: '用語集', key: g.term + ' ' + (g.reading || ''), keywords: '', body: g.desc });
    });
    CHARACTERS.forEach(function (c) {
      idx.push({ ch: c, kind: '人物', side: 'side-' + TYPE[c.type].side, href: '#/ch/' + c.id, title: c.name, sub: TYPE[c.type].name + ' ' + (c.rank || ''), where: 'キャラクター', key: c.name + ' ' + (c.reading || ''), keywords: [c.affiliation, c.contract, c.rank, c.kind, c.hierarchy].join(' '), body: (c.appearance || '') + ' ' + (c.setting || '') });
    });
    return idx;
  }
  var INDEX = buildIndex();
  function search(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    return INDEX.filter(function (e) { return (!e.a || visible(e.a)) && (!e.ch || !e.ch.spoiler || spoilOK()); }).map(function (e) {
      var s = 0, k = e.key.toLowerCase();
      if (k.indexOf(q) === 0) s += 100; else if (k.indexOf(q) >= 0) s += 60;
      if (e.keywords.toLowerCase().indexOf(q) >= 0) s += 30;
      if (e.body.toLowerCase().indexOf(q) >= 0) s += 10;
      if (e.kind === '用語') s -= 5;
      return { e: e, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.e; });
  }
  function hl(text, q) {
    var t = esc(text); if (!q) return t;
    var i = text.toLowerCase().indexOf(q.toLowerCase()); if (i < 0) return t;
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function snippet(e, q) {
    var src = e.sub, i = e.body.toLowerCase().indexOf(q.toLowerCase());
    if (e.sub.toLowerCase().indexOf(q.toLowerCase()) < 0 && i >= 0) src = (i > 20 ? '…' : '') + e.body.slice(Math.max(0, i - 20), i + 60) + '…';
    return hl(src, q);
  }
  function renderSearch(q) {
    var res = search(q);
    app.innerHTML = crumbs([{ t: '検索' }]) +
      '<header class="wrap page-head">' + sigil('none') + '<div><div class="code">Quaere<i>名を探す</i></div><h1>「' + esc(q) + '」</h1><p>' + (res.length ? 'この名は ' + res.length + ' の場所に記されている。' : '') + '</p></div></header>' +
      '<section class="wrap"><div class="result-list">' + (res.length ? res.map(function (e) {
        return '<a class="result ' + e.side + '" href="' + e.href + '"><span class="badge">' + e.kind + '</span><span class="r-main"><b>' + hl(e.title, q) + '</b><small>' + esc(e.where) + '</small><p>' + snippet(e, q) + '</p></span></a>';
      }).join('') : '<div class="empty">その名は、この書のどこにも記されていない。</div>') + '</div></section>';
  }
  function bindSearchBox(input, box) {
    var sel = -1, items = [];
    function close() { box.hidden = true; sel = -1; }
    function draw() {
      var q = input.value.trim();
      items = q ? search(q).slice(0, 8) : [];
      if (!items.length) { box.innerHTML = q ? '<div class="sg-none">記されていない</div>' : ''; box.hidden = !q; return; }
      box.innerHTML = items.map(function (e, i) { return '<a href="' + e.href + '" class="' + e.side + (i === sel ? ' sel' : '') + '"><span class="badge">' + e.kind + '</span><span class="t">' + hl(e.title, q) + '</span><span class="s">' + esc(e.where) + '</span></a>'; }).join('');
      box.hidden = false;
    }
    var qT; input.addEventListener('input', function () { sel = -1; clearTimeout(qT); qT = setTimeout(draw, 60); });
    input.addEventListener('focus', draw);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); draw(); ev.preventDefault(); }
      else if (ev.key === 'ArrowUp') { sel = Math.max(sel - 1, -1); draw(); ev.preventDefault(); }
      else if (ev.key === 'Escape') { close(); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        var q = input.value.trim(); if (!q) return;
        location.hash = sel >= 0 && items[sel] ? items[sel].href : '#/search/' + encodeURIComponent(q);
        close(); input.blur(); closeDrawer();
      }
    });
    box.addEventListener('click', function () { close(); input.value = ''; closeDrawer(); });
    document.addEventListener('click', function (ev) { if (!box.contains(ev.target) && ev.target !== input) close(); });
  }

  function renderNotFound() {
    app.innerHTML = '<section class="wrap section"><div class="empty">この階には、何も記されていない。<br><a href="#/">地上へ戻る</a></div></section>';
  }

  /* ---------- 目次（すべての領域・章・節を一覧できる引き出し） ---------- */
  var drawer, lastFocus;
  function drawerTree() {
    var cur = location.hash;
    function link(href, t, extra) { return '<a href="' + href + '"' + (cur === href ? ' aria-current="page"' : '') + (extra || '') + '>' + t + '</a>'; }
    return '<div class="dr-search"><span class="ico-wrap">' + icon('search') + '</span><input type="search" placeholder="名を探す" aria-label="この書から名を探す" autocomplete="off" id="dq"><div class="suggest" id="dsuggest" hidden></div></div>' +
      '<p class="dr-gate up">' + link('#/ascend', '↑ 塔を昇る（演出）') + '</p>' +
      REALMS.map(function (r) {
        return '<section class="dr-realm rt-' + r.id + '"><h3>' + link('#/r/' + r.id, '<i>' + r.mark + '</i>' + esc(r.name) + '<small>' + esc(r.sub) + '</small>') + '</h3>' +
          realmCats(r.id).map(function (c) {
            var items = c.id === 'character' ? CHARACTERS.filter(function (x) { return !x.spoiler || spoilOK(); }).map(function (ch) { return ['#/ch/' + ch.id, ch.name]; }) : articlesIn(c.id).map(function (a) { return ['#/a/' + a.id, a.title]; });
            return '<details class="dr-cat"' + (items.some(function (x) { return cur.indexOf(x[0]) === 0; }) ? ' open' : '') + '><summary><span class="code">' + chapter(c.id) + '</span>' + esc(c.name) + '<small>' + items.length + '</small></summary><ul>' +
              items.map(function (x) { return '<li>' + link(x[0], esc(x[1])) + '</li>'; }).join('') + '</ul></details>';
          }).join('') + '</section>';
      }).join('') +
      '<p class="dr-gate down">' + link('#/descend', '↓ 塔を潜る（演出）') + '</p>' +
      '<section class="dr-ref"><h3>資料</h3>' + link('#/c/glossary', '用語集') + link('#/articles', 'すべての節') + link('#/horologium', '世界の時計') + (deepOpen() ? link('#/deep', '深層') : '') + '</section>';
  }
  function openDrawer() {
    if (!drawer.hidden) return;
    lastFocus = document.activeElement;
    drawer.querySelector('.dr-body').innerHTML = drawerTree();
    bindSearchBox($('#dq'), $('#dsuggest'));
    drawer.hidden = false; document.documentElement.classList.add('dr-open');
    requestAnimationFrame(function () { drawer.classList.add('in'); var c = drawer.querySelector('[aria-current]'); if (c) c.scrollIntoView({ block: 'center' }); drawer.querySelector('.dr-close').focus(); });
    $('#toc-btn').setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('in'); document.documentElement.classList.remove('dr-open');
    $('#toc-btn').setAttribute('aria-expanded', 'false');
    setTimeout(function () { drawer.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function setupDrawer() {
    drawer = document.createElement('div'); drawer.className = 'drawer'; drawer.hidden = true;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-label', '目次');
    drawer.innerHTML = '<div class="dr-shade"></div><div class="dr-panel"><div class="dr-head"><b>目次</b><span class="latin">Index Libri</span><button type="button" class="dr-close" aria-label="目次を閉じる">閉じる</button></div><div class="dr-body"></div></div>';
    document.body.appendChild(drawer);
    drawer.querySelector('.dr-shade').onclick = closeDrawer;
    drawer.querySelector('.dr-close').onclick = closeDrawer;
    drawer.addEventListener('click', function (e) { if (e.target.closest('.dr-body a[href]')) closeDrawer(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    $('#toc-btn').onclick = function () { drawer.hidden ? openDrawer() : closeDrawer(); };
  }

  /* ---------- 空気：スクロールで上の光が弱まり、下の熾火が強まる ---------- */
  // 変数はページ全体（:root）ではなく、空気と深さの線だけに渡す（再計算を小さくする）
  var atmos = $('.atmos'), rail = $('.depth-rail');
  function setupAtmosphere() {
    var root = document.documentElement, ticking = false, lastP = -1;
    function update() {
      ticking = false;
      var max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
      if (Math.abs(p - lastP) < 0.004) return; lastP = p;
      atmos.style.setProperty('--up', (1 - p * 0.8).toFixed(3));
      atmos.style.setProperty('--down', (0.25 + p * 0.75).toFixed(3));
      rail.style.setProperty('--p', p.toFixed(3));
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.__atmos = function () { lastP = -1; requestAnimationFrame(update); };
    update();
  }

  /* ---------- テーマ ---------- */
  function setupTheme() {
    var root = document.documentElement, btn = $('#theme');
    var saved = null; try { saved = localStorage.getItem('matenrou-theme'); } catch (e) {}
    if (saved) root.setAttribute('data-theme', saved);
    function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
    function paint() { btn.innerHTML = icon(isDark() ? 'sun' : 'moon'); btn.setAttribute('aria-label', isDark() ? 'ライトモードにする' : 'ダークモードにする'); }
    btn.addEventListener('click', function () { var n = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', n); try { localStorage.setItem('matenrou-theme', n); } catch (e) {} paint(); });
    paint();
  }

  /* ---------- ヘッダー・ルーター ---------- */
  function setupChrome() {
    $('#brand-mark').innerHTML = logoSvg();
    $('#foot-mark').innerHTML = logoSvg();
    $('#search-ico').innerHTML = icon('search');
    $('#toc-btn').innerHTML = icon('list') + '<span>目次</span>';
    $('#nav').innerHTML = REALMS.map(function (r) {
      return '<a class="rn rt-' + r.id + '" href="#/r/' + r.id + '" data-nav="' + r.id + '"><i>' + r.mark + '</i>' + esc(r.name) + '</a>';
    }).join('') + '<span class="nav-sep" aria-hidden="true"></span><a href="#/c/character" data-nav="character">人物</a><a href="#/c/glossary" data-nav="glossary">用語</a><a href="#/articles" data-nav="articles">索引</a>';
    bindSearchBox($('#q'), $('#suggest'));
  }
  var rendered = '';
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), parts = h.split('/');
    // 同じ記事の中の項へ飛ぶだけなら、描き直さずにそこへ動く
    if (parts[0] === 'a' && rendered === 'a/' + parts[1] && parts[2]) { scrollToSec(parts[2], true); return; }
    if (tocIO) { tocIO.disconnect(); tocIO = null; }
    towerIO.forEach(function (o) { o.disconnect(); }); towerIO = [];
    var nav = '', tower = false;
    if (!h) { renderHome(); bindClock(); }
    else if (parts[0] === 'r') { renderRealm(parts[1]); nav = parts[1]; }
    else if (parts[0] === 'c') { renderCategory(parts[1]); var cc = catById[parts[1]]; nav = cc ? (cc.renderMode ? cc.id : cc.realm) : ''; }
    else if (parts[0] === 'a') { renderArticle(parts[1], parts[2]); var aa = artById[parts[1]]; nav = aa ? realmOf(aa.cat) : ''; }
    else if (parts[0] === 'ch') { renderCharacter(parts[1]); nav = 'character'; }
    else if (parts[0] === 'articles') { renderAll(); nav = 'articles'; }
    else if (parts[0] === 'ascend') { tower = renderTower('heaven', parts[1]); nav = 'heaven'; }
    else if (parts[0] === 'descend') { tower = renderTower('abyss', parts[1]); nav = 'abyss'; }
    else if (parts[0] === 'search') renderSearch(parts.slice(1).join('/'));
    else if (parts[0] === 'horologium') { renderHorologium(); }
    else if (parts[0] === 'deep') { renderDeep(); }
    else renderNotFound();
    rendered = parts[0] + '/' + (parts[1] || '');
    $$('#nav a').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === nav); });
    var t = $('#app h1'); document.title = (h && t ? t.textContent + '｜' : '') + '魔天楼 ARCHIVE';
    if (!tower && !(parts[0] === 'a' && parts[2]) && !(parts[0] === 'c' && catById[parts[1]] && !catById[parts[1]].renderMode)) window.scrollTo(0, 0);
    document.body.classList.toggle('in-tower', !!tower);
    if (window.__atmos) window.__atmos();
    writeIn();
  }

  /* =========================================================
     世界の中で行動する（転生・堕天・契約・時計・異変・深層）
     文章は js/data/world.js
     ========================================================= */
  var WD = window.WORLD;
  var KINDS = [['lust', '色欲'], ['gluttony', '暴食'], ['greed', '強欲'], ['wrath', '憤怒'], ['pride', '傲慢'], ['envy', '嫉妬'], ['sloth', '怠惰']];
  var W = (function () {
    var d = { form: 'human', reborn: false, fallen: false, pact: null, who: null, time: WD.clock.start, event: null, deep: false, spoil: null };
    try { var s = JSON.parse(localStorage.getItem('matenrou-world') || 'null'); if (s) for (var k in d) if (k in s) d[k] = s[k]; } catch (e) {}
    return d;
  })();
  window.__W = W;
  function saveW() { window.__W = W; try { localStorage.setItem('matenrou-world', JSON.stringify(W)); } catch (e) {} paintWorld(); }
  function resetW() { W = { form: 'human', reborn: false, fallen: false, pact: null, who: null, time: WD.clock.start, event: null, deep: false, spoil: W.spoil }; saveW(); route(); }
  function spoilOK() { return W.spoil === true; }
  function deepOpen() { return W.deep && spoilOK(); }
  function kindName(id) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0] === id) return KINDS[i][1]; return ''; }
  function priceOf(id) { var a = artById[id]; return a && a.info && a.info[0] ? a.info[0][1] : ''; }

  /* --- 入口の門：ネタバレの有無を選んでからサイトに入る --- */
  function entryGate() {
    if ($('.entry')) return;
    var ov = document.createElement('div'); ov.className = 'entry'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', '入口の門');
    ov.innerHTML = '<div class="entry-sky"></div><div class="entry-gate">' + gateShape('heaven') + '</div>' +
      '<div class="entry-body"><div class="entry-logo">' + logoSvg() + '</div>' +
      '<p class="entry-q">この塔には、物語の核心も記されている。<br>どのように読む？</p>' +
      '<div class="entry-choices">' +
        '<button type="button" data-spoil="1"><span class="latin">Omnia</span><b>すべてを知る</b><small>ネタバレあり ── 核心も含めて読む</small></button>' +
        '<button type="button" data-spoil="0"><span class="latin">Velatum</span><b>核心を伏せる</b><small>ネタバレなし ── 核心に触れる記述は伏せる</small></button>' +
      '</div><p class="entry-note">あとから、右上の「いまの身」からいつでも変えられる。</p></div>';
    document.body.appendChild(ov);
    document.documentElement.classList.add('gate-open');
    ov.querySelector('.entry-choices').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      W.spoil = b.dataset.spoil === '1'; saveW();
      ov.classList.add('pass');
      setTimeout(function () { ov.classList.add('out'); document.documentElement.classList.remove('gate-open'); route(); }, reduced ? 0 : 1200);
      setTimeout(function () { ov.remove(); }, reduced ? 50 : 2200);
    });
  }

  /* --- ヘッダーの「いまの身」と歩み --- */
  function paintWorld() {
    var b = document.body;
    // 天使になると白みがかり端から白い翼が、悪魔になると黒みがかり端から黒い翼がのぞく
    var ew = $('#edge-wings');
    if (ew && ew.dataset.form !== W.form) { ew.remove(); ew = null; }
    if (!ew && W.form !== 'human') {
      ew = document.createElement('div'); ew.id = 'edge-wings'; ew.dataset.form = W.form; ew.setAttribute('aria-hidden', 'true');
      var src = W.form === 'angel' ? WING.angel : WING.demon;
      ew.innerHTML = ['p1', 'p2', 'p3', 'p4'].map(function (k) { return '<span class="ew ' + k + '"><b><img src="' + src + '" alt="" decoding="async"></b></span>'; }).join('');
      document.body.insertBefore(ew, document.body.firstChild);
    }
    ['human', 'angel', 'demon'].forEach(function (f) { b.classList.toggle('form-' + f, W.form === f); });
    b.classList.toggle('ev-apocalypse', W.event === 'apocalypse');
    b.classList.toggle('ev-ragnarok', W.event === 'ragnarok');
    var chip = $('#status');
    if (chip) chip.innerHTML = '<span class="dot ' + W.form + '"></span><span>' + WD.forms[W.form] + (W.pact ? '<i>契約者</i>' : '') + '</span>';
    var bn = $('#event-banner');
    if (W.event) {
      var ev = WD.clock.events.filter(function (e) { return e.id === W.event; })[0];
      bn.hidden = false;
      bn.innerHTML = '<b>' + esc(ev.title) + '</b><span class="latin">' + esc(ev.latin) + '</span><a href="#/deep">深層へ</a><button type="button" id="rewind">時を戻す</button>';
      $('#rewind').onclick = function () { W.event = null; W.time = WD.clock.start; saveW(); route(); };
    } else bn.hidden = true;
    // 異変のあと、空に残るもの（ラグナロク＝静かに浮かぶ翼の影と羽根／アポカリプス＝続く戦いの筋）
    var es = $('#event-sky');
    if (es && es.dataset.ev !== (W.event || '')) { es.remove(); es = null; }
    if (W.event && !es) {
      es = document.createElement('div'); es.id = 'event-sky'; es.dataset.ev = W.event; es.setAttribute('aria-hidden', 'true');
      es.innerHTML = W.event === 'ragnarok' ? seraph('linger', [[6, 170, 1], [9, 260, .8], [12, 350, .55]]) + particles('feathers', 10) : clash(10);
      document.body.insertBefore(es, document.body.firstChild);
    }
    var ash = $('#ash');
    if (W.event === 'apocalypse' && !ash) { var d = document.createElement('div'); d.id = 'ash'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = particles('ash', 24); document.body.appendChild(d); }
    if (W.event !== 'apocalypse' && ash) ash.remove();
  }
  function journeyPanel() {
    var steps = [
      ['読む', true], ['転生する', W.reborn], ['天界へ', W.reborn], ['堕天する', W.fallen],
      ['契約する', !!W.pact], ['時を動かす', !!W.event || W.deep], ['深層へ', W.deep]
    ];
    var next = !W.reborn ? ['天使の節で「転生する」', '#/a/angel'] : !W.fallen ? ['天界の門で「堕天する」', '#/ascend/gate'] : !W.pact ? ['降塔の章で「契約する」', '#/r/abyss'] : !W.deep ? ['世界の時計の針を動かす', '#/horologium'] : ['深層の書を開く', '#/deep'];
    var redo = { '転生する': ['rebirth', true], '堕天する': ['fall', W.reborn], '契約する': ['pact', W.form !== 'angel'] };
    return '<div class="jp-head"><span class="latin">Iter</span><b>あなたの歩み</b></div><ol>' + steps.map(function (s) {
      var r = redo[s[0]];
      return '<li class="' + (s[1] ? 'done' : '') + '">' + (r && r[1] ? '<button type="button" class="jp-redo" data-redo="' + r[0] + '">' + s[0] + '<i>' + (s[1] ? 'やり直す' : '') + '</i></button>' : s[0]) + '</li>'; }).join('') + '</ol>' +
      '<p class="jp-now">いまの身：<b>' + WD.forms[W.form] + '</b>' + (W.pact ? '　契約：<b>' + (W.pact === 'human' ? '人と' : kindName(W.pact)) + '</b>' : '') + '</p>' +
      (whoOf(W.who) ? '<p class="jp-now">何者：<b>' + esc(whoOf(W.who).title) + '</b></p>' : '') +
      '<a class="jp-next" href="' + next[1] + '">次は ── ' + next[0] + '</a>' +
      '<p class="jp-now">読み方：<b>' + (W.spoil ? 'すべてを知る（ネタバレあり）' : '核心を伏せる（ネタバレなし）') + '</b></p>' +
      '<button type="button" class="jp-reset" id="jp-regate">門をくぐり直す（読み方を変える）</button><br>' +
      '<button type="button" class="jp-reset" id="jp-reset">人の身に戻り、最初から読む</button>';
  }
  function setupStatus() {
    var tools = $('.header-tools');
    var wrap = document.createElement('div'); wrap.className = 'status-wrap';
    wrap.innerHTML = '<button type="button" class="status" id="status" aria-haspopup="true" aria-expanded="false" aria-label="あなたの歩み"></button><div class="jp" id="jp" hidden></div>';
    tools.insertBefore(wrap, $('#theme'));
    var bn = document.createElement('div'); bn.id = 'event-banner'; bn.hidden = true; document.body.appendChild(bn);
    var btn = $('#status'), jp = $('#jp');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (jp.hidden) { jp.innerHTML = journeyPanel(); jp.hidden = false; btn.setAttribute('aria-expanded', 'true');
        $('#jp-regate').onclick = function () { jp.hidden = true; entryGate(); };
        var r = $('#jp-reset'); r.onclick = function () { if (r.dataset.sure) { jp.hidden = true; resetW(); location.hash = '#/'; } else { r.dataset.sure = 1; r.textContent = 'もう一度押すと、すべての歩みが消える'; } };
      } else { jp.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.status-wrap')) { jp.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    jp.addEventListener('click', function (e) {
      if (e.target.closest('a')) jp.hidden = true;
      var b = e.target.closest('[data-redo]'); if (!b || riteBusy) return;
      var n = b.dataset.redo; jp.hidden = true; btn.setAttribute('aria-expanded', 'false');
      var prev = W.pact;
      if (n === 'rebirth') { W.form = 'human'; W.reborn = false; W.fallen = false; W.pact = null; W.who = null; }
      else if (n === 'fall') { W.form = 'angel'; W.fallen = false; W.pact = null; W.who = null; }
      else { W.pact = null; }
      saveW(); rite(n, prev);
    });
    paintWorld();
  }

  /* --- 記事・章に置く「行動」 --- */
  function actButton(rite, desc) {
    var r = WD.rites[rite];
    return '<button type="button" class="act-btn act-' + rite + '" data-rite="' + rite + '"><span class="latin">' + esc(r.latin) + '</span><b>' + esc(r.label) + '</b><small>' + esc(desc || r.desc) + '</small></button>';
  }
  function actions(ctx) {
    var h = '';
    if (ctx === 'angel') {
      if (W.form === 'human' && !W.reborn) h += actButton('rebirth');
      if (W.form === 'angel') h += actButton('fall');
    }
    if (ctx === 'contract') {
      if (W.pact) h += '<p class="act-note">契約はすでに交わされている。' + (W.pact !== 'human' ? '相手は' + kindName(W.pact) + 'の悪魔。' : '') + '契約は一度きり、一生続く。</p>';
      else if (W.form === 'angel') h += '<p class="act-note">天使の身では、契約はできない。</p>';
      else h += actButton('pact', W.form === 'demon' ? WD.rites.pact.descDemon : WD.rites.pact.descHuman);
    }
    if (ctx === 'demon' && W.form === 'demon' && !W.pact) h += actButton('pact', WD.rites.pact.descDemon);
    if (W.pact && !W.event && (ctx === 'contract' || ctx === 'demon')) h += '<a class="act-link" href="#/horologium"><span class="latin">Horologium</span>時が、動き出した。世界の時計へ →</a>';
    return h ? '<div class="act">' + h + '</div>' : '';
  }
  function ctxOf(catId, artId) {
    if (artId === 'soul-cycle' || catId === 'angel' || catId === 'angel-rank') return 'angel';
    if (catId === 'contract') return 'contract';
    if (catId === 'demon' || catId === 'sins' || catId === 'demon-rank') return 'demon';
    return '';
  }

  /* --- 儀式（全画面の演出） --- */
  var riteBusy = false;
  function rite(name, prevPact) {
    if (riteBusy) return; riteBusy = true;
    var r = WD.rites[name], ov = document.createElement('div');
    ov.className = 'rite rite-' + name; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', r.label);
    document.body.appendChild(ov);
    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function line(text, cls) { var p = document.createElement('p'); p.className = 'rite-line ' + (cls || ''); p.textContent = text; ov.querySelector('.rite-lines').appendChild(p); inkify(p, 90, 0); }
    function finish(apply) {
      timers.forEach(clearTimeout); apply(); saveW();
      ov.classList.add('out'); setTimeout(function () { ov.remove(); riteBusy = false; }, 900);
      location.hash = r.to;
    }
    var skip = '<button type="button" class="rite-skip">飛ばす</button>';
    if (name === 'rebirth') {
      ov.innerHTML = '<div class="rite-sky"></div><span class="orb"></span><div class="rite-gate">' + gateShape('heaven') + '</div><div class="rite-lines"></div>' + skip;
      var apply = function () { W.form = 'angel'; W.reborn = true; };
      at(300, function () { line(r.lines[0]); });
      at(1900, function () { ov.classList.add('s2'); line(r.lines[1]); });
      at(3900, function () { ov.classList.add('s3'); line(r.lines[2]); });
      at(6300, function () { ov.classList.add('s4'); });
      at(7200, function () { finish(apply); });
    } else if (name === 'fall') {
      ov.innerHTML = '<div class="rite-sky"></div><div class="rite-wing"><img src="' + WING.angel + '" alt=""><img src="' + WING.angel + '" alt=""></div>' + particles('blackfeathers', 18) + '<div class="rite-lines"></div>' + skip;
      at(300, function () { line(r.lines[0]); });
      at(2000, function () { ov.classList.add('s2'); line(r.lines[1]); });
      at(4000, function () { ov.classList.add('s3'); line(r.lines[2]); });
      at(6200, function () { timers.forEach(clearTimeout); W.form = 'demon'; W.fallen = true; saveW(); whoStage(ov, r.to); });
    } else if (name === 'pact') {
      var demonSelf = W.form === 'demon';
      ov.innerHTML = '<div class="rite-sky"></div><div class="rite-seal"></div><div class="rite-lines"></div><div class="pact-choose"></div>' + skip;
      line(demonSelf ? r.askDemon : r.ask);
      var ch = ov.querySelector('.pact-choose');
      ch.innerHTML = KINDS.map(function (k, i) { return '<button type="button" data-kind="' + k[0] + '"><span class="pc-emb">' + drawn(k[0], 0.5 + i * 0.35) + '</span><b>' + k[1] + '</b><small>代償：' + esc(priceOf(k[0])) + '</small></button>'; }).join('');
      ch.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var kind = b.dataset.kind; ch.remove();
        ov.querySelector('.rite-lines').innerHTML = '';
        ov.querySelector('.rite-seal').innerHTML = sealSvg(kindName(kind));
        ov.classList.add('s2');
        line(demonSelf ? 'お前は' + kindName(kind) + 'の悪魔。人と契りを結ぶ。' : '代償 ── ' + priceOf(kind));
        at(2600, function () { line(r.sealed, 'big'); ov.classList.add('s3'); });
        at(5200, function () { finish(function () { W.pact = kind; }); });
      });
    }
    ov.querySelector('.rite-skip').onclick = function () {
      if (name === 'pact' && !W.pact) { timers.forEach(clearTimeout); if (prevPact) { W.pact = prevPact; saveW(); } ov.remove(); riteBusy = false; return; }
      if (name === 'fall') { timers.forEach(clearTimeout); W.form = 'demon'; W.fallen = true; saveW(); whoStage(ov, r.to); return; }
      finish(name === 'rebirth' ? function () { W.form = 'angel'; W.reborn = true; } : function () {});
    };
  }

  /* --- 堕天のあと：あなたは、何者になる？ --- */
  function whoOf(w) {
    var X = WD.who.sins[w && w.sin];
    return X ? { title: X.name, text: X.text } : null;
  }
  function whoStage(ov, to) {
    var X = WD.who, st = { answers: [] };
    ov.className = 'rite rite-who'; ov.setAttribute('aria-label', X.ask);
    ov.innerHTML = '<div class="rite-sky"></div><div class="who-body"></div><button type="button" class="rite-skip">飛ばす</button>';
    var body = ov.querySelector('.who-body');
    function leave(who) {
      W.who = who; saveW();
      ov.classList.add('out'); setTimeout(function () { ov.remove(); riteBusy = false; }, 900);
      location.hash = to;
    }
    ov.querySelector('.rite-skip').onclick = function () { leave({ mode: 'skip' }); };
    function show(html, after) {
      body.classList.remove('in'); body.innerHTML = html; void body.offsetWidth; body.classList.add('in');
      if (after) after();
    }
    function menu() {
      show('<span class="latin">' + esc(X.askLatin) + '</span><h2 class="who-ask">' + esc(X.ask) + '</h2><div class="who-opts">' +
        X.modes.map(function (m) { return '<button type="button" data-m="' + m.id + '"><b>' + esc(m.label) + '</b><small>' + esc(m.desc) + '</small></button>'; }).join('') + '</div>', function () {
        $$('[data-m]', body).forEach(function (b) {
          b.onclick = function () { var m = b.dataset.m; if (m === 'diagnose') { st.answers = []; ask(0); } else choose(); };
        });
      });
    }
    function ask(i) {
      var q = X.questions[i];
      show('<span class="latin">' + (i + 1) + ' / ' + X.questions.length + '</span><p class="who-q">' + esc(q.q) + '</p><div class="who-opts one">' +
        q.a.map(function (a, k) { return '<button type="button" data-k="' + k + '"><b>' + esc(a.t) + '</b></button>'; }).join('') + '</div>', function () {
        $$('[data-k]', body).forEach(function (b) {
          b.onclick = function () { st.answers.push({ s: q.a[+b.dataset.k].s, p: q.a[+b.dataset.k].p }); i + 1 < X.questions.length ? ask(i + 1) : decide(); };
        });
      });
    }
    function decide() {
      var pt = {}, last = {};
      st.answers.forEach(function (a, i) { [2, 1].forEach(function (n, idx) { var k = a.s[idx]; pt[k] = (pt[k] || 0) + n; last[k] = i; }); });
      var best = null; for (var k in pt) if (best === null || pt[k] > pt[best] || (pt[k] === pt[best] && last[k] > last[best])) best = k;
      result({ mode: 'diagnose', sin: best, steps: st.answers.map(function (a) { return a.p; }) });
    }
    function choose() {
      show('<p class="who-q">' + esc(X.chooseAsk) + '</p><div class="who-sins">' +
        SIN_EMB.map(function (k, n) { return '<button type="button" data-sin="' + k + '"><span class="ws-emb">' + drawn(k, 0.15 + n * 0.2) + '</span><b>' + esc(X.sins[k].name) + '</b></button>'; }).join('') + '</div>', function () {
        $$('[data-sin]', body).forEach(function (b) {
          b.onclick = function () { result({ mode: 'choose', sin: b.dataset.sin, steps: [] }); };
        });
      });
    }
    function result(who) {
      var info = whoOf(who), pick = who.mode === 'choose';
      show((pick ? '<p class="who-intro">' + esc(X.chooseIntro) + '</p>' :
        '<p class="who-intro">' + esc(X.diagnoseIntro) + '</p><ul class="who-steps">' + who.steps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>') +
        '<p class="who-intro">' + esc(pick ? X.chooseOutro : X.diagnoseOutro) + '</p>' +
        '<span class="who-emb">' + drawn(who.sin) + '</span><h2 class="who-title">' + esc(info.title) + '</h2><p class="who-text">' + esc(info.text) + '</p>' +
        '<p class="who-intro">' + esc(X.sinNote) + '</p>' +
        '<div class="who-opts one"><button type="button" id="who-go"><b>悪魔の章へ</b></button></div>', function () {
        body.querySelector('#who-go').onclick = function () { leave(who); };
      });
    }
    menu();
  }
  // 契約の紋：七芒星を線で描く
  function sealSvg(label) {
    var pts = [], i, s = '<svg viewBox="-110 -110 220 220" aria-hidden="true">';
    for (i = 0; i < 7; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / 7; pts.push([Math.cos(a) * 82, Math.sin(a) * 82]); }
    var d = ''; for (i = 0; i < 8; i++) { var p = pts[(i * 3) % 7]; d += (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
    s += '<circle r="98" pathLength="1" class="ln"/><circle r="88" pathLength="1" class="ln d2"/><path d="' + d + 'Z" pathLength="1" class="ln d3"/>';
    pts.forEach(function (p, k) { s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" class="pt" style="animation-delay:' + (1.6 + k * .12) + 's"/>'; });
    return s + '<text y="8" text-anchor="middle" class="kn">' + esc(label) + '</text></svg>';
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-rite]'); if (b) rite(b.dataset.rite); });

  /* --- 世界の時計 --- */
  function clockSvg() {
    var s = '<svg class="clock" viewBox="-130 -130 260 260" role="img" aria-label="世界の時計">';
    s += '<circle r="122" class="rim"/><circle r="112" class="face"/>';
    for (var i = 0; i < 60; i++) s += '<line y1="-112" y2="' + (i % 5 ? -106 : -100) + '" transform="rotate(' + i * 6 + ')" class="tick' + (i % 5 ? '' : ' big') + '"/>';
    var R = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    R.forEach(function (n, k) { var a = (k * 30 - 90) * Math.PI / 180; s += '<text x="' + (Math.cos(a) * 86).toFixed(1) + '" y="' + (Math.sin(a) * 86 + 5).toFixed(1) + '" class="num' + (k === 0 ? ' up' : k === 6 ? ' down' : '') + '">' + n + '</text>'; });
    s += '<circle r="5" cy="-125" class="mark up"/><circle r="5" cy="125" class="mark down"/>';
    s += '<g class="hand-h"><path d="M-4,10 L-2.5,-58 L0,-64 L2.5,-58 L4,10Z"/></g>';
    s += '<g class="hand-m"><path d="M-2,14 L-1,-96 L0,-102 L1,-96 L2,14Z"/><circle cy="-92" r="9" class="knob"/></g>';
    return s + '<circle r="6" class="pin"/></svg>';
  }
  function timeText(t) { var p = ((Math.round(t) % 720) + 720) % 720, h = Math.floor(p / 60), m = p % 60; return (h === 0 ? 12 : h) + ':' + ('0' + m).slice(-2); }
  function clockBlock(big) {
    var locked = !W.pact;
    return '<div class="clock-wrap' + (big ? ' big' : '') + (locked ? ' locked' : '') + (W.event ? ' ended' : '') + '" id="clock">' + clockSvg() +
      '<div class="clock-info"><span class="latin">Hora Mundi</span><b class="time">' + timeText(W.time) + '</b><span class="clock-msg">' +
      (locked ? esc(WD.clock.lockedText) : W.event ? '時は、すでに異変を迎えた。' : esc(WD.clock.hint)) + '</span>' +
      (locked ? '<a class="link-arrow down" href="#/a/contract"><span class="dir">→</span>契約の節へ</a>' : '') +
      (W.event ? '<a class="link-arrow" href="#/deep"><span class="dir">↓</span>深層へ</a>' : '') + '</div></div>';
  }
  function bindClock() {
    var wrap = $('#clock'); if (!wrap) return;
    var svg = wrap.querySelector('svg'), hm = svg.querySelector('.hand-m'), hh = svg.querySelector('.hand-h'), tt = wrap.querySelector('.time');
    function paint() {
      hm.setAttribute('transform', 'rotate(' + (W.time % 60) * 6 + ')');
      hh.setAttribute('transform', 'rotate(' + (W.time / 2) + ')');
      tt.textContent = timeText(W.time);
      var ph = ((W.time % 720) + 720) % 720, d12 = Math.min(ph, 720 - ph) / 360;
      atmos.style.setProperty('--cu', ((1 - d12) * .7).toFixed(3));
      atmos.style.setProperty('--cd', (d12 * .7).toFixed(3));
    }
    paint();
    if (!W.pact || W.event) return;
    var dragging = false, last = 0;
    function ang(e) { var r = svg.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return Math.atan2(x, -y) * 180 / Math.PI; }
    svg.addEventListener('pointerdown', function (e) { dragging = true; last = ang(e); svg.setPointerCapture(e.pointerId); wrap.classList.add('turning'); });
    svg.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var a = ang(e), d = a - last; if (d > 180) d -= 360; if (d < -180) d += 360; last = a;
      var t0 = W.time, t1 = t0 + d / 6; W.time = t1; paint();
      WD.clock.events.forEach(function (ev) {
        if (W.event) return;
        var lo = Math.min(t0, t1), hi = Math.max(t0, t1), k = Math.ceil((lo - ev.at) / 720), x = ev.at + k * 720;
        if (x > lo && x <= hi) { dragging = false; W.time = x; paint(); W.event = ev.id; W.deep = true; saveW(); eventRite(ev); }
      });
    });
    function end() { if (dragging) { dragging = false; wrap.classList.remove('turning'); saveW(); } }
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  }
  // 幾千の翼を持つもの：天使の翼を同心円に重ねて一つの姿にする
  function seraph(cls, rings) {
    rings = rings || [[6, 170, 1], [9, 260, .85], [12, 350, .6], [18, 430, .32]];
    var h = '<div class="seraph ' + (cls || '') + '" aria-hidden="true"><span class="halo"></span>';
    rings.forEach(function (r, ri) {
      h += '<div class="ring" style="--dir:' + (ri % 2 ? -1 : 1) + ';--sp:' + (80 + ri * 40) + 's;opacity:' + r[2] + '">';
      for (var i = 0; i < r[0]; i++) {
        var a = (360 / r[0]) * i + (ri % 2 ? 180 / r[0] : 0);
        h += '<span style="--a:' + a.toFixed(1) + 'deg;--w:' + r[1] + 'px"><b style="animation-delay:' + (-rnd(i + ri * 40) * 3).toFixed(2) + 's"><img src="' + WING.angel + '" alt="" decoding="async"></b></span>';
      }
      h += '</div>';
    });
    return h + '<span class="core"></span></div>';
  }
  // 戦いの筋：上から白（天使）、下から赤（人と悪魔）
  function clash(n) {
    var h = '<div class="clash" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var up = i % 2, x = (rnd(i + 21) * 100).toFixed(1), dl = (rnd(i + 23) * -3).toFixed(2), du = (.7 + rnd(i + 27) * 1.1).toFixed(2), a = (rnd(i + 29) * 40 - 20).toFixed(0);
      h += '<i class="' + (up ? 'ang' : 'dem') + '" style="--x:' + x + '%;--d:' + dl + 's;--u:' + du + 's;--a:' + a + 'deg"></i>';
    }
    return h + '</div>';
  }
  function eventRite(ev) {
    var ov = document.createElement('div'); ov.className = 'rite ev-rite ev-' + ev.id; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', ev.title);
    var mini = [[5, 70, 1], [7, 105, .6]];
    var scene = ev.id === 'ragnarok'
      ? '<span class="god"></span>' + seraph('descend') + particles('feathermass', 90)
      : '<div class="host">' + [0, 1, 2, 3, 4].map(function (k) { return '<div class="invader iv' + k + '">' + seraph('mini', mini) + '</div>'; }).join('') + '</div>' +
        particles('feathers', 28) + clash(44) + particles('embers', 30) + '<span class="front"></span>';
    ov.innerHTML = '<div class="rite-sky"></div>' + scene +
      '<div class="rite-lines"><p class="rite-latin latin">' + esc(ev.latin) + '</p><h2 class="rite-title">' + esc(ev.title) + '</h2><p class="rite-line">' + esc(ev.text) + '</p>' + (ev.sub ? '<p class="rite-line sub">' + esc(ev.sub) + '</p>' : '') + '</div>';
    document.body.appendChild(ov);
    inkify(ov.querySelector('.rite-title'), 220, 900); inkify(ov.querySelector('.rite-line'), 80, 2400);
    var sub = ov.querySelector('.sub'); if (sub) inkify(sub, 70, 3600);
    setTimeout(function () { ov.classList.add('out'); paintWorld(); route(); setTimeout(function () { ov.remove(); }, 1200); }, 7600);
  }
  function renderHorologium() {
    app.innerHTML = crumbs([{ t: '資料' }, { t: '世界の時計' }]) +
      '<header class="wrap page-head">' + sigil('none') + '<div><div class="code">Horologium<i>世界の時計</i></div><h1>世界の時計</h1><p>この世界の時を刻む針。' + (W.pact ? '契約を交わした者は、これを動かせる。' : '') + '</p></div></header>' +
      '<section class="wrap">' + clockBlock(true) + '</section>';
    bindClock();
  }

  /* --- 深層 --- */
  function renderDeep() {
    var list = ARTICLES.filter(function (a) { return a.deep; });
    app.innerHTML = crumbs([{ t: WD.deep.title }]) +
      '<header class="wrap page-head side-abyss">' + sigil('abyss') + '<div><div class="code">' + esc(WD.deep.latin) + '<i>' + esc(WD.deep.title) + '</i></div><h1>' + esc(WD.deep.title) + '</h1><p>' + esc(deepOpen() ? WD.deep.openText : WD.deep.lockedText) + '</p></div></header>' +
      '<section class="wrap">' + (W.deep && !spoilOK() ? '<div class="empty">深層には物語の核心が記されている。<br>いまは核心を伏せて読んでいるため、門は開かない。<br><button type="button" class="jp-open" id="regate">門をくぐり直す</button></div>'
        : !W.deep ? '<div class="empty">' + esc(WD.deep.lockedText) + '<br><button type="button" class="jp-open" id="see-journey">あなたの歩みを見る</button></div>'
        : list.length ? '<div class="list">' + list.map(function (a) { return listRow(a); }).join('') + '</div>' : '<div class="empty">' + esc(WD.deep.emptyText) + '</div>') + '</section>';
    var g = $('#regate'); if (g) g.onclick = entryGate;
    var j = $('#see-journey'); if (j) j.onclick = function (e) { e.stopPropagation(); $('#status').click(); };
  }

  /* ---------- 開いたとき、紙に文字を書いていくように ---------- */
  // 見出しは一文字ずつ墨がにじむように現れ、要約と本文は行の頭から筆でなぞるように現れる。
  // ・動かすのは opacity と transform、clip-path だけ（ぼかしは使わない）
  // ・画面に見えている部分だけを動かし、全体で 1 秒ほどで書き終える
  function inkify(el, step, start) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.from(n.textContent).forEach(function (ch) {
            if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
            var sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = ch;
            sp.style.animationDelay = (start + i++ * step) + 'ms'; frag.appendChild(sp);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('ch')) walk(n);
      });
    })(el);
    return start + i * step;
  }
  var quillEl = null, quillTimers = [];
  function quill(el, start, step) {
    if (!quillEl) { quillEl = document.createElement('img'); quillEl.className = 'quill'; quillEl.alt = ''; quillEl.src = ART.featherBlack; document.body.appendChild(quillEl); }
    var chars = el.querySelectorAll('.ch');
    if (!chars.length) return;
    chars.forEach(function (c, i) {
      quillTimers.push(setTimeout(function () {
        var r = c.getBoundingClientRect();
        quillEl.style.transform = 'translate(' + (r.right + scrollX - 4) + 'px,' + (r.bottom + scrollY - 46) + 'px) rotate(' + (i % 2 ? 4 : -3) + 'deg)';
        quillEl.classList.add('on');
      }, start + i * step));
    });
    quillTimers.push(setTimeout(function () { quillEl.classList.remove('on'); }, start + chars.length * step + 400));
  }
  function writeIn() {
    quillTimers.forEach(clearTimeout); quillTimers = []; if (quillEl) quillEl.classList.remove('on');
    if (reduced) return;
    var t = 60, vh = innerHeight;
    $$('.hero .verse.up p, #app h1', app).forEach(function (el) {
      var n = (el.textContent || '').length, step = Math.max(24, Math.min(60, 640 / Math.max(1, n)));
      var t0 = t; t = Math.max(t, inkify(el, step, t)); quill(el, t0, step);
    });
    var j = 0, base = Math.min(t, 700) - 250;
    $$('.summary, .page-head p, .rh-desc, .hero .verse.down p, .hero-foot p, .tower-head p, .article-body > *, .l-row, .grp-head, .infobox, .sec-head, .floor, .xs-band, .gate > .latin, .gate > h2, .gate > p', app).forEach(function (el) {
      if (j > 12) return;
      var r = el.getBoundingClientRect(); if (r.top > vh || r.bottom < 0) return;
      el.classList.add('pen'); el.style.animationDelay = (base + j++ * 60) + 'ms';
    });
  }

  setupChrome(); setupDrawer(); setupTheme(); setupAtmosphere(); setupStatus();
  window.addEventListener('hashchange', route);
  route();
  if (W.spoil === null) entryGate();
})();
