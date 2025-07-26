// content-script.ts - Content script with proper TypeScript support

// Message types for communication
interface WalletRequestMessage {
  type: 'WALLET_REQUEST';
  method: string;
  params: any[];
  id: number;
}

interface WalletResponseMessage {
  type: 'WALLET_RESPONSE';
  id: number;
  result?: any;
  error?: string;
}

interface WalletEventMessage {
  type: 'WALLET_UNLOCKED' | 'WALLET_LOCKED' | 'CHAIN_CHANGED' | 'ACCOUNTS_CHANGED';
  [key: string]: any;
}

(function() {
  // Inject the provider script into the page
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function() {
    // Use parentNode.removeChild for better compatibility
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  };
  (document.head || document.documentElement).appendChild(script);

  // Listen for messages from injected script
  window.addEventListener('message', async (event: MessageEvent) => {
    if (event.source !== window || !event.data?.type) return;
    
    if (event.data.type === 'WALLET_REQUEST') {
      const requestData = event.data as WalletRequestMessage;
      
      try {
        // Forward to background script
        const response = await chrome.runtime.sendMessage({
          type: 'WALLET_REQUEST',
          method: requestData.method,
          params: requestData.params,
          id: requestData.id
        });

        // Send response back to page
        const responseMessage: WalletResponseMessage = {
          type: 'WALLET_RESPONSE',
          id: requestData.id,
          result: response.result,
          error: response.error
        };

        window.postMessage(responseMessage, '*');
      } catch (error) {
        // Handle chrome.runtime errors (extension context invalidated, etc.)
        const errorMessage: WalletResponseMessage = {
          type: 'WALLET_RESPONSE',
          id: requestData.id,
          error: error instanceof Error ? error.message : 'Extension communication failed'
        };

        window.postMessage(errorMessage, '*');
      }
    }
  });

  // Listen for responses from background script
  chrome.runtime.onMessage.addListener((message: WalletEventMessage, _sender, _sendResponse) => {
    // Forward wallet events to the page
    if (['WALLET_UNLOCKED', 'WALLET_LOCKED', 'CHAIN_CHANGED', 'ACCOUNTS_CHANGED'].includes(message.type)) {
      window.postMessage(message, '*');
    }
    
    // Don't send response to keep the message channel open
    return false;
  });

  console.log('Your Wallet content script loaded');
})();