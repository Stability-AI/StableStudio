export function Label({ children, className }: StyleableWithChildren) {
  return (
    <h2
      className={classes(
        "-mb-1 ml-2.5 select-none font-normal text-slate-800 dark:text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}
