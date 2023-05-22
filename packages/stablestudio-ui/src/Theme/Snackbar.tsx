import { CustomContentProps, SnackbarProvider } from "notistack";

import { Theme } from "~/Theme";

export { useSnackbar as use, type CustomContentProps } from "notistack";

export function Provider({ children }: React.PropsWithChildren) {
  return (
    <SnackbarProvider
      maxSnack={6}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      Components={{
        default: DefaultSnackbar,
        info: InfoSnackbar,
        error: ErrorSnackbar,
        success: SuccessSnackbar,
        warning: WarningSnackbar,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}

declare module "notistack" {
  interface VariantOverrides {
    outOfCredits: true;
  }
}

const Snackbar = React.forwardRef<
  HTMLDivElement,
  CustomContentProps & { Icon?: React.ReactElement }
>(({ id, message, persist, Icon }, ref) => {
  const { closeSnackbar } = Theme.Snackbar.use();

  return (
    <div
      className="mb-4 flex items-center rounded-lg border border-black/20 bg-white p-3 text-zinc-500 shadow dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      role="alert"
      ref={ref}
    >
      {Icon}
      <div className="ml-3">{message}</div>
      {persist && (
        <button
          type="button"
          className="-mx-1.5 -my-1.5 ml-3 inline-flex h-8 w-8 rounded-lg bg-white p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-white"
          onClick={() => closeSnackbar(id)}
        >
          <span className="sr-only">Close</span>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
});

// TODO: Add a drop-down that lets the user see more raw error text & an error trace ID
const ErrorSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => (
    <Snackbar
      {...props}
      ref={ref}
      Icon={
        <Theme.Icon.AlertTriangle className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-red-600 dark:text-red-500" />
      }
    />
  )
);

const WarningSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => (
    <Snackbar
      {...props}
      ref={ref}
      Icon={
        <Theme.Icon.AlertCircle className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-orange-600 dark:text-orange-500" />
      }
    />
  )
);

const InfoSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => (
    <Snackbar
      {...props}
      ref={ref}
      Icon={
        <Theme.Icon.Info className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-blue-600 dark:text-blue-500" />
      }
    />
  )
);

const SuccessSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => (
    <Snackbar
      {...props}
      ref={ref}
      Icon={
        <Theme.Icon.Check className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-500" />
      }
    />
  )
);

const DefaultSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => <Snackbar {...props} ref={ref} />
);
