export type GpuVendor = "nvidia" | "amd" | "apple" | "intel" | "other";
export type MemoryType = "gddr6" | "gddr6x" | "gddr7" | "hbm2" | "hbm3" | "unified" | "unknown";

export interface GPU {
  id: string;
  name: string;
  vendor: GpuVendor;
  vramGB: number;
  memoryType: MemoryType;
  unifiedMemory: boolean;
  architecture?: string;
  bandwidthGBs?: number;
  generation?: string;
  notes?: string[];
  source?: string;
}

export interface GPUFilters {
  vendor?: GpuVendor;
  minVRAMGB?: number;
  maxVRAMGB?: number;
  unifiedMemory?: boolean;
}
