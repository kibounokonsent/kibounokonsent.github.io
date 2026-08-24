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

}


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