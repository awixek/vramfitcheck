
# HF-VRAM Connected Monorepo v0.1

This is the first connected foundation: shared VRAM Engine + GPU catalog + Hugging Face Analyzer + Railway API + Chrome MV3 client.

## Flow

Hugging Face -> Railway API -> HF Analyzer -> VRAM Engine -> Web/Extension

## API
- GET /health
- GET /v1/models?modelId=owner/repository
- GET /v1/gpus
- GET /v1/gpus?id=gpu-id
- POST /v1/calculate

## Local
npm install
npm run dev:api

API defaults to http://localhost:8080.

## Production note
The Railway URL is intentionally not invented. Once the Railway service is actually created, put its real URL into the extension and ALLOWED_ORIGINS. No live deployment is claimed by this artifact.
