import { Link } from "react-router-dom";

import { Theme } from "..";

export type Choice<T> = {
  label: string;
  selected?: boolean;
} & (
  | {
      value: Choice<T>[] | T;
    }
  | {
      href: string;
    }
);

export function Dropdown({
  children,
  choices,
  placement = "bottom",
  showArrow = true,
  onOpenChange,
  onChange,
  className,
  openMechanism = "hover",
}: StyleableWithChildren & {
  choices: Choice<string>[];
  placement?: "top" | "bottom" | "left" | "right";
  showArrow?: boolean;
  onOpenChange?: (open: boolean) => void;
  onChange?: (value: string) => void;
  openMechanism?: "click" | "hover";
}) {
  const [show, setShow] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const childrenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // check if we are close to the edge of the screen and set the direction accordingly
    if (!show || !childrenRef.current) return;

    const rect = childrenRef.current.getBoundingClientRect();

    if (rect.left + rect.width / 2 > window.innerWidth / 2) {
      setDirection("left");
    } else {
      setDirection("right");
    }
  }, [show]);

  return (
    <Theme.Tooltip
      content={
        <div className="flex flex-col gap-0.5">
          {choices.map((choice) =>
            "value" in choice && choice.value instanceof Array ? (
              <Dropdown
                showArrow={false}
                key={choice.label}
                choices={choice.value}
                placement={direction}
                onOpenChange={(open) => setShow(open)}
                onChange={onChange}
                className={className}
              >
                <Choice choice={choice} />
              </Dropdown>
            ) : (
              <Choice
                key={choice.label}
                choice={choice}
                onClick={() =>
                  "value" in choice && onChange?.(choice.value as string)
                }
                href={"href" in choice ? choice.href : undefined}
              />
            )
          )}
        </div>
      }
      placement={placement}
      showArrow={showArrow}
      forceOpen={show ? true : undefined}
      onChange={onOpenChange}
      enablePointerEvents
      contentClasses={classes("p-1.5", className)}
      openMechanism={openMechanism}
      className={classes(openMechanism === "click" && "pointer-events-auto")}
    >
      <div ref={childrenRef}>{children}</div>
    </Theme.Tooltip>
  );
}

function Choice({
  choice,
  onClick,
  href,
}: {
  choice: Choice<string>;
  onClick?: () => void;
  href?: string;
}) {
  const props = {
    className: classes(
      "flex w-[8.5rem] cursor-pointer flex-row items-center justify-between rounded-sm py-[5px] px-2 text-sm",
      choice.selected ? "bg-brand-500/80" : "hover:bg-white/10"
    ),
    onClick: (e: any) => {
      e.stopPropagation();
      onClick?.();
    },
    href,
  };

  const content = (
    <>
      {choice.label}
      {"value" in choice && choice.value instanceof Array ? (
        <Theme.Icon.ChevronRight className="-mr-1 text-white/50" size={16} />
      ) : (
        <Theme.Icon.Invisible size={16} />
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} {...props}>
        {content}
      </Link>
    );
  } else {
    return <div {...props}>{content}</div>;
  }
}
