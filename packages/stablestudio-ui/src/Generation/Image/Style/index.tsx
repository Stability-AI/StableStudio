import * as StableStudio from "@stability/stablestudio-plugin";

import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export * from "./Styles";

export type Style = StableStudio.StableDiffusionStyle;
export namespace Style {
  export const apply = ({
    input,
    styleID,
  }: {
    input: Generation.Image.Input;
    styleID?: ID;
  }): Generation.Image.Input => ({
    ...input,
    extras: {
      ...input.extras,
      $IPC: styleID ? { preset: styleID } : undefined,
    },
  });

  export const isApplied = ({
    input,
    preset,
  }: {
    input: Generation.Image.Input;
    preset: Style;
  }) => (input.extras?.$IPC?.preset ?? "none") === preset.id;

  export const useFromID = (id?: ID) => {
    const { data: styles } = Generation.Image.Styles.use();
    return id ? styles?.find((style) => style.id === id) : undefined;
  };

  export function Dropdown({ className, id }: Styleable & { id: ID }) {
    const { data: styles } = Generation.Image.Styles.use();
    const { input, setInput } = Generation.Image.Input.use(id);
    const options = useMemo(
      () => [
        {
          value: "none",
          name: "Choose style",
        },

        ...(styles?.map((style: Style) => ({
          value: style.id,
          name: style.name,
          image: style.image,
        })) ?? []),
      ],
      [styles]
    );

    return (
      <Theme.Popout
        title="Styles"
        label="Style"
        options={options}
        value={input?.extras?.$IPC?.preset}
        placeholder={"Choose style"}
        className={classes(className)}
        onClick={(value) =>
          setInput((input) => apply({ input, styleID: value }))
        }
      />
    );
  }
}
