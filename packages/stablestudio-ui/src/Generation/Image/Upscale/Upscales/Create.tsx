import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Create {
  export function Button(props: Generation.Image.Create.Button.Props) {
    return (
      <Theme.Tooltip
        placement="top"
        content={
          <div className="-mr-1 flex flex-row items-center gap-2">
            <p>Upscale image</p>
          </div>
        }
      >
        <Generation.Image.Create.Button
          {...props}
          noBadge
          size="md"
          icon={Theme.Icon.Upscale}
          noTitle
        />
      </Theme.Tooltip>
    );
  }
}
