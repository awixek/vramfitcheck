(() => {
  'use strict';

  const BITS_PER_WEIGHT = Object.freeze({
    fp16: 16,
    fp32: 32,
    bf16: 16,
    q8: 8,
    int8: 8,
    q6: 6.5,
    q5: 5.5,
    q4: 4.5,
    q3: 3.5,
    q2: 2.5
  });

  function normalizeQuantization(value = '') {
    const s = String(value).toLowerCase().replace(/[\s-]/g, '');
    if (/fp32|float32/.test(s)) return 'fp32';
    if (/fp16|float16|bf16|bfloat16/.test(s)) return 'fp16';
    if (/q8|int8|8bit|8-bit/.test(s)) return 'q8';
    if (/q6|6bit|6-bit/.test(s)) return 'q6';
    if (/q5|5bit|5-bit/.test(s)) return 'q5';
    if (/q4|4bit|4-bit/.test(s)) return 'q4';
    if (/q3|3bit|3-bit/.test(s)) return 'q3';
    if (/q2|2bit|2-bit/.test(s)) return 'q2';
    return null;
  }

  function bitsForQuantization(quantization) {
    return BITS_PER_WEIGHT[normalizeQuantization(quantization)] ?? null;
  }

  function estimateVRAM({ parametersB, bitsPerWeight = 16, kvCacheGB = 1.5, overhead = 1.2 }) {
    const p = Number(parametersB);
    const bits = Number(bitsPerWeight);
    const kv = Number(kvCacheGB);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(bits) || bits <= 0) return null;
    const weightsGB = (p * bits / 8) * overhead;
    const totalGB = weightsGB + (Number.isFinite(kv) && kv >= 0 ? kv : 0);
    return { parametersB: p, bitsPerWeight: bits, weightsGB, kvCacheGB: kv, overhead, totalGB };
  }

  function classify(requiredGB, userVRAMGB, quantizedRequiredGB = null) {
    const v = Number(userVRAMGB);
    const r = Number(requiredGB);
    if (!Number.isFinite(v) || v <= 0 || !Number.isFinite(r)) return 'unknown';
    if (r <= v) return 'fits';
    if (Number.isFinite(quantizedRequiredGB) && quantizedRequiredGB <= v) return 'quantized';
    return 'oom';
  }

  function formatGB(gb) {
    return `${Number(gb).toFixed(1)} GB`;
  }

  globalThis.HFVRAMCalculator = Object.freeze({
    BITS_PER_WEIGHT,
    normalizeQuantization,
    bitsForQuantization,
    estimateVRAM,
    classify,
    formatGB
  });
})();
