/* =========================================================
   魔天楼 ARCHIVE — app.js
   ルート：
     #/               トップ
     #/c/{カテゴリーID}  カテゴリー
     #/a/{記事ID}        記事
     #/ch/{キャラID}     キャラクター
     #/ascend[/{階}]    昇塔（天界へ）
     #/descend[/{階}]   降塔（魔界へ）
     #/articles         全記事一覧
     #/search/{語}      検索結果
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var app = $('#app');
  var SHEET_PATH = window.SHEET_PATH || { angel: 'assets/sheets/angel.svg', demon: 'assets/sheets/demon.svg', human: 'assets/sheets/human.svg' };
  var TYPE = {
    angel: { name: '天使', side: 'heaven' },
    demon: { name: '悪魔', side: 'abyss' },
    human: { name: '一般人', side: 'none' }
  };
  /* カテゴリーごとの記録コードと「どちら側か」（heaven＝天使側の冷たい光／abyss＝悪魔側の熾火／none＝人の世） */
  var CODE = { world: 'WLD', angel: 'ANG', demon: 'DEM', contract: 'CTR', rank: 'RNK', org: 'ORG', dungeon: 'SNC', battle: 'BTL', character: 'CHR', glossary: 'GLS' };
  var SIDE = { angel: 'heaven', dungeon: 'heaven', demon: 'abyss', contract: 'abyss', battle: 'abyss' };

  /* ---------- データ索引 ---------- */
  var catById = {}; CATEGORIES.forEach(function (c) { catById[c.id] = c; });
  var artById = {}; ARTICLES.forEach(function (a) { artById[a.id] = a; });
  var chById = {}; CHARACTERS.forEach(function (c) { chById[c.id] = c; });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function stripRefs(s) { return String(s || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, function (_, id, label) { return label || (artById[id] ? artById[id].title : id); }); }
  function rich(s) {
    return esc(s).replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, function (_, id, label) {
      var a = artById[id], text = label || (a ? a.title : id);
      return a ? '<a class="ref" href="#/a/' + id + '">' + text + '</a>' : '<a class="ref missing" title="この節はまだ記されていない">' + text + '</a>';
    });
  }
  function side(catId) { return 'side-' + (SIDE[catId] || 'none'); }
  function catIcon(c, cls) { return icon(c.icon, cls); }
  function byDateDesc(a, b) { return (b.updated || '').localeCompare(a.updated || '') || a.title.localeCompare(b.title, 'ja'); }
  function articlesIn(catId) { var w = window.__W || {}; return ARTICLES.filter(function (a) { return a.cat === catId && (!a.deep || (w.deep && w.spoil === true)) && (!a.spoiler || w.spoil === true); }); }
  function pad(n) { return ('00' + n).slice(-3); }
  /* 章と節：カテゴリーが「章」、記事が「節」。漢数字で振る */
  function kan(n) { var d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']; if (n < 10) return d[n]; if (n < 20) return '十' + d[n - 10]; return d[Math.floor(n / 10)] + '十' + d[n % 10]; }
  function chapterNo(catId) { return CATEGORIES.indexOf(catById[catId]) + 1; }
  function chapter(catId) { return '第' + kan(chapterNo(catId)) + '章'; }
  function recCode(a) { var list = articlesIn(a.cat); return chapter(a.cat) + '　第' + kan(list.indexOf(a) + 1) + '節'; }
  /* 見出しの右に薄く置く印（天使側＝白い翼／悪魔側＝黒い翼／人の世＝門の輪郭） */
  /* 見出しの右に置く印：キャラクターシートの紋章（天使／悪魔／一般人） */
  function sigil(sideName) {
    var k = sideName === 'heaven' ? 'angel' : sideName === 'abyss' ? 'demon' : 'human';
    return '<span class="sigil ' + (sideName || 'none') + '" aria-hidden="true">' + emblem(k) + '</span>';
  }
  /* 七つの大罪・階級の紋章。drawn を付けると、魔天楼のタイトルのように線で描かれてから満ちる */
  function embOfArticle(id) {
    if (SIN_EMB.indexOf(id) >= 0) return [id];
    var m = /^rank-(ka|rei|mei|ou|tsukasa|kami)$/.exec(id); if (!m) return null;
    return ['a-' + m[1], 'd-' + m[1]].filter(function (k) { return EMBLEMS[k]; });   // 天使と悪魔、それぞれの紋章
  }
  function embOfKind(text) { for (var i = 0; i < KINDS.length; i++) if (text && String(text).indexOf(KINDS[i][1]) >= 0) return KINDS[i][0]; return ''; }
  function drawn(id, delay) {
    var ids = [].concat(id);
    return ids.map(function (k, i) { return '<span class="emb-wrap" style="--d:' + ((delay || 0) + i * 0.5) + 's">' + emblem(k, 'drawn') + '</span>'; }).join('');
  }
  function divider(kind) { return '<div class="wrap divider ' + (kind || 'heaven') + '" aria-hidden="true">' + emblem(kind === 'abyss' ? 'orn-demon' : 'orn-angel') + '</div>'; }
  function badge(c) { return '<span class="badge ' + side(c.id) + '">' + esc(c.name) + '</span>'; }
  function countOf(c) { return c.id === 'character' ? CHARACTERS.length : c.id === 'glossary' ? GLOSSARY.length : articlesIn(c.id).length; }

  /* ---------- 共通パーツ ---------- */
  function listRow(a) {
    return '<a class="l-row ' + side(a.cat) + '" href="#/a/' + a.id + '"><span class="code">' + recCode(a) + '</span>' +
      '<h3>' + esc(a.title) + (a.reading ? '<small>' + esc(a.reading) + '</small>' : '') + '</h3><p>' + esc(stripRefs(a.summary)) + '</p></a>';
  }
  function crumbs(list) {
    return '<nav class="crumbs wrap" aria-label="現在地"><a href="#/">魔天楼</a>' + list.map(function (x) {
      return '<span>/</span>' + (x.href ? '<a href="' + x.href + '">' + esc(x.t) + '</a>' : '<span>' + esc(x.t) + '</span>');
    }).join('') + '</nav>';
  }
  function sheet(ch) {
    var top = ch.type === 'demon' ? ch.contract : ch.affiliation;
    var bottom = ch.type === 'demon' ? ch.kind : ch.type === 'angel' ? ch.hierarchy : '';
    var rank = ch.type === 'human' ? '' : ch.rank;
    var look = ch.image ? '<img src="' + esc(ch.image) + '" alt="' + esc(ch.name) + 'の見た目">' : '<div class="txt">' + esc(ch.appearance || '') + '</div>';
    return '<div class="sheet ' + ch.type + '" style="background-image:url(\'' + SHEET_PATH[ch.type] + '\')" role="img" aria-label="' + esc(ch.name) + 'のキャラクターシート">' +
      '<div class="f name">' + esc(ch.name) + '</div><div class="f aff">' + esc(top || '') + '</div>' +
      '<div class="f rank">' + esc(rank || '') + '</div><div class="f kind">' + esc(bottom || '') + '</div>' +
      '<div class="f look">' + look + '</div><div class="f set">' + esc(ch.setting || '') + '</div></div>';
  }
  function logoGradient() {
    // 上（天使の翼）は冷たい光、下（悪魔の翼）は熾火へ
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="logoGrad" gradientUnits="userSpaceOnUse" x1="0" y1="46" x2="0" y2="313">' +
      '<stop offset="0" style="stop-color:var(--heaven)"/><stop offset=".40" style="stop-color:var(--text)"/><stop offset=".64" style="stop-color:var(--text)"/><stop offset="1" style="stop-color:var(--abyss)"/>' +
      '</linearGradient></defs></svg>';
  }

  /* ---------- トップ ---------- */
  function renderHome() {
    var recent = ARTICLES.slice().sort(byDateDesc).slice(0, 6);
    var H = TOWER.heaven, A = TOWER.abyss;
    var gauge =
      '<a class="g-row gate up" href="#/ascend/gate"><span class="no">門</span><b>' + miniDoor('heaven') + esc(H.gate.name) + '</b><small class="latin">' + esc(H.gate.latin) + '</small></a>' +
      H.floors.slice().reverse().map(function (f, i, arr) {
        return '<a class="g-row up" style="--t:' + ((arr.length - i) / arr.length).toFixed(2) + '" href="#/ascend/' + f.floor + '"><span class="no">' + f.floor + '</span><b>' + esc(f.name) + '</b><small>' + (f.choirs ? '九つの階位' : '') + '</small></a>';
      }).join('') +
      '<a class="g-row ground" href="#/a/world-overview"><span class="no">G</span><b>地上 ── 人の世</b><small>喰われ、契り、戦う者の層</small></a>' +
      A.floors.map(function (f, i, arr) {
        return '<a class="g-row down' + (f.unknown ? ' unknown' : '') + '" style="--t:' + ((i + 1) / arr.length).toFixed(2) + '" href="#/descend/' + f.floor + '"><span class="no">' + f.floor + '</span><b>' + esc(f.name) + '</b><small>' + (f.unknown ? '未確認' : '') + '</small></a>';
      }).join('') +
      '<a class="g-row gate down" href="#/descend/gate"><span class="no">門</span><b>' + miniDoor('abyss') + esc(A.gate.name) + '</b><small class="latin">' + esc(A.gate.latin) + '</small></a>';

    app.innerHTML = logoGradient() +
      '<section class="wrap hero">' +
        '<span class="axis-line" aria-hidden="true"></span>' +
        '<div class="side-v l">人の世は、その間にある。</div>' +
        '<div class="hero-center">' +
          '<div class="verse up"><p>天使は、人を喰らう。</p><span class="latin">angeli homines devorant</span></div>' +
          '<div class="mark">' + rose('halo-rose', 'line') + logoSvg('drawn', 'url(#logoGrad)') + '</div>' +
          '<div class="verse down"><p>悪魔は、人と契約する。</p><span class="latin">daemones cum hominibus paciscuntur</span></div>' +
        '</div>' +
        '<div class="side-v r latin">Turris inter Caelum et Infernum</div>' +
      '</section>' +
      '<div class="wrap hero-foot">' +
        '<p>' + esc(SITE.lead).replace(/\n/g, '<br>') + '</p>' +
        '<div class="go"><a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>昇る</a><a class="link-arrow down" href="#/descend"><span class="dir">↓</span>潜る</a></div>' +
        '<span></span>' +
      '</div>' +

      divider('heaven') +
      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>壱</b><i>Circulus Animarum</i></span><h2>魂の循環</h2><a class="more" href="#/a/soul-cycle">この節を読む</a></div>' +
        '<div class="cycle"><div class="txt">' +
          '<p class="big">天使に殺された人は、天使になる。<br>天使が殺されると、その魂は人へ還る。</p>' +
          '<p style="color:var(--muted)">天使を討つことは、かつて喰われた誰かを人へ戻すことでもある。天使を裏切った悪魔は人の側に立ち、契約によって力を貸す。高位の悪魔が会得する人の姿は、その悪魔の前世の姿とされる。</p>' +
          actions('angel') +
        '</div>' + cycleDiagram() + '</div></section>' +

      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>弐</b><i>Gradus Turris</i></span><h2>塔の階層</h2><span></span></div>' +
        '<div class="strata"><div class="txt">' +
          '<p>' + esc(TOWER.ground.text) + '</p>' +
          '<p style="color:var(--muted);font-size:14px">高く昇るほど、天使は強く、賢くなる。頂には神への扉がある。<br>深く潜るほど、悪魔は強くなる。底には魔神への扉がある。</p>' +
          '<div class="go"><a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>天界へ昇る</a><a class="link-arrow down" href="#/descend"><span class="dir">↓</span>魔界へ潜る</a></div>' +
        '</div><div class="gauge" aria-label="塔の断面">' + gauge + '</div></div></section>' +

      divider('abyss') +
      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>参</b><i>Index Libri</i></span><h2>目次</h2><a class="more" href="#/articles">すべての節</a></div><div class="index">' +
      CATEGORIES.map(function (c) {
        return '<a class="ix-row ' + side(c.id) + '" href="#/c/' + c.id + '"><span class="code">' + chapter(c.id) + '</span>' +
          '<h3>' + esc(c.name) + '<small>' + esc(c.la || '') + '</small></h3><p>' + esc(c.desc) + '</p><span class="n">' + countOf(c) + '<small>' + (c.id === 'glossary' ? '語' : c.id === 'character' ? '名' : '節') + '</small></span></a>';
      }).join('') + '</div></section>' +

      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>肆</b><i>Nuper Scripta</i></span><h2>新たに記された節</h2><a class="more" href="#/articles">すべての節</a></div><div class="recent">' +
      recent.map(function (a) { var c = catById[a.cat]; return '<a href="#/a/' + a.id + '"><span class="date">' + esc(a.updated) + '</span><span>' + badge(c) + '</span><span><span class="t">' + esc(a.title) + '</span><span class="s">' + esc(stripRefs(a.summary)) + '</span></span></a>'; }).join('') +
      '</div></section>' +
      divider('abyss') +
      '<section class="wrap section"><div class="sec-head"><span class="kicker"><b>伍</b><i>Horologium</i></span><h2>世界の時計</h2><a class="more" href="#/horologium">時計の節</a></div>' + clockBlock(false) + '</section>';
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
  // 薔薇窓（tone: 'glass'＝ステンドグラス／'line'＝線だけ）
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
  // 門（尖頭アーチの輪郭だけのシンプルなゲート）
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
  var ART = window.ART_PATH || {
    featherWhite: 'assets/img/feather-white.svg', featherBlack: 'assets/img/feather-black.svg'
  };
  var WING = window.WING_PATH || { angel: 'assets/img/wing-angel.svg', demon: 'assets/img/wing-demon.svg', demonRaised: 'assets/img/wing-demon-raised.svg' };
  // 三対の翼。p = 上・中・下の三対
  function wings(kind) {
    var pairs = kind === 'heaven'
      ? [['up', WING.angel], ['mid', WING.angel], ['low', WING.angel]]
      : [['up', WING.demonRaised], ['mid', WING.demon], ['low', WING.demon]];
    return '<div class="wings six">' + pairs.map(function (p) {
      return '<span class="w l ' + p[0] + '"><img src="' + p[1] + '" alt=""></span><span class="w r ' + p[0] + '"><img src="' + p[1] + '" alt=""></span>';
    }).join('') + '</div>';
  }
  // 粒子（天界＝舞い落ちる羽根／魔界＝昇る火の粉）
  function particles(kind, n) {
    var s = '<div class="particles ' + kind + '" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var fe = kind === 'feathers' || kind === 'blackfeathers' || kind === 'feathermass';
      var x = (rnd(i + 1) * 100).toFixed(1), dl = (rnd(i + 7) * -18).toFixed(1), du = (12 + rnd(i + 3) * 14).toFixed(1), sz = (fe ? 14 + rnd(i + 5) * 22 : 2 + rnd(i + 5) * 3).toFixed(1);
      // 羽根はいただいた羽根の素材（白い羽根は黒い羽根から作ったもの）
      s += '<i style="--x:' + x + '%;--d:' + dl + 's;--u:' + du + 's;--s:' + sz + 'px;--r:' + Math.round(rnd(i + 9) * 360) + 'deg">' +
        (fe ? '<img src="' + (kind === 'blackfeathers' ? ART.featherBlack : ART.featherWhite) + '" alt="">' : '') + '</i>';
    }
    return s + '</div>';
  }

  /* ---------- 塔（昇塔・降塔） ---------- */
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  function floorLinks(ids) {
    return '<div class="links">' + (ids || []).filter(function (id) { return artById[id]; }).map(function (id) { return '<a href="#/a/' + id + '">' + esc(artById[id].title) + '</a>'; }).join('') + '</div>';
  }
  /* 階の紋章：昇塔は天使の階級、降塔は悪魔の階級の紋章（階に近づくと描かれる） */
  function floorEmb(f, kind) {
    var id = RANK_ID[f.name], k = id ? (kind === 'heaven' ? 'a-' : 'd-') + id : '';
    return k && EMBLEMS[k] ? '<span class="fl-emb ' + (kind === 'heaven' ? 'ang' : 'dem') + '" aria-hidden="true">' + emblem(k, 'drawn') + '</span>' : '';
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
      ? '<div class="gate-stage heaven-stage">' + particles('feathers', 16) + wings('heaven') + gateShape('heaven') + '</div>'
      : '<div class="gate-stage abyss-stage">' + particles('embers', 26) + '<span class="smoke s1"></span><span class="smoke s2"></span><span class="smoke s3"></span>' + wings('abyss') + gateShape('abyss') + '</div>';
    var text = '<div class="latin">' + esc(g.latin) + '</div><h2>' + esc(g.name) + '</h2><p>' + esc(g.text) + '</p>' + floorLinks(g.links) +
      '<p class="gate-state ' + (deepOpen() ? 'open' : '') + '">' + esc(deepOpen() ? WD.deep.openText : (W.deep ? '核心を伏せて読んでいるため、門は閉ざされている。' : WD.deep.lockedText)) + '</p>' +
      (deepOpen() ? '<a class="link-arrow ' + (kind === 'heaven' ? 'up' : 'down') + '" href="#/deep"><span class="dir">' + (kind === 'heaven' ? '↑' : '↓') + '</span>門の向こうへ</a>' : '') +
      (kind === 'heaven' ? actions('angel') : actions('demon'));
    return '<section class="gate ' + kind + '-gate" id="fl-gate" data-floor="gate">' + (kind === 'heaven' ? stage + text : text + stage) + '</section>';
  }
  function renderTower(kind, target) {
    var heaven = kind === 'heaven', T = heaven ? TOWER.heaven : TOWER.abyss;
    var ground = '<section class="ground-floor" id="fl-G" data-floor="G"><span class="kicker"><i>Terra</i></span><h2>地上</h2><p>' + esc(TOWER.ground.text) + '</p>' +
      '<div class="row">' + (heaven ? '<a class="link-arrow down" href="#/descend"><span class="dir">↓</span>魔界へ潜る</a>' : '<a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>天界へ昇る</a>') + '<a class="link-arrow" href="#/">トップへ</a></div></section>';
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
    var floors = app.querySelectorAll('.floor');
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); } }); }, { threshold: .35 });
      floors.forEach(function (el) { seen.observe(el); });
    } else floors.forEach(function (el) { el.classList.add('seen'); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) meter.querySelectorAll('a').forEach(function (a) { a.classList.toggle('on', a.dataset.to === e.target.dataset.floor); }); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      app.querySelectorAll('[data-floor]').forEach(function (el) { io.observe(el); });
    }
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
    tower.querySelectorAll('.floor').forEach(function (el) {
      var t = 1 - (el.offsetTop + el.offsetHeight / 2) / H; // 0=下 1=上
      var light = t > 0.5;
      el.style.setProperty('--f-ink', light ? '#1b1a20' : '#ece8e2');
      el.style.setProperty('--f-muted', light ? '#4a4a58' : '#a9a4ad');
    });
  }
  window.addEventListener('resize', tintFloors);

  /* ---------- カテゴリー ---------- */
  function renderCategory(id) {
    var c = catById[id]; if (!c) return renderNotFound();
    var head = crumbs([{ t: c.name }]) +
      '<header class="wrap page-head ' + side(id) + '">' + sigil(SIDE[id]) + '<div><div class="code">' + chapter(id) + '<i>' + esc(c.la || '') + '</i></div><h1>' + esc(c.name) + '</h1><p>' + esc(c.desc) + '</p></div>' +
      '<div class="count">' + countOf(c) + '<small>' + (id === 'glossary' ? '語' : id === 'character' ? '名' : '節') + '</small></div></header>';
    var body = '';
    if (c.renderMode === 'character') body = characterList();
    else if (c.renderMode === 'glossary') body = glossaryList();
    else {
      body += actions(ctxOf(id));
      if (id === 'angel' || id === 'demon' || id === 'rank') body += towerNote(id);
      if (c.renderMode === 'rank' && window.RANKS) body += rankLadder();
      var list = articlesIn(id);
      body += list.length ? '<div class="list">' + list.map(listRow).join('') + '</div>' : '<div class="empty">まだ記事がありません。</div>';
    }
    app.innerHTML = head + '<section class="wrap ' + side(id) + '">' + body + '</section>';
    bindCategory();
  }
  function towerNote(id) {
    var up = '<a class="link-arrow up" href="#/ascend"><span class="dir">↑</span>天界へ昇る</a>', dn = '<a class="link-arrow down" href="#/descend"><span class="dir">↓</span>魔界へ潜る</a>';
    var text = id === 'angel' ? '天使の階級は、塔の上へ続いている。' : id === 'demon' ? '悪魔の階級は、塔の下へ続いている。' : '天使の階級は塔の上へ、悪魔の階級は塔の下へ続いている。';
    return '<div class="tower-note"><p>' + text + '</p><div style="display:flex;gap:28px">' + (id === 'rank' ? up + dn : id === 'angel' ? up : dn) + '</div></div>';
  }
  function rankLadder() {
    return '<div class="rank-ladder">' + RANKS.map(function (r) {
      return '<a class="rank-row" href="#/a/' + r.id + '"><span class="name">' + esc(r.name) + '</span>' +
        '<span><span class="power">' + esc(r.power) + (r.note ? '<small style="color:var(--muted);margin-left:10px">' + esc(r.note) + '</small>' : '') + '</span><span class="bar"><i style="width:' + (r.level / 6 * 100).toFixed(1) + '%"></i></span></span>' +
        '<span class="who"><span class="badge side-heaven ' + (r.angel ? '' : 'off') + '">天使</span><span class="badge side-abyss ' + (r.demon ? '' : 'off') + '">悪魔</span></span></a>';
    }).join('') + '</div>';
  }
  /* キャラクター：元のキャラシの配置（名前・所属/契約・階級と紋章・種類・見た目・設定）を、サイトの空気に合わせて引き直したもの */
  function forms(ch) { return ch.forms && ch.forms.length ? ch.forms : [{ rank: ch.rank || '', image: ch.image || '' }]; }
  function curForm(ch) { var f = forms(ch); return ch.current != null ? ch.current : f.length - 1; }
  function val(v) { return v ? esc(v) : '<span class="unwritten">まだ記されていない</span>'; }
  function csheet(ch, fi) {
    var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), f = fs[fi] || fs[0];
    var top = ch.type === 'demon' ? ['契約', 'Pactum', ch.contract] : ['所属', 'Ordo', ch.affiliation];
    var low = ch.type === 'demon' ? ['種類', 'Genus', ch.kind] : ch.type === 'angel' ? ['階位', 'Chorus', ch.hierarchy] : null;
    var re = ch.type === 'angel' && RANK_ID[f.rank] && EMBLEMS['a-' + RANK_ID[f.rank]] ? 'a-' + RANK_ID[f.rank] : ch.type === 'demon' ? sealKey(f.rank, embOfKind(ch.kind)) : '', ke = '';
    return '<div class="csheet side-' + t.side + ' t-' + ch.type + '">' +
      '<div class="cs-cell cs-name"><span class="lb">名前<i>Nomen</i></span><b>' + esc(ch.name) + '</b></div>' +
      '<div class="cs-band">' + emblem(ch.type === 'demon' ? 'orn-demon' : ch.type === 'angel' ? 'orn-angel' : 'orn-human', 'orn') +
        (ch.type === 'human' ? '' : '<span class="lb">階級</span><b class="cs-rank">' + val(f.rank) + '</b>') +
        '<span class="cs-seal">' + (re ? drawn(re) : emblem(ch.type)) + '</span>' +
        (low ? '<span class="lb">' + low[0] + '</span><b>' + val(low[2]) + '</b>' : '') + (ke ? '<span class="cs-kind">' + drawn(ke, .4) + '</span>' : '') +
        emblem(ch.type === 'demon' ? 'orn-demon' : ch.type === 'angel' ? 'orn-angel' : 'orn-human', 'orn flip') + '</div>' +
      '<div class="cs-cell cs-aff"><span class="lb">' + top[0] + '<i>' + top[1] + '</i></span><b>' + val(top[2]) + '</b></div>' +
      '<div class="cs-cell cs-look"><span class="lb">見た目<i>Species</i></span>' +
        (f.image ? '<figure><img class="cs-img" src="' + esc(f.image) + '" alt="' + esc(ch.name) + '（' + esc(f.rank) + '）の姿"></figure>' : '') +
        (ch.appearance ? '<p>' + esc(ch.appearance) + '</p>' : (f.image ? '' : '<p>' + val('') + '</p>')) + '</div>' +
      '<div class="cs-cell cs-set"><span class="lb">設定<i>Historia</i></span><p>' + val(ch.setting) + '</p></div>' +
    '</div>';
  }
  function characterList() {
    var types = ['angel', 'human', 'demon'].filter(function (k) { return CHARACTERS.some(function (c) { return c.type === k; }); });
    var f = types.length > 1 ? '<div class="ch-filter" role="group" aria-label="種別で絞り込む"><button type="button" data-type="" aria-pressed="true">すべて</button>' +
      types.map(function (k) { return '<button type="button" data-type="' + k + '" aria-pressed="false">' + TYPE[k].name + '</button>'; }).join('') + '</div>' : '';
    if (!CHARACTERS.length) return '<div class="empty">まだ、この塔に名を残すものはいない。</div>';
    return f + '<div class="ch-grid">' + CHARACTERS.map(function (ch) {
      var t = TYPE[ch.type] || TYPE.human, fs = forms(ch), fm = fs[curForm(ch)];
      if (ch.spoiler && !spoilOK()) return '<div class="ch-card veiled"><figure></figure><div class="cap"><b>伏せられた名</b><span class="badge">核心</span></div></div>';
      return '<a class="ch-card side-' + t.side + '" data-type="' + ch.type + '" href="#/ch/' + ch.id + '"><figure>' + (fm.image ? '<img src="' + esc(fm.image) + '" alt="">' : emblem(ch.type)) + '</figure>' +
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
    return '<div class="gl-filter" role="group" aria-label="行で絞り込む"><button type="button" data-row="" aria-pressed="true">すべて</button>' + keys.map(function (k) { return '<button type="button" data-row="' + k + '" aria-pressed="false">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="glossary">' + keys.map(function (k) {
        return '<div class="gl-group" data-row="' + k + '"><h2>' + k + '</h2><dl>' + groups[k].map(function (g) {
          return '<dt>' + esc(g.term) + '</dt><dd>' + esc(g.desc) + (g.id && artById[g.id] ? '　<a href="#/a/' + g.id + '">節へ →</a>' : '') + '</dd>';
        }).join('') + '</dl></div>';
      }).join('') + '</div>';
  }
  function bindCategory() {
    app.querySelectorAll('.ch-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        app.querySelectorAll('.ch-filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var t = b.dataset.type;
        app.querySelectorAll('.ch-card').forEach(function (card) { card.hidden = !!t && card.dataset.type !== t; });
      });
    });
    app.querySelectorAll('.gl-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        app.querySelectorAll('.gl-filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var r = b.dataset.row;
        app.querySelectorAll('.gl-group').forEach(function (g) { g.hidden = !!r && g.dataset.row !== r; });
      });
    });
  }

  /* ---------- 記事 ---------- */
  function renderArticle(id) {
    var a = artById[id]; if (!a) return renderNotFound();
    var c = catById[a.cat] || {};
    if ((a.spoiler && !spoilOK()) || (a.deep && !deepOpen())) { app.innerHTML = crumbs([{ t: c.name, href: '#/c/' + c.id }, { t: '伏せられた節' }]) + '<section class="wrap section"><div class="empty">この節は、物語の核心に触れるため伏せられている。</div></section>'; return; }
    var sections = (a.sections || []).map(function (s) {
      if (s.spoiler && !spoilOK()) return '<div class="veiled-sec"><span class="latin">Velatum</span><b>伏せられた記述</b><p>ここから先には、物語の核心が記されている。</p></div>';
      var h = '';
      if (s.h) h += '<h2>' + esc(s.h) + '</h2>';
      (s.p || []).forEach(function (p) { h += '<p>' + rich(p) + '</p>'; });
      if (s.list) h += '<ul>' + s.list.map(function (l) { return '<li>' + rich(l) + '</li>'; }).join('') + '</ul>';
      if (s.table) h += '<div class="table-wrap"><table><thead><tr>' + s.table.head.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        s.table.rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + rich(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      if (s.warn) h += '<div class="callout warn">' + rich(s.warn) + '</div>';
      if (s.note) h += '<div class="callout note">' + rich(s.note) + '</div>';
      return h;
    }).join('');
    var ae = embOfArticle(a.id);
    var headIcon = ae ? drawn(ae) : a.cat === 'angel' ? emblem('angel') : a.cat === 'demon' ? emblem('demon') : catIcon(c);
    var info = '<aside class="infobox"><div class="ib-head">' + headIcon + '<span><span class="mono">' + recCode(a) + '</span><b>' + esc(a.title) + '</b></span></div>' +
      (a.info && a.info.length ? '<dl>' + a.info.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + rich(r[1]) + '</dd>'; }).join('') + '</dl>' : '') +
      '<div class="ib-foot">' + chapter(a.cat) + '　' + esc(c.name) + '<br>' + esc(a.updated) + ' 記</div></aside>';
    var rel = (a.related || []).map(function (r) { return artById[r]; }).filter(Boolean);
    var sib = articlesIn(a.cat), i = sib.indexOf(a), prev = sib[i - 1], next = sib[i + 1];
    app.innerHTML = crumbs([{ t: c.name, href: '#/c/' + c.id }, { t: a.title }]) +
      '<article class="wrap article ' + side(a.cat) + '">' +
        '<header class="article-head">' + (ae ? '<span class="sigil big ' + (SIDE[a.cat] || 'none') + '" aria-hidden="true">' + drawn(ae) + '</span>' : sigil(SIDE[a.cat])) + '<div class="meta"><span class="code">' + recCode(a) + '</span><span>' + esc(c.name) + '<i class="latin"> ' + esc(c.la || '') + '</i></span><span>' + esc(a.updated) + ' 記</span></div>' +
        '<h1>' + esc(a.title) + '</h1>' + (a.reading ? '<div class="reading">' + esc(a.reading) + '</div>' : '') +
        '<p class="summary">' + rich(a.summary) + '</p></header>' +
        '<div class="article-body">' + sections + actions(ctxOf(a.cat, a.id)) + '</div>' + info + '</article>' +
      // 関連と前後は本文の段組みの外に置く（右の情報欄と重ならないように）
      '<div class="wrap article-foot ' + side(a.cat) + '">' +
        (rel.length ? '<section class="related"><h2>この節と結ばれた節</h2><div class="list">' + rel.map(listRow).join('') + '</div></section>' : '') +
        '<nav class="pager" aria-label="同じカテゴリーの前後の記事">' +
          (prev ? '<a href="#/a/' + prev.id + '"><small>← 前の節</small><b>' + esc(prev.title) + '</b></a>' : '<span></span>') +
          (next ? '<a class="next" href="#/a/' + next.id + '"><small>次の節 →</small><b>' + esc(next.title) + '</b></a>' : '<span></span>') +
        '</nav></div>';
  }

  /* ---------- キャラクター ---------- */
  function renderCharacter(id) {
    var ch = chById[id]; if (!ch) return renderNotFound();
    if (ch.spoiler && !spoilOK()) { app.innerHTML = crumbs([{ t: 'キャラクター', href: '#/c/character' }, { t: '伏せられた名' }]) + '<section class="wrap section"><div class="empty">この名は、物語の核心に触れるため伏せられている。</div></section>'; return; }
    var t = TYPE[ch.type] || TYPE.human, c = catById.character, fs = forms(ch), fi = curForm(ch);
    var rel = (ch.related || []).map(function (r) { return artById[r]; }).filter(Boolean);
    var tabs = fs.length > 1 ? '<div class="form-tabs" role="tablist" aria-label="階級ごとの姿">' + fs.map(function (f, i) {
      return '<button type="button" role="tab" data-fi="' + i + '" aria-selected="' + (i === fi) + '"><b>' + esc(f.rank) + '</b><small>' + ROMAN[i + 1] + '</small></button>';
    }).join('<span class="arrow">→</span>') + '</div>' : '';
    app.innerHTML = crumbs([{ t: c.name, href: '#/c/character' }, { t: ch.name }]) +
      '<div class="wrap ch-page side-' + t.side + '">' +
        '<header class="article-head">' + sigil(t.side) + '<div class="meta"><span class="code">' + chapter('character') + '　第' + kan(CHARACTERS.indexOf(ch) + 1) + '名</span><span>' + t.name + '</span></div>' +
          '<h1>' + esc(ch.name) + '</h1>' + (ch.reading ? '<div class="reading">' + esc(ch.reading) + '</div>' : '') +
          (fs.length > 1 ? '<p class="summary">階級が上がるにつれて、その姿は変わっていく。</p>' : '') + '</header>' +
        tabs + '<div id="csheet-slot">' + csheet(ch, fi) + '</div>' +
        (rel.length ? '<section class="related"><h2>この名と結ばれた節</h2><div class="list">' + rel.map(listRow).join('') + '</div></section>' : '') +
      '</div>';
    app.querySelectorAll('.form-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.fi;
        app.querySelectorAll('.form-tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
        var slot = $('#csheet-slot'); slot.innerHTML = csheet(ch, i); slot.firstChild.classList.add('swap');
      });
    });
  }

  /* ---------- 全記事一覧 ---------- */
  var listState = { sort: 'date', cat: '' };
  function renderAll() {
    var list = ARTICLES.filter(function (a) { return !listState.cat || a.cat === listState.cat; });
    if (listState.sort === 'date') list.sort(byDateDesc);
    else if (listState.sort === 'name') list.sort(function (a, b) { return a.title.localeCompare(b.title, 'ja'); });
    else list.sort(function (a, b) { return CATEGORIES.indexOf(catById[a.cat]) - CATEGORIES.indexOf(catById[b.cat]); });
    app.innerHTML = crumbs([{ t: 'すべての節' }]) +
      '<header class="wrap page-head">' + sigil('none') + '<div><div class="code">Omnia<i>Liber Matenrou</i></div><h1>すべての節</h1><p>この書に記された、すべての節。</p></div><div class="count">' + ARTICLES.length + '<small>節</small></div></header>' +
      '<section class="wrap"><div class="toolbar"><label for="sort">並び</label><select id="sort"><option value="date">新しく記された順</option><option value="name">名の順</option><option value="cat">章の順</option></select>' +
      '<label for="catf">章</label><select id="catf"><option value="">すべて</option>' + CATEGORIES.filter(function (c) { return articlesIn(c.id).length; }).map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="list" style="border-top:1px solid var(--line-2)">' + list.map(listRow).join('') + '</div></section>';
    $('#sort').value = listState.sort; $('#catf').value = listState.cat;
    $('#sort').onchange = function () { listState.sort = this.value; renderAll(); };
    $('#catf').onchange = function () { listState.cat = this.value; renderAll(); };
  }

  /* ---------- 検索 ---------- */
  function buildIndex() {
    var idx = [];
    ARTICLES.forEach(function (a) {
      var body = (a.sections || []).map(function (s) { return [s.h, (s.p || []).join(' '), (s.list || []).join(' '), s.table ? s.table.rows.join(' ') : '', s.warn, s.note].join(' '); }).join(' ');
      idx.push({ deep: !!a.deep, spoiler: !!a.spoiler, kind: '節', side: side(a.cat), href: '#/a/' + a.id, title: a.title, sub: stripRefs(a.summary),
        key: a.title + ' ' + (a.reading || ''), keywords: (a.keywords || []).join(' ') + ' ' + (a.info || []).join(' '), body: stripRefs(body) });
    });
    GLOSSARY.forEach(function (g) {
      idx.push({ kind: '用語', side: 'side-none', href: g.id && artById[g.id] ? '#/a/' + g.id : '#/c/glossary', title: g.term, sub: g.desc, key: g.term + ' ' + (g.reading || ''), keywords: '', body: g.desc });
    });
    CHARACTERS.forEach(function (c) {
      idx.push({ kind: '人物', side: 'side-' + TYPE[c.type].side, href: '#/ch/' + c.id, title: c.name, sub: TYPE[c.type].name + ' ' + (c.rank || ''), key: c.name + ' ' + (c.reading || ''), keywords: [c.affiliation, c.contract, c.rank, c.kind, c.hierarchy].join(' '), body: (c.appearance || '') + ' ' + (c.setting || '') });
    });
    return idx;
  }
  var INDEX = buildIndex();
  function search(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    return INDEX.filter(function (e) { return (!e.deep || deepOpen()) && (!e.spoiler || spoilOK()); }).map(function (e) {
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
        return '<a class="result ' + e.side + '" href="' + e.href + '"><span class="badge">' + e.kind + '</span><span style="min-width:0"><b>' + hl(e.title, q) + '</b><p>' + snippet(e, q) + '</p></span></a>';
      }).join('') : '<div class="empty">その名は、この書のどこにも記されていない。</div>') + '</div></section>';
  }
  function setupSearch() {
    var input = $('#q'), box = $('#suggest'), sel = -1, items = [];
    function close() { box.hidden = true; sel = -1; }
    function draw() {
      var q = input.value.trim();
      items = q ? search(q).slice(0, 8) : [];
      if (!items.length) { box.innerHTML = q ? '<div style="padding:10px;color:var(--muted);font-size:13px">記されていない</div>' : ''; box.hidden = !q; return; }
      box.innerHTML = items.map(function (e, i) { return '<a href="' + e.href + '" class="' + e.side + (i === sel ? ' sel' : '') + '"><span class="badge">' + e.kind + '</span><span class="t">' + hl(e.title, q) + '</span><span class="s">' + esc(e.sub) + '</span></a>'; }).join('');
      box.hidden = false;
    }
    input.addEventListener('input', function () { sel = -1; draw(); });
    input.addEventListener('focus', draw);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); draw(); ev.preventDefault(); }
      else if (ev.key === 'ArrowUp') { sel = Math.max(sel - 1, -1); draw(); ev.preventDefault(); }
      else if (ev.key === 'Escape') { close(); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        var q = input.value.trim(); if (!q) return;
        location.hash = sel >= 0 && items[sel] ? items[sel].href : '#/search/' + encodeURIComponent(q);
        close(); input.blur();
      }
    });
    box.addEventListener('click', function () { close(); input.value = ''; });
    document.addEventListener('click', function (ev) { if (!ev.target.closest('.search')) close(); });
  }

  function renderNotFound() {
    app.innerHTML = '<section class="wrap section"><div class="empty">この階には、何も記されていない。<br><a href="#/">地上へ戻る</a></div></section>';
  }

  /* ---------- 空気：スクロールで上の光が弱まり、下の熾火が強まる ---------- */
  function setupAtmosphere() {
    var root = document.documentElement, ticking = false;
    function update() {
      ticking = false;
      var max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
      root.style.setProperty('--up', (1 - p * 0.8).toFixed(3));
      root.style.setProperty('--down', (0.25 + p * 0.75).toFixed(3));
      root.style.setProperty('--p', p.toFixed(4));
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('hashchange', function () { requestAnimationFrame(update); });
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
    var navIds = ['world', 'angel', 'demon', 'contract', 'org', 'character'];
    $('#nav').innerHTML = '<a class="up" href="#/ascend" data-cat="ascend">↑ 昇塔</a>' + navIds.map(function (id) { var c = catById[id]; return c ? '<a href="#/c/' + id + '" data-cat="' + id + '">' + esc(c.name) + '</a>' : ''; }).join('') + '<a href="#/articles" data-cat="articles">すべての節</a><a class="down" href="#/descend" data-cat="descend">↓ 降塔</a>';
  }
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), parts = h.split('/');
    var activeCat = '', tower = false;
    if (!h) { renderHome(); bindClock(); }
    else if (parts[0] === 'c') { renderCategory(parts[1]); activeCat = parts[1]; }
    else if (parts[0] === 'a') { renderArticle(parts[1]); activeCat = (artById[parts[1]] || {}).cat; }
    else if (parts[0] === 'ch') { renderCharacter(parts[1]); activeCat = 'character'; }
    else if (parts[0] === 'articles') { renderAll(); activeCat = 'articles'; }
    else if (parts[0] === 'ascend') { tower = renderTower('heaven', parts[1]); activeCat = 'ascend'; }
    else if (parts[0] === 'descend') { tower = renderTower('abyss', parts[1]); activeCat = 'descend'; }
    else if (parts[0] === 'search') renderSearch(parts.slice(1).join('/'));
    else if (parts[0] === 'horologium') { renderHorologium(); activeCat = 'horologium'; }
    else if (parts[0] === 'deep') { renderDeep(); activeCat = 'deep'; }
    else renderNotFound();
    document.querySelectorAll('#nav a').forEach(function (a) { a.classList.toggle('active', a.dataset.cat === activeCat); });
    var t = document.querySelector('#app h1'); document.title = (h && t ? t.textContent + '｜' : '') + '魔天楼 ARCHIVE';
    if (!tower) window.scrollTo(0, 0);
    document.body.classList.toggle('in-tower', !!tower);
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
      setTimeout(function () { ov.classList.add('out'); document.documentElement.classList.remove('gate-open'); route(); }, 1500);
      setTimeout(function () { ov.remove(); }, 2600);
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
      ew.innerHTML = ['p1', 'p2', 'p3', 'p4'].map(function (k) { return '<span class="ew ' + k + '"><img src="' + src + '" alt=""></span>'; }).join('');
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
    // 異変のあと、空に残るもの（ラグナロク＝降り続ける翼／アポカリプス＝続く戦いの筋）
    var es = $('#event-sky');
    if (es && es.dataset.ev !== (W.event || '')) { es.remove(); es = null; }
    if (W.event && !es) {
      es = document.createElement('div'); es.id = 'event-sky'; es.dataset.ev = W.event; es.setAttribute('aria-hidden', 'true');
      es.innerHTML = W.event === 'ragnarok' ? seraph('linger') + particles('feathers', 26) : clash(14);
      document.body.insertBefore(es, document.body.firstChild);
    }
    var ash = $('#ash');
    if (W.event === 'apocalypse' && !ash) { var d = document.createElement('div'); d.id = 'ash'; d.innerHTML = particles('ash', 40); document.body.appendChild(d); }
    if (W.event !== 'apocalypse' && ash) ash.remove();
  }
  function journeyPanel() {
    var steps = [
      ['読む', true], ['転生する', W.reborn], ['天界へ', W.reborn], ['堕天する', W.fallen],
      ['契約する', !!W.pact], ['時を動かす', !!W.event || W.deep], ['深層へ', W.deep]
    ];
    var next = !W.reborn ? ['天使の節で「転生する」', '#/a/angel'] : !W.fallen ? ['天界の門で「堕天する」', '#/ascend/gate'] : !W.pact ? ['悪魔の章で「契約する」', '#/c/demon'] : !W.deep ? ['世界の時計の針を動かす', '#/horologium'] : ['深層の書を開く', '#/deep'];
    // 転生・堕天・契約は、ここから何度でもやり直せる
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
    tools.insertBefore(wrap, tools.firstChild);
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
    if (artId === 'angel' || artId === 'soul-cycle' || artId === 'angel-hierarchy' || catId === 'angel') return 'angel';
    if (artId === 'contract' || artId === 'price' || catId === 'contract') return 'contract';
    if (catId === 'demon') return 'demon';
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
      ov.innerHTML = '<div class="rite-sky"></div><div class="rite-wing"><img src="' + WING.angel + '" alt=""><img src="' + WING.angel + '" alt=""></div>' + particles('blackfeathers', 22) + '<div class="rite-lines"></div>' + skip;
      var apply = function () { W.form = 'demon'; W.fallen = true; };
      at(300, function () { line(r.lines[0]); });
      at(2000, function () { ov.classList.add('s2'); line(r.lines[1]); });
      at(4000, function () { ov.classList.add('s3'); line(r.lines[2]); });
      at(6200, function () { timers.forEach(clearTimeout); apply(); saveW(); whoStage(ov, r.to); });
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
      finish(name === 'rebirth' ? function () { W.form = 'angel'; W.reborn = true; } : name === 'fall' ? function () { W.form = 'demon'; W.fallen = true; } : function () {});
    };
  }

  /* --- 堕天のあと：あなたは、何者になる？（記録する／診断で決める／飛ばす） --- */
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
        body.querySelectorAll('[data-m]').forEach(function (b) {
          b.onclick = function () { var m = b.dataset.m; if (m === 'diagnose') { st.answers = []; ask(0); } else choose(); };
        });
      });
    }
    // 診断：問いに答える
    function ask(i) {
      var q = X.questions[i];
      show('<span class="latin">' + (i + 1) + ' / ' + X.questions.length + '</span><p class="who-q">' + esc(q.q) + '</p><div class="who-opts one">' +
        q.a.map(function (a, k) { return '<button type="button" data-k="' + k + '"><b>' + esc(a.t) + '</b></button>'; }).join('') + '</div>', function () {
        body.querySelectorAll('[data-k]').forEach(function (b) {
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
    // 選ぶ：七つの大罪から、自分で選ぶ
    function choose() {
      show('<p class="who-q">' + esc(X.chooseAsk) + '</p><div class="who-sins">' +
        SIN_EMB.map(function (k, n) { return '<button type="button" data-sin="' + k + '"><span class="ws-emb">' + drawn(k, 0.15 + n * 0.2) + '</span><b>' + esc(X.sins[k].name) + '</b></button>'; }).join('') + '</div>', function () {
        body.querySelectorAll('[data-sin]').forEach(function (b) {
          b.onclick = function () { result({ mode: 'choose', sin: b.dataset.sin, steps: [] }); };
        });
      });
    }
    // 結果：歩みから読み取った「何者か」
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
      document.documentElement.style.setProperty('--cu', ((1 - d12) * .7).toFixed(3));
      document.documentElement.style.setProperty('--cd', (d12 * .7).toFixed(3));
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
  // 幾千の翼：天使の翼の素材を大量に降らせる
  function wingStorm(n, cls) {
    var h = '<div class="wingstorm ' + (cls || '') + '" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var x = (rnd(i + 3) * 110 - 5).toFixed(1), sz = (40 + Math.pow(rnd(i + 11), 2) * 260).toFixed(0), dl = (rnd(i + 5) * -14).toFixed(2), du = (7 + rnd(i + 8) * 9).toFixed(1), r = (rnd(i + 13) * 50 - 25).toFixed(0);
      h += '<span style="--x:' + x + '%;--s:' + sz + 'px;--d:' + dl + 's;--u:' + du + 's;--r:' + r + 'deg;--o:' + (.35 + rnd(i + 17) * .65).toFixed(2) + '"' + (i % 2 ? ' class="m"' : '') + '><b><img src="' + WING.angel + '" alt=""></b></span>';
    }
    return h + '</div>';
  }
  // 幾千の翼を持つもの：天使の翼を同心円に重ねて一つの姿にする
  function seraph(cls, rings) {
    rings = rings || [[6, 170, 1], [9, 260, .85], [12, 350, .6], [18, 430, .32]];
    var h = '<div class="seraph ' + (cls || '') + '" aria-hidden="true"><span class="halo"></span>';
    rings.forEach(function (r, ri) {
      h += '<div class="ring" style="--dir:' + (ri % 2 ? -1 : 1) + ';--sp:' + (80 + ri * 40) + 's;opacity:' + r[2] + '">';
      for (var i = 0; i < r[0]; i++) {
        var a = (360 / r[0]) * i + (ri % 2 ? 180 / r[0] : 0);
        h += '<span style="--a:' + a.toFixed(1) + 'deg;--w:' + r[1] + 'px"><b style="animation-delay:' + (-rnd(i + ri * 40) * 3).toFixed(2) + 's"><img src="' + WING.angel + '" alt=""></b></span>';
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
      ? '<span class="god"></span>' + seraph('descend') + particles('feathermass', 150)
      : '<div class="host">' + [0, 1, 2, 3, 4].map(function (k) { return '<div class="invader iv' + k + '">' + seraph('mini', mini) + '</div>'; }).join('') + '</div>' +
        particles('feathers', 40) + clash(60) + particles('embers', 40) + '<span class="front"></span>';
    ov.innerHTML = '<div class="rite-sky"></div>' + scene +
      '<div class="rite-lines"><p class="rite-latin latin">' + esc(ev.latin) + '</p><h2 class="rite-title">' + esc(ev.title) + '</h2><p class="rite-line">' + esc(ev.text) + '</p>' + (ev.sub ? '<p class="rite-line sub">' + esc(ev.sub) + '</p>' : '') + '</div>';
    document.body.appendChild(ov);
    inkify(ov.querySelector('.rite-title'), 220, 900); inkify(ov.querySelector('.rite-line'), 80, 2400);
    var sub = ov.querySelector('.sub'); if (sub) inkify(sub, 70, 3600);
    setTimeout(function () { ov.classList.add('out'); paintWorld(); route(); setTimeout(function () { ov.remove(); }, 1200); }, 7600);
  }
  function renderHorologium() {
    app.innerHTML = crumbs([{ t: '世界の時計' }]) +
      '<header class="wrap page-head">' + sigil('none') + '<div><div class="code">Horologium<i>世界の時計</i></div><h1>世界の時計</h1><p>この世界の時を刻む針。' + (W.pact ? '契約を交わした者は、これを動かせる。' : '') + '</p></div></header>' +
      '<section class="wrap">' + clockBlock(true) + '</section>';
    bindClock();
  }

  /* --- 深層 --- */
  function renderDeep() { setTimeout(function () { var g = $('#regate'); if (g) g.onclick = entryGate; }, 0); renderDeep2(); }
  function renderDeep2() {
    var list = ARTICLES.filter(function (a) { return a.deep; });
    app.innerHTML = crumbs([{ t: WD.deep.title }]) +
      '<header class="wrap page-head">' + sigil('abyss') + '<div><div class="code">' + esc(WD.deep.latin) + '<i>' + esc(WD.deep.title) + '</i></div><h1>' + esc(WD.deep.title) + '</h1><p>' + esc(deepOpen() ? WD.deep.openText : WD.deep.lockedText) + '</p></div></header>' +
      '<section class="wrap">' + (W.deep && !spoilOK() ? '<div class="empty">深層には物語の核心が記されている。<br>いまは核心を伏せて読んでいるため、門は開かない。<br><button type="button" class="jp-open" id="regate">門をくぐり直す</button></div>' : !W.deep ? '<div class="empty">' + esc(WD.deep.lockedText) + '<br><button type="button" class="jp-open" onclick="document.getElementById(\'status\').click()">あなたの歩みを見る</button></div>'
        : list.length ? '<div class="list">' + list.map(listRow).join('') + '</div>' : '<div class="empty">' + esc(WD.deep.emptyText) + '</div>') + '</section>';
  }

  /* ---------- 開いたとき、紙に文字を書いていくように ---------- */
  // 見出しや要約は一文字ずつ墨がにじむように現れ、本文は行の頭から筆でなぞるように現れる
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
  // 羽根ペンが見出しの一文字ずつをなぞる
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
    quillTimers.push(setTimeout(function () { quillEl.classList.remove('on'); }, start + chars.length * step + 500));
  }
  function writeIn() {
    quillTimers.forEach(clearTimeout); quillTimers = []; if (quillEl) quillEl.classList.remove('on');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var t = 120;
    app.querySelectorAll('.hero .verse.up p, h1').forEach(function (el) { var t0 = t; t = Math.max(t, inkify(el, 70, t)); quill(el, t0, 70); });
    app.querySelectorAll('.summary, .page-head p, .hero .verse.down p, .hero-foot p, .tower-head p').forEach(function (el) { t = Math.max(t, inkify(el, 16, t - 200)); });
    var j = 0;
    app.querySelectorAll('.article-body > *, .l-row, .ix-row, .recent a, .rank-row, .gl-group, .infobox, .sec-head, .floor, .gate > .latin, .gate > h2, .gate > p').forEach(function (el) {
      el.classList.add('pen'); el.style.animationDelay = Math.min(t - 300 + j++ * 70, t + 1400) + 'ms';
    });
  }

  setupChrome(); setupTheme(); setupSearch(); setupAtmosphere(); setupStatus();
  window.addEventListener('hashchange', route);
  route();
  if (W.spoil === null) entryGate();
})();
