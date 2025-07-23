import type { Hashed } from "./hashed";
import { createStore } from 'zustand/vanilla';


let isUnlocked = false;
let unlockTimestamp: number | null = null;
// let hashed: Hashed | null = null;

chrome.runtime.onMessage.addListener(async (msg: backgroundMessage, _, sendResponse) => {

    if (msg.type === "UNLOCK_WALLET") {
        isUnlocked = true;
        unlockTimestamp = Date.now();
        // hashed = msg.hashed;
        hashedStore.getState().setHashed(msg.hashed);

        console.log("got hashed in the setting unlock wallet: ", hashedStore.getState().hashed);

        sendResponse({ success: true });
        return true;
    }

    if (msg.type === "IS_WALLET_UNLOCKED") {
        const currentTimeStamp = Date.now();

        // make the time user changebale
        if (isUnlocked && unlockTimestamp && currentTimeStamp - unlockTimestamp < 15 * 60 * 1000) {

            console.log("this hashed is stored in the background.ts: ", hashedStore.getState().hashed);

            sendResponse({
                unlocked: true,
                hashed: hashedStore.getState().hashed
            });
        } else {
            isUnlocked = false;
            unlockTimestamp = null;

            sendResponse({ unlocked: false });
        }
        return true;
    }

    if (msg.type === "ENABLE_WALLET") {
        const address = hashedStore.getState().hashed?.getSelectedAccount?.();
        if (address) {
            sendResponse({ success: true, address });
        } else {
            sendResponse({ success: false });
        }
        return true;
    }

    if (msg.type === "ETH_REQUEST") {
        const { method, params = [] } = msg;

        const hashed = hashedStore.getState().hashed;

        if (!hashed || typeof hashed[method] !== "function") {
            sendResponse({ error: "Method not supported or wallet not connected" });
            return true;
        }

        try {
            const result = await hashed[method](...params);
            sendResponse({ result });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Request failed";
            sendResponse({ error: message });
        }

        return true;
    }

});


type backgroundMessage =
    | { type: "UNLOCK_WALLET", hashed: Hashed }
    | { type: "IS_WALLET_UNLOCKED" }
    | { type: "ENABLE_WALLET" }
    | { type: "ETH_REQUEST", method: string, params: any[] }



export interface HashedState {
    hashed: any | null;
    setHashed: (val: any) => void;
}

export const hashedStore = createStore<HashedState>((set) => ({
    hashed: null,
    setHashed: (val) => set({ hashed: val }),
}));