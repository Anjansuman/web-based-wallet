// content-script.ts - Content script with debugging

import { WALLET_EVENT } from "../enums/inject-wallet-event-enum";
import type { WalletRequest, WalletResponse } from "../types/inject-type";

console.log('🔵 Content script starting to load...');


interface WalletEventMessage {
    type: WALLET_EVENT,
    [key: string]: any;
}

(function () {
    console.log('🔵 Content script IIFE executing...');

    // Check if chrome.runtime is available
    if (!chrome || !chrome.runtime) {
        console.error('❌ Chrome runtime not available');
        return;
    }

    console.log('🔵 Chrome runtime available, injecting script...');

    // Inject the provider script into the page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');

    script.onload = function () {
        console.log('✅ inject.js loaded successfully');
        // Use parentNode.removeChild for better compatibility
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };

    script.onerror = function (error) {
        console.error('❌ Failed to load inject.js:', error);
    };

    console.log('🔵 Attempting to append script to:', document.head || document.documentElement);
    (document.head || document.documentElement).appendChild(script);
    console.log('🔵 Script appended, src:', script.src);

    // Listen for messages from injected script
    window.addEventListener('message', async (event: MessageEvent) => {
        if (event.source !== window || !event.data?.type) return;

        console.log('🔵 Content script received message:', event.data);

        if (event.data.type === 'WALLET_REQUEST') {
            const requestData = event.data as WalletRequest;

            try {
                console.log('🔵 Forwarding to background:', requestData);
                // Forward to background script
                const response = await chrome.runtime.sendMessage({
                    type: WALLET_EVENT.WALLET_REQUEST,
                    method: requestData.method,
                    params: requestData.params,
                    id: requestData.id
                });

                console.log('🔵 Background response:', response);

                // Send response back to page
                const responseMessage: WalletResponse = {
                    type: WALLET_EVENT.WALLET_RESPONSE,
                    id: requestData.id,
                    result: response.result,
                    error: response.error
                };

                window.postMessage(responseMessage, '*');
            } catch (error) {
                console.error('❌ Content script error:', error);
                // Handle chrome.runtime errors (extension context invalidated, etc.)
                const errorMessage: WalletResponse = {
                    type: WALLET_EVENT.WALLET_RESPONSE,
                    id: requestData.id,
                    error: error instanceof Error ? error.message : 'Extension communication failed'
                };

                window.postMessage(errorMessage, '*');
            }
        }
    });

    // Listen for responses from background script
    chrome.runtime.onMessage.addListener((message: WalletEventMessage, _sender, _sendResponse) => {
        console.log('🔵 Content script received background message:', message);
        // Forward wallet events to the page
        if ([WALLET_EVENT.WALLET_UNLOCKED, WALLET_EVENT.WALLET_LOCKED, WALLET_EVENT.CHAIN_CHANGED, WALLET_EVENT.ACCOUNTS_CHANGED].includes(message.type)) {
            window.postMessage(message, '*');
        }

        // Don't send response to keep the message channel open
        return false;
    });

    console.log('✅ Your Wallet content script loaded successfully');
})();