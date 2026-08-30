# 世界カレンダー — 組み込み手順

## 1. ファイルを配置

```
js/calendar.js             → 既存の js/ フォルダに追加（描画ロジック。基本的に触らない）
js/data/calendar-events.js → 既存の js/data/ フォルダに追加（イベントデータ。ここだけ触ればOK）
css/calendar.css           → 既存の css/ フォルダに追加
```

## 2. index.html に読み込みを追加

`calendar-events.js` → `calendar.js` の順で読み込んでください（データが先）。

```html
<link rel="stylesheet" href="css/calendar.css">
<script src="js/data/calendar-events.js"></script>
<script src="js/calendar.js"></script>
```

## 3. app.js

**同梱の `app.js` は、お送りいただいたファイルに以下の2箇所だけ追記したものです。**
ルーティング（`#/calendar`が開いたときにカレンダーページを表示する分岐）と、
ナビゲーションへの「世界カレンダー」リンク追加です。差分は以下の2箇所のみです。

### ① ルーター（`router()`関数内）

```js
} else if(hash === '#/calendar'){

  setBackgroundTheme(null);
  document.getElementById('home-hero').style.display = 'none';
  renderCalendarPage(document.getElementById('app'));

} else if(hash === '#/world-map'){
```

### ② ナビゲーション（`renderNav()`関数内、「全記事一覧」リンクの下）

```js
<a href="#/calendar">
  世界カレンダー
</a>
```

そのままご自身のapp.jsに置き換えて問題なければ、同梱のapp.jsで上書きしてください。
すでに他の変更を加えている場合は、上の2箇所だけ手動で追記してください。

## 4. 動作確認

- `js/data/calendar-events.js` に仮データ4件が入っているので、
  ナビゲーションの「世界カレンダー」または `#/calendar` を開けば、
  カレンダー・国フィルター・月移動・行事クリックでのモーダル表示・
  下部のEVENTS一覧まで一通り確認できます。

### 仕様メモ（現在の実装）

- **年は扱いません。** 統合暦の「1年の暦」を表示するページのため、月だけが1〜12で循環します。
- **曜日は表示しません。** 1日から月末まで7列に単純に並べます。
- 行事があるセルには**行事名を直接表示**します（1セルにつき最大2件まで名前表示、
  3件以上は「＋N件」と省略し、クリックするとその日の一覧をモーダルで表示します）。
- 行事クリックは、カレンダー上・下部のEVENTS一覧のどちらからでも同じモーダルが開きます。

## 5. イベントを追加するとき

**`js/data/calendar-events.js` を開いて、配列に1件追加するだけです。**
`js/calendar.js`（描画ロジック）は触る必要はありません。
国フィルターの選択肢も、追加した`countries`から自動的に増えます。

```js
,{
    id: '新しいイベントのID',
    month: 5,
    day: 10,
    name: '行事名',
    type: '祭り',
    countries: ['ラリアフルス'],
    description: '説明文。'
}
```

歴史年表と関連付けたい場合は `established`（制定年）と `relatedHistory`（出来事名）も追加すると、
詳細画面に「関連する歴史 → 歴史年表を見る」のリンクが自動で表示されます。

その行事を掘り下げて解説するMOON CORE記事がある場合は、`articleId` にその記事の `id`
（`ARTICLES` 配列のid）を指定してください。**該当記事が実在するときだけ**モーダルに
「詳細を見る →」が表示され、`#/article/{articleId}` へ移動します。記事が存在しない・
`articleId` を書かない行事では、このリンクは自動的に非表示になります
（「毎年この日に祝う」程度の行事はこれでOKです）。

```js
,{
    id: 'world-unity',
    ...
    articleId: 'world-unity-declaration'
}
```
