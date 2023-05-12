export function Divider({
  variant = "horizontal",
  children,
  className,
  lineClassName,
}: Divider.Props) {
  const line = (
    <div
      className={classes(
        "bg-muted-white-extra grow",
        variant === "horizontal" && "h-[1px]",
        variant === "vertical" && "w-[1px]",
        lineClassName
      )}
    />
  );

  return (
    <div
      className={classes(
        "flex select-none items-center justify-center",
        variant === "horizontal" && "w-full flex-row",
        variant === "vertical" && "min-h-full flex-col",
        !!children && "-mb-2",
        className
      )}
    >
      {line}
      {children && (
        <div className="text-muted-white mx-2 flex items-center justify-center">
          {children}
        </div>
      )}
      {children && line}
    </div>
  );
}

export namespace Divider {
  export type Props = StyleableWithChildren & {
    variant?: "horizontal" | "vertical";
    lineClassName?: string;
  };

  export function Inline() {
    return <span className="text-muted-white">/</span>;
  }
}
