/* ============================================================================
   GLOSSARY — 用語集
   「用語集」カテゴリーは ARTICLES ではなく、この GLOSSARY 配列から表示されます。
   articleId を指定すると、該当する記事にリンクされます（なければ null のままでOK）。

   必須：term（用語） / def（説明文）
   任意：reading（読み仮名。五十音順に並べる際に使用） / articleId（関連記事があれば）

   例：
   GLOSSARY.push({term:'契約者', reading:'けいやくしゃ', def:'契約を結ぶ当事者の一方。', articleId:'contract'});
   ============================================================================ */

const GLOSSARY = [
  {term:'契約者',       reading:'けいやくしゃ',       def:'契約を結ぶ当事者の一方。「契約」の構成要素のひとつ。',                 articleId:'contract'},
  {term:'契約相手',     reading:'けいやくあいて',     def:'契約者に対し契約を結ぶもう一方の当事者。「契約」の構成要素のひとつ。', articleId:'contract'},
  {term:'契約の成立',   reading:'けいやくのせいりつ', def:'双方の合意によって契約が成立すること。「契約」の構成要素のひとつ。',   articleId:'contract'},
  {term:'対価',         reading:'たいか',             def:'契約の成立にあたって支払われるもの。「契約」の構成要素のひとつ。',     articleId:'contract'},
  {term:'契約期間',     reading:'けいやくきかん',     def:'契約が有効である期間。「契約」の構成要素のひとつ。',                   articleId:'contract'},
  {term:'契約の終了',   reading:'けいやくのしゅうりょう', def:'契約が終わること。「契約」の構成要素のひとつ。',                   articleId:'contract'},
  {term:'契約内容の変更', reading:'けいやくないようのへんこう', def:'成立済みの契約の内容を変更すること。「契約」の構成要素のひとつ。', articleId:'contract'},
  {term:'契約違反',     reading:'けいやくいはん',     def:'契約内容に反する行為。「契約」の構成要素のひとつ。',                   articleId:'contract'},
  {term:'複数の契約',   reading:'ふくすうのけいやく', def:'一者が同時に複数の契約を結ぶこと。「契約」の構成要素のひとつ。',       articleId:'contract'},
  {term:'契約の可視化', reading:'けいやくのかしか',   def:'契約の内容を視覚的に確認できるようにすること。「契約」の構成要素のひとつ。', articleId:'contract'},
  {term:'契約の譲渡',   reading:'けいやくのじょうと', def:'契約上の立場を他者へ譲り渡すこと。「契約」の構成要素のひとつ。',       articleId:'contract'},
];
