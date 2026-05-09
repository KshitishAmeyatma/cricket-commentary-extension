// content.js — injected into every page
// Creates and manages the floating commentary overlay

(function () {
  // Prevent double-injection
  if (window.__cricketCommentaryLoaded) return;
  window.__cricketCommentaryLoaded = true;

  let overlay    = null;
  let textEl     = null;
  let fadeTimer  = null;

  // ── Build overlay ────────────────────────────────────────────────────────
  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = '__cricket-commentary-overlay';
    Object.assign(overlay.style, {
      position:        'fixed',
      bottom:          '24px',
      left:            '50%',
      transform:       'translateX(-50%)',
      zIndex:          '2147483647',
      background:      'rgba(0, 0, 0, 0.82)',
      color:           '#fff',
      fontFamily:      "'Segoe UI', Arial, sans-serif",
      fontSize:        '15px',
      lineHeight:      '1.5',
      padding:         '12px 20px',
      borderRadius:    '10px',
      maxWidth:        '720px',
      minWidth:        '260px',
      textAlign:       'center',
      boxShadow:       '0 4px 24px rgba(0,0,0,0.5)',
      borderLeft:      '4px solid #00d4aa',
      transition:      'opacity 0.4s ease',
      opacity:         '0',
      pointerEvents:   'none',
      backdropFilter:  'blur(4px)',
      webkitBackdropFilter: 'blur(4px)'
    });

    // Mic icon + text
    const icon = document.createElement('span');
    icon.textContent = '🎙 ';
    icon.style.fontSize = '16px';

    textEl = document.createElement('span');
    textEl.textContent = '';

    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ✕';
    Object.assign(closeBtn.style, {
      marginLeft:  '12px',
      cursor:      'pointer',
      opacity:     '0.6',
      fontSize:    '12px',
      pointerEvents: 'auto'
    });
    closeBtn.addEventListener('click', hideOverlay);

    overlay.appendChild(icon);
    overlay.appendChild(textEl);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
  }

  // ── Show commentary text ─────────────────────────────────────────────────
  function showCommentary(text) {
    createOverlay();

    textEl.textContent = text;
    overlay.style.opacity = '1';

    // Auto-fade after 12 seconds (longer than capture interval so it stays visible)
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      overlay.style.opacity = '0';
    }, 12000);
  }

  // ── Hide overlay ─────────────────────────────────────────────────────────
  function hideOverlay() {
    if (overlay) {
      overlay.style.opacity = '0';
      if (fadeTimer) clearTimeout(fadeTimer);
    }
  }

  // ── Message listener ─────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'SHOW_COMMENTARY') showCommentary(msg.text);
    if (msg.action === 'HIDE_OVERLAY')    hideOverlay();
  });

})();
