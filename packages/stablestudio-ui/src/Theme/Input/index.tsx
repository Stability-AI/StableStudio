import { Theme } from "~/Theme";

export type Input = Styleable & {
  loading?: boolean;
  autoSize?: boolean;
  value?: string;

  icon?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props>;
  iconLeft?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props>;
  iconRight?: React.ReactNode | React.FunctionComponent<Theme.Icon.Props>;

  onChange: (value: string) => void;

  onFocus?: (
    event:
      | React.FocusEvent<HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement>
  ) => void;

  onBlur?: (
    event:
      | React.FocusEvent<HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement>
  ) => void;

  onKeyDown?: React.KeyboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;

  autoFocus?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: Theme.Common.Size;
  transparent?: boolean;
  type?: "text" | "password" | "number" | "email" | "url";
};

export function Input(props: Input) {
  if (props.autoSize) {
    return <AutosizeTextArea {...props} />;
  } else {
    return <SingleInput {...props} />;
  }
}

function AutosizeTextArea({
  size = Theme.Common.Size.preset(),
  autoFocus = false,

  value,
  onChange,

  ...props
}: Input) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      const styles = window.getComputedStyle(textareaRef.current);
      textareaRef.current.style.height = "auto";

      const newHeight =
        textareaRef.current.scrollHeight +
        parseInt(styles.paddingTop) +
        parseInt(styles.paddingBottom);

      if (newHeight === 0) {
        setForceUpdate((n) => n + 1);
        return;
      }

      textareaRef.current.style.height = newHeight + "px";
    }
  }, [value]);

  useEffect(() => {
    if (!textareaRef.current || !autoFocus) return;
    textareaRef.current.blur();
    textareaRef.current.focus();
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      className={classes(
        "prose dark:prose-invert w-full resize-none overflow-y-clip rounded opacity-75 shadow-sm focus:border-transparent focus:outline-none dark:border-transparent",

        size === "sm"
          ? "h-8 px-2 py-1 text-sm"
          : size === "lg"
          ? "h-12 px-3 py-1 text-lg"
          : "h-10 px-2 py-1 text-base",

        props.disabled &&
          `cursor-not-allowed ${!props.transparent && "bg-black/10"}`,

        props.transparent ? "bg-transparent" : "dark:bg-white/5",
        props.className
      )}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      disabled={props.disabled}
      value={value}
      onChange={useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(event.target.value),
        [onChange]
      )}
      onKeyDown={props.onKeyDown}
    />
  );
}

function SingleInput({
  loading,

  icon,
  iconLeft = icon,
  iconRight,

  autoFocus = false,
  transparent = false,
  size = Theme.Common.Size.preset(),
  fullWidth = true,

  className,

  value,
  onChange,

  ...props
}: Input) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current || !autoFocus) return;
    inputRef.current.blur();
    inputRef.current.focus();
  }, [autoFocus]);

  // TODO: Share with `Theme.Button`
  const sizing = useMemo(
    () =>
      ({
        sm: classes("px-2.5 py-2 text-sm", transparent ? "px-0" : ""),
        md: classes("px-3 py-2 text-base", transparent ? "px-0" : ""),
        lg: classes("px-4 py-2 text-lg", transparent ? "px-0" : ""),
      }[size === "xl" ? "lg" : size]),
    [transparent, size]
  );

  const icons = useMemo(() => {
    const render = (icon: typeof iconLeft, position: "left" | "right") => {
      const className = classes(
        "opacity-60 h-5 w-5 text-black dark:text-white",
        position === "left" && "mr-1 -ml-1 stroke-black dark:stroke-white",
        position === "right" && "ml-1 -mr-1"
      );

      if (loading && position === "left")
        return <Theme.Loading.Spinner {...{ className }} />;

      if (!icon) return null;
      if (typeof icon === "function") return icon({ className });
      if (typeof icon !== "object") return icon;

      if (React.isValidElement(icon)) return icon;

      return null;
    };

    return {
      left: iconLeft && render(iconLeft, "left"),
      right: iconRight && render(iconRight, "right"),
    };
  }, [loading, iconLeft, iconRight]);

  return (
    <div className={classes("relative", fullWidth && "w-full", className)}>
      {icons.left && (
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center justify-center pl-3">
          {icons.left}
        </div>
      )}
      <input
        ref={inputRef}
        className={classes(
          "dark:placeholder:text-muted-white h-full w-full rounded bg-zinc-100/75 text-black shadow-md focus:border-transparent focus:outline-none dark:border-none dark:bg-white/5 dark:text-white",
          sizing,
          props.disabled && "cursor-not-allowed bg-black/10",
          transparent && "bg-transparent dark:bg-transparent",
          !!iconLeft && "pl-9",
          !!iconRight && "pr-9"
        )}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        value={value}
        onChange={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value),
          [onChange]
        )}
        onKeyDown={props.onKeyDown}
        type={props.type || "text"}
      />
      {icons.right && (
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-center pr-3">
          {icons.right}
        </div>
      )}
    </div>
  );
}
