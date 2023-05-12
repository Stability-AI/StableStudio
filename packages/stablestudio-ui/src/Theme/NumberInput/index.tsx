import { Theme } from "~/Theme";

export function NumberInput(rawProps: Input.Props) {
  const {
    onChange: propsOnChange,
    onNumberChange: propsOnNumberChange,
    ...props
  } = Input.Props.usePresets(rawProps);

  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.value);

  useEffect(() => setValue(props.value), [props.value, setValue]);

  const parseNumber = Input.useParseNumber({
    ...props,
    clamping: false,
  });

  const onFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (props.disabled) return;
      setFocused(true);
      props.autoSelect && event.target.select();
    },
    [props.disabled, props.autoSelect]
  );

  const onValueChange = useCallback(
    (value: string) => {
      setValue(value);
      propsOnChange?.(value);

      if (!props.number || !propsOnNumberChange) return;

      const number = parseNumber(value);
      number && propsOnNumberChange(number);
    },
    [props.number, parseNumber, propsOnChange, propsOnNumberChange]
  );

  const onBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseNumber(value);
    if (parsed) {
      onValueChange(
        `${clamp(props.min ?? -Infinity, parsed, props.max ?? Infinity)}`
      );
    } else {
      onValueChange(props.value ? `${props.value}` : "");
    }
  }, [onValueChange, parseNumber, props.max, props.min, props.value, value]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onValueChange(event.target.value),
    [onValueChange]
  );

  const { icon, iconRight, outsideIcon } = Input.useIcons({
    ...props,
    value,
    onChange: onValueChange,
  });

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") event.currentTarget.blur();
    },
    []
  );

  return (
    <div
      className={classes(
        "group flex flex-col gap-1",
        !props.fullWidth && "w-fit",
        props.className
      )}
    >
      {props.label && (
        <label className="opacity-muted text-sm font-light">
          {props.label}
        </label>
      )}
      <div
        className={classes(
          "-ml-1 flex flex-row items-center",
          props.containerClassName
        )}
      >
        {outsideIcon}
        <div
          className={classes(
            "flex flex-row items-center rounded pl-1 outline outline-1 outline-transparent duration-150",
            focused ? "outline-brand-500" : "group-hover:outline-zinc-700",
            props.inputClassName
          )}
        >
          {icon}
          <input
            className={classes(
              "rounded bg-transparent py-0.5 text-black outline-none placeholder:text-black/50 dark:text-white dark:placeholder:text-white/20",
              props.disabled && "cursor-not-allowed",
              props.fullWidth ? "w-full" : "w-20",
              props.percentage && "w-12 text-right"
            )}
            value={
              !focused && props.round && !isNaN(Number(value))
                ? Math.round(Number(value))
                : value
            }
            onChange={onChange}
            placeholder={props.placeholder}
            disabled={props.disabled}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
          {iconRight ??
            (props.percentage && <div className="opacity-muted px-1">%</div>)}
        </div>
      </div>
    </div>
  );
}

export namespace Input {
  export type Props = Styleable & {
    value?: string | number;
    percentage?: boolean;
    number?: boolean;
    min?: number;
    max?: number;
    step?: number;

    icon?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props> | string;
    iconRight?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props>;
    outsideIcon?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props>;
    loading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    fullWidth?: boolean;
    autoSelect?: boolean;
    /** If true, the value will be clamped to the min/max range when the input changes */
    clamping?: boolean;
    round?: boolean;

    inputClassName?: string;
    containerClassName?: string;

    onChange?: (value: string) => void;
    onNumberChange?: (number: number) => void;
    onFocus?: (
      event:
        | React.FocusEvent<HTMLTextAreaElement>
        | React.FocusEvent<HTMLInputElement>
    ) => void;
  };

  export namespace Props {
    export const usePresets = (props: Props) =>
      useMemo(
        () => ({
          value: props.value ?? "",

          percentage: props.percentage ?? false,
          number: props.number ?? false,

          min: props.min ?? -Infinity,
          max: props.max ?? Infinity,
          step: props.step ?? 1,

          autoSelect: props.autoSelect ?? true,

          ...props,
        }),
        [props]
      );
  }

  export const useParseNumber = ({ number, min, max, step, clamping }: Props) =>
    useCallback(
      (value: string | number) => {
        if (!number) return;
        if (value === "") return;

        const float = typeof value === "number" ? value : parseFloat(value);
        if (isNaN(float)) return;

        const fraction = (step ?? 1) % 1;
        const decimalPlaces = fraction.toString().split(".")[1]?.length ?? 0;
        const rounded = step ? Math.round(float / step) * step : float;
        const fixed = parseFloat(rounded.toFixed(decimalPlaces));

        return clamping
          ? clamp(min ?? -Infinity, fixed, max ?? Infinity)
          : fixed;
      },
      [number, step, clamping, min, max]
    );

  export const useIcons = ({
    value = "",
    onChange,
    disabled,
    loading,
    min,
    max,
    step,
    number,
    icon,
    iconRight,
  }: Props) => {
    const parseNumber = Input.useParseNumber({
      number,
      min,
      max,
      step,
      clamping: true,
    });

    const onMouseDown = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) return;
        if (number) {
          const startX = event.clientX;

          const mouseMove = throttle(
            (event: MouseEvent) => {
              const movement = event.clientX - startX;

              const number = parseNumber(value);
              if (!number) return;

              const speed = max ? (50 * (step ?? 1)) / max : 1;
              const updated = parseNumber(number + movement * speed);

              if (!updated) return;
              onChange?.(updated.toString());

              window.getSelection()?.removeAllRanges();
              document.body.style.cursor = "ew-resize";
            },
            25,
            { trailing: true }
          );

          const mouseUp = () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseup", mouseUp);
            document.body.style.cursor = "default";
          };

          window.addEventListener("mousemove", mouseMove);
          window.addEventListener("mouseup", mouseUp);
        }
      },
      [disabled, number, value, step, max, parseNumber, onChange]
    );

    return {
      icon: useMemo(() => {
        if (!icon) return null;

        const className = classes(
          "opacity-60 h-7 w-7 p-1 select-none shrink-0",
          !disabled && number && value ? "cursor-ew-resize" : ""
        );

        if (loading) return <Theme.Loading.Spinner {...{ className }} />;

        if (typeof icon === "function")
          return icon({
            className: `${className} -ml-1`,
            onMouseDown,
          });

        if (typeof icon === "string") {
          if (icon.length !== 1) return null;
          return (
            <h1
              className="opacity-muted -ml-1 flex h-7 w-7 cursor-ew-resize select-none items-center justify-center"
              onMouseDown={onMouseDown}
            >
              {icon}
            </h1>
          );
        }

        if (typeof icon !== "object") return icon;
        if (React.isValidElement(icon)) return icon;

        return null;
      }, [icon, disabled, number, value, loading, onMouseDown]),

      iconRight: useMemo(() => {
        if (!iconRight) return null;

        const className = classes(
          "opacity-60 h-7 w-7 p-1 select-none shrink-0"
        );

        if (typeof iconRight === "function")
          return iconRight({
            className,
          });

        if (typeof iconRight === "string") {
          if (iconRight.length !== 1) return;
          return (
            <h1 className="opacity-muted flex h-7 w-7 select-none items-center justify-center">
              {iconRight}
            </h1>
          );
        }

        if (typeof iconRight !== "object") return iconRight;
        if (React.isValidElement(iconRight)) return iconRight;

        return null;
      }, [iconRight]),

      outsideIcon: useMemo(() => {
        if (!icon) return null;
        if (typeof icon === "string" && icon.length > 1)
          return (
            <h1
              className="opacity-muted mr-1 flex h-full cursor-ew-resize select-none items-center justify-center p-1"
              onMouseDown={onMouseDown}
            >
              {icon}
            </h1>
          );
        return null;
      }, [icon, onMouseDown]),
    };
  };
}
