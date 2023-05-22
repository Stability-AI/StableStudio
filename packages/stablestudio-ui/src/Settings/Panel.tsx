export function Panel({ className, children }: StyleableWithChildren) {
  return (
    <div
      className={classes(
        "rounded border border-black/20 dark:border-zinc-700 bg-white p-5 dark:bg-zinc-800",
        className
      )}
    >
      {children}
    </div>
  );
}
