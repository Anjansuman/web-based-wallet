const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.type = "module"; // if you're using ES Modules
(document.head || document.documentElement).appendChild(script);
