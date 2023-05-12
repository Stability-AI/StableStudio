import { Theme } from "~/Theme";

export function Checkered({
  size = Theme.Common.Size.preset(),
  className,
}: Styleable & {
  size?: Theme.Common.Size;
}) {
  return (
    <div
      style={{
        backgroundImage: "url('./Checkers.png')",
        ...(size === "sm" && {
          backgroundSize: "6px 6px",
        }),
      }}
      className={classes(
        "absolute left-0 top-0 h-full w-full bg-black bg-local bg-center bg-repeat",
        className
      )}
    >
      <div className="h-full w-full bg-zinc-800/90" />
    </div>
  );
}
