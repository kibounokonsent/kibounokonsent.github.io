# 部品の SVG を軽くする（svgo）

館内の部品（assets/parts・assets/themes・assets/svg/custom）は、見た目を変えずに軽くしてあります（数字を小数2けたに丸める・使っていないものを捨てる）。合計 約4.8MB → 約3.5MB。

部品を描き直して差し替えたときは、このフォルダで次のようにすると、同じように軽くできます（`npm i svgo` が必要）。

```
npx svgo --config svgo.config.js -f ../../assets/parts
```

- 色は6けた（#a27752 など）のまま残す設定です。tools/theme/make_themes.py が6けたの色を読んで棟ごとの色ちがいを作るためです。
- 水晶玉（tama・tama_purple）のように、とても小さい部品は `svgo3.config.js`（小数3けた）を使っています。
- 元のファイル（assets/parts-src）はそのままです。
