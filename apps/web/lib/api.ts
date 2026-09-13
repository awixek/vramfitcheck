const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export type GPU = {
  id: string;
  name: string;
  vendor: string;
  vramGB: number;
  memoryType: string;
  unifiedMemory?: boolean;
  architecture?: string;
  bandwidthGBps?: number;
  generation?: string;
  notes?: string[];
};

export type ModelAnalysis = {
  parameterCountB?: number;
  parametersB?: number;
  totalParametersB?: number;
  activeParametersB?: number;
  architecture?: string;
  modelType?: string;
  quantization?: string;
  weightSizeGB?: number;
  evidence?: string[];
  warnings?: string[];
  confidence?: string;
};

export async function getGPUs(): Promise<GPU[]> {
  const res = await fetch(`${API_BASE}/v1/gpus`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GPU API failed (${res.status})`);
  const data = await res.json();
  return data.gpus ?? [];
}

export async function getModel(modelId: string) {
  const res = await fetch(`${API_BASE}/v1/models?modelId=${encodeURIComponent(modelId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Model API failed (${res.status})`);
  return res.json();
}

export async function calculate(input: {
  model: Record<string, unknown>;
  gpu: Record<string, unknown>;
  runtime?: Record<string, unknown>;
}) {
  const res = await fetch(`${API_BASE}/v1/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Calculation failed (${res.status})`);
  return res.json();
}
