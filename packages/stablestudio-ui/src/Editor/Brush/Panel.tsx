import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export function Panel() {
  const setBrush = Editor.Brush.useSet();
  const brush = Editor.Brush.use();
  const { solid, blurred } = usePreviews({ onClick: setBrush });
  return (
    <div className="pointer-events-auto max-w-[300px] overflow-hidden">
      <div className="py-3">
        <Previews>{solid}</Previews>
        <Previews>{blurred}</Previews>
      </div>
      <Theme.Divider>Settings</Theme.Divider>
      <div className="mb-2 flex flex-col gap-4 p-4 text-zinc-300 dark:text-white">
        <Theme.Slider
          title="Size"
          value={brush.size}
          min={Editor.Brush.Size.min()}
          max={Editor.Brush.Size.max()}
          onChange={(size) => setBrush((brush) => ({ ...brush, size }))}
        />
        <Theme.Slider
          title="Strength"
          step={1}
          value={brush.strength * 100}
          min={Editor.Brush.Strength.min() * 100}
          max={Editor.Brush.Strength.max() * 100}
          onChange={(strength) =>
            setBrush((brush) => ({ ...brush, strength: strength / 100 }))
          }
        />
        <Theme.Slider
          title="Blur"
          value={brush.blur}
          max={Editor.Brush.Blur.max()}
          onChange={(blur) => setBrush((brush) => ({ ...brush, blur }))}
        />
      </div>
      <Theme.Divider>Preview</Theme.Divider>
      <div className="py-4">
        <Previews>
          <Preview highlighted {...brush} />
        </Previews>
      </div>
    </div>
  );
}

function Previews({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-stretch justify-center p-2">{children}</div>
  );
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
          highlighted ? "bg-brand-500" : "bg-zinc-600"
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

function usePreviews({ onClick }: { onClick: (brush: Editor.Brush) => void }) {
  const blurMin = 2;
  return useMemo(() => {
    const count = 10;
    const brushes = Array.from({ length: count }, (_, index) => {
      const size =
        Editor.Brush.Size.min() +
        (index / (count - 1)) *
          (Editor.Brush.Size.max() - Editor.Brush.Size.min());

      const blur =
        blurMin +
        Math.pow(index / (count - 1), 2) * (Editor.Brush.Blur.max() - blurMin);

      return { size, blur };
    });

    const presets = [...brushes, ...brushes].map(({ size, blur }, index) => {
      const isSmooth = index >= brushes.length;
      return (
        <Preview
          selectable
          key={index}
          scaleSize={(n) => n / 6 + 5}
          scaleBlur={(n) => Math.max(n / 4, isSmooth ? blurMin : 0)}
          {...{ onClick, size, blur: isSmooth ? blur : 0 }}
        />
      );
    });

    return {
      solid: presets.slice(0, brushes.length),
      blurred: presets.slice(-brushes.length),
    };
  }, [onClick]);
}
