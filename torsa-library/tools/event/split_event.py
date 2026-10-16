#!/usr/bin/env python3
"""イベント絵（いただいた1枚のSVG）を、動かすための「部品ごとのレイヤー」に分けて、1つのSVGファイルにまとめる。

  python3 tools/event/split_event.py 元の絵.svg assets/events/vault-fall.svg

- できあがるファイルは、元の絵と同じ大きさのキャンバスに、部品ごとに名前（id）のついたレイヤーが並んだもの。
  Inkscape などで開くとレイヤーの一覧に部品名が出るので、レイヤーごとに描き直せます。
  サイトは id で部品を見つけるので、レイヤーの id（leaf_back など）は変えないでください。
- 汗（fx_sweat）と照れ線（fx_lines）は、イベント用に描き足したレイヤーです（EXTRA）。
- 「何番目のグループが何の部品か」は下の PARTS の表で決めている。元の絵のレイヤーの順番や数を
  変えたときは、この表を合わせて直す。番号は「いちばん外側から数えて何番目か」を . でつないだもの
  （1つしか中身のないグループは飛ばして数える）。
"""
import sys, re, copy, os
from xml.etree import ElementTree as ET

SVG = "http://www.w3.org/2000/svg"
XL = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", XL)
N = lambda t: "{%s}%s" % (SVG, t)

# 部品名: [元の絵の中の番号, ...]  （上から順に、奥→手前）
PARTS = [
    ("leaf_back",       ["0"]),                    # 奥の葉（左下）
    ("coat_back",       [str(i) for i in range(1, 9)]),  # 腕・マントの内側・上着のすそ
    ("legs",            ["9"]),                    # 脚と靴
    ("shirt",           ["10", "11", "12", "13"]),  # シャツ・ベルト・ひも
    ("neck_shade",      ["14"]),                   # 顔のうしろのかげ
    ("hair_back",       ["15.0"]),                 # 後ろ髪
    ("lock_back_l",     ["15.1"]),                 # 後ろの横髪（左）
    ("lock_back_r",     ["15.2"]),                 # 後ろの横髪（右）
    ("ear_l",           ["16.0"]),                 # 耳（画面の左）
    ("ear_r",           ["16.1"]),                 # 耳（画面の右）
    ("horn_r",          ["16.2"]),                 # 角（画面の右）
    ("horn_l",          ["16.3"]),                 # 角（画面の左）
    ("face",            ["16.4", "16.5", "16.6"]), # 顔
    ("cape_shoulder_l", ["17"]),                   # マントの肩（左）
    ("cape_shoulder_r", ["18"]),                   # マントの肩（右）
    ("collar",          ["19"]),                   # 口元をかくす襟
    ("brooch",          ["20"]),                   # ブローチとリボン
    ("lock_r",          ["21"]),                   # 横髪（右）
    ("lock_l",          ["22"]),                   # 横髪（左）
    ("hair_front",      ["23.0", "23.1", "23.2", "23.3", "23.4"]),  # 前髪
    ("ahoge",           ["23.5"]),                 # アホ毛
    ("eye_r",           ["23.6.0", "23.6.2"]),     # 目（画面の右）
    ("eye_l",           ["23.6.1", "23.6.3"]),     # 目（画面の左）
    ("blush",           [str(i) for i in range(24, 36)]),  # 頬の赤み
    ("cape_r",          ["36"]),                   # マントのすそ（右）
    ("cape_l",          ["37"]),                   # マントのすそ（左）
    ("leaf_right",      ["38"]),                   # 手前の葉（右）
    ("leaf_top",        ["39"]),                   # 手前の葉（上）
    ("leaf_left",       ["40"]),                   # 手前の葉（左）
]

def kids(e):
    return [k for k in e if k.tag != N("defs")]

def collapse(e, chain):
    while e.tag == N("g"):
        k = kids(e)
        if len(k) == 1 and k[0].tag == N("g"):
            chain.append(e); e = k[0]
        else:
            break
    return e

def find(root, idx):
    chain = []
    e = collapse(root, chain)
    for i in idx.split("."):
        chain.append(e)
        e = kids(e)[int(i)]
        e = collapse(e, chain)
    return e, chain

def shallow(e):
    s = ET.Element(e.tag, dict(e.attrib)); s.text = None; return s

EXTRA = {
    "fx_sweat": ("汗（描き足し）", '''<defs><linearGradient id="fx-sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf8ff"/><stop offset="1" stop-color="#8fc8ef"/></linearGradient></defs><g stroke="#3d6f9e" stroke-width="0.7" stroke-linejoin="round"><path d="M147.5,104.5c2.6,4.2 4.8,7.2 4.8,9.7c0,2.7 -2.2,4.7 -4.8,4.7c-2.6,0 -4.8,-2 -4.8,-4.7c0,-2.5 2.2,-5.5 4.8,-9.7z" fill="url(#fx-sw)"/><path d="M139.6,117.2c1.5,2.4 2.8,4.1 2.8,5.6c0,1.6 -1.3,2.8 -2.8,2.8c-1.5,0 -2.8,-1.2 -2.8,-2.8c0,-1.5 1.3,-3.2 2.8,-5.6z" fill="url(#fx-sw)"/></g><path d="M145.6,112.4c0.3,-1.5 1,-2.8 1.6,-3.8" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/>'''),
    "fx_lines": ("照れ線（描き足し）", '''<g fill="none" stroke="#f08aa8" stroke-width="1.6" stroke-linecap="round"><path d="M70.5,110.5l6,3.2"/><path d="M68.2,118.4l6.6,1"/><path d="M70.2,126.2l6,-1.6"/><path d="M160.4,110.2l-6,3.2"/><path d="M162.7,118.1l-6.6,1"/><path d="M160.7,125.9l-6,-1.6"/></g>'''),
}
LABEL = {
    "leaf_back": "奥の葉", "coat_back": "腕・上着のすそ", "legs": "脚と靴", "shirt": "シャツ・ベルト", "neck_shade": "顔のうしろのかげ",
    "hair_back": "後ろ髪", "lock_back_l": "後ろの横髪（左）", "lock_back_r": "後ろの横髪（右）", "ear_l": "耳（左）", "ear_r": "耳（右）",
    "horn_r": "角（右）", "horn_l": "角（左）", "face": "顔", "cape_shoulder_l": "マントの肩（左）", "cape_shoulder_r": "マントの肩（右）",
    "collar": "襟", "brooch": "ブローチ", "lock_r": "横髪（右）", "lock_l": "横髪（左）", "hair_front": "前髪", "ahoge": "アホ毛",
    "eye_r": "目（右）", "eye_l": "目（左）", "blush": "頬の赤み", "cape_r": "マントのすそ（右）", "cape_l": "マントのすそ（左）",
    "leaf_right": "手前の葉（右）", "leaf_top": "手前の葉（上）", "leaf_left": "手前の葉（左）",
}
INK = "http://www.inkscape.org/namespaces/inkscape"
ET.register_namespace("inkscape", INK)

def main(src, out_path):
    tree = ET.parse(src); root = tree.getroot()
    defs = root.find(N("defs"))
    body = [k for k in root if k.tag != N("defs")]
    assert len(body) == 1, "いちばん外側のグループが1つのはず"
    top = body[0]
    out = ET.Element(N("svg"), {k: v for k, v in root.attrib.items()})
    out.append(ET.Comment(" トルサ図書館：イベントの絵。部品ごとにレイヤー（id）を分けてあります。id は変えないでください（data/events.json の parts と対応）。 "))
    if defs is not None: out.append(copy.deepcopy(defs))
    order = [n for n, _ in PARTS]
    def layer(name):
        return ET.SubElement(out, N("g"), {"id": name, "{%s}groupmode" % INK: "layer", "{%s}label" % INK: name + " " + LABEL.get(name, EXTRA.get(name, ("",))[0])})
    for name, idxs in PARTS:
        L = layer(name); made = {}
        for idx in idxs:
            el, chain = find(top, idx)
            parent = L; key = ()
            for anc in ([top] + chain[1:]) if chain and chain[0] is top else [top] + chain:
                key = key + (id(anc),)
                if key not in made:
                    made[key] = ET.SubElement(parent, anc.tag, dict(anc.attrib))
                parent = made[key]
            parent.append(copy.deepcopy(el))
        print(name, "←", ", ".join(idxs))
        # 汗と照れ線は、頬の赤みのすぐ上に入れる
        if name == "blush":
            for en, (lab, frag) in EXTRA.items():
                E = layer(en)
                for k in ET.fromstring('<g xmlns="%s">%s</g>' % (SVG, frag)): E.append(k)
                print(en, "← 描き足し")
    ET.ElementTree(out).write(out_path, encoding="unicode")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
