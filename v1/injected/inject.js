(function () {
	if (window.__pipPlus) return;
	window.__pipPlus = {};

	function findVideos() {
		return Array.from(document.querySelectorAll("video")).filter(
			(v) => v.readyState !== 0 || v.src || v.currentSrc
		);
	}

	window.__pipPlus.openFloatingPlayer = async function (index = 0) {
		const videos = findVideos();
		if (!videos.length) {
			alert("PiP+: No HTML5 <video> found on this page.");
			return;
		}
		const video = videos[index] || videos[0];

		try {
			let stream;
			if (typeof video.captureStream === "function") {
				stream = video.captureStream();
			} else if (typeof video.mozCaptureStream === "function") {
				stream = video.mozCaptureStream();
			} else {
				stream = null;
			}

			const w = window.open(
				"",
				"PiPPlusFloating",
				"width=640,height=400,menubar=0,toolbar=0,location=0,status=0"
			);
			if (!w) {
				alert("PiP+: Popup blocked. Please allow popups for this site.");
				return;
			}

			w.document.title = "PiP Plus";
			w.document.body.style.margin = "0";
			w.document.body.style.background = "#0a0a0a";
			w.document.body.style.fontFamily =
				"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
			w.document.body.innerHTML = `
				<style>
					* { box-sizing: border-box; margin: 0; padding: 0; }
					body { overflow: hidden; }
					#pip-wrap { 
						display: flex; 
						flex-direction: column; 
						height: 100vh; 
						background: #0a0a0a;
					}
					#video-container { 
						flex: 1; 
						display: flex; 
						align-items: center; 
						justify-content: center; 
						background: #000;
						position: relative;
					}
					#pip-video { 
						max-width: 100%; 
						max-height: 100%; 
						background: #000;
					}
					#controls { 
						padding: 16px; 
						background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%);
						backdrop-filter: blur(10px);
					}
					.control-row { 
						display: flex; 
						gap: 10px; 
						align-items: center; 
						margin-bottom: 12px;
					}
					.control-row:last-child { margin-bottom: 0; }
					button { 
						padding: 8px 14px; 
						border: none; 
						border-radius: 8px; 
						background: rgba(255,255,255,0.1); 
						color: #fff; 
						font-size: 13px; 
						cursor: pointer; 
						transition: all 0.2s;
						font-weight: 500;
						white-space: nowrap;
					}
					button:hover { 
						background: rgba(255,255,255,0.2); 
						transform: translateY(-1px);
					}
					button:active { 
						transform: translateY(0);
					}
					.btn-primary {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					}
					.btn-primary:hover {
						background: linear-gradient(135deg, #7c8ff0 0%, #8b5bb8 100%);
						box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
					}
					input[type="range"] { 
						flex: 1; 
						height: 6px; 
						border-radius: 3px; 
						background: rgba(255,255,255,0.1);
						outline: none;
						-webkit-appearance: none;
					}
					input[type="range"]::-webkit-slider-thumb {
						-webkit-appearance: none;
						width: 14px;
						height: 14px;
						border-radius: 50%;
						background: #667eea;
						cursor: pointer;
						transition: all 0.2s;
					}
					input[type="range"]::-webkit-slider-thumb:hover {
						background: #7c8ff0;
						transform: scale(1.2);
					}
					input[type="range"]::-moz-range-thumb {
						width: 14px;
						height: 14px;
						border-radius: 50%;
						background: #667eea;
						border: none;
						cursor: pointer;
					}
					#time { 
						min-width: 90px; 
						text-align: right; 
						font-size: 12px; 
						color: rgba(255,255,255,0.8);
						font-variant-numeric: tabular-nums;
					}
					label { 
						display: flex; 
						gap: 8px; 
						align-items: center; 
						color: rgba(255,255,255,0.9); 
						font-size: 13px;
						font-weight: 500;
					}
					select { 
						padding: 6px 10px; 
						border: none; 
						border-radius: 6px; 
						background: rgba(255,255,255,0.1); 
						color: #fff; 
						font-size: 13px;
						cursor: pointer;
						outline: none;
					}
					select:hover {
						background: rgba(255,255,255,0.15);
					}
					input[type="checkbox"] { 
						width: 16px; 
						height: 16px; 
						cursor: pointer;
						accent-color: #667eea;
					}
					#close-btn { 
						margin-left: auto; 
						background: rgba(239, 68, 68, 0.2);
						color: #fca5a5;
					}
					#close-btn:hover { 
						background: rgba(239, 68, 68, 0.3);
						color: #fff;
					}
					.icon { font-size: 14px; }
				</style>
				<div id="pip-wrap">
					<div id="video-container">
						<video id="pip-video" playsinline></video>
					</div>
					<div id="controls">
						<div class="control-row">
							<button id="btn-rev" title="-10s"><span class="icon">⏪</span> 10s</button>
							<button id="btn-play" class="btn-primary" title="Play/Pause"><span class="icon">▶</span></button>
							<button id="btn-fwd" title="+10s">10s <span class="icon">⏩</span></button>
							<input id="seek" type="range" min="0" max="1000" value="0">
							<span id="time">0:00 / 0:00</span>
						</div>
						<div class="control-row">
							<label title="Volume">
								<span class="icon">🔊</span>
								<input id="vol" type="range" min="0" max="1" step="0.01" value="1" style="width:80px">
							</label>
							<button id="mute">Mute</button>
							<label>
								<span class="icon">⚡</span>
								<select id="speed">
									<option value="0.25">0.25×</option>
									<option value="0.5">0.5×</option>
									<option value="0.75">0.75×</option>
									<option value="1" selected>1×</option>
									<option value="1.25">1.25×</option>
									<option value="1.5">1.5×</option>
									<option value="2">2×</option>
								</select>
							</label>
							<button id="frame-back" title="Previous frame">◀ Frame</button>
							<button id="frame-fwd" title="Next frame">Frame ▶</button>
							<label><input id="loop" type="checkbox"> Loop</label>
							<button id="native-pip">Native PiP</button>
							<button id="close-btn">✕ Close</button>
						</div>
					</div>
				</div>`;

			const pipDoc = w.document;
			const pipVideo = pipDoc.getElementById("pip-video");
			const btnPlay = pipDoc.getElementById("btn-play");
			const btnRev = pipDoc.getElementById("btn-rev");
			const btnFwd = pipDoc.getElementById("btn-fwd");
			const seek = pipDoc.getElementById("seek");
			const timeLabel = pipDoc.getElementById("time");
			const vol = pipDoc.getElementById("vol");
			const muteBtn = pipDoc.getElementById("mute");
			const speed = pipDoc.getElementById("speed");
			const frameBack = pipDoc.getElementById("frame-back");
			const frameFwd = pipDoc.getElementById("frame-fwd");
			const loopChk = pipDoc.getElementById("loop");
			const nativePiPBtn = pipDoc.getElementById("native-pip");
			const closeBtn = pipDoc.getElementById("close-btn");

			if (stream) {
				try {
					pipVideo.srcObject = stream;
					pipVideo.muted = false;
					await pipVideo.play().catch(() => {});
				} catch (e) {
					console.warn("PiP+: Cannot use captureStream:", e);
				}
			} else {
				try {
					pipVideo.src = video.currentSrc || video.src;
					pipVideo.currentTime = video.currentTime;
					if (!video.paused) await pipVideo.play().catch(() => {});
				} catch (e) {
					console.warn("PiP+: fallback playback failed:", e);
				}
			}

			function formatTime(s) {
				if (!isFinite(s)) return "0:00";
				const total = Math.floor(s);
				const hh = Math.floor(total / 3600);
				const mm = Math.floor((total % 3600) / 60);
				const ss = total % 60;
				return (
					(hh ? String(hh).padStart(2, "0") + ":" : "") +
					String(mm).padStart(1, "0") +
					":" +
					String(ss).padStart(2, "0")
				);
			}

			function updateFromOriginal() {
				try {
					const cur = video.currentTime || 0;
					const dur = video.duration || 0;
					if (isFinite(dur) && dur > 0) {
						seek.value = (cur / dur) * 1000;
						timeLabel.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
					} else {
						seek.value = 0;
						timeLabel.textContent = `${formatTime(cur)} / 0:00`;
					}

					btnPlay.innerHTML = video.paused
						? '<span class="icon">▶</span>'
						: '<span class="icon">❚❚</span>';
					vol.value = video.volume ?? 1;
					muteBtn.textContent = video.muted ? "Unmute" : "Mute";
					speed.value = video.playbackRate ?? 1;
					loopChk.checked = !!video.loop;

					if (!stream) {
						pipVideo.currentTime = video.currentTime;
						if (video.paused && !pipVideo.paused) pipVideo.pause();
						if (!video.paused && pipVideo.paused)
							pipVideo.play().catch(() => {});
					}
				} catch (e) {
					console.warn("PiP+: update failed", e);
				}
			}

			const tick = setInterval(updateFromOriginal, 200);

			btnPlay.addEventListener("click", () => {
				if (video.paused) video.play().catch(() => {});
				else video.pause();
				updateFromOriginal();
			});

			btnRev.addEventListener("click", () => {
				video.currentTime = Math.max(0, (video.currentTime || 0) - 10);
				updateFromOriginal();
			});

			btnFwd.addEventListener("click", () => {
				if (video.duration)
					video.currentTime = Math.min(
						video.duration,
						(video.currentTime || 0) + 10
					);
				updateFromOriginal();
			});

			seek.addEventListener("input", () => {
				if (!video.duration || !isFinite(video.duration)) return;
				video.currentTime = (seek.value / 1000) * video.duration;
				updateFromOriginal();
			});

			vol.addEventListener("input", () => {
				video.volume = parseFloat(vol.value);
				video.muted = false;
				updateFromOriginal();
			});

			muteBtn.addEventListener("click", () => {
				video.muted = !video.muted;
				updateFromOriginal();
			});

			speed.addEventListener("change", () => {
				video.playbackRate = parseFloat(speed.value);
				updateFromOriginal();
			});

			frameBack.addEventListener("click", () => {
				const step = 1 / 30;
				video.currentTime = Math.max(0, (video.currentTime || 0) - step);
				updateFromOriginal();
			});

			frameFwd.addEventListener("click", () => {
				const step = 1 / 30;
				video.currentTime = Math.min(
					video.duration || Infinity,
					(video.currentTime || 0) + step
				);
				updateFromOriginal();
			});

			loopChk.addEventListener("change", () => {
				video.loop = !!loopChk.checked;
				updateFromOriginal();
			});

			nativePiPBtn.addEventListener("click", async () => {
				try {
					await video.requestPictureInPicture();
				} catch (e) {
					alert("Native PiP failed: " + (e?.message || e));
				}
			});

			closeBtn.addEventListener("click", () => {
				clearInterval(tick);
				w.close();
			});

			const origEvents = [
				"play",
				"pause",
				"ratechange",
				"volumechange",
				"timeupdate",
				"durationchange",
				"loadedmetadata",
			];
			origEvents.forEach((ev) =>
				video.addEventListener(ev, updateFromOriginal)
			);

			w.addEventListener("beforeunload", () => {
				origEvents.forEach((ev) =>
					video.removeEventListener(ev, updateFromOriginal)
				);
				clearInterval(tick);
			});

			pipVideo.addEventListener("click", () => {
				if (video.paused) video.play().catch(() => {});
				else video.pause();
				updateFromOriginal();
			});

			w.addEventListener("keydown", (e) => {
				if (e.key === " ") {
					e.preventDefault();
					if (video.paused) video.play().catch(() => {});
					else video.pause();
					updateFromOriginal();
				}
				if (e.key === "ArrowRight") {
					video.currentTime = Math.min(
						video.duration || Infinity,
						(video.currentTime || 0) + 5
					);
					updateFromOriginal();
				}
				if (e.key === "ArrowLeft") {
					video.currentTime = Math.max(0, (video.currentTime || 0) - 5);
					updateFromOriginal();
				}
				if (e.key === "f") {
					if (document.fullscreenElement)
						document.exitFullscreen().catch(() => {});
					else video.requestFullscreen?.().catch(() => {});
				}
			});

			pipDoc.body.tabIndex = 0;
			pipDoc.body.focus();
			updateFromOriginal();
		} catch (err) {
			console.error("PiP+: error creating floating player", err);
			alert("PiP+: Error: " + err);
		}
	};

	window.__pipPlus.openChooser = function () {
		const vids = findVideos();
		if (!vids.length) {
			alert("No videos found");
			return;
		}
		let list = "Choose video index (0-" + (vids.length - 1) + "):\n\n";
		vids.forEach((v, i) => {
			const src = v.currentSrc || v.src || "<no src>";
			list +=
				i + ": " + (src.length > 120 ? src.slice(0, 120) + "..." : src) + "\n";
		});
		const idx = parseInt(prompt(list, "0"));
		if (!isNaN(idx) && idx >= 0 && idx < vids.length) {
			window.__pipPlus.openFloatingPlayer(idx);
		}
	};

	document.addEventListener(
		"keydown",
		(e) => {
			if (e.shiftKey && e.altKey && e.code === "KeyP") {
				e.preventDefault();
				window.__pipPlus.openFloatingPlayer(0);
			}
		},
		false
	);

	console.info(
		"PiP+ loaded. Hotkey: Shift+Alt+P or use window.__pipPlus.openFloatingPlayer()"
	);
})();
