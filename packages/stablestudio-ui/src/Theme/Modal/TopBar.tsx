import { Theme } from "..";

export function TopBar({
  className,
  children,
  onClose,
}: StyleableWithChildren & {
  onClose?: () => void;
}) {
  return (
    <div
      className={classes(
        "flex flex-row items-center justify-between rounded-t-lg border-b border-black/20 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      <div>{children}</div>
      <Theme.Button icon={Theme.Icon.X} onClick={() => onClose?.()} />
    </div>
  );
}
