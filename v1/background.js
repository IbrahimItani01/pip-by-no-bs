// background.js
chrome.action.onClicked.addListener((tab) => {
	if (!tab.id) return;
	chrome.scripting
		.executeScript({
			target: { tabId: tab.id },
			files: ["content.js"],
		})
		.catch((err) => console.warn("PiP+ injection failed:", err));
});

chrome.commands.onCommand.addListener((command) => {
	if (command === "open-pip-plus") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (!tabs[0] || !tabs[0].id) return;
			chrome.scripting
				.executeScript({
					target: { tabId: tabs[0].id },
					files: ["content.js"],
				})
				.catch((err) => console.warn("PiP+ injection failed:", err));
		});
	}
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "open-pip-plus",
		title: "Open PiP Plus (floating player)",
		contexts: ["page", "video"],
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "open-pip-plus" && tab && tab.id) {
		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ["content.js"],
			})
			.catch((err) => console.warn("PiP+ injection failed:", err));
	}
});
