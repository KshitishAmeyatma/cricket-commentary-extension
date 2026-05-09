const btnStart   = document.getElementById('btnStart');
const btnStop    = document.getElementById('btnStop');
const apiKeyEl   = document.getElementById('apiKey');
const intervalEl = document.getElementById('interval');
const statusText = document.getElementById('statusText');
const dot        = document.getElementById('dot');

// Restore saved API key
chrome.storage.local.get(['apiKey', 'isRunning'], (data) => {
  if (data.apiKey) apiKeyEl.value = data.apiKey;
  if (data.isRunning) setRunningState(true);
});

btnStart.addEventListener('click', () => {
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey.startsWith('sk-ant-')) {
    setStatus('⚠ Please enter a valid Anthropic API key (starts with sk-ant-)');
    return;
  }
  const interval = parseInt(intervalEl.value) || 4;
  chrome.storage.local.set({ apiKey, interval });

  chrome.runtime.sendMessage({ action: 'START', apiKey, interval }, (resp) => {
    if (resp && resp.ok) {
      setRunningState(true);
      setStatus('Live — capturing every ' + interval + 's');
    } else {
      setStatus('Error starting: ' + (resp && resp.error ? resp.error : 'unknown'));
    }
  });
});

btnStop.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'STOP' }, () => {
    setRunningState(false);
    setStatus('Stopped');
  });
});

// Listen for commentary updates from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'COMMENTARY_UPDATE') {
    setStatus('🎙 ' + msg.text);
  }
  if (msg.action === 'ERROR') {
    setStatus('⚠ ' + msg.text);
  }
});

function setRunningState(running) {
  btnStart.disabled = running;
  btnStop.disabled  = !running;
  dot.className     = running ? 'dot live' : 'dot';
}

function setStatus(text) {
  statusText.textContent = text;
}
