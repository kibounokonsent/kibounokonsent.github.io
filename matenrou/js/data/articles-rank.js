/* 階級カテゴリーは renderMode:'rank' なので、一覧の上に比較表が出ます。
   比較表の中身は RANKS 配列（このファイル下部）から作られます。 */
ARTICLES.push(
{
  id: 'rank-system', cat: 'rank',
  title: '階級制度', reading: 'Ordo Graduum',
  updated: '2026-10-01',
  summary: '天使・悪魔ともに階級が存在し、上位ほど強力で知能が高い。',
  sections: [
    { h: '天使と悪魔の階級', table: { head: ['', '天使', '悪魔'], rows: [
      ['化級', '○', '—'],
      ['霊級', '○', '○（多くはこの等級）'],
      ['命級', '○', '○'],
      ['王級', '○', '○'],
      ['司級', '○（16体確認／独自の階位あり）', '○（9体確認）'],
      ['神級', '○（メシア）', '未確認']
    ]}},
    { h: '悪魔の昇級', p: ['悪魔は契約者との絆が強まると進化・強化し、階級が上がることもある。'] },
    { h: '天使の階級と魔力', p: ['天使は魔力量により階級が異なる。'] }
  ],
  related: ['rank-ka', 'rank-rei', 'rank-mei', 'rank-ou', 'rank-tsukasa', 'rank-kami'],
  keywords: ['かいきゅう', '等級', 'ランク']
},
{
  id: 'rank-ka', cat: 'rank', title: '化級', reading: 'Gradus I', updated: '2026-10-01',
  summary: '武装した人間数人と互角。本能的に動き、言葉を持たない。天使にのみ存在する。',
  info: [['強さの目安', '武装した人間数人と互角'], ['存在', '天使のみ'], ['言葉', '持たない']],
  sections: [{ h: '特徴', list: ['本能的に動く', '言葉を持たない', '天使にのみ存在する', '訓練向きの敵'] },
             { h: '出現場所', p: ['[[shoshinden|小神殿]]の3層に存在する。'] }],
  related: ['rank-system', 'rank-rei', 'shoshinden'], keywords: ['化級']
},
{
  id: 'rank-rei', cat: 'rank', title: '霊級', reading: 'Gradus II', updated: '2026-10-01',
  summary: '契約者ペアと互角かやや上。小規模な異能力を持ち、擬態や攪乱に長ける。',
  info: [['強さの目安', '契約者ペアと互角〜やや上'], ['存在', '天使・悪魔']],
  sections: [{ h: '特徴', list: ['小規模な異能力持ち', '擬態や攪乱に長ける', '悪魔も多くはこの等級で現れる'] },
             { h: '出現場所', p: ['[[shoshinden|小神殿]]の3層に存在する。'] }],
  related: ['rank-system', 'rank-ka', 'rank-mei'], keywords: ['霊級']
},
{
  id: 'rank-mei', cat: 'rank', title: '命級', reading: 'Gradus III', updated: '2026-10-01',
  summary: '契約者ペアでは苦戦する。戦闘力・知能とも高く、人語を解す個体もいる。',
  info: [['強さの目安', '契約者ペアでは苦戦'], ['存在', '天使・悪魔']],
  sections: [{ h: '特徴', list: ['戦闘力・知能とも高い', '人語を解す個体も', '悪魔でもこの階級になると人格的独立性が出る'] },
             { h: '出現場所', p: ['[[shoshinden|小神殿]]の2層に存在する。'] }],
  related: ['rank-system', 'rank-rei', 'rank-ou'], keywords: ['命級']
},
{
  id: 'rank-ou', cat: 'rank', title: '王級', reading: 'Gradus IV', updated: '2026-10-01',
  summary: '契約者複数ペアと司級悪魔で戦わなければならない。広範囲・高威力の異能を扱う。',
  info: [['強さの目安', '契約者複数ペア＋司級悪魔'], ['存在', '天使・悪魔']],
  sections: [{ h: '特徴', list: ['広範囲・高威力の異能を扱う', '独自戦術を持つ', '人間社会への深い潜伏も可能'] },
             { h: '出現場所', p: ['[[shoshinden|小神殿]]の1層に存在する。[[messiah-church|メシア教会]]は王級天使が人に化けて作った。'] }],
  related: ['rank-system', 'rank-mei', 'rank-tsukasa', 'messiah-church'], keywords: ['王級']
},
{
  id: 'rank-tsukasa', cat: 'rank', title: '司級', reading: 'Gradus V', updated: '2026-10-01',
  summary: '国家災害級。並の契約者では相手にならない。意思と社会性を持ち、組織的に行動する。',
  info: [['強さの目安', '国家災害級'], ['確認数', '悪魔9体／天使16体'], ['存在', '天使・悪魔']],
  sections: [{ h: '特徴', list: ['並の契約者では相手不可', '意思と社会性を持つ', '組織的行動・統治力あり'] },
             { h: '確認されている個体数', p: ['司級悪魔は世界各地に9体、司級天使は16体が確認されている。司級天使には[[angel-hierarchy|天使独自の階位]]が存在する。'] },
             { h: '講師として', p: ['[[academy|対天使アカデミー]]には、稀に司級契約者が講師として来る。'] }],
  related: ['rank-system', 'angel-hierarchy', 'rank-ou', 'rank-kami'], keywords: ['司級']
},
{
  id: 'rank-kami', cat: 'rank', title: '神級', reading: 'Gradus VI', updated: '2026-10-01',
  summary: '世界崩壊レベル。天使では「メシア」が該当し、悪魔では確認されていない。',
  info: [['強さの目安', '世界崩壊レベル'], ['天使', 'メシア'], ['悪魔', '未確認']],
  sections: [{ h: '特徴', p: ['天使では[[messiah|メシア]]が該当する。現在、神級は悪魔に存在しない。'] }],
  related: ['rank-system', 'messiah', 'rank-tsukasa'], keywords: ['神級', 'メシア']
}
);

/* 階級比較表（階級カテゴリーのページ上部に表示） */
window.RANKS = [
  { id: 'rank-ka',      name: '化級', power: '武装した人間数人と互角',            angel: true, demon: false, level: 1 },
  { id: 'rank-rei',     name: '霊級', power: '契約者ペアと互角〜やや上',          angel: true, demon: true,  level: 2 },
  { id: 'rank-mei',     name: '命級', power: '契約者ペアでは苦戦する',            angel: true, demon: true,  level: 3 },
  { id: 'rank-ou',      name: '王級', power: '契約者複数ペア＋司級悪魔で戦う',    angel: true, demon: true,  level: 4 },
  { id: 'rank-tsukasa', name: '司級', power: '国家災害級',                        angel: true, demon: true,  level: 5 },
  { id: 'rank-kami',    name: '神級', power: '世界崩壊レベル',                    angel: true, demon: false, level: 6, note: '天使＝メシア／悪魔は未確認' }
];
