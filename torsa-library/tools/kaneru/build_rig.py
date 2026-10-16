"""カネルの絵（1枚のSVG）を、動かすための部品データ（rig）に分ける。
使い方: python3 build_rig.py カネル.svg rig-raw.json [目を閉じた頭.svg]
  3つめの目を閉じた頭のSVG（頭のレイヤーだけを書き出したもの）があれば、その中の閉じた目（CLOSED_EYES）を
  まばたき用の部品 eyesClosed として足します。頭の絵と同じ大きさ・同じ位置で書き出したものを使ってください。
  そのあと  node ../rig/measure.js rig-raw.json rig-bbox.json  （部品の大きさを測る）
  さいごに  python3 finish_rig.py rig-bbox.json ../../kaneru/rig.json

- 「何番目のグループが何の部品か」は下の PARTS の表で決めています。
  番号は「いちばん外側から数えて何番目か」を . でつないだもの（中身が1つだけのグループは飛ばして数える）。
  絵を描き直してレイヤーの順番や数が変わったら、この表を直してください。
- 中身が空のパス（d=""）と、使われていないグラデーションは捨てます。数字は小数2けたに丸めます（軽くするため）。
"""
import sys, re, json, copy
from lxml import etree

SVG = "http://www.w3.org/2000/svg"
src, out = sys.argv[1:3]
closed_src = sys.argv[3] if len(sys.argv) > 3 else None
CLOSED_EYES = "0.13"     # 目を閉じた頭のSVGの中で、閉じた目（まつげ・まゆ）のグループの番号
HEAD_OFFSET = (105.6977, 0)  # 目を閉じた頭のSVGの左上が、カネルの絵のどこにあたるか（頭のレイヤーの左上）
root = etree.parse(src).getroot()
DEFS = {e.get("id"): e for e in root.find("{%s}defs" % SVG)}

def kids(e): return [k for k in e if isinstance(k.tag, str) and k.tag != "{%s}defs" % SVG]
def collapse(e):
    while e.tag == "{%s}g" % SVG:
        k = kids(e)
        if len(k) == 1 and k[0].tag == "{%s}g" % SVG: e = k[0]
        else: break
    return e
def find(idx):
    e = collapse(root)
    for i in idx.split("."): e = collapse(kids(e)[int(i)])
    return e

# 部品の切り分け（上から順に、奥→手前）。名前, 元の絵の番号, 動かす骨
PARTS = [
    ("wingR",     ["0.0.0"],                      "wingR"),    # 右の翼（画面の右・上）
    ("wingR2",    ["0.0.1"],                      "wingR2"),   # 右の翼（下）
    ("wingL",     ["0.0.2.0"],                    "wingL"),    # 左の翼（画面の左・上）
    ("wingL2",    ["0.0.2.1"],                    "wingL2"),   # 左の翼（下）
    ("capeBack",  ["0.1"],                        "body"),     # マントの裏地（紫）
    ("armL",      ["0.2"],                        "armL"),     # 腕（画面の左）
    ("legs",      ["0.3"],                        "root"),     # 脚と靴
    ("claw",      ["0.4"],                        "body"),     # 赤い爪の手
    ("torso",     ["0.5"],                        "body"),     # からだ
    ("armR",      ["0.6"],                        "armR"),     # 腕（画面の右）
    ("capeL",     ["0.7.0", "0.7.1", "0.7.2", "0.7.3"], "capeL"),  # マントのすそ（左）
    ("capeR",     ["0.7.10", "0.7.11", "0.7.12", "0.7.13"], "capeR"),  # マントのすそ（右）
    ("shoulderR", ["0.7.14", "0.7.15"],           "body"),     # マントの肩（右）
    ("shoulderL", ["0.7.16", "0.7.17"],           "body"),     # マントの肩（左）
    ("hoodIn",    ["0.11.1"],                     "head"),     # フードの内側
    ("collar",    ["0.11.0"] + ["0.11.%d" % i for i in range(2, 12)], "body"),  # フード・襟・リボン・宝石
    ("hairBack",  ["0.12.0", "0.12.1"],           "head"),     # 後ろ髪
    ("face",      ["0.12.2", "0.12.3"],           "head"),     # 顔
    ("whites",    ["0.12.4"],                     "head"),     # 白目（まばたきのときは消す）
    ("nose",      ["0.12.5", "0.12.6", "0.12.7", "0.12.8"], "head"),  # 鼻・口
    ("eyes",      ["0.12.9"],                     "head"),     # 目（ひとみ）
    ("ear",       ["0.12.10"],                    "ear"),      # とがった耳
    ("ahoge",     ["0.12.11"],                    "ahoge"),    # 赤いアホ毛
    ("bangs",     ["0.12.12"],                    "head"),     # 前髪
    ("locks",     ["0.12.13"],                    "locks"),    # 赤い横髪
    ("lockFront", ["0.12.14"],                    "lockFront"),# 赤い前髪のひと房
    ("blush",     ["0.12.15"],                    "head"),     # 顔のかげ
    ("lashes",    ["0.12.16.0.0", "0.12.16.1.0"], "head"),     # まつげ（上と下。まばたきのときは下へつぶす）
    ("brows",     ["0.12.16.0.1", "0.12.16.1.1"], "head"),     # まゆ
]

DROP = {"data-paper-data", "style", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit"}
def clean(e):
    return {k: v for k, v in e.attrib.items() if k not in DROP and not (k == "stroke-linejoin" and v == "miter") and not (k == "stroke-linecap" and v == "butt")}
num = re.compile(r"-?\d+\.\d{3,}")
def shrink(s): return num.sub(lambda m: ("%.2f" % float(m.group())).rstrip("0").rstrip("."), s)

def ser(e):
    e = copy.deepcopy(e)
    for x in list(e.iter()):
        if not isinstance(x.tag, str): continue
        if x.tag == "{%s}path" % SVG and not (x.get("d") or "").strip(): x.getparent().remove(x); continue
        a = clean(x); x.attrib.clear(); x.attrib.update(a)
    # 空になったグループを捨てる
    changed = True
    while changed:
        changed = False
        for g in list(e.iter("{%s}g" % SVG)):
            if g is not e and len(g) == 0: g.getparent().remove(g); changed = True
    s = etree.tostring(e, encoding="unicode")
    s = re.sub(r'\sxmlns(:\w+)?="[^"]*"', "", s)
    return shrink(s)

def chain(el):
    out = []; p = el.getparent()
    while p is not None and p is not root:
        out.append(p); p = p.getparent()
    return list(reversed(out))

def wrap(el):
    inner = ser(el)
    for p in reversed(chain(el)):
        attrs = " ".join(f'{k}="{v}"' for k, v in clean(p).items())
        inner = f"<g {attrs}>{inner}</g>" if attrs else f"<g>{inner}</g>"
    return inner

parts = []
for pid, idx, bone in PARTS:
    body = "".join(wrap(find(i)) for i in idx)
    body = re.sub(r"<g>(<g[ >].*?</g>)</g>", r"\1", body) if False else body
    ids = sorted(set(re.findall(r"url\(#([^)]+)\)", body)), key=lambda x: int(re.sub(r"\D", "", x) or 0))
    defs = ""
    for i in ids:
        d = ser(DEFS[i]); defs += d.replace(f'id="{i}"', f'id="{pid}-{i}"')
        body = body.replace(f"url(#{i})", f"url(#{pid}-{i})")
    if not re.search(r"<path", body): print("空の部品:", pid); continue
    parts.append({"id": pid, "bone": bone, "defs": defs, "body": body})

if closed_src:
    croot = etree.parse(closed_src).getroot()
    CDEFS = {e.get("id"): e for e in croot.find("{%s}defs" % SVG)}
    def cfind(idx):
        e = collapse(croot)
        for i in idx.split("."): e = collapse(kids(e)[int(i)])
        return e
    el = cfind(CLOSED_EYES)
    def cchain(el):
        out_ = []; p = el.getparent()
        while p is not None and p is not croot: out_.append(p); p = p.getparent()
        return list(reversed(out_))
    inner = ser(el)
    for p in reversed(cchain(el)):
        attrs = " ".join(f'{k}="{v}"' for k, v in clean(p).items())
        inner = f"<g {attrs}>{inner}</g>" if attrs else f"<g>{inner}</g>"
    body = f'<g transform="translate({HEAD_OFFSET[0]} {HEAD_OFFSET[1]})">{inner}</g>'
    ids = sorted(set(re.findall(r"url\(#([^)]+)\)", body)))
    defs = ""
    for i in ids:
        defs += ser(CDEFS[i]).replace(f'id="{i}"', f'id="eyesClosed-{i}"'); body = body.replace(f"url(#{i})", f"url(#eyesClosed-{i})")
    parts.append({"id": "eyesClosed", "bone": "head", "defs": defs, "body": body})

w, h = float(root.get("width")), float(root.get("height"))
json.dump({"size": [w, h], "parts": parts}, open(out, "w"), ensure_ascii=False)
print(len(parts), "部品", sum(len(p["defs"]) + len(p["body"]) for p in parts), "文字")
