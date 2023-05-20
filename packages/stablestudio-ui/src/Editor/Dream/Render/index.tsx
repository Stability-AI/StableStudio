import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

export namespace Render {
  export const use = (id: ID) => {
    const create = Generation.Image.Create.use();
    const entities = Editor.Entities.use();
    const [entity, setEntity] = Editor.Entity.use<Editor.Dream>(id);
    return useCallback(() => {
      if (!entity) return;

      const input = Generation.Image.Input.get(id);
      if (!input) return;

      setEntity((entity) => (entity.locked = true));
      const data = Editor.Canvas.Render.getGenerationMetadata(
        entities
          .filter((e) => e.type === "image" && e.visible)
          .reverse() as Editor.Image[],
        entity,
        1
      );
      //largest entity size
      const width = Math.max(...entities.map((e) => e.width));
      const height = Math.max(...entities.map((e) => e.height));

      console.log(data);

      Generation.Image.Input.set(id, (input) => {
        console.log(data);
        input.init = data?.init
          ? {
              base64: data.init,
              mask: false,
              weight: 1,
            }
          : null;
        input.mask = data?.mask
          ? {
              base64: data.mask,
              mask: true,
              weight: 1,
            }
          : null;
        input.width = width;
        input.height = height;
      });

      create({
        inputID: id,
        modifiers: {
          strength: 0,
        },
        onStarted(output) {
          if (!output) return;
          setEntity((entity) => {
            entity.outputID = output.id;
          });
        },
        onException() {
          setEntity((entity) => (entity.locked = false));
        },
      });
    }, [entity, setEntity, entities, create, id]);
  };
}
