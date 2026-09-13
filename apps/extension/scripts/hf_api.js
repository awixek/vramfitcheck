(() => {
  'use strict';
  const DEFAULT_API_BASE = 'http://localhost:8080';
  const cache = new Map();
  function parseModelIdFromPath(pathname = location.pathname) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] !== 'models' || !parts[1]) return null;
    return parts.slice(1).join('/');
  }
  async function getApiBase() {
    const data = await chrome.storage.local.get({ apiBaseUrl: DEFAULT_API_BASE });
    return String(data.apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, '');
  }
  async function getModelInfo(modelId) {
    if (!modelId) return null;
    if (cache.has(modelId)) return cache.get(modelId);
    try {
      const base = await getApiBase();
      const response = await fetch(`${base}/v1/models?modelId=${encodeURIComponent(modelId)}`, { headers: { Accept: 'application/json' }, credentials: 'omit' });
      if (!response.ok) return null;
      const data = await response.json();
      const result = data.analysis ? { ...data.model, ...data.analysis } : data.model ?? data;
      cache.set(modelId, result);
      return result;
    } catch { return null; }
  }
  async function getModelCardText() { return ''; }
  globalThis.HFVRAMApi = Object.freeze({ parseModelIdFromPath, getModelInfo, getModelCardText, getApiBase });
})();
