export function Title({ className, children }: StyleableWithChildren) {
  return (
    <h1
      className={classes(
        "text-left text-2xl font-medium text-zinc-800 dark:text-white",
        className
      )}
    >
      {children}
    </h1>
  );
}
