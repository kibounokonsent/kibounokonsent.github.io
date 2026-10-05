/* =========================================================
   魔天楼 ARCHIVE — サイトの構成
   この書は、塔そのものの形をしている。

     ↑ 昇塔（Ad Caelum）   … 天使・天使の階級・天界へ通じるもの
     ● 地上（Terra）       … 世界の成り立ち・契約と代償・組織・戦い・人物
     ↓ 降塔（De Profundis）… 悪魔・七つの種類・悪魔の階級

   ・REALMS     … 三つの領域（上から下の順）
   ・CATEGORIES … 章。realm でどの領域に属するかを決める（並び順＝章番号）
   ・記事は cat に章のIDを書く（js/data/articles-*.js）
   ・icon は js/icons.js の ICONS / EMBLEMS のキー
   ========================================================= */
window.SITE = {
  title: '魔天楼',
  subtitle: 'MATENROU ARCHIVE',
  lead: '天へ昇れば、神への扉。\n地へ潜れば、魔神への扉。\nその間で、人は喰われ、契り、戦う。',
  updated: '2026-10-05'
};

window.REALMS = [
  { id: 'heaven', name: '昇塔', sub: '天使と天界', la: 'Ad Caelum', mark: '↑', tower: '#/ascend',
    desc: '塔を昇るほど、天使は強く、賢くなる。頂には「神への扉」がある。人を喰らうものたちの理と、その階級。' },
  { id: 'ground', name: '地上', sub: '人の世', la: 'Terra', mark: '●',
    desc: '人が暮らし、天使が紛れ、悪魔と契約者が戦う場所。契約と代償、組織、武器、そして名を残すものたち。' },
  { id: 'abyss', name: '降塔', sub: '悪魔と魔界', la: 'De Profundis', mark: '↓', tower: '#/descend',
    desc: '塔を潜るほど、悪魔は強くなる。底には「魔神への扉」がある。天使を裏切り、人と契約するものたちの理と、その階級。' }
];

window.CATEGORIES = [
  /* ↑ 昇塔 */
  { id: 'angel',      realm: 'heaven', name: '天使',           la: 'Angeli',            icon: 'angel',  desc: '人を喰らわねば生きられぬもの。人の世に紛れ、人の上に立つ。' },
  { id: 'angel-rank', realm: 'heaven', name: '天使の階級',     la: 'Gradus Angelorum',  icon: 'ladder', desc: '化級から神級まで。司級には九つの階位がある。塔の上へ続く階。' },
  { id: 'sanctum',    realm: 'heaven', name: '天界へ通じるもの', la: 'Sanctuaria',      icon: 'temple', desc: '天界とつながる小さな塔、小神殿。中には天使が満ちている。' },
  /* ● 地上 */
  { id: 'world',      realm: 'ground', name: '世界の成り立ち', la: 'Mundus',            icon: 'tower',  desc: '天使・悪魔・人。三つの存在と、巡る魂と、塔の階。' },
  { id: 'contract',   realm: 'ground', name: '契約と代償',     la: 'Pactum',            icon: 'seal',   desc: '一度きりの契約。差し出した代償は、二度と戻らない。' },
  { id: 'org',        realm: 'ground', name: '組織・団体',     la: 'Ordines',           icon: 'org',    desc: '天使を討つ者、天使を崇める者、天使と生きようとする者。' },
  { id: 'battle',     realm: 'ground', name: '武器と覚醒',     la: 'Bellum',            icon: 'flame',  desc: '天使を討つための武器と魔具。絆の果ての魔人化、極稀に降りる祝福。' },
  { id: 'character',  realm: 'ground', name: 'キャラクター',   la: 'Personae',          icon: 'human',  desc: 'この塔に名を残すものたち。', renderMode: 'character' },
  /* ↓ 降塔 */
  { id: 'demon',      realm: 'abyss',  name: '悪魔',           la: 'Daemones',          icon: 'demon',  desc: '天使を裏切り、人の側へ堕ちたもの。人を喰わず、契約で生きる。' },
  { id: 'sins',       realm: 'abyss',  name: '七つの種類',     la: 'Septem Peccata',    icon: 'seal',   desc: '色欲・暴食・強欲・憤怒・傲慢・嫉妬・怠惰。種類ごとに代償が違う。' },
  { id: 'demon-rank', realm: 'abyss',  name: '悪魔の階級',     la: 'Gradus Daemonum',   icon: 'ladder', desc: '霊級から司級まで。絆が強まると階級が上がる。塔の下へ続く階。' },
  /* 資料（どの領域にも属さない） */
  { id: 'glossary',   realm: 'ref',    name: '用語集',         la: 'Verba',             icon: 'book',   desc: 'この書に記された言葉。', renderMode: 'glossary' },
  /* 深層（異変のあとにだけ開く。記事に deep: true を付ける） */
  { id: 'deep',       realm: 'deep',   name: '深層',           la: 'Profundum',         icon: 'demon',  desc: '門の向こうに記されていること。', hidden: true }
];

/* 古いリンクの読み替え（[[旧ID]] と書かれていても、新しい場所へ飛ぶ）
   「記事ID/項目キー」と書くと、記事の中のその項目へ直接飛ぶ */
window.ALIASES = {
  'rank-ka': 'angel-ranks/ka', 'rank-rei': 'angel-ranks/rei', 'rank-mei': 'angel-ranks/mei',
  'rank-ou': 'angel-ranks/ou', 'rank-tsukasa': 'angel-ranks/tsukasa', 'rank-kami': 'angel-ranks/kami',
  'crest': 'contract/crest', 'side-effects': 'price/side'
};

window.ARTICLES = window.ARTICLES || [];
window.CHARACTERS = window.CHARACTERS || [];
window.GLOSSARY = window.GLOSSARY || [];
