/* ============================================================================
   CHARACTERS — キャラクター
   まだキャラクター設定は届いていません。
   追加するときは、下のテンプレートをコピーして ARTICLES.push({...}) してください。

   【編集ガイド】記事を追加するときの目安の見出し構成
     プロフィール … 名前・種族・所属・活動地域など（info ブロック）
     人物         … 性格・人物像
     来歴         … これまでの経歴
     能力         … 能力・技能など
     関係         … 他の人物・組織との関係（related に記事IDを入れる）
     登場         … 関連する出来事・記事

   必須：id / cat:'character' / title / lede（1〜2文の紹介）/ updated /
        sections（プロフィール＋概要は最低限あるとよい）/ related（空配列でOK）
   任意：image … カード一覧・記事ページ両方に反映されます。
        指定しない場合や読み込みに失敗した場合は自動で「NO IMAGE」と表示されるので、
        情報がまだ揃っていないキャラクターも空欄のまま登録できます。
        例）image: 'assets/images/characters/character-id.jpg'
   ============================================================================

ARTICLES.push({
  id: 'character-id',
  cat: 'character',
  title: 'キャラクター名',
  lede: '一言紹介',
  updated: '2026.08.23',
  image: '',  // 例: 'assets/images/characters/character-id.jpg'（空欄でOK）
  sections: [
    {id:'profile', title:'プロフィール', blocks:[
      {t:'info', items:[
        {label:'種族', value:''},
        {label:'所属', value:''},
        {label:'活動地域', value:''},
      ]},
    ]},
    {id:'about', title:'概要', blocks:[
      {t:'p', text:''},
    ]},
  ],
  related: [],  // 関連する都市・契約などの記事IDをここに（例: 'atlantis', 'contract'）
});

============================================================================ */
