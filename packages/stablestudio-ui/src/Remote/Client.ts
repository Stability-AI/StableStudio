import * as ReactQuery from "@tanstack/react-query";

let client: Client;

export type Client = ReactQuery.QueryClient;
export namespace Client {
  export const get = () => client;

  export const create = () =>
    (client ||= new ReactQuery.QueryClient({
      defaultOptions: {
        mutations: { cacheTime: 0 },
        queries: {
          cacheTime: 24 * 60 * 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }));
}
