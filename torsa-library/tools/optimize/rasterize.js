/* 重い部品の SVG を、軽い絵（.webp）にするプログラム
   使いかた（このフォルダで。playwright と sharp が必要：npm i playwright sharp）
     1. 図書館のフォルダでサーバーを動かす：python -m http.server 8765
     2. node rasterize.js
   できた .webp は SVG と同じ場所に入ります。data/scene.json の file を .webp にすると使われます
   （棟ごとの色ちがい assets/themes/○○/ も、もとの部品が .webp なら .webp を使います）。 */
const { chromium } = require("playwright");
const sharp = require("sharp");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
// [ファイル, 横, 縦]：1080p の画面に出る大きさの約2倍
const JOBS = [
  ["assets/parts/bookcase_b2.svg", 1051, 1600], ["assets/themes/east/bookcase_b2.svg", 1051, 1600], ["assets/themes/west/bookcase_b2.svg", 1051, 1600], ["assets/themes/annex/bookcase_b2.svg", 1051, 1600],
  ["assets/parts/tree_small_a.svg", 548, 820], ["assets/parts/tree_small_b.svg", 436, 820], ["assets/parts/tree_a.svg", 433, 820], ["assets/parts/tree_b.svg", 576, 760],
  ["assets/parts/blossom_a.svg", 489, 700], ["assets/parts/blossom_b.svg", 421, 560], ["assets/parts/plant.svg", 813, 800]
];
(async () => {
  const b = await chromium.launch();
  for (const [src, w, h] of JOBS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto("http://localhost:8765/tools/");
    await p.setContent(`<html><body style="margin:0;background:transparent"><img src="http://localhost:8765/${src}" style="display:block;width:${w}px;height:${h}px"></body></html>`);
    await p.waitForTimeout(400);
    const png = await p.screenshot({ omitBackground: true }); await p.close();
    await sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(path.join(ROOT, src.replace(/\.svg$/, ".webp")));
    console.log("できた", src.replace(/\.svg$/, ".webp"));
  }
  await b.close();
})();
