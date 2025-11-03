// content.js
(() => {
	// Don't inject twice
	if (window.__pip_plus_injected) return;
	window.__pip_plus_injected = true;

	const script = document.createElement("script");
	script.setAttribute("type", "module");
	script.textContent = `

/* ---- BEGIN injected page script (pip-plus) ---- */
(function(){
  if (window.__pipPlus) return;
  window.__pipPlus = {};

  function findVideos() {
    return Array.from(document.querySelectorAll('video')).filter(v => v.readyState !== 0 || v.src || v.currentSrc);
  }

  // Create a floating player for a chosen video (index 0 by default)
  window.__pipPlus.openFloatingPlayer = async function(index = 0) {
    const videos = findVideos();
    if (!videos.length) {
      alert("PiP+: No HTML5 <video> found on this page.");
      return;
    }
    const video = videos[index] || videos[0];

    // Some pages use shadow DOM; we attempt to get the real video element reference through the node we found.
    try {
      // Try to get a MediaStream from the video
      let stream;
      if (typeof video.captureStream === 'function') {
        stream = video.captureStream();
      } else if (typeof video.mozCaptureStream === 'function') {
        stream = video.mozCaptureStream();
      } else {
        // As fallback, try cloning the video element and using its src
        stream = null;
      }

      // Open a small popup window (same origin) so we can set srcObject on its video
      const w = window.open('', 'PiPPlusFloating', 'width=480,height=270,menubar=0,toolbar=0,location=0,status=0');
      if (!w) {
        alert("PiP+: Popup blocked. Please allow popups for this site.");
        return;
      }

      // Build the floating player's HTML
      w.document.title = "PiP+";
      w.document.body.style.margin = '0';
      w.document.body.style.background = '#111';
      w.document.body.style.color = '#fff';
      w.document.body.style.fontFamily = 'system-ui, Arial, sans-serif';
      w.document.body.innerHTML = \`
        <div id="pip-wrap" style="display:flex;flex-direction:column;height:100vh;">
          <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;">
            <video id="pip-video" playsinline style="max-width:100%;max-height:100%;background:#000"></video>
          </div>
          <div style="padding:6px;box-sizing:border-box;background:linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.6));">
            <div style="display:flex;gap:8px;align-items:center;">
              <button id="btn-rev" title="-10s">⏪ -10s</button>
              <button id="btn-play" title="Play/Pause">▶/❚❚</button>
              <button id="btn-fwd" title="+10s">+10s ⏩</button>
              <input id="seek" type="range" min="0" max="100" value="0" style="flex:1;">
              <span id="time" style="min-width:75px;text-align:right;font-size:12px;">0:00 / 0:00</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
              <label style="display:flex;gap:6px;align-items:center">
                🔊 <input id="vol" type="range" min="0" max="1" step="0.01" value="1">
              </label>
              <button id="mute">Mute</button>
              <label>Speed:
                <select id="speed">
                  <option value="0.25">0.25x</option>
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1" selected>1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </label>
              <button id="frame-back">◀ frame</button>
              <button id="frame-fwd">frame ▶</button>
              <label><input id="loop" type="checkbox"> Loop</label>
              <button id="native-pip">Native PiP</button>
              <button id="close-btn" style="margin-left:auto">✕</button>
            </div>
          </div>
        </div>\`;

      const pipDoc = w.document;
      const pipVideo = pipDoc.getElementById('pip-video');
      const btnPlay = pipDoc.getElementById('btn-play');
      const btnRev = pipDoc.getElementById('btn-rev');
      const btnFwd = pipDoc.getElementById('btn-fwd');
      const seek = pipDoc.getElementById('seek');
      const timeLabel = pipDoc.getElementById('time');
      const vol = pipDoc.getElementById('vol');
      const muteBtn = pipDoc.getElementById('mute');
      const speed = pipDoc.getElementById('speed');
      const frameBack = pipDoc.getElementById('frame-back');
      const frameFwd = pipDoc.getElementById('frame-fwd');
      const loopChk = pipDoc.getElementById('loop');
      const nativePiPBtn = pipDoc.getElementById('native-pip');
      const closeBtn = pipDoc.getElementById('close-btn');

      // If we have a capture stream, attach it to the floating video
      if (stream) {
        try {
          pipVideo.srcObject = stream;
          // ensure pipVideo plays automatically
          pipVideo.muted = true; // avoid autoplay block
          await pipVideo.play().catch(()=>{});
        } catch (e) {
          console.warn("PiP+: Cannot use captureStream on this video:", e);
        }
      } else {
        // fallback: set src to currentSrc and attempt to sync playback
        try {
          pipVideo.src = video.currentSrc || video.src;
          await pipVideo.play().catch(()=>{});
        } catch (e) {
          console.warn("PiP+: fallback playback failed:", e);
        }
      }

      // Sync controls: actions in popup -> original video
      function syncFromPopup() {
        // play/pause handled explicitly
        video.volume = pipVideo.volume;
        video.muted = pipVideo.muted;
        video.playbackRate = pipVideo.playbackRate;
        video.loop = pipVideo.loop;
        // If pipVideo has own currentTime (fallback mode) set original; otherwise set both
        if (!stream) {
          video.currentTime = pipVideo.currentTime;
        }
      }

      // Update seekbar and time label from original video
      function formatTime(s) {
        if (!isFinite(s)) return "0:00";
        const total = Math.floor(s);
        const hh = Math.floor(total / 3600);
        const mm = Math.floor((total % 3600) / 60);
        const ss = total % 60;
        return (hh ? String(hh).padStart(2,'0') + ':' : '') + String(mm).padStart(1,'0') + ':' + String(ss).padStart(2,'0');
      }

      function updateFromOriginal() {
        try {
          const cur = video.currentTime || 0;
          const dur = video.duration || 0;
          if (isFinite(dur) && dur > 0) {
            seek.max = 1000;
            seek.value = (cur / dur) * 1000;
            timeLabel.textContent = \`\${formatTime(cur)} / \${formatTime(dur)}\`;
          } else {
            seek.value = 0;
            timeLabel.textContent = \`\${formatTime(cur)} / 0:00\`;
          }
          // reflect play/pause
          if (video.paused) {
            btnPlay.textContent = "▶";
          } else {
            btnPlay.textContent = "❚❚";
          }
          // reflect volume
          vol.value = video.volume ?? 1;
          muteBtn.textContent = video.muted ? "Unmute" : "Mute";
          speed.value = video.playbackRate ?? 1;
          loopChk.checked = !!video.loop;
        } catch (e) {
          console.warn("PiP+: updateFromOriginal failed", e);
        }
      }

      // Keep updating regularly (timeupdate event may be throttled in background)
      const tick = setInterval(updateFromOriginal, 200);

      // Click handlers - operate on the original video (main source of truth)
      btnPlay.addEventListener('click', () => {
        if (video.paused) video.play().catch(()=>{});
        else video.pause();
        updateFromOriginal();
      });
      btnRev.addEventListener('click', () => {
        video.currentTime = Math.max(0, (video.currentTime || 0) - 10);
        updateFromOriginal();
      });
      btnFwd.addEventListener('click', () => {
        if (video.duration) video.currentTime = Math.min(video.duration, (video.currentTime || 0) + 10);
        updateFromOriginal();
      });
      seek.addEventListener('input', () => {
        if (!video.duration || !isFinite(video.duration)) return;
        const pct = seek.value / seek.max;
        video.currentTime = pct * video.duration;
        updateFromOriginal();
      });
      vol.addEventListener('input', () => {
        video.volume = parseFloat(vol.value);
        video.muted = false;
        updateFromOriginal();
      });
      muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateFromOriginal();
      });
      speed.addEventListener('change', () => {
        video.playbackRate = parseFloat(speed.value);
        updateFromOriginal();
      });
      frameBack.addEventListener('click', () => {
        // Attempt a frame step by subtracting 1/30 s (best-effort)
        const step = 1 / (video.frameRate || 30);
        video.currentTime = Math.max(0, (video.currentTime || 0) - step);
        updateFromOriginal();
      });
      frameFwd.addEventListener('click', () => {
        const step = 1 / (video.frameRate || 30);
        video.currentTime = Math.min(video.duration || Infinity, (video.currentTime || 0) + step);
        updateFromOriginal();
      });
      loopChk.addEventListener('change', () => {
        video.loop = !!loopChk.checked;
        updateFromOriginal();
      });
      nativePiPBtn.addEventListener('click', async () => {
        try {
          await video.requestPictureInPicture();
        } catch (e) {
          alert("Native PiP failed: " + (e && e.message ? e.message : e));
        }
      });
      closeBtn.addEventListener('click', () => {
        clearInterval(tick);
        try { w.close(); } catch(e){ }
      });

      // When original video changes (timeupdate), if using captureStream, pipVideo will already reflect it.
      // But we still want to reflect play/pause and other states:
      const origEvents = ['play','pause','ratechange','volumechange','timeupdate','durationchange','loadedmetadata'];
      origEvents.forEach(ev => video.addEventListener(ev, updateFromOriginal));

      // When popup unloads, remove listeners
      w.addEventListener('beforeunload', () => {
        origEvents.forEach(ev => video.removeEventListener(ev, updateFromOriginal));
        clearInterval(tick);
      });

      // Also support clicking the video inside the popup to toggle play/pause on original
      pipVideo.addEventListener('click', () => {
        if (video.paused) video.play().catch(()=>{});
        else video.pause();
        updateFromOriginal();
      });

      // Keyboard shortcuts inside popup
      w.addEventListener('keydown', (e) => {
        if (e.key === ' '){ e.preventDefault(); if (video.paused) video.play().catch(()=>{}); else video.pause(); updateFromOriginal(); }
        if (e.key === 'ArrowRight') { video.currentTime = Math.min(video.duration||Infinity, (video.currentTime||0)+5); updateFromOriginal(); }
        if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, (video.currentTime||0)-5); updateFromOriginal(); }
        if (e.key === 'f') { // toggle fullscreen of original video
          if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
          else video.requestFullscreen?.().catch(()=>{});
        }
      });

      // Give control focus so keys work
      pipDoc.body.tabIndex = 0;
      pipDoc.body.focus();

    } catch (err) {
      console.error("PiP+: error creating floating player", err);
      alert("PiP+: Error creating floating player: " + err);
    }
  };

  // For convenience: expose a function to pick a video index when there are multiple
  window.__pipPlus.openChooser = function() {
    const vids = Array.from(document.querySelectorAll('video'));
    if (!vids.length) { alert("No videos found"); return; }
    let list = "Choose a video index to open in PiP+ (0.." + (vids.length-1) + "):\\n\\n";
    vids.forEach((v,i) => {
      const src = v.currentSrc || v.src || "<no src>";
      list += i + ": " + (src.length>120 ? src.slice(0,120)+"..." : src) + "\\n";
    });
    const idx = parseInt(prompt(list, "0"));
    if (!isNaN(idx) && idx >= 0 && idx < vids.length) {
      window.__pipPlus.openFloatingPlayer(idx);
    }
  };

  // Auto-register a keyboard shortcut (Shift+Alt+P) inside the page to open the first video
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.altKey && e.code === 'KeyP') {
      window.__pipPlus.openFloatingPlayer(0);
    }
  }, false);

  // Expose a global for quick console testing:
  console.info("PiP+ injected. Use window.__pipPlus.openFloatingPlayer() or openChooser(). Hotkey: Shift+Alt+P");
})();
/* ---- END injected page script (pip-plus) ---- */
`;
	document.documentElement.appendChild(script);
})();
