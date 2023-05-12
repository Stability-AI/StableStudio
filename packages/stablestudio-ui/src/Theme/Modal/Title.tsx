export function Title({ className, children }: StyleableWithChildren) {
  return (
    <h1 className={classes("text-left text-2xl font-medium", className)}>
      {children}
    </h1>
  );
}
