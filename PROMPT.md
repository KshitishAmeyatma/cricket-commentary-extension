# 🏏 Cricket Live Commentary Extension — Full Build Prompt

> This is the exact prompt used to build the **Cricket Live Commentary Chrome Extension** using Claude Code.  
> Paste this into a Claude session (with MCP or Claude Code in VS Code) to recreate or extend the project from scratch.

---

## 💳 Claude Plan Requirements

### To BUILD this project (what you need as a developer)

| What you need | Minimum plan | Recommended |
|---|---|---|
| Chat with Claude to design & write code | **Claude.ai Pro** ($20/month) | ✅ Sufficient |
| Claude Code CLI in VS Code | **Claude.ai Pro** ($20/month) | ✅ Sufficient |
| Claude API for the extension itself (runtime) | **Anthropic API** (pay-as-you-go) | ✅ Separate billing |

### To RUN this extension (what end users need)

| Feature | Plan needed | Cost estimate |
|---|---|---|
| Basic commentary (claude-haiku-3) | Anthropic API free tier | ~$0.10/hr |
| Good commentary (claude-sonnet-4-6) | Anthropic API pay-as-you-go | ~$1.50/hr |
| Best commentary (claude-opus-4-7) | Anthropic API pay-as-you-go | ~$8–12/hr |

> **Important:** The Claude.ai Pro subscription ($20/month on claude.ai) is **separate** from the Anthropic API.  
> The extension uses the **API** directly — you need an API key from [console.anthropic.com](https://console.anthropic.com), not a claude.ai subscription.  
> API is **pay-as-you-go** — no monthly fee, you only pay per call.

### For building with Claude Code + VS Code (personal laptop setup)

**Recommended individual setup:**
1. **Claude.ai Pro** — $20/month — gives you Claude Code CLI + unlimited(ish) chat for coding sessions
2. **Anthropic API** — separate account at console.anthropic.com — set a $10/month spending limit to start

> Claude Code CLI (the VS Code extension) uses your **claude.ai Pro** subscription, not API credits.  
> The runtime extension API calls use your **Anthropic API** credits.  
> These are two separate things billed separately.

---

## 🧠 The Full Build Prompt

Copy everything below this line and paste it into Claude Code (VS Code) or a Claude chat session:

---

```
You are an expert Chrome Extension developer and AI integration engineer.

Build me a complete Chrome Extension (Manifest V3) that:

1. Captures live video from the currently active browser tab
2. Samples a frame every N seconds (user-configurable, default 4 seconds)
3. Sends the frame as a base64 JPEG image to the Anthropic Claude Vision API
4. Displays the AI-generated cricket commentary as a floating overlay on the browser page
5. Has a clean popup UI to enter the API key, set the interval, and start/stop

### Technical Requirements

**Files to create:**
- manifest.json (MV3, permissions: tabCapture, activeTab, scripting, storage)
- background.js (service worker — handles capture, API calls, messaging)
- content.js (injected script — renders floating overlay on page)
- popup.html (start/stop UI with API key input)
- popup.js (popup logic)

**Capture flow:**
- Use chrome.tabCapture.capture({ video: true, audio: false }) to get a MediaStream
- Draw to an offscreen <canvas> every N seconds
- Export as JPEG base64 at 0.75 quality, max width 1280px
- Send to https://api.anthropic.com/v1/messages

**Claude API call spec:**
- Model: claude-sonnet-4-6
- Max tokens: 120
- Message: one user message with image (base64 JPEG) + text prompt
- Headers: x-api-key, anthropic-version: 2023-06-01, content-type: application/json

**System prompt for Claude (cricket commentator):**
"""
You are an expert cricket commentator with deep knowledge of the game.
You are watching a live cricket match on screen.
Your job: look at this single frame and write 1-2 sharp, exciting commentary sentences about what you can see.
Focus on: the ball, the batsman's shot or stance, fielding positions, scoreboard if visible, player names if visible.
Be specific — mention the shot played, the bowler's action, or the field setting.
If it is a replay, say so.
If you cannot clearly see cricket, say "Waiting for the action..."
Keep it punchy and broadcast-style. No bullet points. Plain text only.
"""

**Overlay design (content.js):**
- Fixed position, bottom center of screen
- Dark semi-transparent background (rgba 0,0,0,0.82)
- White text, 15px Segoe UI
- Left border accent: #00d4aa (teal)
- Mic emoji prefix 🎙
- Auto-fades after 12 seconds
- Close button (✕) to dismiss manually
- Smooth opacity transition

**Popup UI design:**
- Dark theme (background #1a1a2e)
- Teal accent colour #00d4aa
- Password input for API key (saved to chrome.storage.local)
- Number input for interval (2–15 seconds)
- Start button (green) / Stop button (red)
- Live pulsing red dot indicator when running
- Status text showing last commentary snippet

**Messaging architecture:**
- popup → background: { action: 'START', apiKey, interval } / { action: 'STOP' }
- background → content: { action: 'SHOW_COMMENTARY', text } / { action: 'HIDE_OVERLAY' }
- background → popup: { action: 'COMMENTARY_UPDATE', text } / { action: 'ERROR', text }

**Error handling:**
- API 401: show "Invalid API key" in popup status
- API 429: show "Rate limit hit — increase interval"
- Network error: show error message, keep running
- Tab capture failure: show error in popup, do not crash

**Security:**
- API key stored only in chrome.storage.local
- Only sent to api.anthropic.com
- No analytics, no external calls except Anthropic API

### Deliverables
Produce all 5 files complete and ready to load as an unpacked Chrome extension.
No placeholders. Every file must be fully functional.
```

---

## 🔧 Extension to Extend — Follow-up Prompts

Once the base extension is built, use these follow-up prompts to add features:

### Add score detection
```
Extend the Cricket Live Commentary extension to detect and track the scoreboard.
Add a persistent score ticker at the top of the screen that updates whenever
the AI detects a score in the frame. Parse patterns like "145/3 (18.2 ov)" from
the commentary text and display it in a separate fixed overlay at the top-right.
```

### Add text-to-speech audio commentary
```
Add text-to-speech to the Cricket Live Commentary extension.
After displaying the overlay text, also speak it aloud using the Web Speech API
(window.speechSynthesis). Add a mute/unmute toggle button to the popup.
Use a British English voice if available (for authentic commentary feel).
```

### Add commentary history log
```
Add a commentary history panel to the Cricket Live Commentary extension.
Store the last 20 commentary lines with timestamps in chrome.storage.local.
Add a "History" button to the popup that opens a scrollable list of all
commentary from the current session. Add a "Copy all" button to copy the
log to clipboard.
```

### Change commentary style
```
Modify the Cricket Live Commentary extension to support multiple commentary styles.
Add a dropdown to the popup with these options:
1. Classic Broadcast (current)
2. Harsha Bhogle style (analytical, poetic, builds context)
3. Excitable T20 (over the top, lots of caps, emojis)
4. Statistical (focus on numbers, wagon wheel, run rate)
Each style should use a different system prompt sent to Claude.
```

### Make it work for any sport
```
Generalise the Cricket Live Commentary extension to support multiple sports.
Add a sport selector dropdown to the popup: Cricket / Football / Tennis / Basketball / Formula 1.
Each sport should have its own system prompt that instructs Claude to commentate
in the correct style and terminology for that sport.
```

---

## 📁 Project Structure Built

```
cricket-commentary-extension/
├── manifest.json       — MV3 config, permissions declaration
├── background.js       — Service worker: tab capture + Claude API calls
├── content.js          — Page overlay: floating commentary bar
├── popup.html          — Extension popup UI
├── popup.js            — Popup logic: controls + status updates
└── README.md           — Full usage guide
```

---

## 🔗 Repository

**GitHub:** [https://github.com/KshitishAmeyatma/cricket-commentary-extension](https://github.com/KshitishAmeyatma/cricket-commentary-extension)

---

## 💡 Personal Laptop Setup Recommendation

For building projects like this on your **personal laptop** using Claude Code + VS Code:

| Plan | Cost | What you get | Good for |
|---|---|---|---|
| **Claude.ai Pro** | $20/month | Claude Code CLI, Claude Sonnet + Opus in chat, 5x more usage than free | ✅ Best for daily coding with Claude Code in VS Code |
| **Anthropic API** | Pay-as-you-go | Direct API access for your apps/extensions at runtime | ✅ Needed separately for apps that call the API |
| **Claude.ai Free** | $0 | Limited Claude Code usage, slower models | ❌ Not enough for serious development |
| **Claude Max** | $100/month | 5x more Claude Code usage than Pro | Only if you hit Pro limits heavily |

**Recommended starter combo for personal use:**
- ✅ **Claude.ai Pro ($20/month)** — for Claude Code in VS Code + coding sessions
- ✅ **Anthropic API account** — set $10 spending limit, pay-as-you-go for runtime API calls
- Total: ~$20–30/month to start

> Claude Code CLI authenticates via your **claude.ai Pro** account — install it with `npm install -g @anthropic-ai/claude-code` and run `claude` in your VS Code terminal.

---

*Built with Claude Code | Anthropic Claude Vision API | Chrome Extension MV3*
