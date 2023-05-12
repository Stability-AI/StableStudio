export type Size = { width: number; height: number };
export namespace Size {
  export const min = (a: Size, b: Size): Size => ({
    width: Math.min(a.width, b.width),
    height: Math.min(a.height, b.height),
  });

  export const max = (a: Size, b: Size): Size => ({
    width: Math.max(a.width, b.width),
    height: Math.max(a.height, b.height),
  });

  export type Clamp = { min?: Size; max?: Size };
  export namespace Clamp {
    export const apply = (size: Size, clamp?: Clamp): Size =>
      min(
        max(size, clamp?.min ?? { width: 0, height: 0 }),
        clamp?.max ?? { width: Infinity, height: Infinity }
      );
  }
}
