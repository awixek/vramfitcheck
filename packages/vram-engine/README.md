# @hf-vram/vram-engine

Shared TypeScript VRAM estimation engine for the HF-VRAM web app, backend API, and Chrome extension.

## Design goals

- One calculation source for all clients.
- Prefer exact weight size when available.
- Support parameter-count estimation when exact weights are unavailable.
- Account for quantization, KV-cache allowance, runtime overhead, safety margin and usable VRAM.
- Support basic MoE active-parameter estimation with an explicit caveat.
- Return a status and confidence rather than false precision.
- Keep the engine deterministic and dependency-light.

## Formula

When exact weight size is unavailable:

`weight_memory_GB = parameters_B × bits_per_weight / 8`

Then:

`required_VRAM = weights + KV_cache + runtime_overhead + safety_margin`

Q4 uses approximately 4.5 bits/weight as the product's initial convention.

## Important limitation

The engine intentionally does not claim that an estimate guarantees successful inference. Actual memory depends on architecture, backend, kernels, context, batch size, allocator fragmentation, runtime features, and whether weights are fully resident on GPU.

## Suggested integration

- `apps/web` imports the engine for instant calculator updates.
- `services/api` uses the same engine for authoritative API calculations.
- `apps/extension` bundles the same engine for immediate HF-page feedback.
- The backend should enrich `ModelSpec` using Hugging Face metadata before calculating when possible.
