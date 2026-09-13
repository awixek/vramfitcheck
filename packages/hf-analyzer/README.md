# @hf-vram/hf-analyzer

Hugging Face model metadata analyzer used before passing a model into the shared VRAM engine.

## Detection priority

1. Explicit Hugging Face metadata/config fields.
2. GGUF/safetensors/file-size metadata.
3. Model tags.
4. Model card text.
5. Model ID/name as a last-resort signal.

## Important safety rule

The analyzer returns evidence and confidence. It must not silently turn a weak model-name guess into a high-confidence VRAM claim.

## Backend integration

The Railway API should call Hugging Face, normalize the response into `HFModelInput`, run `analyzeModel()`, then pass the resulting model spec to `@hf-vram/vram-engine`.

The browser extension may use a lighter client-side version for immediate feedback and ask the backend for detailed/authoritative analysis.
