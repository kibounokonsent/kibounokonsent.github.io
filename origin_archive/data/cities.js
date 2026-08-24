/* ============================================================================
   CITIES — 都市
   新しい都市を追加する場合は、この配列に ARTICLES.push({...}) を1件追加するだけでOK。
   詳細設定が未確定の都市は、lede と「詳細資料準備中」の1文だけのスタブにしてあります。
   実際の設定が決まったら、features / culture / role を埋めてください。

   【編集ガイド】pushCity() の項目の目安
     区分（category）… 都市の分類。基本情報として必須
     features        … 特徴（建築様式・地形など）
     culture         … 文化・生活の特色
     role            … その都市が世界の中でどんな役割を持つか

   必須：id / title / category
   任意：features / culture / role（無ければその見出し自体が表示されません）
   まだ何も決まっていない都市は pushCityStub(id, title) だけでOK。
   ============================================================================ */

function pushCityStub(id, title){
  ARTICLES.push({
    id, cat:'city', title,
    lede: '詳細資料準備中。',
    updated: '2026.08.23',
    sections: [
      {id:'overview', title:'概要', blocks:[
        {t:'p', text:'この都市の詳細設定はまだ届いていません。設定が決まり次第、ここに追記されます。'},
      ]},
    ],
    related: [],
  });
}

function pushCity(id, title, category, opts){
  opts = opts || {};
  const sections = [
    {id:'overview', title:'概要', blocks:[
      {t:'info', items:[{label:'区分', value:category}]},
    ]},
  ];

  if(opts.features && opts.features.length){
    sections.push({id:'features', title:'特徴', blocks:[
      {t:'list', items:opts.features},
    ]});
  }

  if(opts.culture && opts.culture.length){
    sections.push({id:'culture', title:'文化', blocks:[
      {t:'list', items:opts.culture},
    ]});
  }

  if(opts.role){
    sections.push({id:'role', title:'役割', blocks:[
      {t:'p', text:opts.role},
    ]});
  }

  ARTICLES.push({
    id, cat:'city', title,
    lede: category,
    updated: '2026.08.23',
    sections,
    related: [],
  });
}

/* ---------- 設定が届いている都市 ---------- */

pushCity('atlantis', 'アトランティス', '海底都市', {
  features: ['珊瑚建築', 'バイオルミネセンス', '和風＋竜宮城様式'],
  culture: ['水中商店街', '光る真珠', 'クラゲラテ'],
  role: '海洋文化・水棲研究の中心',
});

pushCity('marindraft', 'マリンドラフト', '海上都市', {
  role: '交易・補給',
});

pushCity('technopolis', 'テクノポリス', '技術都市', {
  role: '工業・技術開発',
});

pushCity('astralis', 'アストラリス', '魔法都市', {
  role: '魔法・学術研究',
});

/* ---------- 名前のみ決定・詳細は準備中の都市 ---------- */

pushCityStub('novalis', 'ノヴァリス');
pushCityStub('tortuga', 'トルトゥーガ');
pushCityStub('astrias', 'アストリアス');
pushCityStub('sol-levante', 'ソル・レヴァンテ');
pushCityStub('mille-feuille', 'ミル・フィーユ');
pushCityStub('palette-kitchen', 'パレットキッチン');
pushCityStub('muse-haven', 'ミューズヘイヴン');
