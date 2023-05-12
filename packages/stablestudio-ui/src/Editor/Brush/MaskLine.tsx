import Konva from "konva";

import { Editor } from "~/Editor";

export class MaskLine {
  public strokeWidth = 0;
  public strokeBlur = 0;
  public strokeStrength = 0;
  public points: number[] = [];
  public line: Konva.Image | null = null;
  public canvas: HTMLCanvasElement = document.createElement("canvas");

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  public context: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

  addPoint(x: number, y: number) {
    this.points.push(x);
    this.points.push(y);
    if (this.line) {
      this.draw();
      this.line.getLayer()?.batchDraw();
    } else {
      false && console.log("no line");
    }
  }

  restart(
    strokeWidth: number,
    strokeBlur: number,
    strokeStrength: number,
    points: number[]
  ) {
    this.strokeWidth = strokeWidth;
    this.strokeBlur = strokeBlur;
    this.strokeStrength = strokeStrength;
    this.points = points;
    this.line?.visible(true);
  }

  clear() {
    this.points = [];

    if (this.line) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.line.visible(false);
      this.line.getLayer()?.batchDraw();
    }
  }

  draw() {
    const [topLeftPoint, bottomRightPoint]: { x: number; y: number }[] =
      this.points.reduce(
        (acc, point, i) => {
          if (!acc[0] || !acc[1]) return acc;
          if (i % 2 === 0) {
            if (point < acc[0].x) {
              acc[0].x = point;
            }
            if (point > acc[1].x) {
              acc[1].x = point;
            }
          } else {
            if (point < acc[0].y) {
              acc[0].y = point;
            }
            if (point > acc[1].y) {
              acc[1].y = point;
            }
          }
          return acc;
        },
        [
          { x: Infinity, y: Infinity },
          { x: -Infinity, y: -Infinity },
        ]
      );

    if (!topLeftPoint || !bottomRightPoint) return;

    const width = bottomRightPoint.x - topLeftPoint.x;
    const height = bottomRightPoint.y - topLeftPoint.y;

    this.canvas.width = width + this.strokeWidth * 2 + this.strokeBlur * 2;
    this.canvas.height = height + this.strokeWidth * 2 + this.strokeBlur * 2;

    this.line?.position({
      x: topLeftPoint.x - this.strokeWidth - this.strokeBlur,
      y: topLeftPoint.y - this.strokeWidth - this.strokeBlur,
    });

    this.line?.width(this.canvas.width);
    this.line?.height(this.canvas.height);

    this.context.beginPath();
    this.context.fillStyle = "white";
    this.context.filter = `blur(${this.strokeBlur}px)`;
    this.context.lineWidth = this.strokeWidth;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.globalAlpha = this.strokeStrength;

    const a = this.points[0];
    const b = this.points[1];

    a &&
      b &&
      this.context.moveTo(a - (this.line?.x() || 0), b - (this.line?.y() || 0));

    for (let i = 2; i < this.points.length; i += 2) {
      const a = this.points[i];
      const b = this.points[i + 1];

      a &&
        b &&
        this.context.lineTo(
          a - (this.line?.x() ?? 0),
          b - (this.line?.y() ?? 0)
        );
    }
    this.context.stroke();
  }
}

export namespace MaskLine {
  export const applyToImage = (
    image: Editor.Image,
    line: Editor.Brush.MaskLine
  ): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      if (!image.element?.complete || !image.element.src) {
        resolve(null);
        return;
      }

      // render image to a canvas, render maskLine with distination-out, then render canvas to image as a DataURL and set it as the image source
      const canvas = document.createElement("canvas");
      canvas.width = image.element.width;
      canvas.height = image.element.height;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image.element, 0, 0, canvas.width, canvas.height);

      const scale = Math.max(
        image.width / image.element.width,
        image.height / image.element.height
      );

      const offset = {
        x: -((image.width - image.element.width * scale) / 2) / scale,
        y: -((image.height - image.element.height * scale) / 2) / scale,
      };

      // render maskLine via points
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = line.strokeWidth / scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.filter = `blur(${line.strokeBlur / scale}px)`;
      ctx.globalAlpha = line.strokeStrength;
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < line.points.length; i += 2) {
        const a = line.points[i];
        const b = line.points[i + 1];

        if (!a || !b) continue;

        i === 0
          ? ctx.moveTo(
              a / scale - image.x / scale + offset.x,
              b / scale - image.y / scale + offset.y
            )
          : ctx.lineTo(
              a / scale - image.x / scale + offset.x,
              b / scale - image.y / scale + offset.y
            );
      }

      ctx.stroke();

      // const m = document.createElement("a");
      // m.href = canvas.toDataURL("image/png");
      // m.download = "mask.png";
      // m.click();

      // we are about to replace the image with a new blob url,
      // so we need to revoke the old one to avoid memory leaks
      // but, we dont want to revoke the OG image URL
      if (
        image.element.src.startsWith("blob:") &&
        image.element.src !== image.src
      )
        URL.revokeObjectURL(image.element.src);

      const element = new window.Image();
      element.id = image.id;
      element.onload = () => resolve(element);
      canvas.toBlob((blob) => {
        if (blob) element.src = URL.createObjectURL(blob);
        canvas.remove();
      });
    });
}
