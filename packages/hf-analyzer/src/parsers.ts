import type { HFModelInput, ModelAnalysis } from "./types.ts";

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
}

function toBillions(value: number, unit?: string): number {
  const u = (unit ?? "").toLowerCase();
  if (u === "m" || u === "million") return value / 1000;
  if (u === "k" || u === "thousand") return value / 1_000_000;
  return value;
}

export function extractParameterCandidates(text: string): number[] {
  const out: number[] = [];
  const patterns = [
    /(?:^|[\s(])(\d+(?:\.\d+)?)\s*(b|bn|billion)\s*(?:parameter|params|model|instruct|chat)?/gi,
    /(\d+(?:\.\d+)?)\s*(m|million)\s*(?:parameter|params)/gi
  ];

  for (const re of patterns) {
    for (const match of text.matchAll(re)) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) out.push(toBillions(value, match[2]));
    }
  }
  return [...new Set(out)].filter(n => n > 0 && n < 10_000);
}

export function extractParameters(input: HFModelInput): number | undefined {
  const card = input.cardData ?? {};
  const candidates: number[] = [];

  const directKeys = [
    "parameters", "parameter_count", "num_parameters", "n_parameters",
    "model_parameters", "params"
  ];

  for (const key of directKeys) {
    const raw = card[key] ?? input.config?.[key] ?? input.raw?.[key];
    const n = numberFrom(raw);
    if (n !== undefined) {
      // Large raw values are assumed to be an absolute count.
      candidates.push(n > 100_000 ? n / 1e9 : n);
    }
  }

  // Explicit metadata/config values are intentionally collected before model-card/name text.
  // This prevents unrelated numbers in a README from outranking authoritative metadata.
  if (candidates.length === 0) {
    const text = [
      input.id,
      ...(input.tags ?? []),
      input.modelCardText ?? ""
    ].join("\n");
    candidates.push(...extractParameterCandidates(text));
  }

  // Prefer a plausible model-size value; avoid unrelated tiny numbers.
  const plausible = candidates.filter(n => n >= 0.1 && n <= 1000);
  return plausible.length ? plausible[0] : undefined;
}

export function extractArchitecture(input: HFModelInput): string | undefined {
  const config = input.config ?? {};
  const card = input.cardData ?? {};
  const value =
    config["model_type"] ??
    config["architectures"] ??
    card["model_type"] ??
    card["architecture"];

  if (Array.isArray(value)) return String(value[0] ?? "");
  if (typeof value === "string" && value.trim()) return value.trim();

  const tag = (input.tags ?? []).find(t => /architecture|llama|qwen|mistral|gemma|phi|deepseek|mixtral/i.test(t));
  return tag;
}

export function extractMoE(input: HFModelInput): Pick<ModelAnalysis, "isMoE"|"experts"|"activeExperts"|"totalParametersB"|"activeParametersB"> {
  const all = {
    ...input.config,
    ...input.cardData
  };

  const get = (...keys: string[]) => {
    for (const k of keys) {
      const v = numberFrom(all[k]);
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const experts = get("num_local_experts", "num_experts", "n_experts", "experts");
  const activeExperts = get(
    "num_experts_per_tok", "num_selected_experts",
    "num_active_experts", "top_k", "active_experts"
  );

  const text = `${input.id}\n${input.modelCardText ?? ""}\n${(input.tags ?? []).join(" ")}`;
  const isMoE =
    experts !== undefined ||
    /mixture[-\s]?of[-\s]?experts|\bmoe\b|mixtral/i.test(text);

  if (!isMoE) return { isMoE: false };

  const total = extractParameters(input);
  let active: number | undefined;

  if (total !== undefined && experts && activeExperts && experts > activeExperts) {
    active = total * (activeExperts / experts);
  }

  return {
    isMoE: true,
    experts,
    activeExperts,
    totalParametersB: total,
    activeParametersB: active
  };
}

export function extractQuantization(input: HFModelInput): string | undefined {
  const text = [
    input.id,
    ...(input.tags ?? []),
    input.modelCardText ?? "",
    JSON.stringify(input.gguf ?? {})
  ].join("\n");

  const patterns = [
    /\b(Q[2-8](?:[_-][A-Z0-9]+)*)\b/i,
    /\b(IQ[1-4]_[A-Z0-9]+)\b/i,
    /\b(FP16|BF16|FP32|INT8|8[- ]?bit|4[- ]?bit)\b/i
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].toUpperCase();
  }
  return undefined;
}

export function extractWeightSizeGB(input: HFModelInput): number | undefined {
  const gguf = input.gguf ?? {};
  for (const key of ["total", "total_size", "size", "size_bytes"]) {
    const value = numberFrom(gguf[key]);
    if (value !== undefined && value > 0) return value / 1e9;
  }

  const safe = input.safetensors ?? {};
  for (const key of ["total", "total_size", "parameters"]) {
    const value = numberFrom(safe[key]);
    if (value !== undefined && value > 0) {
      return key === "parameters" ? undefined : value / 1e9;
    }
  }

  const siblingBytes = (input.siblings ?? [])
    .map(s => numberFrom(s.size))
    .filter((n): n is number => n !== undefined && n > 0)
    .reduce((a, b) => a + b, 0);

  return siblingBytes > 0 ? siblingBytes / 1e9 : undefined;
}
