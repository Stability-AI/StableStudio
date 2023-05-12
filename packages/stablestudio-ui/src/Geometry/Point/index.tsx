export type Point = { x: number; y: number };
export namespace Point {
  export const min = (a: Point, b: Point): Point => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
  });

  export const max = (a: Point, b: Point): Point => ({
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
  });
}
