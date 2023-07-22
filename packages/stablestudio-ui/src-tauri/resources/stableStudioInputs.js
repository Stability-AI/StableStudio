/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-this-alias */
import { app } from "../scripts/app.js";

function getWidgetType(config) {
  // Special handling for COMBO so we restrict links based on the entries
  let type = config[0];
  let linkType = type;
  if (type instanceof Array) {
    type = "COMBO";
    linkType = linkType.join(",");
  }
  return { type, linkType };
}

app.registerExtension({
  name: "StableStudio.Inputs",
  registerCustomNodes() {
    class StableStudioNode {
      color = LGraphCanvas.node_colors.purple.color;
      bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
      constructor() {
        this.addOutput("batch_size", "INT");
        this.addOutput("steps", "INT");
        this.addOutput("seed", "INT");
        this.addOutput("width", "INT");
        this.addOutput("height", "INT");
        this.addOutput("positive_prompt", "STRING");
        this.addOutput("negative_prompt", "STRING");
        this.addOutput("cfg", "FLOAT");
        this.addOutput(
          "sampler_name",
          "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2"
        );
        this.addOutput("ckpt_name", null);
        this.serialize_widgets = false;
        this.isVirtualNode = true;

        this.updateLoop = setInterval(async () => {
          const resp = await fetch("/object_info", { cache: "no-cache" });
          const data = await resp.json();
          if (data) {
            const models =
              data.CheckpointLoader?.input?.required?.ckpt_name?.[0] ?? [];
            const samplers =
              data.KSampler?.input?.required?.sampler_name?.[0] ?? [];

            if (!this.stableValues.ckpt_name) {
              this.stableValues.ckpt_name = models[0];
            }
            if (!this.stableValues.sampler_name) {
              this.stableValues.sampler_name = samplers[0];
            }

            this.outputs[8].type = samplers.join(",");
            this.outputs[9].type = models.join(",");
          }
        }, 15000);

        this.stableValues = {
          batch_size: 4,
          steps: 50,
          seed: 0,
          width: 512,
          height: 512,
          positive_prompt: "",
          negative_prompt: "",
          cfg: 7,
          sampler_name: "",
          ckpt_name: "",
        };
      }

      applyToGraph() {
        if (!this.outputs.some((o) => o.links?.length)) return;

        function get_links(node) {
          let links = [];
          for (const o of node.outputs) {
            if (!o.links?.length) continue;
            for (const l of o.links) {
              const linkInfo = app.graph.links[l];
              const n = node.graph.getNodeById(linkInfo.target_id);
              if (n.type == "Reroute") {
                links = links.concat(get_links(n));
              } else {
                links.push(l);
              }
            }
          }
          return links;
        }

        let links = get_links(this);
        // For each output link copy our value over the original widget value
        for (const l of links) {
          const linkInfo = app.graph.links[l];

          const node = this.graph.getNodeById(linkInfo.target_id);
          const input = node.inputs[linkInfo.target_slot];
          const widgetName = input.widget.name;
          if (widgetName) {
            const widget = node.widgets.find((w) => w.name === widgetName);
            if (widget) {
              let stableValue = this.outputs.find(
                (o) => o.slot_index === linkInfo.origin_slot
              )?.name;

              if (!stableValue) {
                // try to match with name
                stableValue = this.outputs.find(
                  (o) => o.name === input.name
                )?.name;
              }

              if (!stableValue) continue;
              widget.value = this.stableValues[stableValue] ?? widget.value;
              if (widget.callback) {
                widget.callback(
                  widget.value,
                  app.canvas,
                  node,
                  app.canvas.graph_mouse,
                  {}
                );
              }
            }
          }
        }
      }

      onConnectionsChange(_, index, connected) {
        console.log("onConnectionsChange", index, connected);
        // if (connected) {
        //   if (this.outputs[0].links?.length) {
        //     if (!this.widgets?.length) {
        //       this.#onFirstConnection();
        //     }
        //     if (!this.widgets?.length && this.outputs[0].widget) {
        //       // On first load it often cant recreate the widget as the other node doesnt exist yet
        //       // Manually recreate it from the output info
        //       this.#createWidget(this.outputs[0].widget.config);
        //     }
        //   }
        // } else if (!this.outputs[0].links?.length) {
        //   this.#onLastDisconnect();
        // }
      }

      onConnectOutput(slot, type, input) {
        // Fires before the link is made allowing us to reject it if it isn't valid
        // No widget, we cant connect
        // if (!input.widget) {
        //   if (!(input.type in ComfyWidgets)) return false;
        // }
        // if (this.outputs[slot].links?.length) {
        //   return this.#isValidConnection(input);
        // }

        // let a STRING connect to a ckpt_name
        if (
          this.outputs[slot].type === "STRING" &&
          input.name === "ckpt_name"
        ) {
          return true;
        }
      }

      #onFirstConnection() {
        // First connection can fire before the graph is ready on initial load so random things can be missing
        const linkId = this.outputs[0].links[0];
        const link = this.graph.links[linkId];
        if (!link) return;
        const theirNode = this.graph.getNodeById(link.target_id);
        if (!theirNode || !theirNode.inputs) return;
        const input = theirNode.inputs[link.target_slot];
        if (!input) return;
        var _widget;
        if (!input.widget) {
          if (!(input.type in ComfyWidgets)) return;
          _widget = { name: input.name, config: [input.type, {}] }; //fake widget
        } else {
          _widget = input.widget;
        }
        const widget = _widget;
        const { type, linkType } = getWidgetType(widget.config);
        // Update our output to restrict to the widget type
        this.outputs[0].type = linkType;
        this.outputs[0].name = type;
        this.outputs[0].widget = widget;
        this.#createWidget(widget.config, theirNode, widget.name);
      }

      #createWidget(inputData, node, widgetName) {
        let type = inputData[0];

        if (type instanceof Array) {
          type = "COMBO";
        }

        let widget;
        if (type in ComfyWidgets) {
          widget = (ComfyWidgets[type](this, "value", inputData, app) || {})
            .widget;
        } else {
          widget = this.addWidget(type, "value", null, () => {}, {});
        }

        if (node?.widgets && widget) {
          const theirWidget = node.widgets.find((w) => w.name === widgetName);
          if (theirWidget) {
            widget.value = theirWidget.value;
          }
        }

        if (widget.type === "number" || widget.type === "combo") {
          addValueControlWidget(this, widget, "fixed");
        }

        // When our value changes, update other widgets to reflect our changes
        // e.g. so LoadImage shows correct image
        const callback = widget.callback;
        const self = this;
        widget.callback = function () {
          const r = callback ? callback.apply(this, arguments) : undefined;
          self.applyToGraph();
          return r;
        };

        // Grow our node if required
        const sz = this.computeSize();
        if (this.size[0] < sz[0]) {
          this.size[0] = sz[0];
        }
        if (this.size[1] < sz[1]) {
          this.size[1] = sz[1];
        }

        requestAnimationFrame(() => {
          if (this.onResize) {
            this.onResize(this.size);
          }
        });
      }

      #isValidConnection(input) {
        // Only allow connections where the configs match
        const config1 = this.outputs[0].widget.config;
        const config2 = input.widget.config;

        if (config1[0] instanceof Array) {
          // These checks shouldnt actually be necessary as the types should match
          // but double checking doesn't hurt

          // New input isnt a combo
          if (!(config2[0] instanceof Array)) return false;
          // New imput combo has a different size
          if (config1[0].length !== config2[0].length) return false;
          // New input combo has different elements
          if (config1[0].find((v, i) => config2[0][i] !== v)) return false;
        } else if (config1[0] !== config2[0]) {
          // Configs dont match
          return false;
        }

        for (const k in config1[1]) {
          if (k !== "default") {
            if (config1[1][k] !== config2[1][k]) {
              return false;
            }
          }
        }

        return true;
      }
    }

    LiteGraph.registerNodeType(
      "StableStudioNode",
      Object.assign(StableStudioNode, {
        title: "StableStudio Input",
      })
    );
    StableStudioNode.category = "stablestudio";
  },
});
