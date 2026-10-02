/* ── B7 ルート ───────────────────────────── */
ARTICLES.push(
  {
    id: 'route-normal',
    cat: 'routes',
    title: '通常脱出ルート',
    kana: 'つうじょうだっしゅつるーと',
    en: 'ROUTE / ESCAPE',
    summary: '精神を保ったまま脱出する。しかし、生還には至らない。',
    updated: '2026-10-01',
    spoiler: true,
    keywords: ['ノーマル', 'エンディング', '脱出'],
    info: [
      ['条件', '精神状態を保ちながら進む'],
      ['脱出', '達成'],
      ['生還', '{{至らない}}'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '[[kise]]が精神状態を保ちながら病院を進み、脱出する。',
          'しかし、病院から脱出した後、==[[oldrange]]によって命を落とす。==',
          '「病院から脱出する」という目的自体は達成するものの、生還には至らない。',
        ],
      },
    ],
    related: ['route-madness', 'route-true', 'oldrange', 'mental-gauge'],
  },

  {
    id: 'route-madness',
    cat: 'routes',
    title: '狂気ルート',
    kana: 'きょうきるーと',
    en: 'ROUTE / MADNESS',
    summary: '精神ゲージが0になったとき。木瀬は狂気に落ち、殺しながら病院を出る。',
    updated: '2026-10-01',
    spoiler: true,
    keywords: ['狂気', 'エンディング', '殺害'],
    info: [
      ['条件', '[[mental-gauge]]が0になる'],
      ['木瀬', '狂気に落ちる'],
      ['脱出', '達成（狂気のまま）'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '探索中に[[mental-gauge]]が0になる。[[kise]]は狂気に落ちる。',
          'それまで病院から逃げようとしていた木瀬は、狂気に染まり、==医者や患者を殺害しながら脱出する==ようになる。',
          'そして狂気に落ちた状態のまま、病院から脱出する。',
        ],
      },
    ],
    related: ['mental-gauge', 'route-normal', 'route-true', 'mad-doctors'],
  },

  {
    id: 'route-true',
    cat: 'routes',
    title: 'トゥルールート',
    kana: 'とぅるーるーと',
    en: 'ROUTE / TRUE',
    summary: '通常の脱出とは異なる道。病院のさらに奥、所長のもとへ。',
    updated: '2026-10-01',
    spoiler: true,
    keywords: ['トゥルー', 'エンディング', '真相'],
    info: [
      ['行き先', '病院のさらに奥'],
      ['到達', '[[old-rangenium]]'],
      ['明かされるもの', '[[hospital-underside]]'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '通常の脱出とは異なるルート。',
          '[[kise]]は病院のさらに奥へと進み、最終的に[[old-rangenium]]のもとへ辿り着く。',
          'ここで==狂乱病院の裏側にあるもの==へ到達するルートとなる。',
        ],
      },
    ],
    related: ['old-rangenium', 'hospital-underside', 'route-normal', 'route-madness'],
  }
);
