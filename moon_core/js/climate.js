/* ============================================================================
   CLIMATE DATA — 各国家の気候・環境情報
   ============================================================================ */

const CLIMATE_DATA = {

  /* ==========================================================================
     ニポラン
     ========================================================================== */

  niporan: {

    name: 'ニポラン',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Cfa（温暖湿潤気候）',
    stability: '比較的安定',
    climateStability: '安定化している',
    fourSeasons: '四季がはっきりしている',
    averageTemperature: '15.4℃',
    annualRainfall: '1,600mm程度',

    /* 地理 */
    geography:
      '山地と平野が広がり、東部には長い海岸線を持つ。森林や河川など多様な自然環境が存在する。',

    terrain: [
      '山地',
      '平野',
      '森林',
      '河川'
    ],

    coastline:
      '東部に長い海岸線を持つ',

    /* 自然環境 */
    environment:
      '温帯性の森林が広く分布し、河川や沿岸部には多様な生態系が形成されている。',

    vegetation:
      '温帯林を中心とした森林',

    /* 気候要因 */
    climateFactors: [
      '海洋からの湿った空気',
      '季節風',
      '梅雨前線',
      '台風'
    ],

    /* 自然災害 */
    naturalHazards: [
      '台風',
      '豪雨',
      '洪水'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 5.2,  rain: 48 },
      { month: 2,  temp: 6.1,  rain: 60 },
      { month: 3,  temp: 10.4, rain: 107 },
      { month: 4,  temp: 16.1, rain: 128 },
      { month: 5,  temp: 21.3, rain: 158 },
      { month: 6,  temp: 24.7, rain: 193 },
      { month: 7,  temp: 28.2, rain: 165 },
      { month: 8,  temp: 29.6, rain: 145 },
      { month: 9,  temp: 25.1, rain: 118 },
      { month: 10, temp: 18.3, rain: 98 },
      { month: 11, temp: 12.5, rain: 88 },
      { month: 12, temp: 6.8,  rain: 52 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '降水量は梅雨と台風の影響で夏から秋に多い',
      '冬は比較的乾燥しており、降雪はまれである',
      '関西変異災害以降、気候パターンにわずかな変化が観測されている'
    ]

  },

  

  /* ==========================================================================
     ラリアフルス
     ========================================================================== */

  larliafrus: {

    name: 'ラリアフルス',

    climateZone: '熱帯',
climateType: '熱帯雨林気候',
stability: '非常に安定',
climateStability: '安定化している',
fourSeasons: '年間を通して高温多雨',
averageTemperature: '27.2℃',
annualRainfall: '2,600mm程度',

    /* 地理 */
    geography:
      '国土の中心に広大なリフィネスの森が広がり、その周囲を主要都市が取り囲むように形成されている。森林内部には河川や湿地、緩やかな丘陵が存在し、豊富な水資源に恵まれている。',

    terrain: [
      '森林',
      '河川',
      '湿地',
      '丘陵',
      '平地'
    ],

    coastline:
      '広い沿岸地域を持つ',

    /* 自然環境 */
    environment:
      '高温多湿な気候と豊富な水資源により、非常に豊かな森林生態系が形成されている。リフィネスの森では植物の循環が特に活発で、食料や薬用植物などの資源を生み出している。',

    vegetation:
      '熱帯林を中心とした豊かな森林',

    /* 気候要因 */
    climateFactors: [
      '高い日射量',
      '海洋からの湿った空気',
      '熱帯特有の上昇気流',
      '季節的な降雨変化',
      '森林による水循環'
    ],

    /* 自然災害 */
    naturalHazards: [
      '豪雨',
      '雷雨',
      '洪水',
      '熱帯低気圧'
    ],

    /* 月別気候 */
months: [
  { month: 1,  temp: 27.1, rain: 225 },
  { month: 2,  temp: 27.3, rain: 215 },
  { month: 3,  temp: 27.5, rain: 235 },
  { month: 4,  temp: 27.7, rain: 245 },
  { month: 5,  temp: 27.8, rain: 255 },
  { month: 6,  temp: 27.5, rain: 205 },
  { month: 7,  temp: 27.0, rain: 180 },
  { month: 8,  temp: 26.8, rain: 170 },
  { month: 9,  temp: 26.9, rain: 180 },
  { month: 10, temp: 27.1, rain: 205 },
  { month: 11, temp: 27.2, rain: 225 },
  { month: 12, temp: 27.1, rain: 240 }
],

    /* 気候の特徴 */
    characteristics: [
      '年間を通して高温多湿で、気温の変化は小さい',
      '雨季には豊富な降水があり、リフィネスの森の植物循環を支えている',
      '乾季でも一定の降水があり、森林が乾燥することは少ない',
      'フーモラによる気候安定化により、極端な豪雨や大型気象災害は抑制されている'
    ]

  },


  /* ==========================================================================
     ユーレツェア
     ========================================================================== */

  yuretsuea: {

    name: 'ユーレツェア',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Cfa寄り（大陸性の影響を受けた温暖湿潤気候）',
    stability: '安定',
    climateStability: '安定化している',
    fourSeasons: '四季の寒暖差がニポランより大きい',
    averageTemperature: '12.5℃',
    annualRainfall: '900mm程度',

    /* 地理 */
    geography:
      '大陸内部に位置し、平野と山地が広がる。半島状の地形を含み、大河が国土を貫いている。',

    terrain: [
      '平野',
      '山地',
      '半島',
      '大河'
    ],

    coastline:
      '西部と南部に海岸線を持つ',

    /* 自然環境 */
    environment:
      '落葉広葉樹林と針葉樹林が混在し、大陸性気候の影響で乾燥した季節も存在する。',

    vegetation:
      '落葉広葉樹林と針葉樹林の混合林',

    /* 気候要因 */
    climateFactors: [
      '大陸からの乾燥した気流',
      '季節風',
      '海洋性気候との境界',
      '飛来する乾燥した砂塵状の現象'
    ],

    /* 自然災害 */
    naturalHazards: [
      '寒波',
      '乾燥',
      '砂塵の飛来',
      '局地的豪雨'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: -3.0, rain: 20 },
      { month: 2,  temp: 0.0,  rain: 25 },
      { month: 3,  temp: 6.0,  rain: 35 },
      { month: 4,  temp: 13.0, rain: 55 },
      { month: 5,  temp: 19.0, rain: 70 },
      { month: 6,  temp: 23.0, rain: 110 },
      { month: 7,  temp: 26.0, rain: 170 },
      { month: 8,  temp: 27.0, rain: 150 },
      { month: 9,  temp: 21.0, rain: 80 },
      { month: 10, temp: 14.0, rain: 45 },
      { month: 11, temp: 6.0,  rain: 30 },
      { month: 12, temp: -1.0, rain: 22 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '冬は大陸からの乾燥した寒気の影響で厳しく冷え込む',
      '夏は季節風の影響で高温多湿になる',
      '春先には乾燥した気流により砂塵のような現象が観測されることがある',
      'フーモラによる安定化で極端な寒波や豪雨は抑制されている'
    ]

  },



  /* ==========================================================================
     ガルヒューラ
     ========================================================================== */

  garhyura: {

    name: 'ガルヒューラ',

    /* 基本気候 */
    climateZone: '冷帯',
    climateType: 'ケッペン気候分類 Dfc（亜寒帯湿潤気候、冷涼な夏と極寒の冬）',
    stability: '不安定（未安定化）',
    climateStability: '安定化されていない',
    fourSeasons: '冬が非常に長く厳しい。夏は短く涼しい',
    averageTemperature: '-2.5℃',
    annualRainfall: '550mm程度',

    /* 地理 */
    geography:
      '広大な平原と針葉樹林（タイガ）が国土の大半を占め、永久凍土地帯も存在する。',

    terrain: [
      '平原',
      'タイガ（針葉樹林）',
      '永久凍土',
      '河川'
    ],

    coastline:
      '北部に限られた海岸線を持つ',

    /* 自然環境 */
    environment:
      '針葉樹林（タイガ）が広がり、冬季は雪と氷に閉ざされる。フーモラの気候安定化を受けていないため、本来の厳しい寒冷環境がそのまま維持されている。',

    vegetation:
      '針葉樹林（タイガ）、寒冷地特有のツンドラ植生',

    /* 気候要因 */
    climateFactors: [
      '大陸内部の寒気団',
      '気候安定化技術の不適用',
      '極端な放射冷却',
      '短い夏の高日照'
    ],

    /* 自然災害 */
    naturalHazards: [
      '猛吹雪',
      '極寒',
      '凍結害',
      '春先の融雪洪水'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: -22.0, rain: 25 },
      { month: 2,  temp: -19.0, rain: 20 },
      { month: 3,  temp: -10.0, rain: 22 },
      { month: 4,  temp: 1.0,   rain: 30 },
      { month: 5,  temp: 9.0,   rain: 45 },
      { month: 6,  temp: 16.0,  rain: 65 },
      { month: 7,  temp: 19.0,  rain: 75 },
      { month: 8,  temp: 17.0,  rain: 68 },
      { month: 9,  temp: 10.0,  rain: 50 },
      { month: 10, temp: 1.0,   rain: 40 },
      { month: 11, temp: -9.0,  rain: 35 },
      { month: 12, temp: -18.0, rain: 30 }
    ],

    /* 気候の特徴 */
    characteristics: [
      'フーモラによる気候安定化を受けていない数少ない国の一つで、本来の極寒気候がそのまま残っている',
      '冬季の平均気温は氷点下を大きく下回り、猛吹雪による被害も珍しくない',
      '夏は短く涼しいが、この時期に集中して農業や活動が行われる',
      '電力を子陽炉ではなく輸入に頼っていることも、気候安定化を受けていない国情と関係しているとされる'
    ]

  },



  /* ==========================================================================
     ヒューバート
     ========================================================================== */

  hubert: {

    name: 'ヒューバート',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Cfb（西岸海洋性気候）',
    stability: '非常に安定',
    climateStability: '安定化している',
    fourSeasons: '四季は穏やかで寒暖差が小さい',
    averageTemperature: '10.8℃',
    annualRainfall: '750mm程度',

    /* 地理 */
    geography:
      'なだらかな丘陵と都市化された平野が広がる。自然地形の多くが都市開発によって整えられている。',

    terrain: [
      '丘陵',
      '平野',
      '都市化地域',
      '河川'
    ],

    coastline:
      '限定的な海岸線を持つ内陸寄りの国土',

    /* 自然環境 */
    environment:
      '都市化が進み自然そのものは少ないが、管理された緑地や公園が計画的に配置されている。',

    vegetation:
      '管理された落葉樹林、都市緑地',

    /* 気候要因 */
    climateFactors: [
      '偏西風',
      '海洋性気候の影響',
      '都市化によるヒートアイランド',
      'フーモラによる安定化'
    ],

    /* 自然災害 */
    naturalHazards: [
      '穏やかな気候のため災害は少ない',
      'まれな強風',
      '局地的な豪雨'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 1.5,  rain: 55 },
      { month: 2,  temp: 2.5,  rain: 45 },
      { month: 3,  temp: 6.0,  rain: 50 },
      { month: 4,  temp: 10.0, rain: 45 },
      { month: 5,  temp: 14.0, rain: 65 },
      { month: 6,  temp: 17.5, rain: 70 },
      { month: 7,  temp: 19.5, rain: 75 },
      { month: 8,  temp: 19.0, rain: 65 },
      { month: 9,  temp: 15.0, rain: 55 },
      { month: 10, temp: 10.0, rain: 55 },
      { month: 11, temp: 5.5,  rain: 60 },
      { month: 12, temp: 2.5,  rain: 60 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '年間を通じて寒暖差が小さく、極端な気象がほとんど発生しない',
      '都市化が進んでいるため、気候そのものよりも都市環境の管理が重視されている',
      'フーモラによる安定化が最も効果的に機能している国の一つとされる'
    ]

  },



  /* ==========================================================================
     オルガロン
     ========================================================================== */

  orgaron: {

    name: 'オルガロン',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Csa寄り（地中海性気候の要素を含む温暖な温帯）',
    stability: '安定',
    climateStability: '安定化している',
    fourSeasons: '温暖で過ごしやすい四季',
    averageTemperature: '15.8℃',
    annualRainfall: '650mm程度',

    /* 地理 */
    geography:
      '起伏のある丘陵地帯と歴史ある都市が点在し、南部には温暖な沿岸地域が広がる。',

    terrain: [
      '丘陵',
      '沿岸平野',
      '山地',
      '都市'
    ],

    coastline:
      '南部・西部に温暖な海岸線を持つ',

    /* 自然環境 */
    environment:
      '乾燥に強い硬葉樹や低木が見られる植物相と、都市部に隣接する自然公園が共存している。',

    vegetation:
      '硬葉樹林、乾燥に強い低木林',

    /* 気候要因 */
    climateFactors: [
      '地中海性の乾いた夏',
      '温暖な海流',
      '芸術都市による景観保全',
      'フーモラによる安定化'
    ],

    /* 自然災害 */
    naturalHazards: [
      '夏季の乾燥',
      'まれな熱波',
      '局地的な強風'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 8.0,  rain: 65 },
      { month: 2,  temp: 9.0,  rain: 60 },
      { month: 3,  temp: 12.0, rain: 55 },
      { month: 4,  temp: 15.0, rain: 50 },
      { month: 5,  temp: 19.0, rain: 45 },
      { month: 6,  temp: 23.0, rain: 25 },
      { month: 7,  temp: 26.0, rain: 15 },
      { month: 8,  temp: 26.0, rain: 20 },
      { month: 9,  temp: 22.0, rain: 40 },
      { month: 10, temp: 17.0, rain: 70 },
      { month: 11, temp: 12.0, rain: 80 },
      { month: 12, temp: 9.0,  rain: 70 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '夏は乾燥して温暖、冬は湿潤で穏やかという地中海性の性質が残っている',
      '芸術都市としての景観保全のため、緑地や自然環境が意図的に維持されている',
      'フーモラによる安定化で熱波や強風などの極端な気象は抑えられている'
    ]

  },



  /* ==========================================================================
     キューマ
     ========================================================================== */

  kyuma: {

    name: 'キューマ',

    /* 基本気候 */
    climateZone: '乾燥帯',
    climateType: 'ケッペン気候分類 BWh／BSh（砂漠気候・ステップ気候）',
    stability: '安定',
    climateStability: '安定化している（極端な酷暑は抑制）',
    fourSeasons: '昼夜・季節の寒暖差が大きい',
    averageTemperature: '21.5℃',
    annualRainfall: '150mm程度',

    /* 地理 */
    geography:
      '広大な乾燥地帯と岩石砂漠が広がり、古代文明の遺構が点在する。',

    terrain: [
      '砂漠',
      '岩石地帯',
      'オアシス',
      '高原'
    ],

    coastline:
      '限られた海岸線を持つ',

    /* 自然環境 */
    environment:
      '乾燥に適応した植生がまばらに分布し、オアシス周辺にのみ豊かな緑が見られる。',

    vegetation:
      '乾燥地特有の低木、オアシス植生',

    /* 気候要因 */
    climateFactors: [
      '内陸の乾燥した気団',
      '強い日射',
      '昼夜の寒暖差',
      'フーモラによる酷暑抑制'
    ],

    /* 自然災害 */
    naturalHazards: [
      '砂嵐',
      '乾燥',
      '夜間の急激な冷え込み'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 8.0,  rain: 20 },
      { month: 2,  temp: 11.0, rain: 18 },
      { month: 3,  temp: 16.0, rain: 15 },
      { month: 4,  temp: 22.0, rain: 10 },
      { month: 5,  temp: 28.0, rain: 5  },
      { month: 6,  temp: 33.0, rain: 2  },
      { month: 7,  temp: 36.0, rain: 1  },
      { month: 8,  temp: 35.0, rain: 1  },
      { month: 9,  temp: 30.0, rain: 3  },
      { month: 10, temp: 23.0, rain: 8  },
      { month: 11, temp: 15.0, rain: 15 },
      { month: 12, temp: 9.0,  rain: 22 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '本来は極端な酷暑となる砂漠気候だが、フーモラの安定化により最高気温は抑えられている',
      '昼夜の寒暖差が大きく、夜間は急激に冷え込む',
      '降水量は非常に少なく、オアシス周辺以外では乾燥した景観が広がる',
      '古代文明の遺構が乾燥した気候によって良好な状態で保存されている'
    ]

  },



  /* ==========================================================================
     サンルド
     ========================================================================== */

  sanrudo: {

    name: 'サンルド',

    /* 基本気候 */
    climateZone: '乾燥帯',
    climateType: 'ケッペン気候分類 BSh／BWh（ステップ・砂漠気候、地域差が大きい）',
    stability: '安定',
    climateStability: '安定化している',
    fourSeasons: '地域による気候差が大きい',
    averageTemperature: '19.5℃',
    annualRainfall: '350mm程度',

    /* 地理 */
    geography:
      '広大な乾燥した内陸部と、金融都市が発展した沿岸部が対照的な景観を見せる。',

    terrain: [
      '内陸乾燥地帯',
      '沿岸平野',
      '丘陵'
    ],

    coastline:
      '長い海岸線を持ち、沿岸部に都市が集中する',

    /* 自然環境 */
    environment:
      '内陸部は乾燥した低木地帯、沿岸部は比較的湿潤で都市緑地が整備されている。',

    vegetation:
      '乾燥低木林（内陸）、都市緑地（沿岸）',

    /* 気候要因 */
    climateFactors: [
      '大陸内部の乾燥',
      '沿岸部の海洋性の緩和効果',
      '地域差の大きい降水パターン'
    ],

    /* 自然災害 */
    naturalHazards: [
      '内陸部の乾燥',
      '沿岸部のまれな暴風'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 24.0, rain: 35 },
      { month: 2,  temp: 24.0, rain: 30 },
      { month: 3,  temp: 22.0, rain: 28 },
      { month: 4,  temp: 18.0, rain: 25 },
      { month: 5,  temp: 14.0, rain: 30 },
      { month: 6,  temp: 11.0, rain: 35 },
      { month: 7,  temp: 10.0, rain: 32 },
      { month: 8,  temp: 12.0, rain: 28 },
      { month: 9,  temp: 15.0, rain: 25 },
      { month: 10, temp: 18.0, rain: 28 },
      { month: 11, temp: 21.0, rain: 30 },
      { month: 12, temp: 23.0, rain: 32 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '内陸と沿岸で気候が大きく異なり、国全体として一様な気候ではない',
      '金融都市が集中する沿岸部は比較的穏やかで過ごしやすい',
      '内陸部は乾燥した土地が広がり、資源開発などに利用されている',
      '象徴とされる黄金や白金の輝きは、乾燥した強い日射とも関係が深いとされる'
    ]

  },



  /* ==========================================================================
     ベルネア
     ========================================================================== */

  belnea: {

    name: 'ベルネア',

    /* 基本気候 */
    climateZone: '乾燥帯（本来）／国土内部は環境ドームによる多環境',
    climateType: 'ケッペン気候分類 BWh（本来は砂漠気候）。国土は巨大環境ドームにより人工制御されている',
    stability: '完全に管理・安定',
    climateStability: '環境ドームによる完全管理',
    fourSeasons: 'ドーム内の区画ごとに異なる環境が再現されている',
    averageTemperature: '28.5℃（ドーム外郭基準）',
    annualRainfall: '80mm程度（ドーム外郭基準）',

    /* 地理 */
    geography:
      '国土全体が巨大な環境ドームに覆われ、内部には熱帯・寒冷・砂漠・海洋など複数の環境区画が人工的に再現されている。',

    terrain: [
      '砂漠（ドーム外郭）',
      'ドーム内複合環境',
      '人工水域',
      '人工森林'
    ],

    coastline:
      'ドーム外郭は本来の乾燥した海岸線を持つ',

    /* 自然環境 */
    environment:
      'ドーム内部では生物研究のため多様な環境が意図的に再現され、それぞれの区画で固有の生態系が維持されている。',

    vegetation:
      '区画ごとに異なる（熱帯林・寒冷地植生・砂漠植生など人工的に管理）',

    /* 気候要因 */
    climateFactors: [
      '巨大環境ドームによる完全な気候制御',
      '本来の砂漠気候',
      '生物研究目的の多環境再現'
    ],

    /* 自然災害 */
    naturalHazards: [
      'ドーム外郭部の砂嵐',
      'ドーム内は制御下のため災害はまれ'
    ],

    /* 月別気候（ドーム外郭基準） */
    months: [
      { month: 1,  temp: 16.0, rain: 8 },
      { month: 2,  temp: 18.0, rain: 6 },
      { month: 3,  temp: 22.0, rain: 5 },
      { month: 4,  temp: 27.0, rain: 3 },
      { month: 5,  temp: 32.0, rain: 1 },
      { month: 6,  temp: 35.0, rain: 0 },
      { month: 7,  temp: 37.0, rain: 0 },
      { month: 8,  temp: 36.0, rain: 0 },
      { month: 9,  temp: 32.0, rain: 1 },
      { month: 10, temp: 27.0, rain: 3 },
      { month: 11, temp: 21.0, rain: 6 },
      { month: 12, temp: 17.0, rain: 9 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '国土そのものが巨大な環境ドームであるため、外部の気候と内部の環境は大きく異なる',
      'ドーム内部には熱帯・寒冷・砂漠・海洋など複数の環境が人工的に再現され、生物研究に活用されている',
      'ドーム外郭部は本来の乾燥した砂漠気候が残っている',
      '「生命を知り、共に生きる」というスローガンの通り、多様な環境を管理・観察することが国是となっている'
    ]

  },



  /* ==========================================================================
     ヲンヘード
     ========================================================================== */

  wonhead: {

    name: 'ヲンヘード',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Dfa〜Cfa（国土が広く、北部から南部まで気候差が大きい）',
    stability: '地域差はあるが全体としては安定',
    climateStability: '安定化している',
    fourSeasons: '北部は寒暖差が大きく、南部は温暖',
    averageTemperature: '11.2℃',
    annualRainfall: '950mm程度',

    /* 地理 */
    geography:
      '広大な国土に平野・山脈・湖沼地帯が広がり、南北で気候帯が大きく異なる。',

    terrain: [
      '平野',
      '山脈',
      '湖沼',
      '森林'
    ],

    coastline:
      '東西に長い海岸線を持つ',

    /* 自然環境 */
    environment:
      '北部は針葉樹林、南部は落葉広葉樹林が広がり、農業や食文化を支える豊かな土壌が特徴。',

    vegetation:
      '針葉樹林（北部）、落葉広葉樹林（南部）',

    /* 気候要因 */
    climateFactors: [
      '大陸規模の気団移動',
      '大規模な湖沼群による緩和効果',
      '南北の気候差',
      'フーモラによる安定化'
    ],

    /* 自然災害 */
    naturalHazards: [
      '北部の寒波',
      '内陸部の激しい気象現象',
      '局地的な豪雪'
    ],

    /* 月別気候（国全体の平均） */
    months: [
      { month: 1,  temp: -3.0, rain: 55 },
      { month: 2,  temp: -1.0, rain: 50 },
      { month: 3,  temp: 4.0,  rain: 65 },
      { month: 4,  temp: 11.0, rain: 75 },
      { month: 5,  temp: 17.0, rain: 90 },
      { month: 6,  temp: 22.0, rain: 95 },
      { month: 7,  temp: 25.0, rain: 85 },
      { month: 8,  temp: 24.0, rain: 80 },
      { month: 9,  temp: 19.0, rain: 75 },
      { month: 10, temp: 12.0, rain: 65 },
      { month: 11, temp: 5.0,  rain: 60 },
      { month: 12, temp: -1.0, rain: 55 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '国土が広いため南北で気候差が大きく、一つの気候帯では語れない多様性を持つ',
      '豊かな土壌と適度な降水量が、食文化国家としての農業基盤を支えている',
      '湖沼群が気候を緩和し、極端な乾燥や高温を防いでいる',
      'フーモラによる安定化で局地的な豪雪や激しい気象は抑制されている'
    ]

  },



  /* ==========================================================================
     マイモック
     ========================================================================== */

  maimok: {

    name: 'マイモック',

    /* 基本気候 */
    climateZone: '冷帯',
    climateType: 'ケッペン気候分類 Dfc／ET（亜寒帯〜寒帯移行。環境変質の影響を受けた特殊地域）',
    stability: '不安定（未安定化・環境変質あり）',
    climateStability: '安定化されていない',
    fourSeasons: '冬が支配的で、夏はごく短い',
    averageTemperature: '-6.5℃',
    annualRainfall: '400mm程度（霧を含む湿潤現象が多い）',

    /* 地理 */
    geography:
      '針葉樹林と凍土地帯が広がるが、998年の霧害以降は国土の一部が特殊な霧域として残存している。',

    terrain: [
      '凍土',
      '針葉樹林',
      '霧域',
      '岩石地帯'
    ],

    coastline:
      '北部に凍結しやすい海岸線を持つ',

    /* 自然環境 */
    environment:
      '本来の寒冷な生態系に加え、霧域周辺では環境変質の影響を受けた特異な植生・生態が観測されている。',

    vegetation:
      '針葉樹林。霧域周辺は変質した特異な植生',

    /* 気候要因 */
    climateFactors: [
      '気候安定化技術の不適用',
      '998年の霧害による環境変質',
      '極端な放射冷却',
      '霧域特有の湿度異常'
    ],

    /* 自然災害 */
    naturalHazards: [
      '極寒',
      '濃霧（霧域由来）',
      '視界不良による事故',
      '環境変質の継続的影響'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: -25.0, rain: 25 },
      { month: 2,  temp: -22.0, rain: 20 },
      { month: 3,  temp: -13.0, rain: 25 },
      { month: 4,  temp: -3.0,  rain: 30 },
      { month: 5,  temp: 5.0,   rain: 35 },
      { month: 6,  temp: 11.0,  rain: 40 },
      { month: 7,  temp: 14.0,  rain: 45 },
      { month: 8,  temp: 12.0,  rain: 45 },
      { month: 9,  temp: 5.0,   rain: 40 },
      { month: 10, temp: -4.0,  rain: 35 },
      { month: 11, temp: -14.0, rain: 30 },
      { month: 12, temp: -21.0, rain: 28 }
    ],

    /* 気候の特徴 */
    characteristics: [
      'フーモラによる気候安定化を受けていないだけでなく、998年の霧害以降は環境変質の影響も残る特殊な国土となっている',
      '冬季は極寒で、霧域周辺では視界不良による事故が今も報告されている',
      '国家としての体制は1005年に崩壊しており、現在は「今も残る災害」に近い扱いを受けている地域として存在する',
      '1750年頃には霧域周辺にも一定の社会が定着し、現在まで交易などの活動が細々と続いている'
    ]

  },



  /* ==========================================================================
     チリルド・アイルツア
     ========================================================================== */

  'chiriludo-ailtsua': {

    name: 'チリルド・アイルツア',

    /* 基本気候 */
    climateZone: '寒帯',
    climateType: 'ケッペン気候分類 EF／ET（氷雪気候・ツンドラ気候）',
    stability: '寒さは維持されるが安定',
    climateStability: '安定化している（寒冷環境そのものは維持されている）',
    fourSeasons: '一年の大半が氷雪に覆われる',
    averageTemperature: '-12.5℃',
    annualRainfall: '250mm程度（大半が降雪）',

    /* 地理 */
    geography:
      '国土の大部分が氷床に覆われ、沿岸部にわずかな居住可能地域が存在する。',

    terrain: [
      '氷床',
      '氷河',
      '沿岸岩石地帯',
      'フィヨルド'
    ],

    coastline:
      '複雑に入り組んだフィヨルド海岸線を持つ',

    /* 自然環境 */
    environment:
      '氷雪に覆われた極地環境が広がり、沿岸部にわずかな寒冷地植生と生態系が存在する。',

    vegetation:
      '地衣類・コケ類を中心とした寒冷地植生',

    /* 気候要因 */
    climateFactors: [
      '氷床による強い放射冷却',
      '極地特有の日照変化',
      'フーモラによる寒冷環境の維持管理'
    ],

    /* 自然災害 */
    naturalHazards: [
      '猛吹雪',
      '氷床の崩落',
      '極端な低温'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: -18.0, rain: 30 },
      { month: 2,  temp: -19.0, rain: 28 },
      { month: 3,  temp: -15.0, rain: 25 },
      { month: 4,  temp: -8.0,  rain: 20 },
      { month: 5,  temp: -1.0,  rain: 18 },
      { month: 6,  temp: 4.0,   rain: 15 },
      { month: 7,  temp: 7.0,   rain: 20 },
      { month: 8,  temp: 6.0,   rain: 25 },
      { month: 9,  temp: 1.0,   rain: 28 },
      { month: 10, temp: -6.0,  rain: 32 },
      { month: 11, temp: -12.0, rain: 30 },
      { month: 12, temp: -16.0, rain: 28 }
    ],

    /* 気候の特徴 */
    characteristics: [
      'フーモラによる管理下にあるが、他の安定化国とは異なり寒さそのものは意図的に維持されている',
      '一年の大半が氷雪に覆われ、居住可能な地域は沿岸部にごくわずかしかない',
      'フィヨルド状の複雑な海岸線が特徴で、氷河が海に流れ込む景観が見られる',
      '極地特有の白夜・極夜に近い日照変化が生活サイクルに影響を与えている'
    ]

  },



  /* ==========================================================================
     タスメニオ
     ========================================================================== */

  tasumenio: {

    name: 'タスメニオ',

    /* 基本気候 */
    climateZone: '海洋性気候',
    climateType: 'ケッペン気候分類 Cfb寄り（海洋の影響を強く受けた温暖湿潤気候）',
    stability: '非常に安定',
    climateStability: '安定化している',
    fourSeasons: '年間を通して寒暖差が小さく穏やか',
    averageTemperature: '21.5℃',
    annualRainfall: '1,800mm程度',

    /* 地理 */
    geography:
      '太平洋中央部に点在する島々と、その周囲に広がる豊かな海域から構成される。',

    terrain: [
      '島嶼',
      'サンゴ礁',
      '海洋',
      '火山性地形'
    ],

    coastline:
      '島々を取り囲む広大な海岸線を持つ',

    /* 自然環境 */
    environment:
      '海洋の影響を強く受けた温暖な環境で、サンゴ礁や豊かな海洋生態系が広がる。',

    vegetation:
      '亜熱帯性の島嶼植生、マングローブ',

    /* 気候要因 */
    climateFactors: [
      '海洋の緩和作用',
      '貿易風',
      '暖流の影響',
      'フーモラによる安定化'
    ],

    /* 自然災害 */
    naturalHazards: [
      '熱帯低気圧',
      '高潮',
      'まれな地殻活動'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 20.0, rain: 160 },
      { month: 2,  temp: 20.5, rain: 150 },
      { month: 3,  temp: 21.0, rain: 155 },
      { month: 4,  temp: 21.5, rain: 145 },
      { month: 5,  temp: 22.0, rain: 140 },
      { month: 6,  temp: 22.5, rain: 130 },
      { month: 7,  temp: 23.0, rain: 125 },
      { month: 8,  temp: 23.0, rain: 135 },
      { month: 9,  temp: 22.5, rain: 145 },
      { month: 10, temp: 22.0, rain: 155 },
      { month: 11, temp: 21.0, rain: 165 },
      { month: 12, temp: 20.5, rain: 170 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '海洋の影響により年間を通して気温の変動が非常に小さい',
      '降水量は多いが、年間を通してほぼ均等に分布している',
      'サンゴ礁を中心とした豊かな海洋生態系が国の重要な資源となっている',
      'フーモラによる安定化で熱帯低気圧の被害は最小限に抑えられている'
    ]

  },



  /* ==========================================================================
     フーモラ・スカイピル
     ========================================================================== */

  'fumora-skypill': {

    name: 'フーモラ・スカイピル',

    /* 基本気候 */
    climateZone: '高高度寒冷気候',
    climateType: '人工制御環境（地上の気候区分は適用されない）',
    stability: '完全に人工管理',
    climateStability: '独自の環境制御下にある',
    fourSeasons: '季節の概念は人工的に設計されている',
    averageTemperature: '18.0℃（内部制御温度）',
    annualRainfall: '該当なし（人工的な水循環管理）',

    /* 地理 */
    geography:
      '成層圏に浮遊する巨大な人工構造体であり、地表とは切り離された独自の環境が形成されている。',

    terrain: [
      '人工構造体',
      '内部区画',
      '展望区画'
    ],

    coastline:
      '該当なし',

    /* 自然環境 */
    environment:
      '気象そのものが技術によって完全に制御されており、地表の自然環境とは根本的に異なる。',

    vegetation:
      '人工的に管理された内部緑地',

    /* 気候要因 */
    climateFactors: [
      '高高度特有の低圧・低温環境',
      '完全な人工気候制御',
      '地表の気象から独立した環境'
    ],

    /* 自然災害 */
    naturalHazards: [
      '自然災害はほぼ皆無',
      '制御系統の障害による環境変動のリスク'
    ],

    /* 月別気候（内部制御値。参考として掲載） */
    months: [
      { month: 1,  temp: 17.0, rain: 10 },
      { month: 2,  temp: 17.0, rain: 10 },
      { month: 3,  temp: 17.5, rain: 10 },
      { month: 4,  temp: 18.0, rain: 10 },
      { month: 5,  temp: 18.5, rain: 10 },
      { month: 6,  temp: 19.0, rain: 10 },
      { month: 7,  temp: 19.0, rain: 10 },
      { month: 8,  temp: 19.0, rain: 10 },
      { month: 9,  temp: 18.5, rain: 10 },
      { month: 10, temp: 18.0, rain: 10 },
      { month: 11, temp: 17.5, rain: 10 },
      { month: 12, temp: 17.0, rain: 10 }
    ],

    /* 気候の特徴 */
    characteristics: [
      '地表の気候区分がそもそも適用されない、成層圏に位置する特殊な人工環境である',
      '気温・降水ともに技術によって完全に制御され、年間を通してほぼ一定に保たれている',
      '高高度技術・気象管理技術の中心地としての役割を持つ'
    ]

  },



  /* ==========================================================================
     セルトシティ
     ========================================================================== */

  sertcity: {

    name: 'セルトシティ',

    /* 基本気候 */
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Cfa（ニポランと同系統だが、より安定化された都市気候）',
    stability: '極めて安定',
    climateStability: 'ニポランよりさらに安定化されている',
    fourSeasons: '四季は保たれるが、寒暖差・降水変動はニポランより小さい',
    averageTemperature: '16.0℃',
    annualRainfall: '1,400mm程度',

    /* 地理 */
    geography:
      'ニポラン周辺に位置する高度に都市化された地域で、計画的に整備された都市構造を持つ。',

    terrain: [
      '都市化平野',
      '人工緑地',
      '河川'
    ],

    coastline:
      'ニポランと同様の沿岸環境を一部共有する',

    /* 自然環境 */
    environment:
      '高度な都市計画により、気象変動の影響を受けにくい構造が整えられている。',

    vegetation:
      '計画的に配置された都市緑地',

    /* 気候要因 */
    climateFactors: [
      'ニポランに準じた季節風・梅雨の影響',
      '都市構造による気象緩和',
      'フーモラによる高度な安定化'
    ],

    /* 自然災害 */
    naturalHazards: [
      'ニポランより小規模な台風・豪雨の影響',
      '災害リスクは全体的に低い'
    ],

    /* 月別気候 */
    months: [
      { month: 1,  temp: 6.5,  rain: 42 },
      { month: 2,  temp: 7.3,  rain: 50 },
      { month: 3,  temp: 11.2, rain: 90 },
      { month: 4,  temp: 16.5, rain: 105 },
      { month: 5,  temp: 21.5, rain: 130 },
      { month: 6,  temp: 24.5, rain: 160 },
      { month: 7,  temp: 27.5, rain: 140 },
      { month: 8,  temp: 28.5, rain: 125 },
      { month: 9,  temp: 25.0, rain: 100 },
      { month: 10, temp: 19.0, rain: 80 },
      { month: 11, temp: 13.5, rain: 70 },
      { month: 12, temp: 8.2,  rain: 45 }
    ],

    /* 気候の特徴 */
    characteristics: [
      'ニポランと同系統の気候だが、都市構造とフーモラの高度な管理によりさらに安定化されている',
      '台風や豪雨の影響もニポランより小さく抑えられている',
      '高度に計画された都市緑地が、気候の緩和と景観の両方に貢献している'
    ]

  }


};


/* ============================================================================
   共通パーツ
   ============================================================================ */


/**
 * 配列をHTMLリストへ変換
 */
function renderClimateList(items){

  if(!Array.isArray(items) || !items.length){
    return '';
  }

  return items
    .map(item => `<li>${item}</li>`)
    .join('');

}


/**
 * 基本情報
 */
function renderClimateInfo(label, value){

  if(!value){
    return '';
  }

  return `
    <div class="climate-info">

      <span>${label}</span>

      <strong>${value}</strong>

    </div>
  `;

};







/* ============================================================================
   雨温図
   ============================================================================ */

function renderClimateChart(countryId){

  const climate = CLIMATE_DATA[countryId];

  if(
    !climate ||
    !Array.isArray(climate.months) ||
    climate.months.length !== 12
  ){
    return '';
  }

  const width = 760;
  const height = 330;

  const left = 70;
  const right = 690;
  const top = 25;
  const bottom = 265;

  const chartWidth = right - left;
  const chartHeight = bottom - top;

  const minTemp = -20;
  const maxTemp = 40;
  const maxRain = 300;

  const monthWidth = chartWidth / 12;


  /* --------------------------------------------------------------------------
     SVG
     -------------------------------------------------------------------------- */

  let svg = `
    <svg
      class="climate-chart-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="${climate.name}の雨温図"
    >
  `;


  /* --------------------------------------------------------------------------
     横グリッド・気温目盛り
     -------------------------------------------------------------------------- */

  for(let temp = minTemp; temp <= maxTemp; temp += 10){

    const y =
      bottom -
      ((temp - minTemp) / (maxTemp - minTemp)) *
      chartHeight;

    svg += `
      <line
        x1="${left}"
        y1="${y}"
        x2="${right}"
        y2="${y}"
        class="climate-grid-line"
      />

      <text
        x="${left - 10}"
        y="${y + 3}"
        class="climate-scale"
        text-anchor="end"
      >
        ${temp}
      </text>
    `;

  }


  /* --------------------------------------------------------------------------
     降水量目盛り
     -------------------------------------------------------------------------- */

  for(let rain = 0; rain <= maxRain; rain += 50){

    const y =
      bottom -
      (rain / maxRain) *
      chartHeight;

    svg += `
      <text
        x="${right + 10}"
        y="${y + 3}"
        class="climate-scale"
      >
        ${rain}
      </text>
    `;

  }


  /* --------------------------------------------------------------------------
     軸
     -------------------------------------------------------------------------- */

  svg += `
    <line
      x1="${left}"
      y1="${top}"
      x2="${left}"
      y2="${bottom}"
      class="climate-axis"
    />

    <line
      x1="${left}"
      y1="${bottom}"
      x2="${right}"
      y2="${bottom}"
      class="climate-axis"
    />

    <line
      x1="${right}"
      y1="${top}"
      x2="${right}"
      y2="${bottom}"
      class="climate-axis"
    />

    <text
      x="22"
      y="${top + chartHeight / 2}"
      class="climate-axis-label"
      text-anchor="middle"
      transform="
        rotate(-90 22 ${top + chartHeight / 2})
      "
    >
      気温（℃）
    </text>

    <text
      x="${right + 45}"
      y="${top + chartHeight / 2}"
      class="climate-axis-label"
      text-anchor="middle"
      transform="
        rotate(90 ${right + 45} ${top + chartHeight / 2})
      "
    >
      降水量（mm）
    </text>
  `;


  /* --------------------------------------------------------------------------
     降水量
     -------------------------------------------------------------------------- */

  climate.months.forEach(month => {

    const x =
      left +
      (month.month - 1) * monthWidth +
      monthWidth * .18;

    const barWidth = monthWidth * .64;

    const barHeight =
      Math.min(month.rain, maxRain) /
      maxRain *
      chartHeight;

    const y = bottom - barHeight;

    svg += `
      <rect
        x="${x}"
        y="${y}"
        width="${barWidth}"
        height="${barHeight}"
        class="climate-rain"
        rx="2"
      >
        <title>
          ${month.month}月：降水量 ${month.rain}mm
        </title>
      </rect>
    `;

  });


  /* --------------------------------------------------------------------------
     気温線
     -------------------------------------------------------------------------- */

  const points = climate.months
    .map(month => {

      const x =
        left +
        (month.month - 1) * monthWidth +
        monthWidth / 2;

      const y =
        bottom -
        ((month.temp - minTemp) / (maxTemp - minTemp)) *
        chartHeight;

      return `${x},${y}`;

    })
    .join(' ');


  svg += `
    <polyline
      points="${points}"
      class="climate-temp"
    />
  `;


  /* --------------------------------------------------------------------------
     気温ポイント
     -------------------------------------------------------------------------- */

  climate.months.forEach(month => {

    const x =
      left +
      (month.month - 1) * monthWidth +
      monthWidth / 2;

    const y =
      bottom -
      ((month.temp - minTemp) / (maxTemp - minTemp)) *
      chartHeight;

    svg += `
      <circle
        cx="${x}"
        cy="${y}"
        r="3"
        class="climate-temp-point"
      >
        <title>
          ${month.month}月：平均気温 ${month.temp}℃
        </title>
      </circle>
    `;

  });


  /* --------------------------------------------------------------------------
     月
     -------------------------------------------------------------------------- */

  climate.months.forEach(month => {

    const x =
      left +
      (month.month - 1) * monthWidth +
      monthWidth / 2;

    svg += `
      <text
        x="${x}"
        y="${bottom + 23}"
        class="climate-month"
        text-anchor="middle"
      >
        ${month.month}月
      </text>
    `;

  });


  svg += `
    </svg>
  `;

  return svg;

}


/* ============================================================================
   気候カード
   ============================================================================ */

function renderClimateCard(countryId){

  const climate = CLIMATE_DATA[countryId];

  if(!climate){
    return '';
  }


  return `

    <section class="climate-card">


      <!-- ヘッダー -->

      <header class="climate-card-header">

        <span class="climate-card-label">
          CLIMATE
        </span>

        <h2>
          ${climate.name} ― 気候・環境
        </h2>

      </header>


      <!-- ====================================================================
           上段
           ==================================================================== -->

      <div class="climate-layout">


        <!-- 気候概要 -->

        <article class="climate-panel climate-profile">

          <header class="climate-panel-header">

            <span>
              CLIMATE PROFILE
            </span>

            <h3>
              気候概要
            </h3>

          </header>


          <div class="climate-info-grid">

            ${renderClimateInfo('気候帯', climate.climateZone)}
            ${renderClimateInfo('気候区分', climate.climateType)}
            ${renderClimateInfo('安定性', climate.stability)}
            ${renderClimateInfo('気候安定化', climate.climateStability)}
            ${renderClimateInfo('四季', climate.fourSeasons)}
            ${renderClimateInfo('年平均気温', climate.averageTemperature)}
            ${renderClimateInfo('年間降水量', climate.annualRainfall)}

          </div>

        </article>


        <!-- 地理 -->

        <article class="climate-panel climate-geography">

          <header class="climate-panel-header">

            <span>
              GEOGRAPHY
            </span>

            <h3>
              地理
            </h3>

          </header>


          <p>
            ${climate.geography}
          </p>


          <div class="climate-meta">

            <span>主な地形</span>

            <ul>
              ${renderClimateList(climate.terrain)}
            </ul>

          </div>


          <div class="climate-meta">

            <span>海岸線</span>

            <p>
              ${climate.coastline}
            </p>

          </div>

        </article>


        <!-- 雨温図 -->

        <article class="climate-panel climate-chart-panel">

          <header class="climate-panel-header">

            <span>
              ANNUAL CLIMATE
            </span>

            <h3>
              雨温図
            </h3>

          </header>

          ${renderClimateChart(countryId)}

        </article>


        <!-- 自然環境 -->

        <article class="climate-panel climate-environment">

          <header class="climate-panel-header">

            <span>
              ENVIRONMENT
            </span>

            <h3>
              自然環境
            </h3>

          </header>


          <p>
            ${climate.environment}
          </p>


          <div class="climate-meta">

            <span>植生</span>

            <strong>
              ${climate.vegetation}
            </strong>

          </div>

        </article>


        <!-- 気候要因 -->

        <article class="climate-panel climate-factors">

          <header class="climate-panel-header">

            <span>
              CLIMATE FACTORS
            </span>

            <h3>
              気候要因
            </h3>

          </header>

          <ul class="climate-tag-list">
            ${renderClimateList(climate.climateFactors)}
          </ul>

        </article>


        <!-- 自然災害 -->

        <article class="climate-panel climate-hazards">

          <header class="climate-panel-header">

            <span>
              NATURAL HAZARDS
            </span>

            <h3>
              自然災害・気象現象
            </h3>

          </header>

          <ul class="climate-tag-list">
            ${renderClimateList(climate.naturalHazards)}
          </ul>

        </article>


      </div>


      <!-- ====================================================================
           特徴
           ==================================================================== -->

      <section class="climate-characteristics">

        <header class="climate-panel-header">

          <span>
            CHARACTERISTICS
          </span>

          <h3>
            気候の特徴
          </h3>

        </header>


        <ul class="climate-characteristics-list">

          ${renderClimateList(climate.characteristics)}

        </ul>

      </section>


    </section>

  `;

}