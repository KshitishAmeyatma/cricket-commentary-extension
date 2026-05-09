# 🏏 Cricket Live Commentary — Chrome Extension

> **AI-powered live cricket commentary delivered as a floating overlay on your browser screen.**  
> Powered by **Claude Vision API (Anthropic)** — watches your screen, understands the game, and speaks like a commentator.

---

## 📸 How It Works

```
Your Browser Tab (cricket stream)
        ↓
  Tab Video Capture (Chrome API)
        ↓
  Frame sampled every N seconds
        ↓
  Sent to Claude Vision API
        ↓
  "AND HE'S DRIVEN IT THROUGH COVERS FOR FOUR!"
        ↓
  Floating overlay on your screen
```

Every few seconds the extension captures a frame from whatever is playing on your active browser tab, sends it to Claude's vision model with a cricket commentator prompt, and displays the response as a sleek floating bar at the bottom of your screen — live, automatic, no manual input needed.

---

## ✅ Prerequisites

Before installing the extension you need:

1. **Google Chrome** (version 88 or later — Manifest V3 support required)
2. **An Anthropic API key** — get one free at [console.anthropic.com](https://console.anthropic.com)
   - Sign up → API Keys → Create Key
   - Key format: `sk-ant-api03-...`
3. **A cricket stream open in Chrome** — works with Hotstar, Willow TV, ESPN Cricinfo video, YouTube cricket streams, etc.

---

## 📦 Installation

### Step 1 — Download the extension

**Option A — Clone via Git:**
```bash
git clone https://github.com/KshitishAmeyatma/cricket-commentary-extension.git
```

**Option B — Download ZIP:**
1. Click the green **Code** button on this page
2. Select **Download ZIP**
3. Extract the ZIP to a folder on your computer (e.g. `C:\cricket-commentary-extension`)

---

### Step 2 — Load into Chrome

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. In the top-right corner, enable **Developer mode** by toggling the switch ON

3. Click **Load unpacked** (top-left button)

4. Browse to and select the folder where you downloaded/cloned the extension  
   *(the folder that contains `manifest.json`)*

5. The **🏏 Cricket Commentary** extension will appear in your extensions list

6. Click the **puzzle piece icon** (🧩) in Chrome's toolbar → pin the Cricket Commentary extension so it stays visible

---

## 🚀 Using the Extension

### Step 1 — Open your cricket stream

Navigate to any cricket stream in your Chrome tab:
- Hotstar / Disney+ Hotstar
- Willow TV
- YouTube (cricket match stream)
- ESPN / Cricinfo video player
- Any other web-based video player

Make sure the match is **playing** (not paused) for best results.

---

### Step 2 — Open the extension popup

Click the **🏏 Cricket Commentary** icon in your Chrome toolbar.

You will see:

```
┌─────────────────────────────────────┐
│  🏏 Cricket Commentary              │
│                                     │
│  Anthropic API Key                  │
│  [ sk-ant-...                     ] │
│                                     │
│  Capture interval (seconds)         │
│  [ 4                              ] │
│                                     │
│  [ ▶ Start ]    [ ⏹ Stop ]         │
│                                     │
│  ● Ready — enter your API key...   │
└─────────────────────────────────────┘
```

---

### Step 3 — Enter your API key

Paste your Anthropic API key into the **API Key** field.  
It starts with `sk-ant-` and is saved locally in Chrome storage — you only need to enter it once.

> ⚠️ Your API key is stored locally in your browser only and is never sent anywhere except directly to `api.anthropic.com`.

---

### Step 4 — Set capture interval

The **capture interval** controls how often a frame is grabbed and sent for commentary.

| Interval | Best for | API cost |
|---|---|---|
| 2–3 seconds | Fast-paced T20, every delivery | Higher |
| 4–5 seconds | Good balance (recommended) | Moderate |
| 8–10 seconds | Casual watching, lower cost | Lower |

**Default: 4 seconds** — recommended for live match coverage.

---

### Step 5 — Click Start

1. Click **▶ Start**
2. Chrome will ask permission to capture the tab — click **Allow**
3. The status indicator turns **🔴 live**
4. A floating commentary bar appears at the bottom of your cricket stream:

```
┌────────────────────────────────────────────────────────────────┐
│  🎙  AND THAT'S A MAGNIFICENT COVER DRIVE! Kohli threads it    │
│      through the gap and races away to the boundary — FOUR!    │
└────────────────────────────────────────────────────────────────┘
```

Commentary updates automatically every N seconds — no interaction needed.

---

### Step 6 — Stop commentary

Click **⏹ Stop** in the popup at any time to stop capturing and hide the overlay.

---

## 🎙 Commentary Style

The AI is prompted to behave like a **broadcast cricket commentator**. It will:

- Describe the **shot played** (cover drive, pull shot, sweep, etc.)
- Call out **boundaries and sixes** with excitement
- Mention **bowler action** and **fielding positions** when visible
- Read the **scoreboard** if it appears in frame
- Identify **player names** from jerseys or on-screen graphics
- Note **replays** when shown
- Say *"Waiting for the action..."* if the frame is unclear or between overs

---

## 💰 API Cost Estimate

Each captured frame = 1 API call to Claude.

| Interval | Calls/hour | Approx. cost/hour |
|---|---|---|
| 2 seconds | ~1,800 | ~$3–4 |
| 4 seconds | ~900 | ~$1.50–2 |
| 5 seconds | ~720 | ~$1–1.50 |
| 10 seconds | ~360 | ~$0.50–0.75 |

> Costs are estimates based on `claude-sonnet-4-6` pricing (image input + ~120 output tokens per call). Check [anthropic.com/pricing](https://www.anthropic.com/pricing) for current rates.

**Tip:** Set a usage limit on your Anthropic account at [console.anthropic.com](https://console.anthropic.com) to avoid unexpected charges.

---

## 🛠 Troubleshooting

### "No context menu appearing after clicking Start"
- Make sure you are on the **tab with the cricket stream** when you click Start
- The extension captures the **active tab** — don't switch tabs after pressing Start

### "Commentary says Waiting for the action..."
- The frame was unclear — this is normal during replays, ads, or between overs
- Commentary will resume automatically when play resumes

### "API error 401"
- Your API key is invalid or expired
- Generate a new key at [console.anthropic.com](https://console.anthropic.com)

### "API error 429"
- You have hit Anthropic's rate limit
- Increase the capture interval to 8–10 seconds
- Or upgrade your Anthropic account tier

### "Overlay not appearing on the page"
- Some streaming sites use strict Content Security Policies
- Try refreshing the stream page **after** loading the extension
- The content script needs to be injected on page load

### "Extension not loading in Chrome"
- Confirm Developer Mode is **ON** in `chrome://extensions/`
- Confirm you selected the correct folder (must contain `manifest.json`)
- Check Chrome version: must be 88 or later

---

## 📁 File Structure

```
cricket-commentary-extension/
│
├── manifest.json       — Extension configuration and permissions
├── background.js       — Service worker: captures tab, calls Claude API
├── content.js          — Injected script: renders floating commentary overlay
├── popup.html          — Extension popup UI
└── popup.js            — Popup logic: start/stop, API key, status updates
```

---

## 🔒 Privacy & Security

- **No data is stored remotely** — your API key and video frames are only sent to `api.anthropic.com`
- **No analytics or tracking** of any kind
- **API key is stored locally** in Chrome's extension storage (`chrome.storage.local`) — it never leaves your browser except in API calls to Anthropic
- Video frames are captured in memory, used for a single API call, and immediately discarded — nothing is saved to disk

---

## 🤝 Contributing

Pull requests are welcome. Ideas for improvement:

- [ ] Score detection and dedicated score tracker overlay
- [ ] Support for multiple commentary languages
- [ ] Whisper-style audio commentary (text-to-speech output)
- [ ] Commentary history log / export
- [ ] Custom commentary style (formal / funny / Harsha Bhogle style)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for cricket fans | Powered by [Anthropic Claude](https://www.anthropic.com)*
