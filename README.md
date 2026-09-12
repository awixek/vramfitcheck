files structure -
hf-vram-estimator/
│
├── apps/
│   ├── extension/                        <-- Isme ZIP 2 (hf-vram-gpu-catalog-api-v0.2.zip) ke
│   │   │                                     apps/extension/ folder ke andar ki SARI files aayengi:
│   │   ├── icons/
│   │   │   └── icon128.png               <-- ZIP 2: apps/extension/icons/icon128.png
│   │   ├── popup/
│   │   │   ├── popup.css                 <-- ZIP 2: apps/extension/popup/popup.css
│   │   │   ├── popup.html                <-- ZIP 2: apps/extension/popup/popup.html
│   │   │   └── popup.js                  <-- ZIP 2: apps/extension/popup/popup.js
│   │   ├── scripts/
│   │   │   ├── calculator.js             <-- ZIP 2: apps/extension/scripts/calculator.js
│   │   │   ├── content.css               <-- ZIP 2: apps/extension/scripts/content.css
│   │   │   ├── content.js                <-- ZIP 2: apps/extension/scripts/content.js
│   │   │   └── hf_api.js                 <-- ZIP 2: apps/extension/scripts/hf_api.js
│   │   ├── manifest.json                 <-- ZIP 2: apps/extension/manifest.json
│   │   └── README.md                     <-- ZIP 2: apps/extension/README.md
│   │
│   └── web/                              <-- Isme ZIP 1 (hf-vram-web-compare-v0.6.zip) ki SARI files aayengi:
│       ├── app/
│       │   ├── compare/page.tsx          <-- ZIP 1: app/compare/page.tsx
│       │   ├── gpu/[id]/page.tsx         <-- ZIP 1: app/gpu/[id]/page.tsx
│       │   ├── model/[...modelId]/page.tsx <-- ZIP 1: app/model/[...modelId]/page.tsx
│       │   ├── globals.css               <-- ZIP 1: app/globals.css
│       │   ├── layout.tsx                <-- ZIP 1: app/layout.tsx
│       │   └── page.tsx                  <-- ZIP 1: app/page.tsx
│       ├── components/
│       │   ├── ComparePage.tsx           <-- ZIP 1: components/ComparePage.tsx
│       │   ├── GPUProfile.tsx            <-- ZIP 1: components/GPUProfile.tsx
│       │   └── ModelDetail.tsx           <-- ZIP 1: components/ModelDetail.tsx
│       ├── lib/
│       │   └── api.ts                    <-- ZIP 1: lib/api.ts
│       ├── .env.example                  <-- ZIP 1: .env.example
│       ├── next.config.ts                <-- ZIP 1: next.config.ts
│       ├── package.json                  <-- ZIP 1: package.json
│       ├── tsconfig.json                 <-- ZIP 1: tsconfig.json
│       └── README.md                     <-- ZIP 1: README.md
│
├── services/
│   └── api/                              <-- Isme ZIP 9 (hf-vram-api-v1.zip) ki SARI files aayengi:
│       ├── src/
│       │   ├── hf/
│       │   │   └── client.ts             <-- ZIP 9: src/hf/client.ts
│       │   ├── middleware/
│       │   │   ├── errors.ts             <-- ZIP 9: src/middleware/errors.ts
│       │   │   └── rate-limit.ts         <-- ZIP 9: src/middleware/rate-limit.ts
│       │   ├── routes/
│       │   │   ├── calculate.ts          <-- ZIP 9: src/routes/calculate.ts
│       │   │   ├── gpus.ts               <-- ZIP 9: src/routes/gpus.ts
│       │   │   ├── health.ts             <-- ZIP 9: src/routes/health.ts
│       │   │   └── models.ts             <-- ZIP 9: src/routes/models.ts
│       │   ├── services/
│       │   │   └── model-service.ts      <-- ZIP 9: src/services/model-service.ts
│       │   ├── config.ts                 <-- ZIP 9: src/config.ts
│       │   └── server.ts                 <-- ZIP 9: src/server.ts
│       ├── tests/
│       │   └── rate-limit.test.mjs       <-- ZIP 9: tests/rate-limit.test.mjs
│       ├── .env.example                  <-- ZIP 9: .env.example
│       ├── package.json                  <-- ZIP 9: package.json
│       ├── tsconfig.json                 <-- ZIP 9: tsconfig.json
│       └── README.md                     <-- ZIP 9: README.md
│
├── packages/                             <-- YE HAIN AAPKI SHARED FILES & CORE LOGIC
│   ├── gpu-data/                         <-- Isme ZIP 7 (hf-vram-gpu-data-v1.zip) ki SARI files aayengi:
│   │   ├── src/
│   │   │   ├── catalog.ts                <-- ZIP 7: src/catalog.ts
│   │   │   ├── index.ts                  <-- ZIP 7: src/index.ts
│   │   │   └── types.ts                  <-- ZIP 7: src/types.ts
│   │   ├── tests/
│   │   │   └── catalog.test.ts           <-- ZIP 7: tests/catalog.test.ts
│   │   ├── package.json                  <-- ZIP 7: package.json
│   │   ├── tsconfig.json                 <-- ZIP 7: tsconfig.json
│   │   └── README.md                     <-- ZIP 7: README.md
│   │
│   ├── hf-analyzer/                      <-- Isme ZIP 6 (hf-vram-hf-analyzer-v1.zip) ki SARI files aayengi:
│   │   ├── src/
│   │   │   ├── analyzer.ts               <-- ZIP 6: src/analyzer.ts
│   │   │   ├── index.ts                  <-- ZIP 6: src/index.ts
│   │   │   ├── parsers.ts                <-- ZIP 6: src/parsers.ts
│   │   │   └── types.ts                  <-- ZIP 6: src/types.ts
│   │   ├── tests/
│   │   │   └── analyzer.test.ts          <-- ZIP 6: tests/analyzer.test.ts
│   │   ├── package.json                  <-- ZIP 6: package.json
│   │   ├── tsconfig.json                 <-- ZIP 6: tsconfig.json
│   │   └── README.md                     <-- ZIP 6: README.md
│   │
│   └── vram-engine/                      <-- Isme ZIP 8 (hf-vram-vram-engine-v1.zip) ki SARI files aayengi:
│       ├── src/
│       │   ├── calculator.ts             <-- ZIP 8: src/calculator.ts
│       │   ├── index.ts                  <-- ZIP 8: src/index.ts
│       │   ├── quantization.ts           <-- ZIP 8: src/quantization.ts
│       │   ├── recommend.ts              <-- ZIP 8: src/recommend.ts
│       │   └── types.ts                  <-- ZIP 8: src/types.ts
│       ├── tests/
│       │   └── calculator.test.ts        <-- ZIP 8: tests/calculator.test.ts
│       ├── package.json                  <-- ZIP 8: package.json
│       ├── tsconfig.json                 <-- ZIP 8: tsconfig.json
│       └── README.md                     <-- ZIP 8: README.md
│
├── .gitignore                            <-- Main Root level par create karein
├── package.json                          <-- Main Monorepo root config (NPM Workspaces)
└── README.md                             <-- Main Repository documentation
