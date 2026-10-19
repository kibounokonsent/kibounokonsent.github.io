/* =========================================================
   トルサ図書館：寄贈された本（book_data フォルダ）を読みこむ
   ---------------------------------------------------------
   本の寄贈の間（donate.html）で作った「寄贈本_○○.json」を book_data フォルダに入れると、
   図書館を開いたときに自動で書架に並びます。棚の場所は空いているところに自動で決まります。

   フォルダの中身の見つけ方（上から順にためして、見つかったものをぜんぶ使う）
     1. book_data/list.json に書いたファイル名（["寄贈本_○○.json", ...]）
     2. サーバーが見せてくれるフォルダの一覧（python の http.server など、たいていのサーバー）
     3. GitHub Pages（○○.github.io）のときは、GitHub のリポジトリの中身
   フォルダの一覧を見せないサーバーに置くときだけ、list.json にファイル名を書き足してください。

   ファイルの中身は、決まった形の値だけを取り出して使います（ほかの書き込みは無視）。
   ========================================================= */
window.TorsaGifts = (() => {
  "use strict";
  const DIR = "book_data/";
  const EMOTES = ["normal", "happy", "heart", "smug", "shy", "sweat", "surprise", "excited", "angry", "sad", "sleepy", "silent", "question"];
  const TYPES = ["friendly", "revisit", "jumper", "refuser"];
  const HALLS = ["main", "east", "west"];
  const BAYS = ["w1", "w2", "w3", "e1", "e2", "e3"];

  const str = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, max) : "");
  const hex = (v) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : "");
  const line = (l) => (l && typeof l === "object" && str(l.text, 300).trim() ? { emote: EMOTES.includes(l.emote) ? l.emote : "normal", text: str(l.text, 300) } : null);
  const lines = (a, max = 8) => (Array.isArray(a) ? a.map(line).filter(Boolean).slice(0, max) : []);

  async function getJSON(url, ms = 6000) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), ms);
    try { const r = await fetch(url, { cache: "no-cache", signal: ctl && ctl.signal }); return r.ok ? await r.json() : null; } catch (e) { return null; } finally { clearTimeout(t); }
  }

  // book_data の中のファイル名を集める
  async function listFiles() {
    const names = new Set();
    // Windows のサーバー（VS Code の Live Preview など）は「\」区切りの名前を返すことがあるので、どちらでも区切る
    const add = (n) => { n = String(n || "").split(/[\\/]/).pop(); if (/\.json$/i.test(n) && n !== "list.json") names.add(n); };
    const list = await getJSON(DIR + "list.json", 4000);
    if (Array.isArray(list)) list.forEach(add);
    try {
      const r = await fetch(DIR, { cache: "no-cache" });
      if (r.ok && /html/i.test(r.headers.get("content-type") || "")) { const t = await r.text(); for (const m of t.matchAll(/href="([^"?#]+?\.json)"/gi)) { try { add(decodeURIComponent(m[1])); } catch (e) { add(m[1]); } } }
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

  // 1冊ぶんを、決まった形だけ取り出して整える
  function clean(raw, parts) {
    if (!raw || typeof raw !== "object" || !raw.book || !raw.work) return null;
    const b = raw.book, w = raw.work, c = b.cover || {};
    const id = "gift-" + (str(b.id, 40).replace(/^gift-/, "").replace(/[^a-z0-9-]/gi, "").toLowerCase() || Math.random().toString(36).slice(2, 10));
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
    const paras = (Array.isArray(w.paragraphs) ? w.paragraphs : []).slice(0, 20000).map((p) => str(p, 8000));
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
    const raws = await Promise.all(names.map((n) => getJSON(DIR + encodeURIComponent(n)).then((j) => (j ? { j, n } : null))));
    return raws.filter(Boolean).map(({ j, n }) => { const g = clean(j, parts); if (g) g.file = n; return g; }).filter(Boolean);
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
  return { load, merge, clean, EMOTES, TYPES };
})();
