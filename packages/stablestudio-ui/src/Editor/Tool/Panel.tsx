import { Editor } from "~/Editor";

export function Panel() {
  const [tool] = Editor.Tool.Active.use();

  const { body } = useMemo(() => {
    switch (tool) {
      case "brush":
        return {
          body: <Editor.Brush.Panel />,
        };

      default:
        return {};
    }
  }, [tool]);

  return (
    <Editor.Panels fixed className="max-w-[300px]">
      <Editor.Panel
        position="topLeft"
        title={<span className="capitalize">{tool}</span>}
        contentClassName="w-[300px]"
      >
        {body}
      </Editor.Panel>
    </Editor.Panels>
  );
}
