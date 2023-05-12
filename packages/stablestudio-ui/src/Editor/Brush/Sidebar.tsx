import { App } from "~/App";
import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export namespace Sidebar {
  export function Section() {
    const setBrush = Editor.Brush.useSet();
    const brush = Editor.Brush.use();
    return (
      <App.Sidebar.Section
        title="Eraser settings"
        defaultExpanded
        collapsable
        divider
      >
        <div className="flex w-full items-center gap-5">
          <div className="relative flex aspect-square w-[10rem] items-center justify-center overflow-hidden rounded bg-white/10">
            <Theme.Checkered />
            <Preview
              highlighted
              {...brush}
              scaleBlur={(v) => v / 2.5}
              scaleSize={(v) => v / 2.5}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Theme.Slider
              title="Size"
              value={brush.size}
              min={Editor.Brush.Size.min()}
              max={Editor.Brush.Size.max()}
              onChange={(size) => setBrush((brush) => ({ ...brush, size }))}
            />
            <Theme.Slider
              title="Blur"
              value={brush.blur}
              max={Editor.Brush.Blur.max()}
              onChange={(blur) => setBrush((brush) => ({ ...brush, blur }))}
            />
            <Theme.Slider
              title="Strength"
              step={1}
              percentage
              value={brush.strength * 100}
              min={Editor.Brush.Strength.min() * 100}
              max={Editor.Brush.Strength.max() * 100}
              onChange={(strength) =>
                setBrush((brush) => ({ ...brush, strength: strength / 100 }))
              }
            />
          </div>
        </div>
      </App.Sidebar.Section>
    );
  }
}

function Preview({
  size = Editor.Brush.Size.preset(),
  strength = Editor.Brush.Strength.preset(),
  blur = Editor.Brush.Blur.preset(),
  selectable = false,
  scaleSize = (n) => n,
  scaleBlur = (n) => n,
  onClick,
  ...props
}: Partial<Editor.Brush> & {
  highlighted?: boolean;
  selectable?: boolean;
  scaleSize?: (value: number) => number;
  scaleBlur?: (value: number) => number;
  onClick?: (brush: Editor.Brush) => void;
}) {
  const brush = Editor.Brush.use();

  const [hovering, setHovering] = useState(false);
  const matches = size === brush.size && blur === brush.blur;
  const highlighted = props.highlighted ?? (hovering || matches);

  return (
    <div
      className={classes(
        "flex grow items-center justify-center self-stretch",
        selectable && "cursor-pointer"
      )}
      onClick={() => onClick?.({ ...brush, size, blur })}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={classes(
          "rounded-full",
          highlighted ? "bg-white" : "bg-zinc-600"
        )}
        style={{
          filter: `blur(${scaleBlur(blur)}px)`,
          width: `${scaleSize(size)}px`,
          height: `${scaleSize(size)}px`,
          opacity: strength,
        }}
      />
    </div>
  );
}
