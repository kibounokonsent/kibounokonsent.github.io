/* ============================================================================
   data/characters.js — キャラクター

   ■ キャラクターを追加するには、下のサンプルをコピーして書き換えるだけです。
     その都市の街の中に立ち、クリックで会話・顔をつつくと反応します。
     資料室のキャラクター一覧にも自動で載ります。

   id        半角英数字
   name      名前
   city      いる都市の id（data/cities.js）
   x         街の中での立ち位置 0〜3000（左端〜右端）
   image     任意。立ち絵の画像（縦長・背景透過がおすすめ）。空欄なら仮のシルエット
   color     任意。シルエットの色
   height    任意。立ち絵の高さ（街の高さ1000に対して。標準 260）
   face      任意。顔の位置（立ち絵の中で、上から何％ / 大きさ何％）{ top: 4, size: 26 }
   profile   資料に出す項目（自由に増やせます）
   about     紹介文（資料室の本文。data/articles と同じ書き方が使えます）

   talk      会話。when で出る場面が変わります
               'first'      はじめて話しかけたとき
               'again'      2回目以降（複数書くとランダム）
               'afterPunch' 殴ったあと（顔をつつかれたあと）
   poke      顔をつついたときの反応。つつくたびに上から順に進み、最後のものをくり返します
               react: 'flinch'（びくっとする）'angry'（怒る）'dodge'（よける）'punch'（殴ってくる）

   sample: true は仮のサンプルです。本物のキャラクターを入れたら削除してください。
   ============================================================================ */
window.ORIGIN = window.ORIGIN || {};

ORIGIN.characters = [

  {
    id: 'sample-pearl', sample: true,
    name: '真珠売り（サンプル）',
    city: 'atlantis', x: 1560,
    image: '', color: '#2a7f8a',
    profile: { 都市: 'アトランティス', 役割: '光る真珠の店の店番（仮）' },
    about: `
【概要】
キャラクターの配置と会話を試すためのサンプル。本物のキャラクター設定が届いたら差し替える。
`,
    talk: [
      { when: 'first',      lines: ['いらっしゃい。アトランティスは初めて？', 'この街の真珠は、暗い海の底でも光るんだ。'] },
      { when: 'again',      lines: ['水中商店街はもう見た？　クラゲラテの店もこの先にあるよ。'] },
      { when: 'again',      lines: ['光る真珠、ひとつどう？'] },
      { when: 'afterPunch', lines: ['……まだ何か用？'] },
    ],
    poke: [
      { say: 'ん？',           react: 'flinch' },
      { say: 'ちょっと、やめて。', react: 'angry' },
      { say: '何すんだよ！',   react: 'punch' },
    ],
  },

  {
    id: 'sample-mechanic', sample: true,
    name: '整備士（サンプル）',
    city: 'technopolis', x: 1900,
    image: '', color: '#3a5aa8',
    profile: { 都市: 'テクノポリス', 役割: '発明街の整備士（仮）' },
    about: `
【概要】
キャラクターの配置と会話を試すためのサンプル。本物のキャラクター設定が届いたら差し替える。
`,
    talk: [
      { when: 'first',      lines: ['テクノポリスへようこそ。', 'あっちの巨大ロボット、見た？　あれでもまだ組み立て途中なんだ。'] },
      { when: 'again',      lines: ['この街じゃ、新しいものを作った人がいちばん偉い。'] },
      { when: 'afterPunch', lines: ['手が滑っただけだ。……たぶん。'] },
    ],
    poke: [
      { say: 'おっと。',     react: 'dodge' },
      { say: 'だからやめろって。', react: 'angry' },
      { say: '何すんだよ！', react: 'punch' },
    ],
  },

];
