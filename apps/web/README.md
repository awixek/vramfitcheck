# HF-VRAM Web v0.3 — Model Detail + GPU Profiles

Adds dedicated URL-driven pages while continuing to use the Railway API.

## Routes

- `/` — web entry
- `/model/[owner]/[repo]` — model analysis
- `/gpu/[id]` — GPU profile

Examples:
- `/model/meta-llama/Llama-3.1-8B-Instruct`
- `/gpu/rtx-4090`

The model page calls `/v1/models`, `/v1/gpus`, and `/v1/calculate`.
The GPU page calls `/v1/gpus?id=...`.

This assumes the Railway API implements the corresponding GPU endpoint.
