# @hf-vram/gpu-data

Initial GPU catalog for the HF-VRAM product.

## Important

This is a product seed catalog, not a claim that every GPU specification or inference capability is identical across runtimes.

The `vramGB` value is the physical memory capacity. The shared VRAM engine applies a usable-memory policy before fit classification.

Apple Silicon entries use unified memory. The operating system and other applications also consume unified memory, so the full advertised capacity should not be treated as dedicated GPU memory.

## Next expansion

Before production launch, the catalog should be expanded and maintained from authoritative vendor specifications, with a source URL and last-verified date for each profile.

Recommended future fields:

- fp16/bf16 throughput
- memory bandwidth
- tensor-core generation
- CUDA/ROCm/Metal support
- quantization/runtime compatibility
- multi-GPU interconnect
- approximate tokens/sec ranges
- price data (kept separate from static GPU specs)
