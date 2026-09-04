/* ==========================================================
   PORTFOLIO
   Image Zoom / Modal
========================================================== */


/* ==========================================================
   DOM
========================================================== */

const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");


/* ==========================================================
   IMAGE OPEN
========================================================== */

function openImage(img) {

    // モーダルが存在しない場合は何もしない
    if (!imageModal || !modalImage) return;

    // クリックされた画像を表示
    modalImage.src = img.src;
    modalImage.alt = img.alt || "";

    // モーダルを表示
    imageModal.classList.add("active");

    // 背景ページをスクロールさせない
    document.body.style.overflow = "hidden";
}


/* ==========================================================
   IMAGE CLOSE
========================================================== */

function closeImage() {

    if (!imageModal || !modalImage) return;

    imageModal.classList.remove("active");

    // スクロールを元に戻す
    document.body.style.overflow = "";

    // 画像を消しておく
    modalImage.src = "";
    modalImage.alt = "";
}


/* ==========================================================
   CLOSE BUTTON
========================================================== */

if (modalClose) {

    modalClose.addEventListener("click", closeImage);

}


/* ==========================================================
   BACKGROUND CLICK
========================================================== */

if (imageModal) {

    imageModal.addEventListener("click", (event) => {

        // 黒い背景部分をクリックした場合だけ閉じる
        if (event.target === imageModal) {
            closeImage();
        }

    });

}


/* ==========================================================
   ESC KEY
========================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeImage();
    }

});