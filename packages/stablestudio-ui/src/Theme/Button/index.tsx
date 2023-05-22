import { Theme } from "~/Theme";

export function Button(props: Button.Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    props.autoFocus && ref.current?.focus();
  }, [props.autoFocus]);

  const states = Button.useStates(props);
  const sizing = Button.useSizing(props);
  const colors = Button.useColors(props);
  const icons = Button.useIcons(props);
  const badges = Button.useBadges(props);

  const button = (
    <button
      ref={ref}
      style={props.style}
      onClick={
        props.disabled || props.loading ? undefined : (props.onClick as never)
      }
      onDoubleClick={props.onDoubleClick as never}
      className={classes(
        "group relative flex h-fit select-none flex-row items-center justify-center gap-1 whitespace-nowrap rounded align-middle font-light duration-150",
        sizing,
        colors,
        states,
        props.active && "hover group-hover",
        props.className
      )}
    >
      {icons.left}
      {props.children}
      {badges.right}
      {icons.right}
    </button>
  );

  if (props.label) {
    return (
      <Theme.Tooltip content={props.label} placement={props.labelPlacement}>
        {button}
      </Theme.Tooltip>
    );
  } else {
    return button;
  }
}

export namespace Button {
  export type Prop = React.ReactNode | React.FunctionComponent<Props>;
  export type Props = StyleableWithChildren & {
    size?: Theme.Common.Size;
    fullWidth?: boolean;

    color?: Theme.Common.Color | "darkerZinc";
    outline?: boolean;
    transparent?: boolean;
    translucent?: boolean;

    autoFocus?: boolean;
    active?: boolean;
    disabled?: boolean;
    selected?: boolean;
    itemsCenter?: boolean;
    style?: React.CSSProperties;

    icon?: Theme.Icon.Prop;
    iconLeft?: Theme.Icon.Prop;
    iconRight?: Theme.Icon.Prop;

    badge?: React.ReactNode | React.FunctionComponent<Theme.Badge.Props>;
    badgeRight?: React.ReactNode | React.FunctionComponent<Theme.Badge.Props>;

    label?: React.ReactNode;
    labelPlacement?: "top" | "bottom" | "left" | "right";

    loading?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDoubleClick?: (event: MouseEvent) => void;
  };

  export const useStates = ({ loading, disabled }: Props) =>
    useMemo(
      () =>
        loading || disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer opacity-100",
      [loading, disabled]
    );

  export const useSizing = ({
    size = Theme.Common.Size.preset(),
    fullWidth,
    children,
  }: Props) => {
    return useMemo(() => {
      return classes(
        "w-fit",
        fullWidth && "w-full",

        size === "sm" && classes("px-2.5 py-1 text-sm", !children && "px-1"),
        size === "md" && classes("px-3 py-1 text-base", !children && "px-1"),

        (size === "lg" || size === "xl") &&
          classes("px-4 py-2 text-base", !children && "px-2")
      );
    }, [fullWidth, size, children]);
  };

  export const useColors = ({
    color = Theme.Common.Color.preset(),
    outline,
    transparent,
    translucent,
  }: Props) =>
    useMemo(
      () =>
        classes(
          {
            brand:
              "bg-brand-500 shadow-brand-500-md dark:shadow-none dark:bg-brand-600 dark:hover:bg-brand-500 border-brand-500 dark:border-brand-600",

            indigo:
              "text-white bg-brand-500 shadow-brand-500-md dark:shadow-none dark:bg-brand-600",

            red: "bg-red-600 hover:bg-red-700 active:bg-red-800",

            green: "bg-green-600 hover:bg-green-700 active:bg-green-800",

            yellow: "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800",

            zinc: "shadow-black/5 bg-zinc-200 hover:bg-zinc-300 dark:shadow-none dark:text-white/80 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 border-black/20 dark:border-zinc-700",

            white:
              "shadow-black/5 bg-zinc-200 hover:bg-zinc-300 dark:shadow-none text-white/80 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 border-black/20 dark:border-zinc-700",

            darkerZinc:
              "bg-zinc-900 border border-black/20 dark:border-zinc-700 hover:border-zinc-300 duration-100 transition text-white",

            outline:
              "shadow-none dark:text-white text-black border border-transparent hover:border-zinc-700 focus:border-brand-500 active:bg-brand-500 active:text-white active:border-brand-500",
          }[outline ? "outline" : color],

          outline && "dark:hover:bg-zinc-700",

          transparent &&
            "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent shadow-none",

          translucent && "dark:bg-opacity-60 dark:hover:bg-opacity-80"
        ),
      [color, outline, transparent, translucent]
    );

  export const useIcons = ({
    icon,
    iconLeft = icon,
    iconRight,
    size = Theme.Common.Size.preset(),
    loading,
    children,
  }: Props) => {
    return useMemo(() => {
      const render = (icon: typeof iconRight, position: "left" | "right") => {
        const className = classes(
          "opacity-75 duration-100 group-hover:opacity-100 shrink",
          size === "sm" && "h-5 w-5",
          size === "md" && "h-6 w-6 p-px origin-center",
          size === "lg" && "h-6 w-6",
          position === "left" && "mr-1 -ml-1",
          position === "right" && "ml-1 -mr-1",
          !children ? "mx-0" : "p-0.5"
        );

        if (loading) return <Theme.Loading.Spinner className={className} />;
        if (!icon) return null;

        if (typeof icon === "function")
          return icon({ className, strokeWidth: 2.2 });

        if (typeof icon !== "object") return icon;
        if (React.isValidElement(icon)) return icon;

        return null;
      };

      return {
        left: (loading || iconLeft) && render(iconLeft, "left"),
        right: iconRight && render(iconRight, "right"),
      };
    }, [iconLeft, iconRight, size, loading, children]);
  };

  export const useBadges = ({ badgeRight, size, fullWidth }: Props) =>
    useMemo(() => {
      const render = (badge: typeof badgeRight, position: "right") => {
        const className = classes(
          position === "right" && !fullWidth && "ml-1 -mr-1"
        );

        if (!badge) return null;

        if (typeof badge === "function") return badge({ size, className });
        if (typeof badge !== "object") return badge;

        if (React.isValidElement(badge)) return badge;

        return null;
      };

      const right = render(badgeRight, "right");

      return {
        right:
          right && !fullWidth ? (
            right
          ) : (
            <div className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
              {right}
            </div>
          ),
      };
    }, [badgeRight, size, fullWidth]);
}
