import * as ReactQuery from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Remote } from "~/Remote";

export const Provider = ({ children }: React.PropsWithChildren) => (
  <ReactQuery.QueryClientProvider
    client={useMemo(() => Remote.Client.create(), [])}
  >
    {false && <ReactQueryDevtools />}
    {children}
  </ReactQuery.QueryClientProvider>
);
