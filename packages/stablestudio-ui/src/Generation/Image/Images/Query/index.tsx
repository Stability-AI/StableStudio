import * as ReactQuery from "@tanstack/react-query";

import { Cursor } from "./Cursor";
import { Execute } from "./Execute";

export namespace Query {
  export const use = () => {
    const queryFn = Execute.use();

    return ReactQuery.useInfiniteQuery({
      enabled: !!queryFn,

      queryKey: ["Generation.Images.Query.use"],
      queryFn,

      staleTime: Infinity,
      cacheTime: Infinity,

      getNextPageParam: (cursor) =>
        cursor.stopID ? Cursor.next(cursor) : undefined,

      getPreviousPageParam: (cursor) =>
        cursor.stopID ? Cursor.previous(cursor) : undefined,

      select: useCallback(
        (data: ReactQuery.InfiniteData<Cursor>) => ({
          pages: [...data.pages].reverse(),
          pageParams: [...data.pageParams].reverse(),
        }),
        []
      ),
    });
  };
}
