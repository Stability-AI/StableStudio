import { Theme } from "~/Theme";

export function Checkbox(props: Checkbox.Props) {
  const label = (
    <>
      {props.label && (
        <div
          className={classes(
            "text-muted-white select-none text-base",
            props.size === "sm" && "text-sm",
            props.size === "lg" && "text-lg",
            props.labelClassName
          )}
        >
          {props.label}
        </div>
      )}
    </>
  );

  return (
    <div
      onClick={() => props.onChange(!props.value)}
      className={classes(
        "flex w-fit cursor-pointer items-center gap-2",
        props.left && "flex-row",
        props.right && "flex-row-reverse",
        props.disabled && "cursor-not-allowed",
        !props.left && !props.right && "flex-row",
        props.className
      )}
    >
      {props.labelLeft && label}
      <div
        tabIndex={0}
        onKeyUp={(e) => {
          if (e.key === " " && e.target === e.currentTarget) {
            props.onChange(!props.value);
          }
        }}
        className={classes(
          "flex shrink-0 items-center justify-center rounded border-none border-black/5 dark:border",

          (!props.variant || props.variant === "indigo") &&
            props.value &&
            "bg-brand-500 dark:bg-brand-600",

          props.variant === "red" && props.value && "bg-red-600",
          props.variant === "green" && props.value && "bg-green-600",
          props.variant === "yellow" && props.value && "bg-yellow-600",
          props.variant === "gray" && props.value && "bg-zinc-600",
          !props.value && "bg-black/10 dark:bg-zinc-700",

          props.size === "sm"
            ? "h-4 w-4"
            : props.size === "lg"
            ? "h-6 w-6"
            : "h-5 w-5"
        )}
      >
        {props.value && (
          <Theme.Icon.Check
            color="white"
            size={props.size === "sm" ? 12 : props.size === "md" ? 16 : 20}
          />
        )}
      </div>
      {!props.labelLeft && label}
    </div>
  );
}

export namespace Checkbox {
  export type Props = Styleable & {
    label?: React.ReactNode;
    labelLeft?: boolean;
    labelClassName?: string;

    size?: Theme.Common.Size;
    variant?: "indigo" | "red" | "green" | "yellow" | "gray";
    disabled?: boolean;
    bold?: boolean;

    left?: boolean;
    right?: boolean;

    onChange: (value: boolean) => void;
    value: boolean;
  };
}
