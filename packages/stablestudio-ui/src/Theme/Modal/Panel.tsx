export function Panel({ className, children }: StyleableWithChildren) {
  return (
    <div
      className={classes(
        "flex flex-col rounded-lg border border-zinc-700 bg-zinc-900",
        className
      )}
    >
      {children}
    </div>
  );
}
