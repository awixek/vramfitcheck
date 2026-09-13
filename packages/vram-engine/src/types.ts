export type Quantization =
  | "fp32" | "fp16" | "bf16"
  | "q8" | "q6" | "q5" | "q4" | "q3" | "q2"
  | "unknown";

export type FitStatus =
  | "comfortable"
  | "tight"
  | "offload"
  | "oom"
  | "unknown";

export type Confidence = "high" | "medium" | "low" | "unknown";

export interface ModelSpec {
  id?: string;
  parametersB?: number;
  activeParametersB?: number;
  totalParametersB?: number;
  architecture?: string;
  quantization?: string;
  quantizationBits?: number;
  weightSizeGB?: number;
  isMoE?: boolean;
  experts?: number;
  activeExperts?: number;
}

export interface RuntimeSpec {
  contextLength?: number;
  batchSize?: number;
  kvCacheGB?: number;
  kvCacheBytesPerToken?: number;
  runtimeOverheadGB?: number;
  safetyMarginGB?: number;
  cpuOffloadGB?: number;
}

export interface GpuSpec {
  name: string;
  vramGB: number;
  unifiedMemory?: boolean;
  usableVRAMRatio?: number;
}

export interface EngineOptions {
  defaultContextLength?: number;
  defaultBatchSize?: number;
  defaultRuntimeOverheadGB?: number;
  defaultSafetyMarginGB?: number;
  defaultKvCacheGB?: number;
  usableVRAMRatio?: number;
  comfortableHeadroomRatio?: number;
  tightHeadroomGB?: number;
}

export interface VRAMBreakdown {
  weightsGB: number;
  kvCacheGB: number;
  runtimeOverheadGB: number;
  safetyMarginGB: number;
  totalRequiredGB: number;
  availableGB: number;
  headroomGB: number;
}

export interface VRAMResult {
  status: FitStatus;
  confidence: Confidence;
  breakdown: VRAMBreakdown;
  quantization: Quantization;
  bitsPerWeight: number | null;
  effectiveParametersB: number | null;
  recommendation: string;
  notes: string[];
}
