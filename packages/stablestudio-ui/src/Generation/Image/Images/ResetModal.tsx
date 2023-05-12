import { Theme } from "~/Theme";

export function ResetModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Theme.Modal modalName="Reset" open={open} onClose={onClose}>
      <Theme.Modal.Panel className="w-[20rem] gap-5 p-4">
        <Theme.Modal.Title>Clear Session?</Theme.Modal.Title>
        <Theme.Modal.Description>
          All the images from this session will be saved to your history.
        </Theme.Modal.Description>
        <Theme.Modal.Actions
          actions={[
            {
              label: "Cancel",
              onClick: onClose,
              size: "lg",
            },
            {
              label: "Clear",
              onClick: () => {
                onConfirm?.();
                onClose();
              },
              variant: "red",
              size: "lg",
            },
          ]}
        />
      </Theme.Modal.Panel>
    </Theme.Modal>
  );
}
