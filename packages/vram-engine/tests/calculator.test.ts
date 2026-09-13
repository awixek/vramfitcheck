import test from "node:test";
import assert from "node:assert/strict";
import { estimateVRAM, normalizeQuantization, bitsForQuantization } from "../src/index.ts";

const rtx3060 = { name: "RTX 3060 12GB", vramGB: 12 };

test("normalizes common quantizations", () => {
  assert.equal(normalizeQuantization("GGUF Q4_K_M"), "q4");
  assert.equal(normalizeQuantization("FP16"), "fp16");
  assert.equal(normalizeQuantization("8-bit"), "q8");
  assert.equal(bitsForQuantization("q4"), 4.5);
});

test("estimates 7B Q4 below 12GB", () => {
  const result = estimateVRAM(
    { parametersB: 7, quantization: "Q4_K_M" },
    rtx3060,
    { contextLength: 4096 }
  );
  assert.equal(result.status, "comfortable");
  assert.ok(result.breakdown.totalRequiredGB > 0);
});

test("16B FP16 does not fit 12GB", () => {
  const result = estimateVRAM(
    { parametersB: 16, quantization: "FP16" },
    rtx3060
  );
  assert.equal(result.status, "oom");
});

test("exact weight size takes precedence over parameter estimate", () => {
  const result = estimateVRAM(
    { parametersB: 7, quantization: "Q4", weightSizeGB: 2.0 },
    rtx3060
  );
  assert.equal(result.breakdown.weightsGB, 2);
});

test("unknown model data returns unknown", () => {
  const result = estimateVRAM({}, rtx3060);
  assert.equal(result.status, "unknown");
});

test("higher context increases estimated KV cache", () => {
  const a = estimateVRAM(
    { parametersB: 7, quantization: "Q4" },
    rtx3060,
    { contextLength: 4096 }
  );
  const b = estimateVRAM(
    { parametersB: 7, quantization: "Q4" },
    rtx3060,
    { contextLength: 32768 }
  );
  assert.ok(b.breakdown.kvCacheGB > a.breakdown.kvCacheGB);
});
