import type { Hashed } from "./hashed";


let isUnlocked = false;
let unlockTimestamp: number | null = null;
let hashed: Hashed | null = null;

chrome.runtime.onMessage.addListener((msg: backgroundMessage, _, sendResponse) => {

    if (msg.type === "UNLOCK_WALLET") {
        isUnlocked = true;
        unlockTimestamp = Date.now();
        hashed = msg.hashed;

        console.log("got hashed in the setting unlock wallet: ", hashed);

        sendResponse({ success: true });
        return true;
    }

    if (msg.type === "IS_WALLET_UNLOCKED") {
        const currentTimeStamp = Date.now();

        // make the time user changebale
        if (isUnlocked && unlockTimestamp && currentTimeStamp - unlockTimestamp < 15 * 60 * 1000) {

            console.log("this hashed is stored in the background.ts: ", hashed);

            sendResponse({
                unlocked: true,
                hashed: hashed
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