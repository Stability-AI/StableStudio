import { PluginSetting } from "@stability/stablestudio-plugin";
import { Markdown } from "~/Markdown";

import { Theme } from "~/Theme";

export function Setting({
  settingKey: key,
  settingValue: setting,
  setSetting,
}: {
  settingKey: string;
  settingValue: PluginSetting<unknown>;

  setSetting: (key: string, value: any) => void;
}) {
  const value = (setting as any).formatter
    ? (setting as any).formatter(setting.value)
    : setting.value;

  const onSet = (value: any) =>
    setSetting(
      key,
      (setting as any).setter ? (setting as any).setter(value) : value
    );

  return (
    <div key={setting.title} className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <label>
          {setting.title}{" "}
          {setting.required && <span className="text-sm text-red-500">*</span>}
        </label>
        {setting.type === "boolean" && (
          <Theme.Checkbox size="xl" value={value} onChange={onSet} />
        )}
      </div>
      {setting.type === "string" && setting.options && (
        <Theme.Dropdown
          value={(setting as any).value ?? ""}
          size="md"
          onChange={(e) => onSet(e.value)}
          options={setting.options as never}
          fullWidth
          className="mx-0 -ml-0.5"
          innerClassName="pl-3.5"
        />
      )}
      {setting.type === "string" && !setting.options && (
        <Theme.Input
          placeholder={setting.placeholder}
          // TODO: Fix this
          value={value}
          onChange={onSet}
          type={setting.password ? "password" : "text"}
        />
      )}
      {setting.type === "number" &&
        (setting.variant === "input" || !setting.variant) && (
          <Theme.NumberInput
            number
            placeholder={setting.placeholder?.toString()}
            value={value}
            onNumberChange={onSet}
            max={setting.max}
            min={setting.min}
            step={setting.step ?? undefined}
            inputClassName="bg-white/5 px-2 py-0.5 group-hover:outline-0 outline-0 focus:outline-transparent"
            containerClassName="mx-0"
            icon={Theme.Icon.ChevronsLeftRight}
          />
        )}

      {setting.type === "number" && setting.variant === "slider" && (
        <div className="flex flex-col">
          <div className="flex justify-between">
            <Theme.Label className="mx-0">{setting.min ?? 0}</Theme.Label>
            <Theme.Label className="mx-0">{setting.max ?? 100}</Theme.Label>
          </div>
          <Theme.Slider
            value={value}
            displayValue={
              ![setting.min ?? 0, setting.max ?? 100].includes(value)
            }
            onChange={onSet}
            max={setting.max ?? 100}
            min={setting.min}
            step={setting.step ?? undefined}
            className="mt-3.5"
          />
        </div>
      )}
      <Markdown
        text={setting.description ?? ""}
        className="text-sm font-light opacity-75"
      />
    </div>
  );
}
