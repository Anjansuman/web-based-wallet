import type { Hashed } from "../utils/hashed";
import { createStore } from 'zustand/vanilla';
import type { backgroundMessage } from "../types/background-message-type";
import { MESSAGE } from "../enums/message-enum";
import { RPC_METHODS } from "../enums/rpc-enum";

// Keep your existing store
export interface HashedState {
    hashed: any | null;
    setHashed: (val: any) => void;
}

export const hashedStore = createStore<HashedState>((set) => ({
    hashed: null,
    setHashed: (val) => set({ hashed: val }),
}));

// Your existing message types


class WalletBackground {
    private isUnlocked = false;
    private unlockTimestamp: number | null = null;
    private readonly UNLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

    constructor() {
        this.setupMessageHandlers();
        this.setupAlarms(); // For auto-lock functionality
    }

    private setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((msg: backgroundMessage, _, sendResponse) => {
            this.handleMessage(msg, sendResponse);
            return true; // Keep channel open for async responses
        });
    }

    private setupAlarms() {
        // Clean up expired unlock state periodically
        chrome.alarms.create('checkUnlockExpiry', { periodInMinutes: 1 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'checkUnlockExpiry') {
                this.checkAndExpireUnlock();
            }
        });
    }

    private async handleMessage(msg: backgroundMessage, sendResponse: Function) {
        try {
            switch (msg.type) {
                case MESSAGE.UNLOCK_WALLET:
                    await this.handleUnlockWallet(msg, sendResponse);
                    break;

                case MESSAGE.IS_WALLET_UNLOCKED:
                    this.handleIsWalletUnlocked(sendResponse);
                    break;

                case MESSAGE.ENABLE_WALLET:
                    this.handleEnableWallet(sendResponse);
                    break;

                case MESSAGE.ETH_REQUEST:
                    await this.handleEthRequest(msg, sendResponse);
                    break;

                case MESSAGE.WALLET_REQUEST:
                    await this.handleWalletRequest(msg, sendResponse);
                    break;

                default:
                    sendResponse({ error: "Unknown message type" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendResponse({ error: message });
        }
    }

    private async handleUnlockWallet(msg: { hashed: Hashed }, sendResponse: Function) {
        this.isUnlocked = true;
        this.unlockTimestamp = Date.now();
        hashedStore.getState().setHashed(msg.hashed);

        console.log("got hashed in the setting unlock wallet: ", hashedStore.getState().hashed);

        // Notify all tabs that wallet is unlocked
        this.notifyTabsOfUnlock();

        sendResponse({ success: true });
    }

    private handleIsWalletUnlocked(sendResponse: Function) {
        const currentTimeStamp = Date.now();

        if (this.isUnlocked && this.unlockTimestamp &&
            currentTimeStamp - this.unlockTimestamp < this.UNLOCK_DURATION) {

            console.log("this hashed is stored in the background.ts: ", hashedStore.getState().hashed);

            sendResponse({
                unlocked: true,
                hashed: hashedStore.getState().hashed
            });
        } else {
            this.lockWallet();
            sendResponse({ unlocked: false });
        }
    }

    private handleEnableWallet(sendResponse: Function) {
        const address = hashedStore.getState().hashed?.getSelectedAccount?.();
        if (address) {
            sendResponse({ success: true, address });
        } else {
            sendResponse({ success: false });
        }
    }

    private async handleEthRequest(msg: { method: string, params: any[] }, sendResponse: Function) {
        const { method, params = [] } = msg;
        const hashed = hashedStore.getState().hashed;

        if (!hashed || typeof hashed[method] !== "function") {
            sendResponse({ error: "Method not supported or wallet not connected" });
            return;
        }

        try {
            const result = await hashed[method](...params);
            sendResponse({ result });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Request failed";
            sendResponse({ error: message });
        }
    }

    // New method for handling web3 provider requests
    private async handleWalletRequest(msg: { method: string, params: any[], id: number }, sendResponse: Function) {
        const { method, params = [] } = msg;

        try {
            let result: any;

            switch (method) {
                case RPC_METHODS.ETH_REQUEST_ACCOUNTS:
                    result = await this.requestAccounts();
                    break;

                case RPC_METHODS.ETH_ACCOUNTS:
                    result = this.getAccounts();
                    break;

                case RPC_METHODS.ETH_CHAIN_ID:
                    result = await this.getChainId();
                    break;

                case RPC_METHODS.WALLET_IS_UNLOCKED:
                    result = this.isWalletUnlocked();
                    break;

                case RPC_METHODS.ETH_SEND_TRANSACTION:
                    result = await this.sendTransaction(params[0]);
                    break;

                case RPC_METHODS.PERSONAL_SIGN:
                    result = await this.personalSign(params[0], params[1]);
                    break;

                case RPC_METHODS.ETH_SIGN_TYPED_DATA_V4:
                    result = await this.signTypedData(params[1], params[0]);
                    break;

                case RPC_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN:
                    result = await this.switchChain(params[0].chainId);
                    break;

                case RPC_METHODS.WALLET_ADD_ETHEREUM_CHAIN:
                    result = await this.addChain(params[0]);
                    break;

                default:
                    const hashed = hashedStore.getState().hashed;
                    if (hashed && typeof hashed[method] === "function") {
                        result = await hashed[method](...params);
                    } else {
                        throw new Error(`Unsupported method: ${method}`);
                    }
            }


            sendResponse({ result });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Request failed";
            sendResponse({ error: message });
        }
    }

    // Web3 provider methods
    private async requestAccounts(): Promise<string[]> {
        if (!this.isWalletUnlocked()) {
            await this.openPopup();
            throw new Error('Wallet is locked');
        }

        const hashed = hashedStore.getState().hashed;
        const address = hashed?.getSelectedAccount?.();

        if (!address) {
            await this.openPopup();
            throw new Error('No accounts available');
        }

        return [address];
    }

    private getAccounts(): string[] {
        if (!this.isWalletUnlocked()) return [];

        const hashed = hashedStore.getState().hashed;
        const address = hashed?.getSelectedAccount?.();
        return address ? [address] : [];
    }

    private async getChainId(): Promise<string> {
        const hashed = hashedStore.getState().hashed;
        return hashed?.getChainId?.() || '0x1'; // Default to Ethereum mainnet
    }

    private isWalletUnlocked(): boolean {
        const currentTimeStamp = Date.now();
        return this.isUnlocked &&
            this.unlockTimestamp !== null &&
            currentTimeStamp - this.unlockTimestamp < this.UNLOCK_DURATION;
    }

    private async sendTransaction(txParams: any): Promise<string> {
        if (!this.isWalletUnlocked()) {
            throw new Error('Wallet is locked');
        }

        // Open popup for transaction confirmation
        const approved = await this.requestApproval('transaction', txParams);
        if (!approved) {
            throw new Error('Transaction rejected by user');
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.sendTransaction === 'function') {
            return await hashed.sendTransaction(txParams);
        }

        throw new Error('Transaction method not available');
    }

    private async personalSign(message: string, address: string): Promise<string> {
        if (!this.isWalletUnlocked()) {
            throw new Error('Wallet is locked');
        }

        const approved = await this.requestApproval('sign', { message, address });
        if (!approved) {
            throw new Error('Signing rejected by user');
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.personalSign === 'function') {
            return await hashed.personalSign(message, address);
        }

        throw new Error('Personal sign method not available');
    }

    private async signTypedData(address: string, typedData: any): Promise<string> {
        if (!this.isWalletUnlocked()) {
            throw new Error('Wallet is locked');
        }

        const approved = await this.requestApproval('signTypedData', { address, typedData });
        if (!approved) {
            throw new Error('Signing rejected by user');
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.signTypedData === 'function') {
            return await hashed.signTypedData(address, typedData);
        }

        throw new Error('Sign typed data method not available');
    }

    private async switchChain(chainId: string): Promise<null> {
        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.switchChain === 'function') {
            await hashed.switchChain(chainId);
        }

        // Notify all tabs of chain change
        this.notifyChainChanged(chainId);
        return null;
    }

    private async addChain(chainParams: any): Promise<null> {
        const approved = await this.requestApproval('addChain', chainParams);
        if (!approved) {
            throw new Error('Chain addition rejected by user');
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.addChain === 'function') {
            await hashed.addChain(chainParams);
        }

        return null;
    }

    // Utility methods
    private async openPopup() {
        return new Promise<void>((resolve) => {
            chrome.windows.create({
                url: 'index.html',
                type: 'popup',
                width: 357,
                height: 600
            }, () => resolve());
        });
    }

    private async requestApproval(type: string, data: any): Promise<boolean> {
        // Store the request and open popup
        await chrome.storage.local.set({
            pendingRequest: { type, data, timestamp: Date.now() }
        });

        await this.openPopup();

        // Wait for user response
        return new Promise((resolve) => {
            const checkResponse = async () => {
                const result = await chrome.storage.local.get('requestResponse');
                if (result.requestResponse) {
                    await chrome.storage.local.remove(['requestResponse', 'pendingRequest']);
                    resolve(result.requestResponse.approved);
                } else {
                    setTimeout(checkResponse, 100);
                }
            };
            checkResponse();
        });
    }

    private lockWallet() {
        this.isUnlocked = false;
        this.unlockTimestamp = null;
        hashedStore.getState().setHashed(null);

        // Notify all tabs that wallet is locked
        this.notifyTabsOfLock();
    }

    private checkAndExpireUnlock() {
        if (this.isUnlocked && this.unlockTimestamp) {
            const currentTimeStamp = Date.now();
            if (currentTimeStamp - this.unlockTimestamp >= this.UNLOCK_DURATION) {
                this.lockWallet();
            }
        }
    }

    private notifyTabsOfUnlock() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'WALLET_UNLOCKED'
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                }
            });
        });
    }

    private notifyTabsOfLock() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'WALLET_LOCKED'
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                }
            });
        });
    }

    private notifyChainChanged(chainId: string) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'CHAIN_CHANGED',
                        chainId
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                }
            });
        });
    }
}

// Initialize the wallet background service
new WalletBackground();