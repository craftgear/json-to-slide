
// 初期化を実行
window.addEventListener('load', init);

// キャンバスとコンテキストの取得
const canvas = document.getElementById('slideCanvas');
// const ctx = canvas.getContext('2d');

const baseWidth = 1280;
const baseHeight = 700;

const slides = [
  {
    title: "簡単なプレゼンテーション",
    description: "CanvasとJavaScriptを使ったスライド\nテキストと画像の組み合わせ",
    backgroundColor: "rgba(106, 90, 205, 0.2)",
    content: [
      {
        type: "text",
        text: "このテキストは動的に配置されます",
        x: "50%",
        y: 200,
        fontSize: 32,
        color: "#ffffff",
        fontFamily: "'Segoe UI', sans-serif",
        fontWeight: "bold",
        textAlign: "center"
      },
      {
        type: "image",
        src: "sample.jpg",
        x: "50%",
        y: 300,
        width: 400,
        height: 250,
        opacity: 1,
        anchor: "center"
      }
    ]
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
        textAlign: "left"
      },
      {
        type: "text",
        text: "右寄せテキスト",
        x: "90%",
        y: 250,
        fontSize: 26,
        color: "#00BFFF",
        textAlign: "right"
      }
    ]
  }
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
    slides.forEach(slide => {
      if (slide.content) {
        slide.content.forEach(item => {
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

function drawContentItem(item, width, height, opacity) {
  const baseWidth = 1000;
  const baseHeight = 500;

  const scaledX = scaleValue(item.x, baseWidth, width);
  const scaledY = scaleValue(item.y, baseHeight, height);

  ctx.save();
  // ctx.globalAlpha = (item.opacity || 1) * opacity;

  switch (item.type) {
    case "text":
      const fontSize = scaleValue(
        item.fontSize || 24,
        baseWidth,
        Math.min(width, height)
      );

      ctx.font = `${item.fontWeight || "normal"} ${fontSize}px ${item.fontFamily || "sans-serif"}`;
      ctx.fillStyle = item.color || "#ffffff";
      ctx.textAlign = item.textAlign || "left";
      ctx.textBaseline = item.textBaseline || "top";

      ctx.fillText(item.text, scaledX, scaledY);
      break;

    case "image":
      const img = imageLoader.images[item.src];
      if (img) {
        let targetWidth = scaleValue(item.width, baseWidth, width);
        let targetHeight = scaleValue(item.height, baseHeight, height);

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
        const targetWidth = scaleValue(item.width, baseWidth, width);
        const targetHeight = scaleValue(item.height, baseHeight, height);
        ctx.fillRect(scaledX, scaledY, targetWidth, targetHeight);
        ctx.strokeRect(scaledX, scaledY, targetWidth, targetHeight);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Image Loading", scaledX + targetWidth / 2, scaledY + targetHeight / 2);
      }
      break;
  }

  ctx.restore();
}

function drawSlide(slide, width, height, opacity) {
  ctx.globalAlpha = opacity;
  ctx.fillStyle = slide.backgroundColor || "rgba(30, 30, 40, 0.2)";
  ctx.fillRect(0, 0, width, height);

  const titleFontSize = Math.max(28, Math.min(60, width * 0.05));
  ctx.font = `bold ${titleFontSize}px 'Segoe UI', sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(slide.title, width / 2, 40);

  const descFontSize = Math.max(16, Math.min(32, width * 0.03));
  ctx.font = `normal ${descFontSize}px 'Segoe UI', sans-serif`;

  const descriptionLines = slide.description.split('\n');
  const lineHeight = descFontSize * 1.6;
  descriptionLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, 40 + titleFontSize + 20 + (lineHeight * index));
  });

  if (slide.content) {
    slide.content.forEach(item => {
      drawContentItem(item, width, height, opacity);
    });
  }
}

function draw() {
  const canvas = document.getElementById("presentationCanvas");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  if (transitionDirection === 0) {
    drawSlide(slides[currentSlide], width, height, 1);
  } else {
    const nextSlide = (currentSlide + transitionDirection + slides.length) % slides.length;

    if (transitionDirection === 1) {
      drawSlide(slides[currentSlide], width, height, 1 - transitionProgress);
      drawSlide(slides[nextSlide], width, height, transitionProgress);
    } else {
      drawSlide(slides[nextSlide], width, height, transitionProgress);
      drawSlide(slides[currentSlide], width, height, 1 - transitionProgress);
    }
  }
}

function resizeCanvas() {
  const canvas = document.getElementById("presentationCanvas");
  if (!canvas) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  draw();
}

// アニメーションの更新
function animate() {
  if (!isTransitioning) return;

  transitionProgress += 0.05;

  if (transitionProgress >= 1) {
    transitionProgress = 1;
    isTransitioning = false;

  }

  draw();
  requestAnimationFrame(animate);
}

// 次のスライドへ移動
function nextSlide() {
  if (isTransitioning) return;

  isTransitioning = true;
  transitionDirection = 1;
  transitionProgress = 0;

  currentSlide = (currentSlide + 1) % slides.length;
  updateSlideCounter();
  animate();
}

// 前のスライドへ移動
function prevSlide() {
  if (isTransitioning) return;

  isTransitioning = true;
  transitionDirection = -1;
  transitionProgress = 0;

  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlideCounter();
  animate();
}

// 特定のスライドへ移動
function goToSlide(index) {
  if (isTransitioning || currentSlide === index) return;

  isTransitioning = true;
  transitionDirection = index > currentSlide ? 1 : -1;
  transitionProgress = 0;

  currentSlide = index;
  updateSlideCounter();
  animate();
}


function updateSlideCounter() {
  const counter = document.getElementById("slideCounter");
  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }
}

function createIndicators() {
  const container = document.getElementById("slideIndicators");
  if (!container) return;

  container.innerHTML = "";

  slides.forEach((_, index) => {
    const indicator = document.createElement("div");
    indicator.className = "indicator";
    if (index === currentSlide) {
      indicator.classList.add("active");
    }

    indicator.addEventListener("click", () => {
      if (isTransitioning) return;

      const direction = index > currentSlide ? 1 : -1;
      currentSlide = index;
      transitionDirection = 0;
      isTransitioning = false;
      draw();
      updateSlideCounter();
      createIndicators();
    });

    container.appendChild(indicator);
  });
}

function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowRight":
    case " ":
      nextSlide();
      e.preventDefault();
      break;
    case "ArrowLeft":
      prevSlide();
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

  // キーボードイベントリスナー登録
  document.addEventListener("keydown", handleKeyDown);

  // ナビゲーションボタン
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);

  // 初期設定
  resizeCanvas();
  createIndicators();
  updateSlideCounter();

  // リサイズイベント
  window.addEventListener("resize", resizeCanvas);
}

document.addEventListener("DOMContentLoaded", init);
