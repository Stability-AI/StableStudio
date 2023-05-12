import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export * from "./Panels";

export function Panel({
  visible = true,
  position,
  icon,
  title,
  left,
  className,
  contentClassName,
  children,
  ...props
}: StyleableWithChildren & {
  contentClassName?: string;
  visible?: boolean;
  position: Panel.Position;
  icon?: React.ComponentProps<typeof Theme.Button>["icon"];
  title?: React.ReactNode;
  bar?: React.ReactNode;
  left?: React.ReactNode;
  onClick?: () => void;
}) {
  const [expanded, setExpanded] = Editor.Panels.useExpanded(position);
  const bottom = position == "bottomLeft" || position == "bottomRight";
  const right = position === "topRight" || position === "bottomRight";

  const resizeCanvas = Editor.Canvas.useResize();
  useEffect(resizeCanvas, [expanded, resizeCanvas]);

  const onClick = useCallback(
    () => props.onClick ?? setExpanded((expanded) => !expanded),
    [props.onClick, setExpanded]
  );

  const Chevron = useCallback(
    (props: Styleable) => (
      <Theme.Icon.ChevronUp
        className={classes(
          props.className,
          right ? "-ml-0.5" : "-mr-0.5",
          ((bottom && expanded) || (!bottom && !expanded)) && "rotate-180"
        )}
      />
    ),
    [bottom, expanded, right]
  );

  const button = title && children && visible && (
    <div className="flex gap-2">
      {!expanded && left}
      <Theme.Button
        transparent={expanded}
        onClick={onClick}
        className="shrink-0"
        iconLeft={right ? icon : Chevron}
        iconRight={!right ? icon : Chevron}
      >
        {title}
      </Theme.Button>
    </div>
  );

  const barContent = (
    <div
      className={classes(
        "flex items-center gap-2 px-2",
        right && "justify-start"
      )}
    >
      {props.bar}
    </div>
  );

  const bar = (
    <div className="flex cursor-pointer">
      {right && barContent}
      <div
        onClick={() => setExpanded(false)}
        className={classes("flex grow cursor-pointer", right && "justify-end")}
      >
        {button}
      </div>
      {!right && barContent}
    </div>
  );

  return (
    <div
      className={classes(
        "relative z-10 min-h-0",
        !visible && "hidden",
        !expanded && (right ? "self-end" : "self-start"),
        className
      )}
    >
      {!bottom && !expanded && button}
      {expanded && children && (
        <div
          className={classes(
            "pointer-events-auto flex h-full w-[500px] flex-col overflow-hidden rounded-md bg-zinc-50 text-neutral-700 shadow-2xl dark:bg-zinc-800 dark:text-white dark:shadow-none dark:ring-[1px] dark:ring-white/10",
            contentClassName
          )}
        >
          {expanded && left && (
            <div className="absolute right-[100%] top-0 mr-2">{left}</div>
          )}
          {!bottom && bar}
          {children}
          {bottom && bar}
        </div>
      )}
      {bottom && !expanded && button}
    </div>
  );
}

export namespace Panel {
  export type Position = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}
