import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Button({
  variant,
  deleteTooltip,
  className,
  images,
  outline,
}: Styleable & {
  // TODO: This sucks
  variant?: "group";
  deleteTooltip?: string;
  images: IDs;
  outline?: boolean;
}) {
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const deleteImages = Generation.Images.Delete.use();
  const isEnabled = Generation.Images.Delete.useIsEnabled();
  return useMemo(
    () =>
      !isEnabled ? null : deleteConfirming ? (
        <div className={classes("-py-1 rounded bg-black/75 px-1", className)}>
          <Generation.Image.Controls.Button
            alwaysShow={variant === "group"}
            name={deleteTooltip ?? "Delete image"}
            icon={(props) => (
              <Theme.Icon.Check
                {...props}
                className={classes(
                  props.className,
                  "h-6 w-6 origin-center scale-[0.9] text-red-500/75 opacity-100 hover:text-red-500/100"
                )}
              />
            )}
            onClick={() => {
              deleteImages.mutate(images);
              setDeleteConfirming(false);
            }}
            transparent
            noBg
          />
          <Generation.Image.Controls.Button
            name="Cancel"
            onClick={() => setDeleteConfirming(false)}
            icon={(props) => (
              <Theme.Icon.X
                {...props}
                className={classes(props.className, "opacity-100")}
              />
            )}
            transparent
            noBg
          />
        </div>
      ) : (
        <Generation.Image.Controls.Button
          name={deleteTooltip ?? "Delete image"}
          icon={Theme.Icon.Trash}
          onClick={() => setDeleteConfirming(true)}
          transparent={!outline}
          outline={outline}
          noBg={outline}
        />
      ),
    [
      deleteConfirming,
      className,
      variant,
      deleteTooltip,
      outline,
      deleteImages,
      images,
    ]
  );
}
