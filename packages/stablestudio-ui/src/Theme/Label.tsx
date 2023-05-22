export function Label({ children, className }: StyleableWithChildren) {
  return (
    <h2
      className={classes(
        "opacity-muted -mb-1 ml-2.5 select-none text-sm font-light",
        className
      )}
    >
      {children}
    </h2>
  );
}
