# トルサ図書館（試作）

## フォルダ構成

```
torsa-library/
├─ index.html        … 画面・動き（ふだんは触らなくてOK）
├─ assets/
│  ├─ torsa/         … トルサの表情（normal 通常 / blush 照れ / sweat 汗）
│  ├─ covers/        … 表紙画像を置く場所（テンプレートを使わないとき）
│  ├─ parts/         … 館内の部品（サイトが使う版）
│  ├─ parts-src/     … 受け取った部品の元ファイル（手を加えていない）
│  └─ svg/           … 星空・感情記号・吹き出しの SVG 素材
└─ data/
   ├─ library.json   … 館内の広さ・本棚の位置・場所の名前
   ├─ scene.json     … 部品の一覧・大きさ・合わせ位置と、飾り（ツタ・水晶玉・漂う本）の設定
   ├─ books.json     … 本のキャラクター（性格・セリフ・感情・表紙・置き場所）
   ├─ works.json     … 収録作品の本文
   ├─ torsa.json     … トルサのセリフ
   ├─ bgm.json       … BGMの設定
   └─ sfx.json       … 効果音の設定（音量・個別のオンオフ・音声ファイルへの差し替え）
```

本のセリフ（books.json）と作品本文（works.json）は別ファイルなので、片方を直してももう片方は壊れません。
本と作品は books.json の `workId` で結びついています。

## よくある変更

- **作品の本文を差し替える** … works.json の `paragraphs` に段落ごとに文章を入れる。空行は `""`。
- **本を1冊増やす** … works.json に作品を1つ、books.json に本を1冊追加して `workId` を合わせる。
  `type` は `revisit`（再訪で変わる）／`friendly`（親しげ）／`jumper`（飛び出す）／`refuser`（読ませてくれない）のどれか。
- **表紙を変える** … books.json の `cover` で、形（`template`）・地の色（`color`）・飾りの色（`accent`）・題名（`title`）・副題（`subtitle`）・紋章（`emblem`）・縦書き／横書き（`titleDirection`）を選べます。選べる名前は books.json の先頭に書いてあります。
  描いた表紙画像を使いたいときは `cover.image` にパスを書く（例: `"assets/covers/tsun.png"`）。
- **本の感情** … セリフごとの `emote` を変えると、吹き出しの形と、まわりの記号（汗・照れ線・怒りマーク・音符・Zzz など）が変わります。使える名前は books.json の先頭に書いてあります。
- **本の置き場所** … books.json の `place`（bay＝本棚ID、row＝段、slot＝左から何冊目あたり）。
- **館内の部品を差し替える** … assets/parts/ の同じ名前のファイルを上書きする。大きさが変わったら scene.json の `vb`（と `fit`）を直す（わからなければ、ファイルを渡してくれれば直します）。
- **星空を差し替える** … library.json の `art.sky` にパスを書く。
- **トルサのセリフ** … torsa.json の各場面の配列に文章を足すと、その中からランダムに選ばれます。
  `{ "text": "…", "face": "blush" }` の形で書くと、そのセリフのあいだ表情が変わります。
- **トルサの頭なで** … 頭の上でクリック（タップ）するか、押したまま左右にこすると、照れ顔になって `pat` のセリフを言います。なでた回数が増えると `patMany` も出ます。
- **表情を増やす** … 画像を assets/torsa/ に置き、torsa.json の `faces` に名前とパスを足します。
- **BGM** … bgm.json の `chords`（和音）や `volume`（音量）で雰囲気を変えられます。
  音声ファイルを使いたいときは assets に置いて `audioFile` にパスを書く（例: `"assets/bgm.mp3"`）。

- **効果音** … sfx.json の `volume` で全体の音量、`sounds` の各音を `false` にするとその音だけ止まる。音声ファイルのパスを書くとそのファイルを鳴らす。`typing` は本が話すときの「ぽぽぽ」声。

## パソコンで開くとき

index.html をダブルクリックで開くと、ブラウザの制限で data フォルダを読み込めません。
次のどちらかで開いてください。

- VS Code の拡張機能「Live Server」で index.html を開く
- このフォルダで `python -m http.server` を実行し、ブラウザで http://localhost:8000 を開く

## 来館記録について

訪問回数や「読ませてくれない本」に断られた回数は、閲覧している人のブラウザにだけ保存されます。
蔵書目録の「来館記録をリセット」で最初からやり直せます。
