
import type { Slide } from "./types";

const baseWidth = 16;
const baseHeight = 9;
const fontFamily =
  '"Zen Kaku Gothic Antique", "BIZ UDGothic","Cherry Bomb One","Dela Gothic One","DotGothic16"';

export const handleResizeWindow = (canvas: HTMLCanvasElement, bgDiv: HTMLDivElement): void => {
  if (!canvas) return;

  const documentWidth = document.documentElement.clientWidth;
  const documentHeight = document.documentElement.clientHeight;

  if (documentWidth / baseWidth > documentHeight / baseHeight) {
    canvas.height = documentHeight;
    canvas.width = (documentHeight / 9) * 16;
  } else {
    canvas.width = documentWidth;
    canvas.height = (documentWidth / 16) * 9;
  }

  bgDiv.style.width = `${canvas.clientWidth}px`;
  bgDiv.style.height = `${canvas.clientHeight}px`;


}

const _parseGradientString = (gradientString: string): { angle: number; colors: string[] } | null => {
  const regex =
    /linear-gradient\((\d+)deg\s*,\s*(#[0-9a-fA-F]+)\s*,\s*(#[0-9a-fA-F]+)\s*,\s*(#[0-9a-fA-F]+)\)/i;
  const match = gradientString.match(regex);
  if (!match) return null;

  const angle = parseInt(match[1]);
  const colors = [match[2], match[3], match[4]];
  return { angle, colors };
}

const drawSlideBackground = (ctx: CanvasRenderingContext2D, background: string | undefined, globalAlpha: number): void => {
  const bg = background || `rgba(30, 30, 30, ${globalAlpha})`;

  const height = ctx.canvas.height;
  const width = ctx.canvas.width;

  // default
  ctx.fillStyle = bg;

  if (bg.startsWith("linear-gradient")) {
    const gradientInfo = _parseGradientString(bg);

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
    }
  }
  if (bg.startsWith("rgba")) {
    const rgbaMatch = bg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      let a = parseFloat(rgbaMatch[4]);
      a = a * globalAlpha;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
  ctx.fillRect(0, 0, width, height);
}

export const drawSlide = (canvas: HTMLCanvasElement, slide: Slide, opacity = 1) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context");
    return;
  }
  const height = ctx.canvas.height;
  const width = ctx.canvas.width;
  // ctx.clearRect(0, 0, width, height);

  ctx.globalAlpha = opacity;

  drawSlideBackground(ctx, slide.backgroundColor, ctx.globalAlpha);

  const titleFontSize = Math.max(1, width * 0.06);
  ctx.font = `normal ${titleFontSize}px  ${fontFamily}`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(slide.title, width / 2, titleFontSize);

  const descFontSize = Math.max(1, Math.min(32, width * 0.03));
  ctx.font = `normal ${descFontSize}px 'Segoe UI', sans-serif`;

  const descriptionLines = slide.description.split("\n");
  const lineHeight = descFontSize * 1.6;
  descriptionLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, titleFontSize * 3 + lineHeight * index * 1.6);
  });
}


export const animateSlideTransition = (finishTransition: () => void, canvas: HTMLCanvasElement, prevSlide: Slide, nextSlide: Slide, transitionProgress = 0): void => {

  const currentTransitionProgress = transitionProgress + 0.03;
  drawSlide(canvas, prevSlide, 1 - currentTransitionProgress);
  drawSlide(canvas, nextSlide, currentTransitionProgress);

  if (currentTransitionProgress >= 1) {
    finishTransition()
    return;
  }

  requestAnimationFrame(() => {
    animateSlideTransition(finishTransition, canvas, prevSlide, nextSlide, currentTransitionProgress);
  });

}
