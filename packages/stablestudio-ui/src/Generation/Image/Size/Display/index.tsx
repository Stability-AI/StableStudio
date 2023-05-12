import { Size } from "~/Geometry";

export namespace Display {
  export type Options = Partial<Size> & {
    scale?: number;
    preserveAspectRatio?: boolean;
  };

  export const useStyle = ({
    scale = 1,
    height = 512,
    width = height,
    preserveAspectRatio,
  }: Options) =>
    useMemo(() => {
      if (preserveAspectRatio) return { aspectRatio: `${width} / ${height}` };

      const ratio = width / height;
      const scaledHeight = scale * height;
      const scaledWidth =
        scale *
        Math.max(Math.min(height * 2, height * ratio), height * (3 / 5));

      return {
        width: scaledWidth,
        height: scaledHeight,
        flexBasis: scaledWidth,
        maxWidth: 1.5 * scaledWidth,
      };
    }, [scale, width, height, preserveAspectRatio]);
}
