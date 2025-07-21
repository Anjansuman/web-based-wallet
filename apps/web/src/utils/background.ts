import type { Hashed } from "./hashed";
import { createStore } from 'zustand/vanilla';


let isUnlocked = false;
let unlockTimestamp: number | null = null;
// let hashed: Hashed | null = null;

chrome.runtime.onMessage.addListener((msg: backgroundMessage, _, sendResponse) => {

    if (msg.type === "UNLOCK_WALLET") {
        isUnlocked = true;
        unlockTimestamp = Date.now();
        // hashed = msg.hashed;
        hashedStore.getState().setHashed(msg.hashed);

        console.log("got hashed in the setting unlock wallet: ",  hashedStore.getState().hashed);

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
});


type backgroundMessage =
    | { type: "UNLOCK_WALLET", hashed: Hashed }
    | { type: "IS_WALLET_UNLOCKED" }



export interface HashedState {
    hashed: any | null;
    setHashed: (val: any) => void;
}

export const hashedStore = createStore<HashedState>((set) => ({
    hashed: null,
    setHashed: (val) => set({ hashed: val }),
}));