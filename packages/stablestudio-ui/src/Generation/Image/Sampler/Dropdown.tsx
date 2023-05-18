import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Dropdown({ id, className }: Styleable & { id: ID }) {
  const { setInput, input } = Generation.Image.Input.use(id);
  const { data: samplers } = Generation.Image.Samplers.use();

  const options = useMemo(
    () => [
      ...(samplers ?? []).map(({ id, name }) => ({
        name: name,
        value: id,
      })),
    ],
    [samplers]
  );

  const onClick = useCallback(
    (id: ID) => {
      setInput((input) => {
        input.sampler = samplers?.find((sampler) => sampler.id === id);
      });
    },
    [setInput, samplers]
  );

  if (!input) return null;
  return (
    <Theme.Popout
      title="Sampler"
      label="Sampler"
      placeholder={"Select a sampler"}
      value={input.sampler?.id}
      className={className}
      onClick={onClick}
      options={options}
      anchor="bottom"
    >
      {!samplers && (
        <div className="flex flex-col items-center justify-center px-16 py-32">
          <div className="text-muted-white pb-3">Loading samplers...</div>
        </div>
      )}
    </Theme.Popout>
  );
}
