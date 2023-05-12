import { Generation } from "~/Generation";

export type Prompts = Generation.Image.Prompt[];
export function Prompts({ id }: { id: ID }) {
  const { input } = Generation.Image.Input.use(id);
  if (!input) return null;
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {input.prompts.map((_: unknown, index: number) => (
        <Generation.Image.Prompt
          id={id}
          index={index}
          key={keys(index, input.prompts.length)}
          variant="advanced"
        />
      ))}
    </div>
  );
}

export namespace Prompts {
  export const random = (
    count: number,
    exclude: string[] = [],
    triesLeft = 10,
    previous = []
  ): string[] => {
    const prompt = Generation.Image.Prompt.Random.get(exclude, triesLeft);
    return [
      prompt,
      ...previous,
      ...(count < previous.length
        ? random(count - 1, [...exclude, ...previous], triesLeft - 1)
        : []),
    ];
  };
}
