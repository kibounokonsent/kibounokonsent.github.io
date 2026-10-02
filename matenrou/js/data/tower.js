/* =========================================================
   魔天楼の塔（サイトの階層構造）
   ・HEAVEN：地上から上へ。天使の階級をのぼり、最上階に「神への扉」
   ・ABYSS ：地上から下へ。悪魔の階級をくだり、最下層に「魔神への扉」
   ・floor：階の表示 ／ name：名前 ／ text：説明 ／ links：関連記事ID
   ・choirs を持つ階は、その中に小さな階段（段）を表示します
   ・扉（gate）の text は自由に書き換えてください
   ========================================================= */
window.TOWER = {
  ground: {
    floor: 'G', name: '地上', sub: '人の世',
    text: '人間が暮らし、天使が紛れ、悪魔と契約者が戦う場所。ここから上へ昇れば天界へ、下へ潜れば魔界へ近づく。'
  },

  heaven: {
    title: '昇塔', latin: 'Ad Caelum', sub: '天界へ',
    floors: [ /* 下から上の順 */
      { floor: '1F', name: '化級', text: '武装した人間数人と互角。本能的に動き、言葉を持たない。天使にのみ存在する。', links: ['rank-ka', 'shoshinden'] },
      { floor: '2F', name: '霊級', text: '契約者ペアと互角かやや上。小規模な異能力を持ち、擬態や攪乱に長ける。', links: ['rank-rei'] },
      { floor: '3F', name: '命級', text: '契約者ペアでは苦戦する。戦闘力・知能とも高く、人語を解す個体もいる。', links: ['rank-mei'] },
      { floor: '4F', name: '王級', text: '広範囲・高威力の異能を扱い、独自戦術を持つ。人間社会への深い潜伏も可能。メシア教会を作ったのも王級天使である。', links: ['rank-ou', 'messiah-church'] },
      { floor: '5F', name: '司級', text: '国家災害級。意思と社会性を持ち、組織的に行動する。16体が確認されている。司級の天使には九つの階位があり、上へ行くほど神に近い。', links: ['rank-tsukasa', 'angel-hierarchy'],
        choirs: [ /* 下から上の順 */
          { name: 'アンゲロイ', note: '人と最も関わりが深い／共天教会の創設者' },
          { name: 'アルカンゲロイ', note: 'ラファエルの創設者' },
          { name: 'アルカイ' }, { name: 'エクスーシアイ' }, { name: 'デュナメイス' },
          { name: 'キュリオテーテス' }, { name: 'トロノイ' }, { name: 'ケルビム' },
          { name: 'セラフィム', note: '神と対話ができる' }
        ] },
      { floor: '6F', name: '神級', text: '世界崩壊レベル。天使では「メシア」がこれに当たる。', links: ['rank-kami', 'messiah'] }
    ],
    gate: { name: '神への扉', latin: 'Porta Dei', text: '塔の頂。この扉の向こうは天界とされる。上位の天使ほど神と対話ができるという。', links: ['angel-hierarchy', 'blessing'] }
  },

  abyss: {
    title: '降塔', latin: 'De Profundis', sub: '魔界へ',
    floors: [ /* 上から下の順 */
      { floor: 'B1', name: '霊級', text: '悪魔の多くはこの等級で現れる。小規模な異能力を持ち、擬態や攪乱に長ける。', links: ['rank-rei', 'demon'] },
      { floor: 'B2', name: '命級', text: 'この階級になると、悪魔にも人格的な独立性が出る。', links: ['rank-mei'] },
      { floor: 'B3', name: '王級', text: '広範囲・高威力の異能を扱う。階級が高い悪魔ほど人の形を会得し、その姿は前世の姿とされる。', links: ['rank-ou', 'soul-cycle'] },
      { floor: 'B4', name: '司級', text: '国家災害級。司級悪魔は世界各地に9体が確認されている。王級天使との戦いには司級悪魔の力が要る。', links: ['rank-tsukasa'] },
      { floor: 'B5', name: '神級', text: '悪魔では確認されていない。', links: ['rank-kami'], unknown: true }
    ],
    gate: { name: '魔神への扉', latin: 'Porta Inferi', text: '塔の底。この扉の向こうは魔界とされる。', links: ['blessing', 'seven-sins'] }
  }
};
