import { Comfy } from "~/Comfy";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

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

  export const execute = async ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    count = Generation.Image.Count.preset(),
    input,

    onStarted = doNothing,
    onException = doNothing,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    onSuccess = doNothing,
    onFinished = doNothing,
  }: Handlers & {
    count: number;
    input: Generation.Image.Input;
  }): Promise<undefined | Generation.Image.Exception> => {
    try {
      Latest.set(new Date());
      onStarted();

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

      console.log(Comfy.get());

      Comfy.get()
        ?.graph._nodes?.filter(
          (node) =>
            node.type === "PrimitiveNode" &&
            node.title.toLowerCase().startsWith("stablestudio")
        )
        .forEach((node) => {
          const widget = node.widgets.find((widget) => widget.name === "value");
          if (widget) {
            const normalized = node.title
              .toLowerCase()
              .replace("stablestudio", "")
              .trim()
              .replace(" ", "_");
            if (normalized === "batch_size") {
              widget.value = count;
            } else if (normalized === "model" && input.model) {
              widget.value = input.model;
            } else if (
              normalized === "sampler" &&
              (input.sampler?.id?.length || 0) > 2
            ) {
              widget.value = input.sampler?.id;
            } else if (normalized === "steps" && input.steps) {
              widget.value = input.steps;
            } else if (normalized === "seed" && input.seed !== 0) {
              widget.value = input.seed;
            } else if (normalized === "cfg" && input.cfgScale) {
              widget.value = input.cfgScale;
            } else if (normalized === "width") {
              widget.value = input.width;
            } else if (normalized === "height") {
              widget.value = input.height;
            } else if (normalized === "positive_prompt") {
              widget.value = input.prompts.find((p) => p.weight > 0)?.text;
            } else if (normalized === "negative_prompt") {
              widget.value = input.prompts.find((p) => p.weight < 0)?.text;
            }
          }
        });
      Comfy.get()?.refreshComboInNodes();
      await Comfy.get()?.queuePrompt(-1, 1);
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

        return execute({
          count: modifiers.count ?? Generation.Image.Count.get(),
          input,

          onStarted: (output) => {
            onStarted(output);
          },

          onException: (exception) => {
            showErrorSnackbar(exception);
            onException(exception);
          },

          onSuccess: (images) => {
            onSuccess(images);
          },

          onFinished: (result) => {
            onFinished(result);
          },
        });
      },
      [showErrorSnackbar]
    );
  };

  export const useIsEnabled = () => Comfy.use(({ running }) => running);

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
