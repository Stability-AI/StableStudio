export function Panel({ className, children }: StyleableWithChildren) {
  return (
    <div
      className={classes(
        "rounded border border-zinc-700 bg-zinc-800 p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
