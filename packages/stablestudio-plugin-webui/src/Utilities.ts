import { StableDiffusionInput } from "@stability/stablestudio-plugin";

const LORA_PATTERN = "<lora:#LORA#:1>";
const HYPERNETWORK_PATTERN = "<hypernet:#HYPERNETWORK#:1>";

export function base64ToBlob(base64: string, contentType = ""): Promise<Blob> {
  return fetch(`data:${contentType};base64,${base64}`).then((res) =>
    res.blob()
  );
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

export async function fetchOptions(baseUrl: string | undefined) {
  const optionsResponse = await fetch(`${baseUrl}/sdapi/v1/options`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await optionsResponse.json();
}

export async function fetchEmbeddings(baseUrl: string | undefined) {
  const embeddingsResponse = await fetch(`${baseUrl}/sdapi/v1/embeddings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await embeddingsResponse.json();
}

export async function fetchHypernetworks(baseUrl: string | undefined) {
  const hypernetworksResponse = await fetch(`${baseUrl}/sdapi/v1/hypernetworks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await hypernetworksResponse.json();
}

export async function fetchLoras(baseUrl: string | undefined) {
  const lorasResponse = await fetch(`${baseUrl}/sdapi/v1/loras`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await lorasResponse.json();
}

export async function setOptions(baseUrl: string | undefined, options: any) {
  const optionsResponse = await fetch(`${baseUrl}/sdapi/v1/options`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  return await optionsResponse.json();
}

export async function getImageInfo(
  baseUrl: string | null,
  base64image: any
) {
  const imageInfoResponse = await fetch(`${baseUrl}/sdapi/v1/png-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64image }),
  });

  const imageInfoJson = await imageInfoResponse.json();

  const info = imageInfoJson.info.split("\n");

  const data: any = {};

  if (info.length === 0) {
    return data;
  }

  data.prompt = info[0];

  let detailIndex = 1;

  if (info.length === 3) {
    data.nagtivePrompt = info[1].split(":")[1].trim();

    detailIndex = 2;
  }

  const details = info[detailIndex].split(",");

  details.map((detail: any) => {
    const detailInfo = detail.trim().split(":");

    data[detailInfo[0]] = detailInfo[1].trim();
  });

  return data;
}

export async function testForHistoryPlugin(webuiHostUrl: string) {
  // timeout after 1 second
  const finished = Promise.race([
    fetch(`${webuiHostUrl}/StableStudio/get-generated-images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: 1,
      }),
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 1000)
    ),
  ]);

  try {
    await finished;
    return (finished as any).ok;
  } catch (error) {
    return false;
  }
}

export async function constructPayload(
  options: {
    input?: StableDiffusionInput | undefined;
    count?: number | undefined;
  },
  isUpscale = false,
  upscaler: string | undefined,
  styleType: string | undefined
) {
  const { sampler, prompts, initialImage, maskImage, width, height, steps, style } =
    options?.input ?? {};

  // Construct payload
  const data: any = {
    seed: options?.input?.seed === 0 ? -1 : options?.input?.seed,
    cfgScale: options?.input?.cfgScale ?? 7,
  };

  if (isUpscale) {
    /*
      Upscaling values
    */

    data.upscaling_resize_w = width ?? 512;
    data.upscaling_resize_h = height ?? 512;
    data.upscaler_1 = upscaler;
  } else {
    /*
      regular image generation values
    */

    data.width = width ?? 512;
    data.height = height ?? 512;

    data.sampler_name = sampler?.name ?? "";
    data.sampler_index = sampler?.name ?? "";

    data.prompt =
      prompts?.find((p) => (p.text && (p.weight ?? 0) > 0) ?? 0 > 0)?.text ??
      "";
    data.negative_prompt =
      prompts?.find((p) => (p.text && (p.weight ?? 0) < 0) ?? 0 < 0)?.text ??
      "";

    if ((styleType != "none") && style && (style != "none") && (style != "enhance")) {
      let extraStyle = style;

      if (styleType == "lora") {
        extraStyle = LORA_PATTERN.replace("#LORA#", style);
      } else if (styleType == "hypernetworks") {
        extraStyle = HYPERNETWORK_PATTERN.replace("#HYPERNETWORK#", style);
      }

      data.prompt = data.prompt + " " + extraStyle;
    }

    data.steps = steps ?? 20;
    data.batch_size = options?.count;
    data.save_images = true;
  }

  if (initialImage?.weight && !isUpscale) {
    data.denoising_strength = 1 - initialImage.weight;
  }

  if (initialImage?.blob) {
    const initImgB64 = await blobToBase64(initialImage?.blob);

    if (isUpscale) {
      data.image = initImgB64.split(",")[1];
    } else {
      data.init_images = [initImgB64.split(",")[1]];
    }
  }

  if (maskImage?.blob) {
    const maskImgB64 = await blobToBase64(maskImage?.blob);

    data.mask = maskImgB64.split(",")[1];

    data.inpainting_mask_invert = 1; // Mask mode
    data.inpainting_fill = 1; // Masked content
    data.inpaint_full_res = false; // Inpaint area
  }

  return data;
}
