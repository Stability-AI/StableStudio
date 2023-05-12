import { Generation } from "~/Generation";
import { Plugin } from "~/Plugin";

import { Cursor } from "./Cursor";

// required to spy on the response
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export type Execute = (args?: Execute.Args) => Promise<Execute.Result>;
export namespace Execute {
  export type Args = { pageParam?: Cursor };
  export type Result = Cursor & { data?: Generation.Images };

  export const use = (_options?: Generation.Images.Options) => {
    const initialCursor = useMemo(() => Cursor.next(Cursor.initial()), []);

    const getStableDiffusionExistingImages = Plugin.use(
      ({ getStableDiffusionExistingImages }) => getStableDiffusionExistingImages
    );

    return useMemo((): Execute | undefined => {
      if (!getStableDiffusionExistingImages) return;

      return async (_args) => {
        const cursor = _args?.pageParam ?? initialCursor;

        const newGroups = await getStableDiffusionExistingImages({
          limit: cursor.limit,
          exclusiveStartImageID: cursor.stopID,
        });

        if (!newGroups) return { forward: false, limit: 25, data: [] };

        const newInputs: Generation.Image.Inputs = {};
        const newImages: Generation.Images = [];
        const newOutputs: Generation.Image.Outputs = [];

        for (const group of newGroups) {
          let inputID: ID = ID.create();
          for (const image of group.images ?? []) {
            const input: Generation.Image.Input = {
              ...Generation.Image.Input.initial(ID.create()),
              ...(image.input && {
                prompts: image.input.prompts as Generation.Image.Prompts,
                model: image.input.model,
                height: image.input.height,
                width: image.input.width,
                seed: image.input.seed,
                steps: image.input.steps,
                strength: image.input.initialImage?.weight ?? 1,
                cfgScale: image.input.cfgScale,
                extras: {
                  $IPC: {
                    preset: image.input.style,
                  },
                },
              }),
            };
            newInputs[input.id] = input;
            inputID = input.id;

            newImages.push({
              id: image.id,
              inputID: input.id,
              created: image.createdAt,
              finishReason: 0,
              src: image.blob ? URL.createObjectURL(image.blob) : undefined,
            });
          }

          newOutputs.push({
            count: group.images?.length ?? 0,
            id: group.id,
            imageIDs: group.images?.map((image) => image.id) ?? [],
            inputID: inputID,
            completedAt: group.images?.find((image) => image.createdAt)
              ?.createdAt,
          });
        }

        Generation.Images.add(newImages);
        Generation.Image.Inputs.set((previous) => ({
          ...previous,
          ...newInputs,
        }));
        Generation.Image.Outputs.set(newOutputs);

        return {
          ...cursor,
          stopID: newGroups[0]?.exclusiveStartImageID,
          data: newImages,
        };
      };
    }, [getStableDiffusionExistingImages, initialCursor]);
  };
}
