// background.js — service worker
// Captures tab, samples frames, calls Claude Vision, forwards commentary

let captureStream  = null;
let captureTabId   = null;
let intervalHandle = null;
let apiKey         = null;
let intervalSecs   = 4;
let isRunning      = false;

const SYSTEM_PROMPT = `You are an expert cricket commentator with deep knowledge of the game.
You are watching a live cricket match on screen.
Your job: look at this single frame and write 1-2 sharp, exciting commentary sentences about what you can see.
Focus on: the ball, the batsman's shot or stance, fielding positions, scoreboard if visible, player names if visible.
Be specific — mention the shot played, the bowler's action, or the field setting.
If it is a replay, say so.
If you cannot clearly see cricket, say "Waiting for the action..."
Keep it punchy and broadcast-style. No bullet points. Plain text only.`;

// ── Message handler ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'START') {
    apiKey       = msg.apiKey;
    intervalSecs = msg.interval || 4;
    startCapture(sendResponse);
    return true; // keep channel open for async response
  }
  if (msg.action === 'STOP') {
    stopCapture();
    sendResponse({ ok: true });
  }
});

// ── Start capture ────────────────────────────────────────────────────────────
function startCapture(sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      sendResponse({ ok: false, error: 'No active tab found' });
      return;
    }
    captureTabId = tabs[0].id;

    chrome.tabCapture.capture({ video: true, audio: false }, (stream) => {
      if (chrome.runtime.lastError || !stream) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || 'Capture failed' });
        return;
      }

      captureStream = stream;
      isRunning     = true;
      chrome.storage.local.set({ isRunning: true });

      // Kick off first capture immediately then on interval
      captureAndAnalyse();
      intervalHandle = setInterval(captureAndAnalyse, intervalSecs * 1000);

      sendResponse({ ok: true });
    });
  });
}

// ── Stop capture ─────────────────────────────────────────────────────────────
function stopCapture() {
  if (intervalHandle) { clearInterval(intervalHandle); intervalHandle = null; }
  if (captureStream)  { captureStream.getTracks().forEach(t => t.stop()); captureStream = null; }
  isRunning = false;
  chrome.storage.local.set({ isRunning: false });

  // Remove overlay from tab
  if (captureTabId) {
    chrome.tabs.sendMessage(captureTabId, { action: 'HIDE_OVERLAY' }).catch(() => {});
  }
}

// ── Grab a frame and call Claude ─────────────────────────────────────────────
function captureAndAnalyse() {
  if (!captureStream || !isRunning) return;

  try {
    const video  = document.createElement('video');
    video.srcObject = captureStream;
    video.muted     = true;

    video.onloadedmetadata = () => {
      video.play().then(() => {
        const canvas  = document.createElement('canvas');
        // Cap at 1280px wide to keep payload reasonable
        const scale   = Math.min(1, 1280 / (video.videoWidth || 1280));
        canvas.width  = Math.round((video.videoWidth  || 1280) * scale);
        canvas.height = Math.round((video.videoHeight || 720)  * scale);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // JPEG at 0.75 quality — good balance of fidelity vs token cost
        const dataUrl  = canvas.toDataURL('image/jpeg', 0.75);
        const base64   = dataUrl.split(',')[1];

        video.pause();
        video.srcObject = null;

        callClaude(base64);
      }).catch(err => console.error('[Commentary] video.play error:', err));
    };
  } catch (e) {
    console.error('[Commentary] frame capture error:', e);
  }
}

// ── Call Claude Vision API ────────────────────────────────────────────────────
async function callClaude(base64Image) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 120,
        system:     SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type:  'image',
                source: {
                  type:       'base64',
                  media_type: 'image/jpeg',
                  data:        base64Image
                }
              },
              {
                type: 'text',
                text: 'Describe what is happening in this cricket match frame as a commentator.'
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      broadcastError('API error ' + response.status + ': ' + err.slice(0, 120));
      return;
    }

    const data       = await response.json();
    const commentary = data?.content?.[0]?.text?.trim();

    if (commentary) {
      // Send to overlay on the page
      if (captureTabId) {
        chrome.tabs.sendMessage(captureTabId, {
          action: 'SHOW_COMMENTARY',
          text:   commentary
        }).catch(() => {});
      }
      // Also update popup if open
      chrome.runtime.sendMessage({ action: 'COMMENTARY_UPDATE', text: commentary }).catch(() => {});
    }

  } catch (e) {
    broadcastError(e.message || 'Network error');
  }
}

function broadcastError(text) {
  console.error('[Commentary]', text);
  chrome.runtime.sendMessage({ action: 'ERROR', text }).catch(() => {});
}
