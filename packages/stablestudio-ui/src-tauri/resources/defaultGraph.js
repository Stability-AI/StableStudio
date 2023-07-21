export const defaultGraph = {
  last_node_id: 19,
  last_link_id: 30,
  nodes: [
    {
      id: 14,
      type: "PrimitiveNode",
      pos: [-230.75965115736872, 325.6648804704241],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 8,
      mode: 0,
      outputs: [
        {
          name: "INT",
          type: "INT",
          links: [20],
          widget: {
            name: "seed",
            config: [
              "INT",
              {
                default: 0,
                min: 0,
                max: 18446744073709552000,
              },
            ],
          },
        },
      ],
      title: "StableStudio Seed",
      properties: {},
      widgets_values: [557382126738322, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 12,
      type: "PrimitiveNode",
      pos: [-247.75965115736852, 374.6648804704238],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 6,
      mode: 0,
      outputs: [
        {
          name: "COMBO",
          type: "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
          links: [16],
          widget: {
            name: "sampler_name",
            config: [
              [
                "euler",
                "euler_ancestral",
                "heun",
                "dpm_2",
                "dpm_2_ancestral",
                "lms",
                "dpm_fast",
                "dpm_adaptive",
                "dpmpp_2s_ancestral",
                "dpmpp_sde",
                "dpmpp_sde_gpu",
                "dpmpp_2m",
                "dpmpp_2m_sde",
                "dpmpp_2m_sde_gpu",
                "ddim",
                "uni_pc",
                "uni_pc_bh2",
              ],
            ],
          },
        },
      ],
      title: "StableStudio Sampler",
      properties: {},
      widgets_values: ["dpmpp_sde", "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 15,
      type: "PrimitiveNode",
      pos: [-232.75965115736875, 426.6648804704238],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 9,
      mode: 0,
      outputs: [
        {
          name: "INT",
          type: "INT",
          links: [22],
          widget: {
            name: "steps",
            config: [
              "INT",
              {
                default: 20,
                min: 1,
                max: 10000,
              },
            ],
          },
        },
      ],
      title: "StableStudio Steps",
      properties: {},
      widgets_values: [50, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 11,
      type: "PrimitiveNode",
      pos: [-232.75965115736875, 481.6648804704238],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 5,
      mode: 0,
      outputs: [
        {
          name: "COMBO",
          type: "v2-1_768-ema-pruned.safetensors",
          links: [14],
          widget: {
            name: "ckpt_name",
            config: [["v2-1_768-ema-pruned.safetensors"]],
          },
        },
      ],
      title: "StableStudio Model",
      properties: {},
      widgets_values: ["v2-1_768-ema-pruned.safetensors", "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 13,
      type: "PrimitiveNode",
      pos: [-215.75965115736875, 536.6648804704238],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 7,
      mode: 0,
      outputs: [
        {
          name: "FLOAT",
          type: "FLOAT",
          links: [18],
          widget: {
            name: "cfg",
            config: [
              "FLOAT",
              {
                default: 8,
                min: 0,
                max: 100,
              },
            ],
          },
        },
      ],
      title: "StableStudio cfg",
      properties: {},
      widgets_values: [8, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 17,
      type: "PrimitiveNode",
      pos: [-286.7596511573686, 589.6648804704237],
      size: [235.1999969482422, 75.99998569488525],
      flags: {
        collapsed: true,
      },
      order: 0,
      mode: 0,
      outputs: [
        {
          name: "STRING",
          type: "STRING",
          links: [26],
          widget: {
            name: "text",
            config: [
              "STRING",
              {
                multiline: true,
              },
            ],
          },
        },
      ],
      title: "StableStudio Positive Prompt",
      properties: {},
      widgets_values: [
        "Glowing aurora borealis over a frozen lake, with towering mountains in the distance, ethereal, magical, winter landscape, high detail",
      ],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 10,
      type: "PrimitiveNode",
      pos: [-261.7596511573686, 708.6648804704237],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 4,
      mode: 0,
      outputs: [
        {
          name: "INT",
          type: "INT",
          links: [12],
          slot_index: 0,
          widget: {
            name: "batch_size",
            config: [
              "INT",
              {
                default: 1,
                min: 1,
                max: 64,
              },
            ],
          },
        },
      ],
      title: "StableStudio Batch Size",
      properties: {},
      widgets_values: [4, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 18,
      type: "PrimitiveNode",
      pos: [-233.7596511573687, 769.6648804704237],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 2,
      mode: 0,
      outputs: [
        {
          name: "INT",
          type: "INT",
          links: [28],
          widget: {
            name: "width",
            config: [
              "INT",
              {
                default: 512,
                min: 64,
                max: 8192,
                step: 8,
              },
            ],
          },
        },
      ],
      title: "StableStudio Width",
      properties: {},
      widgets_values: [768, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 19,
      type: "PrimitiveNode",
      pos: [-233.7596511573687, 823.6648804704237],
      size: {
        0: 210,
        1: 82,
      },
      flags: {
        collapsed: true,
      },
      order: 3,
      mode: 0,
      outputs: [
        {
          name: "INT",
          type: "INT",
          links: [30],
          widget: {
            name: "height",
            config: [
              "INT",
              {
                default: 512,
                min: 64,
                max: 8192,
                step: 8,
              },
            ],
          },
        },
      ],
      title: "StableStudio Height",
      properties: {},
      widgets_values: [768, "fixed"],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 16,
      type: "PrimitiveNode",
      pos: [-286.7808471339315, 648.0887886735504],
      size: {
        0: 235.1999969482422,
        1: 76,
      },
      flags: {
        collapsed: true,
      },
      order: 1,
      mode: 0,
      outputs: [
        {
          name: "STRING",
          type: "STRING",
          links: [24],
          widget: {
            name: "text",
            config: [
              "STRING",
              {
                multiline: true,
              },
            ],
          },
        },
      ],
      title: "StableStudio Negative Prompt",
      properties: {},
      widgets_values: [""],
      color: "#323",
      bgcolor: "#535",
    },
    {
      id: 6,
      type: "CLIPTextEncode",
      pos: [-1, 591],
      size: {
        0: 210,
        1: 54,
      },
      flags: {
        collapsed: true,
      },
      order: 12,
      mode: 0,
      inputs: [
        {
          name: "clip",
          type: "CLIP",
          link: 3,
        },
        {
          name: "text",
          type: "STRING",
          link: 26,
          widget: {
            name: "text",
            config: [
              "STRING",
              {
                multiline: true,
              },
            ],
          },
          slot_index: 1,
        },
      ],
      outputs: [
        {
          name: "CONDITIONING",
          type: "CONDITIONING",
          links: [4],
          slot_index: 0,
        },
      ],
      properties: {
        "Node name for S&R": "CLIPTextEncode",
      },
      widgets_values: [
        "Glowing aurora borealis over a frozen lake, with towering mountains in the distance, ethereal, magical, winter landscape, high detail",
      ],
    },
    {
      id: 7,
      type: "CLIPTextEncode",
      pos: [-2, 649],
      size: {
        0: 210,
        1: 54,
      },
      flags: {
        collapsed: true,
      },
      order: 13,
      mode: 0,
      inputs: [
        {
          name: "clip",
          type: "CLIP",
          link: 5,
        },
        {
          name: "text",
          type: "STRING",
          link: 24,
          widget: {
            name: "text",
            config: [
              "STRING",
              {
                multiline: true,
              },
            ],
          },
          slot_index: 1,
        },
      ],
      outputs: [
        {
          name: "CONDITIONING",
          type: "CONDITIONING",
          links: [6],
          slot_index: 0,
        },
      ],
      properties: {
        "Node name for S&R": "CLIPTextEncode",
      },
      widgets_values: [""],
    },
    {
      id: 5,
      type: "EmptyLatentImage",
      pos: [6, 720],
      size: {
        0: 315,
        1: 106,
      },
      flags: {},
      order: 10,
      mode: 0,
      inputs: [
        {
          name: "batch_size",
          type: "INT",
          link: 12,
          widget: {
            name: "batch_size",
            config: [
              "INT",
              {
                default: 1,
                min: 1,
                max: 64,
              },
            ],
          },
        },
        {
          name: "width",
          type: "INT",
          link: 28,
          widget: {
            name: "width",
            config: [
              "INT",
              {
                default: 512,
                min: 64,
                max: 8192,
                step: 8,
              },
            ],
          },
          slot_index: 1,
        },
        {
          name: "height",
          type: "INT",
          link: 30,
          widget: {
            name: "height",
            config: [
              "INT",
              {
                default: 512,
                min: 64,
                max: 8192,
                step: 8,
              },
            ],
          },
          slot_index: 2,
        },
      ],
      outputs: [
        {
          name: "LATENT",
          type: "LATENT",
          links: [2],
          slot_index: 0,
        },
      ],
      properties: {
        "Node name for S&R": "EmptyLatentImage",
      },
      widgets_values: [768, 768, 4],
    },
    {
      id: 4,
      type: "CheckpointLoaderSimple",
      pos: [-6, 489],
      size: {
        0: 315,
        1: 98,
      },
      flags: {
        collapsed: true,
      },
      order: 11,
      mode: 0,
      inputs: [
        {
          name: "ckpt_name",
          type: "v2-1_768-ema-pruned.safetensors",
          link: 14,
          widget: {
            name: "ckpt_name",
            config: [["v2-1_768-ema-pruned.safetensors"]],
          },
          slot_index: 0,
        },
      ],
      outputs: [
        {
          name: "MODEL",
          type: "MODEL",
          links: [1],
          slot_index: 0,
        },
        {
          name: "CLIP",
          type: "CLIP",
          links: [3, 5],
          slot_index: 1,
        },
        {
          name: "VAE",
          type: "VAE",
          links: [8],
          slot_index: 2,
        },
      ],
      properties: {
        "Node name for S&R": "CheckpointLoaderSimple",
      },
      widgets_values: ["v2-1_768-ema-pruned.safetensors"],
    },
    {
      id: 3,
      type: "KSampler",
      pos: [374, 556],
      size: {
        0: 315,
        1: 262,
      },
      flags: {},
      order: 14,
      mode: 0,
      inputs: [
        {
          name: "model",
          type: "MODEL",
          link: 1,
        },
        {
          name: "positive",
          type: "CONDITIONING",
          link: 4,
        },
        {
          name: "negative",
          type: "CONDITIONING",
          link: 6,
        },
        {
          name: "latent_image",
          type: "LATENT",
          link: 2,
        },
        {
          name: "sampler_name",
          type: "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
          link: 16,
          widget: {
            name: "sampler_name",
            config: [
              [
                "euler",
                "euler_ancestral",
                "heun",
                "dpm_2",
                "dpm_2_ancestral",
                "lms",
                "dpm_fast",
                "dpm_adaptive",
                "dpmpp_2s_ancestral",
                "dpmpp_sde",
                "dpmpp_sde_gpu",
                "dpmpp_2m",
                "dpmpp_2m_sde",
                "dpmpp_2m_sde_gpu",
                "ddim",
                "uni_pc",
                "uni_pc_bh2",
              ],
            ],
          },
          slot_index: 4,
        },
        {
          name: "cfg",
          type: "FLOAT",
          link: 18,
          widget: {
            name: "cfg",
            config: [
              "FLOAT",
              {
                default: 8,
                min: 0,
                max: 100,
              },
            ],
          },
          slot_index: 5,
        },
        {
          name: "seed",
          type: "INT",
          link: 20,
          widget: {
            name: "seed",
            config: [
              "INT",
              {
                default: 0,
                min: 0,
                max: 18446744073709552000,
              },
            ],
          },
          slot_index: 6,
        },
        {
          name: "steps",
          type: "INT",
          link: 22,
          widget: {
            name: "steps",
            config: [
              "INT",
              {
                default: 20,
                min: 1,
                max: 10000,
              },
            ],
          },
          slot_index: 7,
        },
      ],
      outputs: [
        {
          name: "LATENT",
          type: "LATENT",
          links: [7],
          slot_index: 0,
        },
      ],
      properties: {
        "Node name for S&R": "KSampler",
      },
      widgets_values: [
        656198241643977,
        "randomize",
        50,
        8,
        "dpmpp_sde",
        "normal",
        1,
      ],
    },
    {
      id: 8,
      type: "VAEDecode",
      pos: [384, 452],
      size: {
        0: 210,
        1: 46,
      },
      flags: {},
      order: 15,
      mode: 0,
      inputs: [
        {
          name: "samples",
          type: "LATENT",
          link: 7,
        },
        {
          name: "vae",
          type: "VAE",
          link: 8,
        },
      ],
      outputs: [
        {
          name: "IMAGE",
          type: "IMAGE",
          links: [9],
          slot_index: 0,
        },
      ],
      properties: {
        "Node name for S&R": "VAEDecode",
      },
    },
    {
      id: 9,
      type: "SaveImage",
      pos: [730, 362],
      size: [404.36515014648444, 451.49707824707025],
      flags: {},
      order: 16,
      mode: 0,
      inputs: [
        {
          name: "images",
          type: "IMAGE",
          link: 9,
        },
      ],
      properties: {},
      widgets_values: ["ComfyUI"],
    },
  ],
  links: [
    [1, 4, 0, 3, 0, "MODEL"],
    [2, 5, 0, 3, 3, "LATENT"],
    [3, 4, 1, 6, 0, "CLIP"],
    [4, 6, 0, 3, 1, "CONDITIONING"],
    [5, 4, 1, 7, 0, "CLIP"],
    [6, 7, 0, 3, 2, "CONDITIONING"],
    [7, 3, 0, 8, 0, "LATENT"],
    [8, 4, 2, 8, 1, "VAE"],
    [9, 8, 0, 9, 0, "IMAGE"],
    [12, 10, 0, 5, 0, "INT"],
    [14, 11, 0, 4, 0, "v2-1_768-ema-pruned.safetensors"],
    [
      16,
      12,
      0,
      3,
      4,
      "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
    ],
    [18, 13, 0, 3, 5, "FLOAT"],
    [20, 14, 0, 3, 6, "INT"],
    [22, 15, 0, 3, 7, "INT"],
    [24, 16, 0, 7, 1, "STRING"],
    [26, 17, 0, 6, 1, "STRING"],
    [28, 18, 0, 5, 1, "INT"],
    [30, 19, 0, 5, 2, "INT"],
  ],
  groups: [
    {
      title: "StableStudio Inputs",
      bounding: [-327, 236, 286, 629],
      color: "#a1309b",
    },
  ],
  config: {},
  extra: {},
  version: 0.4,
};
