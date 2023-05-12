import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Create {
  export function Button(props: Generation.Image.Create.Button.Props) {
    return (
      <div className="pointer-events-auto mr-auto flex flex-row items-center gap-1">
        <Theme.Tooltip
          placement="top"
          content={
            <div className="-mr-1 flex flex-row items-center gap-2">
              <p>Generate variations</p>
            </div>
          }
        >
          <Generation.Image.Create.Button
            {...props}
            noBadge
            size="md"
            icon={Theme.Icon.Variation}
          >
            {!props.noTitle && <>Variations</>}
          </Generation.Image.Create.Button>
        </Theme.Tooltip>
      </div>
    );
  }
}
