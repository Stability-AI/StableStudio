type Props = StyleableWithChildren & {
  fullWidth?: boolean;
  fullHeight?: boolean;
};

export function Page({
  fullWidth = false,
  fullHeight = false,
  className,
  children,
}: Props) {
  return (
    <div
      className={classes(
        "absolute top-0 left-0 right-0 bottom-0 flex grow flex-col items-center overflow-y-auto p-4 pb-20 sm:p-8 sm:pb-20 md:p-12 md:pb-20",
        fullWidth && "pl-0 pr-0 sm:pl-0 sm:pr-0 md:pl-0 md:pr-0",
        fullHeight && "pt-0 pb-0 sm:pt-0 sm:pb-0 md:pt-0 md:pb-0",
        className
      )}
      css={css`
        overflow-anchor: none;
      `}
    >
      <div
        className={classes(
          "max-w-[1600px] grow",
          fullWidth && "w-full max-w-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
