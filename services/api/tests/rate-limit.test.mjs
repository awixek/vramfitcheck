import test from "node:test";
import assert from "node:assert/strict";

test("rate limit allows requests until max", async () => {
  const source = await import("../src/middleware/rate-limit.ts");
  assert.equal(source.rateLimit("a", 0, 60000, 2), true);
  assert.equal(source.rateLimit("a", 1, 60000, 2), true);
  assert.equal(source.rateLimit("a", 2, 60000, 2), false);
  assert.equal(source.rateLimit("a", 60001, 60000, 2), true);
});