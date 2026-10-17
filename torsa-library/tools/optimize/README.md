# 部品の SVG を軽くする（svgo）

館内の部品（assets/parts・assets/themes・assets/svg/custom）は、見た目を変えずに軽くしてあります（数字を小数2けたに丸める・使っていないものを捨てる）。合計 約4.8MB → 約3.5MB。

部品を描き直して差し替えたときは、このフォルダで次のようにすると、同じように軽くできます（`npm i svgo` が必要）。

```
npx svgo --config svgo.config.js -f ../../assets/parts
```

- 色は6けた（#a27752 など）のまま残す設定です。tools/theme/make_themes.py が6けたの色を読んで棟ごとの色ちがいを作るためです。
- 水晶玉（tama・tama_purple）のように、とても小さい部品は `svgo3.config.js`（小数3けた）を使っています。
- 元のファイル（assets/parts-src）はそのままです。

## 重い部品を絵（.webp）にする

本棚（bookcase_b2）・鉢植えの木（tree_a・tree_b・tree_small_a・tree_small_b）・花（blossom_a・blossom_b）・plant は、
細かい線がとても多い SVG で、表示のたびに描くのが重かったので、あらかじめ絵（.webp）にしたものを使っています
（1080p の画面に出る大きさの約2倍で作ってあるので、高画質の画面でもくっきり見えます）。合計 約2.2MB → 約0.4MB。

部品の SVG を描き直したときは、`node rasterize.js` で .webp を作り直してください（使いかたはファイルの先頭）。
もとの SVG も同じ場所に残してあります。data/scene.json の file を .svg に戻すと、SVG を使うようにもどせます。
