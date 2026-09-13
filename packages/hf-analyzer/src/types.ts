export interface HFModelInput {
  id: string;
  tags?: string[];
  pipelineTag?: string;
  libraryName?: string;
  modelCardText?: string;
  cardData?: Record<string, unknown>;
  config?: Record<string, unknown>;
  gguf?: Record<string, unknown>;
  safetensors?: Record<string, unknown>;
  siblings?: Array<{ rfilename?: string; size?: number }>;
  raw?: Record<string, unknown>;
}

export interface ModelAnalysis {
  id: string;
  parametersB?: number;
  totalParametersB?: number;
  activeParametersB?: number;
  isMoE: boolean;
  experts?: number;
  activeExperts?: number;
  architecture?: string;
  quantization?: string;
  quantizationBits?: number;
  weightSizeGB?: number;
  confidence: "high" | "medium" | "low" | "unknown";
  evidence: string[];
  warnings: string[];
}
