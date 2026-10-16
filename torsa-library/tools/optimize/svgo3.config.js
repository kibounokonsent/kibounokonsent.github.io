// トルサ図書館の部品を軽くする設定（色は6けたのまま残す：tools/theme/make_themes.py が6けたの色を読むため）
module.exports = { multipass: true, floatPrecision: 3, plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false, convertShapeToPath: false, mergePaths: false, convertColors: { shorthex: false, shortname: false, names2hex: true, rgb2hex: true, currentColor: false } } } }] };
