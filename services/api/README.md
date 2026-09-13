# HF-VRAM Railway API

## GPU catalog endpoint

The API exposes the shared `@hf-vram/gpu-data` catalog at:

- `GET /v1/gpus` — all GPU profiles
- `GET /v1/gpus?id=nvidia-rtx-4090-24gb` — one GPU profile
- `GET /v1/gpus?vendor=nvidia&minVRAMGB=24` — filtered catalog
- `GET /v1/gpus?unifiedMemory=true` — Apple/unified-memory profiles

The response includes `gpus`, `count`, `vramValues`, and the normalized `filters` used for the query.

This endpoint is the single API source used by the web app/extension; clients should not duplicate the GPU catalog locally.
