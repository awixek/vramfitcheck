import type { GpuSpec, ModelSpec, RuntimeSpec, EngineOptions } from "./types.ts";
import { estimateVRAM } from "./calculator.ts";

export interface GpuRecommendation {
  gpu: GpuSpec;
  status: ReturnType<typeof estimateVRAM>["status"];
  requiredGB: number;
  headroomGB: number;
}

const ORDER = { comfortable: 0, tight: 1, offload: 2, oom: 3, unknown: 4 } as const;

export function rankGPUs(
  model: ModelSpec,
  gpus: GpuSpec[],
  runtime: RuntimeSpec = {},
  options: EngineOptions = {}
): GpuRecommendation[] {
  return gpus
    .map(gpu => {
      const result = estimateVRAM(model, gpu, runtime, options);
      return {
        gpu,
        status: result.status,
        requiredGB: result.breakdown.totalRequiredGB,
        headroomGB: result.breakdown.headroomGB
      };
    })
    .sort((a, b) =>
      ORDER[a.status] - ORDER[b.status] ||
      a.gpu.vramGB - b.gpu.vramGB
    );
}
