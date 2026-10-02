/* =========================================================
   キャラクターデータ
   type: 'angel'（天使）／'demon'（悪魔）／'human'（人）
   ・シートの配置は元のキャラシと同じ：
     左上＝名前／右上＝天使・人は「所属」(affiliation)、悪魔は「契約」(contract)
     中央＝階級 (rank) と紋章、その下＝天使は「階位」(hierarchy)、悪魔は「種類」(kind)
     左下＝見た目（画像と文章 appearance）／右下＝設定 (setting)
   ・forms：階級ごとに姿が変わるとき。{ rank, image } を低い順に並べる
     current：最初に表示する姿（0から数える。省略すると最後＝いちばん高い階級）
   ・空欄の項目は「まだ記されていない」と表示されます
   ・spoiler: true を付けると、ネタバレなしの人には「伏せられた記録」として表示されます
   ========================================================= */
CHARACTERS.push(
{
  id: 'mortus', type: 'angel',
  name: 'モルツゥス',
  rank: '司級', hierarchy: '',
  affiliation: '',
  image: 'assets/characters/mortus.svg',
  appearance: '',
  setting: '',
  related: ['angel', 'rank-tsukasa', 'angel-hierarchy']
},
{
  id: 'dornelahid', type: 'demon',
  name: 'ドルネラヒド',
  contract: '', kind: '',
  forms: [
    { rank: '霊級', image: 'assets/characters/dornelahid-rei.svg' },
    { rank: '命級', image: 'assets/characters/dornelahid-mei.svg' },
    { rank: '王級', image: 'assets/characters/dornelahid-ou.svg' },
    { rank: '司級', image: 'assets/characters/dornelahid-shi.svg' }
  ],
  appearance: '',
  setting: '',
  related: ['demon', 'rank-system', 'contract']
}
);
