import * as StableStudio from "@stability/stablestudio-plugin";
import * as ReactQuery from "@tanstack/react-query";

import { Plugin } from "~/Plugin";

export type Samplers = StableStudio.StableDiffusionSampler[];
export namespace Samplers {
  export const use = () => {
    const getStableDiffusionSamplers = Plugin.use(
      ({ getStableDiffusionSamplers }) => getStableDiffusionSamplers
    );

    return ReactQuery.useQuery({
      enabled: !!getStableDiffusionSamplers,

      queryKey: ["Generation.Image.Samplers.use"],
      queryFn: async () => (await getStableDiffusionSamplers?.()) ?? [],
    });
  };

  export const useAreEnabled = () =>
    Plugin.use(({ getStableDiffusionModels }) => !!getStableDiffusionModels);
}
