export const defaultGraph = {
  last_node_id: 28,
  last_link_id: 69,
  nodes: [
    {
      id: 9,
      type: "SaveImage",
      pos: [730, 362],
      size: {
        0: 404.3651428222656,
        1: 451.4970703125,
      },
      flags: {},
      order: 7,
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
    {
      id: 3,
      type: "KSampler",
      pos: [374, 555],
      size: {
        0: 315,
        1: 262,
      },
      flags: {},
      order: 5,
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
          name: "cfg",
          type: "FLOAT",
          link: 62,
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
          link: 67,
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
          link: 68,
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
        {
          name: "sampler_name",
          type: "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
          link: 61,
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
        983092648072402,
        "randomize",
        50,
        7,
        "dpmpp_sde",
        "normal",
        1,
      ],
    },
    {
      id: 6,
      type: "CLIPTextEncode",
      pos: [22, 503],
      size: {
        0: 210,
        1: 54,
      },
      flags: {
        collapsed: false,
      },
      order: 3,
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
          link: 64,
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
        "Surreal carnival scene with bright lights, strange creatures, and a full moon, dreamlike, vibrant, stylized, surreal, high detail",
      ],
    },
    {
      id: 4,
      type: "CheckpointLoaderSimple",
      pos: [23, 355],
      size: {
        0: 315,
        1: 98,
      },
      flags: {
        collapsed: false,
      },
      order: 2,
      mode: 0,
      inputs: [
        {
          name: "ckpt_name",
          type: "v2-1_768-ema-pruned.safetensors",
          link: 60,
          widget: {
            name: "ckpt_name",
            config: [["v2-1_768-ema-pruned.safetensors"]],
          },
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
      id: 7,
      type: "CLIPTextEncode",
      pos: [29, 606],
      size: {
        0: 210,
        1: 54,
      },
      flags: {
        collapsed: false,
      },
      order: 4,
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
          link: 63,
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
      pos: [32, 705],
      size: {
        0: 315,
        1: 106,
      },
      flags: {},
      order: 1,
      mode: 0,
      inputs: [
        {
          name: "batch_size",
          type: "INT",
          link: 69,
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
          link: 66,
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
          link: 65,
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
      id: 8,
      type: "VAEDecode",
      pos: [428, 417],
      size: {
        0: 210,
        1: 46,
      },
      flags: {},
      order: 6,
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
      id: 28,
      type: "StableStudioNode",
      pos: [-311, 506],
      size: {
        0: 151.1999969482422,
        1: 206,
      },
      flags: {},
      order: 0,
      mode: 0,
      outputs: [
        {
          name: "batch_size",
          type: "INT",
          links: [69],
          slot_index: 0,
        },
        {
          name: "steps",
          type: "INT",
          links: [68],
          slot_index: 1,
        },
        {
          name: "seed",
          type: "INT",
          links: [67],
          slot_index: 2,
        },
        {
          name: "width",
          type: "INT",
          links: [66],
          slot_index: 3,
        },
        {
          name: "height",
          type: "INT",
          links: [65],
          slot_index: 4,
        },
        {
          name: "positive_prompt",
          type: "STRING",
          links: [64],
          slot_index: 5,
        },
        {
          name: "negative_prompt",
          type: "STRING",
          links: [63],
          slot_index: 6,
        },
        {
          name: "cfg",
          type: "FLOAT",
          links: [62],
          slot_index: 7,
        },
        {
          name: "sampler_name",
          type: "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
          links: [61],
          slot_index: 8,
        },
        {
          name: "ckpt_name",
          type: "v2-1_768-ema-pruned.safetensors",
          links: [60],
          slot_index: 9,
        },
      ],
      properties: {},
      color: "#323",
      bgcolor: "#535",
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
    [60, 28, 9, 4, 0, "v2-1_768-ema-pruned.safetensors"],
    [
      61,
      28,
      8,
      3,
      7,
      "euler,euler_ancestral,heun,dpm_2,dpm_2_ancestral,lms,dpm_fast,dpm_adaptive,dpmpp_2s_ancestral,dpmpp_sde,dpmpp_sde_gpu,dpmpp_2m,dpmpp_2m_sde,dpmpp_2m_sde_gpu,ddim,uni_pc,uni_pc_bh2",
    ],
    [62, 28, 7, 3, 4, "FLOAT"],
    [63, 28, 6, 7, 1, "STRING"],
    [64, 28, 5, 6, 1, "STRING"],
    [65, 28, 4, 5, 2, "INT"],
    [66, 28, 3, 5, 1, "INT"],
    [67, 28, 2, 3, 5, "INT"],
    [68, 28, 1, 3, 6, "INT"],
    [69, 28, 0, 5, 0, "INT"],
  ],
  groups: [],
  config: {},
  extra: {},
  version: 0.4,
};
