import Konva from "konva";
import { Rect } from "react-konva";
import { Editor } from "~/Editor";

export function SelectBox() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rectRef = useRef<Konva.Rect>(null!);

  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [activeTool] = Editor.Tool.Active.use();

  const entities = Editor.Entities.use();
  const selection = Editor.Selection.use();
  const select = Editor.Selection.useSelect();

  const doSelection = useCallback(() => {
    const selected: string[] = [];
    let doUpd = false;
    entities.forEach((image) => {
      if (image.type !== "dream") return;
      if (
        Editor.Canvas.rectContainsRect(
          rectRef.current.x(),
          rectRef.current.y(),
          rectRef.current.width(),
          rectRef.current.height(),

          image.x,
          image.y,
          image.width,
          image.height
        )
      ) {
        selected.push(image.id);

        if (!selection.has(image.id)) {
          doUpd = true;
        }
      } else if (selection.has(image.id)) {
        doUpd = true;
      }
    });

    if (doUpd) {
      select(selected);
    }
  }, [entities, selection, select]);

  Editor.Canvas.useMouseDown(
    (e) => {
      if (activeTool === "select" && e.evt.button === 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const stage = e.target.getStage()!;
        const scale = stage.scaleX() || 1;
        const mousePos = stage.getPointerPosition() || { x: 0, y: 0 };
        const pos = stage.getPosition() || { x: 0, y: 0 };

        const newOrigin: [number, number] = [
          mousePos.x / scale - pos.x / scale,
          mousePos.y / scale - pos.y / scale,
        ];

        setOrigin(newOrigin);

        if (rectRef.current) {
          rectRef.current.position({ x: newOrigin[0], y: newOrigin[1] });
          rectRef.current.width(0);
          rectRef.current.height(0);
          rectRef.current.visible(true);
        }
      }
    },
    [activeTool, rectRef.current]
  );

  Editor.Canvas.useMouseMove(
    (e) => {
      if (
        activeTool === "select" &&
        origin !== null &&
        rectRef.current?.visible() &&
        e.evt.buttons === 1
      ) {
        const stage = rectRef.current?.getStage();

        if (!stage) {
          console.error("No stage");
          return;
        }

        stage.setPointersPositions(e.evt);
        const scale = stage.scaleX() || 1;
        const mousePos = stage.getPointerPosition() || { x: 0, y: 0 };
        const pos = stage.getPosition() || { x: 0, y: 0 };

        const newWidth = mousePos.x / scale - pos.x / scale - origin[0];
        const newHeight = mousePos.y / scale - pos.y / scale - origin[1];

        if (newWidth < 0) {
          rectRef.current.position({
            x: origin[0] + newWidth,
            y: rectRef.current.y(),
          });
          rectRef.current.width(-newWidth);
        } else {
          rectRef.current.width(newWidth);
        }

        if (newHeight < 0) {
          rectRef.current.position({
            x: rectRef.current.x(),
            y: origin[1] + newHeight,
          });
          rectRef.current.height(-newHeight);
        } else {
          rectRef.current.height(newHeight);
        }

        doSelection();
      }
    },
    [activeTool, rectRef.current, origin]
  );

  Editor.Canvas.useMouseUp(
    (e) => {
      if (activeTool === "select" && origin !== null && rectRef.current) {
        e.cancelBubble = true;
        rectRef.current.visible(false);

        // select everything in the box
        doSelection();

        setOrigin(null);
      }
    },
    [activeTool, rectRef.current]
  );

  return <Rect fill="#3b82f6" opacity={0.2} ref={rectRef} listening={false} />;
}
