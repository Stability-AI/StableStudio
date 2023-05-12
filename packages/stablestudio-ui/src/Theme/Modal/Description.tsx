export function Description({ className, children }: StyleableWithChildren) {
  return (
    <p className={classes("text-left opacity-90", className)}>{children}</p>
  );
}
