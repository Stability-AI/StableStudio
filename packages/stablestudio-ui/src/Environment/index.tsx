import { CustomError } from "ts-custom-error";

declare global {
  interface ImportMeta {
    readonly env: Environment;
  }

  interface ImportMetaEnv {
    readonly VITE_GIT_HASH: string;
    readonly VITE_USE_EXAMPLE_PLUGIN: string;
  }
}

export type Environment = ImportMetaEnv;
export namespace Environment {
  export type VariableName = keyof typeof variables extends `VITE_${infer K}`
    ? K
    : never;

  const variables = {
    VITE_GIT_HASH: import.meta.env.VITE_GIT_HASH,
    VITE_USE_EXAMPLE_PLUGIN: import.meta.env.VITE_USE_EXAMPLE_PLUGIN ?? "false",
  } as const;

  export function get(name: VariableName): string {
    return variables[`VITE_${name}` as const];
  }

  export class MissingVariablesError extends CustomError {
    constructor(missingVariables: string[]) {
      missingVariables.map((name) => `\`${name}\` is \`undefined\`!`);
      super(missingVariables.join("\n"));
    }
  }

  export function Provider({ children }: React.PropsWithChildren) {
    useEffect(() => {
      const missingVariables = Object.entries(variables)
        .filter(([, value]) => `${value ?? ""}` === "")
        .map(([name]) => name);

      if (!missingVariables[0]) return;
      throw new Environment.MissingVariablesError(missingVariables);
    }, []);

    return <>{children}</>;
  }
}
