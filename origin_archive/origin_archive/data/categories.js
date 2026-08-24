/* ============================================================================
   CATEGORIES / TIMELINE — カテゴリー一覧と歴史年表
   新しいカテゴリーはここに追加してください（上限の目安は12個）。
   ============================================================================ */
const CATEGORIES = [
  {key:'world',     name:'世界概要',       desc:'オリジンという世界そのものについての基本情報',   icon:'globe',   color:'#4B2E8C', primary:true},
  {key:'history',   name:'歴史',           desc:'オリジンの歴史・出来事の年表',                   icon:'clock',   color:'#B8863A', primary:true, subLink:{route:'#/history/timeline', label:'歴史年表を見る'}},
  {key:'species',   name:'種族',           desc:'オリジンに存在する種族',                         icon:'person',  color:'#B8607A'},
  {key:'magic',     name:'魔法',           desc:'オリジンにおける魔法の仕組み',                   icon:'crystal', color:'#A66BFF'},
  {key:'tech',      name:'技術',           desc:'オリジンにおける科学技術',                       icon:'chip',    color:'#2F80ED'},
  {key:'city',      name:'都市',           desc:'オリジンに存在する都市の一覧',                   icon:'flag',    color:'#17A6B8', primary:true, subLink:{route:'#/city/map', label:'世界地図を見る'}},
  {key:'creature',  name:'生物',           desc:'オリジンに生息する生物',                         icon:'leaf',    color:'#3F9142'},
  {key:'org',       name:'組織',           desc:'オリジンに存在する組織・勢力',                   icon:'org',     color:'#5C6BC0'},
  {key:'culture',   name:'文化・信仰',     desc:'オリジンの文化・信仰',                           icon:'shrine',  color:'#D9752E'},
  {key:'contract',  name:'契約',           desc:'オリジンの世界を動かす「契約」の仕組み',         icon:'scale',   color:'#B8348F', primary:true},
  {key:'character', name:'キャラクター',   desc:'オリジンに関わる人物たち',                       icon:'people',  color:'#EC6FA0', primary:true},
  {key:'glossary',  name:'用語集',         desc:'オリジンに関する用語のまとめ',                   icon:'book',    color:'#7A7468', renderMode:'glossary'},

  /* ▲▲▲ 新しいカテゴリーはこの上に追加してください ▲▲▲
     primary:true を付けると、常時表示される上部ナビに出ます（目安は5個まで。
     それ以外は「その他」メニューに自動的にまとまります）。
     color は他のカテゴリーと系統がかぶらない色にしてください
     （例：紫系はworld/magicで使用済みなので避ける）。 */
];

const TIMELINE = [

  /* まだ年表となる出来事の設定は届いていません。
     追加する場合はここに以下の形式で1件ずつ push してください（年代の古い順推奨）。

  {
    era:'（時代・年号）',
    title:'（出来事名）',
    tag:'（分類タグ）',
    desc:'（説明文）',
  },

  */

];

/* すべての記事はこの配列へ追記されます（data/*.js が push します） */
const ARTICLES = [];
