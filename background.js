// background.js
chrome.action.onClicked.addListener((tab) => {
	chrome.scripting
		.executeScript({
			target: { tabId: tab.id },
			files: ["content.js"],
		})
		.catch((err) => console.warn("script injection failed:", err));
});

chrome.commands.onCommand.addListener((command) => {
	if (command === "open-pip-plus") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (!tabs[0]) return;
			chrome.scripting
				.executeScript({
					target: { tabId: tabs[0].id },
					files: ["content.js"],
				})
				.catch((err) => console.warn("script injection failed:", err));
		});
	}
});

// create a context menu to open PiP+
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "open-pip-plus",
		title: "Open PiP+ (floating player)",
		contexts: ["all"],
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "open-pip-plus" && tab) {
		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ["content.js"],
			})
			.catch((err) => console.warn("script injection failed:", err));
	}
});
