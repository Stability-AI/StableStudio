import { motion } from "framer-motion";

import { Theme } from "~/Theme";

export function Buttons({
  className,
  children,
  y,
}: StyleableWithChildren & { y: number }) {
  return (
    <motion.div
      className={classes("m-3 my-4 flex justify-end gap-2", className)}
      initial={{ y }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function Button({
  button,
  className,
  name,
  ...props
}: Theme.Button.Props & {
  alwaysShow?: boolean;
  noBg?: boolean;
  button?: React.FunctionComponent<Theme.Button.Props>;
  name?: React.ReactNode;
}) {
  const buttonProps: Theme.Button.Props = {
    ...props,
    outline: false,
    className: classes(
      className,
      "pointer-events-auto bg-transparent",
      !props.noBg &&
        !props.disabled &&
        "hover:bg-brand-400 dark:hover:bg-brand-400"
    ),
  };

  const content = button ? (
    button(buttonProps)
  ) : (
    <Theme.Button {...buttonProps} />
  );

  return (
    <>
      {name ? (
        <Theme.Tooltip content={name} placement="top" className={className}>
          {content}
        </Theme.Tooltip>
      ) : (
        content
      )}
    </>
  );
}
