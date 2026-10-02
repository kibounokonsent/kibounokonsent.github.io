/* ── B1 作品概要 ─────────────────────────── */
ARTICLES.push(
  {
    id: 'kyoran-byouin',
    cat: 'overview',
    title: '狂乱病院',
    kana: 'きょうらんびょういん',
    en: 'KYORAN HOSPITAL',
    summary: '狂った患者と医者が集う、狂った病院。サイコーにサイコでホラーな病院。',
    updated: '2026-10-01',
    keywords: ['作品', '病院', '概要'],
    info: [
      ['種別', '病院（表向き）'],
      ['所長', '[[old-rangenium]]'],
      ['主人公', '[[kise]]'],
      ['目的', '病院からの脱出'],
      ['シリーズ', 'なし（単独作品）'],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '狂った患者と医者が集う、狂った病院。',
          '==サイコーにサイコでホラーな病院。==',
          '患者は奇病や精神病など様々。普通の患者でさえ、ここに来れば狂ってしまう。医者でさえ自己中心的で、狂った者たちが集まっている。',
          { type: 'list', items: ['内臓フェチで、内臓をえぐり出そうとする者。', '目玉フェチで、目玉を保管する者。', 'その他にも、様々な狂った人間。'] },
          'よりどりみどりの狂った人間たちが集まる病院。',
          { type: 'quote', text: 'あなたは平常でいられるかな？' },
        ],
      },
      {
        h: '作品全体の構造',
        body: [
          { type: 'flow', items: [
            '一般人・[[kise]]',
            '狂乱病院へ連れてこられる',
            '[[mental-gauge]]を維持しながら探索',
            '病院からの脱出を目指す',
          ] },
          '木瀬の精神状態や行動によって、物語は複数のルートへ分岐する。',
          { type: 'table', spoiler: true, head: ['分岐', '結末'], rows: [
            ['[[route-normal]]', '脱出後、[[oldrange]]に殺される'],
            ['[[route-madness]]', '精神ゲージ0 → 医者や患者を殺害しながら脱出'],
            ['[[route-true]]', '病院の奥へ → [[old-rangenium]]のもとへ'],
          ] },
        ],
      },
      {
        h: '作品の位置づけ',
        body: [
          '作品としては『狂乱病院』一つだけ。「狂乱シリーズ」として複数作品にする予定はない。',
        ],
      },
    ],
    related: ['kise', 'old-rangenium', 'mental-gauge', 'route-normal', 'route-madness', 'route-true'],
  },

  {
    id: 'hospital-underside',
    cat: 'overview',
    title: '狂乱病院の裏側',
    kana: 'きょうらんびょういんのうらがわ',
    en: 'THE UNDERSIDE',
    summary: '表向きは異常な病院。その裏で行われている研究。',
    updated: '2026-10-01',
    spoiler: true,
    keywords: ['裏側', '研究', '完全生物'],
    info: [
      ['表の顔', '狂った患者と医者が集まる異常な病院'],
      ['裏の顔', '{{完全生物のための研究施設}}'],
      ['主導', '[[old-rangenium]]'],
    ],
    sections: [
      {
        h: '表と裏',
        body: [
          '表向きは、狂った患者と医者が集まる異常な病院。',
          'しかし、その裏では[[old-rangenium]]による研究が行われている。',
        ],
      },
      {
        h: '目的',
        body: [
          { type: 'record', title: '所長目標', text: '「完全生物となること」' },
          'そのために、様々な存在を集め、完全生物の参考としている。',
          { type: 'list', items: ['狂った研究者', '狂った医者', '狂った患者', '[[oldrange]]'] },
          '病院に集められた人間たちは、単なる患者や職員ではない。==完全生物を作るための参考・研究対象==となっている。',
        ],
      },
    ],
    related: ['old-rangenium', 'perfect-organism', 'oldrange', 'route-true'],
  }
);
