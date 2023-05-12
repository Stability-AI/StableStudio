import { Editor } from "~/Editor";

export namespace Create {
  export type Options = Partial<Editor.Image>;

  export const use = () => {
    const entities = Editor.Entities.use();
    const setEntities = Editor.Entities.useSet();
    const getCameraCenter = Editor.Camera.Center.useGet();
    return useCallback(
      (options?: Options) => {
        const image: Editor.Image = {
          ...Editor.Image.preset(),
          ...options,
          index: entities.length,
        };

        const center = getCameraCenter();
        const imageCentered = {
          ...image,
          x: image.x ?? (center ? center.x - image.width / 2 : 0),
          y: image.y ?? (center ? center.y - image.height / 2 : 0),
        };

        setEntities((previousEntities) =>
          new Map(previousEntities).set(image.id, imageCentered)
        );

        return imageCentered;
      },
      [getCameraCenter, entities.length, setEntities]
    );
  };

  export const useFromURL = () => {
    const create = use();
    return useCallback(
      async (url: URLString, options?: Options): Promise<Editor.Image> =>
        new Promise((resolve) => {
          const element = new Image();
          element.crossOrigin = "anonymous";
          element.src = url;
          element.onload = () => {
            const size = {
              width: element.width,
              height: element.height,
            };

            resolve(
              create({
                ...options,
                ...size,
                element,
                original: { ...size, element },
              })
            );
          };
        }),
      [create]
    );
  };
}
