import test from "node:test";
import assert from "node:assert/strict";
import { gpusRoute } from "../src/routes/gpus.ts";

test("GET /v1/gpus returns the catalog", async () => {
  const response = gpusRoute(new Request("http://localhost/v1/gpus"));
  assert.equal(response.status, 200);
  const body = await response.json() as { gpus: Array<{ id: string }>; count: number; vramValues: number[] };
  assert.equal(body.count, body.gpus.length);
  assert.ok(body.gpus.length >= 10);
  assert.ok(body.gpus.some(gpu => gpu.id === "nvidia-rtx-5090-32gb"));
  assert.ok(body.vramValues.includes(32));
});

test("GPU endpoint supports vendor and VRAM filters", async () => {
  const response = gpusRoute(new Request("http://localhost/v1/gpus?vendor=nvidia&minVRAMGB=24"));
  assert.equal(response.status, 200);
  const body = await response.json() as { gpus: Array<{ vendor: string; vramGB: number }> };
  assert.ok(body.gpus.length > 0);
  assert.ok(body.gpus.every(gpu => gpu.vendor === "nvidia" && gpu.vramGB >= 24));
});

test("GPU endpoint returns one profile by id", async () => {
  const response = gpusRoute(new Request("http://localhost/v1/gpus?id=nvidia-rtx-4090-24gb"));
  assert.equal(response.status, 200);
  const body = await response.json() as { gpu: { id: string; vramGB: number } };
  assert.equal(body.gpu.id, "nvidia-rtx-4090-24gb");
  assert.equal(body.gpu.vramGB, 24);
});

test("GPU endpoint validates filters", () => {
  const badVendor = gpusRoute(new Request("http://localhost/v1/gpus?vendor=foo"));
  assert.equal(badVendor.status, 400);
  const badRange = gpusRoute(new Request("http://localhost/v1/gpus?minVRAMGB=32&maxVRAMGB=16"));
  assert.equal(badRange.status, 400);
});
