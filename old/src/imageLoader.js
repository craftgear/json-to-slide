export class ImageLoader {
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
      // TODO: onErrorのときにplaceholder画像を設定するようにし、描画時の場合分けをなくす
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
