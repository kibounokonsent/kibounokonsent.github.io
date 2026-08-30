/* ==========================================================================
   WORLD CALENDAR — イベントデータ

   イベントを追加・編集したいときは、このファイルだけを触ればOKです。
   js/calendar.js（描画ロジック側）は触る必要はありません。

   書き方：
   {
       id: '一意なID（英数字・ハイフン）',
       month: 月（1〜12）,
       day: 日,
       name: '行事名',
       type: '祝日 / 祭り / 記念日 / 追悼日 / 宗教行事 / 季節行事 / 国家行事 / 国際行事 / 文化行事 など',
       countries: ['国名'] または ['全世界'],  // 複数国もOK: ['ニポラン','ラリアフルス']
       description: '説明文',

       // ↓ ここから下は任意（歴史年表と関連付けたい場合のみ）
       established: 制定年（統合暦の数字）,
       relatedHistory: '関連する歴史年表の出来事名',

       // ↓ この行事の詳細を解説するMOON CORE記事が存在する場合のみ（ARTICLESのid）
       // 記事が存在しない/未設定の場合、モーダルに「詳細を見る」は表示されません
       articleId: '記事のid（例: world-unity-declaration）'
   },
   ========================================================================== */

/* ==========================================================================
   WORLD CALENDAR — イベントデータ

   イベントを追加・編集したいときは、このファイルだけを触ればOKです。
   js/calendar.js（描画ロジック側）は触る必要はありません。
   ========================================================================== */
const CALENDAR_EVENTS = [

 {
    id: 'new-year',
    month: 1,
    day: 1,
    name: '新年',
    type: '祝日',
    countries: ['全世界'],
    description: '新たな年の始まりを祝う日。'
},

{
    id: 'chirildo-snow-day',
    month: 1,
    day: 15,
    name: '雪の日',
    type: '季節行事',
    countries: ['チリルド・アイルツア'],
    description: '雪と共に暮らしてきたチリルド・アイルツアの文化を楽しむ日。雪を使った遊びや地域ごとの催しが行われる。'
},

{
    id: 'wonhead-breakfast-day',
    month: 1,
    day: 10,
    name: '朝食の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '一日の始まりに食事を楽しむヲンヘードの食文化記念日。各地で様々な朝食料理が楽しまれる。'
},

{
    id: 'ryukyo-culture-day',
    month: 2,
    day: 8,
    name: '龍教文化の日',
    type: '文化行事',
    countries: ['ニポラン'],
    established: 8,
    relatedHistory: '龍教成立',
    description: '龍教の成立と、その思想がニポランの文化として受け継がれてきたことを記念する日。'
},

{
    id: 'hubert-cat-day',
    month: 2,
    day: 22,
    name: '猫の日',
    type: '文化行事',
    countries: ['ヒューバート'],
    description: 'ヒューバートに根付く猫文化を楽しむ日。各地で猫に関する催しが行われ、普段以上に猫が街の主役となる。'
},

{
    id: 'wonhead-soup-day',
    month: 2,
    day: 2,
    name: 'スープの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々な具材や調理法で作られるスープを楽しむ食文化記念日。家庭や飲食店で特色あるスープが提供される。'
},

{
    id: 'wonhead-meat-day',
    month: 2,
    day: 9,
    name: '肉の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '肉料理を楽しむヲンヘードの食文化記念日。様々な肉料理が食卓に並び、料理店でも特別な料理が提供される。'
},

{
    id: 'world-unity',
    month: 3,
    day: 20,
    name: '世界団結記念日',
    type: '記念日',
    countries: ['全世界'],
    established: 629,
    relatedHistory: '世界団結宣言',
    description: '統合暦629年の世界団結宣言を記念する日。国家間の対立を越え、文明全体の発展を目指す理念を確認する。'
},

{
    id: 'garhyura-strong-day',
    month: 3,
    day: 3,
    name: '強者の日',
    type: '国家行事',
    countries: ['ガルヒューラ'],
    description: '「強さこそ正義」というガルヒューラの思想を象徴する日。地域によって様々な形で強さを示す催しが行われる。'
},

{
    id: 'sanrudo-three-poles-day',
    month: 3,
    day: 3,
    name: '三極の日',
    type: '国家行事',
    countries: ['サンルド'],
    description: '黄金・白金・調律の三極が共存するサンルドの文化を象徴する日。三派それぞれの文化に触れる催しが行われる。'
},

{
    id: 'lariafuls-seed-day',
    month: 3,
    day: 21,
    name: '種まきの日',
    type: '季節行事',
    countries: ['ラリアフルス'],
    description: '植物を育て、新たな循環を始める日。各地で種をまき、自然とのつながりを確かめる。'
},

{
    id: 'wonhead-dango-day',
    month: 3,
    day: 3,
    name: '団子の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '団子を中心とした様々な料理や菓子を楽しむ日。地域や家庭ごとに異なる団子が作られる。'
},

{
    id: 'tasumenio-port-day',
    month: 3,
    day: 3,
    name: '港の日',
    type: '文化記念日',
    countries: ['タスメニオ'],
    description: '人や物が行き交う港と、そこから広がってきたタスメニオの文化を記念する日。港に関する展示や催しが行われる。'
},

{
    id: 'niporan-spring-day',
    month: 4,
    day: 1,
    name: '春の日',
    type: '季節行事',
    countries: ['ニポラン'],
    description: '春の訪れを楽しむニポランの季節行事。各地で春にちなんだ催しや食文化が楽しまれる。'
},

{
    id: 'belnea-observation-day',
    month: 4,
    day: 4,
    name: '観察の日',
    type: '科学記念日',
    countries: ['ベルネア'],
    description: '身近な生物や環境を観察し、そこにある変化を知る日。各地で観察会や研究成果の公開が行われる。'
},

{
    id: 'orgaron-art-day',
    month: 4,
    day: 15,
    name: '芸術の日',
    type: '文化記念日',
    countries: ['オルガロン'],
    description: '芸術と創作を尊重するオルガロンの文化を象徴する日。様々な作品が公開され、創作活動が盛んに行われる。'
},

{
    id: 'yuretsuea-repair-day',
    month: 4,
    day: 18,
    name: '修理の日',
    type: '文化行事',
    countries: ['ユーレツェア'],
    description: '壊れたものを捨てず、修理して使い続けるユーレツェアの文化を象徴する日。古い道具や機械の修理が盛んに行われる。'
},

{
    id: 'fumora-wind-day',
    month: 4,
    day: 22,
    name: '風の日',
    type: '季節行事',
    countries: ['フーモラ・スカイピル'],
    description: '空中都市を支える風と大気の流れを楽しむ日。気象観測や空に関する催しが都市各地で行われる。'
},

{
    id: 'world-reconstruction-day',
    month: 5,
    day: 5,
    name: '世界復興記念日',
    type: '記念日',
    countries: ['全世界'],
    established: 580,
    relatedHistory: '世界復興協定締結',
    description: '統合暦580年の世界復興協定締結を記念する日。戦争後の復興と国家間協力の重要性を確認する。'
},

{
    id: 'lariafuls-forest-day',
    month: 5,
    day: 4,
    name: '森の日',
    type: '文化行事',
    countries: ['ラリアフルス'],
    description: 'リフィネスの森と共に暮らす文化を見つめ直す日。森から得られる恵みへの感謝と、自然を守る活動が行われる。'
},

{
    id: 'sertcity-information-day',
    month: 5,
    day: 5,
    name: '情報の日',
    type: '記念日',
    countries: ['セルトシティ'],
    description: '情報を共有し、活用することで発展してきたセルトシティの文化を象徴する日。情報技術に関する催しや公開展示が行われる。'
},

{
    id: 'kyuma-knowledge-day',
    month: 5,
    day: 18,
    name: '知る日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '未知を知り、新たな発見へ進むことを大切にするキューマの思想を象徴する日。研究成果や新たな発見が公開される。'
},

{
    id: 'sanrudo-gold-day',
    month: 5,
    day: 5,
    name: 'ゴールドの日',
    type: '文化記念日',
    countries: ['サンルド'],
    description: '黄金派の文化と価値観を象徴する日。黄金を用いた装飾や衣装が街を彩り、黄金派にまつわる催しが行われる。'
},

{
    id: 'orgaron-graffiti-day',
    month: 5,
    day: 5,
    name: '落書きの日',
    type: '文化行事',
    countries: ['オルガロン'],
    description: '誰もが自由に絵や文字を描き、表現を楽しむ日。街の一部が自由な創作空間として開放される。'
},

{
    id: 'fumora-floating-day',
    month: 5,
    day: 5,
    name: '浮遊の日',
    type: '季節行事',
    countries: ['フーモラ・スカイピル'],
    description: '空中に浮かぶ都市で暮らすことそのものを楽しむ日。都市の高度や浮遊技術を利用した様々な催しが行われる。'
},

{
    id: 'tasumenio-relay-day',
    month: 5,
    day: 5,
    name: '中継の日',
    type: '技術記念日',
    countries: ['タスメニオ'],
    description: '世界各地を繋ぐ中継網と、それを支える技術を記念する日。通信やテレポート中継に関する展示が行われる。'
},

{
    id: 'kyuma-map-day',
    month: 6,
    day: 6,
    name: '地図の日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '世界を知るための地図と、その作成に関わってきた人々を記念する日。古い地図から最新の探査地図まで様々な資料が公開される。'
},

{
    id: 'hubert-life-coexistence-festival',
    month: 6,
    day: 6,
    name: '生命共生祭',
    type: '文化行事',
    countries: ['ヒューバート'],
    description: '生命科学と再生医療の発展、そして人間と生命との関係を祝うヒューバートの文化行事。研究成果の公開や生命倫理について考える催しも行われる。'
},

{
    id: 'hubert-cat-thanks-day',
    month: 6,
    day: 6,
    name: '猫感謝の日',
    type: '記念日',
    countries: ['ヒューバート'],
    description: 'ヒューバートで長く親しまれてきた猫との暮らしに感謝する日。猫と暮らす家庭を中心に、様々な催しが行われる。'
},

{
    id: 'belnea-ecosystem-day',
    month: 6,
    day: 5,
    name: '生態系の日',
    type: '記念日',
    countries: ['ベルネア'],
    description: '環境ドームに存在する多様な生態系について学び、人間と生物の関係を考える日。各ドームで観察会などが行われる。'
},

{
    id: 'fumora-freedom-day',
    month: 6,
    day: 21,
    name: '自由の日',
    type: '文化記念日',
    countries: ['フーモラ・スカイピル'],
    description: '様々な文化や価値観が共存するフーモラ・スカイピルの自由な気風を象徴する日。都市では多様な文化の催しが開かれる。'
},

{
    id: 'niporan-sleep-day',
    month: 6,
    day: 10,
    name: '昼寝の日',
    type: '国民行事',
    countries: ['ニポラン'],
    description: '忙しい日々の中で一度立ち止まり、ゆっくり過ごすことを推奨する日。昼寝をする人も多い。'
},

{
    id: 'yuretsuea-clock-day',
    month: 6,
    day: 10,
    name: '時計の日',
    type: '記念日',
    countries: ['ユーレツェア'],
    description: '時計技術の発展と、それによって人々の時間の過ごし方が変化してきた歴史を記念する日。時計職人による展示などが行われる。'
},

{
    id: 'tasumenio-shirasu-mochi-day',
    month: 6,
    day: 4,
    name: 'しらすもちの日',
    type: '食文化記念日',
    countries: ['タスメニオ'],
    description: 'タスメニオで親しまれているしらすもちを楽しむ日。各地で様々なしらすもちが作られ、家庭や食堂で食べられる。結局しらすもちはなんなのかはわからない。'
},

{
    id: 'world-nap-day',
    month: 6,
    day: 6,
    name: '昼寝の日',
    type: '生活記念日',
    countries: ['全世界'],
    description: '忙しい日々の中で休息することの大切さを考える日。各地で昼寝や休息を楽しむことが推奨される。'
},

{
    id: 'sert-city-foundation-day',
    month: 7,
    day: 7,
    name: 'セルトシティ創立記念日',
    type: '記念日',
    countries: ['セルトシティ'],
    established: 1891,
    relatedHistory: 'セルトシティ創立',
    description: '統合暦1891年のセルトシティ創立を記念する日。現実都市と仮想都市を含む情報都市の発展を祝う。'
},

{
    id: 'sanrudo-platinum-day',
    month: 7,
    day: 7,
    name: 'プラチナの日',
    type: '文化記念日',
    countries: ['サンルド'],
    description: '白金派の文化と価値観を象徴する日。白金を用いた装飾や衣装が街を彩り、白金派にまつわる催しが行われる。'
},

{
    id: 'orgaron-sound-day',
    month: 7,
    day: 7,
    name: '音の日',
    type: '文化記念日',
    countries: ['オルガロン'],
    description: '音楽や音響作品など、音による表現を楽しむ日。様々な場所で演奏や作品展示が行われる。'
},

{
    id: 'yuretsuea-gear-day',
    month: 7,
    day: 7,
    name: '歯車の日',
    type: '技術記念日',
    countries: ['ユーレツェア'],
    description: '機械文明を支えてきた歯車の技術と文化を楽しむ日。様々な機械装置が公開される。'
},

{
    id: 'kyuma-exploration-day',
    month: 7,
    day: 20,
    name: '探検の日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '未知の場所へ赴き、自らの目で確かめることを大切にするキューマの記念日。探検記録や発見が公開される。'
},

{
    id: 'tasumenio-sea-day',
    month: 7,
    day: 20,
    name: '海の日',
    type: '季節行事',
    countries: ['タスメニオ'],
    description: '海と共に発展してきたタスメニオの文化を楽しむ日。海辺では様々な催しが行われる。'
},

{
    id: 'wonhead-tomato-day',
    month: 7,
    day: 10,
    name: 'トマトの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: 'トマトを使った料理を楽しむヲンヘードの食文化記念日。「ト（10）マト」の語呂合わせからこの日に定められている。なお、納豆の日にしろという意見も多い。'
},

{
    id: 'fumora-tenyoku-mon-day',
    month: 8,
    day: 8,
    name: '天翼紋の日',
    type: '文化行事',
    countries: ['フーモラ・スカイピル'],
    description: 'フーモラ・スカイピルに残る正体不明の「天翼紋」にまつわる行事。都市各地に紋様が掲げられ、その意味について自由に語り合う日。'
},

{
    id: 'niporan-summer-fes',
    month: 8,
    day: 15,
    name: 'ニポラン夏季祭',
    type: '祭り',
    countries: ['ニポラン'],
    description: 'ニポラン各地で行われる夏季の祭り。地域ごとの祭礼や食文化、伝統芸能などが行われる。'
},

{
    id: 'world-science-day',
    month: 8,
    day: 15,
    name: '世界科学記念日',
    type: '記念日',
    countries: ['全世界'],
    description: '科学技術の発展を称える国際的な記念日。各国の研究成果や技術が紹介される。'
},

{
    id: 'niporan-summer-day',
    month: 8,
    day: 15,
    name: '夏の日',
    type: '季節行事',
    countries: ['ニポラン'],
    description: '夏の季節そのものを楽しむニポランの国民的な日。地域ごとの風習や食文化、季節の催しが行われる。'
},

{
    id: 'wonhead-rice-day',
    month: 8,
    day: 8,
    name: '米の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '食卓を支える米と、それを中心に発展してきた食文化を楽しむ日。様々な米料理が食卓に並ぶ。'
},

{
    id: 'fumora-sky-day',
    month: 8,
    day: 8,
    name: '空の日',
    type: '文化行事',
    countries: ['フーモラ・スカイピル'],
    description: '空に浮かぶ都市で暮らす人々が、自らの生活する空を楽しむ日。都市各所で空や気象に関する催しが行われる。'
},

{
    id: 'yuretsuea-long-life-day',
    month: 8,
    day: 8,
    name: '長持ちの日',
    type: '文化記念日',
    countries: ['ユーレツェア'],
    description: '物を長く大切に使うユーレツェアの思想を象徴する日。長年使われてきた道具や機械が紹介され、その歴史が語られる。'
},

{
    id: 'niporan-night-day',
    month: 8,
    day: 8,
    name: '夜の日',
    type: '季節行事',
    countries: ['ニポラン'],
    description: '夜の時間を楽しむニポランの季節行事。夜市や照明、星空を楽しむ催しなどが各地で行われる。'
},

{
    id: 'kyuma-telescope-day',
    month: 8,
    day: 18,
    name: '望遠鏡の日',
    type: '科学記念日',
    countries: ['キューマ'],
    description: '遠くにあるものを観測し、未知を知ろうとする探究心を象徴する日。天体や遠隔地の観測が行われる。'
},

{
    id: 'orgaron-creation-day',
    month: 9,
    day: 1,
    name: '創造の日',
    type: '文化行事',
    countries: ['オルガロン'],
    description: '芸術・創作・表現を祝うオルガロン最大級の文化行事。戦争ではなく創造を選んだ国家理念を象徴する日。'
},

{
    id: 'wonhead-rice-and-bread-day',
    month: 9,
    day: 1,
    name: '米とパンの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '米とパンをはじめとする主食の文化を楽しむ日。各地で様々な主食料理が作られ、食卓を支える食文化について語られる。'
},

{
    id: 'wonhead-new-rice-day',
    month: 9,
    day: 1,
    name: '新米の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '新たに収穫された米を楽しむ日。新米を使った料理が各地の食卓に並び、その年の実りを味わう。'
},

{
    id: 'wonhead-rice-bread-day',
    month: 9,
    day: 5,
    name: '米とパンの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '米とパンという二つの代表的な主食を楽しむ日。様々な米料理やパン料理が食卓に並ぶ。'
},

{
    id: 'wonhead-potato-day',
    month: 9,
    day: 3,
    name: '芋の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々な芋料理を楽しむ食文化記念日。焼く、煮る、揚げるなど、多様な調理法で芋が楽しまれる。'
},

{
    id: 'wonhead-bread-day',
    month: 9,
    day: 6,
    name: 'パンの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々なパンを楽しむ日。地域ごとのパンや家庭で作られるパンが食卓に並ぶ。'
},

{
    id: 'tasumenio-connection-day',
    month: 9,
    day: 15,
    name: '接続の日',
    type: '記念日',
    countries: ['タスメニオ'],
    description: '人々と物資を世界中へ繋いできたタスメニオの接続文化を象徴する日。テレポート中継網に関する催しも行われる。'
},

{
    id: 'belnea-dome-day',
    month: 9,
    day: 16,
    name: '環境ドームの日',
    type: '記念日',
    countries: ['ベルネア'],
    description: 'ベルネア各地の環境ドームと、そこで維持されている生態系を知る日。一部のドームでは一般公開も行われる。'
},

{
    id: 'lariafuls-harvest-festival',
    month: 9,
    day: 20,
    name: '収穫祭',
    type: '祭り',
    countries: ['ラリアフルス'],
    description: 'リフィネスの森から得られた恵みに感謝する年に一度の祭り。収穫を祝うとともに、地域によっては成人の儀式も行われる。'
},

{
    id: 'wonhead-rice-day-autumn',
    month: 9,
    day: 8,
    name: '米の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '米を使った様々な料理を楽しむ日。新しい料理から昔ながらの料理まで、多様な米食文化が紹介される。'
},

{
    id: 'sanrudo-harmony-day',
    month: 9,
    day: 9,
    name: '調律の日',
    type: '文化記念日',
    countries: ['サンルド'],
    description: '黄金派・白金派・調律派の三極が交わり、価値の調和を確認する日。サンルドの三極文化を象徴する行事が行われる。'
},

{
    id: 'yuretsuea-tool-day',
    month: 9,
    day: 9,
    name: '道具の日',
    type: '文化記念日',
    countries: ['ユーレツェア'],
    description: '長く使われてきた道具に感謝し、手入れや修理を行う日。道具との時間を大切にするユーレツェアの思想を象徴する。'
},

{
    id: 'wonhead-noodle-day',
    month: 9,
    day: 9,
    name: '麺の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '世界各地の麺料理を楽しむヲンヘードの食文化記念日。地域や家庭ごとの様々な麺料理が食卓に並ぶ。'
},

{
    id: 'tasumenio-travel-day',
    month: 9,
    day: 27,
    name: '旅の日',
    type: '文化記念日',
    countries: ['タスメニオ'],
    description: '世界各地を繋ぐタスメニオの交通と旅行文化を楽しむ日。テレポート中継網を利用した旅や各地の交流が盛んになる。'
},

{
    id: 'yuretsuea-old-things-day',
    month: 10,
    day: 1,
    name: '古いものの日',
    type: '文化記念日',
    countries: ['ユーレツェア'],
    description: '長い年月を経て使われ続けてきた道具や機械に目を向ける日。古いものの価値や来歴を語り合う。'
},

{
    id: 'kyuma-old-book-day',
    month: 10,
    day: 1,
    name: '古本の日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '古い本や記録を読み返し、過去に残された知識を受け継ぐ日。歴史資料の展示や読書会などが行われる。'
},

{
    id: 'wonhead-mochi-day',
    month: 10,
    day: 1,
    name: '餅の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '餅と、それを使った様々な料理を楽しむ日。地域や家庭ごとの餅料理が紹介される。'
},

{
    id: 'kyuma-question-day',
    month: 10,
    day: 4,
    name: '疑問の日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '身近な疑問から未知の知識へ目を向ける日。「なぜ？」という疑問を大切にするキューマの文化を象徴する。'
},

{
    id: 'sanrudo-mask-day',
    month: 10,
    day: 5,
    name: '仮面の日',
    type: '文化行事',
    countries: ['サンルド'],
    description: 'サンルドに根付く仮面文化を楽しむ日。様々な仮面が街を彩り、身分や派閥を越えて仮面を楽しむ催しが行われる。'
},

{
    id: 'wonhead-flour-food-day',
    month: 10,
    day: 5,
    name: '粉ものの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '小麦などの粉を使った様々な料理を楽しむ日。地域ごとの粉もの料理が食卓や屋台に並ぶ。'
},

{
    id: 'wonhead-corn-day',
    month: 10,
    day: 3,
    name: 'とうもろこしの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: 'とうもろこしを使った料理を楽しむ日。焼き物から加工食品まで、様々な食べ方が楽しまれる。'
},

{
    id: 'world-ethics-day',
    month: 10,
    day: 10,
    name: '世界倫理の日',
    type: '記念日',
    countries: ['全世界'],
    established: 1681,
    relatedHistory: '世界倫理法制定',
    description: '統合暦1681年の世界倫理法制定を記念する日。生命、人工存在、人体改変など、未来文明における倫理について考える日。'
},

{
    id: 'hubert-cat-health-day',
    month: 10,
    day: 10,
    name: '猫の健康の日',
    type: '文化行事',
    countries: ['ヒューバート'],
    description: '猫と長く暮らすための健康管理を考える日。猫の健康診断や飼育に関する情報が各地で共有される。'
},

{
    id: 'niporan-tea-day',
    month: 10,
    day: 10,
    name: 'お茶の日',
    type: '食文化記念日',
    countries: ['ニポラン'],
    description: '日々の暮らしに根付いたお茶の文化を楽しむ日。各地で様々なお茶が楽しまれ、茶にまつわる催しも行われる。'
},

{
    id: 'yuretsuea-antique-tool-day',
    month: 10,
    day: 10,
    name: '古道具の日',
    type: '文化記念日',
    countries: ['ユーレツェア'],
    description: '長い間使われてきた古い道具に目を向ける日。古道具の展示や修理、使い方の紹介などが行われる。'
},

{
    id: 'wonhead-stall-day',
    month: 10,
    day: 10,
    name: '屋台の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: 'ヲンヘードの街に根付く屋台文化を楽しむ日。各地に屋台が並び、様々な料理を気軽に楽しむことができる。'
},

{
    id: 'wonhead-carbohydrate-week',
    month: 10,
    day: 15,
    name: '炭水化物ウイーク',
    type: '食文化行事',
    countries: ['ヲンヘード'],
    description: '米、パン、麺、餅、芋、粉ものなど、様々な炭水化物を楽しむ期間。期間中は主食を使った料理が特に盛んに楽しまれる。'
},

{
    id: 'bernea-coexistence-day',
    month: 10,
    day: 20,
    name: '共生の日',
    type: '文化行事',
    countries: ['ベルネア'],
    description: '生物を単なる管理対象ではなく共生体として捉えるベルネアの思想を祝う日。環境ドームでは生物と人間の関係を学ぶ催しが行われる。'
},

{
    id: 'wonhead-sauce-day',
    month: 10,
    day: 20,
    name: 'ソースの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '料理の味を引き立てる様々なソースを楽しむ日。地域ごとのソースや家庭独自の味が紹介される。'
},

{
    id: 'wonhead-carbohydrate-parade',
    month: 10,
    day: 21,
    name: '炭水化物パレード',
    type: '食文化行事',
    countries: ['ヲンヘード'],
    description: '米、パン、麺、餅、芋、粉ものなど、様々な主食が一堂に集まるヲンヘードの食文化行事。各地で料理が振る舞われ、街中が食文化で賑わう。'
},

{
    id: 'wonhead-seasoning-day',
    month: 10,
    day: 22,
    name: '調味料の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '塩や香辛料、各種調味料など、料理を支える味の文化を楽しむ日。様々な調味料と料理の組み合わせが紹介される。'
},

{
    id: 'garhyura-dark-city-competition',
    month: 10,
    day: 31,
    name: '四暗都市競技開催日',
    type: '国家行事',
    countries: ['ガルヒューラ'],
    description: 'ガルヒューラの四暗都市で大規模な競技が開催される日。強さを重視する国家思想を象徴する行事であり、国内外から危険視されている。'
},

{
    id: 'chirildo-ice-sculpture-festival',
    month: 11,
    day: 3,
    name: '氷彫刻祭',
    type: '祭り',
    countries: ['チリルド・アイルツア'],
    description: '雪氷変換技術から発展した氷彫刻文化を祝う祭り。都市各地に氷の建築物や彫刻が展示される。'
},

{
    id: 'wonhead-fish-day',
    month: 11,
    day: 3,
    name: '魚の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '魚を使った様々な料理を楽しむ日。地域ごとの魚料理や保存食などが紹介される。'
},

{
    id: 'wonhead-vegetable-day',
    month: 11,
    day: 5,
    name: '野菜の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々な野菜と、それを使った料理を楽しむ日。家庭や料理店で多様な野菜料理が作られる。'
},

{
    id: 'wonhead-egg-day',
    month: 11,
    day: 7,
    name: '卵の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々な卵料理を楽しむ日。昔ながらの料理から新しい料理まで、多様な卵料理が食卓に並ぶ。'
},

{
    id: 'world-food-day',
    month: 11,
    day: 11,
    name: '世界食の日',
    type: '国際行事',
    countries: ['全世界'],
    established: 1237,
    relatedHistory: '世界食の日制定',
    description: '食文化の保存と発展を目的とした国際的な記念日。各国の料理や食文化が世界規模で交流する。'
},

{
    id: 'hubert-cat-festival',
    month: 11,
    day: 11,
    name: '猫祭り',
    type: '文化行事',
    countries: ['ヒューバート'],
    description: '猫と人々の暮らしを楽しむヒューバートの文化行事。猫を題材とした展示や催しが各地で行われる。'
},

{
    id: 'orgaron-art-exchange-day',
    month: 11,
    day: 11,
    name: '作品交換の日',
    type: '文化行事',
    countries: ['オルガロン'],
    description: '自分が作った作品を誰かと交換し、創作を通じて人と人が繋がる日。絵や音楽、工芸品など様々な作品が交換される。'
},

{
    id: 'fumora-sky-walk-day',
    month: 11,
    day: 11,
    name: '空中散歩の日',
    type: '文化行事',
    countries: ['フーモラ・スカイピル'],
    description: '空中都市を歩きながら景色を楽しむ日。普段とは違う経路を歩いたり、都市の高所から景観を楽しんだりする。'
},

{
    id: 'wonhead-chopsticks-day',
    month: 11,
    day: 11,
    name: '箸の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '食事を支える道具である箸に目を向ける日。様々な箸や食文化について紹介される。'
},

{
    id: 'tasumenio-faraway-day',
    month: 11,
    day: 11,
    name: '遠くへ行く日',
    type: '文化行事',
    countries: ['タスメニオ'],
    description: '遠く離れた場所へ赴き、新しい土地を見ることを楽しむ日。旅行や地域間交流が盛んに行われる。'
},

{
    id: 'niporan-rice-cracker-day',
    month: 11,
    day: 11,
    name: '米菓の日',
    type: '食文化記念日',
    countries: ['ニポラン'],
    description: '米から作られる様々な菓子を楽しむ日。地域ごとの米菓や家庭で親しまれてきた味が紹介される。'
},

{
    id: 'wonhead-stew-day',
    month: 11,
    day: 1,
    name: '煮込みの日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '時間をかけて具材を煮込む料理を楽しむ日。家庭や料理店で様々な煮込み料理が作られる。'
},

{
    id: 'wonhead-hotpot-day',
    month: 12,
    day: 12,
    name: '鍋の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '様々な具材を一つの鍋で囲んで食べる文化を楽しむ日。家庭や食堂で多種多様な鍋料理が作られる。'
},

{
    id: 'wonhead-dessert-day',
    month: 12,
    day: 12,
    name: '甘味の日',
    type: '食文化記念日',
    countries: ['ヲンヘード'],
    description: '菓子や果物などの甘味を楽しむヲンヘードの食文化記念日。様々な甘味が作られ、人々に振る舞われる。'
},

{
    id: 'svh-foundation-day',
    month: 12,
    day: 1,
    name: 'S.V.H.設立記念日',
    type: '記念日',
    countries: ['ニポラン', '全世界'],
    established: 2015,
    relatedHistory: '世界変異体対策総本部（SVH）設立',
    description: '統合暦2015年に設立された世界変異体対策総本部（S.V.H.）を記念する日。関西変異災害を教訓として、変異体への国際的な対応を確認する。'
},

{
    id: 'kansai-mutation-disaster-memorial',
    month: 12,
    day: 20,
    name: '関西変異災害追悼日',
    type: '追悼日',
    countries: ['ニポラン', '全世界'],
    established: 2014,
    relatedHistory: '関西変異災害',
    description: '統合暦2014年に発生した関西変異災害の犠牲者を追悼し、その教訓を後世へ伝える日。'
},

{
    id: 'kyuma-discovery-day',
    month: 12,
    day: 20,
    name: '発見の日',
    type: '文化記念日',
    countries: ['キューマ'],
    description: '新たなものを発見する喜びを分かち合う日。発掘や研究、探検によって得られた発見が紹介される。'
},

{
    id: 'wonheado-world-food-festival',
    month: 12,
    day: 25,
    name: '世界料理祭',
    type: '国際行事',
    countries: ['ヲンヘード'],
    description: '世界各地の料理と食文化が集まるヲンヘード最大級の食文化行事。料理を通じて人々が交流する。'
},

{
    id: 'sanld-festival',
    month: 12,
    day: 31,
    name: '双輝祭',
    type: '祭り',
    countries: ['サンルド'],
    description: '黄金の道化師と白金の魔術師が象徴的にぶつかり合う、サンルド最大の祭典。黄金・白金・調律の三極が一年の終わりに交差する。'
},

{
    id: 'world-halloween',
    month: 10,
    day: 31,
    name: 'ハロウィーン',
    type: '祭り',
    countries: ['全世界'],
    description: '古くから続く秋の祭り。仮装や飾り付け、菓子などを楽しむ文化として現代まで受け継がれている。'
},

{
    id: 'world-christmas',
    month: 12,
    day: 25,
    name: 'クリスマス',
    type: '祭り',
    countries: ['全世界'],
    description: '古くから続く冬の祝祭。家族や友人と過ごしたり、贈り物を交換したり、街を飾り付けたりする文化が現代まで受け継がれている。'
},

{
    id: 'orgaron-valberg-day',
    month: 10,
    day: 24,
    name: 'バルベルク',
    type: '文化行事',
    countries: ['オルガロン'],
    description: 'オルガロンに伝わる芸術と創作の祭典。街中が作品や装飾で彩られ、人々が自由な表現を楽しむ。'
},

{
    id: 'orgaron-altar-day',
    month: 1,
    day: 20,
    name: '祭壇の日',
    type: '文化行事',
    countries: ['オルガロン'],
    description: '歯車戦争期に作られた「血の祭壇」と、その地に残る古い伝承に由来するオルガロンの年中行事。現在では祭壇そのものを崇拝するものではなく、歴史や伝承を振り返る文化的な行事として受け継がれている。'
},

    // ↓ 新しいイベントはこの下にコピペして追加していってください
    // ,{
    //     id: '',
    //     month: ,
    //     day: ,
    //     name: '',
    //     type: '',
    //     countries: [''],
    //     description: ''
    // }

];