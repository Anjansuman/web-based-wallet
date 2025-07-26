// inject.ts - Injected script with proper TypeScript support

// Extend the Window interface to include ethereum

// Define the EIP-1193 provider interface with custom extensions
interface EIP1193Provider {
    request(args: { method: string; params?: any[] }): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
    removeListener(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}

// Extended interface for our custom wallet provider
interface EthereumProvider extends EIP1193Provider {
    // Standard EIP-1193 properties
    chainId: string;
    selectedAddress: string | null;
    isConnected: boolean;
    
    // Custom wallet identification properties
    isYourWallet: boolean;
    isMetaMask: boolean; // For compatibility
    
    // Legacy methods for compatibility
    enable(): Promise<string[]>;
    isUnlocked(): Promise<boolean>;
    send(method: string, params?: any[]): Promise<any>;
    send(payload: any, callback: (error: any, result?: any) => void): void;
    sendAsync(payload: any, callback: (error: any, result?: any) => void): void;
}

// Define message types
interface WalletRequest {
    type: 'WALLET_REQUEST';
    method: string;
    params: any[];
    id: number;
}

interface WalletResponse {
    type: 'WALLET_RESPONSE';
    id: number;
    result?: any;
    error?: string;
}

interface PendingRequest {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

// Implementation
(function () {
    class EthereumProviderImpl implements EthereumProvider {
        // Standard properties
        public chainId: string = '0x1'; // Ethereum mainnet
        public selectedAddress: string | null = null;
        public isConnected: boolean = false;
        
        // Custom wallet identification
        public readonly isYourWallet: boolean = true;
        public readonly isMetaMask: boolean = true; // For compatibility
        
        // Private properties
        private _requestId: number = 0;
        private _pendingRequests: Map<number, PendingRequest> = new Map();
        private _eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

        constructor() {
            // Listen for responses from content script
            window.addEventListener('message', this._handleMessage.bind(this));
            
            // Listen for wallet state changes
            window.addEventListener('message', this._handleWalletEvents.bind(this));
        }

        // EIP-1193 request method
        async request({ method, params = [] }: { method: string; params?: any[] }): Promise<any> {
            return new Promise((resolve, reject) => {
                const id = ++this._requestId;

                this._pendingRequests.set(id, { resolve, reject });

                const message: WalletRequest = {
                    type: 'WALLET_REQUEST',
                    method,
                    params,
                    id
                };

                window.postMessage(message, '*');

                // Set timeout for requests (30 seconds)
                setTimeout(() => {
                    if (this._pendingRequests.has(id)) {
                        this._pendingRequests.delete(id);
                        reject(new Error('Request timeout'));
                    }
                }, 30000);
            });
        }

        // Event listener methods
        on(event: string, listener: (...args: any[]) => void): void {
            if (!this._eventListeners.has(event)) {
                this._eventListeners.set(event, []);
            }
            this._eventListeners.get(event)!.push(listener);
        }

        removeListener(event: string, listener: (...args: any[]) => void): void {
            if (this._eventListeners.has(event)) {
                const listeners = this._eventListeners.get(event)!;
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }

        emit(event: string, ...args: any[]): void {
            if (this._eventListeners.has(event)) {
                this._eventListeners.get(event)!.forEach(listener => {
                    try {
                        listener(...args);
                    } catch (error) {
                        console.error('Error in event listener:', error);
                    }
                });
            }
        }

        // Handle messages from content script
        private _handleMessage(event: MessageEvent): void {
            if (event.source !== window) return;
            
            const data = event.data as WalletResponse;
            if (data.type !== 'WALLET_RESPONSE') return;

            const { id, result, error } = data;
            const request = this._pendingRequests.get(id);

            if (request) {
                this._pendingRequests.delete(id);
                if (error) {
                    request.reject(new Error(error));
                } else {
                    request.resolve(result);
                }
            }
        }

        // Handle wallet state change events
        private _handleWalletEvents(event: MessageEvent): void {
            if (event.source !== window) return;
            
            const { type, ...data } = event.data;
            
            switch (type) {
                case 'WALLET_UNLOCKED':
                    this.isConnected = true;
                    this.emit('connect', { chainId: this.chainId });
                    break;
                    
                case 'WALLET_LOCKED':
                    this.isConnected = false;
                    this.selectedAddress = null;
                    this.emit('disconnect');
                    break;
                    
                case 'CHAIN_CHANGED':
                    this.chainId = data.chainId;
                    this.emit('chainChanged', data.chainId);
                    break;
                    
                case 'ACCOUNTS_CHANGED':
                    this.selectedAddress = data.accounts?.[0] || null;
                    this.emit('accountsChanged', data.accounts || []);
                    break;
            }
        }

        // Convenience methods for common operations
        async enable(): Promise<string[]> {
            const accounts = await this.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                this.selectedAddress = accounts[0];
                this.isConnected = true;
            }
            return accounts;
        }

        async isUnlocked(): Promise<boolean> {
            return this.request({ method: 'wallet_isUnlocked' });
        }

        // Legacy methods for compatibility
        send(methodOrPayload: string | any, callbackOrParams?: any): any {
            // Handle string method with params
            if (typeof methodOrPayload === 'string') {
                return this.request({
                    method: methodOrPayload,
                    params: callbackOrParams || []
                });
            }

            // Handle object payload with callback
            if (typeof callbackOrParams === 'function') {
                this.request(methodOrPayload)
                    .then(result => callbackOrParams(null, { result }))
                    .catch(error => callbackOrParams(error));
                return;
            }

            // Handle object payload without callback (return promise)
            return this.request(methodOrPayload);
        }

        sendAsync(payload: any, callback: (error: any, result?: any) => void): void {
            this.request(payload)
                .then(result => callback(null, { result }))
                .catch(error => callback(error));
        }
    }

    // Create and inject the provider
    const provider = new EthereumProviderImpl();

    // Make it available globally
    window.ethereum = provider;

    // Announce the provider (EIP-1193)
    window.dispatchEvent(new Event('ethereum#initialized'));

    // EIP-6963 - Multi Injector Discovery
    const providerInfo = {
        uuid: crypto.randomUUID(), // Generate unique UUID
        name: 'Your Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN0ZGRiIvPgo8cGF0aCBkPSJNMTYgOEwxMCAxNkwxNiAyNEwyMiAxNkwxNiA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+', // Simple wallet icon
        rdns: 'com.yourwallet.extension'
    };

    // Announce provider for EIP-6963 discovery
    const announceEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info: providerInfo, provider })
    });

    window.dispatchEvent(announceEvent);

    // Listen for EIP-6963 discovery requests
    window.addEventListener('eip6963:requestProvider', () => {
        window.dispatchEvent(announceEvent);
    });

    console.log('Your Wallet provider injected successfully');
})();