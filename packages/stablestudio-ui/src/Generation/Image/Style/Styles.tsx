import * as ReactQuery from "@tanstack/react-query";

import { Generation } from "~/Generation";
import { Plugin } from "~/Plugin";

export type Styles = Generation.Image.Style[];
export namespace Styles {
  export const use = () => {
    const getStableDiffusionStyles = Plugin.use(
      ({ getStableDiffusionStyles }) => getStableDiffusionStyles
    );

    return ReactQuery.useQuery({
      enabled: !!getStableDiffusionStyles,

      queryKey: ["Generation.Image.Styles.use"],
      queryFn: async () => (await getStableDiffusionStyles?.()) ?? [],
    });
  };

  export const useAreEnabled = () =>
    Plugin.use(({ getStableDiffusionStyles }) => !!getStableDiffusionStyles);
}
