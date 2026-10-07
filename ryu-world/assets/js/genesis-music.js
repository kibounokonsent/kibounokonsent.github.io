/* =========================================================
   龍の世界 / 創世ページ ― 歓喜の歌
   =========================================================
   第一章「はじめに龍は在った。」が見えた頃から、
   歓喜の歌を背後でかすかに流す（主役は文章と響きなので、小さく）。

   ・ブラウザの決まりで、最初に画面へ触れるまでは鳴らない。
     止められていたら、次にクリック・タップ・キーを押したときに流れ始める。
   ・調律の「響き」を静めているときは流さない。
   ・「世界を見る」で旅立つときは、そっと消してから移る。
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const audio = document.getElementById("genesis-music");
    const start = document.getElementById("chapter-one");
    const enter = document.getElementById("world-enter");

    if (!audio || !window.RyuMusic) return;

    const music = RyuMusic.init({
        audio,
        volume: 0.22,     // まあまあ、ちょっと聞こえる程度
        fadeIn: 6000      // 遠くから、ゆっくり近づいてくる
    });

    let begun = false;

    function begin() {
        if (begun) return;
        begun = true;
        music.start();
    }

    if (start && "IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries.some((en) => en.isIntersecting)) {
                io.disconnect();
                begin();
            }
        }, { threshold: 0.15 });
        io.observe(start);
    } else {
        begin();
    }

    // 途中から開かれた（リロードで下の方にいる）ときも流す
    if (start && start.getBoundingClientRect().top < innerHeight) begin();

    if (enter) {
        enter.addEventListener("click", () => music.fadeOut(600));
    }

});
