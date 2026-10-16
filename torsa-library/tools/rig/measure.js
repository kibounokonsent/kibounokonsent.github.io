// 使い方: node measure.js rig-raw.json rig-bbox.json （npm i playwright が必要）
const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const rig = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const [W,H]=rig.size;
  const b = await chromium.launch({});
  const p = await b.newPage({ viewport: { width: 600, height: 1290 } });
  // 部品ごとの大きさ（はみ出しを含む四角）を測る
  for (const part of rig.parts) {
    await p.setContent(mk(`<defs>${part.defs}</defs><g id="probe">${part.body}</g>`));
    const bb = await p.evaluate(()=>{const r=document.getElementById('probe').getBBox(); return [r.x,r.y,r.width,r.height].map(v=>Math.round(v*100)/100);});
    part.bbox = bb;
  }
  fs.writeFileSync(process.argv[3], JSON.stringify(rig));
  console.log(rig.parts.map(p=>p.id+':'+p.bbox.join(',')).join('\n'));
  await b.close();
})();
