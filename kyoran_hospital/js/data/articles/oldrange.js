/* ── B3 オルドレンジ ─────────────────────── */
ARTICLES.push(
  {
    id: 'oldrange',
    cat: 'oldrange',
    title: 'オルドレンジ',
    kana: 'おるどれんじ',
    en: 'ORDRANGE',
    summary: 'オールド・レンジニウムが生み出した生物兵器。複数の種類が存在する。',
    updated: '2026-10-02',
    image: 'assets/images/oldrange/oldrange-03.svg',
    keywords: ['生物兵器', 'オルド'],
    info: [
      ['分類', '生物兵器'],
      ['創造者', '[[old-rangenium]]'],
      ['種類', '複数（[[oldrange-mantis]]ほか）'],
      ['最大級', '全長10km超'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '[[old-rangenium]]が生み出した生物兵器。複数の種類が存在する。',
        ],
      },
      {
        h: '利用',
        body: [
          'オールド・レンジニウムはオルドレンジを利用して、==各国を脅迫し、研究費用を得ている==。',
          '狂乱病院内でも利用されている。',
          { type: 'list', items: ['オールドの守護', '脱走者の阻害', '侵入者の阻害'] },
          { type: 'warn', spoiler: true, title: '脱走者へ', text: '病院から出られたとしても、それで終わりではない。\n→ [[route-normal]]' },
        ],
      },
      {
        h: '確認されている種類',
        body: [
          { type: 'table', head: ['種類', '大きさ', '備考'], rows: [
            ['[[oldrange-mantis]]', '約5m', '現在出ている一例'],
            ['[[oldrange-large|大型種]]', '30m超', '様々な種類'],
            ['[[oldrange-large|ムカデ型]]', '全長10km超', '最大級'],
          ] },
        ],
      },
    ],
    related: ['oldrange-mantis', 'oldrange-large', 'old-rangenium', 'route-normal'],
  },

  {
    id: 'oldrange-mantis',
    cat: 'oldrange',
    title: 'オルドレンジ：カマキリ型',
    kana: 'おるどれんじかまきりがた',
    en: 'ORDRANGE / MANTIS',
    summary: '約5m。黒い骨とも機械ともつかない身体と、赤い瞳。鎌はどんなものでも切り裂く。',
    updated: '2026-10-02',
    image: 'assets/images/oldrange/mantis.svg',
    keywords: ['カマキリ', '鎌'],
    info: [
      ['分類', '[[oldrange]]'],
      ['体長', '約5m'],
      ['外見', '黒い骨／機械のような身体'],
      ['瞳', '赤'],
      ['速度', '音速超'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '[[oldrange]]のうち、現在出ている一例。',
          { type: 'image', src: 'assets/images/oldrange/mantis.svg', caption: 'オルドレンジ：カマキリ型' },
        ],
      },
      {
        h: '外見',
        body: [
          { type: 'list', items: [
            '大きさは約5m',
            '黒い骨のような、機械のような身体',
            '赤い瞳',
            '腕や足などが==浮いている==',
          ] },
        ],
      },
      {
        h: '能力',
        body: [
          { type: 'table', head: ['項目', '記録'], rows: [
            ['瞬発力', '凄まじい。音速を超える'],
            ['耐久力', '凄まじい。どんな攻撃も通さない'],
            ['再生', '破損しても再生する'],
            ['鎌', 'どんなものであっても切り裂く'],
          ] },
        ],
      },
      {
        h: '未解明点',
        body: [
          { type: 'record', title: '観察記録', text: '度々鳴き声を発するが、その意味は不明。\n腕や足などが浮いているが、なぜ浮いているのか、その原理は不明。' },
        ],
      },
    ],
    related: ['oldrange', 'oldrange-large', 'old-rangenium'],
  },

  {
    id: 'oldrange-large',
    cat: 'oldrange',
    title: '大型オルドレンジ',
    kana: 'おおがたおるどれんじ',
    en: 'ORDRANGE / LARGE',
    summary: 'カマキリ型以外にも様々な種類が存在する。30m超、そして全長10km超のムカデ型。',
    updated: '2026-10-02',
    image: 'assets/images/oldrange/centipede.svg',
    keywords: ['ムカデ', '大型', '30m', '10km'],
    info: [
      ['分類', '[[oldrange]]'],
      ['大型種', '30m超'],
      ['ムカデ型', '全長10km超'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '[[oldrange-mantis]]以外にも、オルドレンジには様々な種類が存在する。',
          'その中には、==30mを超える種類==も存在する。',
        ],
      },
      {
        h: 'ムカデ型',
        body: [
          'さらに、==全長10kmを超えるムカデ型==も存在している。',
          { type: 'image', src: 'assets/images/oldrange/centipede.svg', caption: 'オルドレンジ：ムカデ型' },
          { type: 'note', title: '記録', text: '詳細は未記載。' },
        ],
      },
    ],
    related: ['oldrange', 'oldrange-mantis'],
  }
);
