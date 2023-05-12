import Konva from "konva";
import { Group, Rect, Transformer } from "react-konva";

import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Box, Size } from "~/Geometry";

import { Canvas } from "../Canvas";
import { Setup } from "../Canvas/Setup";

export * from "./Entities";

export type Entity = Editor.Dream | Editor.Image;

type Props = React.PropsWithChildren & {
  id: ID;

  draggable?: boolean;
  selectable?: boolean;
  resizable?: boolean;
  showHandles?: boolean;
  showBorder?: boolean;

  sizeClamp?: Partial<Size.Clamp>;
  onSizeChange?: (size: Size) => void;
};

export function Entity({
  id,

  draggable = true,
  selectable = true,
  resizable = true,

  showHandles = true,
  showBorder = true,

  onSizeChange,
  sizeClamp = {
    min: { width: 64, height: 64 },
    max: { width: 8192, height: 8192 },
  },

  children,
}: Props) {
  const [activeTool] = Editor.Tool.Active.use();
  const setCamera = Editor.Camera.useSet();

  const [entity, setEntity] = Editor.Entity.use(id);
  const [dragging, setDragging] = useState(false);
  const dragEnabled = draggable && !entity?.locked && activeTool === "select";
  const [SnapLines, snap, setLines] = Editor.Entities.Snapping.use(id);

  const select = Editor.Selection.useSelect();
  const selected = Editor.Selection.useSelected(id);
  const selection = Editor.Selection.use();
  const selectEnabled = selectable && activeTool === "select";

  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const zoom = Setup.useZoom();
  useEffect(() => {
    if (entity && dragging) {
      // drop entity if global zoom changes
      groupRef.current?.stopDrag();
      transformerRef.current?.stopTransform();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const [local, setLocalRaw] = useState<Box>(() => {
    const size = {
      width: entity?.width ?? 512,
      height: entity?.height ?? 512,
    };

    const local = {
      x: entity?.x ?? 0,
      y: entity?.y ?? 0,
      ...size,
    };

    onSizeChange?.(size);
    return local;
  });

  const setLocal = useCallback(
    (setBox: React.SetStateAction<Partial<Box>>) => {
      const box = typeof setBox === "function" ? setBox(local) : setBox;
      const size = Size.Clamp.apply(
        {
          width: box.width ?? local.width,
          height: box.height ?? local.height,
        },
        sizeClamp
      );

      const snapped = { ...local, ...box, ...size };

      setLocalRaw(snapped);
      onSizeChange?.(size);

      return snapped;
    },
    [local, sizeClamp, onSizeChange]
  );

  const onMouseDown = useCallback(
    (event: Editor.Canvas.Event.Mouse) => {
      event.evt.preventDefault();
      event.cancelBubble = !["brush", "export"].includes(activeTool);

      if (selected || !selectEnabled) return;

      const additionalSelections = event.evt.shiftKey ? selection : [];

      select(id, ...additionalSelections);
    },
    [activeTool, selected, selectEnabled, selection, select, id]
  );

  const onDoubleClick = useCallback(() => setCamera(local), [local, setCamera]);

  const onTransformStart = useCallback((event: Editor.Canvas.Event.Mouse) => {
    if (event.evt.button !== 0) return;
    event.evt.preventDefault();
    event.cancelBubble = true;
  }, []);

  const onTransform = useCallback(
    (event: Editor.Canvas.Event<Event>) => {
      const x = event.target.x();
      const y = event.target.y();

      const size = Size.Clamp.apply(
        {
          width: local.width * event.target.scaleX(),
          height: local.height * event.target.scaleY(),
        },
        {
          min: { width: 64, height: 64 },
          max: { width: 1024, height: 1024 },
        }
      );

      event.target.size(size);
      event.target.scale({ x: 1, y: 1 });

      setLocal({ x, y, ...size });
      !dragging && setDragging(true);
    },
    [local.width, local.height, setLocal, dragging]
  );

  const onTransformEnd = useCallback(
    (event: Editor.Canvas.Event.Drag) =>
      setEntity((entity) => {
        entity.x = event.target.x();
        entity.y = event.target.y();
        entity.width = event.target.width();
        entity.height = event.target.height();
        setDragging(false);
      }),
    [setEntity]
  );

  const onDragStart = useCallback(
    (event: Editor.Canvas.Event.Drag) => {
      if (!dragEnabled) return event.target.stopDrag();
      setDragging(true);

      for (const id of selection) {
        const node = groupRef.current?.getStage()?.findOne(`#${id}`);
        if (node && node !== event.target && !node.isDragging()) {
          node.startDrag(event);
        }
      }
    },
    [dragEnabled, selection]
  );

  const onDragMove = useCallback(
    (event: Canvas.Event.Drag) => {
      const x = event.target.x();
      const y = event.target.y();
      const snapped = snap({ ...local, x, y });
      event.target.position({ x: snapped.x, y: snapped.y });
      setLocal({ ...snapped, width: local.width, height: local.height });
    },
    [local, setLocal, snap]
  );

  const onDragEnd = useCallback(
    (event: Canvas.Event.Drag) => {
      setDragging(false);
      setEntity((entity) => {
        entity.x = event.target.x();
        entity.y = event.target.y();
      });
      setLines([]);
    },
    [setEntity, setLines]
  );

  useEffect(() => {
    if (dragging) return;
    setLocalRaw({
      x: entity?.x ?? local.x,
      y: entity?.y ?? local.y,
      width: entity?.width ?? local.width,
      height: entity?.height ?? local.height,
    });
  }, [
    entity?.x,
    entity?.y,
    entity?.width,
    entity?.height,
    setLocalRaw,
    local.x,
    local.y,
    local.width,
    local.height,
    dragging,
  ]);

  useEffect(() => {
    if (!selected || !transformerRef.current || !groupRef.current) return;
    transformerRef.current.nodes([groupRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selected]);

  const boundFunction = useCallback(
    (
      _oldBoundBox: Box & { rotation: number },
      newBoundBox: Box & { rotation: number }
    ) => ({
      ...newBoundBox,
      ...Size.Clamp.apply(newBoundBox, {
        min: { width: 64, height: 64 },
        max: { width: 1024, height: 1024 },
      }),
    }),
    []
  );

  if (!entity) return null;
  return (
    <>
      <Group
        id={id}
        x={local.x}
        y={local.y}
        ref={groupRef}
        draggable={draggable}
        onMouseDown={onMouseDown}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransform={onTransform}
        onTransformEnd={onTransformEnd}
      >
        <Rect x={0} y={0} width={local.width} height={local.height} />
        {children}
      </Group>
      {selected && !["brush", "export"].includes(activeTool) && resizable && (
        <Transformer
          {...(!dragEnabled && { enabledAnchors: [] })}
          ref={transformerRef}
          boundBoxFunc={boundFunction}
          onMouseDown={onTransformStart}
          anchorSize={Entity.Handle.size()}
          anchorFill={showHandles ? "white" : "transparent"}
          anchorStroke={showHandles ? "white" : "transparent"}
          borderStroke={showBorder ? "white" : "transparent"}
          rotateEnabled={false}
          flipEnabled={false}
        />
      )}
      <SnapLines />
    </>
  );
}

export namespace Entity {
  export type Definition<Config extends { type: string }> = Box &
    Config & {
      id: ID;
      index: number;
      type: Config["type"];
      visible: boolean;
      locked: boolean;
      title?: string;
    };

  export function use<E extends Entity>(id: string) {
    const entities = Editor.Entities.useMap();
    const setEntities = Editor.Entities.useSet();

    const entity = useMemo(
      () => entities.get(id) as E | undefined,
      [id, entities]
    );

    const setEntity = useCallback(
      (setEntity: (entity: Mutable<E>) => void) => {
        setEntities((previousEntities) => {
          const previousEntity = previousEntities.get(id);
          return !previousEntity
            ? previousEntities
            : new Map(previousEntities).set(
                id,
                copy(previousEntity as E, (entity) => void setEntity(entity))
              );
        });
      },
      [id, setEntities]
    );

    return [entity, setEntity] as const;
  }

  export function useType(id: string, type: Entity["type"]) {
    const [entity, setEntity] = Editor.Entity.use(id);
    return useMemo(() => {
      if (entity && entity.type === type) return [entity, setEntity] as const;
    }, [type, entity, setEntity]);
  }

  export const useTitle = (id: ID): string | undefined => {
    const { input } = Generation.Image.Input.use(id);
    const [entity] = Editor.Entity.use(id);
    return useMemo(
      () => entity?.title ?? input?.prompts[0]?.text,
      [entity?.title, input?.prompts]
    );
  };

  export namespace Handle {
    export const size = () => 12;
  }

  export namespace Border {
    export const size = () => 2;
  }
}
