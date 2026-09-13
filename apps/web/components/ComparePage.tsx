"use client";

import { useEffect, useMemo, useState } from "react";
import { calculate, getGPUs, getModel, GPU } from "../lib/api";

type Fit = {
  status?: string;
  confidence?: string;
  requiredVRAMGB?: number;
  availableVRAMGB?: number;
  headroomGB?: number;
  breakdown?: {
    weightsGB?: number;
    kvCacheGB?: number;
    runtimeOverheadGB?: number;
    safetyMarginGB?: number;
  };
  warnings?: string[];
};

type ModelRow = {
  id: string;
  data?: any;
  loading?: boolean;
  error?: string;
  fits: Record<string, Fit>;
};

const DEFAULT_MODELS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

const statusLabel: Record<string, string> = {
  comfortable: "Comfortable",
  tight: "Tight",
  offload: "Needs offloading",
  oom: "Won’t fit",
  unknown: "Unknown",
};

function fitClass(status?: string) {
  if (status === "comfortable") return "fit good";
  if (status === "tight") return "fit warn";
  if (status === "offload") return "fit offload";
  if (status === "oom") return "fit bad";
  return "fit unknown";
}

const statusRank: Record<string, number> = {
  comfortable: 4,
  tight: 3,
  offload: 2,
  oom: 1,
  unknown: 0,
};

function gpuScore(gpu: GPU, fit: Fit) {
  const status = statusRank[fit.status || "unknown"] ?? 0;
  const headroom = fit.headroomGB ?? -999;
  const bandwidth = gpu.bandwidthGBps ?? 0;

  // Prefer the safest fit, then enough-but-not-wasteful VRAM,
  // then bandwidth as a tie-breaker.
  const headroomPenalty = headroom > 0 ? Math.min(headroom, 64) : 0;
  return status * 10000 - headroomPenalty * 10 + bandwidth / 1000;
}

function modelScore(row: ModelRow, gpuId: string) {
  const fit = row.fits[gpuId];
  if (!fit) return -Infinity;
  const status = statusRank[fit.status || "unknown"] ?? 0;
  const required = fit.requiredVRAMGB ?? 0;
  // For a GPU, a larger model that still fits comfortably is more capable.
  return status * 100000 + required * 100;
}

export default function ComparePage() {
  const [gpus, setGpus] = useState<GPU[]>([]);
  const [selectedGpus, setSelectedGpus] = useState<string[]>([]);
  const [models, setModels] = useState<ModelRow[]>(
    DEFAULT_MODELS.map((id) => ({ id, fits: {} }))
  );
  const [newModel, setNewModel] = useState("");
  const [context, setContext] = useState(4096);
  const [quantization, setQuantization] = useState("auto");
  const [mode, setMode] = useState<"gpu" | "model">("gpu");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getGPUs()
      .then((items) => {
        setGpus(items);
        setSelectedGpus(items.slice(0, Math.min(3, items.length)).map((g) => g.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
    () => gpus.filter((g) => selectedGpus.includes(g.id)),
    [gpus, selectedGpus]
  );

  const recommendations = useMemo(() => {
    const bestGPUByModel = models.map((row) => {
      const ranked = selected
        .filter((gpu) => row.fits[gpu.id])
        .map((gpu) => ({ gpu, fit: row.fits[gpu.id] }))
        .sort((a, b) => gpuScore(b.gpu, b.fit) - gpuScore(a.gpu, a.fit));
      return { row, winner: ranked[0] };
    });

    const bestModelByGPU = selected.map((gpu) => {
      const ranked = models
        .filter((row) => row.fits[gpu.id])
        .sort((a, b) => modelScore(b, gpu.id) - modelScore(a, gpu.id));
      return { gpu, winner: ranked[0] };
    });

    return { bestGPUByModel, bestModelByGPU };
  }, [models, selected]);

  function toggleGPU(id: string) {
    setSelectedGpus((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function addModel() {
    const id = newModel.trim();
    if (!id || models.some((m) => m.id === id)) return;
    setModels((m) => [...m, { id, fits: {} }]);
    setNewModel("");
  }

  function removeModel(id: string) {
    setModels((m) => m.filter((x) => x.id !== id));
  }

  async function runComparison() {
    setBusy(true);
    setError("");
    try {
      const next: ModelRow[] = [];
      for (const row of models) {
        const data = await getModel(row.id);
        const model = { ...(data.model ?? {}), ...(data.analysis ?? {}) };
        const fits: Record<string, Fit> = {};
        for (const gpu of selected) {
          const result = await calculate({
            model,
            gpu,
            runtime: {
              contextLength: context,
              batchSize: 1,
              ...(quantization !== "auto" ? { quantization } : {}),
            },
          });
          fits[gpu.id] = result;
        }
        next.push({ ...row, data, fits });
      }
      setModels(next);
    } catch (e: any) {
      setError(e?.message || "Comparison failed");
    } finally {
      setBusy(false);
    }
  }

  const totalCells = models.length * selected.length;

  return (
    <main className="compare-page">
      <section className="compare-hero">
        <div>
          <span className="eyebrow">HF-VRAM / COMPARE</span>
          <h1>Compare models and GPUs.</h1>
          <p>
            Test the same model across multiple GPUs, or compare several Hugging Face
            models against the same hardware. Every fit result comes from the VRAM engine.
          </p>
        </div>
        <button className="primary" onClick={runComparison} disabled={busy || !selected.length || !models.length}>
          {busy ? "Comparing…" : `Run comparison · ${totalCells} fits`}
        </button>
      </section>

      <section className="compare-controls">
        <div className="control-block">
          <label>GPU selection</label>
          {loading ? <div className="muted">Loading GPU catalog…</div> : (
            <div className="gpu-grid">
              {gpus.map((gpu) => (
                <label className={`gpu-chip ${selectedGpus.includes(gpu.id) ? "selected" : ""}`} key={gpu.id}>
                  <input
                    type="checkbox"
                    checked={selectedGpus.includes(gpu.id)}
                    onChange={() => toggleGPU(gpu.id)}
                  />
                  <span>
                    <strong>{gpu.name}</strong>
                    <small>{gpu.vramGB} GB · {gpu.vendor}</small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="control-block">
          <label>Models</label>
          <div className="model-input">
            <input
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModel()}
              placeholder="owner/model-id"
            />
            <button onClick={addModel}>Add model</button>
          </div>
          <div className="model-list">
            {models.map((m) => (
              <span className="model-pill" key={m.id}>
                {m.id}
                <button onClick={() => removeModel(m.id)} aria-label={`Remove ${m.id}`}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="runtime-row">
          <div>
            <label>Context</label>
            <select value={context} onChange={(e) => setContext(Number(e.target.value))}>
              {[2048,4096,8192,16384,32768,65536].map((n) => <option key={n} value={n}>{n / 1024}K</option>)}
            </select>
          </div>
          <div>
            <label>Quantization</label>
            <select value={quantization} onChange={(e) => setQuantization(e.target.value)}>
              <option value="auto">Auto</option>
              <option value="fp16">FP16</option>
              <option value="bf16">BF16</option>
              <option value="q8">Q8</option>
              <option value="q6">Q6</option>
              <option value="q5">Q5</option>
              <option value="q4">Q4</option>
              <option value="q3">Q3</option>
              <option value="q2">Q2</option>
            </select>
          </div>
          <div className="mode-tabs">
            <button className={mode === "gpu" ? "active" : ""} onClick={() => setMode("gpu")}>GPU matrix</button>
            <button className={mode === "model" ? "active" : ""} onClick={() => setMode("model")}>Model fit</button>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
      </section>

      <section className="recommendations">
        <div className="table-title">
          <div>
            <span className="eyebrow">SMART RECOMMENDATIONS</span>
            <h2>Best fit, automatically ranked</h2>
          </div>
          <span className="muted">Based on fit safety, headroom and GPU capability</span>
        </div>

        <div className="recommendation-grid">
          <div className="recommendation-card">
            <div className="recommendation-heading">
              <div>
                <span className="eyebrow">BEST GPU FOR MODEL</span>
                <h3>Which GPU should run each model?</h3>
              </div>
            </div>
            {recommendations.bestGPUByModel.map(({ row, winner }) => (
              <div className="recommendation-row" key={row.id}>
                <div className="recommendation-model">
                  <strong>{row.id}</strong>
                  <small>{row.data?.analysis?.parametersB ? `${row.data.analysis.parametersB}B parameters` : "Model analysis"}</small>
                </div>
                {winner ? (
                  <div className={`recommendation-result ${fitClass(winner.fit.status)}`}>
                    <strong>{winner.gpu.name}</strong>
                    <span>{statusLabel[winner.fit.status || "unknown"] || winner.fit.status}</span>
                    {winner.fit.requiredVRAMGB != null && <small>{winner.fit.requiredVRAMGB.toFixed(1)} GB required · {winner.fit.headroomGB != null ? `${winner.fit.headroomGB >= 0 ? "+" : ""}${winner.fit.headroomGB.toFixed(1)} GB headroom` : ""}</small>}
                  </div>
                ) : (
                  <div className="recommendation-result unknown"><strong>No result yet</strong><span>Run comparison</span></div>
                )}
              </div>
            ))}
          </div>

          <div className="recommendation-card">
            <div className="recommendation-heading">
              <div>
                <span className="eyebrow">BEST MODEL FOR GPU</span>
                <h3>What is the largest fit in this set?</h3>
              </div>
            </div>
            {recommendations.bestModelByGPU.map(({ gpu, winner }) => (
              <div className="recommendation-row" key={gpu.id}>
                <div className="recommendation-model">
                  <strong>{gpu.name}</strong>
                  <small>{gpu.vramGB} GB VRAM</small>
                </div>
                {winner ? (
                  <div className={`recommendation-result ${fitClass(winner.fits[gpu.id]?.status)}`}>
                    <strong>{winner.id}</strong>
                    <span>{statusLabel[winner.fits[gpu.id]?.status || "unknown"] || winner.fits[gpu.id]?.status}</span>
                    {winner.fits[gpu.id]?.requiredVRAMGB != null && <small>{winner.fits[gpu.id].requiredVRAMGB.toFixed(1)} GB required · {winner.fits[gpu.id]?.headroomGB != null ? `${winner.fits[gpu.id].headroomGB >= 0 ? "+" : ""}${winner.fits[gpu.id].headroomGB.toFixed(1)} GB headroom` : ""}</small>}
                  </div>
                ) : (
                  <div className="recommendation-result unknown"><strong>No fit result</strong><span>Run comparison</span></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="recommendation-note">
          Ranking is a planning aid: the engine first prioritizes a safe fit, then avoids excessive unused VRAM,
          with memory bandwidth as a tie-breaker. The GPU winner is not a price/performance claim.
          Real inference can vary with runtime, context, batch size and workload.
        </p>
      </section>

      <section className="compare-table-wrap">
        <div className="table-title">
          <div>
            <span className="eyebrow">FIT MATRIX</span>
            <h2>{mode === "gpu" ? "Model × GPU" : "GPU fit by model"}</h2>
          </div>
          <span className="muted">{models.length} models · {selected.length} GPUs</span>
        </div>

        <div className="matrix-scroll">
          <table className="matrix">
            <thead>
              <tr>
                <th>Model</th>
                {selected.map((gpu) => (
                  <th key={gpu.id}>
                    <span>{gpu.name}</span>
                    <small>{gpu.vramGB} GB</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((row) => (
                <tr key={row.id}>
                  <td className="model-cell">
                    <strong>{row.id}</strong>
                    {row.data?.analysis?.parametersB && <small>{row.data.analysis.parametersB}B parameters</small>}
                  </td>
                  {selected.map((gpu) => {
                    const fit = row.fits[gpu.id];
                    return (
                      <td key={gpu.id}>
                        {!fit ? <span className="muted">—</span> : (
                          <div className={fitClass(fit.status)}>
                            <strong>{statusLabel[fit.status || "unknown"] || fit.status}</strong>
                            <small>
                              {fit.requiredVRAMGB != null ? `${fit.requiredVRAMGB.toFixed(1)} GB required` : "No estimate"}
                              {fit.headroomGB != null ? ` · ${fit.headroomGB >= 0 ? "+" : ""}${fit.headroomGB.toFixed(1)} GB headroom` : ""}
                            </small>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
