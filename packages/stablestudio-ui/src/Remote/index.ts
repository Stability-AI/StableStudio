import { Client } from "./Client";
import { Provider } from "./Provider";

export declare namespace Remote {
  export { Client, Provider };
}

export namespace Remote {
  Remote.Client = Client;
  Remote.Provider = Provider;
}
