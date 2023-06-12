import { App } from "~/App";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";
import { Plugin } from "~/Plugin";
import * as StableStudio from "@stability/stablestudio-plugin";

const extrasToElement = (extras: StableStudio.StableDiffusionExtra[]) => {
  const elements = [];
  for (let i = 0; i < extras.length; i++) {
    const extra = extras[i];
    spy(extra);
    if (extra.type === "select") {
      const options = [];
      for (let j = 0; j < extra.data?.data.length; j++) {
        const option = extra.data?.data[j];
        options.push({
          name: option,
          value: option,
        });
      }
      elements.push(
        <div className="-mx-2">
          <Theme.Tooltip
            delay={750}
            content={
              <h1>
                {extra.name ?? "List"} is a list of{" "}
                {extra.data?.data.length ?? 0}{" "}
                {extra.data?.data.length === 1 ? "item" : "items"}.
              </h1>
            }
            placement="right"
          >
            <Theme.Popout
              title={extra.name ?? "List"}
              label={extra.name ?? "List"}
              placeholder={`Select a ${extra.name ?? "list"}`}
              value={extra.data?.default}
              options={options}
              anchor="bottom"
              onClick={() => {}}
            />
          </Theme.Tooltip>
        </div>
      );
    } else if (extra.type === "boolean") {
      elements.push(
        <div className="-mx-2">
          <Theme.Tooltip
            delay={750}
            content={
              <h1>
                {extra.name ?? "Boolean"} {extra.description ?? "is"}{" "}
                {extra.data?.default ? "active" : "inactive"}.
              </h1>
            }
            placement="right"
          >
            <Theme.Checkbox
              label={extra.name ?? "Boolean"}
              value={extra.data?.data}
              onChange={() => {
                extra.data!.data = !extra.data!.data;
              }}
            />
          </Theme.Tooltip>
        </div>
      );
    } else if (extra.type === "slider") {
      elements.push(
        <div className="-mx-2">
          <Theme.Tooltip
            delay={750}
            content={
              <h1>
                {extra.name ?? "Slider"} {extra.description ?? "is"}{" "}
                {extra.data?.default}.
              </h1>
            }
            placement="right"
          >
            <Theme.Slider
              title={extra.name ?? "Slider"}
              value={extra.data.data}
              onChange={(value) => {
                extra.data!.data = value;
              }}
              min={extra.data.min}
              max={extra.data.max}
              step={extra.data.step}
              displayValue={extra.data.data}
              className="w-full"
            />
          </Theme.Tooltip>
        </div>
      );
    }
  }
  return elements;
};

export function Extras({
  id,
  ...props
}: App.Sidebar.Section.Props & { id: ID }) {
  const { setInput, input } = Generation.Image.Input.use(id);
  const extras = Plugin.get().getStableDiffusionExtras?.();

  return (
    <App.Sidebar.Section
      title="Extras"
      divider={true}
      collapsable
      icon={(props) =>
        props.expanded
          ? (bp) => (
              <Theme.Icon.EyeOff
                {...bp}
                className={classes(bp.className, "ml-1")}
              />
            )
          : (bp) => (
              <Theme.Icon.Eye
                {...bp}
                className={classes(bp.className, "ml-1")}
              />
            )
      }
      className={(props) => (!props.expanded ? "mb-2" : "")}
      {...props}
    >
      <div className="flex flex-col gap-4">
        {extras && (
          <div className="flex w-full flex-col gap-2">
            {extrasToElement(extras)}
          </div>
        )}
      </div>
    </App.Sidebar.Section>
  );
}
