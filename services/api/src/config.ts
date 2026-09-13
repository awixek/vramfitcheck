export const config = {
  port: Number(process.env.PORT ?? 8080),
  hfApiBaseUrl: process.env.HF_API_BASE_URL ?? "https://huggingface.co/api",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").map(x => x.trim()).filter(Boolean),
  cacheTtlMs: Number(process.env.CACHE_TTL_SECONDS ?? 900) * 1000,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60) * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60),
  hfTimeoutMs: Number(process.env.HF_REQUEST_TIMEOUT_MS ?? 10000)
};
