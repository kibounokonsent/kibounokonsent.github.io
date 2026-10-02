/* =========================================================
   キャラクターデータ
   type: 'angel'（天使シート・金）／'demon'（悪魔シート・赤）／'human'（一般人シート・緑）
   シート上の位置：
     名前 = name ／ 右上 = 天使・一般人は「所属」(affiliation)、悪魔は「契約」(contract)
     中央上 = 階級 (rank) ／ 中央下 = 天使は階位 (hierarchy)、悪魔は種類 (kind)
     見た目 = image（画像パス）＋ appearance（文章）／ 設定 = setting
   sample:true のものは記入例です。実際のキャラクターを追加したら削除してください。
   ========================================================= */
CHARACTERS.push(
{
  id: 'sample-angel', type: 'angel', sample: true,
  name: '（天使の名前）', reading: 'Exemplum',
  affiliation: '（所属組織）',
  rank: '王級', hierarchy: '',
  image: '',
  appearance: 'ここに見た目の説明を書きます。画像を入れる場合は assets/characters/ に置いて image にパスを書きます。',
  setting: 'ここに設定を書きます。長い文章はシートの下の「プロフィール」にも全文表示されます。',
  related: ['angel']
},
{
  id: 'sample-human', type: 'human', sample: true,
  name: '（一般人の名前）', reading: 'Exemplum',
  affiliation: '（所属）',
  image: '',
  appearance: 'ここに見た目の説明を書きます。',
  setting: 'ここに設定を書きます。',
  related: ['academy']
},
{
  id: 'sample-demon', type: 'demon', sample: true,
  name: '（悪魔の名前）', reading: 'Exemplum',
  contract: '（契約者の名前）',
  rank: '霊級', kind: '憤怒',
  image: '',
  appearance: 'ここに見た目の説明を書きます。',
  setting: 'ここに設定を書きます。',
  related: ['demon', 'wrath']
}
);
