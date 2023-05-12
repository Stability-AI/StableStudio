import * as StableStudio from "@stability/stablestudio-plugin";
import * as ReactQuery from "@tanstack/react-query";

import { Plugin } from "~/Plugin";

export type Models = StableStudio.StableDiffusionModel[];
export namespace Models {
  export const use = () => {
    const getStableDiffusionModels = Plugin.use(
      ({ getStableDiffusionModels }) => getStableDiffusionModels
    );

    return ReactQuery.useQuery({
      enabled: !!getStableDiffusionModels,

      queryKey: ["Generation.Image.Models.use"],
      queryFn: async () => (await getStableDiffusionModels?.()) ?? [],
    });
  };

  export const useAreEnabled = () =>
    Plugin.use(({ getStableDiffusionModels }) => !!getStableDiffusionModels);
}
