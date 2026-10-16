// カネルの部品データの仕上げ：部品ごとに SVG を軽くして（svgo）、大きさを測り、骨とさわれる場所を足す。
// 使い方: node finish_rig.js rig-raw.json ../../kaneru/rig.json   （npm i playwright svgo が必要）
// 骨の回る中心（pivot）とさわれる場所（zones）は、下の BONES と ZONES で直せます。座標は元の絵と同じです。
const fs = require("fs");
const { chromium } = require("playwright");
const { optimize } = require("svgo");

const BONES = [
  { id: "root", parent: null, pivot: [130, 335] },
  { id: "body", parent: "root", pivot: [140, 178] },
  { id: "wingR", parent: "body", pivot: [190, 128] }, { id: "wingR2", parent: "body", pivot: [186, 142] },
  { id: "wingL", parent: "body", pivot: [122, 128] }, { id: "wingL2", parent: "body", pivot: [124, 142] },
  { id: "armL", parent: "body", pivot: [122, 92] }, { id: "armR", parent: "body", pivot: [180, 95] },
  { id: "capeL", parent: "body", pivot: [100, 120] }, { id: "capeR", parent: "body", pivot: [196, 120] },
  { id: "head", parent: "body", pivot: [139, 84] },
  { id: "ear", parent: "head", pivot: [155, 60] },
  { id: "ahoge", parent: "head", pivot: [150, 22] },
  { id: "locks", parent: "head", pivot: [138, 34] },
  { id: "lockFront", parent: "head", pivot: [134, 34] }
];
// 小さいのに細かすぎる部品は、絵（WebP）にして埋めこむ（ファイルが軽くなる）。数字は何倍の細かさで描くか
const RASTER = { eyes: 10, lashes: 10, whites: 10, eyesClosed: 10 };
// さわれる場所（からだ全体を少し大きめに）
const ZONES = { body: [92, 0, 108, 340] };

(async () => {
  const [, , src, out] = process.argv;
  const rig = JSON.parse(fs.readFileSync(src, "utf8"));
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const p = await b.newPage();
  let total = 0;
  for (const part of rig.parts) {
    const raw = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${rig.size[0]} ${rig.size[1]}"><defs>${part.defs}</defs><g id="probe">${part.body}</g></svg>`;
    await p.setContent(raw);
    const bb = await p.evaluate(() => { const r = document.getElementById("probe").getBBox(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100); });
    // 顔まわりの部品は小数2けた、ほかは小数1けたまで（目に見えない細かさを捨てて軽くする）
    const fine = ["brows", "whites", "nose", "face", "bangs", "ahoge", "locks", "lockFront", "ear", "hairBack", "collar"].includes(part.id) ? 2 : 1;
    const o = optimize(raw, { multipass: true, floatPrecision: fine, plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false, cleanupIds: { minify: true } } } }, { name: "prefixIds", params: { prefix: part.id, delim: "" } }] }).data;
    part.body = o.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/id="probe"/, "");
    part.defs = "";
    // 測りなおし（軽くしたあとの形）
    await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rig.size[0]} ${rig.size[1]}"><g id="probe">${part.body}</g></svg>`);
    part.bbox = await p.evaluate(() => { const r = document.getElementById("probe").getBBox(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100); });
    if (!part.bbox[2]) part.bbox = bb;
    if (RASTER[part.id]) {
      const k = RASTER[part.id], [x, y, w, h] = part.bbox, X = x - .5, Y = y - .5, W = w + 1, H = h + 1;
      const url = await p.evaluate(async ({ body, X, Y, W, H, k }) => {
        const pw = Math.ceil(W * k), ph = Math.ceil(H * k);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pw}" height="${ph}" viewBox="${X} ${Y} ${W} ${H}">${body}</svg>`;
        const im = new Image(); im.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg))); await im.decode();
        const c = document.createElement("canvas"); c.width = pw; c.height = ph; c.getContext("2d").drawImage(im, 0, 0, pw, ph);
        return c.toDataURL("image/webp", .92);
      }, { body: part.body, X, Y, W, H, k });
      part.body = `<image x="${X.toFixed(2)}" y="${Y.toFixed(2)}" width="${W.toFixed(2)}" height="${H.toFixed(2)}" href="${url}"/>`;
    }
    total += part.body.length;
  }
  await b.close();
  const res = { _note: "カネルの部品データ（tools/kaneru で作り直せます）。frame＝表示する範囲、bones＝骨、parts＝部品（重ねる順）、zones＝さわれる場所", frame: [-4, -4, rig.size[0] + 8, rig.size[1] + 8], bones: BONES, zones: ZONES, parts: rig.parts.map(({ id, bone, bbox, body }) => ({ id, bone, bbox, body })) };
  fs.writeFileSync(out, JSON.stringify(res));
  console.log("部品", res.parts.length, "文字", total, "ファイル", fs.statSync(out).size);
})();
