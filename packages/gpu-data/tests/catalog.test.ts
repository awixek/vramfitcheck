import test from "node:test";
import assert from "node:assert/strict";
import { getGPU, listGPUs, uniqueVRAMValues } from "../src/index.ts";

test("catalog contains common consumer GPUs", () => {
  assert.ok(getGPU("nvidia-rtx-3060-12gb"));
  assert.ok(getGPU("nvidia-rtx-4090-24gb"));
  assert.ok(getGPU("nvidia-rtx-5090-32gb"));
});

test("catalog contains unified-memory Apple profiles", () => {
  const apple = listGPUs({ vendor: "apple" });
  assert.ok(apple.length >= 3);
  assert.ok(apple.every(gpu => gpu.unifiedMemory));
});

test("VRAM filtering works", () => {
  const result = listGPUs({ minVRAMGB: 24 });
  assert.ok(result.length > 0);
  assert.ok(result.every(gpu => gpu.vramGB >= 24));
});

test("VRAM values are sorted and unique", () => {
  const values = uniqueVRAMValues();
  assert.deepEqual(values, [...new Set(values)].sort((a, b) => a - b));
});
