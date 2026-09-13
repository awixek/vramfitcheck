# HF VRAM Checker — connected client

The MV3 extension now calls the HF-VRAM API for model analysis instead of directly calling the Hugging Face API.

Default local API: `http://localhost:8080`.

Before production release, replace the local API origin in `scripts/hf_api.js` and `manifest.json` with the real Railway service URL.
