/* =========================================================
   カテゴリー（病棟）定義
   カテゴリーを増やすときは、この配列に1件足すだけ。
     id     : 記事の cat に書く名前（半角英字）
     ward   : 病棟番号の表示
     name   : 表示名
     en     : 英字ラベル
     desc   : カテゴリーページの説明
     icon   : cross / person / scalpel / bed / claw / door / pulse / branch / book
     layout : 一覧の見た目
                'files'   … 通常のファイル一覧（省略時）
                'profile' … 大きめの人物プロフィール
                'badge'   … 職員証
                'karte'   … カルテ
                'doors'   … 扉が並ぶ廊下
     spoiler: true にすると、カテゴリーごと「ネタバレなし」モードで完全に隠れます。
     groups : 任意。カテゴリーの中をさらに分けたいとき。
              記事側に group: 'staff' のように書くと、その欄に入ります。
              グループごとに layout を変えられます。
   ========================================================= */
const CATEGORIES = [
  { id: 'overview', ward: 'B1', name: '作品概要',     en: 'OVERVIEW', icon: 'cross',  desc: '狂乱病院という作品と、その全体構造。' },
  {
    id: 'people', ward: 'B2', name: '院内名簿', en: 'REGISTER', icon: 'person',
    desc: '病院へ連れてこられた者、病院を作った者、そこで働く者、そこで狂う者。',
    groups: [
      { id: 'main',     name: '主要人物',   en: 'KEY PERSONS', layout: 'profile' },
      { id: 'staff',    name: '医師・職員', en: 'STAFF',       layout: 'badge',  empty: 'まだ職員証は発行されていない。' },
      { id: 'patients', name: '入院患者',   en: 'PATIENTS',    layout: 'karte',  empty: '空床。' },
    ],
  },
  { id: 'oldrange', ward: 'B3', name: 'オルドレンジ', en: 'ORDRANGE', icon: 'claw',   desc: 'オールド・レンジニウムが生み出した生物兵器。' },
  { id: 'facility', ward: 'B4', name: '病院施設',     en: 'FACILITY', icon: 'door',   desc: '病棟・区画・立ち入り禁止区域。扉の向こうは、まだ記録されていない。', layout: 'doors' },
  { id: 'system',   ward: 'B5', name: 'システム',     en: 'SYSTEM',   icon: 'pulse',  desc: '探索と精神を管理するゲームシステム。' },
  { id: 'glossary', ward: 'B6', name: '用語集',       en: 'GLOSSARY', icon: 'book',   desc: '院内で使われる言葉の記録。' },
  { id: 'routes',   ward: 'B7', name: 'ルート',       en: 'ROUTES',   icon: 'branch', desc: '木瀬が辿る、三つの結末。', spoiler: true },
];

/* 記事を入れる箱（各 articles/*.js が ARTICLES.push() で追加します） */
const ARTICLES = [];
