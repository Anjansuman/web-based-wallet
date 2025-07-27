import { MESSAGE } from "../enums/message-enum";
import type { backgroundMessage } from "../types/background-message-type";
import type { Hashed } from "../utils/hashed";
import { hashedStore } from "./background";
import { useHashedStore } from "../store/hashed-store";
import { RPC_METHODS } from "../enums/rpc-methods-enum";
import { REQUEST_APPROVAL } from "../enums/request-approval-enum";
import { LOCAL_STORAGE } from "../enums/local-storage-enum";
import { APPROVAL_ERROR } from "../enums/approval-error-enum";
import { usePageStore } from "../store/page-store";
import { PAGE } from "../enums/page-enum";


class HashedBackground {
    private is_unlocked: boolean = false;
    private unlock_timestamp: number | null = null;
    private readonly UNLOCK_DURATION = 15 * 60 * 100;

    constructor() {
        this.setup_message_handlers();
        this.setup_alarms();
    }

    private setup_message_handlers(): void {

        chrome.runtime.onMessage.addListener((msg: backgroundMessage, _sender, sendResponse) => {
            this.handle_message(msg, sendResponse);
            return true; // keep it open for async responses
        });
    }

    private setup_alarms(): void {

        // this will check if wallet is unlocked or not every minute, and if found time has crossed then it will lock it
        chrome.alarms.create("checkUnlockExpiry", { periodInMinutes: 1 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name !== "checkUnlockExpiry") return;
            this.check_and_expire_unlock();
        });
    }

    private async handle_message(msg: backgroundMessage, sendResponse: Function): Promise<void> {
        try {

            switch (msg.type) {
                case MESSAGE.UNLOCK_WALLET:
                    await this.handle_unlock_wallet(msg, sendResponse);
                    break;

                case MESSAGE.IS_WALLET_UNLOCKED:
                    await this.handle_is_wallet_unlocked(sendResponse);
                    break;

                case MESSAGE.ENABLE_WALLET:
                    this.handle_enable_wallet(sendResponse);
                    break;

                case MESSAGE.ETH_REQUEST:
                    await this.handle_eth_request(msg, sendResponse);
                    break;

                case MESSAGE.WALLET_REQUEST:
                    await this.handle_wallet_request(msg, sendResponse);
                    break;

                default:
                    sendResponse({ error: "Unknown message type" });
            }

        } catch (error) {
            this.handle_error(error, sendResponse);
        }
    }

    private async handle_unlock_wallet(msg: { hashed: Hashed }, sendResponse: Function): Promise<void> {
        try {
            this.is_unlocked = true;
            this.unlock_timestamp = Date.now();
            hashedStore.getState().setHashed(msg.hashed);

            console.log("hashed in unlocking wallet: ", hashedStore.getState().hashed);

            // notify all tabs that wallet is unlocked
            this.notify_wallet_unlocked();

            sendResponse({ success: true });
        } catch (error) {
            this.handle_error(error, sendResponse);
        }
    }

    private async handle_is_wallet_unlocked(sendResponse: Function): Promise<void> {

        if (!this.is_wallet_unlocked()) {
            // lock the wallet again
            this.lock_wallet();

            sendResponse({ unlocked: false });
        }

        console.log("hashed during unlocking wallet: ", hashedStore.getState().hashed);
        sendResponse({
            unlocked: true,
            hashed: hashedStore.getState().hashed
        });
    }

    private handle_enable_wallet(sendResponse: Function): void {
        const hashed = useHashedStore.getState().hashed;
        const address = hashed?.getSelectedAccount().publicKey;

        if (!address) {
            sendResponse({ success: false });
            return;
        }

        sendResponse({ success: true, address });

    }

    // study this once
    private async handle_eth_request(msg: { method: string, params: any[] }, sendResponse: Function): Promise<void> {
        const { method, params = [] } = msg;
        const hashed = hashedStore.getState().hashed;

        if (!hashed || typeof hashed[method] !== "function") {
            sendResponse({ error: "Method not supported or wallet not connected" });
            return;
        }

        try {

            const result = await hashed[method](...params);
            sendResponse({ result });

        } catch (error) {
            this.handle_error(error, sendResponse);
        }

    }

    private async handle_wallet_request(msg: { method: string, params: any[], id: number }, sendResponse: Function): Promise<void> {
        const { method, params = [] } = msg;

        try {

            let result: any;

            switch (method) {
                case RPC_METHODS.ETH_REQUEST_ACCOUNTS:
                    result = await this.eth_request_accounts();
                    break;

                case RPC_METHODS.ETH_ACCOUNTS:
                    result = this.eth_accounts();
                    break;

                case RPC_METHODS.ETH_CHAIN_ID:
                    result = this.eth_chain_id();
                    break;

                case RPC_METHODS.WALLET_IS_UNLOCKED:
                    result = this.is_wallet_unlocked();
                    break;

                case RPC_METHODS.ETH_SEND_TRANSACTION:
                    result = await this.eth_send_transaction(params[0]);
                    break;

                case RPC_METHODS.PERSONAL_SIGN:
                    result = await this.personal_sign(params[0], params[1]);
                    break;

                case RPC_METHODS.ETH_SIGN_TYPED_DATA_V4:
                    result = await this.eth_sign_typed_data_v4(params[0], params[1]);
                    break;

                case RPC_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN:
                    result = await this.wallet_switch_ethereum_chain(params[0].chainId);
                    break;

                case RPC_METHODS.WALLET_ADD_ETHEREUM_CHAIN:
                    result = await this.wallet_add_ethereum_chain(params[0]);
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
            this.handle_error(error, sendResponse);
        }
    }

    private async eth_request_accounts(): Promise<string[]> {
        if (!this.is_wallet_unlocked()) {

            // open popup for unlocking
            await this.open_popup(PAGE.UNLOCK);
            throw new Error("Wallet is locked");
        }

        const hashed = hashedStore.getState().hashed;
        const address = hashed?.getSelectedAccount().publicKey;

        if (!address) {
            // await this.open_popup();
            throw new Error("No accounts available");
        }

        return [address];
    }

    private eth_accounts(): string[] {
        if (!this.is_wallet_unlocked()) return [];

        const hashed = hashedStore.getState().hashed;
        const address: string = hashed?.getSelectedAccount().publicKey;

        return [address];
    }

    // review it once
    private eth_chain_id(): string {
        const hashed = hashedStore.getState().hashed;
        return hashed?.getChainId() || "0x1";
    }

    private is_wallet_unlocked(): boolean {
        const current_time_stamp = Date.now();

        if (!this.is_unlocked || !this.unlock_timestamp) return false;

        const timestamp_calculation = current_time_stamp - this.unlock_timestamp < this.UNLOCK_DURATION;
        const values = this.is_unlocked && this.unlock_timestamp !== null && timestamp_calculation;
        return values;
    }

    private async eth_send_transaction(tx_params: any): Promise<string> {
        if (!this.is_wallet_unlocked()) {
            throw new Error("Wallet is locked");
        }

        const approval = await this.request_approval(REQUEST_APPROVAL.TRANSACTION, tx_params);
        if (!approval) {
            throw new Error(APPROVAL_ERROR.TRANSACTION_REJECTED);
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.sendTransaction === "function") {
            return await hashed.sendTransaction(tx_params);
        }

        throw new Error(APPROVAL_ERROR.TRANSACTION_REJECTED);
    }

    private async personal_sign(message: string, address: string): Promise<string> {
        if (!this.is_wallet_unlocked()) {
            throw new Error(APPROVAL_ERROR.WALLET_LOCKED);
        }

        const approval = await this.request_approval(REQUEST_APPROVAL.SIGN, { message, address });
        if (!approval) {
            throw new Error(APPROVAL_ERROR.SIGNIN_REJECTED);
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.personalSign === "function") {
            return await hashed.personalSign(message, address);
        }

        throw new Error(APPROVAL_ERROR.SIGNIN_REJECTED);
    }

    private async eth_sign_typed_data_v4(typedData: any, address: string): Promise<string> {
        if (!this.is_wallet_unlocked()) {
            throw new Error(APPROVAL_ERROR.WALLET_LOCKED);
        }

        const approved = await this.request_approval(REQUEST_APPROVAL.SIGN_TYPED_DATA, { address, typedData });
        if (!approved) {
            throw new Error(APPROVAL_ERROR.SIGNIN_REJECTED);
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.signTypedData === 'function') {
            return await hashed.signTypedData(address, typedData);
        }

        throw new Error(APPROVAL_ERROR.SIGNIN_REJECTED);
    }

    private async wallet_switch_ethereum_chain(chainId: string): Promise<null> {
        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.switchChain === 'function') {
            await hashed.switchChain(chainId);
        }

        // Notify all tabs of chain change
        this.notify_chain_changed(chainId);
        return null;
    }

    private async wallet_add_ethereum_chain(chain_params: any): Promise<null> {
        const approved = await this.request_approval(REQUEST_APPROVAL.ADD_CHAIN, chain_params);
        if (!approved) {
            throw new Error(APPROVAL_ERROR.CHAIN_ADDITION_REJECTED);
        }

        const hashed = hashedStore.getState().hashed;
        if (hashed && typeof hashed.addChain === 'function') {
            await hashed.addChain(chain_params);
        }

        return null;
    }

    private async open_popup(page: PAGE) {

        usePageStore.getState().setPage(page);

        return new Promise<void>((resolve) => {
            chrome.windows.create({
                url: 'index.html',
                type: 'popup',
                width: 400,
                height: 600
            }, () => resolve());
        })
    }

    private async request_approval(type: REQUEST_APPROVAL, data: any): Promise<boolean> {

        // store the req and open popup, but change it in runtine message
        await chrome.storage.local.set({
            [LOCAL_STORAGE.PENDING_REQUEST]: {
                type,
                data,
                timestamp: Date.now()
            }
        });

        await this.open_popup(PAGE.TRANSACTION);

        return new Promise((resolve) => {
            const check_response = async () => {
                const result = await chrome.storage.local.get(LOCAL_STORAGE.REQUEST_RESPONSE);
                if (result.REQUEST_RESPONSE.approved) {
                    await chrome.storage.local.remove(
                        [LOCAL_STORAGE.REQUEST_RESPONSE, LOCAL_STORAGE.PENDING_REQUEST]
                    );
                    resolve(result.REQUEST_RESPONSE.approved);
                } else {
                    setTimeout(check_response, 100);
                }
            };
            check_response();
        })
    }

    private lock_wallet() {
        this.is_unlocked = false;
        this.unlock_timestamp = null;

        // Notify all tabs that wallet is locked
        this.notify_wallet_locked();
    }

    private check_and_expire_unlock() {
        if (this.is_wallet_unlocked()) return;
        this.lock_wallet();
    }

    private notify_wallet_unlocked() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "WALLET_UNLOCKED"
                    }).catch(() => {

                    });
                }
            })
        })
    }

    private notify_wallet_locked() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'WALLET_LOCKED'
                    }).catch(() => {

                    });
                }
            });
        });
    }

    private notify_chain_changed(chainId: string) {
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

    private handle_error(error: unknown, sendResponse: Function) {
        const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
        sendResponse({ error: message });
    }
}

new HashedBackground();