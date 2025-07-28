import { WALLET_EVENT } from "../enums/inject-wallet-event-enum";
import { RPC_METHODS } from "../enums/rpc-methods-enum";
import type { PendingRequest, WalletRequest, WalletResponse } from "../types/inject-type";



export class EthereumProviderImpl implements EthereumProvider {

    public chainId: string = "0x1";
    public selectedAddress: string | null = null;
    public isConnected: boolean = false;

    public readonly isHashed: boolean = true;
    // public readonly isMetaMask: boolean = true;

    private _requestId: number = 0;
    private _pendingRequests: Map<number, PendingRequest> = new Map(); // id -> pending-requests
    private _eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map(); // event -> listener

    constructor() {

        // Listen for responses from content script
        window.addEventListener('message', this._handleMessage.bind(this));

        // Listen for wallet state changes
        window.addEventListener('message', this._handleWalletEvents.bind(this));

    }

    // EIP-1193 request
    async request({ method, params = [] }: { method: string, params?: any[] }): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = ++this._requestId;

            this._pendingRequests.set(id, { resolve, reject });

            const message: WalletRequest = {
                type: WALLET_EVENT.WALLET_REQUEST,
                method: method,
                params: params,
                id
            };

            window.postMessage(message, "*");

            // wait for response for 30sec
            setTimeout(() => {
                this.deletePendingRequest(id, reject);
            }, 30000);
        });
    }

    on(event: string, listener: (...args: any[]) => void): void {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, []);
        }
        this._eventListeners.get(event)?.push(listener);
    }

    removeListener(event: string, listener: (...args: any[]) => void): void {
        if (!this._eventListeners.has(event)) {
            return;
        }
        const presentListeners = this._eventListeners.get(event)!;
        const index = presentListeners.indexOf(listener);

        if (index < 0) {
            return;
        }
        presentListeners.splice(index, 1);

    }

    emit(event: string, ...args: any[]): void {
        if (!this._eventListeners.has(event)) {
            return;
        }

        this._eventListeners.get(event)!.forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error("Error in event listener: ", error);
            }
        });
    }

    private _handleMessage(event: MessageEvent): void {
        if (event.source !== window) return;

        const data = event.data as WalletResponse;
        if (data.type !== WALLET_EVENT.WALLET_RESPONSE) return;

        const { id, result, error } = data;
        const request = this._pendingRequests.get(id);

        if (!request) {
            return;
        }

        this._pendingRequests.delete(id);
        if (error) {
            request.reject(new Error(error));
        } else {
            request.resolve(result);
        }
    }

    private _handleWalletEvents(event: MessageEvent): void {
        if (event.source !== window) return;

        const { type, ...data } = event.data;

        switch (type) {
            case WALLET_EVENT.WALLET_UNLOCKED:
                this.isConnected = true;
                this.emit('connect', { chainId: this.chainId });
                return;

            case WALLET_EVENT.WALLET_LOCKED:
                this.isConnected = false;
                this.selectedAddress = null;
                this.emit('disconnect');
                return;

            case WALLET_EVENT.CHAIN_CHANGED:
                this.chainId = data.chainId;
                this.emit('chainChanged', data.chainId);
                return;

            case WALLET_EVENT.ACCOUNTS_CHANGED:
                this.selectedAddress = data.accounts[0] || null;
                this.emit('accountsChanged', data.accounts || null);
                return;

            default:
                // throw error
                return;
        }
    }

    async enable(): Promise<string[]> {
        const accounts = await this.request({ method: RPC_METHODS.ETH_REQUEST_ACCOUNTS });

        if (accounts && accounts.length > 0) {
            this.selectedAddress = accounts[0];
            this.isConnected = true;
        }
        return accounts;
    }

    async isUnlocked(): Promise<boolean> {
        return this.request({ method: RPC_METHODS.WALLET_IS_UNLOCKED });
    }

    send(methodOrPayload: string | any, callbackOrParams?: any): any {
        if (typeof methodOrPayload === 'string') {
            return this.request({
                method: methodOrPayload,
                params: callbackOrParams || []
            });
        }

        if (typeof callbackOrParams === "function") {
            this.request(methodOrPayload)
                .then(result => callbackOrParams(null, { result }))
                .catch(error => callbackOrParams(error));
            return;
        }

        return this.request(methodOrPayload);
    }

    sendAsync(payload: any, callback: (error: any, result?: any) => void): void {
        this.request(payload)
            .then(result => callback(null, { result }))
            .catch(error => callback(error));
    }

    private deletePendingRequest(id: number, reject: (reason: any) => void) {
        if (this._pendingRequests.has(id)) {
            this._pendingRequests.delete(id);
            reject(new Error("Request timeout"));
        }
    }

}