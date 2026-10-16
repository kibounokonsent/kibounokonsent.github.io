/* =========================================================
   トルサ図書館：部品を組み合わせて作る表紙（cover.parts）と、表紙をつくる画面
   ---------------------------------------------------------
   books.json の本の cover に "parts" を書くと、部品を組み合わせた表紙になります。
   （"parts" がなければ、今までどおり template の表紙です）

   "cover": {
     "color": "#2f4a7a", "accent": "#e8c26a", "textColor": "", "plateColor": "",
     "title": "題名", "subtitle": "副題", "titleDirection": "horizontal",
     "emblem": "star",
     "parts": { "base": "leather", "scene": "none", "pattern": "diamonds", "sparkle": "stars",
                "spine": "banded", "frame": "double", "corners": "metal", "band": "none",
                "emblemBase": "circle", "emblemPos": "middle",
                "plate": "plate", "titleDeco": "none", "titlePos": "bottom",
                "clasp": "none", "bookmark": "none", "finish": "none" }
   }

   選べる名前は下の PARTS（いじりやすい場所）。URL の最後に ?covers を付けて開くと、
   「表紙をつくる」画面で部品を選んで、できた表紙の書き方をコピーできます。
   本の寄贈の間（donate.html）でも、この部品で表紙を作ります。
   ========================================================= */
window.TorsaCoverParts = (H) => {
  "use strict";
  const { emblemSVG, titleSVG, fitSize, mix, star4, f1, esc, rng } = H;
  const TAU = Math.PI * 2;

  // 部品の種類（名前: 画面に出す名前）
  const PARTS = {
    base:       { label: "地（素材）", opts: { plain: "無地", leather: "革", cloth: "布", linen: "麻", velvet: "ビロード", marble: "マーブル", wood: "木目", washi: "和紙", night: "夜空", metal: "金属板", parchment: "羊皮紙", gradient: "グラデーション", twilight: "夕暮れ", stone: "石", lacquer: "漆", goldleaf: "金箔", ice: "氷", suminagashi: "墨流し", patchwork: "つぎはぎ", stained: "ステンドグラス", crackle: "ひび" } },
    scene:      { label: "背景の絵", opts: { none: "なし", mountains: "山なみ", forest: "森", sea: "海", castle: "お城", city: "街なみ", moonclouds: "月と雲", tower: "塔", flowers: "花畑", bamboo: "竹林", dunes: "砂丘", lonetree: "丘の一本木", aurora: "オーロラ", battlefield: "戦場", japanese: "和風（鳥居と富士）", western: "洋館", love: "LOVE", fantasy: "ファンタジー（浮島）", dragon: "ドラゴン", ryu: "龍", serpent: "蛇", spider: "蜘蛛の巣", rainbow: "虹", chinese: "中華風", sakuratree: "桜の木", constellation: "星座", undersea: "海の底", graveyard: "墓地とこうもり", magiccircle: "大きな魔法陣", gears: "歯車", space: "宇宙", lighthouse: "灯台", snowtown: "雪の町" } },
    pattern:    { label: "地模様", opts: { none: "なし", dots: "水玉", diamonds: "菱", stripes: "しま", waves: "青海波", stars: "星", scales: "うろこ", checks: "市松", lattice: "格子", vines: "唐草", hexes: "亀甲", rays: "放射", hearts: "ハート", crosses: "十字", asanoha: "麻の葉", shippo: "七宝", clouds: "雲", zigzag: "山形", plaid: "チェック", florets: "小花", ripples: "波紋", bricks: "れんが", triangles: "鱗文", crescents: "三日月" } },
    sparkle:    { label: "ちらし", opts: { none: "なし", stars: "星", glitter: "きらきら", petals: "花びら", sakura: "桜", bubbles: "泡", snow: "雪", rain: "雨", leaves: "木の葉", embers: "火の粉", moons: "月", hearts: "ハート", feathers: "羽根", notes: "音符", butterflies: "蝶", fireflies: "蛍", dust: "光の粒" } },
    spine:      { label: "背", opts: { none: "なし", plain: "背革", banded: "帯つき", gilt: "金の線", studs: "鋲", raised: "背バンド", stitched: "縫い目", wajitoji: "和綴じ", chain: "鎖", cloth: "布背" } },
    frame:      { label: "枠", opts: { none: "なし", single: "一本線", double: "二重線", triple: "三重線", rounded: "角丸", deco: "段々", gothic: "アーチ", dotted: "点線", rope: "縄", vine: "ツタ", filigree: "飾り枠", wave: "波線", zigzag: "ぎざぎざ", beads: "玉", chain: "鎖", greek: "雷文", thorns: "いばら", scallop: "花びら形", lace: "レース", notched: "切り欠き", nouveau: "アール・ヌーヴォー", baroque: "バロック", kasumi: "霞（和）", chinese: "中華", hearts: "ハート", stars: "星", flowers: "花", laurel: "月桂樹", runes: "ルーン文字", scales: "うろこ", serpent: "蛇", web: "蜘蛛の巣", film: "フィルム", stitch: "縫い目", stamp: "切手", brush: "筆" } },
    corners:    { label: "角の飾り", opts: { none: "なし", metal: "金具", star: "星", leaf: "葉", round: "丸鋲", filigree: "渦", gem: "宝石", bracket: "かぎ", heart: "ハート", flower: "花", moon: "月", triangle: "三角", cross: "十字", fan: "扇", wing: "羽", knot: "結び" } },
    band:       { label: "帯", opts: { none: "なし", top: "上", bottom: "下", both: "上下", middle: "まんなか", sash: "ななめ", vertical: "たて", cross: "十字", wave: "波", corner: "角", lines: "細い線", lace: "レース" } },
    emblemBase: { label: "紋章の台", opts: { none: "なし", circle: "丸", ring: "輪", diamond: "ひし形", shield: "盾", sunburst: "光", wreath: "葉の輪", window: "窓", hexagon: "六角", star: "星形", octagon: "八角", cartouche: "楕円の額", flower: "花形", gear: "歯車", magic: "魔法陣", crescent: "三日月" } },
    emblemPos:  { label: "紋章の位置", opts: { top: "上", middle: "まんなか", bottom: "下", none: "出さない" } },
    plate:      { label: "題名の札", opts: { none: "なし", plate: "金属の板", label: "紙のラベル", ribbon: "リボン", scroll: "巻物", tag: "荷札", slip: "題簽（和本）", banner: "旗", oval: "楕円", frame: "額縁", darkband: "黒い帯", emboss: "箔押し", card: "角切り", cloud: "雲形", arch: "アーチ", glass: "すりガラス" } },
    titleDeco:  { label: "題名の飾り", opts: { none: "なし", lines: "線", dots: "点", flourish: "唐草", stars: "星", diamonds: "ひし", wave: "波", brackets: "かぎ" } },
    titlePos:   { label: "題名の位置", opts: { top: "上", middle: "まんなか", bottom: "下" } },
    clasp:      { label: "留め具", opts: { none: "なし", strap: "ベルト", lock: "錠前", ribbon: "リボン", seal: "封蝋", buckle: "バックル", chain: "鎖", button: "ボタンと紐", keyhole: "鍵穴", twostraps: "ベルト二本", cord: "こはぜ" } },
    bookmark:   { label: "しおり", opts: { none: "なし", ribbon: "リボン", double: "二本", tassel: "房", charm: "飾りつき" } },
    finish:     { label: "仕上げ", opts: { none: "なし", gloss: "つや", worn: "使いこまれた", gilt: "金の縁", burnt: "焦げ", stains: "しみ", frost: "霜", shadow: "影", lamp: "灯り" } }
  };
  // 表紙をつくる画面での並び（まとまりごと）
  const GROUPS = [
    ["地", ["base", "scene", "pattern", "sparkle"]],
    ["ふち", ["spine", "frame", "corners", "band"]],
    ["紋章", ["emblem", "emblemBase", "emblemPos"]],
    ["題名", ["plate", "titleDeco", "titlePos"]],
    ["小物と仕上げ", ["clasp", "bookmark", "finish"]]
  ];
  const DEFAULT = { base: "leather", scene: "none", pattern: "none", sparkle: "none", spine: "plain", frame: "double", corners: "metal", band: "none", emblemBase: "circle", emblemPos: "middle", plate: "plate", titleDeco: "none", titlePos: "bottom", clasp: "none", bookmark: "none", finish: "none" };

  /* ---------- 増やした紋章（index.html の紋章に足して使える） ---------- */
  const EXTRA_EMB_JP = { rose: "ばら", sakura: "桜", clover: "クローバー", tree: "木", bird: "鳥", cat: "ねこ", rabbit: "うさぎ", fish: "魚", wing: "つばさ", book: "本", castle: "城", lantern: "ランタン", compass: "羅針盤", gear: "歯車", note: "音符", chalice: "杯", shell: "貝", wave: "波", mountain: "山", planet: "惑星" };
  function emblemExtra(kind, cx, cy, R, col, hi) {
    const st = `fill="${col}" stroke="${hi}" stroke-width="${f1(R * .05)}" stroke-linejoin="round"`;
    const P = (x, y) => `${f1(cx + x * R)} ${f1(cy + y * R)}`;
    switch (kind) {
      case "rose": { let sp = ""; for (let t = 0; t < 4.2 * Math.PI; t += .35) { const rr = R * (.06 + t * .05); sp += (sp ? "L" : "M") + f1(cx + Math.cos(t) * rr) + " " + f1(cy - R * .1 + Math.sin(t) * rr * .9); } return `<path d="M${P(0, .55)}C${P(-.5, 1.05)} ${P(-.9, .6)} ${P(-.75, .95)}C${P(-.55, .55)} ${P(-.25, .55)} ${P(0, .55)}ZM${P(0, .55)}C${P(.5, 1.05)} ${P(.9, .6)} ${P(.75, .95)}C${P(.55, .55)} ${P(.25, .55)} ${P(0, .55)}Z" ${st}/><circle cx="${cx}" cy="${f1(cy - R * .1)}" r="${f1(R * .78)}" ${st}/><path d="${sp}" fill="none" stroke="${hi}" stroke-width="${f1(R * .07)}" stroke-linecap="round"/>`; }
      case "sakura": { let p = ""; for (let i = 0; i < 5; i++) p += `<path d="M${cx} ${cy}C${P(-.5, -.35)} ${P(-.42, -.95)} ${P(-.13, -1)}L${P(0, -.84)}L${P(.13, -1)}C${P(.42, -.95)} ${P(.5, -.35)} ${cx} ${cy}Z" transform="rotate(${i * 72} ${cx} ${cy})" ${st}/>`; return p + `<circle cx="${cx}" cy="${cy}" r="${f1(R * .16)}" fill="${hi}"/>`; }
      case "clover": return [[0, -.45], [.45, 0], [0, .45], [-.45, 0]].map(([x, y]) => `<circle cx="${f1(cx + x * R)}" cy="${f1(cy + y * R - R * .1)}" r="${f1(R * .4)}" ${st}/>`).join("") + `<path d="M${P(0, .1)}Q${P(.15, .7)} ${P(.45, 1)}" stroke="${col}" stroke-width="${f1(R * .12)}" fill="none" stroke-linecap="round"/><circle cx="${cx}" cy="${f1(cy - R * .1)}" r="${f1(R * .12)}" fill="${hi}"/>`;
      case "tree": return `<path d="M${P(-.12, 1)}L${P(-.08, .3)}L${P(.08, .3)}L${P(.12, 1)}Z" ${st}/><circle cx="${cx}" cy="${f1(cy - R * .35)}" r="${f1(R * .55)}" ${st}/><circle cx="${f1(cx - R * .45)}" cy="${f1(cy - R * .05)}" r="${f1(R * .4)}" ${st}/><circle cx="${f1(cx + R * .45)}" cy="${f1(cy - R * .05)}" r="${f1(R * .4)}" ${st}/><circle cx="${f1(cx - R * .15)}" cy="${f1(cy - R * .5)}" r="${f1(R * .12)}" fill="${hi}"/>`;
      case "bird": return `<path d="M${P(-1, -.25)}Q${P(-.5, -.75)} ${P(0, -.1)}Q${P(.5, -.75)} ${P(1, -.25)}Q${P(.4, -.1)} ${P(.08, .45)}L${P(.22, 1)}L${P(0, .7)}L${P(-.22, 1)}L${P(-.08, .45)}Q${P(-.4, -.1)} ${P(-1, -.25)}Z" ${st}/><circle cx="${cx}" cy="${f1(cy + R * .05)}" r="${f1(R * .09)}" fill="${hi}"/>`;
      case "cat": return `<path d="M${P(-.72, -.25)}L${P(-.62, -.95)}L${P(-.2, -.55)}L${P(.2, -.55)}L${P(.62, -.95)}L${P(.72, -.25)}C${P(.85, .45)} ${P(.45, .82)} ${P(0, .82)}C${P(-.45, .82)} ${P(-.85, .45)} ${P(-.72, -.25)}Z" ${st}/><ellipse cx="${f1(cx - R * .3)}" cy="${f1(cy + R * .05)}" rx="${f1(R * .11)}" ry="${f1(R * .16)}" fill="${hi}"/><ellipse cx="${f1(cx + R * .3)}" cy="${f1(cy + R * .05)}" rx="${f1(R * .11)}" ry="${f1(R * .16)}" fill="${hi}"/><path d="M${P(-.1, .32)}L${P(0, .4)}L${P(.1, .32)}M${P(-.25, .45)}L${P(-.9, .35)}M${P(-.25, .52)}L${P(-.88, .6)}M${P(.25, .45)}L${P(.9, .35)}M${P(.25, .52)}L${P(.88, .6)}" stroke="${hi}" stroke-width="${f1(R * .05)}" fill="none" stroke-linecap="round"/>`;
      case "rabbit": return `<ellipse cx="${f1(cx - R * .25)}" cy="${f1(cy - R * .5)}" rx="${f1(R * .17)}" ry="${f1(R * .5)}" transform="rotate(-10 ${f1(cx - R * .25)} ${f1(cy - R * .5)})" ${st}/><ellipse cx="${f1(cx + R * .25)}" cy="${f1(cy - R * .5)}" rx="${f1(R * .17)}" ry="${f1(R * .5)}" transform="rotate(10 ${f1(cx + R * .25)} ${f1(cy - R * .5)})" ${st}/><ellipse cx="${cx}" cy="${f1(cy + R * .35)}" rx="${f1(R * .62)}" ry="${f1(R * .55)}" ${st}/><circle cx="${f1(cx - R * .22)}" cy="${f1(cy + R * .28)}" r="${f1(R * .08)}" fill="${hi}"/><circle cx="${f1(cx + R * .22)}" cy="${f1(cy + R * .28)}" r="${f1(R * .08)}" fill="${hi}"/><ellipse cx="${f1(cx - R * .25)}" cy="${f1(cy - R * .5)}" rx="${f1(R * .06)}" ry="${f1(R * .3)}" fill="${hi}" opacity=".6"/><ellipse cx="${f1(cx + R * .25)}" cy="${f1(cy - R * .5)}" rx="${f1(R * .06)}" ry="${f1(R * .3)}" fill="${hi}" opacity=".6"/>`;
      case "fish": return `<path d="M${P(-.75, 0)}C${P(-.4, -.6)} ${P(.35, -.6)} ${P(.6, 0)}C${P(.35, .6)} ${P(-.4, .6)} ${P(-.75, 0)}ZM${P(.5, 0)}L${P(1, -.45)}V${f1(cy + .45 * R)}Z" ${st}/><circle cx="${f1(cx - R * .4)}" cy="${f1(cy - R * .08)}" r="${f1(R * .09)}" fill="${hi}"/><path d="M${P(-.15, -.3)}Q${P(0, 0)} ${P(-.15, .3)}M${P(.1, -.3)}Q${P(.25, 0)} ${P(.1, .3)}" stroke="${hi}" stroke-width="${f1(R * .05)}" fill="none"/>`;
      case "wing": { let p = ""; const px = cx - R * .55, py = cy + R * .6; for (let i = 0; i < 6; i++) { const a = (-100 + i * 16) * Math.PI / 180, l = R * (1.55 - Math.abs(i - 1.5) * .12), mx = px + Math.cos(a) * l * .5, my = py + Math.sin(a) * l * .5; p += `<ellipse cx="${f1(mx)}" cy="${f1(my)}" rx="${f1(l * .5)}" ry="${f1(R * .17)}" transform="rotate(${f1(a * 180 / Math.PI)} ${f1(mx)} ${f1(my)})" ${st}/>`; } return p + `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(R * .14)}" fill="${hi}"/>`; }
      case "book": return `<path d="M${P(0, -.55)}C${P(-.35, -.8)} ${P(-.7, -.75)} ${P(-.95, -.6)}V${f1(cy + .7 * R)}C${P(-.7, .55).split(" ")[0]} ${f1(cy + .55 * R)} ${P(-.35, .6)} ${P(0, .8)}C${P(.35, .6)} ${P(.7, .55)} ${P(.95, .7)}V${f1(cy - .6 * R)}C${P(.7, -.75)} ${P(.35, -.8)} ${P(0, -.55)}Z" ${st}/><path d="M${P(0, -.55)}V${f1(cy + .8 * R)}M${P(-.75, -.3)}Q${P(-.4, -.45)} ${P(-.15, -.25)}M${P(-.75, 0)}Q${P(-.4, -.15)} ${P(-.15, .05)}M${P(.15, -.25)}Q${P(.4, -.45)} ${P(.75, -.3)}M${P(.15, .05)}Q${P(.4, -.15)} ${P(.75, 0)}" stroke="${hi}" stroke-width="${f1(R * .05)}" fill="none" stroke-linecap="round"/>`;
      case "castle": return `<path d="M${P(-.95, .9)}V${f1(cy - .35 * R)}H${P(-.85, 0).split(" ")[0]}V${f1(cy - .5 * R)}H${P(-.75, 0).split(" ")[0]}V${f1(cy - .35 * R)}H${P(-.6, 0).split(" ")[0]}V${f1(cy - .5 * R)}H${P(-.5, 0).split(" ")[0]}V${f1(cy - .35 * R)}H${P(-.25, 0).split(" ")[0]}V${f1(cy - .75 * R)}L${P(0, -1.05)}L${P(.25, -.75)}V${f1(cy - .35 * R)}H${P(.5, 0).split(" ")[0]}V${f1(cy - .5 * R)}H${P(.6, 0).split(" ")[0]}V${f1(cy - .35 * R)}H${P(.75, 0).split(" ")[0]}V${f1(cy - .5 * R)}H${P(.85, 0).split(" ")[0]}V${f1(cy - .35 * R)}H${P(.95, 0).split(" ")[0]}V${f1(cy + .9 * R)}Z" ${st}/><path d="M${P(-.2, .9)}V${f1(cy + .45 * R)}A${f1(R * .2)} ${f1(R * .2)} 0 0 1 ${P(.2, .45)}V${f1(cy + .9 * R)}Z" fill="${hi}"/><rect x="${f1(cx - R * .07)}" y="${f1(cy - R * .45)}" width="${f1(R * .14)}" height="${f1(R * .25)}" rx="${f1(R * .07)}" fill="${hi}"/>`;
      case "lantern": return `<path d="M${P(-.25, -.95)}H${P(.25, 0).split(" ")[0]}L${P(.45, -.7)}H${P(-.45, 0).split(" ")[0]}Z" ${st}/><rect x="${f1(cx - R * .55)}" y="${f1(cy - R * .7)}" width="${f1(R * 1.1)}" height="${f1(R * 1.35)}" rx="${f1(R * .2)}" ${st}/><path d="M${P(-.45, .65)}L${P(-.3, .9)}H${P(.3, 0).split(" ")[0]}L${P(.45, .65)}Z" ${st}/><path d="M${P(0, -.4)}C${P(.28, -.05)} ${P(.22, .35)} ${P(0, .4)}C${P(-.22, .35)} ${P(-.28, -.05)} ${P(0, -.4)}Z" fill="${hi}"/><path d="M${P(-.2, -.7)}V${f1(cy + .65 * R)}M${P(.2, -.7)}V${f1(cy + .65 * R)}" stroke="${col}" stroke-width="${f1(R * .06)}" opacity=".7"/>`;
      case "compass": return `<circle cx="${cx}" cy="${cy}" r="${f1(R * .95)}" fill="none" stroke="${col}" stroke-width="${f1(R * .12)}"/><path d="${star4(cx, cy, R * .85)}" ${st}/><path d="M${P(0, -.85)}L${P(.14, 0)}L${P(0, 0)}Z" fill="${hi}"/><path d="${star4(cx, cy, R * .45)}" fill="${col}" transform="rotate(45 ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="${f1(R * .1)}" fill="${hi}"/>`;
      case "gear": { let p = ""; const n = 10, s = TAU / n; for (let i = 0; i < n; i++) { const a0 = i * s; [[a0, .78], [a0 + s * .12, 1], [a0 + s * .42, 1], [a0 + s * .54, .78]].forEach(([a, rr], k) => { p += (i || k ? "L" : "M") + f1(cx + Math.cos(a) * rr * R) + " " + f1(cy + Math.sin(a) * rr * R); }); } return `<path d="${p}Z" ${st}/><circle cx="${cx}" cy="${cy}" r="${f1(R * .4)}" fill="none" stroke="${hi}" stroke-width="${f1(R * .08)}"/><circle cx="${cx}" cy="${cy}" r="${f1(R * .15)}" fill="${hi}"/>`; }
      case "note": return `<ellipse cx="${f1(cx - R * .5)}" cy="${f1(cy + R * .6)}" rx="${f1(R * .3)}" ry="${f1(R * .22)}" transform="rotate(-20 ${f1(cx - R * .5)} ${f1(cy + R * .6)})" ${st}/><ellipse cx="${f1(cx + R * .5)}" cy="${f1(cy + R * .4)}" rx="${f1(R * .3)}" ry="${f1(R * .22)}" transform="rotate(-20 ${f1(cx + R * .5)} ${f1(cy + R * .4)})" ${st}/><path d="M${P(-.24, .55)}V${f1(cy - .7 * R)}L${P(.76, -.9)}V${f1(cy + .35 * R)}" fill="none" stroke="${col}" stroke-width="${f1(R * .1)}" stroke-linejoin="round"/><path d="M${P(-.24, -.7)}L${P(.76, -.9)}V${f1(cy - .65 * R)}L${P(-.24, -.45)}Z" fill="${col}"/>`;
      case "chalice": return `<path d="M${P(-.7, -.9)}H${P(.7, 0).split(" ")[0]}C${P(.7, -.1)} ${P(.35, .15)} ${P(.1, .2)}V${f1(cy + .65 * R)}L${P(.5, .95)}H${P(-.5, 0).split(" ")[0]}L${P(-.1, .65)}V${f1(cy + .2 * R)}C${P(-.35, .15)} ${P(-.7, -.1)} ${P(-.7, -.9)}Z" ${st}/><path d="M${P(-.5, -.6)}Q${P(0, -.5)} ${P(.5, -.6)}" stroke="${hi}" stroke-width="${f1(R * .06)}" fill="none"/><circle cx="${cx}" cy="${f1(cy - R * .3)}" r="${f1(R * .12)}" fill="${hi}"/>`;
      case "shell": { let ribs = ""; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + i * .127); ribs += `M${P(0, .75)}L${f1(cx + Math.cos(a) * R * .95)} ${f1(cy + .75 * R + Math.sin(a) * R * 1.55)}`; } return `<path d="M${P(0, .75)}L${P(-.95, -.1)}C${P(-.8, -.95)} ${P(.8, -.95)} ${P(.95, -.1)}Z" ${st}/><path d="${ribs}" stroke="${hi}" stroke-width="${f1(R * .05)}" opacity=".85"/><path d="M${P(-.3, .55)}L${P(-.45, .95)}H${P(.45, 0).split(" ")[0]}L${P(.3, .55)}Z" ${st}/>`; }
      case "wave": return `<path d="M${P(-1, .85)}C${P(-.9, .1)} ${P(-.4, -.75)} ${P(.25, -.8)}C${P(.8, -.8)} ${P(1, -.35)} ${P(.85, -.05)}C${P(.7, -.4)} ${P(.35, -.45)} ${P(.15, -.2)}C${P(.4, -.15)} ${P(.45, .15)} ${P(.25, .3)}C${P(.6, .4)} ${P(.85, .55)} ${P(1, .85)}Z" ${st}/><path d="M${P(-.6, .6)}Q${P(-.4, -.2)} ${P(.15, -.55)}" stroke="${hi}" stroke-width="${f1(R * .07)}" fill="none" stroke-linecap="round"/>`;
      case "mountain": return `<path d="M${P(-1, .8)}L${P(-.35, -.75)}L${P(0, -.05)}L${P(.35, -.45)}L${P(1, .8)}Z" ${st}/><path d="M${P(-.35, -.75)}L${P(-.55, -.28)}L${P(-.38, -.38)}L${P(-.25, -.25)}L${P(-.15, -.4)}ZM${P(.35, -.45)}L${P(.22, -.15)}L${P(.35, -.2)}L${P(.48, -.12)}Z" fill="${hi}"/>`;
      case "planet": return `<path d="M${P(-1, .1)}A${f1(R)} ${f1(R * .32)} -15 0 1 ${P(1, -.1)}" fill="none" stroke="${col}" stroke-width="${f1(R * .1)}"/><circle cx="${cx}" cy="${cy}" r="${f1(R * .6)}" ${st}/><path d="M${P(-1, .1)}A${f1(R)} ${f1(R * .32)} -15 0 0 ${P(1, -.1)}" fill="none" stroke="${col}" stroke-width="${f1(R * .1)}"/><path d="M${P(-.95, .08)}A${f1(R)} ${f1(R * .32)} -15 0 0 ${P(.95, -.08)}" fill="none" stroke="${hi}" stroke-width="${f1(R * .03)}"/><circle cx="${f1(cx - R * .2)}" cy="${f1(cy - R * .25)}" r="${f1(R * .12)}" fill="${hi}" opacity=".7"/>`;
    }
    return "";
  }
  const emb = (kind, cx, cy, R, col, hi) => emblemExtra(kind, cx, cy, R, col, hi) || emblemSVG(kind, cx, cy, R, col, hi);

  // 三日月の形（円から、ずらした円をくり抜く）
  function crescentPath(cx, cy, R, kx = .42, ky = -.18, k2 = .82) {
    const ox = cx + R * kx, oy = cy + R * ky, r2 = R * k2, dx = ox - cx, dy = oy - cy, dd = Math.hypot(dx, dy);
    const a = (R * R - r2 * r2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, R * R - a * a));
    const mx = cx + a * dx / dd, my = cy + a * dy / dd, p1 = [mx + h * dy / dd, my - h * dx / dd], p2 = [mx - h * dy / dd, my + h * dx / dd];
    return `M${f1(p1[0])} ${f1(p1[1])}A${f1(R)} ${f1(R)} 0 1 0 ${f1(p2[0])} ${f1(p2[1])}A${f1(r2)} ${f1(r2)} 0 1 1 ${f1(p1[0])} ${f1(p1[1])}Z`;
  }
  const poly = (cx, cy, n, R, rot = -Math.PI / 2, R2) => { let p = ""; const m = R2 ? n * 2 : n; for (let i = 0; i < m; i++) { const a = rot + i * TAU / m, rr = R2 && i % 2 ? R2 : R; p += (i ? "L" : "M") + f1(cx + Math.cos(a) * rr) + " " + f1(cy + Math.sin(a) * rr); } return p + "Z"; };

  // 渦をまく雲（龍の背景など）
  const cloudSwirls = (r, pts, col, o) => pts.map(([x, y]) => `<g fill="none" stroke="${col}" stroke-width="2" opacity="${o}" stroke-linecap="round"><path d="M${x - 30} ${y + 8}C${x - 30} ${y - 8} ${x - 10} ${y - 14} ${x} ${y - 4}C${x + 4} ${y - 16} ${x + 26} ${y - 14} ${x + 26} ${y}C${x + 36} ${y - 2} ${x + 40} ${y + 8} ${x + 34} ${y + 10}H${x - 30}"/><path d="M${x - 4} ${y + 2}c0-6 8-6 8-1c0 3-4 4-5 2"/><path d="M${x - 40} ${y + 16}H${x + 22}"/></g>`).join("");
  const X0 = 26, CX = 163, W = 274;
  const Y = { top: 82, middle: 196, bottom: 318 };
  const FR = { x: 44, y: 18, w: 238, h: 364 };
  // 枠の四辺にそって点を並べる（内向きの向き nx, ny つき）
  function perimPts(ins, step) {
    const x0 = FR.x + ins, y0 = FR.y + ins, x1 = FR.x + FR.w - ins, y1 = FR.y + FR.h - ins, pts = [];
    const seg = (ax, ay, bx, by, nx, ny) => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step)); for (let i = 0; i < n; i++) { const t = i / n; pts.push([ax + (bx - ax) * t, ay + (by - ay) * t, nx, ny]); } };
    seg(x0, y0, x1, y0, 0, 1); seg(x1, y0, x1, y1, -1, 0); seg(x1, y1, x0, y1, 0, -1); seg(x0, y1, x0, y0, 1, 0);
    return pts;
  }

  function render(book, c, id) {
    const P = { ...DEFAULT, ...(c.parts || {}) };
    const base = c.color || "#3a3a6a", acc = c.accent || "#d6b062", ink = c.textColor || acc, plateCol = c.plateColor || "";
    const T = c.title || String(book.title || "").replace(/^仮題・/, ""), sub = c.subtitle || "", em = c.emblem || "star", vert = c.titleDirection === "vertical";
    const r = rng([...String(book.id || T)].reduce((a, ch) => a + ch.charCodeAt(0), 7));
    const metal = `url(#${id}m)`, hi = "#fff8e2", dark = mix(base, "#000", .45), light = mix(base, "#fff", .25), sil = mix(base, "#000", .55);
    let d = "", g = "";
    const rect = (fill, extra = "") => `<rect width="300" height="400" rx="6" fill="${fill}" ${extra}/>`;

    /* ---------- 地 ---------- */
    switch (P.base) {
      case "leather":
        d += `<filter id="${id}fl" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
        g += rect(base) + rect(base, `filter="url(#${id}fl)"`); break;
      case "cloth":
        d += `<pattern id="${id}cl" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 2H4" stroke="#000" stroke-opacity=".12"/><path d="M0 0V4M2 0V4" stroke="#fff" stroke-opacity=".06"/></pattern>`;
        g += rect(base) + rect(`url(#${id}cl)`); break;
      case "linen":
        d += `<pattern id="${id}ln" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 1.5H7M0 5H7" stroke="#fff" stroke-opacity=".09" stroke-width="1.6"/><path d="M1.5 0V7M5 0V7" stroke="#000" stroke-opacity=".12" stroke-width="1.3"/></pattern>`;
        g += rect(base) + rect(`url(#${id}ln)`);
        for (let i = 0; i < 26; i++) g += `<path d="M${X0} ${f1(r() * 400)}H300" stroke="#fff" stroke-opacity="${f1(.03 + r() * .05)}" stroke-width="${f1(.6 + r() * 1.2)}"/>`;
        break;
      case "velvet":
        d += `<radialGradient id="${id}vv" cx=".55" cy=".35" r=".85"><stop offset="0" stop-color="${light}"/><stop offset=".6" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;
        g += rect(`url(#${id}vv)`); break;
      case "marble": {
        g += rect(base);
        for (let i = 0; i < 9; i++) { const y = r() * 400, a = 30 + r() * 60; g += `<path d="M0 ${f1(y)}C80 ${f1(y - a)} 160 ${f1(y + a)} 300 ${f1(y - a * .4)}" fill="none" stroke="${i % 3 ? light : acc}" stroke-opacity="${f1(.12 + r() * .2)}" stroke-width="${f1(1 + r() * 3)}"/>`; }
        break;
      }
      case "wood": {
        g += rect(base);
        for (let x = 30; x < 300; x += 7 + r() * 9) g += `<path d="M${f1(x)} 0C${f1(x + 6 - r() * 12)} 120 ${f1(x - 6 + r() * 12)} 260 ${f1(x + r() * 6)} 400" fill="none" stroke="${dark}" stroke-opacity="${f1(.15 + r() * .2)}" stroke-width="${f1(.8 + r() * 1.6)}"/>`;
        g += `<ellipse cx="${f1(90 + r() * 140)}" cy="${f1(80 + r() * 240)}" rx="10" ry="22" fill="none" stroke="${dark}" stroke-opacity=".3" stroke-width="2"/>`;
        break;
      }
      case "washi": {
        g += rect(base);
        for (let i = 0; i < 70; i++) g += `<path d="M${f1(X0 + r() * W)} ${f1(r() * 400)}l${f1(-6 + r() * 12)} ${f1(-6 + r() * 12)}" stroke="${hi}" stroke-opacity="${f1(.08 + r() * .15)}" stroke-width="1"/>`;
        break;
      }
      case "night":
        d += `<linearGradient id="${id}nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".65" stop-color="${base}"/><stop offset="1" stop-color="${mix(base, acc, .3)}"/></linearGradient>`;
        g += rect(`url(#${id}nt)`);
        for (let i = 0; i < 40; i++) g += `<circle cx="${f1(X0 + 6 + r() * (W - 12))}" cy="${f1(6 + r() * 388)}" r="${f1(.5 + r() * 1.3)}" fill="${hi}" opacity="${f1(.25 + r() * .55)}"/>`;
        break;
      case "metal":
        d += `<linearGradient id="${id}mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${base}"/><stop offset=".55" stop-color="${mix(base, "#fff", .15)}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
        g += rect(`url(#${id}mt)`);
        for (let y = 4; y < 400; y += 3) g += `<path d="M${X0} ${y}H300" stroke="#fff" stroke-opacity="${f1(.02 + r() * .04)}"/>`;
        break;
      case "parchment": {
        const pc = mix("#efe0b8", base, .25);
        d += `<radialGradient id="${id}pc" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="${pc}"/><stop offset="1" stop-color="${mix(pc, "#6b4a2a", .45)}"/></radialGradient>`;
        g += rect(`url(#${id}pc)`);
        for (let i = 0; i < 5; i++) g += `<ellipse cx="${f1(60 + r() * 200)}" cy="${f1(40 + r() * 320)}" rx="${f1(20 + r() * 30)}" ry="${f1(14 + r() * 20)}" fill="#6b4a2a" opacity=".06"/>`;
        break;
      }
      case "gradient":
        d += `<linearGradient id="${id}gr" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="${mix(base, "#fff", .3)}"/><stop offset="1" stop-color="${mix(base, "#000", .5)}"/></linearGradient>`;
        g += rect(`url(#${id}gr)`); break;
      case "twilight":
        d += `<linearGradient id="${id}tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(base, "#000", .5)}"/><stop offset=".55" stop-color="${base}"/><stop offset=".85" stop-color="${mix(base, acc, .55)}"/><stop offset="1" stop-color="${mix(acc, "#ffb070", .4)}"/></linearGradient>`;
        g += rect(`url(#${id}tw)`);
        for (let i = 0; i < 18; i++) g += `<circle cx="${f1(X0 + 6 + r() * (W - 12))}" cy="${f1(6 + r() * 170)}" r="${f1(.5 + r() * 1)}" fill="${hi}" opacity="${f1(.2 + r() * .5)}"/>`;
        break;
      case "stone":
        d += `<filter id="${id}fs" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 -1.6 0 1"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
        g += rect(base) + rect(dark, `filter="url(#${id}fs)" opacity=".55"`);
        for (let i = 0; i < 6; i++) { let x = X0 + r() * W, y = r() * 400, p = `M${f1(x)} ${f1(y)}`; for (let k = 0; k < 4; k++) { x += -14 + r() * 28; y += 8 + r() * 18; p += `L${f1(x)} ${f1(y)}`; } g += `<path d="${p}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1"/>`; }
        break;
      case "lacquer": {
        const lq = mix(base, "#000", .35);
        d += `<linearGradient id="${id}lq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(lq, "#fff", .08)}"/><stop offset=".5" stop-color="${lq}"/><stop offset="1" stop-color="${mix(lq, "#000", .5)}"/></linearGradient>`;
        g += rect(`url(#${id}lq)`) + `<path d="M120 0H170L40 400H${X0}V340Z" fill="#fff" opacity=".07"/><path d="M190 0H202L70 400H58Z" fill="#fff" opacity=".06"/>`;
        break;
      }
      case "goldleaf":
        g += rect(base);
        for (let i = 0; i < 70; i++) { const x = X0 + r() * W, y = r() * 400, s = 4 + r() * 14; g += `<path d="M${f1(x)} ${f1(y)}l${f1(s)} ${f1(-1 + r() * 2)}l${f1(-1 + r() * 2)} ${f1(s)}l${f1(-s)} ${f1(-1 + r() * 2)}Z" fill="${metal}" opacity="${f1(.15 + r() * .45)}"/>`; }
        break;
      case "ice":
        d += `<linearGradient id="${id}ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(base, "#e8f8ff", .65)}"/><stop offset=".5" stop-color="${mix(base, "#bfe4f5", .35)}"/><stop offset="1" stop-color="${mix(base, "#0a1a30", .3)}"/></linearGradient>`;
        g += rect(`url(#${id}ic)`);
        for (let i = 0; i < 10; i++) { const x = X0 + r() * W, y = r() * 400; g += `<path d="M${f1(x)} ${f1(y)}l${f1(-30 + r() * 60)} ${f1(-30 + r() * 60)}m${f1(-10 + r() * 20)} ${f1(-10 + r() * 20)}l${f1(-20 + r() * 40)} ${f1(-20 + r() * 40)}" stroke="#fff" stroke-opacity="${f1(.25 + r() * .3)}" stroke-width="${f1(.6 + r())}" fill="none"/>`; }
        break;
      case "suminagashi": {
        g += rect(mix(base, "#fff", .55));
        const ring = (cx0, cy0, rad, ph) => { let p = ""; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = rad * (1 + .08 * Math.sin(a * 3 + ph) + .05 * Math.sin(a * 5 - ph)); p += (i ? "L" : "M") + f1(cx0 + Math.cos(a) * rr) + " " + f1(cy0 + Math.sin(a) * rr * 1.2); } return p + "Z"; };
        for (let k = 0; k < 3; k++) { const cx0 = 60 + r() * 200, cy0 = 60 + r() * 280, ph = r() * 6; for (let rad = 16; rad < 200; rad += 9 + r() * 6) g += `<path d="${ring(cx0, cy0, rad, ph + rad * .03)}" fill="none" stroke="${(rad | 0) % 2 ? base : mix(base, acc, .4)}" stroke-opacity="${f1(.35 + r() * .35)}" stroke-width="${f1(1.5 + r() * 3)}"/>`; }
        break;
      }
      case "patchwork": {
        const cols = [base, mix(base, acc, .35), mix(base, "#000", .25), mix(base, "#fff", .18), mix(base, acc, .18)];
        for (let y = 0; y < 400; y += 66) for (let x = X0; x < 300; x += 69) { g += `<rect x="${x}" y="${y}" width="69" height="66" fill="${cols[Math.floor(r() * cols.length)]}"/><rect x="${x + 4}" y="${y + 4}" width="61" height="58" fill="none" stroke="${hi}" stroke-opacity=".35" stroke-dasharray="4 3"/>`; }
        g = `<rect width="300" height="400" rx="6" fill="${base}"/>` + g;
        break;
      }
      case "stained": {
        g += rect(dark);
        const cols = [mix(base, "#fff", .1), mix(base, acc, .45), mix(base, "#4aa0d0", .4), mix(base, "#c0485e", .4), mix(base, "#70b060", .35), light];
        const nx = 6, ny = 8, pts = [];
        for (let j = 0; j <= ny; j++) { pts[j] = []; for (let i = 0; i <= nx; i++) { const edgeX = i === 0 || i === nx, edgeY = j === 0 || j === ny; pts[j][i] = [X0 + i * W / nx + (edgeX ? 0 : -14 + r() * 28), j * 400 / ny + (edgeY ? 0 : -14 + r() * 28)]; } }
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = pts[j][i], b = pts[j][i + 1], cc = pts[j + 1][i + 1], e = pts[j + 1][i], fl = (r() < .5); const tris = fl ? [[a, b, cc], [a, cc, e]] : [[a, b, e], [b, cc, e]]; tris.forEach((t) => { g += `<path d="M${t.map((p) => f1(p[0]) + " " + f1(p[1])).join("L")}Z" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".85" stroke="#14101c" stroke-width="2.2" stroke-linejoin="round"/>`; }); }
        break;
      }
      case "crackle":
        g += rect(base);
        for (let i = 0; i < 16; i++) { let x = X0 + r() * W, y = r() * 400, p = `M${f1(x)} ${f1(y)}`; const ang = r() * TAU; for (let k = 0; k < 5; k++) { x += Math.cos(ang + (-0.8 + r() * 1.6)) * (10 + r() * 16); y += Math.sin(ang + (-0.8 + r() * 1.6)) * (10 + r() * 16); p += `L${f1(x)} ${f1(y)}`; } g += `<path d="${p}" fill="none" stroke="${dark}" stroke-opacity=".55" stroke-width="1.1"/><path d="${p}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1" transform="translate(1 1)"/>`; }
        break;
      default: g += rect(base);
    }

    /* ---------- 背景の絵 ---------- */
    const silF = `fill="${sil}" opacity=".75"`, farF = `fill="${mix(base, "#000", .3)}" opacity=".55"`;
    switch (P.scene) {
      case "mountains": {
        g += `<path d="M${X0} 300L70 230L110 270L170 190L230 260L270 220L300 250V400H${X0}Z" ${farF}/><path d="M170 190L155 212L168 207L180 214Z" fill="${hi}" opacity=".5"/>`;
        g += `<path d="M${X0} 340L80 280L130 330L190 260L250 320L300 290V400H${X0}Z" ${silF}/><path d="M190 260L176 280L190 275L202 283Z" fill="${hi}" opacity=".55"/>`;
        break;
      }
      case "forest": {
        const tree = (x, y, h, f) => `<path d="M${f1(x)} ${f1(y - h)}L${f1(x + h * .28)} ${f1(y - h * .45)}H${f1(x + h * .14)}L${f1(x + h * .36)} ${f1(y)}H${f1(x - h * .36)}L${f1(x - h * .14)} ${f1(y - h * .45)}H${f1(x - h * .28)}Z" ${f}/>`;
        for (let x = X0; x < 310; x += 18 + r() * 10) g += tree(x, 350, 70 + r() * 40, farF);
        for (let x = X0 - 8; x < 310; x += 26 + r() * 12) g += tree(x, 400, 80 + r() * 50, silF);
        break;
      }
      case "sea": {
        g += `<rect x="${X0}" y="300" width="${W}" height="100" fill="${sil}" opacity=".55"/><circle cx="210" cy="300" r="34" fill="${acc}" opacity=".3"/><rect x="${X0}" y="300" width="${W}" height="40" fill="${sil}" opacity=".5"/>`;
        for (let y = 312; y < 400; y += 12) for (let x = X0 + (y % 24); x < 300; x += 40) g += `<path d="M${x} ${y}q8 -5 16 0" stroke="${hi}" stroke-opacity=".3" fill="none"/>`;
        for (let i = 0; i < 6; i++) g += `<path d="M${f1(200 - i * 2)} ${306 + i * 9}h${f1(20 + i * 4)}" stroke="${acc}" stroke-opacity=".45" stroke-width="2"/>`;
        break;
      }
      case "castle": {
        g += `<path d="M${X0} 360Q160 330 300 352V400H${X0}Z" ${silF}/>`;
        g += `<path d="M110 360V280H118V270H126V280H134V270H142V280H150V240L163 214L176 240V280H184V270H192V280H200V270H208V280H216V360Z" ${silF}/><path d="M92 360V300L101 286L110 300V360ZM216 360V296L226 280L236 296V360Z" ${silF}/>`;
        g += `<rect x="160" y="252" width="6" height="10" rx="3" fill="${acc}" opacity=".7"/><rect x="128" y="300" width="5" height="8" fill="${acc}" opacity=".6"/><rect x="194" y="300" width="5" height="8" fill="${acc}" opacity=".6"/>`;
        break;
      }
      case "city": {
        let x = X0;
        while (x < 300) { const w = 18 + r() * 22, h = 40 + r() * 90; g += `<rect x="${f1(x)}" y="${f1(400 - h)}" width="${f1(w)}" height="${f1(h)}" ${silF}/>`; for (let wy = 400 - h + 8; wy < 392; wy += 12) for (let wx = x + 4; wx < x + w - 5; wx += 8) if (r() < .3) g += `<rect x="${f1(wx)}" y="${f1(wy)}" width="3.5" height="5" fill="${acc}" opacity=".7"/>`; x += w + 2; }
        break;
      }
      case "moonclouds": {
        g += `<circle cx="226" cy="96" r="42" fill="${acc}" opacity=".28"/><circle cx="226" cy="96" r="30" fill="${acc}" opacity=".3"/>`;
        const cloud = (x, y, s, o) => `<path d="M${x} ${y}a${12 * s} ${10 * s} 0 0 1 ${20 * s} ${-8 * s}a${16 * s} ${14 * s} 0 0 1 ${30 * s} 0a${10 * s} ${9 * s} 0 0 1 ${18 * s} ${8 * s}Z" fill="${light}" opacity="${o}"/>`;
        g += cloud(170, 124, 1.4, .5) + cloud(60, 180, 1.1, .35) + cloud(200, 260, 1.3, .3) + cloud(70, 340, 1.6, .3);
        break;
      }
      case "tower": {
        g += `<path d="M${X0} 380Q150 360 300 376V400H${X0}Z" ${silF}/><path d="M64 380V150H58L80 104L102 150H96V380Z" ${silF}/><path d="M80 104V88" stroke="${sil}" stroke-width="2"/><path d="M80 86l10 4l-10 4Z" fill="${acc}" opacity=".7"/>`;
        g += `<rect x="76" y="170" width="8" height="14" rx="4" fill="${acc}" opacity=".8"/><rect x="76" y="240" width="8" height="12" rx="4" fill="${acc}" opacity=".5"/>`;
        break;
      }
      case "flowers": {
        g += `<path d="M${X0} 350Q160 330 300 346V400H${X0}Z" fill="${mix(base, "#2a5a30", .5)}" opacity=".7"/>`;
        for (let i = 0; i < 40; i++) { const x = X0 + r() * W, y = 350 + r() * 50, h = 10 + r() * 22, col = [acc, mix(acc, "#ffb0c8", .6), hi, mix(acc, "#a0c0ff", .5)][Math.floor(r() * 4)]; g += `<path d="M${f1(x)} ${f1(y)}v${f1(-h)}" stroke="${mix(base, "#3a7a3a", .6)}" stroke-width="1.2"/><circle cx="${f1(x)}" cy="${f1(y - h)}" r="${f1(2 + r() * 2.5)}" fill="${col}" opacity=".85"/>`; }
        break;
      }
      case "bamboo": {
        const stalk = (x, w, o) => { let s = `<rect x="${f1(x)}" y="0" width="${w}" height="400" fill="${mix(base, "#4a7a3a", .45)}" opacity="${o}"/>`; for (let y = 30 + r() * 40; y < 400; y += 60 + r() * 20) s += `<rect x="${f1(x - 1)}" y="${f1(y)}" width="${w + 2}" height="3" fill="${sil}" opacity="${o}"/><path d="M${f1(x + w)} ${f1(y)}q16 -6 30 -2q-16 6 -30 2Z" fill="${mix(base, "#4a7a3a", .45)}" opacity="${o}"/>`; return s; };
        g += stalk(48, 9, .45) + stalk(70, 12, .6) + stalk(258, 11, .55) + stalk(282, 8, .45);
        break;
      }
      case "dunes":
        g += `<path d="M${X0} 320Q100 280 180 320T300 300V400H${X0}Z" fill="${mix(base, acc, .35)}" opacity=".55"/><path d="M${X0} 360Q120 320 220 360T300 350V400H${X0}Z" ${silF}/><path d="${crescentPath(230, 90, 20)}" fill="${acc}" opacity=".5"/>`;
        break;
      case "lonetree":
        g += `<path d="M${X0} 380Q170 300 300 340V400H${X0}Z" ${silF}/><path d="M220 334V290M220 300L204 286M220 296L236 282" stroke="${sil}" stroke-width="5" stroke-linecap="round" opacity=".75"/><circle cx="220" cy="272" r="26" fill="${sil}" opacity=".75"/><circle cx="200" cy="284" r="16" fill="${sil}" opacity=".75"/><circle cx="242" cy="284" r="16" fill="${sil}" opacity=".75"/>`;
        break;
      case "aurora": {
        d += `<linearGradient id="${id}au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(acc, "#60f0b0", .5)}" stop-opacity="0"/><stop offset=".5" stop-color="${mix(acc, "#60f0b0", .5)}" stop-opacity=".45"/><stop offset="1" stop-color="${mix(acc, "#a070ff", .4)}" stop-opacity="0"/></linearGradient>`;
        for (let k = 0; k < 3; k++) { const y = 50 + k * 50; g += `<path d="M${X0} ${y + 40}C90 ${y - 20} 160 ${y + 80} 300 ${y}V${y + 70}C170 ${y + 140} 90 ${y + 40} ${X0} ${y + 100}Z" fill="url(#${id}au)" opacity="${f1(.9 - k * .2)}"/>`; }
        break;
      }
      case "battlefield": {
        d += `<linearGradient id="${id}bf" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${mix(acc, "#d04020", .6)}" stop-opacity="0"/><stop offset="1" stop-color="${mix(acc, "#d04020", .6)}" stop-opacity=".55"/></linearGradient>`;
        g += `<rect x="${X0}" width="${W}" height="400" fill="url(#${id}bf)"/>`;
        for (let i = 0; i < 6; i++) g += `<ellipse cx="${f1(X0 + r() * W)}" cy="${f1(220 + r() * 110)}" rx="${f1(40 + r() * 50)}" ry="${f1(12 + r() * 14)}" fill="${light}" opacity=".08"/>`;
        g += `<path d="M${X0} 362Q120 340 200 356T300 350V400H${X0}Z" ${silF}/>`;
        const flag = (x, top, w, k) => `<path d="M${x} 400V${top}" stroke="${sil}" stroke-width="3" opacity=".8"/><path d="M${x + 1} ${top + 2}H${x + w}L${x + w - 8} ${top + 12}L${x + w + 2} ${top + 22}L${x + w - 14} ${top + 26}L${x + w - 20} ${top + 34}L${x + 1} ${top + 30}Z" fill="${k}" opacity=".7"/>`;
        g += flag(96, 238, 46, mix(acc, "#a02020", .55)) + flag(232, 262, 40, mix(acc, "#202a60", .4));
        const sword = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 2.5} ${y}V${y - 62}L${x} ${y - 70}L${x + 2.5} ${y - 62}V${y}Z" fill="${sil}" opacity=".85"/><path d="M${x - 11} ${y - 8}H${x + 11}" stroke="${sil}" stroke-width="4" stroke-linecap="round" opacity=".85"/><path d="M${x} ${y - 8}V${y - 22}" stroke="${sil}" stroke-width="4" opacity=".85"/></g>`;
        // 地面に刺さった剣（つかが上）
        const stuck = (x, y, a) => `<g transform="rotate(${a} ${x} ${y}) translate(0 ${-70})"><g transform="rotate(180 ${x} ${y})">${sword(x, y, 0)}</g></g>`;
        g += stuck(64, 368, -8) + stuck(150, 358, 6) + stuck(276, 360, -14);
        for (let i = 0; i < 5; i++) { const x = 40 + i * 60 + r() * 20; g += `<path d="M${f1(x)} 400L${f1(x + 30 + r() * 20)} ${f1(250 + r() * 40)}" stroke="${sil}" stroke-width="1.6" opacity=".6"/>`; }
        break;
      }
      case "japanese": {
        g += `<path d="M58 336L150 232Q163 222 176 232L272 336Z" fill="${mix(base, "#fff", .1)}" opacity=".45"/><path d="M150 232Q163 222 176 232L188 248L174 241L163 251L152 241L138 248Z" fill="${hi}" opacity=".7"/>`;
        [[X0, 186, 110], [168, 214, 132], [X0, 262, 150], [190, 300, 110]].forEach(([x, y, w]) => { g += `<rect x="${x}" y="${y}" width="${w}" height="12" rx="6" fill="${acc}" opacity=".3"/><rect x="${x + 14}" y="${y + 3}" width="${w - 28}" height="3" rx="1.5" fill="${hi}" opacity=".25"/>`; });
        const tc = mix(acc, "#c8321e", .65);
        g += `<path d="M${X0} 380Q160 366 300 378V400H${X0}Z" ${silF}/>`;
        g += `<g opacity=".88"><path d="M44 292Q85 284 126 292L128 302Q85 294 42 302Z" fill="${tc}"/><rect x="50" y="303" width="72" height="6" fill="${sil}"/><rect x="52" y="316" width="68" height="6" fill="${tc}"/><rect x="60" y="302" width="7" height="82" fill="${tc}"/><rect x="105" y="302" width="7" height="82" fill="${tc}"/></g>`;
        // 松の枝
        g += `<path d="M300 92C266 96 244 108 224 124" stroke="${sil}" stroke-width="5" fill="none" opacity=".75"/>` + [[232, 112], [256, 100], [284, 92]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="7" fill="${mix(base, "#2a5a30", .55)}" opacity=".8"/>`).join("");
        break;
      }
      case "western": {
        g += `<path d="M86 400V300H240V400Z" ${silF}/><path d="M78 302L120 270H206L248 302Z" ${silF}/><path d="M146 270V220L163 186L180 220V270Z" ${silF}/><path d="M163 186V172" stroke="${sil}" stroke-width="2"/><circle cx="163" cy="236" r="7" fill="${acc}" opacity=".55"/>`;
        [[60, 330, 26], [240, 330, 26]].forEach(([x, y, w]) => { g += `<path d="M${x} 400V${y}L${x + w / 2} ${y - 22}L${x + w} ${y}V400Z" ${silF}/>`; });
        for (let x = 100; x < 232; x += 22) g += `<path d="M${x} 330V318A6 6 0 0 1 ${x + 12} 318V330Z" fill="${acc}" opacity="${r() < .7 ? .65 : .2}"/><path d="M${x} 370V358A6 6 0 0 1 ${x + 12} 358V370Z" fill="${acc}" opacity="${r() < .6 ? .6 : .2}"/>`;
        let fence = ""; for (let x = X0 + 4; x < 300; x += 9) fence += `M${x} 400V374M${x - 2.5} 376L${x} 368L${x + 2.5} 376`;
        g += `<path d="M${X0} 382H300M${X0} 394H300${fence}" stroke="${mix(sil, "#000", .3)}" stroke-width="1.6" fill="none"/>`;
        break;
      }
      case "love": {
        const hc = (k) => mix(acc, k ? "#ff6a9a" : "#ffb0c8", .6);
        [[70, 90, 46, .22], [250, 150, 60, .2], [110, 300, 70, .18], [230, 350, 40, .25], [190, 60, 24, .3], [60, 210, 22, .3]].forEach(([x, y, R0, o], i) => { g += `<g opacity="${o}">${emblemSVG("heart", x, y, R0, hc(i % 2), hc(i % 2))}</g>`; });
        for (let i = 0; i < 16; i++) { const x = X0 + 10 + r() * (W - 20), y = 10 + r() * 380; g += `<g opacity="${f1(.35 + r() * .4)}">${emblemSVG("heart", x, y, 3 + r() * 5, hc(i % 2), hc(i % 2))}</g>`; }
        g += `<path d="M${X0} 250C90 200 120 300 180 250S270 220 300 260" fill="none" stroke="${hc(1)}" stroke-width="2" opacity=".35"/>`;
        break;
      }
      case "fantasy": {
        const isle = (x, y, w, o) => `<g opacity="${o}"><path d="M${x - w} ${y}Q${x} ${y - 8} ${x + w} ${y}L${x + w * .45} ${y + w * .6}L${x + w * .1} ${y + w * 1.1}L${x - w * .3} ${y + w * .7}Z" fill="${sil}"/><path d="M${x - w} ${y}Q${x} ${y - 8} ${x + w} ${y}L${x + w} ${y + 3}Q${x} ${y - 4} ${x - w} ${y + 3}Z" fill="${mix(base, "#4a9a50", .5)}"/><circle cx="${x - w * .3}" cy="${y - 10}" r="${w * .22}" fill="${mix(base, "#3a7a40", .5)}"/><circle cx="${x + w * .25}" cy="${y - 8}" r="${w * .16}" fill="${mix(base, "#3a7a40", .5)}"/><rect x="${x + w * .55}" y="${y + 2}" width="3" height="${w * 1.6}" fill="${hi}" opacity=".35"/></g>`;
        g += isle(90, 120, 36, .7) + isle(232, 210, 46, .8) + isle(110, 300, 30, .6);
        for (let i = 0; i < 5; i++) { const x = 40 + i * 58 + r() * 14, h = 26 + r() * 30; g += `<path d="M${f1(x)} 400L${f1(x - 8)} ${f1(400 - h * .6)}L${f1(x)} ${f1(400 - h)}L${f1(x + 8)} ${f1(400 - h * .6)}Z" fill="${mix(acc, "#80d0ff", .5)}" opacity=".55"/><path d="M${f1(x)} ${f1(400 - h)}L${f1(x + 8)} ${f1(400 - h * .6)}L${f1(x)} 400Z" fill="#fff" opacity=".2"/>`; }
        for (let i = 0; i < 14; i++) g += `<path d="${star4(X0 + 10 + r() * (W - 20), 20 + r() * 220, 2 + r() * 3)}" fill="${hi}" opacity=".6"/>`;
        break;
      }
      case "dragon": {
        g += `<path d="M${X0} 400V350L80 300L130 340L190 280L250 330L300 300V400Z" ${farF}/>`;
        const dc = `fill="${sil}" opacity=".82"`;
        g += `<path d="M192 160L150 84L160 116L136 92L150 128L118 112L170 170Z" fill="${mix(sil, base, .35)}" opacity=".7"/>`;
        g += `<path d="M206 156L168 50L184 92L196 40L206 92L232 36L232 96L262 70L244 142Z" ${dc}/>`;
        g += `<ellipse cx="206" cy="166" rx="42" ry="16" transform="rotate(-14 206 166)" ${dc}/>`;
        g += `<path d="M236 150Q258 128 262 108L284 100L276 114L290 116L268 124Q262 148 242 168Z" ${dc}/><circle cx="270" cy="110" r="1.8" fill="${acc}"/>`;
        g += `<path d="M170 176Q122 196 96 178Q74 162 50 186L44 180Q72 150 98 168Q120 182 166 164Z" ${dc}/><path d="M48 184L36 178L42 192Z" ${dc}/>`;
        g += `<path d="M190 176L184 196L192 196M222 172L222 192L230 192" stroke="${sil}" stroke-width="5" fill="none" opacity=".82"/>`;
        g += `<path d="M286 112Q296 116 300 114" stroke="${mix(acc, "#ff8a40", .5)}" stroke-width="3" opacity=".7"/>`;
        break;
      }
      case "ryu": {
        const body = "M30 390C80 360 40 300 110 300S170 360 210 310S180 220 120 230S60 180 110 150S200 160 220 110";
        g += cloudSwirls(r, [[70, 120], [230, 250], [60, 350], [250, 360]], light, .28);
        g += `<path d="${body}" fill="none" stroke="${sil}" stroke-width="22" stroke-linecap="round" opacity=".85"/><path d="${body}" fill="none" stroke="${acc}" stroke-width="7" opacity=".28" transform="translate(2 5)"/><path d="${body}" fill="none" stroke="${acc}" stroke-width="14" stroke-dasharray="1.5 6" opacity=".22"/>`;
        g += `<g opacity=".9"><path d="M206 120L232 96L256 102L262 112L248 120L262 126L238 132Z" fill="${sil}"/><path d="M236 98L226 70M244 98L246 72" stroke="${sil}" stroke-width="3" stroke-linecap="round"/><path d="M258 112C276 116 286 134 280 150M256 124C270 136 272 154 262 166" stroke="${acc}" stroke-width="1.3" fill="none" opacity=".7"/><circle cx="240" cy="106" r="2" fill="${acc}"/><path d="M208 118C196 104 200 92 214 90M212 130C196 128 190 116 196 106" stroke="${sil}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
        g += `<circle cx="282" cy="96" r="9" fill="${acc}" opacity=".75"/><circle cx="279" cy="93" r="3" fill="#fff" opacity=".6"/>`;
        break;
      }
      case "serpent": {
        const body = "M36 392C150 370 60 300 150 280S250 210 160 180S110 110 196 92";
        g += `<path d="${body}" fill="none" stroke="${sil}" stroke-width="24" stroke-linecap="round" opacity=".82"/><path d="${body}" fill="none" stroke="${acc}" stroke-width="18" stroke-dasharray="5 4" opacity=".22"/><path d="${body}" fill="none" stroke="${mix(acc, "#fff", .3)}" stroke-width="3" opacity=".3" transform="translate(-4 -5)"/>`;
        g += `<path d="M190 82C204 74 228 78 236 90C228 102 204 106 190 98Z" fill="${sil}" opacity=".9"/><circle cx="222" cy="86" r="2.4" fill="${acc}"/><path d="M236 90H250M250 90L256 85M250 90L256 95" stroke="${mix(acc, "#d03030", .6)}" stroke-width="1.6" fill="none"/>`;
        break;
      }
      case "spider": {
        const web = (cx0, cy0, sx, sy, n, rad) => { let p = ""; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; p += `M${cx0} ${cy0}L${f1(cx0 + sx * Math.cos(a) * rad)} ${f1(cy0 + sy * Math.sin(a) * rad)}`; } for (let k = 1; k <= 5; k++) { const rr = rad * k / 5.4; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI / 2, a1 = (i + 1) / n * Math.PI / 2, am = (a0 + a1) / 2; p += `M${f1(cx0 + sx * Math.cos(a0) * rr)} ${f1(cy0 + sy * Math.sin(a0) * rr)}Q${f1(cx0 + sx * Math.cos(am) * rr * .86)} ${f1(cy0 + sy * Math.sin(am) * rr * .86)} ${f1(cx0 + sx * Math.cos(a1) * rr)} ${f1(cy0 + sy * Math.sin(a1) * rr)}`; } } return `<path d="${p}" fill="none" stroke="${hi}" stroke-width=".9" opacity=".4"/>`; };
        g += web(X0, 0, 1, 1, 7, 170) + web(300, 400, -1, -1, 6, 120);
        g += `<path d="M236 0V150" stroke="${hi}" stroke-width=".8" opacity=".5"/><g fill="${sil}" opacity=".9"><ellipse cx="236" cy="168" rx="9" ry="12"/><circle cx="236" cy="152" r="6"/></g>`;
        for (let i = 0; i < 4; i++) [-1, 1].forEach((sx) => { const y = 154 + i * 6; g += `<path d="M236 ${y}Q${236 + sx * 16} ${y - 10} ${236 + sx * 22} ${y + 6 + i * 3}" stroke="${sil}" stroke-width="2" fill="none" opacity=".9"/>`; });
        g += `<circle cx="233" cy="151" r="1.2" fill="${mix(acc, "#d03030", .5)}"/><circle cx="239" cy="151" r="1.2" fill="${mix(acc, "#d03030", .5)}"/>`;
        break;
      }
      case "rainbow": {
        ["#e05050", "#f09040", "#f0d050", "#60b060", "#4a90d0", "#5050a0", "#9060b0"].forEach((cl, i) => { g += `<path d="M${CX - 230 + i * 10} 420A${230 - i * 10} ${230 - i * 10} 0 0 1 ${CX + 230 - i * 10} 420" fill="none" stroke="${mix(cl, base, .25)}" stroke-width="10" opacity=".4"/>`; });
        const cl = (x, y, s) => `<g fill="${hi}" opacity=".55"><circle cx="${x}" cy="${y}" r="${14 * s}"/><circle cx="${x + 16 * s}" cy="${y - 8 * s}" r="${16 * s}"/><circle cx="${x + 34 * s}" cy="${y}" r="${13 * s}"/><rect x="${x}" y="${y}" width="${34 * s}" height="${13 * s}"/></g>`;
        g += cl(36, 392, 1.3) + cl(230, 392, 1.3) + cl(200, 90, .8);
        break;
      }
      case "chinese": {
        g += `<path d="M${X0} 360H300V400H${X0}Z" ${silF}/><circle cx="${CX}" cy="290" r="84" fill="none" stroke="${sil}" stroke-width="22" opacity=".75"/><path d="M${X0} 400V360H${CX - 96}M300 360H${CX + 96}" stroke="${sil}" stroke-width="4" opacity=".6"/>`;
        g += `<path d="M${X0} 44Q90 52 120 30H206Q236 52 300 44V60Q230 66 206 46H120Q96 66 ${X0} 60Z" fill="${sil}" opacity=".85"/><path d="M${X0} 66H300" stroke="${sil}" stroke-width="5" opacity=".7"/>`;
        const lan = (x, y) => { const red = mix(acc, "#d02a1e", .7); return `<path d="M${x} 66V${y - 16}" stroke="${sil}" stroke-width="1.2"/><rect x="${x - 8}" y="${y - 19}" width="16" height="5" rx="1" fill="${acc}"/><ellipse cx="${x}" cy="${y}" rx="16" ry="14" fill="${red}" opacity=".9"/><path d="M${x - 6} ${y - 13}Q${x - 10} ${y} ${x - 6} ${y + 13}M${x + 6} ${y - 13}Q${x + 10} ${y} ${x + 6} ${y + 13}" stroke="${mix(red, "#000", .3)}" fill="none"/><rect x="${x - 8}" y="${y + 13}" width="16" height="5" rx="1" fill="${acc}"/><path d="M${x} ${y + 18}V${y + 34}M${x - 3} ${y + 20}V${y + 32}M${x + 3} ${y + 20}V${y + 32}" stroke="${mix(acc, "#d02a1e", .5)}"/>`; };
        g += lan(64, 104) + lan(262, 112);
        break;
      }
      case "sakuratree": {
        const bc = mix(sil, "#3a2018", .3), pc = mix(acc, "#ffb6cc", .65);
        g += `<path d="M${X0} 400C60 330 50 260 90 210C120 170 170 150 220 150M84 230C70 180 80 130 120 100M100 200C150 210 200 230 250 250" fill="none" stroke="${bc}" stroke-width="9" stroke-linecap="round" opacity=".85"/><path d="M120 100C150 80 190 76 220 84M180 150C190 120 230 110 270 120" fill="none" stroke="${bc}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
        [[220, 150], [120, 100], [220, 84], [250, 250], [270, 120], [150, 200], [90, 160], [190, 120], [60, 260]].forEach(([x, y]) => { for (let k = 0; k < 7; k++) g += `<circle cx="${f1(x - 24 + r() * 48)}" cy="${f1(y - 18 + r() * 36)}" r="${f1(8 + r() * 10)}" fill="${pc}" opacity="${f1(.35 + r() * .3)}"/>`; });
        for (let i = 0; i < 14; i++) { const x = X0 + r() * W, y = 180 + r() * 210; g += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3.4" ry="2" transform="rotate(${f1(r() * 180)} ${f1(x)} ${f1(y)})" fill="${pc}" opacity=".7"/>`; }
        break;
      }
      case "constellation": {
        const pts = Array.from({ length: 9 }, () => [X0 + 24 + r() * (W - 48), 30 + r() * 320]);
        let p = ""; pts.forEach((q, i) => { if (i) p += `M${f1(pts[i - 1][0])} ${f1(pts[i - 1][1])}L${f1(q[0])} ${f1(q[1])}`; });
        g += `<path d="${p}" stroke="${acc}" stroke-width="1" opacity=".45"/>` + pts.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 3 ? 7 : 11}" fill="${hi}" opacity=".12"/><path d="${star4(x, y, i % 3 ? 4 : 7)}" fill="${hi}" opacity=".85"/>`).join("");
        for (let i = 0; i < 30; i++) g += `<circle cx="${f1(X0 + r() * W)}" cy="${f1(r() * 400)}" r="${f1(.4 + r() * .8)}" fill="${hi}" opacity=".5"/>`;
        break;
      }
      case "undersea": {
        for (let i = 0; i < 5; i++) { const x = 60 + i * 55; g += `<path d="M${x} 0L${x + 30} 0L${x + 70} 400L${x + 20} 400Z" fill="${hi}" opacity=".05"/>`; }
        for (let i = 0; i < 9; i++) { const x = X0 + 10 + r() * (W - 20), h = 60 + r() * 90; g += `<path d="M${f1(x)} 400C${f1(x - 14)} ${f1(400 - h * .3)} ${f1(x + 14)} ${f1(400 - h * .6)} ${f1(x - 4)} ${f1(400 - h)}" fill="none" stroke="${mix(base, "#3a8a5a", .5)}" stroke-width="${f1(3 + r() * 3)}" stroke-linecap="round" opacity=".7"/>`; }
        for (let i = 0; i < 14; i++) g += `<circle cx="${f1(X0 + r() * W)}" cy="${f1(r() * 380)}" r="${f1(1.5 + r() * 4)}" fill="none" stroke="${hi}" stroke-opacity=".45"/>`;
        [[90, 120, 1], [220, 220, -1], [140, 290, 1]].forEach(([x, y, s]) => { g += `<path d="M${x - s * 14} ${y}C${x - s * 6} ${y - 9} ${x + s * 8} ${y - 9} ${x + s * 14} ${y}C${x + s * 8} ${y + 9} ${x - s * 6} ${y + 9} ${x - s * 14} ${y}ZM${x - s * 12} ${y}L${x - s * 22} ${y - 7}V${y + 7}Z" fill="${sil}" opacity=".6"/>`; });
        g += `<path d="M${X0} 384Q160 370 300 386V400H${X0}Z" fill="${mix(base, acc, .3)}" opacity=".5"/>`;
        break;
      }
      case "graveyard": {
        g += `<circle cx="220" cy="100" r="44" fill="${acc}" opacity=".3"/>`;
        g += `<path d="M${X0} 372Q160 350 300 368V400H${X0}Z" ${silF}/>`;
        [[70, 352, 0], [130, 346, 1], [200, 350, 0], [262, 356, 1]].forEach(([x, y, k]) => { g += k ? `<path d="M${x - 3} ${y}V${y - 38}H${x - 14}V${y - 46}H${x - 3}V${y - 56}H${x + 3}V${y - 46}H${x + 14}V${y - 38}H${x + 3}V${y}Z" ${silF}/>` : `<path d="M${x - 14} ${y}V${y - 30}A14 14 0 0 1 ${x + 14} ${y - 30}V${y}Z" ${silF}/>`; });
        g += `<path d="M44 372C46 320 40 290 56 260M52 300L32 280M54 280L74 262M56 260L50 236M56 260L66 244" stroke="${sil}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/>`;
        [[180, 160, 1], [250, 190, .8], [120, 120, .7]].forEach(([x, y, s]) => { g += `<path d="M${x} ${y}q${-8 * s} ${-8 * s} ${-18 * s} ${-4 * s}q${4 * s} ${2 * s} ${2 * s} ${6 * s}q${-4 * s} ${-2 * s} ${-8 * s} ${2 * s}q${10 * s} 0 ${24 * s} ${-4 * s}q${14 * s} ${4 * s} ${24 * s} ${4 * s}q${-4 * s} ${-4 * s} ${-8 * s} ${-2 * s}q${-2 * s} ${-4 * s} ${2 * s} ${-6 * s}q${-10 * s} ${-4 * s} ${-18 * s} ${4 * s}Z" fill="${sil}" opacity=".85"/>`; });
        break;
      }
      case "magiccircle": {
        const mc = `fill="none" stroke="${acc}"`;
        g += `<g opacity=".3"><circle cx="${CX}" cy="200" r="126" ${mc} stroke-width="2"/><circle cx="${CX}" cy="200" r="114" ${mc} stroke-width="1"/><circle cx="${CX}" cy="200" r="70" ${mc} stroke-width="1.4"/><path d="${poly(CX, 200, 3, 114)}${poly(CX, 200, 3, 114, Math.PI / 2)}" ${mc} stroke-width="1.2"/><path d="${poly(CX, 200, 4, 70, 0)}${poly(CX, 200, 4, 70, Math.PI / 4)}" ${mc}/>`;
        for (let i = 0; i < 24; i++) { const a = i * TAU / 24, x = CX + Math.cos(a) * 120, y = 200 + Math.sin(a) * 120; g += `<path d="M${f1(x - 2)} ${f1(y - 3)}L${f1(x + 2)} ${f1(y + 3)}M${f1(x + 2)} ${f1(y - 3)}V${f1(y + 1)}" stroke="${acc}" stroke-width="1"/>`; }
        g += `</g>`;
        break;
      }
      case "gears": {
        const gear = (cx0, cy0, R0, n, o) => { let p = ""; const st = TAU / n; for (let i = 0; i < n; i++) { const a0 = i * st; [[a0, R0 * .82], [a0 + st * .12, R0], [a0 + st * .42, R0], [a0 + st * .54, R0 * .82]].forEach(([a, rr], k) => { p += (i || k ? "L" : "M") + f1(cx0 + Math.cos(a) * rr) + " " + f1(cy0 + Math.sin(a) * rr); }); } return `<path d="${p}Z" fill="${sil}" opacity="${o}"/><circle cx="${cx0}" cy="${cy0}" r="${f1(R0 * .5)}" fill="none" stroke="${acc}" stroke-width="${f1(R0 * .06)}" opacity="${o * .6}"/><circle cx="${cx0}" cy="${cy0}" r="${f1(R0 * .16)}" fill="${acc}" opacity="${o * .7}"/>`; };
        g += gear(280, 70, 64, 16, .55) + gear(206, 112, 34, 10, .5) + gear(60, 360, 74, 18, .55) + gear(150, 386, 40, 12, .5) + gear(46, 120, 26, 9, .4);
        break;
      }
      case "space": {
        g += `<circle cx="250" cy="340" r="70" fill="${mix(base, acc, .35)}" opacity=".7"/><ellipse cx="250" cy="340" rx="118" ry="22" transform="rotate(-18 250 340)" fill="none" stroke="${acc}" stroke-width="5" opacity=".5"/><circle cx="226" cy="318" r="22" fill="#fff" opacity=".08"/>`;
        g += `<circle cx="80" cy="90" r="22" fill="${mix(base, "#d08a5a", .5)}" opacity=".7"/><circle cx="74" cy="84" r="7" fill="#fff" opacity=".1"/><circle cx="150" cy="150" r="7" fill="${light}" opacity=".7"/>`;
        for (let i = 0; i < 50; i++) g += `<circle cx="${f1(X0 + r() * W)}" cy="${f1(r() * 400)}" r="${f1(.4 + r() * 1.1)}" fill="${hi}" opacity="${f1(.3 + r() * .5)}"/>`;
        g += `<path d="M60 230L130 196" stroke="${hi}" stroke-width="1.4" stroke-linecap="round" opacity=".6"/><circle cx="130" cy="196" r="2.4" fill="${hi}"/>`;
        break;
      }
      case "lighthouse": {
        g += `<path d="M228 120L${X0} 40V96Z" fill="${acc}" opacity=".18"/><path d="M228 120L300 70V110Z" fill="${acc}" opacity=".14"/>`;
        g += `<rect x="${X0}" y="330" width="${W}" height="70" fill="${sil}" opacity=".4"/>`;
        for (let y = 340; y < 400; y += 12) for (let x = X0 + (y % 24); x < 300; x += 36) g += `<path d="M${x} ${y}q7 -4 14 0" stroke="${hi}" stroke-opacity=".25" fill="none"/>`;
        g += `<path d="M190 360Q206 330 246 332Q290 330 300 350V400H180Z" ${silF}/><path d="M214 340L220 136H236L242 340Z" ${silF}/><rect x="216" y="110" width="24" height="26" fill="${acc}" opacity=".7"/><path d="M212 110L228 92L244 110Z" ${silF}/><path d="M216 190H240M215 250H241" stroke="${acc}" stroke-width="5" opacity=".35"/>`;
        break;
      }
      case "snowtown": {
        g += `<path d="M${X0} 360Q160 344 300 356V400H${X0}Z" fill="${hi}" opacity=".55"/>`;
        [[50, 330, 40], [104, 320, 48], [170, 334, 40], [226, 316, 52]].forEach(([x, y, w]) => { g += `<path d="M${x} 370V${y}H${x + w}V370Z" ${silF}/><path d="M${x - 6} ${y + 2}L${x + w / 2} ${y - w * .5}L${x + w + 6} ${y + 2}Z" ${silF}/><path d="M${x - 6} ${y + 2}L${x + w / 2} ${y - w * .5}L${x + w + 6} ${y + 2}L${x + w + 2} ${y - 2}L${x + w / 2} ${y - w * .5 + 6}L${x - 2} ${y - 2}Z" fill="${hi}" opacity=".8"/><rect x="${x + w / 2 - 6}" y="${y + 12}" width="12" height="12" fill="${acc}" opacity=".75"/>`; });
        [[282, 372], [36, 380]].forEach(([x, y]) => { g += `<path d="M${x} ${y - 56}L${x + 16} ${y - 20}H${x - 16}ZM${x} ${y - 40}L${x + 20} ${y}H${x - 20}Z" ${silF}/><path d="M${x} ${y - 56}L${x + 8} ${y - 38}H${x - 8}Z" fill="${hi}" opacity=".7"/>`; });
        for (let i = 0; i < 30; i++) g += `<circle cx="${f1(X0 + r() * W)}" cy="${f1(r() * 330)}" r="${f1(.8 + r() * 1.6)}" fill="#fff" opacity="${f1(.4 + r() * .4)}"/>`;
        break;
      }
    }

    /* ---------- 地模様 ---------- */
    const pat = (w, h, body, op = .2, pid = "pt") => { d += `<pattern id="${id}${pid}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern>`; g += `<rect x="${X0}" width="${W}" height="400" fill="url(#${id}${pid})" opacity="${op}"/>`; };
    switch (P.pattern) {
      case "dots": pat(24, 24, `<circle cx="6" cy="6" r="2.6" fill="${acc}"/><circle cx="18" cy="18" r="2.6" fill="${acc}"/>`); break;
      case "diamonds": pat(26, 26, `<path d="M13 1L25 13L13 25L1 13Z" fill="none" stroke="${acc}" stroke-width="1"/><circle cx="13" cy="13" r="1.6" fill="${acc}"/>`); break;
      case "stripes": pat(18, 18, `<path d="M0 18L18 0" stroke="${acc}" stroke-width="3"/>`, .14); break;
      case "waves": pat(40, 20, `<path d="M0 20A20 20 0 0 1 40 20M6 20A14 14 0 0 1 34 20M12 20A8 8 0 0 1 28 20M-20 10A20 20 0 0 1 20 10M20 10A20 20 0 0 1 60 10" fill="none" stroke="${acc}" stroke-width="1.2"/>`, .22); break;
      case "stars": pat(40, 40, `<path d="${star4(10, 10, 4)}${star4(30, 28, 3)}" fill="${acc}"/><circle cx="28" cy="8" r="1" fill="${acc}"/>`, .3); break;
      case "scales": pat(24, 14, `<path d="M0 14A12 12 0 0 1 24 14M-12 7A12 12 0 0 1 12 7M12 7A12 12 0 0 1 36 7" fill="none" stroke="${acc}" stroke-width="1.1"/>`, .22); break;
      case "checks": pat(30, 30, `<rect width="15" height="15" fill="${acc}"/><rect x="15" y="15" width="15" height="15" fill="${acc}"/>`, .1); break;
      case "lattice": pat(28, 28, `<path d="M0 0L28 28M28 0L0 28" stroke="${acc}" stroke-width="1"/><circle cx="14" cy="14" r="2" fill="${acc}"/>`, .2); break;
      case "vines": pat(60, 60, `<path d="M0 30C15 10 30 50 45 30S60 30 60 30" fill="none" stroke="${acc}" stroke-width="1.4"/><path d="M15 18c6-6 12-4 12 2c-6 2-10 2-12-2ZM45 42c-6 6-12 4-12-2c6-2 10-2 12 2Z" fill="${acc}"/>`, .2); break;
      case "hexes": pat(30, 26, `<path d="M8 0H22L30 13L22 26H8L0 13Z" fill="none" stroke="${acc}" stroke-width="1"/>`, .2); break;
      case "rays": for (let i = 0; i < 24; i++) { const a0 = i * Math.PI / 12, a1 = a0 + Math.PI / 24; g += `<path d="M${CX} 200L${f1(CX + Math.cos(a0) * 420)} ${f1(200 + Math.sin(a0) * 420)}L${f1(CX + Math.cos(a1) * 420)} ${f1(200 + Math.sin(a1) * 420)}Z" fill="${acc}" opacity=".07"/>`; } break;
      case "hearts": pat(36, 36, `<path d="M9 14C3 9 5 4 9 7C13 4 15 9 9 14ZM27 32C21 27 23 22 27 25C31 22 33 27 27 32Z" fill="${acc}"/>`, .22); break;
      case "crosses": pat(26, 26, `<path d="M6 3V9M3 6H9M19 16V22M16 19H22" stroke="${acc}" stroke-width="1.6" stroke-linecap="round"/>`, .3); break;
      case "asanoha": {
        const s = 30, h = s * .866; let p = "";
        for (let j = -1; j < 400 / h + 1; j++) for (let i = -1; i < W / s + 2; i++) {
          const ox = X0 + i * s + (j % 2 ? s / 2 : 0), oy = j * h;
          const A = [ox, oy], B = [ox + s, oy], C = [ox + s / 2, oy + h], D = [ox + s * 1.5, oy + h];
          [[A, B, C], [B, D, C]].forEach(([a, b, cc]) => { const gx = (a[0] + b[0] + cc[0]) / 3, gy = (a[1] + b[1] + cc[1]) / 3; p += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(cc[0])} ${f1(cc[1])}ZM${f1(gx)} ${f1(gy)}L${f1(a[0])} ${f1(a[1])}M${f1(gx)} ${f1(gy)}L${f1(b[0])} ${f1(b[1])}M${f1(gx)} ${f1(gy)}L${f1(cc[0])} ${f1(cc[1])}`; });
        }
        d += `<clipPath id="${id}ac"><rect x="${X0}" width="${W}" height="400"/></clipPath>`;
        g += `<path d="${p}" fill="none" stroke="${acc}" stroke-width=".9" opacity=".22" clip-path="url(#${id}ac)"/>`;
        break;
      }
      case "shippo": pat(24, 24, `<circle cx="12" cy="12" r="12" fill="none" stroke="${acc}" stroke-width="1"/><circle cx="0" cy="0" r="12" fill="none" stroke="${acc}" stroke-width="1"/><circle cx="24" cy="0" r="12" fill="none" stroke="${acc}" stroke-width="1"/><circle cx="0" cy="24" r="12" fill="none" stroke="${acc}" stroke-width="1"/><circle cx="24" cy="24" r="12" fill="none" stroke="${acc}" stroke-width="1"/>`, .22); break;
      case "clouds": pat(64, 44, `<path d="M6 20c0-8 10-10 14-4c2-8 14-8 16 0c6-2 10 4 6 8H8c-2 0-2-2-2-4Z M38 40c0-6 8-8 11-3c2-6 11-6 12 0" fill="none" stroke="${acc}" stroke-width="1.2"/><path d="M14 22c3-3 7-3 9 0" fill="none" stroke="${acc}" stroke-width="1"/>`, .24); break;
      case "zigzag": pat(20, 14, `<path d="M0 10L5 4L10 10L15 4L20 10" fill="none" stroke="${acc}" stroke-width="1.6"/>`, .22); break;
      case "plaid":
        pat(40, 40, `<rect y="12" width="40" height="8" fill="${acc}"/><rect x="12" width="8" height="40" fill="${acc}"/><rect y="30" width="40" height="2" fill="${acc}"/><rect x="30" width="2" height="40" fill="${acc}"/>`, .14);
        break;
      case "florets": pat(34, 34, `<g fill="${acc}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f1(9 + Math.cos(a * Math.PI / 180) * 3)}" cy="${f1(9 + Math.sin(a * Math.PI / 180) * 3)}" r="2.2"/>`).join("")}<circle cx="26" cy="26" r="1.6"/></g><circle cx="9" cy="9" r="1.4" fill="${hi}"/>`, .3); break;
      case "ripples": pat(40, 40, `<circle cx="20" cy="20" r="5" fill="none" stroke="${acc}"/><circle cx="20" cy="20" r="10" fill="none" stroke="${acc}" stroke-opacity=".7"/><circle cx="20" cy="20" r="15" fill="none" stroke="${acc}" stroke-opacity=".4"/>`, .22); break;
      case "bricks": pat(32, 16, `<path d="M0 .5H32M0 8.5H32M.5 0V8M16.5 8V16" stroke="${acc}" stroke-width="1"/>`, .2); break;
      case "triangles": pat(20, 18, `<path d="M0 18L10 0L20 18Z" fill="${acc}"/>`, .1); break;
      case "crescents": pat(36, 36, `<path d="${crescentPath(10, 10, 4.5)}${crescentPath(27, 27, 3.5)}" fill="${acc}"/>`, .3); break;
    }

    /* ---------- ちらし ---------- */
    const scatter = (n, fn) => { for (let i = 0; i < n; i++) g += fn(X0 + 10 + r() * (W - 20), 10 + r() * 380, r()); };
    const rot = (k, x, y) => `transform="rotate(${f1(k * 360)} ${f1(x)} ${f1(y)})"`;
    switch (P.sparkle) {
      case "stars": scatter(18, (x, y, k) => `<path d="${star4(x, y, 2 + k * 5)}" fill="${hi}" opacity="${f1(.35 + k * .5)}"/>`); break;
      case "glitter": scatter(12, (x, y, k) => { const s = 5 + k * 9; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s * .45)}" fill="${hi}" opacity=".12"/><path d="M${f1(x - s)} ${f1(y)}H${f1(x + s)}M${f1(x)} ${f1(y - s)}V${f1(y + s)}" stroke="${hi}" stroke-width=".9" opacity=".75"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.4" fill="${hi}"/>`; }); break;
      case "petals": scatter(16, (x, y, k) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(3 + k * 3)}" ry="${f1(1.6 + k * 1.4)}" transform="rotate(${f1(k * 180)} ${f1(x)} ${f1(y)})" fill="${mix(acc, "#ffd6e6", .5)}" opacity=".7"/>`); break;
      case "sakura": scatter(12, (x, y, k) => `<g opacity="${f1(.5 + k * .4)}" ${rot(k, x, y)}>${emblemExtra("sakura", x, y, 4 + k * 4, mix(acc, "#ffc0d8", .65), "#fff")}</g>`); break;
      case "bubbles": scatter(16, (x, y, k) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2 + k * 7)}" fill="none" stroke="${hi}" stroke-opacity=".45"/>`); break;
      case "snow": scatter(22, (x, y, k) => { const s = 2 + k * 4; return `<path d="M${f1(x - s)} ${f1(y)}H${f1(x + s)}M${f1(x)} ${f1(y - s)}V${f1(y + s)}M${f1(x - s * .7)} ${f1(y - s * .7)}L${f1(x + s * .7)} ${f1(y + s * .7)}M${f1(x + s * .7)} ${f1(y - s * .7)}L${f1(x - s * .7)} ${f1(y + s * .7)}" stroke="${hi}" stroke-opacity=".6" stroke-width="1"/>`; }); break;
      case "rain": scatter(40, (x, y, k) => `<path d="M${f1(x)} ${f1(y)}l-4 ${f1(8 + k * 8)}" stroke="${hi}" stroke-opacity="${f1(.2 + k * .3)}" stroke-width="1" stroke-linecap="round"/>`); break;
      case "leaves": scatter(14, (x, y, k) => `<path d="M${f1(x)} ${f1(y)}c6-8 14-6 14 0c-6 6-10 6-14 0Z" ${rot(k, x, y)} fill="${acc}" opacity=".55"/>`); break;
      case "embers": scatter(26, (x, y, k) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.8 + k * 2)}" fill="${mix(acc, "#ff8a40", .5)}" opacity="${f1(.3 + k * .6)}"/>`); break;
      case "moons": scatter(8, (x, y, k) => `<g opacity="${f1(.4 + k * .45)}">${emblemSVG("moon", x, y, 4 + k * 5, hi, hi)}</g>`); break;
      case "hearts": scatter(12, (x, y, k) => `<g opacity="${f1(.45 + k * .4)}" transform="rotate(${f1(-25 + k * 50)} ${f1(x)} ${f1(y)})">${emblemSVG("heart", x, y, 4 + k * 5, mix(acc, "#ff7aa0", .5), mix(acc, "#ff7aa0", .5))}</g>`); break;
      case "feathers": scatter(9, (x, y, k) => `<g opacity="${f1(.4 + k * .4)}" ${rot(k, x, y)}>${emblemSVG("feather", x, y, 6 + k * 8, hi, hi)}</g>`); break;
      case "notes": scatter(10, (x, y, k) => `<g opacity="${f1(.4 + k * .45)}">${emblemExtra("note", x, y, 5 + k * 5, hi, hi)}</g>`); break;
      case "butterflies": scatter(8, (x, y, k) => `<g opacity="${f1(.45 + k * .45)}" transform="rotate(${f1(-30 + k * 60)} ${f1(x)} ${f1(y)})">${emblemSVG("butterfly", x, y, 6 + k * 6, mix(acc, "#fff", .3), hi)}</g>`); break;
      case "fireflies": scatter(16, (x, y, k) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(4 + k * 5)}" fill="${mix(acc, "#e0ff80", .5)}" opacity=".14"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1 + k * 1.2)}" fill="${mix(acc, "#f0ffb0", .6)}" opacity=".9"/>`); break;
      case "dust": scatter(60, (x, y, k) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.4 + k * 1.1)}" fill="${hi}" opacity="${f1(.2 + k * .5)}"/>`); break;
    }

    /* ---------- 背 ---------- */
    const spineRect = `<rect width="34" height="400" rx="6" fill="${dark}"/>`;
    switch (P.spine) {
      case "plain": g += spineRect; break;
      case "banded": g += spineRect + [70, 110, 290, 330].map((y) => `<rect x="0" y="${y}" width="34" height="8" fill="${metal}"/>`).join(""); break;
      case "gilt": g += spineRect + `<path d="M38 0V400M42 0V400" stroke="${acc}" stroke-width="1.4" opacity=".85"/>`; break;
      case "studs": g += spineRect + [30, 100, 170, 240, 310, 370].map((y) => `<circle cx="17" cy="${y}" r="4" fill="${metal}" stroke="#3a2a14" stroke-width=".8"/>`).join(""); break;
      case "raised": g += spineRect + [60, 130, 200, 270, 340].map((y) => `<rect x="0" y="${y - 5}" width="34" height="10" rx="2" fill="${mix(dark, "#fff", .14)}"/><path d="M0 ${y - 5}H34" stroke="#fff" stroke-opacity=".3"/><path d="M0 ${y + 5}H34" stroke="#000" stroke-opacity=".45" stroke-width="1.5"/>`).join(""); break;
      case "stitched": g += spineRect + `<path d="M38 8V392" stroke="${acc}" stroke-width="1.8" stroke-dasharray="6 4" opacity=".85"/><path d="M6 8V392" stroke="${acc}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".55"/>`; break;
      case "wajitoji": {
        const tc = mix(acc, "#fff", .3), ys = [52, 146, 254, 348];
        g += `<rect x="0" y="0" width="22" height="22" fill="${mix(acc, base, .4)}"/><rect x="0" y="378" width="22" height="22" fill="${mix(acc, base, .4)}"/>`;
        g += `<path d="M16 ${ys[0]}V${ys[3]}M16 ${ys[0]}V0M16 ${ys[3]}V400" stroke="${tc}" stroke-width="2.6"/>` + ys.map((y) => `<path d="M0 ${y}H16" stroke="${tc}" stroke-width="2.6"/><circle cx="16" cy="${y}" r="2.6" fill="#1a1410"/>`).join("") + `<path d="M0 22H16" stroke="${tc}" stroke-width="2.6"/><path d="M0 378H16" stroke="${tc}" stroke-width="2.6"/>`;
        break;
      }
      case "chain": { g += spineRect; for (let y = 6; y < 400; y += 16) g += (y / 16 | 0) % 2 ? `<rect x="15" y="${y}" width="4" height="14" rx="2" fill="${metal}"/>` : `<rect x="11" y="${y}" width="12" height="14" rx="6" fill="none" stroke="${metal}" stroke-width="3"/>`; break; }
      case "cloth": {
        const cc = mix(acc, base, .55);
        d += `<pattern id="${id}sc" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 2H4" stroke="#000" stroke-opacity=".15"/></pattern>`;
        g += `<rect width="52" height="400" rx="6" fill="${cc}"/><rect width="52" height="400" rx="6" fill="url(#${id}sc)"/><path d="M52 0V400" stroke="#000" stroke-opacity=".35" stroke-width="2"/><path d="M54 0V400" stroke="${acc}" stroke-opacity=".6"/>`;
        break;
      }
    }

    /* ---------- 帯 ---------- */
    const hband = (y, h) => `<rect x="${X0}" y="${y}" width="${W}" height="${h}" fill="${acc}" opacity=".85"/><rect x="${X0}" y="${y + h + 4}" width="${W}" height="2" fill="${acc}" opacity=".55"/>`;
    switch (P.band) {
      case "top": g += hband(28, 20); break;
      case "bottom": g += hband(352, 20); break;
      case "both": g += hband(28, 16) + hband(356, 16); break;
      case "middle": g += hband(186, 28); break;
      case "sash": g += `<path d="M${X0} 310L300 150V196L${X0} 356Z" fill="${acc}" opacity=".8"/>`; break;
      case "vertical": g += `<rect x="226" y="0" width="24" height="400" fill="${acc}" opacity=".8"/><rect x="254" y="0" width="2" height="400" fill="${acc}" opacity=".55"/>`; break;
      case "cross": g += `<rect x="${X0}" y="188" width="${W}" height="22" fill="${acc}" opacity=".75"/><rect x="152" y="0" width="22" height="400" fill="${acc}" opacity=".75"/>`; break;
      case "wave": { let p = `M${X0} 352`; for (let x = X0; x < 300; x += 28) p += `q7 -10 14 0t14 0`; g += `<path d="${p}V400H${X0}Z" fill="${acc}" opacity=".7"/><path d="${p.replace(/352/, "342")}" fill="none" stroke="${acc}" stroke-width="2" opacity=".5"/>`; break; }
      case "corner": g += `<path d="M216 0H300V84Z" fill="${acc}" opacity=".85"/><path d="M204 0H212L300 88V96Z" fill="${acc}" opacity=".5"/><path d="M${X0} 316V400H110Z" fill="${acc}" opacity=".85"/><path d="M${X0} 304V312L118 400H110Z" fill="${acc}" opacity=".5"/>`; break;
      case "lines": [34, 40, 46, 354, 360, 366].forEach((y, i) => { g += `<path d="M${X0} ${y}H300" stroke="${acc}" stroke-width="${i % 3 === 1 ? 2.4 : 1}" opacity=".8"/>`; }); break;
      case "lace": {
        g += `<rect x="${X0}" y="364" width="${W}" height="36" fill="${hi}" opacity=".7"/>`;
        for (let x = X0 + 6; x < 300; x += 12) g += `<circle cx="${x}" cy="364" r="6" fill="${hi}" opacity=".7"/><circle cx="${x}" cy="376" r="2" fill="${base}" opacity=".7"/>`;
        g += `<path d="M${X0} 388H300" stroke="${base}" stroke-opacity=".4" stroke-dasharray="2 3"/>`;
        break;
      }
    }

    const cornersAt = (fn) => [[X0, 0, 1, 1], [300, 0, -1, 1], [X0, 400, 1, -1], [300, 400, -1, -1]].map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${fn()}</g>`).join("");
    /* ---------- 枠 ---------- */
    const { x: fx0, y: fy0, w: fw, h: fh } = FR;
    const wavy = (ins, amp, period, fn, sw, extra = "") => { const pts = perimPts(ins, period / 8); const pd = pts.map(([x, y, nx, ny], i) => { const o = amp * fn(i / 8); return `${i ? "L" : "M"}${f1(x + nx * o)} ${f1(y + ny * o)}`; }).join("") + "Z"; return `<path d="${pd}" fill="none" stroke="${acc}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`; };
    switch (P.frame) {
      case "single": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="2.4"/>`; break;
      case "double": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="5" fill="none" stroke="${acc}" stroke-width="2.4" opacity=".9"/><rect x="${fx0 + 9}" y="${fy0 + 9}" width="${fw - 18}" height="${fh - 18}" rx="3" fill="none" stroke="${acc}" stroke-width="1" opacity=".55"/>`; break;
      case "triple": [0, 7, 13].forEach((k, i) => { g += `<rect x="${fx0 + k}" y="${fy0 + k}" width="${fw - k * 2}" height="${fh - k * 2}" fill="none" stroke="${acc}" stroke-width="${[2.6, 1, 1.6][i]}" opacity="${[.95, .6, .8][i]}"/>`; }); break;
      case "rounded": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="26" fill="none" stroke="${acc}" stroke-width="3"/>`; break;
      case "deco": { const st = (k, o) => { const a = fx0 + k, b = fx0 + fw - k, t = fy0 + k, u = fy0 + fh - k, n = 14; return `<path d="M${a + n} ${t}H${b - n}V${t + n}H${b}V${u - n}H${b - n}V${u}H${a + n}V${u - n}H${a}V${t + n}H${a + n}Z" fill="none" stroke="${acc}" stroke-width="${k ? 1 : 2.4}" opacity="${o}"/>`; }; g += st(0, .9) + st(8, .55); break; }
      case "gothic": g += `<path d="M${fx0} ${fy0 + fh}V${fy0 + 120}Q${fx0} ${fy0} ${CX} ${fy0}Q${fx0 + fw} ${fy0} ${fx0 + fw} ${fy0 + 120}V${fy0 + fh}Z" fill="none" stroke="${acc}" stroke-width="2.6"/><path d="M${fx0 + 10} ${fy0 + fh - 10}V${fy0 + 126}Q${fx0 + 10} ${fy0 + 12} ${CX} ${fy0 + 12}Q${fx0 + fw - 10} ${fy0 + 12} ${fx0 + fw - 10} ${fy0 + 126}V${fy0 + fh - 10}Z" fill="none" stroke="${acc}" stroke-width="1" opacity=".55"/>`; break;
      case "dotted": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="4" fill="none" stroke="${acc}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>`; break;
      case "rope": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="6" fill="none" stroke="${acc}" stroke-width="5"/><rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="6" fill="none" stroke="${dark}" stroke-width="5" stroke-dasharray="3 5" opacity=".5"/>`; break;
      case "vine": {
        const vine = (x, dir) => { let v = `<path d="M${x} ${fy0 + fh}C${x + dir * 14} 300 ${x - dir * 12} 240 ${x + dir * 8} 180S${x - dir * 10} 60 ${x + dir * 4} ${fy0}" fill="none" stroke="${acc}" stroke-width="2.4"/>`; for (let y = 40; y < 380; y += 36) { const a = (y / 36) % 2 ? 1 : -1; v += `<path d="M${x} ${y}c${a * 14} -5 ${a * 20} -14 ${a * 17} -20c${-a * 10} 2 ${-a * 17} 11 ${-a * 17} 20Z" fill="${acc}" opacity=".85"/>`; } return v; };
        g += vine(fx0, 1) + vine(fx0 + fw, -1); break;
      }
      case "filigree": {
        g += `<path d="M${fx0 + 24} ${fy0}H${fx0 + fw - 24}A24 24 0 0 0 ${fx0 + fw} ${fy0 + 24}V${fy0 + fh - 24}A24 24 0 0 0 ${fx0 + fw - 24} ${fy0 + fh}H${fx0 + 24}A24 24 0 0 0 ${fx0} ${fy0 + fh - 24}V${fy0 + 24}A24 24 0 0 0 ${fx0 + 24} ${fy0}Z" fill="none" stroke="${acc}" stroke-width="2.4"/>`;
        [[CX, fy0], [CX, fy0 + fh]].forEach(([x, y], k) => { const s = k ? -1 : 1; g += `<path d="M${x - 40} ${y}C${x - 30} ${y + s * 14} ${x - 12} ${y + s * 14} ${x} ${y + s * 4}C${x + 12} ${y + s * 14} ${x + 30} ${y + s * 14} ${x + 40} ${y}" fill="none" stroke="${acc}" stroke-width="1.8"/><circle cx="${x}" cy="${y + s * 6}" r="3.5" fill="${acc}"/>`; });
        break;
      }
      case "wave": g += wavy(0, 3.5, 24, (p) => Math.sin(p * TAU), 2.2) + wavy(9, 0, 24, () => 0, 1, `opacity=".5"`); break;
      case "zigzag": g += wavy(0, 4, 16, (p) => 4 * Math.abs(((p + .25) % 1) - .5) - 1, 2) + `<rect x="${fx0 + 10}" y="${fy0 + 10}" width="${fw - 20}" height="${fh - 20}" fill="none" stroke="${acc}" stroke-width="1" opacity=".5"/>`; break;
      case "beads": g += perimPts(0, 12).map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 2.2 : 3.6}" fill="${i % 2 ? acc : metal}"/>`).join(""); break;
      case "chain": g += perimPts(0, 13).map(([x, y, nx], i) => { const hz = nx === 0; return i % 2 ? `<path d="M${f1(x - (hz ? 6 : 0))} ${f1(y - (hz ? 0 : 6))}L${f1(x + (hz ? 6 : 0))} ${f1(y + (hz ? 0 : 6))}" stroke="${metal}" stroke-width="3.4" stroke-linecap="round"/>` : `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${hz ? 8 : 4}" ry="${hz ? 4 : 8}" fill="none" stroke="${metal}" stroke-width="2.4"/>`; }).join(""); break;
      case "greek": {
        d += `<pattern id="${id}gk" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M1 15V1H15V12H5V5H11V9" fill="none" stroke="${acc}" stroke-width="1.6"/></pattern>`;
        const b = 16;
        g += `<path d="M${fx0} ${fy0}h${fw}v${fh}h${-fw}ZM${fx0 + b} ${fy0 + b}v${fh - b * 2}h${fw - b * 2}v${-(fh - b * 2)}Z" fill="url(#${id}gk)" fill-rule="evenodd" opacity=".85"/><rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.6"/><rect x="${fx0 + b}" y="${fy0 + b}" width="${fw - b * 2}" height="${fh - b * 2}" fill="none" stroke="${acc}" stroke-width="1.2"/>`;
        break;
      }
      case "thorns": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="2"/>` + perimPts(0, 18).map(([x, y, nx, ny], i) => { const s = i % 2 ? 1 : -1, tx = -ny, ty = nx; return `<path d="M${f1(x - tx * 3)} ${f1(y - ty * 3)}L${f1(x + nx * s * 8 + tx * 2)} ${f1(y + ny * s * 8 + ty * 2)}L${f1(x + tx * 3)} ${f1(y + ty * 3)}Z" fill="${acc}"/>`; }).join(""); break;
      case "scallop": g += wavy(0, 5, 20, (p) => -Math.abs(Math.sin(p * Math.PI)), 2.2) + `<rect x="${fx0 + 8}" y="${fy0 + 8}" width="${fw - 16}" height="${fh - 16}" fill="none" stroke="${acc}" stroke-width="1" opacity=".55"/>`; break;
      case "lace": g += wavy(0, 6, 20, (p) => -Math.abs(Math.sin(p * Math.PI)), 1.8) + perimPts(4, 10).map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${acc}" opacity=".8"/>`).join("") + `<rect x="${fx0 + 10}" y="${fy0 + 10}" width="${fw - 20}" height="${fh - 20}" fill="none" stroke="${acc}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`; break;
      case "notched": { const k = 20, a = fx0, b = fx0 + fw, t = fy0, u = fy0 + fh; const pth = (o) => `M${a + k + o} ${t + o}H${b - k - o}A${k} ${k} 0 0 0 ${b - o} ${t + k + o}V${u - k - o}A${k} ${k} 0 0 0 ${b - k - o} ${u - o}H${a + k + o}A${k} ${k} 0 0 0 ${a + o} ${u - k - o}V${t + k + o}A${k} ${k} 0 0 0 ${a + k + o} ${t + o}Z`; g += `<path d="${pth(0)}" fill="none" stroke="${acc}" stroke-width="2.6"/><path d="${pth(8)}" fill="none" stroke="${acc}" stroke-width="1" opacity=".55"/>`; break; }
      case "nouveau": {
        g += `<rect x="${fx0 + 6}" y="${fy0 + 6}" width="${fw - 12}" height="${fh - 12}" rx="14" fill="none" stroke="${acc}" stroke-width="1.2" opacity=".7"/>`;
        g += cornersAt(() => `<path d="M18 120C18 60 30 34 60 26C90 18 110 30 130 24M18 120C26 96 30 70 46 56C58 46 74 48 74 62C74 74 58 76 54 66" fill="none" stroke="${acc}" stroke-width="2.4" stroke-linecap="round"/><path d="M30 92c8-10 20-10 22 0c-10 6-18 6-22 0Z" fill="${acc}" opacity=".85"/>`);
        break;
      }
      case "baroque": {
        g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="3" fill="none" stroke="${metal}" stroke-width="4"/><rect x="${fx0 + 8}" y="${fy0 + 8}" width="${fw - 16}" height="${fh - 16}" fill="none" stroke="${acc}" stroke-width="1" opacity=".7"/>`;
        g += cornersAt(() => `<path d="M18 70C18 40 40 18 70 18M18 70C30 70 38 62 38 52C38 44 30 40 26 46M70 18C70 30 62 38 52 38C44 38 40 30 46 26" fill="none" stroke="${metal}" stroke-width="3.4" stroke-linecap="round"/><circle cx="30" cy="30" r="5" fill="${metal}"/>`);
        [fy0, fy0 + fh].forEach((y, k) => { const s = k ? -1 : 1; g += `<path d="M${CX - 34} ${y}C${CX - 26} ${y - s * 16} ${CX - 8} ${y - s * 16} ${CX} ${y - s * 4}C${CX + 8} ${y - s * 16} ${CX + 26} ${y - s * 16} ${CX + 34} ${y}C${CX + 18} ${y + s * 8} ${CX - 18} ${y + s * 8} ${CX - 34} ${y}Z" fill="${metal}"/><circle cx="${CX}" cy="${y + s * 2}" r="4" fill="${hi}" opacity=".8"/>`; });
        break;
      }
      case "kasumi": {
        g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.4" opacity=".75"/>`;
        const bar = (x, y, w) => `<path d="M${x + 8} ${y}H${x + w - 8}A8 8 0 0 1 ${x + w - 8} ${y + 16}H${x + 8}A8 8 0 0 1 ${x + 8} ${y}Z" fill="${metal}" opacity=".85"/><path d="M${x + 14} ${y + 5}H${x + w - 20}" stroke="${hi}" stroke-width="1.4" opacity=".5"/>`;
        g += bar(fx0 - 6, fy0 + 10, 120) + bar(fx0 + 70, fy0 + 30, 100) + bar(fx0 + fw - 120, fy0 + fh - 46, 126) + bar(fx0 + 10, fy0 + fh - 26, 110);
        break;
      }
      case "chinese": {
        const st = (o, w) => { const a = fx0 + o, b = fx0 + fw - o, t = fy0 + o, u = fy0 + fh - o, n = 12; return `<path d="M${a + n} ${t}H${b - n}V${t + n}H${b}V${u - n}H${b - n}V${u}H${a + n}V${u - n}H${a}V${t + n}H${a + n}Z" fill="none" stroke="${acc}" stroke-width="${w}"/>`; };
        g += st(0, 3) + st(7, 1);
        g += cornersAt(() => `<g transform="translate(46 44)"><path d="M0 0c-10-10 4-20 10-10c6-10 20 0 10 10c10 6 0 20-10 10c-6 10-20 0-10-10Z" fill="${mix(acc, "#d02a1e", .55)}" stroke="${acc}" stroke-width="1.4"/></g>`);
        break;
      }
      case "hearts": g += `<rect x="${fx0 + 10}" y="${fy0 + 10}" width="${fw - 20}" height="${fh - 20}" fill="none" stroke="${acc}" stroke-width="1" opacity=".6"/>` + perimPts(0, 22).map(([x, y]) => emblemSVG("heart", f1(x), f1(y), 5.5, acc, acc)).join(""); break;
      case "stars": g += `<rect x="${fx0 + 10}" y="${fy0 + 10}" width="${fw - 20}" height="${fh - 20}" fill="none" stroke="${acc}" stroke-width="1" opacity=".6"/>` + perimPts(0, 18).map(([x, y], i) => `<path d="${star4(x, y, i % 2 ? 3.5 : 6)}" fill="${acc}"/>`).join(""); break;
      case "flowers": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.2" opacity=".6"/>` + perimPts(0, 26).map(([x, y], i) => i % 2 ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="${acc}"/>` : emblemSVG("flower", f1(x), f1(y), 6.5, acc, hi)).join(""); break;
      case "laurel": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.6"/>` + perimPts(0, 11).map(([x, y, nx, ny], i) => { const a = Math.atan2(ny, nx) * 180 / Math.PI + (i % 2 ? 50 : -50); return `<ellipse cx="${f1(x + nx * 2)}" cy="${f1(y + ny * 2)}" rx="6" ry="2.4" transform="rotate(${f1(a + 90)} ${f1(x + nx * 2)} ${f1(y + ny * 2)})" fill="${acc}" opacity=".9"/>`; }).join(""); break;
      case "runes": {
        g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.6"/><rect x="${fx0 + 16}" y="${fy0 + 16}" width="${fw - 32}" height="${fh - 32}" fill="none" stroke="${acc}" stroke-width="1"/>`;
        const RUNES = ["M0 -5V5M0 -5L4 -1", "M-3 -5V5M-3 0L3 -5M-3 0L3 5", "M0 -5V5M-4 -5L4 5", "M-3 5V-5L3 0L-3 5", "M0 -5V5M0 -2L4 -5M0 1L4 -2", "M-4 -5L0 5L4 -5", "M-3 -5V5M3 -5V5M-3 -2L3 2"];
        g += perimPts(8, 18).map(([x, y], i) => `<path d="${RUNES[i % RUNES.length]}" transform="translate(${f1(x)} ${f1(y)})" stroke="${acc}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`).join("");
        break;
      }
      case "scales": g += perimPts(0, 12).map(([x, y, nx, ny]) => { const a = Math.atan2(ny, nx) * 180 / Math.PI - 90; return `<path d="M-6 0A6 6 0 0 0 6 0" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})" fill="none" stroke="${acc}" stroke-width="1.8"/>`; }).join("") + `<rect x="${fx0 + 8}" y="${fy0 + 8}" width="${fw - 16}" height="${fh - 16}" fill="none" stroke="${acc}" stroke-width="1" opacity=".6"/>`; break;
      case "serpent": {
        g += wavy(0, 3, 30, (p) => Math.sin(p * TAU), 5, `opacity=".9"`) + wavy(0, 3, 30, (p) => Math.sin(p * TAU), 2, `stroke-dasharray="3 3" opacity=".5"`).replace(`stroke="${acc}"`, `stroke="${dark}"`);
        g += `<path d="M${fx0 - 2} ${fy0 + 30}C${fx0 - 14} ${fy0 + 18} ${fx0 - 10} ${fy0 + 2} ${fx0 + 4} ${fy0 + 4}C${fx0 + 14} ${fy0 + 12} ${fx0 + 10} ${fy0 + 26} ${fx0 - 2} ${fy0 + 30}Z" fill="${acc}"/><circle cx="${fx0 + 1}" cy="${fy0 + 12}" r="1.6" fill="${dark}"/><path d="M${fx0 + 6} ${fy0 + 2}L${fx0 + 12} ${fy0 - 6}M${fx0 + 12} ${fy0 - 6}l4 -1M${fx0 + 12} ${fy0 - 6}l1 -4" stroke="${mix(acc, "#d03030", .6)}" stroke-width="1.2" fill="none"/>`;
        break;
      }
      case "web": {
        g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" fill="none" stroke="${acc}" stroke-width="1.2" opacity=".7"/>`;
        g += cornersAt(() => { let p = ""; for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; p += `M0 0L${f1(Math.cos(a) * 90)} ${f1(Math.sin(a) * 90)}`; } for (let k = 1; k <= 4; k++) { const rr = k * 20; for (let i = 0; i < 5; i++) { const a0 = i / 5 * Math.PI / 2, a1 = (i + 1) / 5 * Math.PI / 2, am = (a0 + a1) / 2; p += `M${f1(Math.cos(a0) * rr)} ${f1(Math.sin(a0) * rr)}Q${f1(Math.cos(am) * rr * .85)} ${f1(Math.sin(am) * rr * .85)} ${f1(Math.cos(a1) * rr)} ${f1(Math.sin(a1) * rr)}`; } } return `<path d="${p}" fill="none" stroke="${acc}" stroke-width=".9" opacity=".75"/>`; });
        break;
      }
      case "film": {
        g += `<rect x="${X0}" y="0" width="24" height="400" fill="#0a0a0a" opacity=".75"/><rect x="276" y="0" width="24" height="400" fill="#0a0a0a" opacity=".75"/>`;
        for (let y = 8; y < 400; y += 18) g += `<rect x="${X0 + 7}" y="${y}" width="10" height="9" rx="2" fill="${hi}" opacity=".8"/><rect x="283" y="${y}" width="10" height="9" rx="2" fill="${hi}" opacity=".8"/>`;
        break;
      }
      case "stitch": g += `<rect x="${fx0}" y="${fy0}" width="${fw}" height="${fh}" rx="10" fill="none" stroke="${acc}" stroke-width="2.2" stroke-dasharray="8 6" stroke-linecap="round"/><rect x="${fx0 - 6}" y="${fy0 - 6}" width="${fw + 12}" height="${fh + 12}" rx="14" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`; break;
      case "stamp": {
        g += `<rect x="${X0 + 10}" y="10" width="${W - 20}" height="380" fill="none" stroke="${acc}" stroke-width="1.6" opacity=".8"/>`;
        let holes = ""; for (let x = X0 + 6; x <= 300; x += 12) holes += `<circle cx="${x}" cy="0" r="4.5"/><circle cx="${x}" cy="400" r="4.5"/>`; for (let y = 6; y <= 400; y += 12) holes += `<circle cx="300" cy="${y}" r="4.5"/>`;
        g += `<g fill="#0a0812" opacity=".85">${holes}</g>`;
        break;
      }
      case "brush": {
        let p = ""; for (let k = 0; k < 3; k++) { const j = () => f1(-3 + r() * 6); p += `M${fx0 + j()} ${fy0 + j()}L${fx0 + fw + j()} ${fy0 + j()}L${fx0 + fw + j()} ${fy0 + fh + j()}L${fx0 + j()} ${fy0 + fh + j()}Z`; }
        g += `<path d="${p}" fill="none" stroke="${acc}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/><path d="M${fx0 + fw - 30} ${fy0 + fh + 2}l40 6" stroke="${acc}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
        break;
      }
    }

    /* ---------- 角の飾り ---------- */
    const cornersUp = (fn) => [[X0 + 28, 28], [272, 28], [X0 + 28, 372], [272, 372]].map(([x, y]) => fn(x, y)).join(""); // 上下を反転しない（ハートなど）
    switch (P.corners) {
      case "metal": g += cornersAt(() => `<path d="M0 0H52Q36 9 31 31Q9 36 0 52Z" fill="${metal}" stroke="#4a3620" stroke-width="1.5"/><circle cx="13" cy="13" r="3.6" fill="${hi}" opacity=".85"/>`); break;
      case "star": g += cornersAt(() => `<path d="${star4(30, 30, 11)}" fill="${acc}"/><path d="${star4(30, 30, 4)}" fill="${hi}"/>`); break;
      case "leaf": g += cornersAt(() => `<path d="M8 8C30 6 44 18 44 34C30 34 14 26 8 8Z" fill="${acc}" opacity=".9"/><path d="M8 8L40 31" stroke="${dark}" stroke-width="1" opacity=".5"/>`); break;
      case "round": g += cornersAt(() => `<circle cx="28" cy="28" r="7" fill="${metal}" stroke="#3a2a14" stroke-width="1"/><circle cx="26" cy="26" r="2.2" fill="${hi}" opacity=".8"/>`); break;
      case "filigree": g += cornersAt(() => `<path d="M10 54C10 26 26 10 54 10M18 50C18 30 30 18 50 18" fill="none" stroke="${acc}" stroke-width="2"/><path d="M22 22c8 0 12 6 8 10c-4 3-9-1-6-5" fill="none" stroke="${acc}" stroke-width="1.6"/>`); break;
      case "gem": g += cornersAt(() => `<path d="M28 16L40 28L28 40L16 28Z" fill="${mix(acc, "#c0102c", .55)}" stroke="${metal}" stroke-width="2.4"/><path d="M28 20L34 28L28 28Z" fill="#fff" opacity=".6"/>`); break;
      case "bracket": g += cornersAt(() => `<path d="M14 48V14H48" fill="none" stroke="${acc}" stroke-width="3.4"/><path d="M22 40V22H40" fill="none" stroke="${acc}" stroke-width="1.2" opacity=".7"/>`); break;
      case "heart": g += cornersUp((x, y) => emblemSVG("heart", x, y, 11, acc, hi)); break;
      case "flower": g += cornersUp((x, y) => emblemSVG("flower", x, y, 11, acc, hi)); break;
      case "moon": g += cornersUp((x, y) => `<path d="${crescentPath(x, y, 10)}" fill="${acc}"/>`); break;
      case "triangle": g += cornersAt(() => `<path d="M0 0H46L0 46Z" fill="${acc}" opacity=".85"/><path d="M6 6H34L6 34Z" fill="none" stroke="${dark}" stroke-width="1.2" opacity=".6"/>`); break;
      case "cross": g += cornersAt(() => `<path d="M28 14V42M14 28H42" stroke="${metal}" stroke-width="5" stroke-linecap="round"/><circle cx="28" cy="28" r="6" fill="none" stroke="${acc}" stroke-width="2"/>`); break;
      case "fan": g += cornersAt(() => { let ribs = ""; for (let i = 1; i < 6; i++) { const a = i * Math.PI / 12; ribs += `M6 6L${f1(6 + Math.cos(a) * 46)} ${f1(6 + Math.sin(a) * 46)}`; } return `<path d="M6 6H52A46 46 0 0 1 6 52Z" fill="${acc}" opacity=".8"/><path d="${ribs}" stroke="${dark}" stroke-width="1" opacity=".55"/><circle cx="8" cy="8" r="3" fill="${metal}"/>`; }); break;
      case "wing": g += cornersAt(() => [0, 1, 2].map((i) => `<ellipse cx="${26 + i * 4}" cy="${18 + i * 7}" rx="${20 - i * 4}" ry="4.5" transform="rotate(${30 + i * 12} ${26 + i * 4} ${18 + i * 7})" fill="${acc}" opacity="${.9 - i * .15}"/>`).join("")); break;
      case "knot": g += cornersAt(() => `<path d="M28 28c-14-14-22 0-8 4c-14 4-6 18 8 4c14 14 22 0 8-4c14-4 6-18-8-4Z" fill="none" stroke="${acc}" stroke-width="2.2"/><path d="M34 34l12 12M38 34l8 14" stroke="${acc}" stroke-width="1.6" stroke-linecap="round"/>`); break;
    }

    /* ---------- 紋章（と台） ---------- */
    const titleY = vert ? null : Y[P.titlePos] ?? Y.bottom;
    let ex = vert ? 112 : CX, ey = Y[P.emblemPos] ?? Y.middle;
    if (!vert && P.emblemPos === P.titlePos) ey += P.titlePos === "top" ? 92 : -92;
    const R = 34;
    if (P.emblemPos !== "none" && em !== "none") {
      switch (P.emblemBase) {
        case "circle": g += `<circle cx="${ex}" cy="${ey}" r="${R + 18}" fill="none" stroke="${acc}" stroke-width="2"/><circle cx="${ex}" cy="${ey}" r="${R + 11}" fill="#000" opacity=".18"/>`; break;
        case "ring": g += `<circle cx="${ex}" cy="${ey}" r="${R + 14}" fill="none" stroke="${metal}" stroke-width="7"/><circle cx="${ex}" cy="${ey}" r="${R + 14}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`; break;
        case "diamond": g += `<path d="M${ex} ${ey - R - 26}L${ex + R + 26} ${ey}L${ex} ${ey + R + 26}L${ex - R - 26} ${ey}Z" fill="#000" opacity=".22" stroke="${metal}" stroke-width="3.5"/>`; break;
        case "shield": g += `<path d="M${ex - R - 12} ${ey - R - 16}H${ex + R + 12}V${ey + 4}C${ex + R + 12} ${ey + R + 6} ${ex} ${ey + R + 24} ${ex} ${ey + R + 24}C${ex} ${ey + R + 24} ${ex - R - 12} ${ey + R + 6} ${ex - R - 12} ${ey + 4}Z" fill="${dark}" stroke="${metal}" stroke-width="3.5"/>`; break;
        case "sunburst": for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, l = i % 2 ? R + 18 : R + 32; g += `<path d="M${f1(ex + Math.cos(a) * (R + 4))} ${f1(ey + Math.sin(a) * (R + 4))}L${f1(ex + Math.cos(a) * l)} ${f1(ey + Math.sin(a) * l)}" stroke="${acc}" stroke-width="${i % 2 ? 1.4 : 2.6}" stroke-linecap="round"/>`; } break;
        case "wreath": for (let i = 0; i < 18; i++) { const a = Math.PI * .62 + i * Math.PI * 1.76 / 17, x = ex + Math.cos(a) * (R + 16), y = ey + Math.sin(a) * (R + 16), rt = a * 180 / Math.PI + (i < 9 ? 70 : 110); g += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="3.6" transform="rotate(${f1(rt)} ${f1(x)} ${f1(y)})" fill="${acc}" opacity=".9"/>`; } break;
        case "window": g += `<path d="M${ex - R - 10} ${ey + R + 14}V${ey - 6}A${R + 10} ${R + 10} 0 0 1 ${ex + R + 10} ${ey - 6}V${ey + R + 14}Z" fill="#000" opacity=".25" stroke="${metal}" stroke-width="3.5"/>`; break;
        case "hexagon": g += `<path d="${poly(ex, ey, 6, R + 22)}" fill="#000" fill-opacity=".22" stroke="${metal}" stroke-width="3.5"/><path d="${poly(ex, ey, 6, R + 14)}" fill="none" stroke="${acc}" stroke-width="1" opacity=".6"/>`; break;
        case "star": g += `<path d="${poly(ex, ey, 8, R + 32, -Math.PI / 2, R + 17)}" fill="${dark}" stroke="${acc}" stroke-width="2" stroke-linejoin="round"/>`; break;
        case "octagon": g += `<path d="${poly(ex, ey, 8, R + 20, -Math.PI / 8)}" fill="#000" fill-opacity=".2" stroke="${metal}" stroke-width="3"/><path d="${poly(ex, ey, 8, R + 13, -Math.PI / 8)}" fill="none" stroke="${acc}" stroke-width=".8"/>`; break;
        case "cartouche": g += `<ellipse cx="${ex}" cy="${ey}" rx="${R + 16}" ry="${R + 26}" fill="#000" fill-opacity=".22" stroke="${metal}" stroke-width="3.5"/><path d="M${ex - 10} ${ey - R - 30}h20M${ex - 10} ${ey + R + 30}h20" stroke="${metal}" stroke-width="5" stroke-linecap="round"/>`; break;
        case "flower": for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g += `<circle cx="${f1(ex + Math.cos(a) * (R + 10))}" cy="${f1(ey + Math.sin(a) * (R + 10))}" r="17" fill="${acc}" opacity=".28"/>`; } g += `<circle cx="${ex}" cy="${ey}" r="${R + 10}" fill="${dark}" opacity=".7"/>`; break;
        case "gear": { let p = ""; const n = 14, s = TAU / n; for (let i = 0; i < n; i++) { const a0 = i * s; [[a0, R + 18], [a0 + s * .15, R + 27], [a0 + s * .45, R + 27], [a0 + s * .6, R + 18]].forEach(([a, rr], k) => { p += (i || k ? "L" : "M") + f1(ex + Math.cos(a) * rr) + " " + f1(ey + Math.sin(a) * rr); }); } g += `<path d="${p}Z" fill="${dark}" stroke="${metal}" stroke-width="2.2" stroke-linejoin="round"/>`; break; }
        case "magic": {
          g += `<circle cx="${ex}" cy="${ey}" r="${R + 26}" fill="none" stroke="${acc}" stroke-width="1.8" opacity=".9"/><circle cx="${ex}" cy="${ey}" r="${R + 16}" fill="none" stroke="${acc}" stroke-width="1" opacity=".8"/>`;
          g += `<path d="${poly(ex, ey, 3, R + 16)}${poly(ex, ey, 3, R + 16, Math.PI / 2)}" fill="none" stroke="${acc}" stroke-width="1" opacity=".7"/>`;
          for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + .26; g += `<path d="${star4(ex + Math.cos(a) * (R + 21), ey + Math.sin(a) * (R + 21), 2.6)}" fill="${acc}"/>`; }
          break;
        }
        case "crescent": g += `<path d="${crescentPath(ex - 6, ey + 2, R + 26, .5, -.25, .86)}" fill="${acc}" opacity=".3" stroke="${metal}" stroke-width="2"/>`; break;
      }
      g += emb(em, ex, ey, R, metal, hi);
    }

    /* ---------- 題名の札と題名 ---------- */
    const DARK_INK = "#2b2118";
    const paperPlates = { label: 1, tag: 1, slip: 1, scroll: 1, oval: 1, cloud: 1 };
    const pc = plateCol || (P.plate === "plate" || P.plate === "card" ? base : paperPlates[P.plate] ? DARK_INK : ink);
    const deco = P.titleDeco;
    const outlined = P.plate === "none" || P.plate === "darkband" || P.plate === "glass";
    const strokeOut = `stroke="#0a0812" stroke-width="3" paint-order="stroke"`;
    if (vert) {
      const px = 236, py0 = 44, py1 = 300, n = Math.max(1, Array.from(T).length), fs = Math.max(10, Math.min(24, (py1 - py0 - 24) / (n * 1.12)));
      switch (P.plate) {
        case "plate": g += `<rect x="${px - 28}" y="${py0}" width="56" height="${py1 - py0}" rx="4" fill="${metal}"/>`; break;
        case "label": case "slip": g += `<rect x="${px - 26}" y="${py0}" width="52" height="${py1 - py0}" fill="#f3ead2" stroke="${acc}" stroke-width="1.5"/><rect x="${px - 21}" y="${py0 + 5}" width="42" height="${py1 - py0 - 10}" fill="none" stroke="${acc}" stroke-width=".8" opacity=".7"/>`; break;
        case "ribbon": case "banner": g += `<path d="M${px - 26} ${py0}H${px + 26}V${py1}L${px} ${py1 - 20}L${px - 26} ${py1}Z" fill="${mix(acc, "#000", .1)}" stroke="${mix(acc, "#000", .35)}" stroke-width="1.5"/>`; break;
        case "scroll": g += `<rect x="${px - 24}" y="${py0}" width="48" height="${py1 - py0}" fill="#efe0b8"/><rect x="${px - 30}" y="${py0 - 8}" width="60" height="10" rx="5" fill="${mix("#efe0b8", "#6b4a2a", .35)}"/><rect x="${px - 30}" y="${py1 - 2}" width="60" height="10" rx="5" fill="${mix("#efe0b8", "#6b4a2a", .35)}"/>`; break;
        case "tag": g += `<path d="M${px - 24} ${py0 + 20}L${px} ${py0}L${px + 24} ${py0 + 20}V${py1}H${px - 24}Z" fill="#fbf3df" stroke="${mix(acc, "#000", .3)}" stroke-width="1.5"/><circle cx="${px}" cy="${py0 + 18}" r="4" fill="none" stroke="${mix(acc, "#000", .3)}" stroke-width="1.6"/>`; break;
        case "oval": g += `<rect x="${px - 27}" y="${py0}" width="54" height="${py1 - py0}" rx="27" fill="#f3ead2" stroke="${acc}" stroke-width="2"/>`; break;
        case "frame": g += `<rect x="${px - 30}" y="${py0}" width="60" height="${py1 - py0}" fill="${dark}" stroke="${metal}" stroke-width="6"/><rect x="${px - 22}" y="${py0 + 8}" width="44" height="${py1 - py0 - 16}" fill="none" stroke="${acc}" stroke-width=".8"/>`; break;
        case "darkband": g += `<rect x="${px - 32}" y="0" width="64" height="400" fill="#000" opacity=".45"/><path d="M${px - 32} 0V400M${px + 32} 0V400" stroke="${acc}" stroke-opacity=".7"/>`; break;
        case "card": g += `<path d="M${px - 18} ${py0}H${px + 18}L${px + 28} ${py0 + 10}V${py1 - 10}L${px + 18} ${py1}H${px - 18}L${px - 28} ${py1 - 10}V${py0 + 10}Z" fill="${metal}"/>`; break;
        case "cloud": g += `<rect x="${px - 28}" y="${py0}" width="56" height="${py1 - py0}" rx="20" fill="#fbf3df" stroke="${mix(acc, "#000", .3)}" stroke-width="1.5" stroke-dasharray="10 3"/>`; break;
        case "arch": g += `<path d="M${px - 28} ${py1}V${py0 + 28}A28 28 0 0 1 ${px + 28} ${py0 + 28}V${py1}Z" fill="${dark}" stroke="${metal}" stroke-width="3"/>`; break;
        case "glass": g += `<rect x="${px - 28}" y="${py0}" width="56" height="${py1 - py0}" rx="10" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".45"/>`; break;
      }
      // 題名の飾り（縦書き）
      const dl = px - 38, dr = px + 38;
      switch (deco) {
        case "lines": g += `<path d="M${dl} ${py0}V${py1}M${dr} ${py0}V${py1}" stroke="${acc}" stroke-width="1.4" opacity=".8"/>`; break;
        case "dots": for (let y = py0 + 4; y < py1; y += 12) g += `<circle cx="${dl}" cy="${y}" r="1.6" fill="${acc}"/><circle cx="${dr}" cy="${y}" r="1.6" fill="${acc}"/>`; break;
        case "wave": { let a = `M${dl} ${py0}`, b = `M${dr} ${py0}`; for (let y = py0; y < py1; y += 16) { a += `q-4 4 0 8t0 8`; b += `q4 4 0 8t0 8`; } g += `<path d="${a}${b}" fill="none" stroke="${acc}" stroke-width="1.3" opacity=".8"/>`; break; }
        case "flourish": case "stars": case "diamonds": [py0 - 16, py1 + 16].forEach((y, k) => { g += deco === "stars" ? `<path d="${star4(px, y, 8)}" fill="${acc}"/>` : deco === "diamonds" ? `<path d="M${px} ${y - 7}L${px + 7} ${y}L${px} ${y + 7}L${px - 7} ${y}Z" fill="${acc}"/><path d="M${px - 26} ${y}H${px - 11}M${px + 11} ${y}H${px + 26}" stroke="${acc}" stroke-width="1.2"/>` : `<path d="M${px - 26} ${y}C${px - 18} ${y + (k ? 8 : -8)} ${px - 6} ${y + (k ? 8 : -8)} ${px} ${y}C${px + 6} ${y + (k ? 8 : -8)} ${px + 18} ${y + (k ? 8 : -8)} ${px + 26} ${y}" fill="none" stroke="${acc}" stroke-width="1.6"/><circle cx="${px}" cy="${y}" r="2.4" fill="${acc}"/>`; }); break;
        case "brackets": g += `<path d="M${dl + 8} ${py0 - 8}H${dl}V${py0 + 26}M${dr - 8} ${py0 - 8}H${dr}V${py0 + 26}M${dl + 8} ${py1 + 8}H${dl}V${py1 - 26}M${dr - 8} ${py1 + 8}H${dr}V${py1 - 26}" fill="none" stroke="${acc}" stroke-width="2.2"/>`; break;
      }
      const vcol = P.plate === "emboss" ? metal : (P.plate === "ribbon" || P.plate === "banner") ? (plateCol || mix(base, "#000", .35)) : P.plate === "card" ? (plateCol || base) : outlined || P.plate === "frame" || P.plate === "arch" ? ink : pc;
      g += titleSVG(T, px, py0 + 12 + fs, fs, vcol, true, outlined ? strokeOut : P.plate === "emboss" ? `stroke="#000" stroke-opacity=".4" stroke-width="1"` : "");
      if (sub) g += titleSVG(sub, deco !== "none" ? px - 52 : px - 46, py0 + 10, 11, ink, true, `opacity=".85"`);
    } else {
      const room = { tag: 140, slip: 130, oval: 150, cloud: 140, arch: 150, frame: 170, card: 170, glass: 180, darkband: 220, emboss: 200 }[P.plate] || 158;
      const fs = fitSize(T, room, 26), ty = titleY;
      switch (P.plate) {
        case "plate": g += `<rect x="64" y="${ty - 28}" width="198" height="52" rx="4" fill="${metal}"/><rect x="68" y="${ty - 24}" width="190" height="44" rx="3" fill="none" stroke="#000" stroke-opacity=".25"/>`; break;
        case "label": g += `<rect x="66" y="${ty - 30}" width="194" height="56" fill="#f3ead2" stroke="${acc}" stroke-width="1.5"/><rect x="71" y="${ty - 25}" width="184" height="46" fill="none" stroke="${acc}" stroke-width=".8" opacity=".7"/>`; break;
        case "slip": g += `<rect x="84" y="${ty - 30}" width="158" height="56" fill="#f3ead2" stroke="${acc}" stroke-width="1.5"/>`; break;
        case "ribbon": g += `<path d="M40 ${ty - 22}L58 ${ty - 4}L40 ${ty + 14}H76V${ty - 22}Z M286 ${ty - 22}L268 ${ty - 4}L286 ${ty + 14}H250V${ty - 22}Z" fill="${mix(acc, "#000", .35)}"/><rect x="62" y="${ty - 30}" width="202" height="46" fill="${acc}"/><rect x="62" y="${ty - 30}" width="202" height="4" fill="#fff" opacity=".25"/>`; break;
        case "banner": g += `<path d="M58 ${ty - 30}H268L254 ${ty - 4}L268 ${ty + 22}H58L72 ${ty - 4}Z" fill="${mix(acc, "#000", .1)}" stroke="${mix(acc, "#000", .35)}" stroke-width="1.5"/>`; break;
        case "scroll": g += `<rect x="70" y="${ty - 28}" width="186" height="50" fill="#efe0b8"/><rect x="62" y="${ty - 34}" width="12" height="62" rx="6" fill="${mix("#efe0b8", "#6b4a2a", .35)}"/><rect x="252" y="${ty - 34}" width="12" height="62" rx="6" fill="${mix("#efe0b8", "#6b4a2a", .35)}"/>`; break;
        case "tag": g += `<g transform="rotate(-4 ${CX} ${ty})"><path d="M70 ${ty - 28}H236L260 ${ty - 2}L236 ${ty + 24}H70Z" fill="#fbf3df" stroke="${mix(acc, "#000", .3)}" stroke-width="1.5"/><circle cx="242" cy="${ty - 2}" r="4.5" fill="none" stroke="${mix(acc, "#000", .3)}" stroke-width="1.6"/></g>`; break;
        case "oval": g += `<ellipse cx="${CX}" cy="${ty - 3}" rx="100" ry="33" fill="#f3ead2" stroke="${acc}" stroke-width="2"/><ellipse cx="${CX}" cy="${ty - 3}" rx="93" ry="27" fill="none" stroke="${acc}" stroke-width=".8" opacity=".7"/>`; break;
        case "frame": g += `<rect x="58" y="${ty - 34}" width="210" height="62" fill="${dark}" stroke="${metal}" stroke-width="6"/><rect x="66" y="${ty - 26}" width="194" height="46" fill="none" stroke="${acc}" stroke-width=".8" opacity=".8"/>`; break;
        case "darkband": g += `<rect x="${X0}" y="${ty - 30}" width="${W}" height="54" fill="#000" opacity=".5"/><path d="M${X0} ${ty - 30}H300M${X0} ${ty + 24}H300" stroke="${acc}" stroke-opacity=".7"/>`; break;
        case "card": g += `<path d="M74 ${ty - 30}H252L264 ${ty - 18}V${ty + 14}L252 ${ty + 26}H74L62 ${ty + 14}V${ty - 18}Z" fill="${metal}"/><path d="M78 ${ty - 25}H248L258 ${ty - 15}V${ty + 11}L248 ${ty + 21}H78L68 ${ty + 11}V${ty - 15}Z" fill="none" stroke="#000" stroke-opacity=".25"/>`; break;
        case "cloud": { let p = `M80 ${ty + 24}A27 27 0 0 1 80 ${ty - 30}`; for (let i = 1; i <= 5; i++) p += `A22 22 0 0 1 ${f1(80 + i * 33.2)} ${ty - 30}`; p += `A27 27 0 0 1 246 ${ty + 24}`; for (let i = 1; i <= 5; i++) p += `A22 22 0 0 1 ${f1(246 - i * 33.2)} ${ty + 24}`; g += `<path d="${p}Z" fill="#fbf3df" stroke="${mix(acc, "#000", .3)}" stroke-width="1.5"/>`; break; }
        case "arch": g += `<path d="M68 ${ty + 26}V${ty - 8}Q68 ${ty - 40} ${CX} ${ty - 40}Q258 ${ty - 40} 258 ${ty - 8}V${ty + 26}Z" fill="${dark}" stroke="${metal}" stroke-width="3"/>`; break;
        case "glass": g += `<rect x="60" y="${ty - 30}" width="206" height="56" rx="10" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".45"/>`; break;
      }
      // 題名の飾り（横書き）
      const above = ty - 40, below = ty + 36;
      switch (deco) {
        case "lines": g += `<path d="M${CX - 80} ${above}H${CX + 80}M${CX - 80} ${below}H${CX + 80}" stroke="${acc}" stroke-width="1.4" opacity=".85"/><path d="M${CX - 60} ${above - 4}H${CX + 60}M${CX - 60} ${below + 4}H${CX + 60}" stroke="${acc}" stroke-width=".7" opacity=".6"/>`; break;
        case "dots": for (let x = CX - 70; x <= CX + 70; x += 10) g += `<circle cx="${x}" cy="${above}" r="1.6" fill="${acc}"/><circle cx="${x}" cy="${below}" r="1.6" fill="${acc}"/>`; break;
        case "flourish": [above, below].forEach((y, k) => { const s = k ? 1 : -1; g += `<path d="M${CX - 70} ${y}C${CX - 50} ${y + s * 10} ${CX - 20} ${y + s * 10} ${CX} ${y}C${CX + 20} ${y + s * 10} ${CX + 50} ${y + s * 10} ${CX + 70} ${y}M${CX - 70} ${y}c-6 -4 -10 2 -6 5M${CX + 70} ${y}c6 -4 10 2 6 5" fill="none" stroke="${acc}" stroke-width="1.5"/><circle cx="${CX}" cy="${y}" r="2.6" fill="${acc}"/>`; }); break;
        case "stars": [above, below].forEach((y) => { g += `<path d="${star4(CX, y, 7)}${star4(CX - 24, y, 4)}${star4(CX + 24, y, 4)}" fill="${acc}"/><path d="M${CX - 70} ${y}H${CX - 34}M${CX + 34} ${y}H${CX + 70}" stroke="${acc}" stroke-width="1"/>`; }); break;
        case "diamonds": [above, below].forEach((y) => { g += `<path d="M${CX} ${y - 6}L${CX + 6} ${y}L${CX} ${y + 6}L${CX - 6} ${y}Z" fill="${acc}"/><path d="M${CX - 70} ${y}H${CX - 12}M${CX + 12} ${y}H${CX + 70}" stroke="${acc}" stroke-width="1.2"/><circle cx="${CX - 74}" cy="${y}" r="2" fill="${acc}"/><circle cx="${CX + 74}" cy="${y}" r="2" fill="${acc}"/>`; }); break;
        case "wave": [above, below].forEach((y) => { let p = `M${CX - 72} ${y}`; for (let i = 0; i < 9; i++) p += `q4 -4 8 0t8 0`; g += `<path d="${p}" fill="none" stroke="${acc}" stroke-width="1.3" opacity=".85"/>`; }); break;
        case "brackets": g += `<path d="M66 ${above + 12}V${above}H90M260 ${above + 12}V${above}H236M66 ${below - 12}V${below}H90M260 ${below - 12}V${below}H236" fill="none" stroke="${acc}" stroke-width="2.2"/>`; break;
      }
      const tc = outlined ? ink : P.plate === "emboss" ? metal : (P.plate === "ribbon" || P.plate === "banner") ? (plateCol || mix(base, "#000", .35)) : (P.plate === "frame" || P.plate === "arch") ? (plateCol || ink) : pc;
      const tx = P.plate === "tag" ? 156 : CX;
      const textExtra = outlined ? `letter-spacing="2" ${strokeOut}` : P.plate === "emboss" ? `letter-spacing="3" stroke="#000" stroke-opacity=".45" stroke-width="1.2" paint-order="stroke"` : `letter-spacing="2"`;
      g += titleSVG(T, tx, ty + fs * .34, fs, tc, false, textExtra);
      if (sub) { const off = deco !== "none" ? 58 : 46; const sy = P.titlePos === "bottom" ? ty - off : ty + off + 2; g += titleSVG(sub, CX, sy, 12, ink, false, `opacity=".85" letter-spacing="3"`); }
    }

    /* ---------- 留め具 ---------- */
    const cy0 = vert ? 116 : P.titlePos === "middle" ? -80 : 0; // 題名とかさならないように、留め具をずらす（縦書きは下へ、題名がまんなかのときは上へ）
    const strapAt = (y) => `<rect x="268" y="${y - 12}" width="32" height="24" fill="${dark}" stroke="#000" stroke-opacity=".3"/><rect x="262" y="${y - 10}" width="14" height="20" rx="3" fill="none" stroke="${metal}" stroke-width="3.4"/><path d="M262 ${y}H276" stroke="${metal}" stroke-width="2"/>`;
    if (P.clasp === "twostraps") g += strapAt(vert ? 330 : 100) + strapAt(vert ? 370 : 300);
    if (cy0) g += `<g transform="translate(0 ${cy0})">`;
    switch (P.clasp) {
      case "strap": g += `<rect x="252" y="176" width="48" height="48" rx="3" fill="${dark}" stroke="#000" stroke-opacity=".3"/><rect x="246" y="186" width="26" height="28" rx="4" fill="none" stroke="${metal}" stroke-width="4"/><circle cx="259" cy="200" r="4" fill="${hi}"/>`; break;
      case "lock": g += `<rect x="264" y="174" width="36" height="52" fill="${dark}"/><path d="M262 190V182A12 12 0 0 1 286 182V190" fill="none" stroke="${metal}" stroke-width="4"/><rect x="256" y="188" width="36" height="30" rx="4" fill="${metal}" stroke="#3a2a14"/><circle cx="274" cy="200" r="3.5" fill="#1a120c"/><path d="M274 202v8" stroke="#1a120c" stroke-width="2.4"/>`; break;
      case "ribbon": g += `<rect x="${X0}" y="192" width="${W}" height="16" fill="${mix(acc, "#c0485e", .5)}"/><path d="M270 200c-14-20-34-14-28 0c-6 14 14 20 28 0Zm0 0c14-20 34-14 28 0" fill="${mix(acc, "#c0485e", .5)}" stroke="#000" stroke-opacity=".2"/><circle cx="270" cy="200" r="6" fill="${mix(acc, "#c0485e", .7)}"/>`; break;
      case "seal": if (!vert && P.titlePos === "bottom") g += `<g transform="translate(0 -250)">`; g += `<circle cx="262" cy="350" r="20" fill="#9a1a24"/><circle cx="262" cy="350" r="14" fill="none" stroke="#5a0a12" stroke-width="1.6"/><path d="${star4(262, 350, 8)}" fill="#5a0a12"/><path d="M248 338c-6 4-8 10-6 14M276 362c4-2 8-8 6-12" stroke="#c84a50" stroke-width="2" fill="none" opacity=".6"/>`; if (!vert && P.titlePos === "bottom") g += `</g>`; break;
      case "buckle": g += `<rect x="244" y="186" width="56" height="28" fill="${dark}" stroke="#000" stroke-opacity=".3"/><rect x="240" y="180" width="22" height="40" rx="4" fill="none" stroke="${metal}" stroke-width="4.5"/><path d="M240 200H256" stroke="${metal}" stroke-width="3" stroke-linecap="round"/><circle cx="276" cy="200" r="2.4" fill="#000" opacity=".5"/><circle cx="288" cy="200" r="2.4" fill="#000" opacity=".5"/>`; break;
      case "chain": { for (let i = 0; i < 4; i++) { const x = 294 - i * 14; g += i % 2 ? `<path d="M${x - 6} 200H${x + 6}" stroke="${metal}" stroke-width="4" stroke-linecap="round"/>` : `<ellipse cx="${x}" cy="200" rx="8" ry="5" fill="none" stroke="${metal}" stroke-width="2.8"/>`; } g += `<path d="M240 196V190A8 8 0 0 1 256 190V196" fill="none" stroke="${metal}" stroke-width="3"/><rect x="236" y="194" width="24" height="20" rx="3" fill="${metal}" stroke="#3a2a14"/><circle cx="248" cy="203" r="2.4" fill="#1a120c"/>`; break; }
      case "button": g += `<circle cx="262" cy="200" r="11" fill="${metal}" stroke="#3a2a14"/><circle cx="259" cy="197" r="1.8" fill="#1a120c"/><circle cx="265" cy="197" r="1.8" fill="#1a120c"/><circle cx="259" cy="203" r="1.8" fill="#1a120c"/><circle cx="265" cy="203" r="1.8" fill="#1a120c"/><path d="M300 192C284 186 270 186 262 192C254 198 254 206 262 208C270 210 284 212 300 206" fill="none" stroke="${mix(acc, "#7a3a2a", .5)}" stroke-width="2.4"/>`; break;
      case "keyhole": g += `<path d="M262 170C276 170 286 180 284 192C292 196 292 204 284 208C286 220 276 230 262 230C248 230 238 220 240 208C232 204 232 196 240 192C238 180 248 170 262 170Z" fill="${metal}" stroke="#3a2a14"/><circle cx="262" cy="195" r="5" fill="#120c08"/><path d="M259 197L256 212H268L265 197Z" fill="#120c08"/>`; break;
      case "cord": g += `<path d="M300 196H268M300 204H268" stroke="${mix(acc, "#4a2a1a", .4)}" stroke-width="2.4"/><rect x="258" y="184" width="10" height="32" rx="5" fill="${hi}" stroke="${mix(acc, "#000", .4)}"/><path d="M263 188V212" stroke="${mix(acc, "#000", .4)}" stroke-width=".8" opacity=".6"/>`; break;
    }
    if (cy0) g += `</g>`;

    /* ---------- しおり ---------- */
    const rib = (x, len, col) => `<path d="M${x} 0H${x + 14}V${len}L${x + 7} ${len - 8}L${x} ${len}Z" fill="${col}"/><path d="M${x + 14} 0V${len}" stroke="#000" stroke-opacity=".25"/><path d="M${x + 2} 0V${len - 4}" stroke="#fff" stroke-opacity=".2"/>`;
    switch (P.bookmark) {
      case "ribbon": g += rib(266, 96, mix(acc, "#a0203a", .55)); break;
      case "double": g += rib(250, 86, mix(acc, "#a0203a", .55)) + rib(268, 70, mix(acc, "#2a4a8a", .5)); break;
      case "tassel": g += `<path d="M274 0C272 24 280 40 274 62" fill="none" stroke="${mix(acc, "#a0203a", .4)}" stroke-width="2.4"/><circle cx="274" cy="64" r="4.5" fill="${metal}"/>` + [-5, -2.5, 0, 2.5, 5].map((o) => `<path d="M274 68L${274 + o} 92" stroke="${mix(acc, "#a0203a", .4)}" stroke-width="1.6"/>`).join(""); break;
      case "charm": g += `<path d="M272 0C270 26 278 44 272 66" fill="none" stroke="${metal}" stroke-width="1.6"/>` + emblemSVG("star", 272, 78, 11, metal, hi); break;
    }

    /* ---------- 仕上げ ---------- */
    switch (P.finish) {
      case "gloss": g += `<path d="M${X0} 0H150L${X0} 170Z" fill="#fff" opacity=".1"/><path d="M170 0H186L${X0} 210V190Z" fill="#fff" opacity=".08"/>`; break;
      case "worn":
        d += `<radialGradient id="${id}wn" cx=".55" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0a" stop-opacity=".45"/></radialGradient>`;
        g += rect(`url(#${id}wn)`);
        for (let i = 0; i < 14; i++) { const x = X0 + r() * W, y = r() * 400; g += `<path d="M${f1(x)} ${f1(y)}l${f1(-20 + r() * 40)} ${f1(-6 + r() * 12)}" stroke="#fff" stroke-opacity="${f1(.06 + r() * .1)}" stroke-width="1"/>`; }
        g += `<path d="M300 0V24L276 0Z M300 400V376L276 400Z" fill="${hi}" opacity=".18"/>`;
        break;
      case "gilt": g += `<rect x="2" y="2" width="296" height="396" rx="5" fill="none" stroke="${metal}" stroke-width="4"/><rect x="7" y="7" width="286" height="386" rx="3" fill="none" stroke="${acc}" stroke-width=".8" opacity=".6"/>`; break;
      case "burnt":
        d += `<radialGradient id="${id}bu" cx=".55" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#3a1a06" stop-opacity=".5"/><stop offset="1" stop-color="#120600" stop-opacity=".92"/></radialGradient>`;
        g += rect(`url(#${id}bu)`); break;
      case "stains": for (let i = 0; i < 12; i++) { const x = X0 + r() * W, y = r() * 400, s = 3 + r() * 16; g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="#6b4a1a" opacity="${f1(.06 + r() * .12)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="none" stroke="#6b4a1a" stroke-opacity=".12"/>`; } break;
      case "frost":
        d += `<radialGradient id="${id}fr" cx="0" cy="0" r="1"><stop offset="0" stop-color="#f4fbff" stop-opacity=".7"/><stop offset="1" stop-color="#f4fbff" stop-opacity="0"/></radialGradient>`;
        [[X0, 0, 1, 1], [300, 0, -1, 1], [X0, 400, 1, -1], [300, 400, -1, -1]].forEach(([x, y, sx, sy]) => { g += `<rect x="0" y="0" width="90" height="90" fill="url(#${id}fr)" transform="translate(${x} ${y}) scale(${sx} ${sy})"/>`; });
        for (let i = 0; i < 40; i++) { const corner = i % 4, x = corner % 2 ? 300 - r() * 70 : X0 + r() * 70, y = corner < 2 ? r() * 70 : 400 - r() * 70; g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.5 + r())}" fill="#fff" opacity=".7"/>`; }
        break;
      case "shadow":
        d += `<radialGradient id="${id}sh" cx=".55" cy=".45" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`;
        g += rect(`url(#${id}sh)`); break;
      case "lamp":
        d += `<radialGradient id="${id}lp" cx=".6" cy="0" r=".9"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".38"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>`;
        g += rect(`url(#${id}lp)`); break;
    }
    return { defs: d, g };
  }

  /* ---------- 表紙をつくる画面 ----------
     opts.emblems：紋章の名前の一覧（"none" で終わる）
     opts.plain：true にすると、書き方（プログラムの文字）を出さない（寄贈の間で使う）
     opts.fields：false にすると、題名・色などの入力欄を出さない（外から setCover で渡す）
     opts.onChange(cover)：表紙が変わるたびに呼ばれる
     もどり値：{ get(), set(cover) } */
  function maker(wrap, coverHTML, opts = {}) {
    const base = (opts.emblems || ["star", "moon", "leaf", "key", "eye", "heart", "feather", "flame", "sun", "crown", "flower", "drop", "bell", "hourglass", "sword", "snowflake", "anchor", "butterfly"]).filter((e) => e !== "none");
    const EMB = [...new Set([...base, ...Object.keys(EXTRA_EMB_JP)]), "none"];
    const EMB_JP = { star: "星", moon: "月", leaf: "葉", key: "鍵", eye: "目", heart: "ハート", feather: "羽根", flame: "炎", sun: "太陽", crown: "王冠", flower: "花", drop: "しずく", bell: "鈴", hourglass: "砂時計", sword: "剣", snowflake: "雪の結晶", anchor: "いかり", butterfly: "蝶", ...EXTRA_EMB_JP, none: "なし" };
    const plain = !!opts.plain, fields = opts.fields !== false;
    const state = { title: "星降る夜の物語", subtitle: "", titleDirection: "horizontal", color: "#2f4a7a", accent: "#e8c26a", textColor: "", plateColor: "", emblem: "star", ...(opts.initial || {}) };
    state.parts = { ...DEFAULT, ...((opts.initial && opts.initial.parts) || {}) };
    const chip = (group, key, label) => `<button type="button" class="cm-chip" data-g="${group}" data-k="${key}">${esc(label)}</button>`;
    const groupHTML = (k) => k === "emblem"
      ? `<div class="cm-group"><h4>紋章<button type="button" class="cm-dice" data-dice="emblem" title="紋章だけおまかせ">おまかせ</button></h4>${EMB.map((e) => chip("emblem", e, EMB_JP[e] || e)).join("")}</div>`
      : `<div class="cm-group"><h4>${esc(PARTS[k].label)}<button type="button" class="cm-dice" data-dice="${k}" title="${esc(PARTS[k].label)}だけおまかせ">おまかせ</button></h4>${Object.entries(PARTS[k].opts).map(([o, l]) => chip(k, o, l)).join("")}</div>`;
    const fieldHTML = fields ? `<div class="cm-row"><label>題名<input id="cmTitle" value="${esc(state.title)}"></label><label>副題<input id="cmSub" value="${esc(state.subtitle)}"></label></div>` : "";
    wrap.innerHTML = `<div class="cm${plain ? " plain" : ""}"><div class="cm-prev"><div class="cm-book" id="cmBook"></div><div class="cm-btns"><button type="button" class="btn small" id="cmRand">ぜんぶおまかせ</button>${plain ? "" : `<button type="button" class="btn small" id="cmCopy">書き方をコピー</button>`}</div>${plain ? "" : `<textarea id="cmOut" readonly spellcheck="false" aria-label="books.json の cover に書く内容"></textarea><p class="cm-note">books.json の本の <code>"cover"</code> を、この中身に置きかえると、この表紙になります。</p>`}</div>
      <div class="cm-ctrl">${fieldHTML}
      <div class="cm-row"><label>地の色<input type="color" id="cmColor" value="${state.color}"></label><label>飾りの色<input type="color" id="cmAccent" value="${state.accent}"></label><label>題名の色<input type="color" id="cmText" value="${state.textColor || state.accent}"></label><label class="cm-cb"><input type="checkbox" id="cmVert"${state.titleDirection === "vertical" ? " checked" : ""}>縦書き</label></div>
      <div class="cm-tabs" role="tablist">${GROUPS.map(([name], i) => `<button type="button" class="cm-tab${i ? "" : " on"}" data-tab="${i}" role="tab">${esc(name)}</button>`).join("")}</div>
      ${GROUPS.map(([, keys], i) => `<div class="cm-pane" data-pane="${i}"${i ? " hidden" : ""}>${keys.map(groupHTML).join("")}</div>`).join("")}</div></div>`;
    const $q = (s) => wrap.querySelector(s);
    const cover = () => { const o = { title: state.title, subtitle: state.subtitle, titleDirection: state.titleDirection, color: state.color, accent: state.accent }; if (state.textColor) o.textColor = state.textColor; o.emblem = state.emblem; o.parts = { ...state.parts }; return o; };
    const draw = () => {
      $q("#cmBook").innerHTML = coverHTML({ id: opts.bookId || "maker", title: state.title || " ", cover: { ...state, title: state.title || " ", parts: { ...state.parts } } });
      if (!plain) $q("#cmOut").value = `"cover": ${JSON.stringify(cover(), null, 2)}`;
      wrap.querySelectorAll(".cm-chip").forEach((b) => b.classList.toggle("on", (b.dataset.g === "emblem" ? state.emblem : state.parts[b.dataset.g]) === b.dataset.k));
      if (opts.onChange) opts.onChange(cover());
    };
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const QUIET = { scene: .55, sparkle: .4, band: .5, clasp: .55, bookmark: .6, finish: .45, titleDeco: .45 }; // おまかせで「なし」になりやすい部品（にぎやかになりすぎないように）
    const rollPart = (k) => { const keys = Object.keys(PARTS[k].opts); state.parts[k] = QUIET[k] && Math.random() < QUIET[k] ? "none" : pick(keys); };
    wrap.addEventListener("click", (e) => {
      const tab = e.target.closest(".cm-tab");
      if (tab) { wrap.querySelectorAll(".cm-tab").forEach((t) => t.classList.toggle("on", t === tab)); wrap.querySelectorAll(".cm-pane").forEach((p) => { p.hidden = p.dataset.pane !== tab.dataset.tab; }); return; }
      const dice = e.target.closest(".cm-dice");
      if (dice) { if (dice.dataset.dice === "emblem") state.emblem = pick(EMB.slice(0, -1)); else { const keys = Object.keys(PARTS[dice.dataset.dice].opts).filter((o) => o !== state.parts[dice.dataset.dice]); state.parts[dice.dataset.dice] = pick(keys); } draw(); return; }
      const b = e.target.closest(".cm-chip"); if (!b) return;
      if (b.dataset.g === "emblem") state.emblem = b.dataset.k; else state.parts[b.dataset.g] = b.dataset.k; draw();
    });
    if (fields) {
      $q("#cmTitle").addEventListener("input", (e) => { state.title = e.target.value; draw(); });
      $q("#cmSub").addEventListener("input", (e) => { state.subtitle = e.target.value; draw(); });
    }
    $q("#cmColor").addEventListener("input", (e) => { state.color = e.target.value; draw(); });
    $q("#cmAccent").addEventListener("input", (e) => { state.accent = e.target.value; if (!state.textColor) $q("#cmText").value = e.target.value; draw(); });
    $q("#cmText").addEventListener("input", (e) => { state.textColor = e.target.value; draw(); });
    $q("#cmVert").addEventListener("change", (e) => { state.titleDirection = e.target.checked ? "vertical" : "horizontal"; draw(); });
    $q("#cmRand").addEventListener("click", () => {
      Object.keys(PARTS).forEach(rollPart);
      if (state.parts.emblemPos === "none" && Math.random() < .7) state.parts.emblemPos = "middle";
      state.emblem = pick(EMB.slice(0, -1));
      const hue = Math.floor(Math.random() * 360), hsl = (h, s, l) => { const f = (n) => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0"); }; return "#" + f(0) + f(8) + f(4); };
      state.color = hsl(hue, .45, .25); state.accent = hsl((hue + 160 + Math.random() * 60) % 360, .6, .72); state.textColor = "";
      $q("#cmColor").value = state.color; $q("#cmAccent").value = state.accent; $q("#cmText").value = state.accent; draw();
    });
    if (!plain) $q("#cmCopy").addEventListener("click", () => { const t = $q("#cmOut"); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { document.execCommand("copy"); } $q("#cmCopy").textContent = "コピーしました"; setTimeout(() => { $q("#cmCopy").textContent = "書き方をコピー"; }, 1600); });
    draw();
    return {
      get: cover,
      set(c) { // 題名などを外から変える（寄贈の間の入力欄から）
        Object.assign(state, c || {}); if (c && c.parts) state.parts = { ...DEFAULT, ...c.parts };
        $q("#cmColor").value = state.color; $q("#cmAccent").value = state.accent; $q("#cmText").value = state.textColor || state.accent; $q("#cmVert").checked = state.titleDirection === "vertical";
        draw();
      }
    };
  }

  const CSS = `.cm { display: grid; grid-template-columns: minmax(180px, 300px) 1fr; gap: 20px; align-items: start; }
.cm-prev { position: sticky; top: 8px; display: grid; gap: 10px; }
.cm-book { aspect-ratio: 3 / 4; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.5); }
.cm-book svg { width: 100%; height: 100%; display: block; }
.cm-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.cm textarea { width: 100%; box-sizing: border-box; height: 170px; font: 11px/1.5 ui-monospace, monospace; background: #120e1e; color: #e8e0f4; border: 1px solid rgba(214,176,98,.4); border-radius: 8px; padding: 8px; }
.cm-note { font-size: 12px; opacity: .8; margin: 0; }
.cm-row { display: flex; flex-wrap: wrap; gap: 10px 14px; margin-bottom: 10px; align-items: end; }
.cm-row label { display: grid; gap: 4px; font-size: 12px; }
.cm-row input:not([type=checkbox]) { font: inherit; font-size: 14px; padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(214,176,98,.5); background: #1a1528; color: #f2ecdc; min-width: 0; }
.cm-row input[type=color] { width: 54px; height: 32px; padding: 2px; }
.cm-row .cm-cb { display: flex; gap: 6px; align-items: center; font-size: 13px; }
.cm-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0 12px; border-bottom: 1px solid rgba(214,176,98,.35); }
.cm-tab { border: 1px solid rgba(214,176,98,.35); border-bottom: 0; background: rgba(255,255,255,.03); color: #d8d0e8; border-radius: 8px 8px 0 0; padding: 6px 14px; font: 13px/1.4 var(--font-ui, sans-serif); cursor: pointer; }
.cm-tab.on { background: #e8c26a; color: #2b2118; font-weight: 700; }
.cm-group { margin-bottom: 12px; }
.cm-group h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 12px; letter-spacing: .14em; color: #e8c26a; font-weight: 700; }
.cm-dice { border: 1px dashed rgba(214,176,98,.55); background: none; color: #e8c26a; border-radius: 999px; padding: 1px 9px; font: 11px/1.5 var(--font-ui, sans-serif); letter-spacing: 0; cursor: pointer; }
.cm-chip { border: 1px solid rgba(214,176,98,.45); background: rgba(255,255,255,.04); color: #f2ecdc; border-radius: 999px; padding: 4px 11px; margin: 0 5px 5px 0; font: 12px/1.4 var(--font-ui, sans-serif); cursor: pointer; }
.cm-chip.on { background: #e8c26a; color: #2b2118; border-color: #e8c26a; font-weight: 700; }
@media (max-width: 640px) { .cm { grid-template-columns: 1fr; gap: 12px; } .cm-prev { position: sticky; top: 0; z-index: 5; display: flex; gap: 12px; align-items: center; padding: 8px; margin: 0 -8px; background: #17143a; border-radius: 0 0 12px 12px; box-shadow: 0 8px 16px rgba(0,0,0,.35); } .cm-book { flex: 0 0 112px; } .cm-btns { flex-direction: column; } .cm.plain .cm-prev textarea, .cm-prev textarea, .cm-note { display: none; } }`;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  return { render, maker, PARTS, DEFAULT, emblemExtra, EXTRA_EMB_JP };
};
