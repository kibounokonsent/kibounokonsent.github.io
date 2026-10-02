/* ── B2 院内名簿／主要人物（cat: 'people', group: 'main'） ── */
ARTICLES.push(
  {
    id: 'kise',
    cat: 'people',
    group: 'main',
    title: '木瀬',
    kana: 'きせ',
    en: 'KISE',
    summary: '一般人の主人公。ある日、狂乱病院へ連れてこられる。',
    updated: '2026-10-01',
    image: '',
    keywords: ['主人公', 'プレイヤー'],
    info: [
      ['立場', '主人公'],
      ['区分', '一般人'],
      ['目的', '病院からの脱出'],
      ['状態', '[[mental-gauge]]により変動'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '一般人の主人公。',
          'ある日、[[kyoran-byouin]]へ連れてこられる。',
          '病院内を探索しながら、[[mental-gauge]]を維持して正気を保ちつつ、病院からの脱出を目指す。',
        ],
      },
      {
        h: '辿りうる結末',
        body: [
          '木瀬の精神状態や行動によって、物語は複数のルートへ分岐する。',
          { type: 'table', spoiler: true, head: ['ルート', '木瀬の行き着く先'], rows: [
            ['[[route-normal]]', '脱出するが、生還には至らない'],
            ['[[route-madness]]', '狂気に落ち、殺しながら脱出する'],
            ['[[route-true]]', '病院の奥、[[old-rangenium]]のもとへ'],
          ] },
        ],
      },
    ],
    related: ['mental-gauge', 'route-normal', 'route-madness', 'route-true'],
  },

  {
    id: 'old-rangenium',
    cat: 'people',
    group: 'main',
    title: 'オールド・レンジニウム',
    kana: 'おーるどれんじにうむ',
    en: 'OLD RANGENIUM',
    summary: '狂乱病院の所長。オルドレンジを生み出した研究者。',
    updated: '2026-10-01',
    image: '',
    keywords: ['所長', 'オールド', '研究者'],
    info: [
      ['役職', '狂乱病院 所長'],
      ['職業', '研究者'],
      ['目的', '[[perfect-organism]]となること', true],   // ← 3つ目に true でネタバレ行
      ['創造物', '[[oldrange]]'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '[[kyoran-byouin]]の所長。[[oldrange]]を生み出した研究者。',
        ],
      },
      {
        h: '目的',
        spoiler: true,
        body: [
          { type: 'quote', text: '完全生物となること。', by: '彼の目的' },
          'そのために狂乱病院を作り、狂った研究者、医者、患者を集めている。',
          '病院に集められた人間たちは、単なる患者や職員ではなく、完全生物を作るための参考・研究対象となっている。',
        ],
      },
      {
        h: 'オルドレンジの利用',
        body: [
          'オールド・レンジニウムは[[oldrange]]を利用して==各国を脅迫し、研究費用を得ている==。',
          'また、狂乱病院内でも利用している。',
          { type: 'list', items: ['オールドの守護', '脱走者の阻害', '侵入者の阻害'] },
        ],
      },
      {
        h: '物語での位置',
        spoiler: true,
        body: [
          '[[route-true]]において、[[kise]]は病院のさらに奥へと進み、最終的に彼のもとへ辿り着く。',
        ],
      },
    ],
    related: ['hospital-underside', 'oldrange', 'perfect-organism', 'route-true'],
  }
);
