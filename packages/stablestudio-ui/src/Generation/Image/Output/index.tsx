import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Divider } from "./Divider";
import { State } from "./State";

export * from "./Outputs";

export type Output = {
  id: ID;
  inputID: ID;

  requestedAt?: Date;
  completedAt?: Date;
  progress?: number;

  count: number;
  imageIDs: ID[];
  progressImageIDs?: ID[];

  exception?: Generation.Image.Exception;
};

type Props = {
  outputID?: ID;

  animate?: boolean;
  placeholder?: boolean;
  divider?: boolean;
};

export function Output({ outputID, placeholder, divider }: Props) {
  const output = Generation.Image.Output.use(outputID);
  const { input } = Generation.Image.Input.use(output?.inputID);

  const isOutputGenerating = Generation.Image.Output.useIsGenerating(outputID);
  const isGenerating = !placeholder && isOutputGenerating;

  const images = Generation.Images.useFromIDs(...(output?.imageIDs ?? []));
  const dateTime = output?.completedAt ?? output?.requestedAt;
  const download = Generation.Images.Download.use(images);

  const [imagesToGenerate] = Generation.Image.Count.use();
  const count = (placeholder ? imagesToGenerate : output?.count) ?? 0;
  const exampleStartIndex = useMemo(
    () =>
      Math.floor(
        Math.random() * Generation.Image.Prompt.Examples.images.length
      ),
    []
  );

  const content = useMemo(() => {
    const items: Generation.Images | Partial<Generation.Image>[] = Array.from(
      { length: count },
      (_, index) => images[index] ?? { inputID: input?.id }
    );

    const rendered = items.map((image, index, images) => (
      <Generation.Image
        preserveAspectRatio
        key={keys("image", images.length, images.length - index)}
        placeholder={placeholder}
        image={image}
        progress={output?.progress}
        scale={1}
        example={
          Generation.Image.Prompt.Examples.images[
            (exampleStartIndex + index) %
              Generation.Image.Prompt.Examples.images.length
          ]
        }
      />
    ));

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rendered}
      </div>
    );
  }, [
    count,
    images,
    input?.id,
    placeholder,
    output?.progress,
    exampleStartIndex,
  ]);

  const controls = useMemo(
    () => (
      <div className="grid grid-cols-3 place-items-end gap-2 overflow-hidden">
        {input?.id && (
          <Generation.Image.Prompt
            readOnly
            allowUseAgain
            id={input.id}
            variant="display"
            className="col-span-2 w-full duration-150"
          />
        )}
        {!placeholder && !isGenerating && (
          <div className="flex w-full flex-row items-center justify-end gap-2">
            <Theme.Tooltip content={`Download ${images.length} images`}>
              <Theme.Button
                outline
                className="shrink-0"
                icon={Theme.Icon.Download}
                onClick={download}
              />
            </Theme.Tooltip>
            <Generation.Images.Delete.Button
              deleteTooltip={`Delete ${images.length} images`}
              className="shrink-0 bg-black/20"
              images={images.map(({ id }) => id)}
              outline
            />
          </div>
        )}
      </div>
    ),
    [input?.id, placeholder, isGenerating, images, download]
  );

  return useMemo(
    () => (
      <div className="flex flex-col gap-4">
        {divider && <Divider dateTime={dateTime} />}
        {controls}
        {content}
      </div>
    ),
    [divider, dateTime, controls, content]
  );
}

export namespace Output {
  export const set = (output: Output) => State.get().setOutputs([output]);
  export const get = (id: ID) => State.get().outputs[id];

  export const requested = State.get().requested;
  export const received = State.get().received;
  export const remove = State.get().remove;
  export const clear = State.get().clear;

  export const isGenerating = ({
    requestedAt,
    completedAt,
    exception,
    imageIDs,
    count,
  }: Output) =>
    requestedAt && !completedAt && !exception && imageIDs.length !== count;

  export const use = (id?: ID): Output | undefined =>
    State.use(
      ({ outputs }) => (!!id ? outputs[id] : undefined),
      GlobalState.shallow
    );

  export const useIsGenerating = (id?: ID) =>
    State.use(({ outputs }) => {
      if (!id) return false;
      const output = outputs[id];
      return !!output && isGenerating(output);
    }, GlobalState.shallow);
}
