import { Layer } from "react-konva";

import { Editor } from "~/Editor";
import { Boxes } from "~/Geometry";
import { UndoRedo } from "~/UndoRedo";

import { Sidebar } from "./Sidebar";
import { Snapping } from "./Snapping";

export type Entities = Map<ID, Editor.Entity>;

export function Entities() {
  const entities = Entities.use();
  return useMemo(
    () => (
      <>
        <Layer on>
          {[...entities.reverse()]
            .filter((entity) => entity.type === "image" && entity.visible)
            .map((entity) => (
              <Editor.Image key={entity.id} id={entity.id} />
            ))}
          <Editor.Brush />
        </Layer>
        <Layer on>
          {[...entities.reverse()]
            .filter((entity) => entity.type === "dream" && entity.visible)
            .map((entity) => (
              <Editor.Dream key={entity.id} id={entity.id} />
            ))}
          <Editor.Brush />
        </Layer>
      </>
    ),
    [entities]
  );
}

const useState = UndoRedo.create<{
  entities: Entities;
  setEntities: (entities: React.SetStateAction<Entities>) => void;
}>((set) => ({
  entities: new Map<ID, Editor.Entity>(),
  setEntities: (setEntities) =>
    set(({ entities }) => ({
      entities:
        typeof setEntities === "function" ? setEntities(entities) : setEntities,
    })),
}));

export declare namespace Entities {
  export { Sidebar, Snapping };
}

export namespace Entities {
  Entities.Sidebar = Sidebar;
  Entities.Snapping = Snapping;

  export type List = Editor.Entity[];

  export const get = () => useState.getState().entities;
  export const set = (entities: React.SetStateAction<Entities>) =>
    useState.getState().setEntities(entities);

  export const useMap = () => useState(({ entities }) => entities);
  export const use = () => {
    const entities = useMap();
    return useMemo(
      () => [...entities.values()].sort((a, b) => b.index - a.index),
      [entities]
    );
  };

  export const useType = (type: Editor.Entity["type"]) => {
    const entities = use();
    return useMemo(
      () => entities.filter((entity) => entity.type === type),
      [entities, type]
    );
  };

  export const useSet = () => {
    const { setEntities } = useState();
    return setEntities;
  };

  export const useSurroundingBox = () => {
    const entities = use();
    return useMemo(() => Boxes.surroundingBox(entities), [entities]);
  };

  export const useDelete = () => {
    const { setEntities } = useState();
    const selected = Editor.Selection.use();
    const select = Editor.Selection.useSelect();
    const deselect = Editor.Selection.useClear();
    return useCallback(
      (...ids: ID[]) =>
        setEntities((previousEntities) => {
          const list = [...previousEntities.values()];
          const entities = new Map();

          list.forEach((entity) => {
            if (ids.includes(entity.id)) return;
            entities.set(entity.id, entity);
          });

          [...entities.values()].forEach((entity, index) =>
            entities.set(entity.id, { ...entity, index })
          );

          const newSelection = Array.from(selected).filter(
            (id) => !ids.includes(id)
          );

          if (newSelection.length === 0) {
            deselect();
          } else {
            select(newSelection[0] ?? [], ...newSelection.slice(1));
          }

          return entities;
        }),
      [setEntities, selected, deselect, select]
    );
  };

  export const useFlatten = () => {
    const createImage = Editor.Image.Create.useFromURL();
    const deleteEntities = useDelete();
    const flatten = useCallback(
      (images: Editor.Images) => {
        const bounds = Editor.Canvas.Render.getBoundsOfImages(images);
        const canvas = Editor.Canvas.Render.createImageFromBox(
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          images as Editor.Images,
          1
        );

        return new Promise((resolve) => {
          canvas?.toBlob(async (blob) => {
            if (!blob) return;

            const newEntity = await createImage(URL.createObjectURL(blob), {
              ...Editor.Image.preset(),
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              title: "Flattened image",
            });
            deleteEntities(...images.map(({ id }) => id));

            return resolve(newEntity);
          });
        });
      },
      [createImage, deleteEntities]
    );

    return flatten;
  };

  export const useDeleteEverything = () => {
    const entities = use();
    const deleteEntities = useDelete();
    return useMemo(
      () =>
        entities.length >= 1
          ? (predicate: (entity: Editor.Entity) => boolean = () => true) =>
              deleteEntities(...entities.filter(predicate).map(({ id }) => id))
          : undefined,
      [entities, deleteEntities]
    );
  };

  export const useChangeOrder = () => {
    const state = useState();
    const setState = useState.setState;
    return useCallback(
      ({ id, direction }: { id: ID; direction: "up" | "down" }) => {
        const fromEntity = state.entities.get(id);
        if (!fromEntity) return;

        const oldIndex = fromEntity.index;
        const newIndex =
          direction === "down"
            ? Math.max(0, fromEntity.index - 1)
            : Math.min(state.entities.size - 1, fromEntity.index + 1);

        if (oldIndex === newIndex) return;

        const toEntity = [...state.entities.values()].find(
          (entity) => entity.index === newIndex
        );

        if (!toEntity) return;

        const entities = new Map(state.entities);

        entities.set(fromEntity.id, { ...fromEntity, index: newIndex });
        entities.set(toEntity.id, { ...toEntity, index: fromEntity.index });

        setState({ entities });
      },
      [state, setState]
    );
  };
}
