files architecture 👇🏻                        ```text
hf-vram-estimator/
│
├── apps/
│   ├── extension/
│   │   ├── icons/
│   │   │   └── icon128.png
│   │   │
│   │   ├── popup/
│   │   │   ├── popup.css
│   │   │   ├── popup.html
│   │   │   └── popup.js
│   │   │
│   │   ├── scripts/
│   │   │   ├── calculator.js
│   │   │   ├── content.css
│   │   │   ├── content.js
│   │   │   └── hf_api.js
│   │   │
│   │   ├── manifest.json
│   │   └── README.md
│   │
│   └── web/
│       ├── app/
│       │   ├── compare/
│       │   │   └── page.tsx
│       │   ├── gpu/
│       │   │   └── [id]/
│       │   │       └── page.tsx
│       │   ├── model/
│       │   │   └── [...modelId]/
│       │   │       └── page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       │
│       ├── components/
│       │   ├── ComparePage.tsx
│       │   ├── GPUProfile.tsx
│       │   └── ModelDetail.tsx
│       │
│       ├── lib/
│       │   └── api.ts
│       │
│       ├── .env.example
│       ├── next.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── services/
│   └── api/
│       ├── src/
│       │   ├── hf/
│       │   │   └── client.ts
│       │   ├── middleware/
│       │   │   ├── errors.ts
│       │   │   └── rate-limit.ts
│       │   ├── routes/
│       │   │   ├── calculate.ts
│       │   │   ├── gpus.ts
│       │   │   ├── health.ts
│       │   │   └── models.ts
│       │   ├── services/
│       │   │   └── model-service.ts
│       │   ├── config.ts
│       │   └── server.ts
│       │
│       ├── tests/
│       │   └── rate-limit.test.mjs
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── packages/
│   ├── gpu-data/
│   │   ├── src/
│   │   │   ├── catalog.ts
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   │   └── catalog.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── hf-analyzer/
│   │   ├── src/
│   │   │   ├── analyzer.ts
│   │   │   ├── index.ts
│   │   │   ├── parsers.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   │   └── analyzer.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── vram-engine/
│       ├── src/
│       │   ├── calculator.ts
│       │   ├── index.ts
│       │   ├── quantization.ts
│       │   ├── recommend.ts
│       │   └── types.ts
│       ├── tests/
│       │   └── calculator.test.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── .gitignore
├── package.json
└── README.md
```
