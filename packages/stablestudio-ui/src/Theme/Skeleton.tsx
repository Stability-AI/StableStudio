export function Skeleton({ className }: Styleable) {
  return (
    <div
      className={classes(
        "animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700",
        className
      )}
    />
  );
}
