


type BackgroundRequest =
    | { type: "set_session"; token: string }
    | { type: "get_session" }
    | { type: "clear_session" };


chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ sessionToken: null });
});

chrome.runtime.onMessage.addListener((msg: BackgroundRequest, _, sendResponse) => {
    if (msg.type === "set_session") {
        chrome.storage.local.set({ sessionToken: msg.token });
        sendResponse({ ok: true });
    }

    if (msg.type === "get_session") {
        chrome.storage.local.get("sessionToken", (data) => {
            sendResponse({ token: data.sessionToken });
        });
        return true; // async
    }

    if (msg.type === "clear_session") {
        chrome.storage.local.remove("sessionToken");
        sendResponse({ ok: true });
    }
});


export async function generateSessionToken(password: string): Promise<string> {

    // have to change the time, and set according to the user
    const expiry = Date.now() + 15 * 60 * 1000;
    const key = await deriveKey(password);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(expiry.toString());

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    return `${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}

export async function validateSessionToken(token: string, password: string): Promise<boolean> {
    try {
        const [ivBase64, cipherBase64] = token.split(".");
        const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
        const cipher = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));

        const key = await deriveKey(password);
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipher
        );

        const expiry = parseInt(new TextDecoder().decode(decrypted));
        return Date.now() < expiry;
    } catch (e) {
        return false;
    }
}

async function deriveKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", enc);

    return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
