/* =========================================================
   ● 地上 ── 人の世
   章：world（世界の成り立ち）／contract（契約と代償）／org（組織・団体）／battle（武器と覚醒）
   書き方は articles-heaven.js の先頭を参照
   ========================================================= */
ARTICLES.push(
/* ---------- 世界の成り立ち ---------- */
{
  id: 'world-overview', cat: 'world',
  title: '魔天楼の世界', reading: 'De Mundo',
  updated: '2026-10-01',
  summary: '人を喰らう天使、天使を裏切った悪魔、そして悪魔と契約して戦う人間。三者は「魂の循環」でつながっている。',
  info: [['主な存在', '天使／悪魔／人間'], ['対立構造', '天使 対 人間＋悪魔'], ['戦う人間', '契約者（[[angel-hunter|エンジェルハンター]]）']],
  sections: [
    { h: '三つの存在', p: [
      '[[angel|天使]]は人を食らうことでしか生きられない化け物である。魔力に守られているため、魔力のない攻撃は銃を含めて通用しない。高い知能と社会性を持ち、人間社会に紛れ込んでいる個体も多い。',
      '[[demon|悪魔]]は天使を裏切って人間側に付いた堕天者たちである。人を食わずとも、人間と契約することで生きていける。',
      '人間は悪魔と[[contract|契約]]し、貸与された異能力で天使と戦う。代償は重く、契約は一生続く。'
    ]},
    { h: '塔の三つの領域', p: [
      'この世界は一本の塔として描かれる。昇るほど天界に近づき、天使の階級は上がる。潜るほど魔界に近づき、悪魔の階級は上がる。人の世は、その間の地上にある。詳しくは[[rank-system]]を参照。'
    ]},
    { h: '天使に対抗する手段', list: [
      '悪魔と契約し、魔力をともなう異能力で戦う',
      '[[shoshinden|小神殿（ダンジョン）]]の素材から作った[[anti-angel-weapon|対天使武器]]に魔力を乗せて戦う',
      '天使の心臓（コア）を破壊する'
    ]},
    { h: '世界を動かす組織', p: [
      '政府公認の[[anti-angel-association|対天使協会]]が天使討伐を担う一方、天使が作った[[messiah-church|メシア教会]]や[[raphael|ラファエル]]、天使との共存を掲げる[[kyoten-church|共天教会]]、天使も人も殺す[[lucifer|ルシファー]]などが入り乱れている。'
    ]}
  ],
  related: ['soul-cycle', 'rank-system', 'angel', 'demon', 'contract'],
  keywords: ['世界観', '概要']
},
{
  id: 'soul-cycle', cat: 'world',
  title: '魂の循環', reading: 'Circulus Animarum',
  updated: '2026-10-01',
  summary: '天使に殺された人の魂は天使になり、殺された天使の魂は解放されて人になる。',
  info: [['人 → 天使', '天使に殺されたとき'], ['天使 → 人', '天使が殺されたとき（魂の解放）']],
  sections: [
    { h: 'しくみ', list: [
      '人が天使に殺されると、その魂は天使になる',
      '天使が殺されると魂が解放され、人になる'
    ], p: [
      '天使を討つことは、天使に喰われた誰かの魂を人へ還すことでもある。'
    ]},
    { h: '悪魔の「人の姿」', p: [
      '階級の高い悪魔は人の形を会得するが、その姿は悪魔の前世の姿とされている（[[demon-ranks|悪魔の階級]]）。'
    ]}
  ],
  related: ['world-overview', 'angel', 'demon'],
  keywords: ['魂', 'サイクル', '転生', '前世']
},
{
  id: 'rank-system', cat: 'world',
  title: '塔と階級', reading: 'Ordo Graduum',
  updated: '2026-10-05',
  summary: '天使・悪魔ともに階級があり、上位ほど強力で知能が高い。天使の階級は塔の上へ、悪魔の階級は塔の下へ続いている。',
  info: [['天使の階級', '[[angel-ranks|化級〜神級]]'], ['悪魔の階級', '[[demon-ranks|霊級〜司級]]'], ['塔の上', '神への扉'], ['塔の下', '魔神への扉']],
  sections: [
    { h: '塔のかたち', p: [
      '魔天楼の塔は、地上を境に上と下へ伸びている。上へ昇る「昇塔」は天界へ、下へ潜る「降塔」は魔界へ続く。',
      '昇塔の各階は[[angel-ranks|天使の階級]]であり、頂には「神への扉」がある。降塔の各階は[[demon-ranks|悪魔の階級]]であり、底には「魔神への扉」がある。'
    ]},
    { h: '天使と悪魔の階級', table: { head: ['階級', '強さの目安', '天使', '悪魔'], rows: [
      ['神級', '世界崩壊レベル', '[[angel-ranks/kami|○]]（[[messiah|メシア]]）', '未確認'],
      ['司級', '国家災害級', '[[angel-ranks/tsukasa|○]]（16体／独自の階位）', '[[demon-ranks/tsukasa|○]]（9体）'],
      ['王級', '契約者複数ペア＋司級悪魔', '[[angel-ranks/ou|○]]', '[[demon-ranks/ou|○]]'],
      ['命級', '契約者ペアでは苦戦', '[[angel-ranks/mei|○]]', '[[demon-ranks/mei|○]]'],
      ['霊級', '契約者ペアと互角〜やや上', '[[angel-ranks/rei|○]]', '[[demon-ranks/rei|○]]（多くはこの等級）'],
      ['化級', '武装した人間数人と互角', '[[angel-ranks/ka|○]]', '—']
    ]}},
    { h: '階級の上がり方', list: [
      '天使は魔力量によって階級が異なる',
      '悪魔は契約者との絆が強まると進化・強化し、階級が上がることもある'
    ]}
  ],
  related: ['angel-ranks', 'demon-ranks', 'world-overview'],
  keywords: ['かいきゅう', '等級', 'ランク', '昇塔', '降塔', '塔']
},

/* ---------- 契約と代償 ---------- */
{
  id: 'contract', cat: 'contract',
  title: '悪魔契約', reading: 'Pactum',
  updated: '2026-10-05',
  summary: '悪魔は17～25歳の人間と契約し、共に天使を倒す。契約は一度きりで一生続き、成立すると心臓付近に紋章が現れる。',
  info: [
    ['契約できる年齢', '17～25歳'],
    ['回数', '一度きり（一生続く）'],
    ['代償', '契約時に不可逆の[[price|代償]]を一括で差し出す'],
    ['証', '心臓付近に[[contract/crest|紋章]]が出現']
  ],
  sections: [
    { h: '契約の原則', list: [
      '悪魔は17～25歳の人間と契約し、共に天使を倒す',
      '悪魔は契約者に異能力を貸与するが、代償が必要',
      '契約は一度きりで、一生続く',
      '契約時に不可逆の[[price|代償]]を一括で差し出す',
      '能力使用時にも[[price/side|副作用]]など継続的なリスクが存在する'
    ]},
    { key: 'crest', h: '契約の紋章', p: [
      '契約成立後、悪魔と契約者の双方の心臓付近に紋章が出現する。契約すると悪魔と契約者は深く繋がり、離れられなくなる。'
    ]},
    { h: '契約の場', p: [
      '[[academy|対天使アカデミー]]では、3年目に悪魔と契約する儀式を行う。'
    ]}
  ],
  related: ['price', 'seven-sins', 'magic-power', 'demon', 'academy'],
  keywords: ['けいやく', '契約者', '17歳', '儀式', '紋章', 'もんしょう', '印']
},
{
  id: 'price', cat: 'contract',
  title: '代償と副作用', reading: 'Pretium',
  updated: '2026-10-05',
  summary: '契約時に一括で支払う不可逆の代償と、能力を使うたびに生じる継続的なリスク（残響・副作用）。悪魔側にも負担がある。',
  info: [['契約時の代償', '不可逆・一括'], ['使用時のリスク', '一時的・乱用で悪化'], ['種類ごとの内容', '[[seven-sins|七つの種類]]']],
  sections: [
    { h: '三つの負担', table: { head: ['種別', 'タイミング', '性質'], rows: [
      ['契約時の代償', '契約時に一括', '不可逆。悪魔の[[seven-sins|種類]]ごとに決まっている'],
      ['継続的リスク（残響・副作用）', '能力使用時', '一時的な症状。乱用で悪化する'],
      ['悪魔側の負担', '契約中', '悪魔自身にも影響が出る']
    ]}, note: '種類ごとの代償・リスク・悪魔側の負担は[[seven-sins|七つの種類]]の一覧にまとめている。' },
    { key: 'side', h: '能力の副作用・制限', list: [
      '悪魔能力の使用には身体的・精神的負担が伴う',
      '契約時に定められた代償以外にも、能力使用時に新たなリスクが生じる',
      '代償や副作用には個人差があり、悪魔の種類や契約者の性格に影響される'
    ], warn: '過剰な能力の乱用は契約者の身体を蝕み、最悪の場合、命を落とすこともある。' }
  ],
  related: ['seven-sins', 'contract', 'demon-fusion', 'blessing'],
  keywords: ['だいしょう', '残響', '副作用', '不可逆', 'ふくさよう', '制限', '乱用']
},
{
  id: 'magic-power', cat: 'contract',
  title: '魔力', reading: 'Vis',
  updated: '2026-10-01',
  summary: '天使を守り、悪魔の力を動かすもの。強い感情や体液、代償によって供給される。',
  info: [['供給源', '強い感情／体液／代償']],
  sections: [
    { h: '供給', p: ['魔力は強い感情や体液、代償によって供給される。'] },
    { h: '天使と魔力', p: ['[[angel|天使]]は魔力で守られているため、魔力の無い攻撃は通らない。天使の[[angel-ranks|階級]]は魔力量によって異なる。'] },
    { h: '武器と魔力', p: ['[[anti-angel-weapon|対天使武器]]は魔力を乗せて使えば高い効果を発揮する。'] }
  ],
  related: ['angel', 'anti-angel-weapon', 'contract'],
  keywords: ['まりょく', '感情', '体液']
},

/* ---------- 組織・団体 ---------- */
{
  id: 'anti-angel-association', cat: 'org',
  title: '対天使協会', reading: 'Societas contra Angelos',
  updated: '2026-10-01',
  summary: '政府公認の天使討伐組織。契約者「エンジェルハンター」を中心に活動する。',
  info: [['種別', '政府公認組織'], ['本部', 'アメリカ'], ['支部', '世界各地'], ['構成', '[[angel-hunter|エンジェルハンター]]（契約者）中心']],
  sections: [
    { h: '概要', p: ['政府公認の天使討伐組織。契約者「[[angel-hunter|エンジェルハンター]]」を中心に活動し、天使の調査や討伐を担当する。世界各地に支部があり、アメリカに本部がある。'] },
    { h: '他組織との関係', list: ['[[messiah-church|メシア教会]]から敵視されている', '[[lucifer|ルシファー]]を危険視している'] }
  ],
  related: ['angel-hunter', 'academy', 'messiah-church', 'lucifer'],
  keywords: ['協会', '政府']
},
{
  id: 'angel-hunter', cat: 'org',
  title: 'エンジェルハンター', reading: 'Venator Angelorum',
  updated: '2026-10-01',
  summary: '対天使協会の中心となって活動する契約者たち。',
  info: [['所属', '[[anti-angel-association|対天使協会]]'], ['資格', '悪魔契約者']],
  sections: [
    { h: '概要', p: ['[[anti-angel-association|対天使協会]]で天使の調査や討伐を担う契約者を「エンジェルハンター」と呼ぶ。悪魔と組んだ契約者ペアで戦う。'] }
  ],
  related: ['anti-angel-association', 'contract', 'academy'],
  keywords: ['ハンター', '契約者']
},
{
  id: 'academy', cat: 'org',
  title: '対天使アカデミー', reading: 'Academia',
  updated: '2026-10-01',
  summary: '15歳以上が入学できる3年制の教育機関。天使討伐の知識・技術を教える。',
  info: [['入学資格', '15歳以上'], ['修業年限', '3年'], ['3年目', '悪魔と契約する儀式']],
  sections: [
    { h: '概要', p: ['15歳以上が入学可能な3年制教育機関。天使討伐の知識・技術を教育する。'] },
    { h: '契約の儀式', p: ['3年目に悪魔と[[contract|契約]]する儀式を行う。'] },
    { h: '講師', p: ['稀に[[demon-ranks/tsukasa|司級]]契約者が講師として来る。'] }
  ],
  related: ['contract', 'anti-angel-association', 'angel-hunter'],
  keywords: ['学校', '教育', '儀式']
},
{
  id: 'messiah-church', cat: 'org',
  title: 'メシア教会', reading: 'Ecclesia Messiae',
  updated: '2026-10-01',
  summary: '王級天使が人に化けて作った教会。一般人が運営し、各国に広がっている。',
  info: [['創設', '[[angel-ranks/ou|王級]]天使（人に化けて）'], ['運営', '一般人'], ['規模', '各国に展開'], ['敵対', '[[anti-angel-association|対天使協会]]']],
  sections: [
    { h: '概要', p: ['[[angel-ranks/ou|王級]]天使が人に化けて作った教会。一般人が運営し、各国に広がる。対天使協会を敵視している。名は[[messiah|メシア]]を冠する。'] },
    { warn: '運営は一般人だが、もちろん天使もいる。' }
  ],
  related: ['messiah', 'anti-angel-association', 'angel'],
  keywords: ['教会', '宗教']
},
{
  id: 'raphael', cat: 'org',
  title: 'ラファエル', reading: 'Raphael',
  updated: '2026-10-01',
  summary: '司級天使アルカンゲロイが作った組織。裏社会と深く関わる。',
  info: [['創設', '司級天使[[angel-hierarchy|アルカンゲロイ]]'], ['構成', '人間が多い／一部天使も所属'], ['特徴', '裏社会と深く関わる']],
  sections: [
    { h: '概要', p: ['司級天使[[angel-hierarchy|アルカンゲロイ]]が作った組織。裏社会と深く関わっている。一部天使も所属しているが、人間の数が多い。'] }
  ],
  related: ['angel-hierarchy', 'lucifer', 'kyoten-church'],
  keywords: ['裏社会', 'アルカンゲロイ']
},
{
  id: 'kyoten-church', cat: 'org',
  title: '共天教会', reading: 'Ecclesia Concordiae',
  updated: '2026-10-01',
  summary: '司級天使アンゲロイが創設した、天使と人間の共存を目指す教会。',
  info: [['創設', '司級天使[[angel-hierarchy|アンゲロイ]]'], ['目的', '天使と人間の共存'], ['立場', '中立']],
  sections: [
    { h: '概要', p: ['司級天使[[angel-hierarchy|アンゲロイ]]が創設した。天使と人間の共存を目指し、中立的立場で調査活動も行う。'] }
  ],
  related: ['angel-hierarchy', 'messiah-church', 'raphael'],
  keywords: ['共存', 'アンゲロイ', '中立']
},
{
  id: 'lucifer', cat: 'org',
  title: 'ルシファー', reading: 'Lucifer',
  updated: '2026-10-01',
  summary: '悪魔契約者や犯罪者の集団。天使も人間も殺す凶悪犯罪組織。',
  info: [['種別', '犯罪組織'], ['構成', '悪魔契約者・犯罪者'], ['標的', '天使と人間']],
  sections: [
    { h: '概要', p: ['悪魔契約者や犯罪者の集団。天使も人間も殺す凶悪犯罪組織で、[[anti-angel-association|対天使協会]]から危険視されている。'] }
  ],
  related: ['anti-angel-association', 'raphael'],
  keywords: ['犯罪', 'るしふぁー']
},
{
  id: 'mate-lab', cat: 'org',
  title: '魔天研究会', reading: 'Collegium Studiorum',
  updated: '2026-10-01',
  summary: '悪魔・天使研究者の集まり。魔具や対天使武器の開発を行う。',
  info: [['構成', '悪魔・天使の研究者'], ['活動', '魔具・対天使武器の開発'], ['目標', '医療や科学の発展']],
  sections: [
    { h: '概要', p: ['悪魔・天使研究者の集まり。[[magu|魔具]]や[[anti-angel-weapon|対天使武器]]の開発を行い、医療や科学の発展を目指す。'] }
  ],
  related: ['magu', 'anti-angel-weapon', 'shoshinden'],
  keywords: ['研究', '開発']
},

/* ---------- 武器と覚醒 ---------- */
{
  id: 'anti-angel-weapon', cat: 'battle',
  title: '対天使武器', reading: 'ダンジョン魔具 ── Arma contra Angelos',
  updated: '2026-10-01',
  summary: '小神殿で採取される素材を用いて作られる武器。魔力を乗せることで天使に有効な攻撃ができる。',
  info: [['素材', '[[shoshinden|小神殿]]の壁など（魔力を帯びている）'], ['別名', 'ダンジョン魔具'], ['防具', '存在する']],
  sections: [
    { h: '概要', p: ['[[shoshinden|小神殿（ダンジョン）]]で採取される素材を用いて作られる。[[magic-power|魔力]]を乗せることで天使に有効な攻撃が可能。'] },
    { h: '防具', p: ['防具も存在し、魔力で強化されている。'] },
    { h: '固有の能力', p: ['武器・防具にはそれぞれ固有の能力や制限がある。'] }
  ],
  related: ['shoshinden', 'magu', 'magic-power', 'mate-lab'],
  keywords: ['武器', '防具', 'ダンジョン魔具']
},
{
  id: 'magu', cat: 'battle',
  title: '魔具', reading: 'Instrumentum',
  updated: '2026-10-01',
  summary: '小神殿で希に見つかる特殊な道具。発見されると政府や組織によって管理・回収される。',
  info: [['入手', '[[shoshinden|小神殿]]で希に発見'], ['管理', '政府や組織が管理・回収']],
  sections: [
    { h: '概要', p: ['[[shoshinden|小神殿]]で希に見つかる特殊な道具。発見された魔具は政府や組織によって管理・回収される。'] },
    { h: '研究', p: ['[[mate-lab|魔天研究会]]が魔具の開発を行っている。'] }
  ],
  related: ['shoshinden', 'anti-angel-weapon', 'mate-lab'],
  keywords: ['まぐ', '道具']
},
{
  id: 'demon-fusion', cat: 'battle',
  title: '魔人化', reading: 'デーモンフュージョン',
  updated: '2026-10-01',
  summary: '悪魔と契約者の絆が極限まで高まると発動できる融合状態。',
  info: [['発動条件', '悪魔と契約者の絆が極限まで高まる'], ['解除', '強い精神力が必要']],
  sections: [
    { h: '効果', list: ['肉体強化', '魔力効率の向上', '自然治癒力の増加'] },
    { warn: '魔人化中は契約者の人格が悪魔に一時的に影響されることもある。解除には強い精神力が必要。' }
  ],
  related: ['blessing', 'price', 'demon'],
  keywords: ['デーモンフュージョン', '融合', 'まじんか']
},
{
  id: 'blessing', cat: 'battle',
  title: '神／魔神の祝福', reading: 'Benedictio',
  updated: '2026-10-01',
  summary: '極稀に発現する究極覚醒状態。膨大な魔力を消費し、能力が真の力を発揮する。',
  info: [['頻度', '極稀'], ['発動しやすい状況', '戦闘中の大逆転／絶体絶命'], ['反動', '長期間の疲労・精神的消耗']],
  sections: [
    { h: '概要', p: ['極稀に発現する究極覚醒状態。膨大な[[magic-power|魔力]]を消費し、能力が真の力を発揮する。戦闘中の大逆転や絶体絶命の状況で発動しやすい。'] },
    { warn: '発動中は副作用が強く、解除後は長期間の疲労や精神的消耗が残る。' }
  ],
  related: ['demon-fusion', 'price', 'magic-power'],
  keywords: ['覚醒', '祝福', '魔神']
}
);
