# 禁書庫の部品（鉄の本棚・石の床・鉄格子の窓・石の天井）を描くプログラム。使い方：python3 tools/theme/draw_vault_parts.py .（トルサ図書館のフォルダで）
import sys, math, random
T = sys.argv[1]
f = lambda n: f"{n:.1f}".rstrip('0').rstrip('.')
def w(name, s): open(f'{T}/assets/parts/{name}.svg', 'w', encoding='utf-8').write(s)

# 1) 鉄の本棚（bookcase_b2 と同じ大きさ 343.58×522.81。段の高さも同じなので、本の置き場所がそのまま合う）
random.seed(3)
W, H = 343.58, 522.81
rows = [155, 238, 321, 404, 487]
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs>',
     '<linearGradient id="gW" x1="0" x2="1"><stop offset="0" stop-color="#140c10"/><stop offset=".5" stop-color="#2a1a20"/><stop offset="1" stop-color="#140c10"/></linearGradient>',
     '<linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6472"/><stop offset=".5" stop-color="#3e3946"/><stop offset="1" stop-color="#25212b"/></linearGradient>',
     '<linearGradient id="gIv" x1="0" x2="1"><stop offset="0" stop-color="#25212b"/><stop offset=".5" stop-color="#5a5462"/><stop offset="1" stop-color="#25212b"/></linearGradient>',
     '<linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".25" stop-color="#000" stop-opacity="0"/></linearGradient></defs>']
s.append(f'<ellipse cx="{W/2}" cy="{H-4}" rx="{W/2+6}" ry="9" fill="#000" opacity=".45"/>')
s.append(f'<rect x="14" y="44" width="{W-28}" height="{H-56}" fill="url(#gW)"/><rect x="26" y="60" width="{W-52}" height="{H-80}" fill="#07050a"/>')
spines = ['#2a1416', '#1f1a24', '#2a2016', '#161a22', '#26121c', '#1c1418']
for ri, by in enumerate(rows):
    x = 30; col = spines[ri % len(spines)]
    while x < W - 32:
        bw = 13 + (3 if random.random() < .18 else 0); bh = 60 + random.choice([0, 0, 0, 3])
        s.append(f'<rect x="{f(x)}" y="{f(by-bh)}" width="{f(bw-1)}" height="{bh}" fill="{col}"/><rect x="{f(x+2)}" y="{f(by-bh+7)}" width="{f(bw-5)}" height="1.6" fill="#7a6a4a" opacity=".55"/><rect x="{f(x+2)}" y="{f(by-12)}" width="{f(bw-5)}" height="1.4" fill="#7a6a4a" opacity=".4"/><rect x="{f(x)}" y="{f(by-bh)}" width="2.4" height="{bh}" fill="#000" opacity=".45"/>')
        x += bw
    s.append(f'<rect x="26" y="{by-83}" width="{W-52}" height="40" fill="url(#gB)"/>')
    s.append(f'<rect x="18" y="{by}" width="{W-36}" height="9" fill="url(#gI)"/>')
    for k in range(30, int(W) - 20, 26): s.append(f'<circle cx="{k}" cy="{by+4.5}" r="1.8" fill="#9a92a2"/>')
# 鉄の枠・冠・角の金具
s.append(f'<rect x="8" y="40" width="20" height="{H-46}" fill="url(#gIv)"/><rect x="{W-28}" y="40" width="20" height="{H-46}" fill="url(#gIv)"/>')
s.append(f'<rect x="2" y="30" width="{W-4}" height="22" rx="2" fill="url(#gI)"/><rect x="2" y="{H-20}" width="{W-4}" height="16" fill="url(#gI)"/>')
s.append(f'<path d="M{W/2-60} 30 L{W/2} 6 L{W/2+60} 30Z" fill="#3e3946" stroke="#6a6472" stroke-width="2"/><circle cx="{W/2}" cy="22" r="7" fill="#8e2f36" stroke="#5e1a22" stroke-width="2"/>')
for (x, y, sx, sy) in [(8, 40, 1, 1), (W - 8, 40, -1, 1), (8, H - 20, 1, -1), (W - 8, H - 20, -1, -1)]:
    s.append(f'<path transform="translate({f(x)} {f(y)}) scale({sx} {sy})" d="M0 0h34l-8 8h-18v18l-8 8z" fill="#7a7282"/>')
for y in range(60, int(H) - 30, 34):
    s.append(f'<circle cx="18" cy="{y}" r="2.2" fill="#9a92a2"/><circle cx="{f(W-18)}" cy="{y}" r="2.2" fill="#9a92a2"/>')
s.append('</svg>')
w('grim_shelf', ''.join(s))

# 2) 石の床（carpet と同じ大きさ 722×164.46。下端が床の下）
random.seed(9)
W, H = 722, 164.46
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs><linearGradient id="fG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2430"/><stop offset="1" stop-color="#0e0b11"/></linearGradient></defs>']
s.append(f'<rect width="{W}" height="20" fill="#1a1520"/><rect y="16" width="{W}" height="{H-16}" fill="url(#fG)"/>')
y, rh = 20, 22
while y < H:
    x = -random.random() * 60
    while x < W:
        ww = 70 + random.random() * 60; sh = 30 + int(random.random() * 14) - int((y / H) * 16)
        s.append(f'<rect x="{f(x+1.5)}" y="{f(y+1.5)}" width="{f(ww-3)}" height="{f(rh-3)}" rx="2" fill="rgb({sh+6},{sh},{sh+10})"/>')
        if random.random() < .12: s.append(f'<ellipse cx="{f(x+ww/2)}" cy="{f(y+rh/2)}" rx="{f(ww*.3)}" ry="{f(rh*.25)}" fill="#5a1a2a" opacity=".35"/><ellipse cx="{f(x+ww/2-4)}" cy="{f(y+rh/2-2)}" rx="{f(ww*.12)}" ry="1.6" fill="#e07a8e" opacity=".25"/>')
        x += ww
    y += rh; rh += 4
s.append(f'<rect width="{W}" height="3" fill="#4a4250"/></svg>')
w('stone_floor', ''.join(s))

# 3) 鉄格子の窓（window と同じ大きさ・同じ枠の位置。中は赤い光と、封をされた本棚の影）
s = ['<svg xmlns="http://www.w3.org/2000/svg" width="475" height="560" viewBox="300 290 475 560"><defs>',
     '<clipPath id="vgC"><path d="M42.8 424.8v-272c0-108.8 65.7-174.1 197.2-195.8 131.5 21.8 197.2 87 197.2 195.8v272z"/></clipPath>',
     '<radialGradient id="vgR" cx="240" cy="210" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff5a7a"/><stop offset=".35" stop-color="#9a1e3a"/><stop offset="1" stop-color="#1a060c"/></radialGradient>',
     '<linearGradient id="vgS" x1="0" x2="1"><stop offset="0" stop-color="#2a2530"/><stop offset=".5" stop-color="#5a5262"/><stop offset="1" stop-color="#2a2530"/></linearGradient>',
     '<linearGradient id="vgB" x1="0" x2="1"><stop offset="0" stop-color="#1a1820"/><stop offset=".5" stop-color="#4a4452"/><stop offset="1" stop-color="#1a1820"/></linearGradient></defs>',
     '<g transform="translate(304,398)"><g clip-path="url(#vgC)">',
     '<rect x="36" y="-60" width="408" height="500" fill="url(#vgR)"/>']
for k in range(5):  # 奥の本棚の影
    x = 60 + k * 76; s.append(f'<rect x="{x}" y="80" width="62" height="330" fill="#14060c" opacity=".7"/>' + ''.join(f'<rect x="{x+4}" y="{y}" width="54" height="3" fill="#2a0a14"/>' for y in range(120, 400, 46)))
s.append('<ellipse cx="240" cy="200" rx="90" ry="120" fill="#ffb0c0" opacity=".18"/>')
for k in range(9): s.append(f'<rect x="{58 + k*45}" y="-60" width="11" height="490" fill="url(#vgB)"/>')
for y in (40, 170, 300): s.append(f'<rect x="36" y="{y}" width="408" height="12" fill="url(#vgB)"/>' + ''.join(f'<circle cx="{63 + k*45}" cy="{y+6}" r="4" fill="#8a8292"/>' for k in range(9)))
s.append('<circle cx="240" cy="176" r="26" fill="#3a0a14" stroke="#c9584f" stroke-width="4"/><path d="M240 160v32M228 168l24 16M252 168l-24 16" stroke="#ff8a9a" stroke-width="3" stroke-linecap="round"/>')
s.append('</g>')
s.append('<path d="M42.8 424.8v-272c0-108.8 65.7-174.1 197.2-195.8 131.5 21.8 197.2 87 197.2 195.8v272" fill="none" stroke="url(#vgS)" stroke-width="22"/>')
for k in range(15):
    t = k / 14; a = math.pi * (1 - t); x = 240 + math.cos(a) * 197; y = 152.8 - math.sin(a) * 196
    s.append(f'<path d="M{f(x)} {f(y)}l{f(math.cos(a)*-6)} {f(math.sin(a)*6)}" stroke="#141118" stroke-width="2"/>')
s.append('<path d="M224 -66h32l-4 28h-24z" fill="#5a5262" stroke="#2a2530" stroke-width="2"/>')
s.append('<rect x="22.4" y="424.8" width="435.2" height="20.4" fill="#2e2834"/></g></svg>')
w('vault_gate', ''.join(s))

# 4) 石の天井（星空のかわり。sky.svg と同じ横長の比率）
random.seed(21)
W, H = 1444, 602
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050407"/><stop offset=".7" stop-color="#15111a"/><stop offset="1" stop-color="#1e1824"/></linearGradient><linearGradient id="cR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1a22"/><stop offset="1" stop-color="#3a3442"/></linearGradient></defs>']
s.append(f'<rect width="{W}" height="{H}" fill="url(#cG)"/>')
for y in range(60, H, 40):
    x = -(y % 80)
    while x < W:
        ww = 60 + random.random() * 50; sh = 14 + int(random.random() * 10) + int(y / H * 12)
        s.append(f'<rect x="{f(x+2)}" y="{y+2}" width="{f(ww-4)}" height="36" rx="2" fill="rgb({sh+4},{sh},{sh+8})"/>'); x += ww
for k in range(-1, 6):  # 交差するアーチのリブ
    x = k * 300
    s.append(f'<path d="M{x} 230Q{x+150} -70 {x+300} 230" fill="none" stroke="url(#cR)" stroke-width="22"/><path d="M{x+6} 236Q{x+150} -50 {x+294} 236" fill="none" stroke="#0a080d" stroke-width="4" opacity=".7"/>')
    s.append(f'<path d="M{x+139} 70h22l-3 18h-16z" fill="#4a4250"/>')
s.append(f'<rect y="226" width="{W}" height="14" fill="#2a2530"/><rect y="238" width="{W}" height="3" fill="#08070b"/>')
for k in range(14):  # しみ
    x = random.random() * W; s.append(f'<path d="M{f(x)} {240 + random.random()*40}q{f(random.random()*6-3)} 60 0 {f(80+random.random()*80)}" stroke="#3a1820" stroke-width="{f(3+random.random()*4)}" opacity=".5" fill="none" stroke-linecap="round"/>')
s.append('</svg>')
w('vault_ceiling', ''.join(s))
print('ok')
