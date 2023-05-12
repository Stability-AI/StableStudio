import { RpcError } from "@protobuf-ts/runtime-rpc";

import { Snackbar } from "./Snackbar";

export type Exception = {
  /** The underlying error */
  readonly cause: Error | RpcError;

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

  const defaultMessage =
    "Something went wrong on our end, please try again later";

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

    if (
      unknown instanceof RpcError ||
      (unknown instanceof Error && unknown.name === "RpcError")
    ) {
      const rpcError = unknown as RpcError;
      return {
        cause: rpcError,
        description: translateError(rpcError),
        status: isBannedTermError(rpcError)
          ? "BANNED_TERM"
          : isOutOfCreditsError(rpcError)
          ? "OUT_OF_CREDITS"
          : rpcError.code,
      };
    }

    const error =
      unknown instanceof Error ? unknown : new Error(toJSON(unknown));

    return {
      cause: error,
      description: error.message,
    };
  }

  function translateError(error: RpcError): string {
    switch (true) {
      case error.message.includes("Completion canceled by user."):
        return "Canceled";

      case error.message.includes(
        "Unable to remove the only API key remaining."
      ):
        return "Sorry, you can't delete your only API key";

      case error.message.includes("Unable to get organization for request."):
        return "We couldn't find the organization you're asking for";

      case isOutOfCreditsError(error):
        return "Not enough credits";

      case isBannedTermError(error):
        return "Something isn't quite right with your prompts";

      case error.message.includes("Unable to get user for request."):
        return "We couldn't find the user you're asking for";

      case error.message.includes("Unable to locate request organization."):
        return "We couldn't find the organization you're asking for ";

      case error.message.includes("Error filtering prompts."):
        return "Something isn't quite right with your prompts";

      case error.message.includes("Invalid prompts detected"):
        return "Something isn't quite right with your prompts";

      case error.message.includes("no prompts provided"):
        return "You have to provide at least one prompt";

      case error.message.includes(
        "Unable to create a new billing ticket for this request."
      ):
        return "We couldn't create a charge for some reason";

      case error.message.includes("cannot use empty Id for project file"):
        return "You have to specify a project";

      case error.message.includes("Incorrect time range provided."):
        return "Something was wrong with the times you provided";

      case error.message.includes("must provide image parameters"):
        return "Something isn't right with the image you provided";

      case error.message.includes("cannot create project with deleted status"):
        return "That project was already deleted";

      case error.message.includes("Incorrect amount value."):
        return "You can't charge less than $0.00";

      case error.message.includes('API key with ID "'):
        return "We couldn't find the API key you're asking for";

      case error.message.includes('Unable to find organization with ID "'):
        return "We couldn't find the organization you're asking for";

      case error.message.includes("No auto-charge intent."):
        return "You aren't set up for auto-charging";

      case error.message.includes(
        "You do not have permission to access this resource."
      ):
        return "You don't the right permissions";

      case error.message.includes("EmailNotVerifiedMessage"):
        return "You still need to verify your email address";

      case error.message.includes(
        "user is not a member of the requested organization"
      ):
        return "You aren't a member of that organization";

      case error.message.includes(
        "You have insufficient privileges to access this resource."
      ):
        return "You don't have the right permissions";

      case error.message.includes("You have too many API keys."):
        return "There are too many API keys";

      case error.message.includes("Unable to set default organization."):
        return "We couldn't set your default organization";

      case error.message.includes("Unable to update client settings."):
        return "We couldn't update your settings";

      case error.message.includes(
        "Unable to connect to the prompt filter requested"
      ):
        return "We couldn't properly filter your prompt";

      case error.message.includes(
        "Unable to generate cost env for this request."
      ):
        return "We couldn't generate a cost estimate for your request";

      case error.message.includes("Unable to connect to the engine requested"):
        return "Something's wrong with the model your're trying to use";

      case error.message.includes(
        "Unable to connect to the classifier requested"
      ):
        return "We couldn't use the classifier you're asking for";

      case error.message.includes("An unexpected server error occurred."):
        return defaultMessage;

      case error.message.includes("Unable to create a new API key."):
        return "We couldn't create an API key for some reason";

      case error.message.includes("Unable to delete the API key."):
        return "We couldn't delete the API key for some reason";

      case error.message.includes("Unable to create an auto-charge intent:"):
        return "We couldn't set up auto-charge for some reason";

      case error.message.includes("Unable to get auto-charge intent."):
        return "We couldn't get your auto-charge settings";

      case error.message.includes(
        "Unable to create a checkout session for this charge."
      ):
        return "We couldn't create a charge for some reason";

      case error.message.includes("Unable to get charges."):
        return "We couldn't get your charges";

      case error.message.includes("Unable to delete account, contact support"):
        return "We couldn't delete your account, please contact support";

      case error.message.includes("image dimensions must be multiples of 64"):
        return "We somehow sent an image with the wrong dimensions";

      default:
        return defaultMessage;
    }
  }

  export function isBannedTermError(error: RpcError): boolean {
    return error.code === "BANNED_TERM";
  }

  export function isOutOfCreditsError(error: RpcError): boolean {
    return error.message.includes("does not have enough balance");
  }
}
