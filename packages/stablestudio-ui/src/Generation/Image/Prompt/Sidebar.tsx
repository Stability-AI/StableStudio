import { App } from "~/App";
import { Generation } from "~/Generation";
export namespace Sidebar {
  export function Section({ id }: { id: ID }) {
    const { input } = Generation.Image.Input.use(id);
    if (!input) return null;
    return (
      <App.Sidebar.Section
        divider
        defaultExpanded
        padding="sm"
        // button={(props) => (
        //   <Theme.Button
        //     {...props}
        //     iconRight={Theme.Icon.Plus}
        //     onClick={() => addPrompt()}
        //     disabled={input.prompts.length >= 10}
        //     className={classes(props.className, "mr-1 mt-1")}
        //     size="sm"
        //   >
        //     Add prompt
        //   </Theme.Button>
        // )}
      >
        <Generation.Image.Prompts id={id} />
      </App.Sidebar.Section>
    );
  }
}
