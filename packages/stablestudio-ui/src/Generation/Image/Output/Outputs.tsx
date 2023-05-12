import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

import { State } from "./State";

export type Outputs = Generation.Image.Output[];
export namespace Outputs {
  export const set = (outputs: Outputs) => State.get().setOutputs(outputs);
  export const nextID = () => State.get().nextID;

  export const use = (): Outputs =>
    State.use(({ outputs }) =>
      Object.values(outputs).sort((a, b) => {
        if (a.requestedAt && b.requestedAt)
          return b.requestedAt.valueOf() - a.requestedAt.valueOf();

        if (a.requestedAt) return -1;
        if (b.requestedAt) return 1;

        if (a.completedAt && b.completedAt)
          return b.completedAt.valueOf() - a.completedAt.valueOf();

        if (a.completedAt) return -1;
        if (b.completedAt) return 1;

        return 0;
      })
    );

  export const useIsGenerating = () =>
    State.use(
      ({ outputs }) =>
        Object.values(outputs).some(Generation.Image.Output.isGenerating),
      GlobalState.shallow
    );
}
