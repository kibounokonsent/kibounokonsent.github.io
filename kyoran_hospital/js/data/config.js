/* =========================================================
   狂乱病院 ARCHIVE — サイト設定
   ここを書き換えるだけで、タイトルやロゴを差し替えられます。
   ========================================================= */
const SITE = {
  title: '狂乱病院',
  subtitle: 'KYORAN HOSPITAL ARCHIVE',
  tagline: 'あなたは平常でいられるかな？',

  /* ── ロゴ画像 ───────────────────────────────
     ロゴが完成したら assets/images/logo/ に置いて、パスを書くだけ。
     空文字 '' のあいだは、文字のタイトルが表示されます。
       例) logo: 'assets/images/logo/logo.png',
     ヘッダー用に小さい版を分けたい場合は logoSmall も指定できます。 */
  logo: '',
  logoSmall: '',

  /* ── トップのロゴ（SVG・グリッチ／文字化け演出つき） ─────────
     assets/images/logo/logo.svg を差し替えるだけで、ロゴを入れ替えられます。
     SVGの中の id の付け方は logo.svg 冒頭のコメントを参照。
     空文字 '' にすると、従来の文字タイトル表示に戻ります。 */
  heroLogo: 'assets/images/logo/logo.svg',

  /* ── 演出 ──────────────────────────────────
     entryGate     : 初回アクセス時の「入院同意」画面（ネタバレモードの選択）
     sanityGauge   : 記事を開くたびに減る精神ゲージ（演出のみ）
     sanityLoss    : 記事1件あたりの減少量
     sanityDrain   : 記事を読んでいるあいだ、何秒ごとにいくつ減るか（止めるなら amount: 0）
     redactLoss    : 黒塗りを覗いたときの減少量
     corruption    : 精神ゲージが減ったときの文字化け・ノイズ・責める言葉
     zeroRot       : 精神ゲージ 0 のとき、古い記事の文字が壊れている割合（0〜1）
     destroy       : 精神ゲージ 0 のとき、古い記事を叩いて壊せる
     destroyHits   : 1件を壊すのに必要な回数
     jumpscare     : すべて壊したときのジャンプスケア（画像は jumpscareImages）
     sound         : 効果音（叩く音・扉・注射・悲鳴）。ブラウザ内で合成するので音声ファイルは不要
     soundVolume   : 音量（0〜1）
     whispers      : 背景にまれに浮かぶ囁き */
  /* entryGate を false にしたときの初期モード：'safe'（ネタバレなし） / 'spoiler'（ネタバレあり） */
  defaultMode: 'safe',

  effects: {
    entryGate: true,
    sanityGauge: true,
    sanityLoss: 6,
    sanityDrain: { seconds: 15, amount: 1 },
    redactLoss: 3,
    corruption: true,
    zeroRot: 0.22,
    destroy: true,
    destroyHits: 7,
    jumpscare: true,
    sound: true,
    soundVolume: 0.7,
    whispers: true,
  },

  /* トップページを流れる「院内放送」。空の配列 [] にすると非表示 */
  notices: [
    '本日の面会時間は終了しました',
    '院内では医師の指示に従ってください',
    '地下への立ち入りは禁止されています',
    '退院の予定はありません',
  ],

  /* 精神ゲージが 30 未満になると、画面に一瞬チラつく言葉（0 で頻度・数が増える） */
  blameTexts: [
    'お前のせいだ', 'なんで助けなかった', '見捨てたくせに', 'お前が殺した',
    '全部お前が悪い', '嘘つき', 'どうして逃げた', '許さない',
    '役立たず', 'お前さえいなければ', 'こっちを見ろ', 'ぜんぶ おまえの',
  ],

  /* すべての記録を壊したときに画面いっぱいに現れる画像（ランダムで1枚）
     focus: [横, 縦] は「顔の位置」。0〜1 の割合（左上が 0,0）。ここに向かってズームします。
     'パス' だけ書いた場合は画像の中心にズーム。 */
  jumpscareImages: [
    { src: 'assets/images/oldrange/mantis.svg',    focus: [0.11, 0.12] },
    { src: 'assets/images/oldrange/centipede.svg', focus: [0.08, 0.24] },
  ],

  whisperTexts: [
    'たすけて', 'ここからだして', 'みている', 'つぎはあなた',
    'しんさつのじかんです', 'めだまをください', 'にげられない', 'わらって',
  ],
};
