/* ============================================================================
   data/cities.js — 都市

   ■ 都市を1つ追加するには、下のどれかの都市をコピーして書き換えるだけです。
     3D地図・都市一覧・資料室・検索に自動で反映されます。

   id        半角英数字（URLやキャラクターの city に使います）
   name/en   名前 / 英字表記
   type      区分（海底都市 など）
   layer     'upper' | 'middle' | 'lower'（data/world.js の階層）
   pos       [x, z] 3D地図上の位置。中心(原点)が [0,0]、既知の領土は |x|+|z| ≤ 10 の◇の中
             x がプラス＝東、z がマイナス＝北
   height    任意。階層の高さからのずれ
   move      任意。移動都市用 { center:[x,z], radius:[横,縦], speed }
   color     地図上のマーカーの色
   features / culture / role   設定（そのまま資料に表示されます）
   spots     街の中で調べられる場所。x は 0〜3000（街の左端〜右端）、y は 0〜1000（上〜下）
   scene     街の見た目（下の「scene の書き方」参照）

   ■ scene の書き方
   palette   空の上下の色・遠景/中景/近景の建物色・地面・窓の光の色
   layers    遠景(far)・中景(mid)・近景(near)に並べる建物の種類
             box tower dome spire pagoda coral tent cake ice mushroom gear chimney
             blob pier mast stall island stalactite cistern shell crystal arch
   extras    動く演出  rays jelly airship gears aurora runes clouds train robot lanterns waves
   particles 漂うもの  bubbles snow sand steam sparkle spores petals embers dust
   celestial 空の天体  sun moon none
   image     任意。背景を1枚絵にしたいときの画像パス（設定すると上の自動描画の代わりに使います）

   ※spots の説明文は features / culture / role から起こした仮の文章です。
   ============================================================================ */
window.ORIGIN = window.ORIGIN || {};

ORIGIN.cities = [

  {
    id: 'atlantis', name: 'アトランティス', en: 'ATLANTIS', type: '海底都市',
    layer: 'lower', pos: [6.8, -0.6], color: '#5fe3e0',
    summary: '海の底に築かれた、珊瑚と光の都市。',
    features: ['珊瑚建築', 'バイオルミネセンス', '和風＋竜宮城様式'],
    culture: ['水中商店街', '光る真珠', 'クラゲラテ'],
    role: '海洋文化・水棲研究の中心',
    spots: [
      { name: '竜宮城様式の宮殿', x: 560,  y: 380, text: '和風の意匠と竜宮城の様式が合わさった建築。アトランティスの街並みを象徴する。' },
      { name: '水中商店街',       x: 1180, y: 600, text: '水の中に店が連なる商店街。アトランティスの文化の中心。' },
      { name: '光る真珠の店',     x: 1650, y: 640, text: 'アトランティスの名物、光る真珠を扱う店。' },
      { name: 'クラゲラテの店',   x: 2120, y: 620, text: 'クラゲラテが飲める店。' },
      { name: '水棲研究施設',     x: 2620, y: 420, text: '海洋文化・水棲研究の中心としての役割を担う施設。' },
    ],
    scene: {
      palette: { sky: ['#03142b', '#0c5168'], far: '#0b3550', mid: '#11506a', near: '#0f3f52', ground: '#0a2c3a', glow: '#8ffcf2' },
      layers: { far: ['coral', 'dome', 'pagoda'], mid: ['pagoda', 'coral', 'dome'], near: ['coral', 'stall', 'pagoda'] },
      extras: ['rays', 'jelly'], particles: 'bubbles', celestial: 'none',
    },
  },

  {
    id: 'marinedraft', name: 'マリンドラフト', en: 'MARINE DRAFT', type: '海上都市',
    layer: 'middle', pos: [6.2, 1.8], color: '#6fb6ff',
    summary: '海の上に浮かぶ、陸と海をつなぐ港の都市。',
    features: ['浮遊桟橋', '交易拠点', '補給港'],
    culture: ['世界中の船乗りや商人が集まる海上マーケット'],
    role: '陸と海を繋ぐ中継地点',
    spots: [
      { name: '浮遊桟橋',       x: 520,  y: 700, text: '海の上に浮かぶ桟橋。' },
      { name: '海上マーケット', x: 1300, y: 640, text: '世界中の船乗りや商人が集まる市場。' },
      { name: '補給港',         x: 2050, y: 600, text: '船が補給に立ち寄る港。' },
      { name: '交易所',         x: 2650, y: 560, text: '交易拠点としてのマリンドラフトを支える場所。' },
    ],
    scene: {
      palette: { sky: ['#f2a46f', '#ffd9a8'], far: '#8a6f8d', mid: '#5f5a7e', near: '#3d3a59', ground: '#2a4a74', glow: '#ffe7a1' },
      layers: { far: ['mast', 'box'], mid: ['pier', 'mast', 'stall'], near: ['pier', 'stall', 'tent'] },
      extras: ['waves', 'lanterns'], particles: 'dust', celestial: 'sun',
    },
  },

  {
    id: 'technopolis', name: 'テクノポリス', en: 'TECHNOPOLIS', type: '技術都市',
    layer: 'middle', pos: [3.0, -2.2], color: '#59c7ff',
    summary: '巨大ロボットとアンドロイドが生まれる、技術開発の中枢。',
    features: ['巨大ロボット', 'アンドロイド製造', '高度な工業技術'],
    culture: ['発明と技術革新を重視する'],
    role: '工業・軍事・技術開発の中枢',
    spots: [
      { name: '巨大ロボット格納庫', x: 600,  y: 360, text: 'テクノポリスを象徴する巨大ロボット。' },
      { name: 'アンドロイド製造区', x: 1300, y: 520, text: 'アンドロイドを製造する区画。' },
      { name: '発明街',             x: 1950, y: 620, text: '発明と技術革新を重んじる、テクノポリスの文化が表れる通り。' },
      { name: '技術開発局',         x: 2600, y: 420, text: '工業・軍事・技術開発の中枢。' },
    ],
    scene: {
      palette: { sky: ['#050816', '#1a2350'], far: '#121a3a', mid: '#18244d', near: '#0e1530', ground: '#0a0f22', glow: '#62e6ff' },
      layers: { far: ['tower', 'box', 'tower'], mid: ['box', 'tower', 'chimney'], near: ['box', 'stall'] },
      extras: ['robot', 'train'], particles: 'embers', celestial: 'moon',
    },
  },

  {
    id: 'astralis', name: 'アストラリス', en: 'ASTRALIS', type: '魔法都市',
    layer: 'middle', pos: [-3.0, -2.4], color: '#c79bff',
    summary: '魔法研究機関と学術施設が集まる、知の都市。',
    features: ['魔法研究機関や学術施設が集中'],
    culture: ['知識と研究を重んじる学術文化'],
    role: '理論魔法・世界法則研究の中心',
    spots: [
      { name: '魔法研究機関', x: 640,  y: 330, text: 'アストラリスに集まる魔法研究機関のひとつ。' },
      { name: '学術施設',     x: 1400, y: 460, text: '知識と研究を重んじる学術文化を支える施設。' },
      { name: '世界法則研究所', x: 2300, y: 360, text: '理論魔法・世界法則研究の中心。' },
    ],
    scene: {
      palette: { sky: ['#120a2e', '#4b2a7a'], far: '#2a1a52', mid: '#36215f', near: '#22143f', ground: '#170d2c', glow: '#f2d98a' },
      layers: { far: ['spire', 'dome'], mid: ['spire', 'arch', 'dome'], near: ['arch', 'spire', 'stall'] },
      extras: ['runes'], particles: 'sparkle', celestial: 'moon',
    },
  },

  {
    id: 'novaris', name: 'ノヴァリス', en: 'NOVARIS', type: '天空都市',
    layer: 'upper', pos: [0.6, -3.6], color: '#9fd8ff',
    summary: '空に浮かぶ、飛空艇と空路の都市。',
    features: ['浮遊都市', '飛空艇発着場', '空中交通網'],
    culture: ['空路物流と航空技術が発展'],
    role: '空の防衛・物流の中心',
    spots: [
      { name: '飛空艇発着場', x: 700,  y: 520, text: '飛空艇が発着する場所。' },
      { name: '空中交通網',   x: 1500, y: 300, text: '浮遊都市の間をつなぐ空の交通網。' },
      { name: '空路物流拠点', x: 2350, y: 560, text: '空の物流の中心。' },
    ],
    scene: {
      palette: { sky: ['#5aa6e8', '#d8f0ff'], far: '#a9c9e6', mid: '#7fa6c9', near: '#5b7ea3', ground: '#f4fbff', glow: '#fff4c2' },
      layers: { far: ['island', 'tower'], mid: ['island', 'dome', 'tower'], near: ['tower', 'dome', 'stall'] },
      extras: ['clouds', 'airship'], particles: 'none', celestial: 'sun', ground: 'cloud',
    },
  },

  {
    id: 'tortuga', name: 'トルトゥーガ', en: 'TORTUGA', type: '移動都市',
    layer: 'middle', pos: [-2.5, 3.5], move: { center: [-2.5, 3.6], radius: [2.0, 1.2], speed: 0.04 },
    color: '#9be38a',
    summary: '巨大な亀の背中に築かれた、旅する都市。',
    features: ['巨大亀の背中に築かれた都市'],
    culture: ['旅人や商人が集う交流文化'],
    role: '移動拠点・異文化交流の中心',
    spots: [
      { name: '甲羅の上の街', x: 900,  y: 420, text: '巨大な亀の甲羅の上に広がる街。' },
      { name: '旅人の広場',   x: 1650, y: 640, text: '旅人や商人が集う場所。' },
      { name: '異文化交流の市', x: 2400, y: 620, text: '移動拠点・異文化交流の中心としての顔。' },
    ],
    scene: {
      palette: { sky: ['#3b2a5c', '#f0a070'], far: '#5a4a5e', mid: '#4a4a3a', near: '#3a3a2c', ground: '#5c6b3a', glow: '#ffc56b' },
      layers: { far: ['shell'], mid: ['tent', 'stall', 'dome'], near: ['tent', 'stall'] },
      extras: ['lanterns'], particles: 'dust', celestial: 'sun',
    },
  },

  {
    id: 'astrias', name: 'アストリアス', en: 'ASTRIAS', type: '極寒都市',
    layer: 'middle', pos: [-0.6, -7.4], color: '#d8f4ff',
    summary: 'マグマすら瞬時に凍る、超極寒の都市。',
    features: ['マグマすら瞬時に凍る超極寒環境'],
    culture: ['寒冷地適応技術と保存文化が発展'],
    role: '極限環境研究・資源都市',
    spots: [
      { name: '凍りついた溶岩', x: 700,  y: 420, text: 'マグマすら瞬時に凍る、超極寒環境を物語るもの。' },
      { name: '保存庫',         x: 1500, y: 600, text: '保存文化が発展したアストリアスの施設。' },
      { name: '極限環境研究所', x: 2400, y: 460, text: '極限環境研究・資源都市としての役割を担う。' },
    ],
    scene: {
      palette: { sky: ['#06142a', '#2b4f7a'], far: '#4a6a90', mid: '#6d8db0', near: '#9ab6d0', ground: '#dfeefa', glow: '#a8fff0' },
      layers: { far: ['ice', 'crystal'], mid: ['ice', 'dome', 'crystal'], near: ['dome', 'ice', 'box'] },
      extras: ['aurora'], particles: 'snow', celestial: 'moon',
    },
  },

  {
    id: 'sollevante', name: 'ソル・レヴァンテ', en: 'SOL LEVANTE', type: '砂漠都市',
    layer: 'middle', pos: [2.4, 5.6], color: '#ffc46b',
    summary: '灼熱の砂漠で水を守る、隊商の都市。',
    features: ['灼熱砂漠', '高度な水資源管理技術'],
    culture: ['隊商交易と節水文化'],
    role: '交易・耐環境技術研究の中心',
    spots: [
      { name: '貯水塔',   x: 650,  y: 360, text: '高度な水資源管理技術を支える設備。' },
      { name: '隊商宿',   x: 1450, y: 620, text: '隊商交易の拠点。' },
      { name: '耐環境技術研究所', x: 2300, y: 460, text: '交易・耐環境技術研究の中心。' },
    ],
    scene: {
      palette: { sky: ['#ff9a3c', '#ffe3a3'], far: '#d79a63', mid: '#b97a48', near: '#8e5a34', ground: '#e6b673', glow: '#fff1b8' },
      layers: { far: ['dome', 'tower'], mid: ['dome', 'cistern', 'box'], near: ['tent', 'dome', 'stall'] },
      extras: [], particles: 'sand', celestial: 'sun',
    },
  },

  {
    id: 'millefeuille', name: 'ミル・フィーユ', en: 'MILLE-FEUILLE', type: 'お菓子都市',
    layer: 'middle', pos: [-4.2, 0.8], color: '#ffa6d6',
    summary: 'お菓子でできた建物が光る、癒やしの都市。',
    features: ['発光スイーツ', '夢菓子', 'お菓子でできた建物'],
    culture: ['幸せと回復を大切にする'],
    role: '癒やし・観光の中心',
    spots: [
      { name: 'お菓子の建物', x: 650,  y: 400, text: 'お菓子でできた建物。' },
      { name: '発光スイーツの店', x: 1400, y: 620, text: '光るスイーツを扱う店。' },
      { name: '夢菓子の工房', x: 2250, y: 520, text: '夢菓子がつくられる場所。' },
    ],
    scene: {
      palette: { sky: ['#2d1840', '#b0619a'], far: '#7a4a85', mid: '#a0609a', near: '#c77aa8', ground: '#f3c6dc', glow: '#fff0a8' },
      layers: { far: ['cake', 'dome'], mid: ['cake', 'mushroom', 'dome'], near: ['cake', 'stall'] },
      extras: ['lanterns'], particles: 'sparkle', celestial: 'moon',
    },
  },

  {
    id: 'palettekitchen', name: 'パレットキッチン', en: 'PALETTE KITCHEN', type: '料理都市',
    layer: 'middle', pos: [1.4, 3.0], color: '#ff8f6b',
    summary: '香りで通りが分かる、食の都市。',
    features: ['料理対決', '香りで分かる通り', '多彩な食文化'],
    culture: ['食を通じた交流と発展を重視する'],
    role: '生活文化・食文化の中心',
    spots: [
      { name: '料理対決の舞台', x: 700,  y: 560, text: '料理対決が行われる場所。' },
      { name: '香りの通り',     x: 1550, y: 640, text: '香りで分かる通り。' },
      { name: '食の市場',       x: 2400, y: 620, text: '多彩な食文化が集まる場所。' },
    ],
    scene: {
      palette: { sky: ['#4a2340', '#f08a5a'], far: '#7a4a48', mid: '#8a5040', near: '#5a3028', ground: '#3a2018', glow: '#ffd27a' },
      layers: { far: ['chimney', 'box'], mid: ['stall', 'box', 'chimney'], near: ['stall', 'tent'] },
      extras: ['lanterns'], particles: 'steam', celestial: 'sun',
    },
  },

  {
    id: 'musehaven', name: 'ミューズヘイヴン', en: 'MUSEHAVEN', type: '芸術都市',
    layer: 'middle', pos: [-1.4, 2.2], color: '#ffd76b',
    summary: '街全体が作品になっている、芸術の都市。',
    features: ['街全体が作品', '自由な創作活動'],
    culture: ['表現は自由で正解はないという思想'],
    role: '文化・芸術・思想の発信源',
    spots: [
      { name: '作品としての街並み', x: 650,  y: 420, text: '街全体が作品になっている。' },
      { name: '創作の広場',         x: 1500, y: 620, text: '自由な創作活動が行われる場所。' },
      { name: '思想の発信地',       x: 2350, y: 460, text: '文化・芸術・思想の発信源。' },
    ],
    scene: {
      palette: { sky: ['#1f2a5a', '#f3b0c8'], far: '#5a4a8a', mid: '#e07a5f', near: '#3d5a80', ground: '#f2e8cf', glow: '#fff3b0' },
      layers: { far: ['blob', 'spire'], mid: ['blob', 'arch', 'dome'], near: ['blob', 'stall'] },
      extras: [], particles: 'petals', celestial: 'sun',
    },
  },

  {
    id: 'steamheim', name: 'スチームハイム', en: 'STEAMHEIM', type: '蒸気都市',
    layer: 'middle', pos: [4.6, 0.2], color: '#e0a66b',
    summary: '歯車と配管が張り巡らされた、蒸気機関の都市。',
    features: ['蒸気機関', '巨大な歯車', '無数の配管', '高架鉄道'],
    culture: ['機械を職人技として扱う文化', '蒸気技師や機械工、歯車職人が多く暮らす'],
    role: '蒸気機関・機械加工・精密機械・大型機械の製造拠点',
    spots: [
      { name: '巨大な歯車',   x: 600,  y: 320, text: 'スチームハイムに張り巡らされた巨大な歯車。' },
      { name: '高架鉄道',     x: 1400, y: 300, text: '街の上を走る高架鉄道。' },
      { name: '歯車職人の工房', x: 2000, y: 620, text: '機械を職人技として扱う文化が根付いた工房。' },
      { name: '大型機械製造所', x: 2650, y: 460, text: '蒸気機関・機械加工・精密機械・大型機械の製造拠点。' },
    ],
    scene: {
      palette: { sky: ['#2a1a10', '#a8743c'], far: '#4a3424', mid: '#5c4030', near: '#3a281c', ground: '#2a1c12', glow: '#ffbf5a' },
      layers: { far: ['chimney', 'gear', 'tower'], mid: ['chimney', 'gear', 'box'], near: ['box', 'gear', 'stall'] },
      extras: ['gears', 'train'], particles: 'steam', celestial: 'none',
    },
  },

  {
    id: 'grandia', name: 'グランディア', en: 'GRANDIA', type: '地下都市',
    layer: 'lower', pos: [-5.4, -1.6], color: '#7dffb0',
    summary: '洞窟と地底湖を利用して築かれた、立体的な地下都市。',
    features: ['巨大な洞窟や地底湖、地下河川を利用した立体的な地下都市', '光る菌類や植物が都市の光源'],
    culture: ['地下特有の生態系と共存する文化', '発光植物や地下植物、地底湖を生活に利用する'],
    role: '地下資源・地下生態系・地底環境研究の中心',
    spots: [
      { name: '光る菌類',   x: 600,  y: 600, text: '都市の光源として利用されている光る菌類。' },
      { name: '地底湖',     x: 1450, y: 760, text: '生活に利用されている地底湖。' },
      { name: '地下河川',   x: 2100, y: 720, text: '都市を形づくる地下河川。' },
      { name: '地底環境研究所', x: 2650, y: 460, text: '地下資源・地下生態系・地底環境研究の中心。' },
    ],
    scene: {
      palette: { sky: ['#020806', '#0b2a22'], far: '#0e2a24', mid: '#123a30', near: '#0a221c', ground: '#06140f', glow: '#8affc4' },
      layers: { far: ['stalactite', 'box'], mid: ['mushroom', 'box', 'arch'], near: ['mushroom', 'stall'] },
      extras: [], particles: 'spores', celestial: 'none', ground: 'lake',
    },
  },

];
