import * as StableStudio from "@stability/stablestudio-plugin";
import throttledQueue from "throttled-queue";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Plugin } from "~/Plugin";

import { Button } from "./Button";

export declare namespace Create {
  export { Button };
}

export namespace Create {
  Create.Button = Button;

  type Handlers = {
    onStarted?: (output?: Generation.Image.Output) => void;
    onException?: (error: Generation.Image.Exception) => void;
    onSuccess?: (images: Generation.Images) => void;
    onFinished?: (
      result: Generation.Image.Exception | Generation.Images
    ) => void;
  };

  namespace Throttle {
    const requestsPerInterval = 1;
    const interval = 500;
    const spaceEvenly = true;

    const queue = throttledQueue(requestsPerInterval, interval, spaceEvenly);
    export const wait = () => queue(() => Promise.resolve());
  }

  export const execute = async ({
    count = Generation.Image.Count.preset(),
    input,

    onStarted = doNothing,
    onException = doNothing,
    onSuccess = doNothing,
    onFinished = doNothing,
  }: Handlers & {
    count: number;
    input: Generation.Image.Input;
  }): Promise<Generation.Image.Exception | Generation.Images> => {
    const { createStableDiffusionImages } = Plugin.get();
    try {
      if (!createStableDiffusionImages) throw new Error("Plugin not found");

      Latest.set(new Date());
      onStarted();

      await Throttle.wait();

      const initImg = await Generation.Image.Input.resizeInit(input);
      const pluginInput = await Generation.Image.Input.toInput(
        !initImg
          ? input
          : {
              ...input,
              init: {
                base64: initImg,
                weight: input.init?.weight ?? 1,
                mask: input.init?.mask ?? false,
              },
            }
      );

      if (!Generation.Image.Input.isUpscaling(input)) {
        pluginInput.height = Math.ceil((pluginInput.height ?? 512) / 64) * 64;
        pluginInput.width = Math.ceil((pluginInput.width ?? 512) / 64) * 64;
      }

      const responses: Generation.Images = [];
      const response = await createStableDiffusionImages({
        input: pluginInput,
        count,
      });

      if (response instanceof Error) throw response;
      if (!response || !response?.images || response?.images?.length <= 0)
        throw new Error();

      const newInputs: Record<ID, Generation.Image.Input> = {};

      for (const image of response.images) {
        const inputID = ID.create();
        const newInput = {
          ...Generation.Image.Input.initial(inputID),
          ...input,
          seed: image.input?.seed ?? input.seed,
          id: inputID,
        };

        const cropped = await cropImage(image, newInput);
        if (!cropped) continue;

        responses.push(cropped);
        newInputs[inputID] = newInput;
      }

      Generation.Image.Inputs.set({
        ...Generation.Image.Inputs.get(),
        ...newInputs,
      });

      onSuccess(responses);
      onFinished(responses);

      return responses;
    } catch (caught: unknown) {
      const exception = Generation.Image.Exception.create(caught);

      onException(exception);
      onFinished(exception);

      return exception;
    }
  };

  export const use = () => {
    const showErrorSnackbar = Generation.Image.Exception.Snackbar.use();

    return useCallback(
      async ({
        inputID,
        onStarted = doNothing,
        onException = doNothing,
        onSuccess = doNothing,
        onFinished = doNothing,
        modifiers = {},
      }: {
        inputID: ID;
        modifiers?: Generation.Image.Input.Modifiers;
      } & Handlers) => {
        let input = Generation.Image.Input.get(inputID);
        if (!input) return;

        input = {
          ...input,
          ...modifiers,
        };

        const output = Generation.Image.Output.requested(inputID, modifiers);

        return execute({
          count: modifiers.count ?? Generation.Image.Count.get(),
          input,

          onStarted: () => {
            Generation.Image.Output.set(output);
            onStarted(output);
          },

          onException: (exception) => {
            showErrorSnackbar(exception);
            onException(exception);
            Generation.Image.Output.clear(output.id);
          },

          onSuccess: (images) => {
            images.forEach(Generation.Image.add);
            onSuccess(images);
          },

          onFinished: (result) => {
            Generation.Image.Output.received(output.id, result);
            onFinished(result);
          },
        });
      },
      [showErrorSnackbar]
    );
  };

  export const useIsEnabled = () =>
    Plugin.use(
      ({ createStableDiffusionImages }) => !!createStableDiffusionImages
    );

  export type Latest = Date;
  export namespace Latest {
    export const get = () => State.get().latest;
    export const set = (latest: Latest) => State.get().setLatest(latest);

    export const use = () =>
      State.use(({ latest }) => latest, GlobalState.shallow);

    type State = {
      latest?: Latest;
      setLatest: (latest: Latest) => void;
    };

    namespace State {
      const store = GlobalState.create<State>((set) => ({
        setLatest: (latest: Latest) => set({ latest }),
      }));

      export const get = () => store.getState();
      export const use = store;
    }
  }
}

// TODO: Move somewhere else
function cropImage(
  image: StableStudio.StableDiffusionImage,
  input: Generation.Image.Input
) {
  return new Promise<Generation.Image | void>((resolve) => {
    const id = image.id;
    const blob = image.blob;
    if (!blob || !id) return resolve();

    // crop image to box size
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = input.width;
    croppedCanvas.height = input.height;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const croppedCtx = croppedCanvas.getContext("2d")!;

    const img = new window.Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      croppedCtx.drawImage(
        img,
        0,
        0,
        input.width,
        input.height,
        0,
        0,
        input.width,
        input.height
      );

      croppedCanvas.toBlob((blob) => {
        if (blob) {
          const objectURL = URL.createObjectURL(blob);
          resolve({
            id,
            inputID: input.id,
            created: new Date(),
            src: objectURL,
            finishReason: 0,
          });
        }
      });
    };
  });
}
