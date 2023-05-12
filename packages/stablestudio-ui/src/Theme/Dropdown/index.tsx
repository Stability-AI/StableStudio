import { useClickAway } from "react-use";

import { Theme } from "..";

export type Dropdown<
  Options extends Dropdown.Options,
  Item extends Dropdown.Options[number] = Dropdown.Options[number],
  Value extends Item["value"] = Item["value"]
> = StyleableWithChildren & {
  value?: Value;
  options?: Options;
  onChange?: (item: Item) => void;

  title?: React.ReactNode;
  placeholder?: string;
  size?: Theme.Common.Size;
  noPadding?: boolean;
  transparent?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  fixed?: boolean;
  innerClassName?: string;
};

export function Dropdown<Options extends Dropdown.Options>({
  value,
  onChange,

  title,
  placeholder = "Select Option...",
  size = Theme.Common.Size.preset(),
  transparent,
  fullWidth,

  className,

  ...props
}: Dropdown<Options>) {
  // TODO: Share with `Theme.Button`
  const sizing = useMemo(
    () =>
      classes(
        size === "sm" && "px-2.5 py-1 text-sm",
        size === "md" && "px-2 py-1.5 text-base",
        size === "lg" && "px-4 py-1 text-lg"
      ),
    [size]
  );

  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // set the width to the side of the select + some room for the icon
    if (parentRef.current && selectRef.current && !fullWidth) {
      parentRef.current.style.width = `${
        selectRef.current.getBoundingClientRect().width + 16
      }px`;
    }
  }, [fullWidth]);

  useClickAway(parentRef, () => setOpen(false));

  return (
    <div
      ref={parentRef}
      className={classes(
        "group relative cursor-pointer rounded duration-150",
        fullWidth && "w-[calc(100% + 0.5rem)] -mx-2",
        className
      )}
    >
      <div
        className={classes(
          "pointer-events-none absolute inset-0 rounded border duration-150",
          transparent
            ? "border-transparent bg-transparent"
            : open
            ? "border-transparent bg-zinc-700/50"
            : "border-zinc-800 group-hover:border-zinc-700"
        )}
      />
      <select
        ref={selectRef}
        className={classes(
          "inline-block w-full cursor-pointer appearance-none rounded bg-zinc-900 focus:outline-none",
          transparent && "bg-transparent",
          sizing,
          props.innerClassName
        )}
        value={value}
        onChange={(event) => {
          const selected = props.options?.find(
            (item) => item.value === event.target.value
          );
          if (selected) onChange?.(selected);
          setOpen(false);
        }}
        onMouseDown={() => setOpen(!open)}
        disabled={props.disabled}
        placeholder={placeholder}
      >
        {title && (
          <option value="" disabled>
            {title}
          </option>
        )}
        {props.options?.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute top-0 right-1 inline-block h-full">
        <div className="flex h-full w-full items-center justify-center">
          {open ? (
            <Theme.Icon.ChevronUp className="h-6 w-6" />
          ) : (
            <Theme.Icon.ChevronDown className="h-6 w-6" />
          )}
        </div>
      </div>
    </div>
  );
}

export namespace Dropdown {
  export type Options = Item[];
  export type Item = {
    value: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
  };
}
