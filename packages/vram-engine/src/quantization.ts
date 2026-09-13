import type { Quantization } from "./types.ts";

const BITS: Record<Exclude<Quantization, "unknown">, number> = {
  fp32: 32,
  fp16: 16,
  bf16: 16,
  q8: 8,
  q6: 6.5,
  q5: 5.5,
  q4: 4.5,
  q3: 3.5,
  q2: 2.5
};

export function normalizeQuantization(value?: string): Quantization {
  const s = (value ?? "").toLowerCase().replace(/[\s_-]+/g, "");

  if (!s) return "unknown";
  if (/(fp32|float32|32bit)/.test(s)) return "fp32";
  if (/(bf16|bfloat16)/.test(s)) return "bf16";
  if (/(fp16|float16|half|16bit)/.test(s)) return "fp16";
  if (/(q8|int8|8bit)/.test(s)) return "q8";
  if (/(q6|6bit)/.test(s)) return "q6";
  if (/(q5|5bit)/.test(s)) return "q5";
  if (/(q4|4bit|gguf.*iq4|iq4)/.test(s)) return "q4";
  if (/(q3|3bit)/.test(s)) return "q3";
  if (/(q2|2bit)/.test(s)) return "q2";

  return "unknown";
}

export function bitsForQuantization(q: Quantization): number | null {
  return q === "unknown" ? null : BITS[q];
}
