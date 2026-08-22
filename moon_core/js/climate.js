/* ============================================================================
   CLIMATE DATA — 各国家の気候・環境情報
   新しい国家の気候データはこのファイルに追加してください。
   ============================================================================ */

const CLIMATE_DATA = {

  niporan: {
    name: 'ニポラン',
    climateZone: '温帯',
    climateType: 'ケッペン気候分類 Cfa（温暖湿潤気候）',
    stability: '比較的安定',
    fourSeasons: '四季がはっきりしている',
    averageTemperature: '年平均気温 15.4℃',
    annualRainfall: '年間降水量 1,600mm程度',
    
    months: [
      {temp: 5.2, rain: 48},      // 1月
      {temp: 6.1, rain: 60},      // 2月
      {temp: 10.4, rain: 107},    // 3月
      {temp: 16.1, rain: 128},    // 4月
      {temp: 21.3, rain: 158},    // 5月
      {temp: 24.7, rain: 193},    // 6月
      {temp: 28.2, rain: 165},    // 7月
      {temp: 29.6, rain: 145},    // 8月
      {temp: 25.1, rain: 118},    // 9月
      {temp: 18.3, rain: 98},     // 10月
      {temp: 12.5, rain: 88},     // 11月
      {temp: 6.8, rain: 52}       // 12月
    ],

    characteristics: [
      '降水量は梅雨と台風の影響で夏から秋に多い',
      '冬は比較的乾燥しており、降雪はまれである',
      '関西変異災害以降、気候パターンにわずかな変化が観測されている'
    ]
  }

};

/* renderClimateCard — 気候情報カードのHTML生成 */
function renderClimateCard(id){

  const climate = CLIMATE_DATA[id];

  if(!climate){
    return '';
  }

  // 気温と降水量の棒グラフ、折れ線グラフを生成
  const rainBars = climate.months.map((m, i) => {
    const x = 60 + i * 60 + 20;
    const barHeight = (m.rain / 300) * 260;
    const y = 290 - barHeight;
    return `<rect x="${x}" y="${y}" width="20" height="${barHeight}" fill="#87CEEB" opacity="0.6"/>`;
  }).join('');

  const tempLine = (() => {
    const points = climate.months.map((m, i) => {
      const x = 60 + i * 60 + 30;
      const tempRange = 50;
      const minTemp = -10;
      const y = 290 - ((m.temp - minTemp) / tempRange) * 260;
      return `${x},${y}`;
    }).join(' ');
    return `<polyline points="${points}" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  })();

  const tempPoints = climate.months.map((m, i) => {
    const x = 60 + i * 60 + 30;
    const tempRange = 50;
    const minTemp = -10;
    const y = 290 - ((m.temp - minTemp) / tempRange) * 260;
    return `<circle cx="${x}" cy="${y}" r="3" fill="#f97316"/>`;
  }).join('');

  return `
    <section class="climate-card">

      <div class="climate-card-header">
        <span class="climate-card-label">
          CLIMATE
        </span>

        <h2>気候・環境</h2>
      </div>

      <div class="climate-info-grid">

        <div class="climate-info">
          <span>気候帯</span>
          <strong>${climate.climateZone}</strong>
        </div>

        <div class="climate-info">
          <span>気候区分</span>
          <strong>${climate.climateType}</strong>
        </div>

        <div class="climate-info">
          <span>気候の安定性</span>
          <strong>${climate.stability}</strong>
        </div>

        <div class="climate-info">
          <span>四季</span>
          <strong>${climate.fourSeasons}</strong>
        </div>

        <div class="climate-info">
          <span>平均気温</span>
          <strong>${climate.averageTemperature}</strong>
        </div>

        <div class="climate-info">
          <span>年間降水量</span>
          <strong>${climate.annualRainfall}</strong>
        </div>

      </div>

      <div class="climate-chart">

        <div class="climate-chart-title">
          雨温図
        </div>

        <svg
          class="climate-chart-svg"
          id="climate-chart-${id}"
          viewBox="0 0 760 360"
          role="img"
          aria-label="${climate.name}の雨温図">

          <!-- 背景グリッド -->
          <defs>
            <pattern id="grid-${id}" width="60" height="30" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
            </pattern>
          </defs>

          <rect x="60" y="30" width="640" height="260" fill="url(#grid-${id})"/>

          <!-- 軸ラベル -->
          <text x="15" y="200" font-size="12" text-anchor="end" fill="#666">気温(℃)</text>
          <text x="400" y="350" font-size="12" text-anchor="middle" fill="#666">月</text>
          <text x="730" y="200" font-size="12" text-anchor="start" fill="#666">降水量(mm)</text>

          <!-- 軸 -->
          <line x1="60" y1="30" x2="60" y2="290" stroke="#333" stroke-width="2"/>
          <line x1="60" y1="290" x2="700" y2="290" stroke="#333" stroke-width="2"/>
          <line x1="700" y1="30" x2="700" y2="290" stroke="#333" stroke-width="2"/>

          <!-- 月ラベル -->
          <g font-size="10" fill="#666" text-anchor="middle">
            <text x="60" y="300">1</text>
            <text x="120" y="300">2</text>
            <text x="180" y="300">3</text>
            <text x="240" y="300">4</text>
            <text x="300" y="300">5</text>
            <text x="360" y="300">6</text>
            <text x="420" y="300">7</text>
            <text x="480" y="300">8</text>
            <text x="540" y="300">9</text>
            <text x="600" y="300">10</text>
            <text x="660" y="300">11</text>
            <text x="720" y="300">12</text>
          </g>

          <!-- 降水量の棒グラフ -->
          ${rainBars}

          <!-- 気温の折れ線グラフ -->
          ${tempLine}

          <!-- データポイント -->
          ${tempPoints}

        </svg>

      </div>

      <div class="climate-characteristics">
        <h3>気候の特徴</h3>
        <ul>
          ${climate.characteristics.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

    </section>
  `;
}
