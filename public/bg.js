tsParticles.addPathGenerator("waveFloat", {
  generate: (particle) => {
    const freq1 = 0.01 * 10;
    const freq2 = 0.005 * 10;
    const amp1 = 0.5 * 2;
    const amp2 = 1.5 * 2;
    const time = Date.now() * 0.001;

    // yは上下の揺れだけ作る（相対的な上下オフセット）
    const px = particle.position?.x ?? 0;
    const y =
      Math.sin(px * freq1 + time) * amp1 +
      Math.sin(px * freq2 + time * 0.5) * amp2;

    // x方向の動きは0（位置はmove.speedで制御）
    return { x: 0, y };
  },
  init: () => { },
  update: () => { },
  reset: () => { },
});

(async () => {
  await loadTrianglesPreset(tsParticles);

  await tsParticles.load({
    id: "bg",
    options: {
      preset: "triangles",
      particles: {
        // number: { value: 120 },
        move: {
          speed: 0.5,
        }
      }
    },
  });
})();
// tsParticles.load("bg", {
//   background: {
//     color: "#002f4b",
//   },
//   particles: {
//     number: { value: 60, density: { enable: true, area: 800 } },
//     color: { value: "#88f0ff" },
//     opacity: {
//       random: { enable: true, minimumValue: 0.1, maximumValue: 0.6 },
//       value: 0.3,
//     },
//     size: {
//       value: { min: 100, max: 160 },
//       random: true,
//       animation: { enable: true, speed: 10, sync: false },
//     },
//     shape: { type: "circle" },
//     move: {
//       enable: true,
//       speed: 1, // 速度はここで指定（5は速すぎるかも）
//       random: {
//         enable: true, // ランダムな速度を有効にする
//         minimumValue: 0.5, // 最小速度
//       },
//       direction: "down",
//       path: {
//         enable: true,
//         generator: "waveFloat",
//       },
//       outModes: {
//         default: "destroy",
//       },
//     },
//   },
//   emitters: {
//     direction: "down",
//     life: {
//       count: 0, // 0 は無限
//     },
//     rate: {
//       delay: 0.1,
//       quantity: 1,
//     },
//     size: {
//       width: 100,
//       height: 1,
//     },
//     position: {
//       x: 500,
//       y: 0,
//     },
//   },
// });
