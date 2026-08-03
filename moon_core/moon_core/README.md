# MOON CORE ARCHIVE — 未来世界 公式設定資料集

## フォルダ構成

```
moon_core/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js                       ← 画面を生成する処理（通常は編集不要）
│   └── data/
│       ├── 00-categories.js          ← カテゴリー一覧／歴史年表／ARTICLES配列の宣言
│       ├── articles-world-life.js    ← 世界概要・人々の暮らし
│       ├── articles-tech.js          ← 科学技術
│       ├── articles-substance.js     ← 特殊物質
│       ├── articles-creature.js      ← 生物
│       ├── articles-mutant.js        ← 変異体
│       ├── articles-culture.js       ← 宗教・文化
│       ├── glossary.js               ← 用語集
│       ├── nations/                  ← ★国家は1国につき1ファイル（15ファイル）
│       └── org/                      ← ★組織・企業は1団体につき1ファイル（36ファイル）
└── assets/
    ├── mooncore.svg
    └── images/（カテゴリーごとの画像置き場。国旗は images/nation/flags/）
```

「国家」と「組織・企業」はファイル数が多く、今後も増え続けそうなので、
それぞれ**1項目＝1ファイル**に分割しました。新しい国・組織を追加するときは、
`js/data/nations/` または `js/data/org/` に新しいファイルを1つ作り、
`index.html` に `<script src="js/data/nations/新しいid.js"></script>` のような
1行を追加するだけです（既存のファイルをコピーして中身を書き換えるのが簡単です）。

それ以外のカテゴリー（世界概要・人々の暮らし・科学技術・特殊物質・生物・変異体・宗教文化）は
まだ数が少なく増減も緩やかなため、カテゴリーごとに1ファイルへまとめています。

## 今回、内容面で直した点

- 「キューマ」の記事が2つ（id: kyuma / kyuuma）重複していたため、内容がより詳しい方を
  残して1つに統合しました（id は `kyuma` に統一）。
- 更新日の表記ゆれ（`2026.07.029`、`2026.7.30`、`271.04.01` など）を
  `YYYY.MM.DD` 形式に統一しました。
- `related`（関連項目）に、記事が増えて実際にはリンクできるようになったのに文字列のまま
  だった参照（例: `'ニポラン'` → `'niporan'`）を、実際の記事IDへ張り替えました。
  IDの綴りミス（例: `bernea`→`belnea`、`orgalon`→`orgaron`、`fumora`→`fumora-skypill` など
  30件近く）も、対応する記事を特定できたものはすべて修正しています。
  対応する記事が見つからなかった参照（`wolvptas_spinophen`、`name1000` など数件）は
  そのまま残していますので、必要であれば内容をご確認ください。
- 用語集の「変異体」の項目が、`variant`（変異体の専用記事）へリンクしていなかったため、
  リンクするよう修正しました。
- `index.html` の `<head>` 内にあった誤字（`initial-scale=1.0">f` の余分な `f`）を削除しました。

## まだ残っている、内容の判断が必要な点

チャット本文の回答をご覧ください。
