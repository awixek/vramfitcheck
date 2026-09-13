import type { HFModelInput, ModelAnalysis } from "./types.ts";
import { extractArchitecture, extractMoE, extractParameters, extractQuantization, extractWeightSizeGB } from "./parsers.ts";
import { bitsForQuantization, normalizeQuantization } from "@hf-vram/vram-engine";

export function analyzeModel(input: HFModelInput): ModelAnalysis {
  const parametersB = extractParameters(input);
  const moe = extractMoE(input);
  const architecture = extractArchitecture(input);
  const rawQuantization = extractQuantization(input);
  const quantization = rawQuantization ? normalizeQuantization(rawQuantization) : "unknown";
  const bits = bitsForQuantization(quantization);
  const weightSizeGB = extractWeightSizeGB(input);

  const evidence: string[] = [];
  const warnings: string[] = [];

  if (parametersB !== undefined) evidence.push(`Parameter count inferred as ~${parametersB}B.`);
  else warnings.push("No reliable parameter count was found.");

  if (weightSizeGB !== undefined) evidence.push(`Weight/file metadata suggests ~${weightSizeGB.toFixed(2)} GB.`);
  if (rawQuantization) evidence.push(`Quantization/precision detected as ${rawQuantization}.`);
  else warnings.push("Quantization/precision was not confidently detected; a runtime default may be needed.");

  if (architecture) evidence.push(`Architecture/model type: ${architecture}.`);

  if (moe.isMoE) {
    evidence.push("Mixture-of-Experts architecture detected.");
    if (moe.experts) evidence.push(`Experts: ${moe.experts}.`);
    if (moe.activeExperts) evidence.push(`Active experts/token: ${moe.activeExperts}.`);
    if (moe.activeParametersB) evidence.push(`Approx. active parameters: ${moe.activeParametersB.toFixed(2)}B.`);
    warnings.push("MoE memory behavior varies by runtime; active-parameter estimation does not guarantee loaded-weight memory.");
  }

  let confidence: ModelAnalysis["confidence"] = "unknown";
  if (parametersB !== undefined && bits !== null && weightSizeGB !== undefined) confidence = "high";
  else if (parametersB !== undefined && bits !== null) confidence = "medium";
  else if (parametersB !== undefined || weightSizeGB !== undefined) confidence = "low";

  if (input.siblings?.length && weightSizeGB === undefined) {
    warnings.push("Repository files were present but their sizes were insufficient for a total-weight estimate.");
  }

  return {
    id: input.id,
    parametersB,
    totalParametersB: moe.totalParametersB,
    activeParametersB: moe.activeParametersB,
    isMoE: moe.isMoE,
    experts: moe.experts,
    activeExperts: moe.activeExperts,
    architecture,
    quantization: rawQuantization,
    quantizationBits: bits ?? undefined,
    weightSizeGB,
    confidence,
    evidence,
    warnings
  };
}
