import useResizeObserver from "@react-hook/resize-observer";
import { useClickAway } from "react-use";

import { Box } from "~/Geometry";
import { Theme } from "~/Theme";

export type Option = {
  name: React.ReactNode;
  value: any;
  image?: string;
  disabled?: boolean;
};

export function Popout({
  onClick,
  className,
  options,
  value,
  title,
  placeholder,
  label,
  children,
  anchor = "top",
}: StyleableWithChildren & {
  onClick: (value: any) => void;
  options: Option[];
  value: any;
  title?: React.ReactNode;
  placeholder?: React.ReactNode;
  label?: string;
  anchor?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const [positioningRef] = useBox([open]);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => setOpen(false));

  const valueOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const isMobileDevice = Theme.useIsMobileDevice();

  return (
    <div ref={containerRef}>
      {open && (
        <div
          ref={positioningRef}
          className="fixed z-50 block"
          style={
            !isMobileDevice
              ? {
                  ...(anchor === "top"
                    ? {
                        top: `${
                          containerRef.current?.getBoundingClientRect().top
                        }px`,
                      }
                    : {
                        bottom: `${
                          window.innerHeight -
                          (containerRef.current?.getBoundingClientRect()
                            .bottom ?? 0)
                        }px`,
                      }),
                  left: `${
                    (containerRef.current?.getBoundingClientRect().left ?? 0) +
                    (containerRef.current?.getBoundingClientRect().width ?? 0)
                  }px`,
                }
              : {
                  bottom: "0",
                  left: "0",
                  width: "100%",
                  right: "0",
                }
          }
        >
          <Floating
            onClick={(value) => {
              onClick(value);
              setOpen(false);
            }}
            options={options}
            value={value}
            title={title}
          >
            {children}
          </Floating>
        </div>
      )}
      <div className="flex flex-col gap-1">
        {label && <Theme.Label>{label}</Theme.Label>}
        <div
          className={classes(
            "flex cursor-pointer flex-row items-center rounded border border-transparent py-1 pl-2 pr-1 duration-100",
            open ? "bg-zinc-700/50" : "hover:border-zinc-700",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          {valueOption?.image && (
            <img
              className="mr-2 h-5 w-5 rounded"
              src={valueOption.image}
              alt="Preset Image"
            />
          )}
          <h1 className="w-full grow select-none">
            {valueOption?.name ?? placeholder ?? "Select"}
          </h1>
          <Theme.Icon.ChevronRight className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function Floating({
  onClick,
  title,
  options,
  value,
  children,
}: {
  onClick: (preset: string) => void;
  title?: React.ReactNode;
  options: Option[];
  value: any;
  children: React.ReactNode;
}) {
  const hasImages = useMemo(
    () => options.some((option) => option.image),
    [options]
  );

  return (
    <div className="flex max-h-[70vh] flex-col overflow-y-auto rounded border border-zinc-700 bg-zinc-900 shadow-lg drop-shadow-lg sm:ml-3 sm:max-h-[30rem] sm:w-[25rem]">
      <div className="sticky top-0 z-[1] flex flex-row items-center justify-between border-b border-zinc-700 bg-zinc-900 px-3 py-1.5">
        <h1 className="grow">{title}</h1>
        <Theme.Icon.X
          className="opacity-muted h-5 w-5 cursor-pointer hover:opacity-100"
          strokeWidth={1.5}
          onClick={() => onClick(value)}
        />
      </div>
      <div
        className={classes(
          "grid gap-y-6 p-3",
          hasImages ? "grid-cols-3 gap-4" : "gap-3"
        )}
      >
        {!!children
          ? children
          : options.map((option, index) => (
              <div
                key={index}
                onClick={
                  option.disabled ? doNothing : () => onClick(option.value)
                }
                className={classes(
                  "group flex cursor-pointer flex-col rounded duration-100",
                  option.disabled && "opacity-muted cursor-not-allowed"
                )}
              >
                {option.image ? (
                  <img
                    className="mb-2 aspect-square h-full w-full rounded-lg border border-transparent duration-100 group-hover:border-zinc-200"
                    src={option.image}
                    alt="Preset Image"
                  />
                ) : (
                  hasImages && (
                    <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-lg border border-transparent bg-black/20 duration-100 group-hover:border-zinc-200">
                      <Theme.Icon.Slash className="opacity-muted h-12 w-12" />
                    </div>
                  )
                )}
                <h1
                  className={classes(
                    "w-full grow select-none text-zinc-400 group-hover:text-zinc-200",
                    option.value === value && "font-medium text-white"
                  )}
                >
                  {option.name}
                </h1>
              </div>
            ))}
      </div>
    </div>
  );
}

const useBox = (deps: unknown[]) => {
  const ref = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState<Box>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const safeSetBox = useCallback(
    (updatedBox?: Box) =>
      setBox(
        (box) => updatedBox ?? ref.current?.getBoundingClientRect() ?? box
      ),
    [setBox]
  );

  useResizeObserver(ref, () => safeSetBox());
  useLayoutEffect(safeSetBox, [...deps, safeSetBox]);

  return [ref, box] as const;
};
