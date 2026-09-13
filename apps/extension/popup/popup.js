const $ = id => document.getElementById(id);
const defaults = { gpuName: 'RTX 3060 12GB', vramGB: 12, kvCacheGB: 1.5, enabled: true };

async function load() {
  const s = { ...defaults, ...(await chrome.storage.local.get(defaults)) };
  $('gpu').value = s.gpuName;
  $('vram').value = s.vramGB;
  $('kv').value = s.kvCacheGB;
  $('enabled').checked = Boolean(s.enabled);
}

$('gpu').addEventListener('change', () => {
  const option = $('gpu').selectedOptions[0];
  const value = option.dataset.vram;
  if (value) $('vram').value = value;
});

$('save').addEventListener('click', async () => {
  const vramGB = Number($('vram').value);
  const kvCacheGB = Number($('kv').value);
  if (!Number.isFinite(vramGB) || vramGB <= 0) {
    $('status').textContent = 'Enter a valid VRAM value.';
    return;
  }
  if (!Number.isFinite(kvCacheGB) || kvCacheGB < 0) {
    $('status').textContent = 'Enter a valid KV cache allowance.';
    return;
  }
  await chrome.storage.local.set({
    gpuName: $('gpu').value,
    vramGB,
    kvCacheGB,
    enabled: $('enabled').checked
  });
  $('status').textContent = 'Saved.';
  setTimeout(() => $('status').textContent = '', 1500);
});

load();
