# トルサ図書館：棟ごとの色の部品を作る
#   python3 tools/theme/make_themes.py
# assets/parts/ の部品（と星空）の色を、themes.json の決まりで塗りかえて、assets/themes/<棟>/ に書き出します。
# 部品を描き直したら、これをもう一度動かすと、どの棟の部品も新しい絵で作り直されます。
import json, os, re, colorsys, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cfg = json.load(open(os.path.join(ROOT, 'tools/theme/themes.json'), encoding='utf-8'))

def hls(hexc):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    h, l, s = colorsys.rgb_to_hls(r, g, b); return h * 360, l, s
def tohex(h, l, s):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, max(0, min(1, l)), max(0, min(1, s)))
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255))
def inrange(v, rg, wrap=False):
    if rg is None: return True
    a, b = rg
    if wrap and a > b: return v >= a or v <= b
    return a <= v <= b
def recolor(hexc, ops):
    h, l, s = hls(hexc)
    for op in ops:
        if not (inrange(h, op.get('h'), True) and inrange(s, op.get('s')) and inrange(l, op.get('l'))): continue
        st = op.get('set', {})
        if 'h' in st: h = st['h']
        h += st.get('dh', 0); s = s * st.get('sm', 1) + st.get('ds', 0); l = l * st.get('lm', 1) + st.get('dl', 0)
        if 'sv' in st: s = st['sv']
        if 'blend' in st:
            bh, bl, bs = hls(st['blend']); t = st.get('t', .3)
            r1 = colorsys.hls_to_rgb((h % 360) / 360, max(0, min(1, l)), max(0, min(1, s))); r2 = colorsys.hls_to_rgb(bh / 360, bl, bs)
            mix = [a + (b - a) * t for a, b in zip(r1, r2)]; return '#%02x%02x%02x' % tuple(round(max(0, min(1, x)) * 255) for x in mix)
        return tohex(h, l, s)
    return hexc
def prune_defs(svg):
    # 使っていないグラデーションを消して、ファイルを小さくする
    used = set(re.findall(r'url\(#([^)]+)\)', svg)) | set(re.findall(r'href="#([^"]+)"', svg))
    def keep(m):
        i = re.search(r'id="([^"]+)"', m.group(0)); return m.group(0) if (not i or i.group(1) in used) else ''
    return re.sub(r'<(linearGradient|radialGradient)\b[^>]*>.*?</\1>', keep, svg, flags=re.S)

made = 0
for theme, tcfg in cfg['themes'].items():
    out = os.path.join(ROOT, 'assets/themes', theme); os.makedirs(out, exist_ok=True)
    for grp in tcfg['groups']:
        srcs = [(p, f'assets/parts/{p}.svg') for p in grp.get('parts', [])] + [(x['name'], x['src']) for x in grp.get('files', [])]
        for name, rel in srcs:
            svg = open(os.path.join(ROOT, rel), encoding='utf-8').read()
            svg = re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: recolor(m.group(0).lower(), grp['ops']), svg)
            svg = prune_defs(svg)
            open(os.path.join(out, f'{name}.svg'), 'w', encoding='utf-8').write(svg); made += 1
print(f'{made} 個の部品を作りました')
