"""rig-bbox.json に、骨（ボーン）・表示枠・さわれる場所を足して、サイトで使う rig.json を書き出す"""
import json, sys
rig = json.load(open(sys.argv[1]))
rig["_note"] = "トルサを動かすための部品データ。parts＝部品（重ねる順）、bones＝動かす骨（pivot＝回る中心。座標は元のSVGと同じ）、frame＝画面に出す範囲[x,y,幅,高さ]、zones＝さわれる場所[x,y,幅,高さ]。作り直すときは rigbuild/build_rig.py を使う。"
rig["frame"] = [-14, -12, 171, 247]
rig["bones"] = [
    {"id": "root",  "parent": None,   "pivot": [72, 300]},
    {"id": "body",  "parent": "root", "pivot": [67, 186]},
    {"id": "neck",  "parent": "body", "pivot": [66, 68]},
    {"id": "head",  "parent": "body", "pivot": [64, 58]},
    {"id": "earL",  "parent": "head", "pivot": [54, 41]},
    {"id": "earR",  "parent": "head", "pivot": [80, 42]},
    {"id": "hornL", "parent": "head", "pivot": [53, 30]},
    {"id": "hornR", "parent": "head", "pivot": [71, 27]},
    {"id": "ahoge", "parent": "head", "pivot": [81, 15]},
    {"id": "lockL", "parent": "head", "pivot": [47, 48]},
    {"id": "lockR", "parent": "head", "pivot": [80, 47]},
    {"id": "capeL", "parent": "body", "pivot": [30, 66]},
    {"id": "capeR", "parent": "body", "pivot": [88, 101]},
]
bb = {p["id"]: p["bbox"] for p in rig["parts"]}
rig["zones"] = {
    "head":  [38, 2, 56, 30],
    "hornL": bb["hornL"], "hornR": bb["hornR"],
    "earL":  bb["earL"],  "earR":  bb["earR"],
    "nose":  [58, 42, 11, 7],
    "chest": [46, 62, 40, 13],
    "waist": [42.4, 165.8, 17.1, 24.7],
}
json.dump(rig, open(sys.argv[2], "w"), ensure_ascii=False, separators=(",", ":"))
print("ok", len(open(sys.argv[2]).read()))
