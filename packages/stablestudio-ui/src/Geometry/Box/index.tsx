import { Point, Size } from "~/Geometry";

export type Box = Point & Size;
export namespace Box {
  export const center = (box: Box): Point => ({
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  });
}

export type Boxes = Box[];
export namespace Boxes {
  export const surroundingBox = (boxes: Box[]): Box | undefined =>
    boxes.reduce<Box | undefined>((surroundingBox, box) => {
      if (!surroundingBox) return box;

      const { x, y } = Point.min(surroundingBox, box);

      const width =
        Math.max(box.x + box.width, surroundingBox.x + surroundingBox.width) -
        x;

      const height =
        Math.max(box.y + box.height, surroundingBox.y + surroundingBox.height) -
        y;

      return { x, y, width, height };
    }, undefined);
}
