"""3枚のSVG（通常・照れ・目の別版）から、トルサを動かすための部品データ（rig）を作る。
使い方: python3 build_rig.py 通常.svg 照れ.svg 目違い.svg 出力.json
"""
import sys, re, json, copy
from lxml import etree

SVG = "http://www.w3.org/2000/svg"; XL = "http://www.w3.org/1999/xlink"
N = {"s": SVG}
normal_f, blush_f, flat_f, out_f = sys.argv[1:5]

def load(f):
    t = etree.parse(f); r = t.getroot()
    defs = {e.get("id"): e for e in r.find("s:defs", N)}
    top = r.find("s:g", N); layer = top.find("s:g", N)
    return r, defs, top, layer

nr, ndefs, ntop, nlayer = load(normal_f)
br, bdefs, btop, blayer = load(blush_f)
fr, fdefs, ftop, flayer = load(flat_f)
NG = list(nlayer)

# 部品の切り分け（重ねる順番どおり）。bone は動かす骨の名前
def kids(i, idx): return [list(NG[i])[k] for k in idx]
PARTS = [
    ("shoeR", [NG[0]], "root"), ("shoeL", [NG[1]], "root"),
    ("capeLiningL", [NG[2]], "root"), ("capeLiningR", [NG[3]], "root"),
    ("pants", [NG[4]], "root"),
    ("torso", [NG[5]], "body"),
    ("cuffL", [NG[6]], "body"), ("sleeveL", [NG[7]], "body"),
    ("capeL", [NG[8]], "capeL"), ("sleeveR", [NG[9]], "body"),
    ("hairBack", [NG[10]], "head"),
    ("earL", kids(11, [0]), "earL"), ("earR", kids(11, [1]), "earR"),
    ("hornR", kids(11, [2]), "hornR"), ("hornL", kids(11, [3]), "hornL"),
    ("face", kids(11, [4, 5, 6]), "head"),
    ("collarL", [NG[12]], "body"), ("collarR", [NG[13]], "body"),
    ("neck", [NG[14]], "neck"), ("brooch", [NG[15]], "neck"),
    ("lockR", [NG[16]], "lockR"), ("lockL", [NG[17]], "lockL"),
    ("hairFront", kids(18, [0, 1, 2, 3, 4]), "head"),
    ("ahoge", kids(18, [5]), "ahoge"),
    ("eyes", kids(18, [6]), "head"),
    ("eyesFlat", None, "head"),   # 目の別版（ファイル3）
    ("book", [NG[19]], "body"),
    ("capeR", [NG[20]], "capeR"),
    ("blush", None, "head"),      # 照れ（ファイル2の頬）
]
# ファイル3：目の別版は最後のグループの7番目
FG = list(flayer); flat_eyes = list(FG[20])[6:10]
# ファイル2：頬の赤みは21番目以降のパス
blush_paths = list(blayer)[21:]

def chain(el, stop):
    """el の親を stop までたどる（属性を引き継ぐため）"""
    out = []; p = el.getparent()
    while p is not None and p is not stop:
        out.append(p); p = p.getparent()
    return list(reversed(out))

DROP = {"data-paper-data", "style", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit"}
def clean_attrs(e):
    return {k: v for k, v in e.attrib.items() if k not in DROP and not (k == "stroke-linejoin" and v == "miter") and not (k == "stroke-linecap" and v == "butt")}

num = re.compile(r"-?\d+\.\d{3,}")
def shrink(s): return num.sub(lambda m: ("%.2f" % float(m.group())).rstrip("0").rstrip("."), s)

def ser(e):
    e = copy.deepcopy(e)
    for x in e.iter():
        if not isinstance(x.tag, str): continue
        a = clean_attrs(x); x.attrib.clear(); x.attrib.update(a)
    s = etree.tostring(e, encoding="unicode")
    s = re.sub(r'\sxmlns(:\w+)?="[^"]*"', "", s)
    return shrink(s)

def wrap(elems, top):
    """部品をもとの親の属性（塗り・線・位置）で包む"""
    ch = chain(elems[0], top)
    inner = "".join(ser(e) for e in elems)
    for p in reversed(ch):
        attrs = " ".join(f'{k}="{v}"' for k, v in clean_attrs(p).items())
        inner = f"<g {attrs}>{inner}</g>" if attrs else f"<g>{inner}</g>"
    return inner

def refs(s): return set(re.findall(r"url\(#([^)]+)\)", s)) | set(re.findall(r'href="#([^"]+)"', s))

def collect_defs(body, defs, prefix):
    need, seen, out = list(refs(body)), set(), []
    while need:
        i = need.pop()
        if i in seen or i not in defs: continue
        seen.add(i); d = ser(defs[i]); out.append(d); need += list(refs(d))
    # IDを部品ごとに分けて、ほかの部品とぶつからないようにする
    s = "".join(out)
    for i in seen:
        s = s.replace(f'id="{i}"', f'id="{prefix}{i}"').replace(f"url(#{i})", f"url(#{prefix}{i})").replace(f'href="#{i}"', f'href="#{prefix}{i}"')
        body = body.replace(f"url(#{i})", f"url(#{prefix}{i})").replace(f'href="#{i}"', f'href="#{prefix}{i}"')
    return s, body

parts = []
for pid, elems, bone in PARTS:
    if pid == "eyesFlat": src, defs, top = flat_eyes, fdefs, ftop
    elif pid == "blush": src, defs, top = blush_paths, bdefs, btop
    else: src, defs, top = elems, ndefs, ntop
    body = wrap(src, top)
    tx = top.get("transform")
    body = f'<g transform="{tx}">{body}</g>'
    d, body = collect_defs(body, defs, pid + "-")
    parts.append({"id": pid, "bone": bone, "defs": d, "body": body})

W = float(nr.get("width")); H = float(nr.get("height"))
json.dump({"size": [round(W, 2), round(H, 2)], "parts": parts}, open(out_f, "w"), ensure_ascii=False, separators=(",", ":"))
print("parts", len(parts), "bytes", sum(len(p["defs"]) + len(p["body"]) for p in parts))
