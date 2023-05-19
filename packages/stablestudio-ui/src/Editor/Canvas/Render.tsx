import { Editor } from "~/Editor";
import { Box, Boxes } from "~/Geometry";

export namespace Render {
  export type RenderMode = "txt2img" | "img2img" | "inpaint";

  export type RenderData = {
    mode: RenderMode;
    init: string;
    mask: string;
  };

  export function getImageFromPoint(
    x: number,
    y: number,
    images: Editor.Images
  ) {
    return images.find(
      (image) =>
        image.x <= x &&
        image.x + image.width >= x &&
        image.y <= y &&
        image.y + image.height >= y &&
        image.element?.src &&
        image.visible
    );
  }

  export function getBoundsOfImages(images: Editor.Images) {
    return Boxes.surroundingBox(images) as Box;
  }

  export function createImageFromBox(
    x: number,
    y: number,
    width: number,
    height: number,
    images: Editor.Images,
    opacity: number,
    autoSize?: boolean,
    useOriginals?: boolean
  ) {
    // check if there are any images intersecting with the box
    const intersectingImages = images.filter(
      (image) =>
        image.x <= x + width &&
        image.x + image.width >= x &&
        image.y <= y + height &&
        image.y + image.height >= y &&
        image.visible &&
        (useOriginals ? image.original.element?.src : image.element?.src)
    );

    if (autoSize && intersectingImages.length > 0) {
      // resize the box to fit the images
      const bounds = getBoundsOfImages(intersectingImages);
      x = bounds.x;
      y = bounds.y;
      width = bounds.width;
      height = bounds.height;
    }

    if (intersectingImages.length > 0) {
      // get the canvas
      const workingCanvas = document.createElement("canvas");

      workingCanvas.width = width;
      workingCanvas.height = height;

      const workingCtx = workingCanvas.getContext("2d");
      if (!workingCtx) return;

      intersectingImages.sort().forEach((image) => {
        const scale = Math.max(
          image.width / image.original.width,
          image.height / image.original.height
        );

        const offset = {
          x: -((image.width - image.original.width * scale) / 2) / scale,
          y: -((image.height - image.original.height * scale) / 2) / scale,
        };

        if (!image.element?.src) return;
        if (useOriginals ? image.original.element : image.element) {
          workingCtx.drawImage(
            image.element,

            offset.x,
            offset.y,
            image.width / scale,
            image.height / scale,

            image.x - x,
            image.y - y,
            image.width,
            image.height
          );

          if (useOriginals && image.original.element) {
            // draw the original *behind* the image so as to preserve inpainted regions
            workingCtx.globalCompositeOperation = "destination-over";
            workingCtx.drawImage(
              image.original.element,

              offset.x,
              offset.y,
              image.width / scale,
              image.height / scale,

              image.x - x,
              image.y - y,
              image.width,
              image.height
            );

            workingCtx.globalCompositeOperation = "source-over";
          }
        }
      });

      // now draw bg
      if (useOriginals) {
        // draw 50% gray on the canvas
        workingCtx.fillStyle = "rgb(128, 128, 128)";
        workingCtx.globalCompositeOperation = "destination-over";
        workingCtx.fillRect(0, 0, workingCanvas.width, workingCanvas.height);
        workingCtx.globalCompositeOperation = "source-over";
      }

      // if there's alpha, apply the alpha to the entire canvas at this point
      if (opacity < 1) {
        workingCtx.globalAlpha = 1 - opacity;
        workingCtx.fillStyle = "white";
        workingCtx.globalCompositeOperation = "destination-out";
        workingCtx.fillRect(0, 0, workingCanvas.width, workingCanvas.height);
        workingCtx.globalAlpha = 1;
        workingCtx.globalCompositeOperation = "source-over";
      }

      return workingCanvas;
    } else {
      return null;
    }
  }

  export function getGenerationMetadata(
    images: Editor.Images,
    box: Box,
    opacity: number
  ): RenderData | null {
    const form = {
      x: box.x,
      y: box.y,
      width: Math.ceil(box.width / 64) * 64,
      height: Math.ceil(box.height / 64) * 64,
    };

    if (form.width * form.height > 1_048_576) {
      console.log("box is too large");
      return null;
    }

    const data: RenderData = {
      mode: "txt2img",
      init: "",
      mask: "",
    };

    // check if there are any images intersecting with the box
    const workingCanvas = createImageFromBox(
      form.x,
      form.y,
      form.width,
      form.height,
      images,
      opacity,
      false,
      false
    );

    const initImgCanvas = createImageFromBox(
      form.x,
      form.y,
      form.width,
      form.height,
      images,
      opacity,
      false,
      true
    );

    if (workingCanvas && initImgCanvas) {
      // make a new canvas and draw the cutout into it
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = initImgCanvas.width;
      maskCanvas.height = initImgCanvas.height;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const maskCtx = maskCanvas.getContext("2d")!;
      maskCtx.drawImage(
        workingCanvas,
        0,
        0,
        workingCanvas.width,
        workingCanvas.height,
        0,
        0,
        workingCanvas.width,
        workingCanvas.height
      );

      // render white where the canvas is transparent and black where the canvas is opaque
      // first render everything that exists as black using globalCompositeOperation = 'source-in'
      maskCtx.fillStyle = "white";
      maskCtx.globalCompositeOperation = "source-in";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      // then just draw a rectangle over the canvas with white and use globalCompositeOperation = 'source-out'
      maskCtx.fillStyle = "black";
      maskCtx.globalCompositeOperation = "destination-atop";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      maskCtx.globalCompositeOperation = "source-over";

      // check if the mask is all white
      const maskData = maskCtx.getImageData(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );
      const maskBuffer32 = new Uint32Array(maskData.data.buffer);
      let allWhite = true;
      let nonWhitePxls = 0;
      for (let i = 0; i < maskBuffer32.length; i++) {
        // check if the pixel isnt white
        if (maskBuffer32[i] !== 0xffffffff) {
          nonWhitePxls++;
        }

        // if there is enough non-white pixels, then we can stop checking
        if (nonWhitePxls > 25) {
          allWhite = false;
          break;
        }
      }

      if (!allWhite) {
        data.mode = "inpaint";

        // blur the greyscale mask a little bit to soften the edges between white and black
        maskCtx.filter = "blur(20px)";
        maskCtx.drawImage(
          maskCanvas,
          0,
          0,
          maskCanvas.width,
          maskCanvas.height,
          0,
          0,
          maskCanvas.width,
          maskCanvas.height
        );
      } else {
        data.mode = "img2img";

        if (opacity >= 1) {
          // if the opacity is one and we are doing img2img, make the mask 85% white (15% black)
          maskCtx.fillStyle = "rgb(210, 210, 210)";
          maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
      }

      // now render that to a PNG
      data.mask = maskCanvas.toDataURL("image/png", 1);

      // download init img
      // const m = document.createElement("a");
      // m.href = data.mask;
      // m.download = "mask.png";
      // m.click();

      data.init = initImgCanvas.toDataURL("image/png", 1);

      // download init img
      // const a = document.createElement("a");
      // a.href = data.init;
      // a.download = "init.png";
      // a.click();
    }

    return data;
  }
}
