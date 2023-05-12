import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

export namespace Choose {
  export const use = (id: ID) => {
    const flatten = Editor.Entities.useFlatten();
    const entities = Editor.Entities.use();
    const [entity, setEntity] = Editor.Entity.use<Editor.Dream>(id);
    const createImage = Editor.Image.Create.use();
    const { autoFlatten } = Editor.State.use();

    return useCallback(
      (image: Generation.Image) => {
        if (!entity || !image.src) return;

        const title =
          Generation.Image.Input.get(image.inputID)?.prompts[0].text ?? "Image";

        const intersectingImages = entities.filter(
          (image) =>
            image.type === "image" &&
            image.x < entity.x + entity.width &&
            image.x + image.width > entity.x &&
            image.y < entity.y + entity.height &&
            image.y + image.height > entity.y &&
            image.element?.src &&
            image.visible &&
            image.id !== id
        );

        const element = new window.Image();
        element.src = image.src;

        element.onload = () => {
          const original = {
            element,
            width: element.width,
            height: element.height,
          };

          if (intersectingImages.length >= 1 && autoFlatten) {
            intersectingImages.push({
              ...Editor.Image.preset(),
              index: entities.length,
              x: entity.x,
              y: entity.y,
              width: entity.width,
              height: entity.height,
              original,
              element,
              title,
            });

            // flatten everything into one image layer
            flatten(intersectingImages as Editor.Images);
          } else {
            createImage({
              title,
              x: entity.x,
              y: entity.y,
              width: entity.width,
              height: entity.height,
              original,
              element,
            });
          }
        };

        setEntity((entity) => {
          entity.locked = false;
          entity.outputID = undefined;
          entity.choicesPage = 0;
        });
      },
      [autoFlatten, createImage, entities, entity, flatten, id, setEntity]
    );
  };
}
