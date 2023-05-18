import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Dropdown({ id, className }: Styleable & { id: ID }) {
  const { setInput, input } = Generation.Image.Input.use(id);
  const { samplers } = Generation.Image.Sampler.use();

  const options = useMemo(
    () => [
      ...(samplers ?? []).map(({ value, name }) => ({
        name: name,
        value: value,
      })),
    ],
    [samplers]
  );

  const onClick = useCallback(
    (value: number) => {
      setInput((input) => {
        console.log("sampler", value);
        input.sampler = { value: value, name: options.at(value)?.name };
      });
    },
    [setInput, options]
  );

  if (!input) return null;
  return (
    <Theme.Popout
      title="Sampler"
      label="Sampler"
      placeholder={"Select a Sampler"}
      value={input.sampler?.value}
      className={className}
      onClick={onClick}
      options={options}
      anchor="bottom"
    >
      {samplers === undefined && (
        <div className="flex flex-col items-center justify-center px-16 py-32">
          <div className="text-muted-white pb-3">Loading samplers...</div>
        </div>
      )}
    </Theme.Popout>
  );
}
