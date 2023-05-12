import { Rect } from "react-konva";

import { Editor } from "~/Editor";
import { Size } from "~/Geometry";

import { Create } from "./Create";
import { Import } from "./Import";
import { Sidebar } from "./Sidebar";

export type Images = Image[];
export type Image = Editor.Entity.Definition<{
  type: "image";
  outputID?: ID;
  src?: string;
  element?: HTMLImageElement;
  original: Size & { element?: HTMLImageElement };
}>;

export function Image({ id }: { id: ID }) {
  const [image] = Editor.Entity.use<Image>(id);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  return (
    <Editor.Entity id={id} onSizeChange={setSize}>
      {image && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fillPatternRepeat="no-repeat"
          fillPatternImage={image.element}
          fillPatternScale={{
            x: width / image.original.width,
            y: height / image.original.height,
          }}
        />
      )}
    </Editor.Entity>
  );
}

export declare namespace Image {
  export { Create, Import, Sidebar };
}

export namespace Image {
  Image.Create = Create;
  Image.Import = Import;
  Image.Sidebar = Sidebar;

  export const preset = (): Omit<Image, "index"> => {
    const size = {
      width: 512,
      height: 512,
    };

    return {
      id: ID.create(),
      type: "image",

      visible: true,
      locked: false,

      x: 0,
      y: 0,

      ...size,
      original: size,
    };
  };
}
