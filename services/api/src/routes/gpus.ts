import { getGPU, listGPUs, uniqueVRAMValues, type GPU, type GpuVendor } from "@hf-vram/gpu-data";

const VENDORS = new Set<GpuVendor>(["nvidia", "amd", "apple", "intel", "other"]);

function numberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function gpusRoute(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();

  if (id) {
    const gpu = getGPU(id);
    return gpu
      ? Response.json({ gpu })
      : Response.json({ error: "GPU not found", id }, { status: 404 });
  }

  const vendorParam = url.searchParams.get("vendor")?.trim().toLowerCase();
  if (vendorParam && !VENDORS.has(vendorParam as GpuVendor)) {
    return Response.json({
      error: "Invalid vendor",
      vendor: vendorParam,
      allowed: [...VENDORS]
    }, { status: 400 });
  }

  const minVRAMGB = numberParam(url.searchParams.get("minVRAMGB") ?? url.searchParams.get("minVramGB"));
  const maxVRAMGB = numberParam(url.searchParams.get("maxVRAMGB") ?? url.searchParams.get("maxVramGB"));
  const unifiedParam = url.searchParams.get("unifiedMemory");

  if ((url.searchParams.has("minVRAMGB") || url.searchParams.has("minVramGB")) && minVRAMGB === undefined) {
    return Response.json({ error: "minVRAMGB must be a number" }, { status: 400 });
  }
  if ((url.searchParams.has("maxVRAMGB") || url.searchParams.has("maxVramGB")) && maxVRAMGB === undefined) {
    return Response.json({ error: "maxVRAMGB must be a number" }, { status: 400 });
  }
  if (minVRAMGB !== undefined && minVRAMGB < 0) return Response.json({ error: "minVRAMGB cannot be negative" }, { status: 400 });
  if (maxVRAMGB !== undefined && maxVRAMGB < 0) return Response.json({ error: "maxVRAMGB cannot be negative" }, { status: 400 });
  if (minVRAMGB !== undefined && maxVRAMGB !== undefined && minVRAMGB > maxVRAMGB) {
    return Response.json({ error: "minVRAMGB cannot exceed maxVRAMGB" }, { status: 400 });
  }

  let unifiedMemory: boolean | undefined;
  if (unifiedParam !== null) {
    if (unifiedParam !== "true" && unifiedParam !== "false") {
      return Response.json({ error: "unifiedMemory must be true or false" }, { status: 400 });
    }
    unifiedMemory = unifiedParam === "true";
  }

  const gpus = listGPUs({
    vendor: vendorParam as GpuVendor | undefined,
    minVRAMGB,
    maxVRAMGB,
    unifiedMemory
  }).sort((a: GPU, b: GPU) => a.vramGB - b.vramGB || a.name.localeCompare(b.name));

  return Response.json({
    gpus,
    count: gpus.length,
    vramValues: uniqueVRAMValues(),
    filters: {
      vendor: vendorParam || null,
      minVRAMGB: minVRAMGB ?? null,
      maxVRAMGB: maxVRAMGB ?? null,
      unifiedMemory: unifiedMemory ?? null
    }
  });
}
