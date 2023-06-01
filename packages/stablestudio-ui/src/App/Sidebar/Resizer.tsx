import { cx } from "@emotion/css";
import { App } from "~/App";
import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export type Resizer = {
  width: number;
  onChange?: (width: number) => void;
};

export function Resizer({ position }: App.Sidebar.Props) {
  const [resizing, setResizing] = useState(false);
  const [sidebar, setSidebar] = App.Sidebar.use(position);
  const isMobileDevice = Theme.useIsMobileDevice();
  const resize = Editor.Canvas.useResize();

  const toggleSidebar = useCallback(() => {
    if (isMobileDevice) {
      return setSidebar(({ visible }) => ({ visible: !visible }));
    } else {
      setSidebar(({ width }) => ({
        width: width === 0 ? App.Sidebar.presetWidth() : 0,
      }));
    }
  }, [isMobileDevice, setSidebar]);

  useEffect(() => {
    const onMouseUp = () => setResizing(false);
    const onMouseMove = (event: MouseEvent) => {
      if (!resizing) return;

      event.preventDefault();
      event.stopPropagation();
      setSidebar({
        width: clamp(
          0,
          position === "left"
            ? event.clientX
            : window.innerWidth - event.clientX,
          600
        ),
      });
      resize();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [position, resize, resizing, setSidebar]);

  return (
    <div
      onMouseDown={useCallback(
        () => !isMobileDevice && setResizing(true),
        [isMobileDevice, setResizing]
      )}
      style={{ [position]: "100%" }}
      className={classes(
        "group absolute bottom-0 top-0 flex w-5 cursor-col-resize",
        position === "right" && "justify-end"
      )}
    >
      <div
        className={classes(
          "absolute p-2 duration-150 group-hover:opacity-100 sm:opacity-100 md:opacity-0",
          sidebar.width === 0 && "opacity-muted"
        )}
      >
        <Theme.Button
          className={cx("dark:bg-zinc-700", isMobileDevice && "h-10 w-16")}
          onClick={toggleSidebar}
          icon={
            position === "left" && sidebar.width > 0 && sidebar.visible
              ? Theme.Icon.ChevronLeft
              : Theme.Icon.ChevronRight
          }
        />
      </div>
      <div className="relative">
        <Line resizing={resizing} />
        <Line resizing={resizing} className="w-1 blur-md" />
      </div>
    </div>
  );
}

function Line({ resizing, className }: Styleable & { resizing?: boolean }) {
  return (
    <div
      className={classes(
        "bg-brand-500 absolute top-0 h-full w-0.5 -translate-x-1/2 opacity-0 duration-150 group-hover:opacity-70",
        resizing && "opacity-100 group-hover:opacity-100",
        className
      )}
    />
  );
}
