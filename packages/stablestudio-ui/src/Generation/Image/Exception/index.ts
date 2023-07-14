import { Snackbar } from "./Snackbar";

export type Exception = {
  /** The underlying error */
  readonly cause: Error;

  /** Human-readable description of the underlying error */
  readonly description: string;

  /** Either the gRPC status code or one of our custom statuses */
  readonly status?: "BANNED_TERM" | "OUT_OF_CREDITS" | string;
};

export declare namespace Exception {
  export { Snackbar };
}

export namespace Exception {
  Exception.Snackbar = Snackbar;

  export function is(value: unknown): value is Exception {
    if (!value && typeof value !== "object") return false;
    const exception = value as Exception;
    return (
      exception.cause instanceof Error &&
      (exception.status === undefined ||
        typeof exception.status === "string") &&
      typeof exception.description === "string"
    );
  }

  export function create(unknown: unknown = {}): Exception {
    console.error(unknown);
    const error =
      unknown instanceof Error ? unknown : new Error(toJSON(unknown));

    return {
      cause: error,
      description: error.message,
    };
  }
}
