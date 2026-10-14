# 人外レストラン｜設定・資料集

1ファイル構成の静的サイトです。フォルダごとサーバーに置けば、そのまま動きます。

## ファイル

| ファイル | 内容 |
| --- | --- |
| index.html | サイト本体（HTML・CSS・JavaScript をすべて含む） |
| ogp.png | SNS で共有したときの画像（1200×630） |
| favicon.svg / favicon-32.png | ブラウザのタブのアイコン |
| apple-touch-icon.png | iPhone のホーム画面のアイコン（180×180） |
| icon-512.png | 大きいアイコン（512×512） |
| site.webmanifest | ホーム画面に追加したときの名前とアイコン |

## 公開するときに直すところ

SNS の共有画像は、絶対 URL でないと表示されないサービスがあります。
公開先の URL が決まったら、index.html の次の2か所を書き換えてください。

```html
<meta property="og:image" content="ogp.png">
<meta name="twitter:image" content="ogp.png">
```

例：`content="https://example.com/jingai-restaurant/ogp.png"`

あわせて `<meta property="og:url" content="公開先のURL">` を追加すると確実です。

## 記事の追加・編集

index.html の中の `const DOCS=[ ... ]` が記事のデータです。1件はこの形です。

```js
{id:"hero", cat:"creature", title:"主人公", no:"C-001",
 summary:"一覧の伝票に出る一文",
 fields:[["種別","人外"],["名前",null]],   // null は「未記入」と表示される（任意）
 body:["本文の段落1","本文の段落2"],
 list:["番号付きの確認事項"],                // 任意
 open:["まだ決まっていない項目"],            // 「未記入の項目」に並ぶ（任意）
 rel:["guests","kitchen"],                   // 関連する資料の id
 scene:"kitchen"}                            // 背景の場面（任意）
```

- `cat` は `world`（世界観）・`creature`（人外図鑑）・`facility`（設備）・`menu`（料理）・`guide`（手引き）のどれか。
- `scene` は `reception`（受付）・`dining`（客席）・`kitchen`（厨房）・`butchery`（解体所）のどれか。省略するとカテゴリごとの場面になります。
- `id` は URL の末尾（`#hero`）にもなるので、英数字で付けてください。
- 血のにじみの形と位置は `id` から自動で決まります。

## 音について

音はすべてブラウザ内で合成しているため、音声ファイルはありません。
最初は切ってあり、右上の「音」から入れます（ブラウザの仕様上、自動再生はしません）。
