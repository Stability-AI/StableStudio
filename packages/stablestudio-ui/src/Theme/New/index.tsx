import { Theme } from "~/Theme";

export function New(props: Theme.Badge.Props) {
  return (
    <Theme.Badge {...props} variant="outline" color="zinc">
      {props.children ?? <>New</>}
    </Theme.Badge>
  );
}
