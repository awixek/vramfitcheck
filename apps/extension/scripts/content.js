(() => {
  'use strict';

  const DEFAULT_SETTINGS = { vramGB: 8, gpuName: 'Custom GPU', kvCacheGB: 1.5, enabled: true };
  const state = { settings: { ...DEFAULT_SETTINGS }, modelInfo: null, cardText: '', lastPath: location.href };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function loadSettings() {
    const data = await chrome.storage.local.get(DEFAULT_SETTINGS);
    state.settings = { ...DEFAULT_SETTINGS, ...data };
  }

  function combinedText() {
    const tags = state.modelInfo?.tags || [];
    const cardData = state.modelInfo?.cardData || {};
    return [location.pathname, document.title, tags.join(' '), JSON.stringify(cardData), state.cardText]
      .join(' ');
  }

  function inferParametersB(text) {
    const s = text.replace(/,/g, '');
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:b|bn|billion)\b/i,
      /(\d+(?:\.\d+)?)b[-_\s]?(?:instruct|chat|it|base|model)\b/i
    ];
    for (const re of patterns) {
      const m = s.match(re);
      if (m) {
        const n = Number(m[1]);
        if (n > 0.1 && n < 2000) return n;
      }
    }
    return null;
  }

  function inferBits(text) {
    const normalized = HFVRAMCalculator.normalizeQuantization(text);
    return normalized ? HFVRAMCalculator.bitsForQuantization(normalized) : 16;
  }

  function inferQuantizedEstimate(parametersB, text) {
    const q4 = HFVRAMCalculator.estimateVRAM({
      parametersB,
      bitsPerWeight: 4.5,
      kvCacheGB: state.settings.kvCacheGB
    });
    return q4?.totalGB ?? null;
  }

  function getModelTitleHost() {
    const candidates = [
      'h1',
      '[data-testid="model-name"]',
      'main h1',
      'article h1'
    ];
    for (const selector of candidates) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }

  function removeBadge() {
    document.querySelectorAll('.vram-fit-badge').forEach(el => el.remove());
  }

  function renderModelBadge() {
    removeBadge();
    if (!state.settings.enabled) return;

    const host = getModelTitleHost();
    if (!host) return;

    const text = combinedText();
    const parametersB = state.modelInfo?.totalParametersB ?? state.modelInfo?.parametersB ?? inferParametersB(text);
    if (!parametersB) return;

    const bits = state.modelInfo?.quantizationBits ?? inferBits(text);
    const estimate = HFVRAMCalculator.estimateVRAM({
      parametersB,
      bitsPerWeight: bits,
      kvCacheGB: state.settings.kvCacheGB
    });
    const q4 = bits > 4.5 ? inferQuantizedEstimate(parametersB, text) : null;
    const status = HFVRAMCalculator.classify(estimate.totalGB, state.settings.vramGB, q4);

    const badge = document.createElement('span');
    badge.className = 'vram-fit-badge';
    badge.dataset.status = status;
    badge.textContent = status === 'fits' ? '🟢 Fits' :
                        status === 'quantized' ? '🟡 Q4 recommended' :
                        status === 'oom' ? '🔴 OOM' : '⚪ Unknown';

    const quantNote = q4 ? ` Q4 estimate: ${HFVRAMCalculator.formatGB(q4)}.` : '';
    badge.title =
      `Model: ${parametersB}B • ${bits} bits/weight\n` +
      `Weights + overhead: ${HFVRAMCalculator.formatGB(estimate.weightsGB)}\n` +
      `KV cache allowance: ${HFVRAMCalculator.formatGB(estimate.kvCacheGB)}\n` +
      `Estimated total: ${HFVRAMCalculator.formatGB(estimate.totalGB)}\n` +
      `Your VRAM: ${state.settings.vramGB} GB.${quantNote}\n` +
      `Estimate only — actual runtime VRAM varies by framework, context, batch size and model architecture.`;

    host.appendChild(badge);
  }

  function modelCards() {
    return [...document.querySelectorAll('a[href^="/models/"]')].filter(a => {
      const id = a.getAttribute('href')?.split('?')[0];
      return id && id.split('/').filter(Boolean).length >= 2;
    });
  }

  function extractCardModelId(card) {
    const href = card.getAttribute('href') || '';
    return href.split('?')[0].replace(/^\/models\//, '').replace(/\/$/, '');
  }

  function cardParameterB(card) {
    return inferParametersB(card.innerText || '');
  }

  async function applyFilter(enabled) {
    for (const card of modelCards()) {
      const p = cardParameterB(card);
      let status = 'unknown';
      if (p) {
        const e = HFVRAMCalculator.estimateVRAM({
          parametersB: p, bitsPerWeight: 16, kvCacheGB: state.settings.kvCacheGB
        });
        status = HFVRAMCalculator.classify(
          e.totalGB, state.settings.vramGB,
          HFVRAMCalculator.estimateVRAM({parametersB:p,bitsPerWeight:4.5,kvCacheGB:state.settings.kvCacheGB})?.totalGB
        );
      }
      const container = card.closest('li, article, [role="listitem"], .group') || card;
      container.classList.toggle('hf-vram-hidden', enabled && status === 'oom');
      container.dataset.hfVramStatus = status;
    }
  }

  function injectFilter() {
    if (!location.pathname.startsWith('/models') || location.pathname.split('/').filter(Boolean).length > 1) return;
    if (document.querySelector('.hf-vram-filter')) return;

    const target = document.querySelector('main') || document.body;
    const bar = document.createElement('div');
    bar.className = 'hf-vram-filter';
    const label = document.createElement('span');
    label.textContent = `GPU: ${state.settings.gpuName} • ${state.settings.vramGB} GB`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Filter by my GPU VRAM';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', async () => {
      const on = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(on));
      await applyFilter(on);
    });
    bar.append(label, button);
    target.prepend(bar);
  }

  async function processPage() {
    await loadSettings();

    const modelId = HFVRAMApi.parseModelIdFromPath(location.pathname);
    if (modelId) {
      state.modelInfo = await HFVRAMApi.getModelInfo(modelId);
      state.cardText = await HFVRAMApi.getModelCardText(modelId);
      renderModelBadge();
    } else if (location.pathname === '/models' || location.pathname.startsWith('/models?')) {
      injectFilter();
    }
  }

  let timer;
  function observeNavigation() {
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (location.href !== state.lastPath) {
          state.lastPath = location.href;
          document.querySelectorAll('.vram-fit-badge').forEach(el => el.remove());
          document.querySelectorAll('.hf-vram-filter').forEach(el => el.remove());
          processPage();
        } else if (location.pathname.startsWith('/models')) {
          injectFilter();
        } else {
          renderModelBadge();
        }
      }, 350);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    Object.keys(changes).forEach(k => state.settings[k] = changes[k].newValue);
    processPage();
  });

  processPage();
  observeNavigation();
})();
