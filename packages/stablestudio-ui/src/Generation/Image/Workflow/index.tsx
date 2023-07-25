import { invoke } from "@tauri-apps/api/tauri";
import { create } from "zustand";
import { Comfy } from "~/Comfy";
import { Theme } from "~/Theme";

import { Modal } from "./Modal";

export type Workflow = {
  name: string;
  icon?: string;
  description?: string;
  serialized_workflow: string;
  created_at: string;
};

export declare namespace Workflow {
  export { Modal };
}

export namespace Workflow {
  export const saveWorkflow = async (
    name: string,
    icon: string,
    description: string
  ) => {
    const comfyApp = Comfy.get();
    if (!comfyApp) return;

    const serializedWorkflow = JSON.stringify(comfyApp.graph.serialize(), null);
    try {
      await invoke("save_workflow", {
        name,
        icon,
        serializedWorkflow,
        description,
      });
    } catch (error) {
      console.error(error);
    }

    console.log("saved! reloading workflows");

    try {
      Workflow.fetchWorkflows();
    } catch (error) {
      console.error(error);
    }
  };

  function SlightBox({
    onClick,
    name,
    icon,
  }: {
    onClick: (e: any) => void;
    name: string;
    icon: React.ReactNode;
  }) {
    return (
      <div
        key="save"
        onClick={onClick}
        className={classes(
          "group flex cursor-pointer flex-col rounded duration-100"
        )}
      >
        <div className="mb-2 aspect-square min-h-0 w-full min-w-0 rounded-lg border border-dashed border-transparent border-zinc-600 duration-100 group-hover:border-solid group-hover:border-zinc-400">
          {icon}
        </div>
        <h1
          className={classes(
            "w-full grow select-none text-zinc-400 group-hover:text-zinc-200"
          )}
        >
          {name}
        </h1>
      </div>
    );
  }

  export const fetchWorkflows = async () => {
    const response = await invoke("fetch_workflows");
    Workflow.use.getState().setWorkflows(response as Workflow[]);
  };

  export const applyWorkflow = async (workflowId: string) => {
    const workflow = use
      .getState()
      .workflows.find((workflow) => workflow.name === workflowId);

    if (!workflow) return;

    const comfyApp = Comfy.get();
    if (!comfyApp) return;

    // turn serialized_workflow string into a file
    const blob = new Blob([workflow.serialized_workflow], {
      type: "text/json",
    });
    const file = new File([blob], "workflow.json", { type: "text/json" });

    // load the file into comfy
    comfyApp.handleFile(file);
  };

  export const use = create<{
    workflows: Workflow[];
    setWorkflows: (workflows: Workflow[]) => void;
  }>((set) => ({
    workflows: [],
    setWorkflows: (workflows) => set({ workflows }),
  }));

  export function Dropdown({ className }: Styleable) {
    const { workflows, setWorkflows } = Workflow.use();

    useEffect(() => {
      fetchWorkflows();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const options = useMemo(
      () => [
        {
          value: " save",
          image: "/save.svg",
          component: (onClick: any) => (
            <SlightBox
              onClick={(e) => {
                Modal.State.use.getState().setOpen(true);
                onClick(e);
              }}
              name="Save workflow"
              icon={<Theme.Icon.Save color="#7F7F7F" />}
            />
          ),
        },

        ...(workflows ?? [])
          .sort((a, b) =>
            new Date(a.created_at) > new Date(b.created_at) ? -1 : 1
          )
          .map((workflow: Workflow) => ({
            value: workflow.name,
            name: workflow.name,
            image: workflow.icon ?? "/file-code.svg",
            onDelete: async () => {
              await invoke("delete_workflow", {
                name: workflow.name.replace(/ /g, "_").toLowerCase(),
              });
              setWorkflows(workflows.filter((w) => w.name !== workflow.name));
            },
          })),

        {
          value: " default",
          image: "/rotate.svg",
          component: (onClick: any) => (
            <SlightBox
              onClick={(e) => {
                Comfy.get()?.loadGraphData();
                onClick(e);
              }}
              name="Load default"
              icon={<Theme.Icon.Rotate color="#7F7F7F" />}
            />
          ),
        },
      ],
      [setWorkflows, workflows]
    );

    return (
      <>
        <Theme.Popout
          title="Workflows"
          label="Workflow"
          options={options}
          value={null}
          placeholder={"Select workflow"}
          className={classes(className)}
          onClick={applyWorkflow}
        />
        <Modal />
      </>
    );
  }
}
