import { handleResizeCanvas, parseGradientString } from "./canvas.js";
import { ImageLoader } from "./ImageLoader.js";

// TODO:
// - フォントを変更する
//  - google fontを linkで読み込むと変更できる

const baseWidth = 16;
const baseHeight = 9;

const fontFamily =
  '"Zen Kaku Gothic Antique", "BIZ UDGothic","Cherry Bomb One","Dela Gothic One","DotGothic16"';
const slides = [
  {
    title: "簡単なプレゼンテーション",
    description:
      "CanvasとJavaScriptを使ったスライド\nテキストと画像の組み合わせ",
    backgroundColor: "linear-gradient(30deg, #1a2a6c, #b21f1f, #fdbb2d)",
    // content: [
    //   {
    //     type: "text",
    //     text: "このテキストは動的に配置されます",
    //     x: "50%",
    //     y: "50%",
    //     fontSize: 32,
    //     color: "#ffffff",
    //     fontFamily,
    //     fontWeight: "bold",
    //     textAlign: "center",
    //   },
    //   {
    //     type: "image",
    //     src: "sample.jpg",
    //     x: "50%",
    //     y: 300,
    //     width: 400,
    //     height: 250,
    //     opacity: 1,
    //     anchor: "center",
    //   },
    // ],
  },
  {
    title: "2枚目のスライド",
    description: "複数コンテンツの例",
    backgroundColor: "rgba(30, 130, 76, 0.2)",
    // content: [
    //   {
    //     type: "text",
    //     text: "左寄せテキスト",
    //     x: 50,
    //     y: 200,
    //     fontSize: 28,
    //     color: "#FFD700",
    //     textAlign: "left",
    //   },
    //   {
    //     type: "text",
    //     text: "右寄せテキスト",
    //     x: "90%",
    //     y: 250,
    //     fontSize: 26,
    //     color: "#00BFFF",
    //     textAlign: "right",
    //   },
    // ],
  },
];

// TODO : グローバル関数をやめて個々の関数の引数で渡すように変更する
let ctx;
const imageLoader = new ImageLoader();
let currentSlide = 0;
let currentContentIndex = 0; // 現在のスライドで次に表示するコンテンツのインデックス
let transitionProgress = 0;
let transitionDirection = 0;
let isTransitioning = false;

function scaleValue(value, baseValue, canvasSize) {
  if (typeof value === "string" && value.includes("%")) {
    const percent = parseFloat(value) / 100;
    return canvasSize * percent;
  }
  // For number values, treat as absolute pixels relative to baseValue
  return value;
}

function drawContentItem(ctx, item, width, height) {
  if (!item.visible) return;

  const itemAreaWidth = width;
  const itemAreaHeight = height;

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

  const bg = slide.backgroundColor || "rgba(30, 30, 40, 0.2)";

  if (typeof bg === "string" && bg.startsWith("linear-gradient")) {
    const gradientInfo = parseGradientString(bg);
    if (gradientInfo) {
      const { angle, colors } = gradientInfo;
      const radians = (angle * Math.PI) / 180;
      const centerX = width / 2;
      const centerY = height / 2;
      const length = Math.sqrt(width * width + height * height) / 2;
      const startX = centerX - Math.cos(radians) * length;
      const startY = centerY - Math.sin(radians) * length;
      const endX = centerX + Math.cos(radians) * length;
      const endY = centerY + Math.sin(radians) * length;

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);

      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bg;
    }
  } else {
    ctx.fillStyle = bg;
  }

  ctx.fillRect(0, 0, width, height);
  const titleFontSize = Math.max(1, Math.min(60, width * 0.05));
  // ctx.font = `bold ${titleFontSize}px 'Segoe UI', sans-serif`;
  ctx.font = `normal ${titleFontSize}px  ${fontFamily}`;
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
  //
  // if (slide.content) {
  //   slide.content.forEach((item) => {
  //     drawContentItem(ctx, item, width, height);
  //   });
  // }
}

// TODO: draw関数はいらない、drawSlideに統合する
function draw(canvas) {
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

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

// アニメーションの更新
function animate(canvas) {
  if (!isTransitioning) return;

  // // コンテンツフェードインの進捗を更新
  // if (transitionDirection === 0) {
  //   const currentSlideObj = slides[currentSlide];
  //   if (currentSlideObj.content && currentContentIndex > 0) {
  //     const currentItem = currentSlideObj.content[currentContentIndex - 1];
  //     currentItem.opacity = transitionProgress;
  //   }
  // }
  //
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
  // 次のスライドへ移動
  currentSlide = currentSlide + 1;
  isTransitioning = true;
  transitionDirection = 1;
  transitionProgress = 0;

  // // 現在のスライドにコンテンツがあり、まだ表示していないものがある場合
  // if (
  //   currentSlideObj.content &&
  //   currentContentIndex < currentSlideObj.content.length
  // ) {
  //   // 次のコンテンツを表示
  //   const item = currentSlideObj.content[currentContentIndex];
  //   item.visible = true;
  //   currentContentIndex++;
  //   isTransitioning = true; // フェードインアニメーションのため
  //   transitionProgress = 0;
  //   animate(canvas);
  // }
  // 新しいスライドのコンテンツ状態をリセット
  // resetSlideContent(slides[currentSlide]);
  // currentContentIndex = 0;

  // nextSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
  updateSlideCounter();
  // createIndicators();
  animate(canvas);
}

// 前のスライドへ移動
function prevSlide(canvas) {
  console.log("----- currentSlide", currentSlide);
  if (currentSlide === 0) {
    // 最初のスライドで戻ることはできない
    return;
  }
  if (isTransitioning) return;

  isTransitioning = true;
  transitionDirection = -1;
  transitionProgress = 0;

  currentSlide = currentSlide > 0 ? currentSlide - 1 : 0;
  // 新しいスライドのコンテンツ状態をリセット
  // resetSlideContent(slides[currentSlide]);
  // currentContentIndex = 0;
  updateSlideCounter();
  // createIndicators();
  animate(canvas);
}

// 特定のスライドへ移動
// function goToSlide(index) {
//   if (isTransitioning || currentSlide === index) return;
//
//   isTransitioning = true;
//   transitionDirection = index > currentSlide ? 1 : -1;
//   transitionProgress = 0;
//
//   currentSlide = index;
//   // 新しいスライドのコンテンツ状態をリセット
//   resetSlideContent(slides[currentSlide]);
//   currentContentIndex = 0;
//   updateSlideCounter();
//   // createIndicators();
//   animate(canvas);
// }

// function resetSlideContent(slide) {
//   if (slide.content) {
//     slide.content.forEach((item) => {
//       item.visible = false;
//       item.opacity = 0;
//     });
//   }
// }

function updateSlideCounter() {
  const counter = document.getElementById("slideCounter");
  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }
}

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

  // キャンバスとコンテキストの取得
  const canvas = document.getElementById("slideCanvas");

  try {
    await imageLoader.loadAllImages(slides);
  } catch (error) {
    console.error("画像の読み込みに失敗しました:", error);
  }

  // // 各スライドのコンテンツを初期化
  // slides.forEach((slide) => {
  //   if (slide.content) {
  //     slide.content.forEach((item) => {
  //       item.visible = false;
  //       item.opacity = 0;
  //     });
  //   }
  // });

  // キーボードイベントリスナー登録
  document.addEventListener("keydown", (e) => handleKeyDown(e, canvas));

  // 初期設定
  handleResizeCanvas(canvas, baseWidth, baseHeight);
  // createIndicators();
  updateSlideCounter();

  // 初回描画
  draw(canvas);

  // リサイズイベント
  window.addEventListener("resize", () => {
    handleResizeCanvas(canvas, baseWidth, baseHeight);
  });
}

// 実行
window.addEventListener("load", init);
