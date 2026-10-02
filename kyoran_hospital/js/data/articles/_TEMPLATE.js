/* =========================================================
   記事テンプレート（このファイルは読み込まれません）
   新しい記事を足すときは、下の { … } をコピーして
   該当カテゴリーのファイル（例: oldrange.js）の ARTICLES.push( … ) の中に貼り付けます。

   新しいカテゴリーファイルを作った場合だけ、index.html の
   「▼ 記事データ」の欄に <script> を1行足してください。
   ========================================================= */

ARTICLES.push(
  {
    id: 'new-article',            // 半角英数字とハイフン。URL になります（#/article/new-article）
    cat: 'oldrange',              // categories.js の id
    group: '',                    // 院内名簿のときだけ：'main'（主要人物）/'staff'（職員証）/'patients'（カルテ）
    room: '',                     // 病院施設のときだけ：扉の部屋番号 'B4-01' など
    stamp: '',                    // 任意：カルテ・職員証・扉に押される判子／札 '隔離' '使用中' など
    title: '記事タイトル',
    kana: 'きじたいとる',          // 任意：読み（検索に使われます）
    en: 'NEW ARTICLE',            // 任意：英字ラベル
    summary: '一覧カードに出る短い説明。',
    updated: '2026-10-01',        // 資料の更新日（新しい順に並びます）
    image: '',                    // 任意：サムネイル 'assets/images/oldrange/xxx.png'
    spoiler: false,               // true：記事ごとネタバレ扱い（ネタバレなしモードでは一覧・検索・リンクから完全に消える）
    madness: false,               // true：精神ゲージが 0 のときだけ存在する記事
    keywords: ['検索用', '別名'],  // 任意

    // 右側の情報カード（カルテ欄）。[ラベル, 値] の組
    info: [
      ['分類', '生物兵器'],
      ['危険度', '★★★★★'],
      ['正体', '……', true],        // 3つ目に true を書くと、この行だけネタバレ扱い
    ],

    // 本文。sections の中の body に、段落やブロックを並べます
    sections: [
      {
        h: '概要',
        body: [
          'ふつうの段落。[[kise]] と書くと記事へのリンク、[[kise|別の表示名]] も可。',
          '**太字**、==血文字の強調==、{{黒塗り（ホバーで読める）}} が使えます。',
          '文の一部だけネタバレにするなら ||この部分|| のように囲みます（ネタバレなしモードでは消えます）。',
          { type: 'warn', spoiler: true, text: 'ブロックに spoiler: true を付けると、そのブロックだけネタバレ扱い。' },
          { type: 'list', items: ['箇条書き1', '箇条書き2'] },
          { type: 'warn', title: '警告', text: '赤い警告ブロック。' },
          { type: 'note', title: 'メモ', text: '補足メモのブロック。' },
          { type: 'record', title: '診療記録 No.000', text: 'カルテ風の記録ブロック。\n改行も使えます。' },
          { type: 'quote', text: '台詞や引用。', by: '発言者' },
          { type: 'table', head: ['項目', '内容'], rows: [['A', 'B'], { cells: ['C', 'D'], spoiler: true }] },  // 行単位のネタバレも可
          { type: 'image', src: 'assets/images/oldrange/xxx.png', caption: '画像の説明' },
          { type: 'flow', items: ['一段目', '二段目', '三段目'] },
        ],
      },
      {
        h: '真相',
        spoiler: true,              // 節（見出しごと）をネタバレ扱いにする
        body: ['ネタバレありモードでだけ表示される節。'],
      },
    ],

    related: ['kise', 'oldrange'],  // 関連記事の id
  }
);
