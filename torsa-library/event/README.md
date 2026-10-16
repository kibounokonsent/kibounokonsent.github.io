# event フォルダ

イベントの進行・反応と、胸・腰の特別な反応のプログラムを、ここにまとめています。

| ファイル | 役目 |
|---|---|
| `events.js` | イベント（全画面の一枚絵が部品ごとに動く）の進行、会話、イベント中にトルサにさわったときの反応（頭・耳・角・襟・葉っぱ・からだ・腰）。設定は `event/events.json`、絵は `event/events/` |
| `touch-specialness.js` | ふだんの館内で、トルサの胸・腰にさわったときの動き。設定は `touch-specialness.json` を読みこんで使います |
| `touch-specialness.json` | 胸・腰にさわったときの、使うセリフと表情、連続でさわるときの間隔。セリフは `lines` の `patChest` / `patWaist`（禁書庫は `vaultLines` の中）。`data/torsa.json` には、読みこむときにくわえられます |

## 読み込まれる順番（index.html）

`event/touch-specialness.js` → `js/torsa.js` → `event/events.js`

`touch-specialness.js` は `js/torsa.js` より前に読み込まれます。順番を入れかえると、胸と腰が頭と同じふつうの反応になります。
`event-preview.html`（イベントだけを確認するページ）は、`event/events.js` だけを読み込みます。

## 葉の小ネタ

`event/events.json` の `secrets` に、部品の id（`leaf_back` など）を書くと、その葉だけ、さわったときの反応を変えられます（セリフを順番に出す、葉を大きく揺らす、トルサが跳ねる）。仕組みは `events.js` の `react(` にあります。

## 腰の判定が2か所にあるわけ

- 館内：トルサの絵の上に置いたボタン（`index.html` の `data-part="waist"`）と、`assets/torsa/rig/rig.json` の `zones.waist`。反応は `touch-specialness.js`
- イベント：イベントの絵の「からだ」の部品のうち、`event/events.json` の `zones.waist` の四角の中。反応は `events.js`

データ（`data/` と `assets/`）は、これまでの場所のままです。
