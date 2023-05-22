export function Panel({ className, children }: StyleableWithChildren) {
  return (
    <div
      className={classes(
        "flex flex-col rounded-lg border border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white",
        className
      )}
    >
      {children}
    </div>
  );
}
