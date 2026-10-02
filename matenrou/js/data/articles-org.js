ARTICLES.push(
{
  id: 'anti-angel-association', cat: 'org',
  title: '対天使協会', reading: 'Societas contra Angelos',
  updated: '2026-10-01',
  summary: '政府公認の天使討伐組織。契約者「エンジェルハンター」を中心に活動する。',
  info: [['種別', '政府公認組織'], ['本部', 'アメリカ'], ['支部', '世界各地'], ['構成', 'エンジェルハンター（契約者）中心']],
  sections: [
    { h: '概要', p: ['政府公認の天使討伐組織。契約者「[[angel-hunter|エンジェルハンター]]」を中心に活動し、天使の調査や討伐を担当する。世界各地に支部があり、アメリカに本部がある。'] },
    { h: '他組織との関係', list: ['[[messiah-church|メシア教会]]から敵視されている', '[[lucifer|ルシファー]]を危険視している'] }
  ],
  related: ['angel-hunter', 'messiah-church', 'lucifer', 'academy'],
  keywords: ['協会', '政府']
},
{
  id: 'messiah-church', cat: 'org',
  title: 'メシア教会', reading: 'Ecclesia Messiae',
  updated: '2026-10-01',
  summary: '王級天使が人に化けて作った教会。一般人が運営し、各国に広がっている。',
  info: [['創設', '王級天使（人に化けて）'], ['運営', '一般人'], ['規模', '各国に展開'], ['敵対', '対天使協会']],
  sections: [
    { h: '概要', p: ['[[rank-ou|王級]]天使が人に化けて作った教会。一般人が運営し、各国に広がる。対天使協会を敵視している。'] },
    { warn: '運営は一般人だが、もちろん天使もいる。' }
  ],
  related: ['messiah', 'anti-angel-association', 'rank-ou'],
  keywords: ['教会', '宗教']
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
  id: 'raphael', cat: 'org',
  title: 'ラファエル', reading: 'Raphael',
  updated: '2026-10-01',
  summary: '司級天使アルカンゲロイが作った組織。裏社会と深く関わる。',
  info: [['創設', '司級天使アルカンゲロイ'], ['構成', '人間が多い／一部天使も所属'], ['特徴', '裏社会と深く関わる']],
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
  info: [['創設', '司級天使アンゲロイ'], ['目的', '天使と人間の共存'], ['立場', '中立']],
  sections: [
    { h: '概要', p: ['司級天使[[angel-hierarchy|アンゲロイ]]が創設した。天使と人間の共存を目指し、中立的立場で調査活動も行う。'] }
  ],
  related: ['angel-hierarchy', 'messiah-church', 'raphael'],
  keywords: ['共存', 'アンゲロイ', '中立']
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
{
  id: 'academy', cat: 'org',
  title: '対天使アカデミー', reading: 'Academia',
  updated: '2026-10-01',
  summary: '15歳以上が入学できる3年制の教育機関。天使討伐の知識・技術を教える。',
  info: [['入学資格', '15歳以上'], ['修業年限', '3年'], ['3年目', '悪魔と契約する儀式']],
  sections: [
    { h: '概要', p: ['15歳以上が入学可能な3年制教育機関。天使討伐の知識・技術を教育する。'] },
    { h: '契約の儀式', p: ['3年目に悪魔と[[contract|契約]]する儀式を行う。'] },
    { h: '講師', p: ['稀に[[rank-tsukasa|司級]]契約者が講師として来る。'] }
  ],
  related: ['contract', 'anti-angel-association', 'angel-hunter'],
  keywords: ['学校', '教育', '儀式']
}
);
