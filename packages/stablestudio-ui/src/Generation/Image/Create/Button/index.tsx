import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Button({
  id,
  noTitle,
  noBrand,
  disabled,
  onIdleClick,
  onClick: originalOnClick,
  children,
  ...props
}: Button.Props) {
  const isEnabled = Generation.Image.Create.useIsEnabled();

  const { input } = Generation.Image.Input.use(id);

  const onClick = useCallback(
    (event: MouseEvent) => {
      originalOnClick?.(event);
      onIdleClick?.(event);
    },
    [onIdleClick, originalOnClick]
  );

  const validated = useMemo(
    () => input && Generation.Image.Model.StableDiffusionV1.validate(input),
    [input]
  );

  if (!input) return null;
  return (
    <Theme.Button
      size="lg"
      color={noBrand ? "zinc" : "brand"}
      icon={Theme.Icon.Dream}
      disabled={disabled || !isEnabled || !validated}
      onClick={onClick}
      {...props}
    >
      {children ?? (!noTitle && <>Dream</>)}
    </Theme.Button>
  );
}

export namespace Button {
  export type Props = Theme.Button.Props & {
    id: ID;
    noTitle?: boolean;
    noBadge?: boolean;
    noBrand?: boolean;
    onIdleClick?: (event: MouseEvent) => void;
  };
}
