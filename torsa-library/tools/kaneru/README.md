# カネルの部品データ（rig）の作り直し方

カネルの絵（SVG）を描き直したら、次の2ステップで `kaneru/rig.json` を作り直します（`npm i playwright svgo` が必要）。

1. 部品に切り分ける（3つめは、目を閉じた頭のSVG。まばたきに使います）
   `python3 build_rig.py src/kaneru.svg rig-raw.json src/head_closed.svg`
2. 軽くして、大きさを測り、骨を足す
   `node finish_rig.js rig-raw.json ../../kaneru/rig.json`

## 描き直すときの注意
- **レイヤー（グループ）の順番と数は変えないでください。** build_rig.py は「何番目のグループが何の部品か」で切り分けています（例：0.12.9 ＝ 頭のグループの10番目＝目）。
- 部品を増やしたり順番を変えたときは、build_rig.py の `PARTS` の表を合わせて直します。
- 骨の回る中心（pivot）は finish_rig.js の `BONES` で直せます。座標は元のSVGと同じです。
- まばたきのため、白目（0.12.4）・まつげ（0.12.16 の中の上下のまつげ）・まゆ（0.12.16 の中の細い線）を別の部品にしています。
- 目とまつげは細かすぎてファイルが重くなるので、10倍の細かさの絵（WebP）にして埋めこんでいます（finish_rig.js の `RASTER`）。
- 元の絵 848KB → rig.json 約386KB（サーバーで圧縮されると約90KB）。

- まばたきは、描いてもらった目を閉じた頭（src/head_closed.svg）の閉じた目のグループを部品 eyesClosed にして使っています（build_rig.py の CLOSED_EYES と HEAD_OFFSET）。
