/* =========================================================
   トルサ図書館：寄贈された本（book_data フォルダ）を読みこむ
   ---------------------------------------------------------
   本の寄贈の間（donate.html）で作った「寄贈本_○○.txt」を book_data フォルダに入れると、
   図書館を開いたときに自動で書架に並びます。棚の場所は空いているところに自動で決まります。
   （前に作った「寄贈本_○○.json」も、そのまま読めます）

   フォルダの中身の見つけ方（上から順にためして、見つかったものをぜんぶ使う）
     1. book_data/list.txt に書いたファイル名（1行に1つ。前の list.json も読みます）
     2. サーバーが見せてくれるフォルダの一覧（python の http.server など、たいていのサーバー）
     3. GitHub Pages（○○.github.io）のときは、GitHub のリポジトリの中身
   フォルダの一覧を見せないサーバーに置くときだけ、list.txt にファイル名を書き足してください。

   テキストの本の書き方は、このファイルの下の方の「テキストの本」と book_data/README.md を見てください。
   挿絵は、本文に「［挿絵：ill-1.webp］」の行を書き、画像を book_data/book_images/（整理番号）/ に置きます（寄贈の間が作る zip を解凍して入れればOK）。
   ファイルの中身は、決まった形の値だけを取り出して使います（ほかの書き込みは無視）。
   ========================================================= */
window.TorsaGifts = (() => {
  "use strict";
  const DIR = "book_data/";
  const EMOTES = ["normal", "happy", "heart", "smug", "shy", "sweat", "surprise", "excited", "angry", "sad", "sleepy", "silent", "question"];
  const TYPES = ["friendly", "revisit", "jumper", "refuser"];
  const HALLS = ["main", "east", "west"];
  const BAYS = ["w1", "w2", "w3", "e1", "e2", "e3"];
  // book_data の中で、本ではないファイル
  const NOT_BOOK = /^(list\.(json|txt)|readme(\.[a-z]+)?|はじめに.*)$/i;
  // 挿絵：本文の中に「［挿絵：ファイル名］」または「［挿絵：ファイル名｜キャプション］」だけの行を書くと、そこに絵が入る
  // 画像は book_data/book_images/（整理番号）/ に置く（寄贈の間が作るzipを book_data で解凍すれば、そのまま入る）
  const IMG_LINE = /^\s*[［\[]挿絵\s*[：:]\s*([^｜|］\]]+?)\s*(?:[｜|]\s*([^］\]]*?))?\s*[］\]]\s*$/;
  const IMG_FILE = /^[\w.\-]{1,60}\.(?:webp|jpe?g|png|gif)$/i;
  const IMG_DIR = "book_data/book_images/";
  // 本文の1行 → { file, caption }（挿絵の行でなければ null）
  const imageLine = (p) => { const m = IMG_LINE.exec(String(p || "")); return m && IMG_FILE.test(m[1]) ? { file: m[1], caption: (m[2] || "").trim().slice(0, 100) } : null; };

  const str = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, max) : "");
  const hex = (v) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : "");
  const line = (l) => (l && typeof l === "object" && str(l.text, 300).trim() ? { emote: EMOTES.includes(l.emote) ? l.emote : "normal", text: str(l.text, 300) } : null);
  const lines = (a, max = 8) => (Array.isArray(a) ? a.map(line).filter(Boolean).slice(0, max) : []);

  // ファイルを文字として読む（UTF-8。メモ帳で Shift_JIS（ANSI）で保存されたファイルも読めるようにする）
  async function getText(url, ms = 6000) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), ms);
    try {
      const r = await fetch(url, { cache: "no-cache", signal: ctl && ctl.signal }); if (!r.ok) return null;
      const buf = await r.arrayBuffer();
      try { return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, ""); }
      catch (e) { try { return new TextDecoder("shift_jis").decode(buf); } catch (e2) { return new TextDecoder("utf-8").decode(buf).replace(/^﻿/, ""); } }
    } catch (e) { return null; } finally { clearTimeout(t); }
  }
  async function getJSON(url, ms = 6000) { const t = await getText(url, ms); if (t == null) return null; try { return JSON.parse(t); } catch (e) { return null; } }

  // book_data の中のファイル名を集める
  async function listFiles() {
    const names = new Set();
    // Windows のサーバー（VS Code の Live Preview など）は「\」区切りの名前を返すことがあるので、どちらでも区切る
    const add = (n) => { n = String(n || "").trim().split(/[\\/]/).pop(); if (/\.(txt|json)$/i.test(n) && !NOT_BOOK.test(n)) names.add(n); };
    const [listTxt, listJson] = await Promise.all([getText(DIR + "list.txt", 4000), getJSON(DIR + "list.json", 4000)]);
    if (listTxt) listTxt.split(/\r?\n/).forEach((l) => { if (!/^\s*(#|＃|\/\/)/.test(l)) add(l); });
    if (Array.isArray(listJson)) listJson.forEach(add);
    try {
      const r = await fetch(DIR, { cache: "no-cache" });
      if (r.ok && /html/i.test(r.headers.get("content-type") || "")) { const t = await r.text(); for (const m of t.matchAll(/href="([^"?#]+?\.(?:txt|json))"/gi)) { try { add(decodeURIComponent(m[1])); } catch (e) { add(m[1]); } } }
    } catch (e) { /* 一覧を見せないサーバー */ }
    if (/\.github\.io$/i.test(location.hostname)) {
      const owner = location.hostname.split(".")[0];
      const path = location.pathname.replace(/(?:index\.html)?\/?$/, "").split("/").filter(Boolean);
      const repo = `${owner}.github.io`;
      let gh = await getJSON(`https://api.github.com/repos/${owner}/${repo}/contents/${[...path, DIR.slice(0, -1)].join("/")}`, 6000);
      // Project Pages use the first path segment as the repository name.
      if (!Array.isArray(gh) && path.length) gh = await getJSON(`https://api.github.com/repos/${owner}/${path[0]}/contents/${DIR.slice(0, -1)}`, 6000);
      if (Array.isArray(gh)) gh.forEach((f) => f && f.type === "file" && add(f.name));
    }
    return [...names].sort();
  }

  /* ---------- テキストの本（寄贈本_○○.txt） ----------
     「■」で始まる行が見出し。見出しの下に、その中身を書きます。
     セリフは1行に1つで、［にこにこ］のように気持ちを先に書く（書かなければ「ふつう」）。
     「■本文」より下は、ファイルのおわりまでぜんぶ本文（1行が1段落、空いた行も残る）。 */
  const EMOTE_JA = { normal: "ふつう", happy: "にこにこ", heart: "だいすき", smug: "ふふん", shy: "てれてれ", sweat: "あせあせ", surprise: "びっくり", excited: "わくわく", angry: "ぷんぷん", sad: "しょんぼり", sleepy: "ねむねむ", silent: "だんまり", question: "はてな" };
  const TYPE_JA = { friendly: "ふつうの本", revisit: "通うほど変わる本", jumper: "飛び出す本", refuser: "読ませてくれない本" };
  const HALL_JA = { "": "おまかせ", main: "本館", east: "東の書館", west: "西の書館" };
  const LINE_JA = [["jump", "棚から飛び出したとき"], ["first", "はじめて手に取ったとき"], ["refuse", "断るとき"], ["accept", "やっと読ませてくれるとき"], ["revisit", "また会いに来たとき"], ["frequent", "何度も通ったとき"], ["afterRead", "読み終わったとき"], ["catalog", "目録から来たとき"]];
  const fromJa = (map, v) => { v = String(v || "").trim(); if (!v) return ""; const hit = Object.entries(map).find(([k, ja]) => ja && (v === ja || v === k)) || Object.entries(map).find(([, ja]) => ja && v.includes(ja)); return hit ? hit[0] : ""; };
  const NUM = (s) => parseInt(String(s || "").replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0)), 10);

  // セリフ1行 →｛emote, text｝。［にこにこ］・[にこにこ]・【にこにこ】・(happy) のどれでも
  function parseLine(l) {
    const m = /^\s*[［\[【]([^］\]】]*)[］\]】]\s*(.*)$/.exec(l);
    if (!m) return { emote: "normal", text: l.trim() };
    return { emote: fromJa(EMOTE_JA, m[1]) || "normal", text: m[2].trim() };
  }

  function parseText(txt) {
    const rows = String(txt || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
    const sec = {}; let cur = null, body = null;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], h = /^\s*■\s*(.*)$/.exec(r);
      if (h) {
        const name = h[1].trim();
        if (/^本文/.test(name)) { body = rows.slice(i + 1); break; }
        cur = name; sec[cur] = []; continue;
      }
      if (cur) sec[cur].push(r);
    }
    // 見出しの名前で探す（うしろの（…）は説明なので無視）
    const key = (n) => n.replace(/[（(][^）)]*[）)]\s*$/, "").trim();
    const get = (name) => { const k = Object.keys(sec).find((n) => key(n) === name); return k ? sec[k] : null; };
    const one = (name) => { const a = get(name); return a ? (a.find((l) => l.trim()) || "").trim() : ""; };
    if (!one("題名") && !body) return null; // 寄贈本のテキストではない

    // 表紙（「名前：値」の行）
    const cv = {}; (get("表紙") || []).forEach((l) => { const m = /^\s*([^：:]+)[：:]\s*(.*)$/.exec(l); if (m) cv[m[1].trim()] = m[2].trim(); });
    const parts = {}; String(cv["部品"] || "").split(/[\/／,、\s]+/).forEach((p) => { const m = /^([a-zA-Z]+)\s*[=＝]\s*([\w-]+)$/.exec(p.trim()); if (m) parts[m[1]] = m[2]; });

    // セリフ
    const lines = {}, refuse = [];
    Object.keys(sec).forEach((n) => {
      const m = /^セリフ\s*[：:]?\s*(.*)$/.exec(n); if (!m) return;
      const hit = LINE_JA.find(([, ja]) => m[1].includes(ja)); if (!hit) return;
      const ls = sec[n].filter((l) => l.trim()).map(parseLine).filter((l) => l.text);
      if (hit[0] === "refuse") { const k = NUM((/(\d+|[０-９]+)/.exec(m[1]) || [])[1]) || refuse.length + 1; refuse[k - 1] = ls; }
      else lines[hit[0]] = (lines[hit[0]] || []).concat(ls);
    });
    const type = fromJa(TYPE_JA, one("くせ")) || "friendly";
    const refuseCount = Math.max(1, Math.min(3, NUM(one("断る回数")) || refuse.filter((a) => a && a.length).length || 2));
    const out = {
      torsaLibraryGift: 1, createdAt: one("寄贈日"), madeWith: "トルサ図書館 寄贈の間",
      book: {
        id: one("整理番号"), title: one("題名"), type, hall: fromJa(HALL_JA, one("置いてほしい場所")),
        shelfEmote: one("棚の上のしるし").replace(/^なし$/, ""),
        personality: { preset: one("性格"), note: one("性格のメモ") },
        cover: { title: cv["題名"] || "", subtitle: cv["副題"] || "", titleDirection: /縦|vertical/.test(cv["書く向き"] || "") ? "vertical" : "horizontal", color: cv["地の色"] || "", accent: cv["飾りの色"] || "", textColor: cv["題名の色"] || "", emblem: cv["紋章"] || "", parts },
        lines: { first: lines.first || [], revisit: lines.revisit || [], afterRead: (lines.afterRead || [])[0], catalog: (lines.catalog || [])[0] }
      },
      work: { title: one("題名"), author: one("作者"), genre: one("カテゴリー"), paragraphs: [] }
    };
    if (type === "revisit") { out.book.lines.frequent = lines.frequent || []; out.book.lines.frequentFrom = NUM(one("特別なセリフになる回数")) || 4; }
    if (type === "jumper") out.book.lines.jump = lines.jump || [];
    if (type === "refuser") { out.book.refuseCount = refuseCount; out.book.lines.refuse = Array.from({ length: refuseCount }, (_, i) => refuse[i] || []); out.book.lines.accept = lines.accept || []; }
    // 本文：前後の空いた行はけずる。行のおわりの空白もけずる
    const ps = (body || []).map((p) => (p.trim() ? p.replace(/\s+$/, "") : ""));
    while (ps.length && !ps[0]) ps.shift(); while (ps.length && !ps[ps.length - 1]) ps.pop();
    out.work.paragraphs = ps;
    return out;
  }

  // 寄贈本のデータ（寄贈の間で作る形）→ テキスト
  function toText(d) {
    const b = d.book || {}, w = d.work || {}, c = b.cover || {}, L = b.lines || {};
    const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const say = (a) => arr(a).filter((l) => l && l.text).map((l) => `［${EMOTE_JA[l.emote] || "ふつう"}］${String(l.text).replace(/\s*\n\s*/g, " ")}`).join("\n");
    const o = [];
    const put = (h, v) => { o.push("■" + h, v == null ? "" : String(v), ""); };
    o.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "　トルサ図書館　寄贈本", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "このファイルを、図書館の book_data フォルダに入れると、書架に並びます。",
      "直すときは、「■」の行（見出し）はそのままにして、その下を書きかえてください。",
      "セリフは1行にひとこと。［ ］の中が、そのときの気持ち（顔）です。",
      "（気持ちの名前：" + Object.values(EMOTE_JA).join("・") + "）", "");
    put("題名", b.title || w.title);
    put("作者", w.author);
    put("カテゴリー", w.genre);
    put("くせ（" + Object.values(TYPE_JA).join("／") + "）", TYPE_JA[b.type] || TYPE_JA.friendly);
    if (b.type === "refuser") put("断る回数（1〜3）", b.refuseCount || arr(L.refuse).length || 2);
    if (b.type === "revisit") put("特別なセリフになる回数（何回目から）", L.frequentFrom || 4);
    put("置いてほしい場所（" + Object.values(HALL_JA).join("／") + "）", HALL_JA[b.hall || ""] || HALL_JA[""]);
    put("棚の上のしるし", b.shelfEmote || "なし");
    put("性格", (b.personality && b.personality.preset) || "");
    put("性格のメモ", (b.personality && b.personality.note) || "");
    const P = c.parts && typeof c.parts === "object" ? Object.entries(c.parts).map(([k, v]) => `${k}=${v}`).join(" / ") : "";
    o.push("■表紙", `題名：${c.title || ""}`, `副題：${c.subtitle || ""}`, `書く向き：${c.titleDirection === "vertical" ? "縦書き" : "横書き"}`, `地の色：${c.color || ""}`, `飾りの色：${c.accent || ""}`);
    if (c.textColor) o.push(`題名の色：${c.textColor}`);
    o.push(`紋章：${c.emblem || ""}`, `部品：${P}`, "");
    const sec = (key, title) => { o.push("■セリフ：" + title, say(L[key]), ""); };
    if (b.type === "jumper") sec("jump", "棚から飛び出したとき");
    if (b.type !== "refuser") sec("first", "はじめて手に取ったとき");
    if (b.type === "refuser") { arr(L.refuse).forEach((a, i) => { o.push(`■セリフ：断るとき（${i + 1}回目）`, say(a), ""); }); sec("accept", "やっと読ませてくれるとき"); }
    sec("revisit", "また会いに来たとき");
    if (b.type === "revisit") sec("frequent", "何度も通ったとき");
    sec("afterRead", "読み終わったとき");
    sec("catalog", "目録から来たとき");
    put("整理番号（変えないでください）", String(b.id || "").replace(/^gift-/, ""));
    put("寄贈日", d.createdAt || "");
    o.push("■本文（この下から、ファイルのおわりまでが本文です）");
    o.push(...arr(w.paragraphs).map((p) => String(p)));
    return o.join("\n").replace(/\n{3,}(?=■)/g, "\n\n") + "\n";
  }

  /* ---------- 管理人用：data/works.json と data/books.json に足す JSON を、テキストにして出す ----------
     raw   : 寄贈の間で作った本のデータ（toText に渡すものと同じ形）
     parts : 表紙の部品（C.PARTS.PARTS）
     books : いまの data/books.json の "books"（渡せれば、空いている棚の場所と重ならない id を決める。なければ仮の場所）
     返す  : { text, placed, id, hall, place } ／ 本の形になっていないときは null */
  function toAdminText(raw, parts, books) {
    const g = clean(raw, parts); if (!g) return null;
    const known = Array.isArray(books);
    const list = known ? books : [];
    // 追加先に同じ id があるときは、x を足してずらす（merge と同じやりかた）
    while (list.some((b) => b && b.id === g.book.id)) { g.book.id += "x"; g.book.workId = g.work.id = g.book.id; }
    const placed = place(g, list);
    let b = g.book; const w = g.work;
    // 性格（プリセット名とメモ）は、いまの books.json と同じように _typeNote（管理人へのメモ）として残す
    const pe = raw.book && raw.book.personality || {};
    const note = [str(pe.preset, 40).trim(), str(pe.note, 80).trim()].filter(Boolean).join("。");
    if (note) { const { id, title, workId, type, ...rest } = b; b = { id, title, workId, type, _typeNote: note, ...rest }; }
    delete b.gift; // 手で足した本は、ふつうの本として並べる
    if (b.hall === "main") delete b.hall; // 本館は書かなくてよい（いまある本と同じ書き方）
    if (!placed) delete b.place;
    const HALL_NAME = { main: "本館", east: "東の書館", west: "西の書館" };
    const hallName = HALL_NAME[b.hall || "main"];
    const where = placed ? `${hallName}　bay: ${b.place.bay} ／ row: ${b.place.row}（0が一番上）／ slot: ${b.place.slot}` : "（空いている場所が見つかりませんでした。place を自分で決めてください）";
    // セリフ（emote と text）と place は1行にまとめる（いまの books.json の書き方に合わせる）
    const json = (v) => JSON.stringify(v, null, 2)
      .replace(/\{\s*"emote": ("[^"]*"),\s*"text": ("(?:[^"\\]|\\.)*")\s*\}/g, "{ \"emote\": $1, \"text\": $2 }")
      .replace(/\{\s*"bay": ("[^"]*"),\s*"row": (\d+),\s*"slot": (\d+)\s*\}/g, "{ \"bay\": $1, \"row\": $2, \"slot\": $3 }");
    const o = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "　トルサ図書館　管理人用　本の追加データ",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `本：${b.title}　／　作者：${w.author}　／　整理番号（id）：${b.id}`,
      "",
      "【追加のしかた】2つのファイルに、1つずつ貼ります。",
      "  1. data/works.json の「\"works\": [ … ]」の中の、最後の } のうしろに , を付けて、",
      "     下の「works.json に足すもの」を貼る",
      "  2. data/books.json の「\"books\": [ … ]」の中の、最後の } のうしろに , を付けて、",
      "     下の「books.json に足すもの」を貼る",
      "  ※ かたまり同士の間に , が1つ。いちばん最後のかたまりのうしろには , を付けません。",
      "  ※ この本の寄贈本_○○.txt を book_data に入れてある場合は、book_data から出してください",
      "     （入れたままだと、同じ本が2冊並びます）。",
      ...(w.paragraphs.some((p) => /^\[\[img:/.test(p)) ? ["  ※ この本には挿絵があります。zip の中の book_images フォルダは、book_data の中にそのまま置いてください", "     （book_data/book_images/" + b.id.replace(/^gift-/, "") + "/ に画像が入っている形です。txt だけを出して、画像は残します）。"] : []),
      "",
      "【置き場所】" + where,
      ...(g.wantHall && placed && g.wantHall !== (b.hall || "main") ? [`  （寄贈した人は「${HALL_NAME[g.wantHall]}」を希望しましたが、そこは満席か、飛び出す本が先にいるため、${hallName}にしました）`] : []),
      known ? "  （いまの data/books.json を読んで、空いている場所を選びました）" : "  （data/books.json を読めなかったので、仮の場所です。ほかの本と重なるときは、bay・row・slot のどれかをずらしてください）",
      "",
      "■works.json に足すもの（ここから）",
      json(w),
      "■works.json に足すもの（ここまで）",
      "",
      "■books.json に足すもの（ここから）",
      json(b),
      "■books.json に足すもの（ここまで）",
      ""
    ];
    return { text: o.join("\n"), placed, id: b.id, hall: b.hall || "main", place: b.place || null };
  }

  // ファイルの中身（文字）→ 寄贈本のデータ（JSON でもテキストでも）
  function parse(t, name) {
    if (t == null) return null;
    const s = String(t).replace(/^﻿/, "");
    if (/\.json$/i.test(name || "") || /^\s*\{/.test(s)) { try { return JSON.parse(s); } catch (e) { if (/\.json$/i.test(name || "")) return null; } }
    return parseText(s);
  }

  // 1冊ぶんを、決まった形だけ取り出して整える
  function clean(raw, parts) {
    if (!raw || typeof raw !== "object" || !raw.book || !raw.work) return null;
    const b = raw.book, w = raw.work, c = b.cover || {};
    // 整理番号がないときは、題名から決める（開くたびに棚の場所が変わらないように）
    const hashId = (s) => [...String(s || "名もなき本")].reduce((a, ch) => (a * 33 + ch.codePointAt(0)) >>> 0, 5381).toString(36);
    const id = "gift-" + (str(b.id, 40).replace(/^gift-/, "").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "t" + hashId(str(b.title, 60) + "/" + str(w.author, 40)));
    const type = TYPES.includes(b.type) ? b.type : "friendly";
    const P = {};
    if (c.parts && typeof c.parts === "object" && parts) Object.keys(parts).forEach((k) => { const v = c.parts[k]; if (typeof v === "string" && parts[k].opts[v] !== undefined) P[k] = v; });
    const cover = { title: str(c.title, 60) || str(b.title, 60), subtitle: str(c.subtitle, 40), titleDirection: c.titleDirection === "vertical" ? "vertical" : "horizontal", color: hex(c.color) || "#3a3a6a", accent: hex(c.accent) || "#d6b062", emblem: /^[a-z]{2,20}$/.test(c.emblem || "") ? c.emblem : "star", parts: P };
    if (hex(c.textColor)) cover.textColor = hex(c.textColor);
    if (!parts) { cover.template = "classic"; delete cover.parts; }
    const L = b.lines || {};
    const out = {
      id, title: str(b.title, 60) || "名もなき本", workId: id, type, gift: true,
      hall: HALLS.includes(b.hall) ? b.hall : "",
      shelfEmote: str(b.shelfEmote, 4),
      cover,
      lines: { first: lines(L.first), revisit: lines(L.revisit) }
    };
    const al = line(L.afterRead), cl = line(L.catalog);
    if (al) out.lines.afterRead = al;
    out.lines.catalog = cl || { emote: "normal", text: "……。" };
    if (type === "revisit") { out.lines.frequent = lines(L.frequent); out.lines.frequentFrom = Math.max(2, Math.min(20, parseInt(L.frequentFrom, 10) || 4)); if (!out.lines.frequent.length) delete out.lines.frequent; }
    if (type === "jumper") { out.lines.jump = lines(L.jump); out.jumpDelayMs = 1500; }
    if (type === "refuser") {
      out.lines.refuse = (Array.isArray(L.refuse) ? L.refuse : []).map((a) => lines(a)).filter((a) => a.length).slice(0, 3);
      out.lines.accept = lines(L.accept);
      out.refuseCount = out.lines.refuse.length;
      if (!out.refuseCount || !out.lines.accept.length) { out.type = "friendly"; delete out.lines.refuse; delete out.lines.accept; delete out.refuseCount; }
    }
    if (out.type !== "refuser" && !out.lines.first.length) out.lines.first = [{ emote: "normal", text: "……はじめまして。" }];
    if (!out.lines.revisit.length) out.lines.revisit = out.lines.first.length ? out.lines.first.slice(0, 1) : [{ emote: "normal", text: "また来てくれたんだね。" }];
    if (out.type === "jumper" && !out.lines.jump.length) out.lines.jump = [{ emote: "excited", text: "えいっ！" }];
    const bare = id.replace(/^gift-/, "");
    // 挿絵の行は、図書館の本文で使う形「[[img:パス|キャプション]]」にする（ファイル名がおかしい行は空行にする）
    const paras = (Array.isArray(w.paragraphs) ? w.paragraphs : []).slice(0, 20000).map((p) => {
      p = str(p, 8000);
      if (!/^\s*[［\[]挿絵/.test(p)) return p;
      const im = imageLine(p);
      return im ? `[[img:${IMG_DIR}${bare}/${im.file}${im.caption ? "|" + im.caption : ""}]]` : "";
    });
    const work = { id, title: str(w.title, 60) || out.title, author: str(w.author, 40) || "名もなき作者", genre: str(w.genre, 20) || "寄贈本", paragraphs: paras.length ? paras : ["（本文がありません）"] };
    return { book: out, work, at: Date.parse(raw.createdAt) || 0, wantHall: out.hall };
  }

  // 空いている棚の場所を決める（同じ段のとなりに本があるところは使わない）
  function place(gift, books) {
    const hallOf = (b) => b.hall || "main";
    const hash = [...gift.book.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    let halls = gift.wantHall ? [gift.wantHall] : HALLS.slice();
    if (!gift.wantHall) halls.sort((a, b) => books.filter((x) => !x.room && hallOf(x) === a).length - books.filter((x) => !x.room && hallOf(x) === b).length);
    // 飛び出す本は、ひとつの棟に1冊まで（2冊目は、飛び出す本のいない棟へ。どこにもいなければ、ふつうの本に）
    if (gift.book.type === "jumper") {
      const free = HALLS.filter((h) => !books.some((x) => x.type === "jumper" && !x.room && hallOf(x) === h));
      if (!free.length) { gift.book.type = "friendly"; delete gift.book.jumpDelayMs; }
      else if (!free.includes(halls[0])) halls = free;
    }
    for (const hall of halls.concat(HALLS.filter((h) => !halls.includes(h)))) {
      const here = books.filter((x) => !x.room && hallOf(x) === hall && x.place);
      const spots = [];
      BAYS.forEach((bay) => { for (let row = 0; row < 5; row++) for (let slot = 1; slot <= 9; slot++) if (!here.some((x) => x.place.bay === bay && x.place.row === row && Math.abs(x.place.slot - slot) < 3)) spots.push({ bay, row, slot }); });
      if (spots.length) { gift.book.hall = hall; gift.book.place = spots[hash % spots.length]; return true; }
    }
    return false;
  }

  // 読みこみ：寄贈本の一覧（整えたもの）を返す
  async function load(parts) {
    const names = await listFiles();
    const raws = await Promise.all(names.map((n) => getText(DIR + encodeURIComponent(n)).then((t) => { const j = parse(t, n); if (!j) console.warn("book_data の本を読めませんでした:", n); return j ? { j, n } : null; })));
    const out = raws.filter(Boolean).map(({ j, n }) => { const g = clean(j, parts); if (g) g.file = n; else console.warn("寄贈本の形になっていません:", n); return g; }).filter(Boolean);
    if (out.length) console.info(`book_data から ${out.length} 冊の本を読みこみました:`, out.map((g) => g.file).join("、"));
    return out;
  }
  // DATA（books / works）に加える。古い寄贈から順に棚に入れるので、あとから寄贈が増えても前の本の場所は変わりにくい
  function merge(DATA, gifts) {
    const books = DATA.books.books, works = DATA.works.works;
    gifts.sort((a, b) => a.at - b.at || (a.book.id < b.book.id ? -1 : 1)).forEach((g) => {
      while (books.some((b) => b.id === g.book.id)) { g.book.id += "x"; g.book.workId = g.work.id = g.book.id; }
      if (!place(g, books)) return;
      books.push(g.book); works.push(g.work);
    });
    return gifts.length;
  }
  return { load, merge, clean, parse, parseText, toText, toAdminText, imageLine, IMG_LINE, IMG_FILE, EMOTES, TYPES };
})();
