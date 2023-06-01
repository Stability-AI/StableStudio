import { Theme } from "~/Theme";

export function Badge({
  variant,
  size = Theme.Common.Size.preset(),
  color = Theme.Common.Color.preset(),
  className,
  children,
}: Badge.Props) {
  const colors = useMemo(
    () =>
      classes(
        color === "brand" && "bg-brand-800",
        color === "zinc" &&
          (variant === "outline"
            ? "border border-zinc-300 dark:border-zinc-700 bg-none"
            : "bg-zinc-700")
      ),
    [variant, color]
  );

  return (
    <span
      className={classes(
        "rounded",
        colors,
        size === "sm" && "py-0.25 rounded px-1.5 text-xs",
        size === "md" && "px-2 py-0.5 text-sm",
        size === "lg" && "px-2 py-0.5 text-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

export namespace Badge {
  export type Props = StyleableWithChildren & {
    variant?: "outline";
    size?: Theme.Common.Size;
    color?: Theme.Common.Color;
  };
}
