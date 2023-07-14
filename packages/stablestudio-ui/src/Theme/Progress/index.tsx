export type Progress = Styleable & {
  value?: number;
};

export function Progress({ value, className }: Progress) {
  return (
    <div
      className={classes(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
    >
      <div
        className="duration-50 bg-brand-500 absolute left-0 top-0 h-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
