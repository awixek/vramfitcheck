import test from "node:test";
import assert from "node:assert/strict";
import { analyzeModel, extractParameterCandidates, extractQuantization } from "../src/index.ts";

test("extracts parameter counts from model text", () => {
  assert.deepEqual(extractParameterCandidates("A 7B model and a 13B model"), [7, 13]);
});

test("detects Q4 quantization", () => {
  assert.equal(
    extractQuantization({ id: "org/model-Q4_K_M" }),
    "Q4_K_M"
  );
});

test("uses card metadata for parameters", () => {
  const result = analyzeModel({
    id: "org/model",
    cardData: { parameter_count: 7 },
    config: { model_type: "llama" },
    tags: ["text-generation"],
    modelCardText: "This model is provided in Q4_K_M."
  });
  assert.equal(result.parametersB, 7);
  assert.equal(result.architecture, "llama");
  assert.equal(result.quantization, "Q4_K_M");
  assert.equal(result.confidence, "medium");
});

test("detects MoE and estimates active parameters", () => {
  const result = analyzeModel({
    id: "org/moe",
    cardData: { parameter_count: 47 },
    config: { num_local_experts: 8, num_experts_per_tok: 2 },
    modelCardText: "Mixture of Experts model."
  });
  assert.equal(result.isMoE, true);
  assert.equal(result.experts, 8);
  assert.equal(result.activeExperts, 2);
  assert.equal(result.activeParametersB, 11.75);
});

test("prefers GGUF total size when available", () => {
  const result = analyzeModel({
    id: "org/model",
    gguf: { total: 5000000000 },
    modelCardText: "Q4_K_M"
  });
  assert.equal(result.weightSizeGB, 5);
});
