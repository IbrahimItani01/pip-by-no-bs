function showStatus(message) {
	const status = document.getElementById("status");
	status.textContent = message;
	status.classList.add("show");
	setTimeout(() => status.classList.remove("show"), 2000);
}

async function executeInPage(func) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if (!tab || !tab.id) {
		throw new Error("No active tab found");
	}

	// Inject the script and wait for result
	const results = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: func,
		world: "MAIN",
	});

	return results;
}

document.getElementById("pipBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			// Find all video elements, including in iframes
			let videos = Array.from(document.querySelectorAll("video"));

			// Also check iframes (for embedded videos like YouTube)
			const iframes = document.querySelectorAll("iframe");
			iframes.forEach((iframe) => {
				try {
					const iframeVideos =
						iframe.contentDocument?.querySelectorAll("video");
					if (iframeVideos) {
						videos.push(...Array.from(iframeVideos));
					}
				} catch (e) {
					// Cross-origin iframe, can't access
				}
			});

			// Find the first visible and playing video
			let video = videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0);

			if (!video && videos.length > 0) {
				video = videos[0]; // Fallback to first video
			}

			if (video) {
				if (document.pictureInPictureElement) {
					document.exitPictureInPicture();
					return "PiP exited";
				} else {
					video.requestPictureInPicture().catch((err) => {
						throw new Error("PiP not supported or blocked: " + err.message);
					});
					return "PiP activated";
				}
			} else {
				return "No video found on page";
			}
		});

		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("rewindBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.max(0, video.currentTime - 10);
				return "Rewound 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("forwardBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.min(video.duration, video.currentTime + 10);
				return "Forwarded 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});
function showStatus(message) {
	const status = document.getElementById("status");
	status.textContent = message;
	status.classList.add("show");
	setTimeout(() => status.classList.remove("show"), 2000);
}

async function executeInPage(func) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if (!tab || !tab.id) {
		throw new Error("No active tab found");
	}

	// Inject the script and wait for result
	const results = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: func,
		world: "MAIN",
	});

	return results;
}

document.getElementById("pipBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			// Find all video elements, including in iframes
			let videos = Array.from(document.querySelectorAll("video"));

			// Also check iframes (for embedded videos like YouTube)
			const iframes = document.querySelectorAll("iframe");
			iframes.forEach((iframe) => {
				try {
					const iframeVideos =
						iframe.contentDocument?.querySelectorAll("video");
					if (iframeVideos) {
						videos.push(...Array.from(iframeVideos));
					}
				} catch (e) {
					// Cross-origin iframe, can't access
				}
			});

			// Find the first visible and playing video
			let video = videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0);

			if (!video && videos.length > 0) {
				video = videos[0]; // Fallback to first video
			}

			if (video) {
				if (document.pictureInPictureElement) {
					document.exitPictureInPicture();
					return "PiP exited";
				} else {
					video.requestPictureInPicture().catch((err) => {
						throw new Error("PiP not supported or blocked: " + err.message);
					});
					return "PiP activated";
				}
			} else {
				return "No video found on page";
			}
		});

		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("rewindBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.max(0, video.currentTime - 10);
				return "Rewound 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("forwardBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.min(video.duration, video.currentTime + 10);
				return "Forwarded 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});
function showStatus(message) {
	const status = document.getElementById("status");
	status.textContent = message;
	status.classList.add("show");
	setTimeout(() => status.classList.remove("show"), 2000);
}

async function executeInPage(func) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if (!tab || !tab.id) {
		throw new Error("No active tab found");
	}

	// Inject the script and wait for result
	const results = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: func,
		world: "MAIN",
	});

	return results;
}

document.getElementById("pipBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			// Find all video elements, including in iframes
			let videos = Array.from(document.querySelectorAll("video"));

			// Also check iframes (for embedded videos like YouTube)
			const iframes = document.querySelectorAll("iframe");
			iframes.forEach((iframe) => {
				try {
					const iframeVideos =
						iframe.contentDocument?.querySelectorAll("video");
					if (iframeVideos) {
						videos.push(...Array.from(iframeVideos));
					}
				} catch (e) {
					// Cross-origin iframe, can't access
				}
			});

			// Find the first visible and playing video
			let video = videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0);

			if (!video && videos.length > 0) {
				video = videos[0]; // Fallback to first video
			}

			if (video) {
				if (document.pictureInPictureElement) {
					document.exitPictureInPicture();
					return "PiP exited";
				} else {
					video.requestPictureInPicture().catch((err) => {
						throw new Error("PiP not supported or blocked: " + err.message);
					});
					return "PiP activated";
				}
			} else {
				return "No video found on page";
			}
		});

		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("rewindBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.max(0, video.currentTime - 10);
				return "Rewound 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});

document.getElementById("forwardBtn").addEventListener("click", async () => {
	try {
		const results = await executeInPage(() => {
			let videos = Array.from(document.querySelectorAll("video"));
			let video =
				videos.find((v) => v.offsetWidth > 0 && v.offsetHeight > 0) ||
				videos[0];

			if (video) {
				video.currentTime = Math.min(video.duration, video.currentTime + 10);
				return "Forwarded 10 seconds";
			}
			return "No video found";
		});
		showStatus(results[0].result);
	} catch (err) {
		showStatus("Error: " + err.message);
		console.error(err);
	}
});
