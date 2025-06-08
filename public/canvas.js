export function parseGradientString(gradientString) {
  const regex =
    /linear-gradient\((\d+)deg\s*,\s*(#[0-9a-fA-F]+)\s*,\s*(#[0-9a-fA-F]+)\s*,\s*(#[0-9a-fA-F]+)\)/i;
  const match = gradientString.match(regex);
  if (!match) return null;

  const angle = parseInt(match[1]);
  const colors = [match[2], match[3], match[4]];
  return { angle, colors };
}

export function handleResizeCanvas(canvas, baseWidth, baseHeight) {
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
}
