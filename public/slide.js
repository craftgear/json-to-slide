// 初期化を実行
window.addEventListener("load", init);

const baseWidth = 16;
const baseHeight = 9;

const fontFamily = ' "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif';

const slides = [
  {
    title: "簡単なプレゼンテーション",
    description:
      "CanvasとJavaScriptを使ったスライド\nテキストと画像の組み合わせ",
    backgroundColor: "rgba(106, 90, 205, 0.9)",
    content: [
      {
        type: "text",
        text: "このテキストは動的に配置されます",
        x: "50%",
        y: 200,
        fontSize: 32,
        color: "#ffffff",
        fontFamily,
        fontWeight: "bold",
        textAlign: "center",
      },
      {
        type: "image",
        src: "sample.jpg",
        x: "50%",
        y: 300,
        width: 400,
        height: 250,
        opacity: 1,
        anchor: "center",
      },
    ],
  },
  {
    title: "2枚目のスライド",
    description: "複数コンテンツの例",
    backgroundColor: "rgba(30, 130, 76, 0.2)",
    content: [
      {
        type: "text",
        text: "左寄せテキスト",
        x: 50,
        y: 200,
        fontSize: 28,
        color: "#FFD700",
        textAlign: "left",
      },
      {
        type: "text",
        text: "右寄せテキスト",
        x: "90%",
        y: 250,
        fontSize: 26,
        color: "#00BFFF",
        textAlign: "right",
      },
    ],
  },
];

class ImageLoader {
  constructor() {
    this.images = {};
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.images[src]) {
        resolve(this.images[src]);
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.images[src] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  loadAllImages(slides) {
    const promises = [];
    slides.forEach((slide) => {
      if (slide.content) {
        slide.content.forEach((item) => {
          if (item.type === "image") {
            promises.push(this.loadImage(item.src));
          }
        });
      }
    });
    return Promise.all(promises);
  }
}

const imageLoader = new ImageLoader();
let currentSlide = 0;
let currentContentIndex = 0; // 現在のスライドで次に表示するコンテンツのインデックス
let transitionProgress = 0;
let transitionDirection = 0;
let ctx;
let isTransitioning = false;

function scaleValue(value, baseValue, canvasSize) {
  if (typeof value === "string" && value.includes("%")) {
    const percent = parseFloat(value) / 100;
    return canvasSize * percent;
  }
  return (value / baseValue) * canvasSize;
}

function drawContentItem(ctx, item, width, height) {
  if (!item.visible) return;

  const itemAreaWidth = 1000;
  const itemAreaHeight = 500;

  const scaledX = scaleValue(item.x, itemAreaWidth, width);
  const scaledY = scaleValue(item.y, itemAreaHeight, height);

  ctx.save();

  // コンテンツの透明度を設定
  ctx.globalAlpha = item.opacity || 1;

  switch (item.type) {
    case "text":
      const fontSize = scaleValue(
        item.fontSize || 24,
        itemAreaWidth,
        Math.min(width, height),
      );

      ctx.font = `${item.fontWeight || "normal"} ${fontSize}px ${item.fontFamily}`;
      console.log("----- ctx.font", ctx.font);
      ctx.fillStyle = item.color || "#ffffff";
      ctx.textAlign = item.textAlign || "left";
      ctx.textBaseline = item.textBaseline || "top";

      ctx.fillText(item.text, scaledX, scaledY);
      break;

    case "image":
    case "svg":
      const img = imageLoader.images[item.src];
      if (img) {
        let targetWidth = scaleValue(item.width, itemAreaWidth, width);
        let targetHeight = scaleValue(item.height, itemAreaHeight, height);

        targetWidth = Math.min(targetWidth, width * 0.9);
        targetHeight = Math.min(targetHeight, height * 0.7);

        let drawX = scaledX;
        let drawY = scaledY;

        switch (item.anchor || "top-left") {
          case "center":
            drawX -= targetWidth / 2;
            drawY -= targetHeight / 2;
            break;
          case "top-right":
            drawX -= targetWidth;
            break;
          case "bottom-left":
            drawY -= targetHeight;
            break;
          case "bottom-right":
            drawX -= targetWidth;
            drawY -= targetHeight;
            break;
          case "center-top":
            drawX -= targetWidth / 2;
            break;
        }

        ctx.drawImage(img, drawX, drawY, targetWidth, targetHeight);
      } else {
        ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
        ctx.strokeStyle = "rgba(100, 100, 100, 0.7)";
        const targetWidth = scaleValue(item.width, itemAreaWidth, width);
        const targetHeight = scaleValue(item.height, itemAreaHeight, height);
        ctx.fillRect(scaledX, scaledY, targetWidth, targetHeight);
        ctx.strokeRect(scaledX, scaledY, targetWidth, targetHeight);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          "Image Loading",
          scaledX + targetWidth / 2,
          scaledY + targetHeight / 2,
        );
      }
      break;
  }

  ctx.restore();
}

function drawSlide(slide, width, height, opacity) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = opacity;
  console.log("----- slide.backgroundColor", slide.backgroundColor);
  ctx.fillStyle = slide.backgroundColor || "rgba(30, 30, 40, 0.2)";
  const titleFontSize = Math.max(1, Math.min(60, width * 0.05));
  ctx.font = `bold ${titleFontSize}px 'Segoe UI', sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(slide.title, width / 2, titleFontSize * 1.6);

  const descFontSize = Math.max(1, Math.min(32, width * 0.03));
  ctx.font = `normal ${descFontSize}px 'Segoe UI', sans-serif`;

  const descriptionLines = slide.description.split("\n");
  const lineHeight = descFontSize * 1.6;
  descriptionLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, titleFontSize * 3 + lineHeight * index * 1.6);
  });

  if (slide.content) {
    slide.content.forEach((item) => {
      drawContentItem(ctx, item, width, height);
    });
  }
}

function draw(canvas) {
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  if (transitionDirection === 0) {
    drawSlide(slides[currentSlide], width, height, 1);
  } else {
    const nextSlideIndex =
      (currentSlide + transitionDirection + slides.length) % slides.length;

    if (transitionDirection === 1) {
      drawSlide(slides[currentSlide], width, height, 1 - transitionProgress);
      drawSlide(slides[nextSlideIndex], width, height, transitionProgress);
    } else {
      drawSlide(slides[nextSlideIndex], width, height, transitionProgress);
      drawSlide(slides[currentSlide], width, height, 1 - transitionProgress);
    }
  }
}

function handleResizeCanvas(canvas) {
  if (!canvas) return;

  const baseAspectRatio = baseWidth / baseHeight;

  const documentWidth = document.documentElement.clientWidth;
  const documentHeight = document.documentElement.clientHeight;

  if (documentWidth / baseWidth > documentHeight / baseHeight) {
    canvas.height = documentHeight;
    canvas.width = (documentHeight / 9) * 16;
  } else {
    canvas.width = documentWidth;
    canvas.height = (documentWidth / 16) * 9;
  }

  draw(canvas);
}

// アニメーションの更新
function animate(canvas) {
  if (!isTransitioning) return;

  // コンテンツフェードインの進捗を更新
  if (transitionDirection === 0) {
    const currentSlideObj = slides[currentSlide];
    if (currentSlideObj.content && currentContentIndex > 0) {
      const currentItem = currentSlideObj.content[currentContentIndex - 1];
      currentItem.opacity = transitionProgress;
    }
  }

  transitionProgress += 0.05;

  if (transitionProgress >= 1) {
    transitionProgress = 1;
    isTransitioning = false;
  }

  draw(canvas);
  if (isTransitioning) {
    requestAnimationFrame(() => animate(canvas));
  }
}

// 次のスライドへ移動
function nextSlide(canvas) {
  if (isTransitioning) return;

  const currentSlideObj = slides[currentSlide];
  // 現在のスライドにコンテンツがあり、まだ表示していないものがある場合
  if (
    currentSlideObj.content &&
    currentContentIndex < currentSlideObj.content.length
  ) {
    // 次のコンテンツを表示
    const item = currentSlideObj.content[currentContentIndex];
    item.visible = true;
    currentContentIndex++;
    isTransitioning = true; // フェードインアニメーションのため
    transitionProgress = 0;
    animate(canvas);
  } else {
    // 次のスライドへ移動
    isTransitioning = true;
    transitionDirection = 1;
    transitionProgress = 0;

    currentSlide = (currentSlide + 1) % slides.length;
    // 新しいスライドのコンテンツ状態をリセット
    resetSlideContent(slides[currentSlide]);
    currentContentIndex = 0;
    updateSlideCounter();
    // createIndicators();
    animate(canvas);
  }
}

// 前のスライドへ移動
function prevSlide(canvas) {
  if (isTransitioning) return;

  isTransitioning = true;
  transitionDirection = -1;
  transitionProgress = 0;

  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  // 新しいスライドのコンテンツ状態をリセット
  resetSlideContent(slides[currentSlide]);
  currentContentIndex = 0;
  updateSlideCounter();
  // createIndicators();
  animate(canvas);
}

// 特定のスライドへ移動
function goToSlide(index) {
  if (isTransitioning || currentSlide === index) return;

  isTransitioning = true;
  transitionDirection = index > currentSlide ? 1 : -1;
  transitionProgress = 0;

  currentSlide = index;
  // 新しいスライドのコンテンツ状態をリセット
  resetSlideContent(slides[currentSlide]);
  currentContentIndex = 0;
  updateSlideCounter();
  // createIndicators();
  animate();
}

function resetSlideContent(slide) {
  if (slide.content) {
    slide.content.forEach((item) => {
      item.visible = false;
      item.opacity = 0;
    });
  }
}

function updateSlideCounter() {
  const counter = document.getElementById("slideCounter");
  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }
}

// function createIndicators() {
//   const container = document.getElementById("slideIndicators");
//   if (!container) return;
//
//   container.innerHTML = "";
//
//   slides.forEach((_, index) => {
//     const indicator = document.createElement("div");
//     indicator.className = "indicator";
//     if (index === currentSlide) {
//       indicator.classList.add("active");
//     }
//
//     indicator.addEventListener("click", () => {
//       if (isTransitioning) return;
//
//       const direction = index > currentSlide ? 1 : -1;
//       currentSlide = index;
//       transitionDirection = 0;
//       isTransitioning = false;
//       draw();
//       updateSlideCounter();
//       createIndicators();
//     });
//
//     container.appendChild(indicator);
//   });
// }

function handleKeyDown(e, canvas) {
  switch (e.key) {
    case "ArrowRight":
    case " ":
      nextSlide(canvas);
      e.preventDefault();
      break;
    case "ArrowLeft":
      prevSlide(canvas);
      e.preventDefault();
      break;
  }
}

async function init() {
  try {
    await imageLoader.loadAllImages(slides);
  } catch (error) {
    console.error("画像の読み込みに失敗しました:", error);
  }

  // 透過レイヤー効果を強化するためスライド背景の透過度を調整
  slides.forEach((slide) => {
    if (!slide.backgroundColor.includes("rgba")) {
      slide.backgroundColor = "rgba(30, 30, 50, 0.85)";
    } else {
      // 既存のrgba値を透過度増加（0.2 → 0.85）
      slide.backgroundColor = slide.backgroundColor.replace(
        /rgba\(([^)]+)\)/,
        (match, p1) => {
          const values = p1.split(",").map((v) => parseFloat(v.trim()));
          values[3] = Math.min(0.85, values[3] + 0.2); // 透過度増加
          return `rgba(${values.join(",")})`;
        },
      );
    }
  });

  // キャンバスとコンテキストの取得
  const canvas = document.getElementById("slideCanvas");

  try {
    await imageLoader.loadAllImages(slides);
  } catch (error) {
    console.error("画像の読み込みに失敗しました:", error);
  }

  // 各スライドのコンテンツを初期化
  slides.forEach((slide) => {
    if (slide.content) {
      slide.content.forEach((item) => {
        item.visible = false;
        item.opacity = 0;
      });
    }
  });

  // キーボードイベントリスナー登録
  document.addEventListener("keydown", (e) => handleKeyDown(e, canvas));

  // 初期設定
  handleResizeCanvas(canvas);
  // createIndicators();
  updateSlideCounter();

  // リサイズイベント
  window.addEventListener("resize", () => {
    console.log("----- resize");

    handleResizeCanvas(canvas);
  });
}

document.addEventListener("DOMContentLoaded", init);
