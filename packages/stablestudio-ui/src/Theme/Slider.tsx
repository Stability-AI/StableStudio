import ReactSlider from "react-slider";
import { useDebounce } from "react-use";

export const Slider = ({
  min = 0,
  step = 1,
  max,
  maxDecimals = 0,

  title,
  flipVertically = false,
  noFill = false,
  className,
  displayValue = false,

  ...props
}: Styleable & {
  min?: number;
  step?: number;
  max: number;
  maxDecimals?: number;

  value: number;
  onChange: (value: number) => void;

  title?: React.ReactNode;
  disabled?: boolean;
  flipVertically?: boolean;
  noFill?: boolean;
  className?: string;
  percentage?: boolean;
  displayValue?: boolean;
}) => {
  const canBeNegative = min < 0;
  const disabled = props.disabled || max === min;

  const clamp = useCallback(
    (value: number) => Math.min(max, Math.max(min, value)),
    [min, max]
  );

  const format = useCallback(
    (value: number) =>
      value.toLocaleString(undefined, { maximumFractionDigits: maxDecimals }),
    [maxDecimals]
  );

  const [value, setValue] = useState(clamp(props.value ?? (max - min) / 2));

  const [inputValue, setInputValue] = useState(format(value));

  useEffect(() => {
    if (props.value === undefined) return;
    setValue(clamp(props.value));
    setInputValue(format(clamp(props.value)));
  }, [props.value, clamp, setValue, inputValue, format]);

  useDebounce(
    () => {
      if (inputValue === undefined) return;
      if (inputValue === "") return setValue(0);

      const parsed = parseFloat(inputValue.replaceAll(",", ""));
      if (isNaN(parsed)) return setInputValue(format(value));

      setValue(clamp(parsed));
    },
    500,
    [clamp, inputValue, setInputValue]
  );

  const { onChange: propsOnChange } = props;
  const onChange = useCallback(
    (value: number) => {
      propsOnChange(value);
      setValue(value);
      setInputValue(format(value));
    },
    [propsOnChange, setValue, setInputValue, format]
  );

  const [moving, setMoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  type ReactSliderProps = React.ComponentProps<typeof ReactSlider>;
  type OnBeforeChange = Exclude<ReactSliderProps["onBeforeChange"], undefined>;
  type OnAfterChange = Exclude<ReactSliderProps["onAfterChange"], undefined>;
  type RenderTrack = Exclude<ReactSliderProps["renderTrack"], undefined>;
  type RenderThumb = Exclude<ReactSliderProps["renderThumb"], undefined>;
  type RenderMark = Exclude<ReactSliderProps["renderMark"], undefined>;

  const onBeforeChange = useCallback<OnBeforeChange>(
    () => setMoving(true),
    [setMoving]
  );

  const onAfterChange = useCallback<OnAfterChange>(
    () => setMoving(false),
    [setMoving]
  );

  const renderTrack = useCallback<RenderTrack>(
    (props, state) => {
      const offset = Math.abs(min) / (max - min);
      const position =
        value >= 0
          ? { left: `${offset * 100}%`, right: "unset" }
          : { right: `${(1 - offset) * 100}%`, left: "unset" };

      const width = `${(value / (value >= 0 ? max - min : min - max)) * 100}%`;

      const style = {
        ...props.style,

        ...(canBeNegative && {
          ...(state.index === 1
            ? { zIndex: 1, left: 0, right: 0 }
            : { zIndex: 2, display: width, ...position }),
        }),

        ...(noFill && { left: 0, right: 0 }),
      };

      return (
        <div
          {...props}
          {...{ style }}
          className={classes(
            "h-[2px] rounded-full",

            state.index !== 0 && "opacity-muted-extra dark:bg-white bg-black shadow-sm",
            state.index === 0 &&
              classes(
                "shadow-md",
                noFill && "opacity-0",
                value >= 0
                  ? "bg-brand-400 dark:bg-brand-700"
                  : "bg-red-400 dark:bg-red-700"
              )
          )}
        />
      );
    },
    [noFill, min, max, value, canBeNegative]
  );

  const renderThumb = useCallback<RenderThumb>(
    (props) => (
      <div
        {...props}
        style={{ ...props.style, zIndex: 3 }}
        onMouseDown={() => setMoving(true)}
        className={classes(
          "relative h-3.5 w-3.5 -translate-y-[5.25px] rounded-full border-[2px] outline-none transition duration-150",
          moving
            ? "scale-110 border-white shadow-lg"
            : "scale-100 border-zinc-800 shadow-md",
          value === 0
            ? "bg-zinc-500 dark:bg-zinc-600"
            : value >= 0
            ? "bg-brand-500 dark:bg-brand-600"
            : "bg-red-500 dark:bg-red-600"
        )}
      >
        {displayValue && (
          <div
            className={classes(
              "pointer-events-none absolute top-[-1.25rem] ml-1 flex w-[10rem] -translate-x-[5rem] items-center justify-center text-xs font-medium",
              value === 0
                ? "text-zinc-500 dark:text-zinc-300"
                : value >= 0
                ? "text-brand-500 dark:text-brand-300"
                : "text-red-500 dark:text-red-300"
            )}
          >
            {format(value)}
          </div>
        )}
      </div>
    ),
    [moving, value, displayValue, format]
  );

  const renderMark = useCallback<RenderMark>(
    (props) => <span {...props} />,
    []
  );

  const titleAndInput = title && (
    <div className="flex select-none items-center justify-between">
      <div className="opacity-muted font-light">{title}</div>
      <input
        {...{ min, max }}
        type="text"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => inputRef.current?.select()}
        className={classes(
          "m-0 ml-2 min-w-0 flex-1 border-none bg-transparent p-0 text-right outline-none"
        )}
        css={css`
          -moz-appearance: textfield;

          &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}
      />
      {props.percentage && <span>%</span>}
    </div>
  );

  return (
    <div
      className={classes(
        "flex w-full flex-col opacity-100 duration-150",
        disabled && "opacity-muted pointer-events-none cursor-not-allowed",
        flipVertically ? "gap-2" : "gap-2",
        className
      )}
    >
      {!flipVertically && titleAndInput}
      <ReactSlider
        className="-my-0.5 h-2.5 w-full cursor-pointer"
        disabled={disabled}
        {...{
          value,
          min,
          step,
          max,
          onChange,
          onBeforeChange,
          onAfterChange,
          renderThumb,
          renderTrack,
          renderMark,
        }}
      />
      {flipVertically && titleAndInput}
    </div>
  );
};
