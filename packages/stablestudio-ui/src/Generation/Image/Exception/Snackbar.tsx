import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Snackbar {
  export const use = () => {
    const { enqueueSnackbar } = Theme.Snackbar.use();
    return useCallback(
      (exception: Generation.Image.Exception) =>
        enqueueSnackbar(exception.description, {
          variant: "error",
        }),
      [enqueueSnackbar]
    );
  };
}
