"""
龍の書のページ（world/eden/book/index.html）を、docs/ryu-no-sho.txt から作る。
本文を直したいときは ryu-no-sho.txt を書き換えて、このスクリプトを実行する：
    python3 docs/build-book.py
"""
import re, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "docs" / "ryu-no-sho.txt").read_text(encoding="utf-8").strip()

# 空行で段落に分ける（段落の中の改行はそのまま <br> にする）
paras = [p.strip("\n") for p in re.split(r"\n\s*\n", src) if p.strip()]

title, subtitle = paras[0], paras[1]
rest = paras[2:]

# 冒頭の龍の言葉（最初の章見出しまで。最後の段落は「誰の言葉か」）
CH = re.compile(r"^(第[一二三四五六七八九十]+章|終章)[\s　]+(.+)$")
i = 0
while not CH.match(rest[i]):
    i += 1
opening, attribution = rest[:i - 1], rest[i - 1]
rest = rest[i:]

chapters = []
for p in rest:
    m = CH.match(p)
    if m:
        chapters.append({"num": m.group(1), "name": m.group(2), "paras": []})
    else:
        chapters[-1]["paras"].append(p)

def lines(p):
    return "<br>".join(html.escape(l) for l in p.split("\n"))

def render_paras(ps):
    out, in_quote = [], False
    for p in ps:
        starts = p.startswith("「")
        voice = in_quote or starts
        if starts:
            in_quote = True
        if p.rstrip().endswith("」"):
            in_quote = False
        cls = ' class="book-voice"' if voice else ""
        out.append(f"                    <p{cls}>{lines(p)}</p>")
    return "\n".join(out)

toc = "\n".join(
    f'                <li><a href="#ch{n}"><span>{c["num"]}</span>{html.escape(c["name"])}</a></li>'
    for n, c in enumerate(chapters, 1)
)

body = "\n\n".join(
    f'''            <section class="book-chapter" id="ch{n}">
                <header class="chapter-head">
                    <p class="chapter-num">{c["num"]}</p>
                    <h2>{html.escape(c["name"])}</h2>
                </header>
                <div class="chapter-body">
{render_paras(c["paras"])}
                </div>
            </section>'''
    for n, c in enumerate(chapters, 1)
)

opening_html = "<br>".join(lines(p) for p in opening)

page = f'''<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>龍の書 ― 悠久の楽園 ― 龍の世界</title>

    <!-- 楽園の枠（音楽を流し続ける外側のページ）の中で開く -->
    <script src="../../../assets/js/eden-frame.js" data-place="book"></script>

    <!-- 明朝体を端末に関係なく同じ見た目で表示する（Android など明朝体の無い端末向け） -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500&display=swap">

    <link rel="stylesheet" href="../../../assets/css/eden.css">
    <link rel="stylesheet" href="../../../assets/css/eden-places.css">
</head>

<!--
    このページは docs/build-book.py が docs/ryu-no-sho.txt から作っている。
    本文を直すときは ryu-no-sho.txt を書き換えて、スクリプトを実行し直す。
-->
<body class="eden-place book-page" data-place="book">

    <!-- 眠る龍の気配（ごく薄く） -->
    <div class="place-backdrop" aria-hidden="true"></div>

    <a id="back-to-map" href="../gate/index.html">悠久の楽園へ戻る</a>

    <button type="button" id="music-toggle" aria-pressed="false">
        <span class="music-icon" aria-hidden="true"></span>
        <span class="music-label">歓喜の歌</span>
    </button>

    <audio id="music" src="../../../assets/eden/joy.mp3" loop preload="none"></audio>


    <main class="place-page">

        <header class="place-hero">
            <p class="hero-en">THE BOOK OF RYŪ</p>
            <h1>龍の書</h1>
            <p class="place-lead">{html.escape(subtitle)}</p>
        </header>

        <div class="book-layout">

            <!-- 目次（PCでは横に留まり、読んでいる章が光る） -->
            <nav class="book-toc" aria-label="目次">
                <p class="toc-title">目次</p>
                <ol>
{toc}
                </ol>
            </nav>

            <article class="book-text">

                <blockquote class="book-opening">
                    <p>{opening_html}</p>
                    <cite>― {html.escape(attribution)}</cite>
                </blockquote>

{body}

            </article>

        </div>

        <!-- 楽園のほかの場所へ -->
        <section class="place-paths">
            <h2>楽園のほかの場所</h2>
            <nav class="eden-gates" data-eden-gates aria-label="楽園の場所"></nav>
        </section>

    </main>


    <script src="../../../assets/js/eden-music.js"></script>
    <script src="../../../assets/js/eden-places.js"></script>
    <script src="../../../assets/js/eden-book.js"></script>

</body>

</html>
'''

out = ROOT / "world" / "eden" / "book" / "index.html"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(page, encoding="utf-8")
print("wrote", out, len(chapters), "chapters")
