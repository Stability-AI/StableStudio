import { Theme } from "~/Theme";

export function Section(props: Section.Props) {
  const {
    title,
    children,
    className: classNames,
    collapsable,
    defaultExpanded,
    padding = Theme.Common.Size.preset(),
    button,
    icon,
    divider = true,
    onChange,
  } = props;
  const [expanded, setExpanded] = useState(!!defaultExpanded || !collapsable);

  const className = useMemo(
    () =>
      typeof classNames === "function"
        ? classNames({ ...props, expanded })
        : classNames,
    [classNames, props, expanded]
  );

  useEffect(() => {
    if (!defaultExpanded) return;
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const buttonProps = useMemo(
    () => ({ testsdfsadfasdfs: true, transparent: true, className: "p-0" }),
    []
  );

  const buttonRendered = useMemo(
    () => (typeof button === "function" ? button(buttonProps) : button),
    [buttonProps, button]
  );

  return (
    <div
      className={classes(
        "flex flex-col border-zinc-300 last-of-type:border-b-0 dark:border-zinc-700",
        divider && "border-b-1 border-b",
        className
      )}
    >
      {title && (
        <div className="flex items-center py-2 px-2">
          <Theme.Button
            {...buttonProps}
            className={classes(
              buttonProps.className,
              "mr-auto",
              !collapsable &&
                "ml-1 cursor-default hover:text-white/80 dark:hover:text-white/80"
            )}
            onClick={() => {
              if (!collapsable) return;
              setExpanded(!expanded);
              onChange?.(!expanded);
            }}
            iconLeft={
              icon
                ? typeof icon === "function"
                  ? icon({ ...props, expanded })
                  : icon
                : collapsable &&
                  ((props) => (
                    <Theme.Icon.ChevronDown
                      className={classes(
                        props.className,
                        !expanded && "-rotate-90",
                        collapsable && "cursor-pointer"
                      )}
                    />
                  ))
            }
          >
            <h1 className="w-full font-normal text-slate-800 dark:text-white">{title}</h1>
          </Theme.Button>
          {buttonRendered}
        </div>
      )}
      {(expanded || !collapsable) && children && (
        <div
          className={classes(
            padding === "sm" && "p-2",
            padding === "md" && "p-4",
            padding === "lg" && "p-5"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export namespace Section {
  export type Props = {
    title?: false | string;
    collapsable?: boolean;
    defaultExpanded?: boolean;
    padding?: Theme.Common.Size | "none";
    button?: React.ReactNode | ((props: Theme.Button.Props) => React.ReactNode);
    divider?: boolean;
    icon?: (props: Section.Props & { expanded: boolean }) => Theme.Icon.Prop;

    onChange?: (expanded: boolean) => void;
    className?:
      | string
      | ((props: Section.Props & { expanded: boolean }) => string);
    children?: React.ReactNode;
  };
}
