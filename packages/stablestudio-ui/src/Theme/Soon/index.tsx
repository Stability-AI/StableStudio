export function Soon({ className, children }: StyleableWithChildren) {
  return (
    <span className={classes("opacity-muted text-sm", className)}>
      {children ?? <>soon™</>}
    </span>
  );
}
