import * as ReactQuery from "@tanstack/react-query";

import { Generation } from "~/Generation";
import { Plugin } from "~/Plugin";

import { Cursor } from "../Query/Cursor";

import { Button } from "./Button";

export declare namespace Delete {
  export { Button };
}

export namespace Delete {
  Delete.Button = Button;

  export const use = () => {
    const deleteStableDiffusionImages = Plugin.use(
      ({ deleteStableDiffusionImages }) => deleteStableDiffusionImages
    );

    const queryClient = ReactQuery.useQueryClient();
    return ReactQuery.useMutation(async (ids: IDs) => {
      if (!deleteStableDiffusionImages) return;

      Generation.Image.Output.remove(ids);
      queryClient.setQueryData(
        ["Generation.Images.use", "defaultProject", "descending"],
        (
          data:
            | ReactQuery.InfiniteData<Cursor & { data: Generation.Images }>
            | undefined
        ) => ({
          pages:
            data?.pages.map((page) => ({
              ...page,
              data: page.data.filter((image) => !ids.includes(image.id ?? "")),
            })) ?? [],

          pageParams: data?.pageParams ?? [],
        })
      );

      return deleteStableDiffusionImages({ imageIDs: ids });
    });
  };

  export const useIsEnabled = () =>
    Plugin.use(
      ({ deleteStableDiffusionImages }) => !!deleteStableDiffusionImages
    );
}
