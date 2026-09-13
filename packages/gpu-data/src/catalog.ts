import type { GPU, GPUFilters } from "./types.ts";

export const GPU_CATALOG: readonly GPU[] = [
  {
    id: "nvidia-rtx-3060-12gb",
    name: "NVIDIA GeForce RTX 3060 12GB",
    vendor: "nvidia",
    vramGB: 12,
    memoryType: "gddr6",
    unifiedMemory: false,
    architecture: "Ampere",
    bandwidthGBs: 360,
    generation: "RTX 30"
  },
  {
    id: "nvidia-rtx-4060-ti-16gb",
    name: "NVIDIA GeForce RTX 4060 Ti 16GB",
    vendor: "nvidia",
    vramGB: 16,
    memoryType: "gddr6",
    unifiedMemory: false,
    architecture: "Ada Lovelace",
    bandwidthGBs: 288,
    generation: "RTX 40"
  },
  {
    id: "nvidia-rtx-4070-ti-super-16gb",
    name: "NVIDIA GeForce RTX 4070 Ti SUPER 16GB",
    vendor: "nvidia",
    vramGB: 16,
    memoryType: "gddr6x",
    unifiedMemory: false,
    architecture: "Ada Lovelace",
    bandwidthGBs: 672,
    generation: "RTX 40"
  },
  {
    id: "nvidia-rtx-4080-super-16gb",
    name: "NVIDIA GeForce RTX 4080 SUPER 16GB",
    vendor: "nvidia",
    vramGB: 16,
    memoryType: "gddr6x",
    unifiedMemory: false,
    architecture: "Ada Lovelace",
    bandwidthGBs: 736,
    generation: "RTX 40"
  },
  {
    id: "nvidia-rtx-4090-24gb",
    name: "NVIDIA GeForce RTX 4090 24GB",
    vendor: "nvidia",
    vramGB: 24,
    memoryType: "gddr6x",
    unifiedMemory: false,
    architecture: "Ada Lovelace",
    bandwidthGBs: 1008,
    generation: "RTX 40"
  },
  {
    id: "nvidia-rtx-5090-32gb",
    name: "NVIDIA GeForce RTX 5090 32GB",
    vendor: "nvidia",
    vramGB: 32,
    memoryType: "gddr7",
    unifiedMemory: false,
    architecture: "Blackwell",
    bandwidthGBs: 1792,
    generation: "RTX 50"
  },
  {
    id: "nvidia-rtx-a6000-48gb",
    name: "NVIDIA RTX A6000 48GB",
    vendor: "nvidia",
    vramGB: 48,
    memoryType: "gddr6",
    unifiedMemory: false,
    architecture: "Ampere",
    bandwidthGBs: 768,
    generation: "RTX A"
  },
  {
    id: "nvidia-a100-40gb",
    name: "NVIDIA A100 40GB",
    vendor: "nvidia",
    vramGB: 40,
    memoryType: "hbm2",
    unifiedMemory: false,
    architecture: "Ampere",
    bandwidthGBs: 1555,
    generation: "A100"
  },
  {
    id: "nvidia-a100-80gb",
    name: "NVIDIA A100 80GB",
    vendor: "nvidia",
    vramGB: 80,
    memoryType: "hbm2",
    unifiedMemory: false,
    architecture: "Ampere",
    bandwidthGBs: 2039,
    generation: "A100"
  },
  {
    id: "nvidia-h100-80gb",
    name: "NVIDIA H100 80GB",
    vendor: "nvidia",
    vramGB: 80,
    memoryType: "hbm3",
    unifiedMemory: false,
    architecture: "Hopper",
    bandwidthGBs: 3350,
    generation: "H100"
  },
  {
    id: "amd-rx-7900-xtx-24gb",
    name: "AMD Radeon RX 7900 XTX 24GB",
    vendor: "amd",
    vramGB: 24,
    memoryType: "gddr6",
    unifiedMemory: false,
    architecture: "RDNA 3",
    bandwidthGBs: 960,
    generation: "RX 7000"
  },
  {
    id: "apple-m2-16gb",
    name: "Apple M2 16GB Unified Memory",
    vendor: "apple",
    vramGB: 16,
    memoryType: "unified",
    unifiedMemory: true,
    architecture: "Apple Silicon",
    generation: "M2",
    notes: ["Unified memory is shared with the operating system and other workloads."]
  },
  {
    id: "apple-m3-24gb",
    name: "Apple M3 24GB Unified Memory",
    vendor: "apple",
    vramGB: 24,
    memoryType: "unified",
    unifiedMemory: true,
    architecture: "Apple Silicon",
    generation: "M3",
    notes: ["Unified memory is shared with the operating system and other workloads."]
  },
  {
    id: "apple-m4-32gb",
    name: "Apple M4 32GB Unified Memory",
    vendor: "apple",
    vramGB: 32,
    memoryType: "unified",
    unifiedMemory: true,
    architecture: "Apple Silicon",
    generation: "M4",
    notes: ["Unified memory is shared with the operating system and other workloads."]
  },
  {
    id: "apple-m4-max-64gb",
    name: "Apple M4 Max 64GB Unified Memory",
    vendor: "apple",
    vramGB: 64,
    memoryType: "unified",
    unifiedMemory: true,
    architecture: "Apple Silicon",
    generation: "M4 Max",
    notes: ["Unified memory is shared with the operating system and other workloads."]
  }
] as const;

export function getGPU(id: string): GPU | undefined {
  return GPU_CATALOG.find(gpu => gpu.id === id);
}

export function listGPUs(filters: GPUFilters = {}): GPU[] {
  return GPU_CATALOG.filter(gpu =>
    (!filters.vendor || gpu.vendor === filters.vendor) &&
    (filters.minVRAMGB === undefined || gpu.vramGB >= filters.minVRAMGB) &&
    (filters.maxVRAMGB === undefined || gpu.vramGB <= filters.maxVRAMGB) &&
    (filters.unifiedMemory === undefined || gpu.unifiedMemory === filters.unifiedMemory)
  );
}

export function uniqueVRAMValues(): number[] {
  return [...new Set(GPU_CATALOG.map(g => g.vramGB))].sort((a, b) => a - b);
}
