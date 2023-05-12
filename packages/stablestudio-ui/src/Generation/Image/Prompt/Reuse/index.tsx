import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Reuse {
  export function Button({
    inputID,
    onClick: propsOnClick,
    ...props
  }: Theme.Button.Props & { inputID: ID }) {
    const { input } = Generation.Image.Input.use(inputID);

    const label = useMemo(
      () => `Reuse prompt${input?.prompts.length ?? 0 > 1 ? "s" : ""}`,
      [input?.prompts.length]
    );

    const onClick = useCallback(
      (event: MouseEvent) => {
        propsOnClick?.(event);
        Generation.Image.Session.setCurrentInput((currentInput) => {
          let prompts = Generation.Image.Input.get(inputID)?.prompts;
          if (!prompts) return;

          prompts = prompts.filter((prompt) => prompt.text !== "");
          if (prompts.filter((prompt) => prompt.weight < 0).length <= 0)
            prompts.push({ text: "", weight: -0.75 });

          currentInput.prompts = prompts;
        });
      },
      [inputID, propsOnClick]
    );

    return (
      <Theme.Button
        outline
        icon={Theme.Icon.ArrowLeftCircle}
        label={label}
        onClick={onClick}
        {...props}
      />
    );
  }
}
