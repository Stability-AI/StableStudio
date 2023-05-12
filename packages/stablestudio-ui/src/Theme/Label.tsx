export function Label({ children, className }: StyleableWithChildren) {
  return (
    <h2
      className={classes(
        "opacity-muted ml-2.5 -mb-1 select-none text-sm font-light",
        className
      )}
    >
      {children}
    </h2>
  );
}
