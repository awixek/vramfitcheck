import type {
  Confidence, EngineOptions, GpuSpec, ModelSpec, RuntimeSpec, VRAMResult
} from "./types.ts";
import { bitsForQuantization, normalizeQuantization } from "./quantization.ts";

const DEFAULTS: Required<EngineOptions> = {
  defaultContextLength: 4096,
  defaultBatchSize: 1,
  defaultRuntimeOverheadGB: 0.8,
  defaultSafetyMarginGB: 0.5,
  defaultKvCacheGB: 1.5,
  usableVRAMRatio: 0.92,
  comfortableHeadroomRatio: 0.20,
  tightHeadroomGB: 1.0
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function effectiveParameters(model: ModelSpec): number | null {
  // For VRAM/weight memory, assume resident weights include all MoE experts.
  // Active parameters describe compute, not necessarily loaded storage.
  return model.totalParametersB ?? model.parametersB ?? null;
}

function confidence(model: ModelSpec, quantizationKnown: boolean): Confidence {
  const hasParams = effectiveParameters(model) !== null;
  const hasWeightSize = (model.weightSizeGB ?? 0) > 0;
  if (hasParams && quantizationKnown && (hasWeightSize || model.id)) return "high";
  if (hasParams && quantizationKnown) return "medium";
  if (hasParams || hasWeightSize) return "low";
  return "unknown";
}

export function estimateVRAM(
  model: ModelSpec,
  gpu: GpuSpec,
  runtime: RuntimeSpec = {},
  options: EngineOptions = {}
): VRAMResult {
  const cfg = { ...DEFAULTS, ...options };
  const q = normalizeQuantization(model.quantization);
  const bits = model.quantizationBits ?? bitsForQuantization(q);
  const paramsB = effectiveParameters(model);

  if (paramsB === null && !(model.weightSizeGB && model.weightSizeGB > 0)) {
    return {
      status: "unknown",
      confidence: "unknown",
      quantization: q,
      bitsPerWeight: bits,
      effectiveParametersB: null,
      breakdown: {
        weightsGB: 0,
        kvCacheGB: 0,
        runtimeOverheadGB: 0,
        safetyMarginGB: 0,
        totalRequiredGB: 0,
        availableGB: 0,
        headroomGB: 0
      },
      recommendation: "Model parameter/weight-size data is insufficient for a reliable VRAM estimate.",
      notes: ["Provide parameter count or exact weight size and quantization."]
    };
  }

  if (bits === null && !(model.weightSizeGB && model.weightSizeGB > 0)) {
    return {
      status: "unknown",
      confidence: "low",
      quantization: q,
      bitsPerWeight: null,
      effectiveParametersB: paramsB,
      breakdown: {
        weightsGB: 0,
        kvCacheGB: 0,
        runtimeOverheadGB: 0,
        safetyMarginGB: 0,
        totalRequiredGB: 0,
        availableGB: gpu.vramGB,
        headroomGB: gpu.vramGB
      },
      recommendation: "Quantization/precision is unknown. Select a precision or provide exact weight size.",
      notes: ["Unknown precision can change the result substantially."]
    };
  }

  // If an exact weight size is available, prefer it over a parameter-count approximation.
  const weightsGB = model.weightSizeGB && model.weightSizeGB > 0
    ? model.weightSizeGB
    : (paramsB! * bits!) / 8;

  const context = runtime.contextLength ?? cfg.defaultContextLength;
  const batch = runtime.batchSize ?? cfg.defaultBatchSize;

  // Explicit KV cache values take precedence. Otherwise use a practical default
  // scaled gently by context and batch. This is intentionally an estimate.
  const baseKv = runtime.kvCacheGB ?? cfg.defaultKvCacheGB;
  const contextFactor = Math.max(0.5, context / 4096);
  const kvCacheGB = runtime.kvCacheGB !== undefined
    ? runtime.kvCacheGB
    : baseKv * contextFactor * Math.max(1, batch);

  const runtimeOverheadGB = runtime.runtimeOverheadGB ?? cfg.defaultRuntimeOverheadGB;
  const safetyMarginGB = runtime.safetyMarginGB ?? cfg.defaultSafetyMarginGB;

  const totalRequiredGB = weightsGB + kvCacheGB + runtimeOverheadGB + safetyMarginGB;
  const availableGB = gpu.vramGB * (runtime.cpuOffloadGB
    ? cfg.usableVRAMRatio
    : (gpu.usableVRAMRatio ?? cfg.usableVRAMRatio));
  const headroomGB = availableGB - totalRequiredGB;

  const comfortableThreshold = availableGB * cfg.comfortableHeadroomRatio;
  let status: VRAMResult["status"];

  if (headroomGB < 0) {
    status = runtime.cpuOffloadGB && runtime.cpuOffloadGB > 0 ? "offload" : "oom";
  } else if (headroomGB >= comfortableThreshold) {
    status = "comfortable";
  } else if (headroomGB >= 0 && headroomGB < cfg.tightHeadroomGB) {
    status = "tight";
  } else {
    status = "tight";
  }

  const notes: string[] = [
    "This is an estimate, not a runtime guarantee.",
    `Context assumption: ${context.toLocaleString()} tokens.`,
    "Actual VRAM can vary by backend, architecture, kernels, batch size, and runtime."
  ];

  if (model.isMoE && model.activeParametersB && model.totalParametersB &&
      model.activeParametersB < model.totalParametersB) {
    notes.push("MoE weight estimate uses total/resident parameters; active parameters are treated as a compute/speed signal.");
  }

  const conf = confidence(model, bits !== null);
  const recommendation =
    status === "comfortable" ? "Should fit with useful headroom."
    : status === "tight" ? "Likely to fit, but reduce context/batch or use a lighter quantization if needed."
    : status === "offload" ? "GPU memory is insufficient alone; CPU/RAM offloading may be required."
    : status === "oom" ? "Does not fit within the configured GPU memory at this estimate."
    : "Insufficient data for a reliable recommendation.";

  return {
    status,
    confidence: conf,
    quantization: q,
    bitsPerWeight: bits,
    effectiveParametersB: paramsB,
    breakdown: {
      weightsGB: round2(weightsGB),
      kvCacheGB: round2(kvCacheGB),
      runtimeOverheadGB: round2(runtimeOverheadGB),
      safetyMarginGB: round2(safetyMarginGB),
      totalRequiredGB: round2(totalRequiredGB),
      availableGB: round2(availableGB),
      headroomGB: round2(headroomGB)
    },
    recommendation,
    notes
  };
}
