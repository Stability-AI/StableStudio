import { Environment } from "~/Environment";
import { Remote } from "~/Remote";
import { Router } from "~/Router";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <Environment.Provider>
      <Router.Provider>
        <Remote.Provider>{children}</Remote.Provider>
      </Router.Provider>
    </Environment.Provider>
  );
}
