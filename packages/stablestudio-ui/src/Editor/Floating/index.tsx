import Konva from "konva";
import { Shape } from "react-konva";

import { Editor } from "~/Editor";
import { Box } from "~/Geometry";
import { GlobalState } from "~/GlobalState";

export function Floating() {
  const { elements } = Floating.useState();
  const triggerWheelEvent = Editor.Canvas.useTriggerWheelEvent();
  const triggerMouseMoveEvent = Editor.Canvas.useTriggerMouseMoveEvent();
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-screen w-screen overflow-hidden"
      id="floating-portal"
      onWheel={triggerWheelEvent as any}
      onMouseMove={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        triggerMouseMoveEvent(e as any);
      }}
    >
      {useMemo(
        () =>
          Object.entries(elements).map(
            ([id, { absolute, content, keepOnScreen }]) => {
              return (
                <Element
                  key={id}
                  id={id}
                  absolute={absolute}
                  content={content}
                  keepOnScreen={keepOnScreen}
                />
              );
            }
          ),
        [elements]
      )}
    </div>
  );
}

function Element({
  id,
  absolute,
  content,
  keepOnScreen,
}: {
  id: ID;
  absolute: Box;
  content: React.ReactNode;
  keepOnScreen?: boolean;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keepOnScreen) {
      const element = elementRef.current;
      if (!element) return;

      const height = element.getBoundingClientRect().height;
      const width = element.getBoundingClientRect().width;

      // make sure the element is not off the screen
      const x = Math.min(
        Math.max(absolute.x, width),
        window.innerWidth - width - 10
      );

      const y = Math.min(
        Math.max(absolute.y, height),
        window.innerHeight - height - 10
      );

      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
  }, [absolute, keepOnScreen]);

  return (
    <div
      key={id}
      className="absolute"
      style={{
        left: `${absolute.x}px`,
        top: `${absolute.y}px`,
        width: `${absolute.width}px`,
        height: `${absolute.height}px`,
      }}
      ref={elementRef}
    >
      {content}
    </div>
  );
}

export namespace Floating {
  export const useState = GlobalState.create<{
    elements: {
      [id: ID]: {
        absolute: Box;
        content: React.ReactNode;
        keepOnScreen?: boolean;
      };
    };
  }>(() => ({
    elements: {},
  }));

  export function use({
    id,
    content,
    keepOnScreen,
    width = 0,
    height = 0,
    x = 0,
    y = 0,
  }: Partial<Box> & {
    id: ID;
    content: React.ReactNode;
    keepOnScreen?: boolean;
  }) {
    const setState = useState.setState;
    const setAbsolute = useCallback(
      (absolute: Box) => {
        setState((state) => ({
          ...state,
          elements: {
            ...state.elements,
            [id]: {
              absolute,
              content,
              keepOnScreen,
            },
          },
        }));
      },
      [setState, id, content, keepOnScreen]
    );

    const onResize = useCallback(
      (_context: unknown, shape: Konva.Shape) =>
        setAbsolute({
          x: shape.getAbsolutePosition().x,
          y: shape.getAbsolutePosition().y,
          width: shape.getAbsoluteScale().x * width,
          height: shape.getAbsoluteScale().y * height,
        }),
      [width, height, setAbsolute]
    );

    useEffect(
      () => () =>
        setState((state) => {
          const { [id]: _removedElement, ...elements } = state.elements;
          return { ...state, elements };
        }),
      [id, setState]
    );

    return <Shape x={x} y={y} sceneFunc={onResize} />;
  }
}
