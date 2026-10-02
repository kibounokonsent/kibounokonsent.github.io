/* =========================================================
   魔天楼 ARCHIVE — カテゴリー定義
   ・ここに1件追加するとトップページとカテゴリー一覧に出ます
   ・icon は js/icons.js の ICONS のキー
   ・color はそのカテゴリーのテーマカラー（バッジ・見出し・カードの線）
   ========================================================= */
window.SITE = {
  title: '魔天楼',
  subtitle: 'MATENROU ARCHIVE',
  lead: '天へ昇れば、神への扉。\n地へ潜れば、魔神への扉。\nその間で、人は喰われ、契り、戦う。',
  updated: '2026-10-01'
};

window.CATEGORIES = [
  { id: 'world',    name: '世界概要',     en: 'WORLD',      icon: 'tower',    color: '#b3122c', la: 'Mundus', desc: '天使・悪魔・人。三つの存在と、巡る魂。' },
  { id: 'angel',    name: '天使',         en: 'ANGEL',      icon: 'angel',    color: '#c9a227', la: 'Angeli', desc: '人を喰らわねば生きられぬもの。人の世に紛れ、人の上に立つ。' },
  { id: 'demon',    name: '悪魔',         en: 'DEMON',      icon: 'demon',    color: '#d0313f', la: 'Daemones', desc: '天使を裏切り、人の側へ堕ちたもの。七つの罪の名を持つ。' },
  { id: 'contract', name: '契約・代償',   en: 'CONTRACT',   icon: 'seal',     color: '#8a3fa6', la: 'Pactum', desc: '一度きりの契約。差し出した代償は、二度と戻らない。' },
  { id: 'rank',     name: '階級',         en: 'RANK',       icon: 'ladder',   color: '#b07a2a', la: 'Gradus', desc: '化級から神級まで。高きものほど強く、賢い。', renderMode: 'rank' },
  { id: 'org',      name: '組織・団体',   en: 'ORGANIZATION', icon: 'org',    color: '#3f6fa6', la: 'Ordines', desc: '天使を討つ者、天使を崇める者、天使と生きようとする者。' },
  { id: 'dungeon',  name: '小神殿・魔具', en: 'SANCTUM',    icon: 'temple',   color: '#9c8e64', la: 'Sanctuaria', desc: '天界へ通じる塔、小神殿。そこから生まれる武器と魔具。' },
  { id: 'battle',   name: '戦闘・覚醒',   en: 'BATTLE',     icon: 'flame',    color: '#e0702a', la: 'Bellum', desc: '絆の果ての魔人化。極稀に降りる祝福。' },
  { id: 'character',name: 'キャラクター', en: 'CHARACTERS', icon: 'human',    color: '#2fa357', la: 'Personae', desc: 'この塔に名を残すものたち。', renderMode: 'character' },
  { id: 'glossary', name: '用語集',       en: 'GLOSSARY',   icon: 'book',     color: '#8c7f86', la: 'Verba', desc: 'この書に記された言葉。', renderMode: 'glossary' }
];

window.ARTICLES = window.ARTICLES || [];
window.CHARACTERS = window.CHARACTERS || [];
window.GLOSSARY = window.GLOSSARY || [];
