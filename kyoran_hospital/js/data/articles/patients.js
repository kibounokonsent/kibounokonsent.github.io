/* ── B2 院内名簿／入院患者（cat: 'people', group: 'patients'） ── */
ARTICLES.push(
  {
    id: 'mad-patients',
    cat: 'people',
    group: 'patients',
    title: '入院患者',
    kana: 'にゅういんかんじゃ',
    en: 'THE PATIENTS',
    summary: '奇病や精神病など様々。普通の患者でさえ、ここに来れば狂ってしまう。',
    updated: '2026-10-01',
    keywords: ['患者', '奇病', '精神病'],
    info: [
      ['症例', '奇病・精神病など'],
      ['予後', '狂う'],
      ['真の役割', '{{完全生物の参考・研究対象}}', true],
    ],
    sections: [
      {
        h: '概要',
        body: [
          '狂乱病院の患者は、奇病や精神病など様々。',
          '==普通の患者でさえ、ここに来れば狂ってしまう。==',
          { type: 'note', title: '記録', text: '個々の患者の記事は、このカテゴリーに順次追加予定。' },
        ],
      },
    ],
    related: ['mad-doctors', 'mental-gauge', 'kise'],
  }
);
