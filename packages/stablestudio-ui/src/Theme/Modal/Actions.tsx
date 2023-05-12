import { Theme } from "..";

export type Action = {
  label: string;
  onClick: () => void;
  variant?: "brand" | "red" | "zinc";
  size?: Theme.Common.Size;
  disabled?: boolean;
};

export type Actions = Action[];

export function Actions({ actions }: { actions: Actions }) {
  return (
    <div className="mt-4 flex flex-row items-center justify-end gap-2">
      {actions.map((action, index) => (
        <Action {...action} key={index} />
      ))}
    </div>
  );
}

function Action({
  label,
  onClick,
  variant = "zinc",
  size = Theme.Common.Size.preset(),
  disabled = false,
}: Action) {
  return (
    <Theme.Button
      color={variant}
      onClick={onClick}
      size={size}
      disabled={disabled}
    >
      {label}
    </Theme.Button>
  );
}
