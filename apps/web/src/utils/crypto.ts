import crypto from "crypto-js"


export const PKBDF2 = (password: string, salt: string) => {
    return crypto.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000
    });
}

export const encryptMnemonic = (mnemonic: string, key: crypto.lib.WordArray, iv: string) => {
    return crypto.AES.encrypt(mnemonic, key, {
        iv: crypto.enc.Hex.parse(iv)
    });
}

export const decryptMnemonic = (cipherText: string, key: crypto.lib.WordArray, iv: string) => {
    return crypto.AES.decrypt(cipherText, key.toString(), {
        iv: crypto.enc.Hex.parse(iv)
    });
}

export const randomWordArray = (length: number) => {
    return crypto.lib.WordArray.random(length);
}

export const toHex = (buffer: Uint8Array) => {
    return Array.from(buffer).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const encryptString = (str: string, key: crypto.lib.WordArray, iv: string) => {
    return crypto.AES.encrypt(str, key, {
        iv: crypto.enc.Hex.parse(iv),
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
    }).toString();
}

export const decryptString = (cipherText: string, key: crypto.lib.WordArray, iv: string) => {
    return crypto.AES.decrypt(cipherText, key, {
        iv: crypto.enc.Hex.parse(iv),
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
    }).toString(crypto.enc.Utf8);
}