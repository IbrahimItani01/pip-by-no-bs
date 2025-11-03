// content.js
(() => {
	if (window.__pip_plus_injected) return;
	window.__pip_plus_injected = true;

	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("injected/inject.js");
	(document.head || document.documentElement).appendChild(script);

	// Trigger the PiP player after injection
	script.onload = () => {
		setTimeout(() => {
			const triggerScript = document.createElement("script");
			triggerScript.textContent = `
				if (window.__pipPlus && window.__pipPlus.openFloatingPlayer) {
					window.__pipPlus.openFloatingPlayer(0);
				}
			`;
			(document.head || document.documentElement).appendChild(triggerScript);
			triggerScript.remove();
		}, 100);
	};
})();
