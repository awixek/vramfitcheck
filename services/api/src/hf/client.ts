import { config } from "../config.ts";

export class HFClient {
  async getModel(modelId: string): Promise<Record<string, unknown>> {
    const encoded = modelId.split("/").map(encodeURIComponent).join("/");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.hfTimeoutMs);
    try {
      const response = await fetch(`${config.hfApiBaseUrl}/models/${encoded}`, {
        headers: { accept: "application/json", "user-agent": "HF-VRAM/0.1" },
        signal: controller.signal
      });
      if (response.status === 404) throw new Error("Model not found on Hugging Face");
      if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);
      return await response.json() as Record<string, unknown>;
    } finally { clearTimeout(timeout); }
  }

  async getModelCardText(modelId: string): Promise<string> {
    const encoded = modelId.split("/").map(encodeURIComponent).join("/");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.hfTimeoutMs);
    try {
      const response = await fetch(`https://huggingface.co/${encoded}/raw/main/README.md`, {
        headers: { accept: "text/plain", "user-agent": "HF-VRAM/0.1" }, signal: controller.signal
      });
      return response.ok ? await response.text() : "";
    } finally { clearTimeout(timeout); }
  }
}
