import * as StableStudio from "@stability/stablestudio-plugin";

import { Plugin } from "~/Plugin";

import { Dropdown } from "./Dropdown";

export type Sampler = StableStudio.StableDiffusionSampler[];

export declare namespace Sampler {
  export { Dropdown };
}

export namespace Sampler {
  export const use = () => {
    const getStableDiffusionSamplers = Plugin.use(
      ({ getStableDiffusionSamplers }) => getStableDiffusionSamplers
    );

    const samplers = useMemo(
      () => getStableDiffusionSamplers?.(),
      [getStableDiffusionSamplers]
    );
    return { samplers };
  };

  export const useAreEnabled = () =>
    Plugin.use(
      ({ getStableDiffusionSamplers }) => !!getStableDiffusionSamplers
    );

  Sampler.Dropdown = Dropdown;
}
