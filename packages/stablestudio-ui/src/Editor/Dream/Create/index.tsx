import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

import { Shortcuts } from "./Shortcut";

export declare namespace Create {
  export { Shortcuts };
}

export namespace Create {
  Create.Shortcuts = Shortcuts;

  type Options = {
    allowOverlap?: boolean;

    dream?: Partial<Editor.Dream>;
    inputID?: ID;
  };

  export const use = () => {
    const [inputs, setInputs] = Generation.Image.Inputs.use();

    const entities = Editor.Entities.use();
    const setEntities = Editor.Entities.useSet();
    const select = Editor.Selection.useSelect();
    const getCameraCenter = Editor.Camera.Center.useGet();

    return useCallback(
      (options?: Options) => {
        const id = options?.dream?.id ?? ID.create();
        const optionsInput = options?.inputID
          ? inputs[options.inputID]
          : undefined;

        const center = getCameraCenter();

        const createDream = (
          initial: Editor.Dream = {
            ...Editor.Dream.preset(),
            ...options?.dream,
            id,
            index: entities.length,
          },
          triesLeft = 10
        ): Editor.Dream => {
          if (triesLeft === 0 || options?.allowOverlap) return initial;

          const entityCentered = !center
            ? initial
            : {
                ...initial,
                x: center.x - initial.width / 2,
                y: center.y - initial.height / 2,
              };

          const overlappingEntity = entities.find(
            ({ x, y, width, height }) =>
              entityCentered.x === x &&
              entityCentered.y === y &&
              entityCentered.width === width &&
              entityCentered.height === height
          );

          const offsetMax = 20;
          return !overlappingEntity
            ? entityCentered
            : createDream(
                {
                  ...entityCentered,
                  x: entityCentered.x + offsetMax * (Math.random() * 2 - 1),
                  y: entityCentered.y + offsetMax * (Math.random() * 2 - 1),
                },
                triesLeft - 1
              );
        };

        const entity = createDream();

        entity.height = optionsInput?.height ?? entity.height;
        entity.width = optionsInput?.width ?? entity.width;

        const input = {
          ...Generation.Image.Input.initial(id),
          ...optionsInput,

          id,
          seed: 0,
        };

        setInputs((inputs) => ({ ...inputs, [id]: input }));
        setEntities((previousEntities) =>
          new Map(previousEntities).set(id, entity)
        );

        select(id);

        return entity;
      },
      [inputs, getCameraCenter, entities, setEntities, setInputs, select]
    );
  };
}
