/* =========================================================
   touch-specialness.js … トルサの「特別なさわられ方」（胸・腰）を、ここにまとめています。
   js/torsa.js より前に読み込まれます（index.html の <script> の順番）。
   このファイルが読めなくても、ほかの場所は ふつうに動きます（胸と腰は、頭と同じふつうの反応になります）。

   設定とセリフは event/touch-specialness.json にあります（parts・cooldown・fallbackMs と、胸・腰のセリフ lines / vaultLines）。
   このファイルは、それを読みこんで、動き（motions）とあわせて使います。

   ここにあるもの
   ・parts      … さわる場所ごとに、使うセリフの名前と表情（event/touch-specialness.json）。
                  セリフは lines の名前、初回は「名前 + First」（patChest → patChestFirst）が使われます。
   ・motions    … さわったときの、からだの動き。u は、さわってからの秒数（0〜1.4）。
                  q("root").y などで部品を動かし、返す { ty, flat } で、顔の向きと目の平らさを変えます。
                  使える道具: q（部品）, pulse / damp / jolt（なめらかな波）
   ・cooldown   … 同じ場所を続けてさわったとき、次の反応までの間隔（ミリ秒）。書かなければ 420（event/touch-specialness.json）。
   ・afterReact … さわった直後に、もう一つやること（胸は、ふかい呼吸が始まります）。
   ・fallbackMs … 部品が読めなかったときの、からだ全体の小さな動きの長さ（ミリ秒）。書かなければ 260（event/touch-specialness.json）。

   新しい特別な場所を足すには:
   ① index.html に <button class="pat-zone" data-part="名前"> を足す  ② rig.json の zones（tools/rig/finish_rig.py）に範囲を足す
   ③ ここに motions を、event/touch-specialness.json に parts を足す  ④ event/touch-specialness.json の lines / vaultLines に、セリフ（patXxx / patXxxFirst）を足す
   （イベントの中の腰は、同じフォルダの events.js と event/events.json にあります）
   ========================================================= */
window.TorsaTouchSpecial = {
  // parts・cooldown・fallbackMs は event/touch-specialness.json から入ります（読みこみ後に、この中身を入れる）
  parts: {},

  motions: {
    // 胸：びくっ（からだごと小さく跳ねる）
    chest({ u, q, pulse, damp, jolt }) {
      q("root").y -= 3.6 * jolt(u, 2.2, 6.5);
      q("body").sy *= 1 + .016 * pulse(u, .22);
      q("earL").r += 18 * pulse(u, .6); q("earR").r -= 18 * pulse(u, .6);
      q("ahoge").r += 10 * damp(u, 4, 5);
      return { ty: -.5 * pulse(u, .8), flat: u < .6 };
    },
    // 腰：ひゃんっ（からだごと跳ねて、少し身を縮める。耳が跳ねる）
    waist({ u, q, pulse, damp, jolt }) {
      q("root").y -= 3.2 * jolt(u, 2.4, 6.5);
      q("body").sy *= 1 - .014 * pulse(u, .25);
      q("head").y += .6 * pulse(u, .3);
      q("earL").r += 20 * pulse(u, .55); q("earR").r -= 20 * pulse(u, .55);
      q("ahoge").r += 12 * damp(u, 4.5, 5);
      return { ty: -.4 * pulse(u, .7), flat: u < .7 };
    }
  },

  cooldown: {},

  afterReact: {
    // 胸をさわると、少しあとから、ふかい呼吸になる
    chest({ S, idleT }) { S.deepFrom = idleT + 1.2; }
  },

  fallbackMs: {}
};

// event/touch-specialness.json を読みこむ（index.html が、これが終わるのを待ってから始めます）
// 読めなかったときは、胸と腰は頭と同じふつうの反応になります
window.TorsaTouchSpecial.ready = fetch("event/touch-specialness.json")
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null)
  .then((c) => {
    const T = window.TorsaTouchSpecial;
    if (!c) { console.warn("event/touch-specialness.json を読み込めなかったので、胸・腰は ふつうの反応になります"); return null; }
    Object.assign(T.parts, c.parts); Object.assign(T.cooldown, c.cooldown); Object.assign(T.fallbackMs, c.fallbackMs);
    T.config = c;
    return c;
  });

// 胸・腰のセリフを、data/torsa.json の lines / vaultLines にくわえる（index.html が、データを読みこんだあとに呼びます）
window.TorsaTouchSpecial.addLines = function (torsa) {
  const c = window.TorsaTouchSpecial.config;
  if (!c || !torsa) return;
  ["lines", "vaultLines"].forEach((k) => { if (c[k]) torsa[k] = Object.assign(torsa[k] || {}, c[k]); });
};
