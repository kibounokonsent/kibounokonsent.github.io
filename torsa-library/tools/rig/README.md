# トルサの部品データ（rig）の作り直し方

トルサの絵（SVG）を描き直したら、次の3ステップで `assets/torsa/rig/rig.json` を作り直します。

1. 部品に切り分ける
   `python3 build_rig.py ../../assets/torsa/rig/src/normal.svg ../../assets/torsa/rig/src/blush.svg ../../assets/torsa/rig/src/eyes-flat.svg rig-raw.json`
2. 部品の大きさを測る（`npm i playwright` が必要）
   `node measure.js rig-raw.json rig-bbox.json`
3. 骨と表示枠とさわれる場所を足す
   `python3 finish_rig.py rig-bbox.json ../../assets/torsa/rig/rig.json`

## 描き直すときの注意
- **レイヤー（グループ）の順番と数は変えないでください。** build_rig.py は「何番目のグループが何の部品か」で切り分けています（例：12番目のグループの中の1番目＝左耳）。
- 部品を増やしたり順番を変えたときは、build_rig.py の `PARTS` の表を合わせて直します。
- 骨の回る中心（pivot）や、さわれる場所（zones）は finish_rig.py で直せます。座標は元のSVGと同じです。
