import crypto from "crypto-js"


export const PKBDF2 = (password: string, salt: string) => {
    return crypto.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000
    });
}

export const encrypt = (mnemonic: string, key: crypto.lib.WordArray, iv: string) => {
    return crypto.AES.encrypt(mnemonic, key, {
        iv: crypto.enc.Hex.parse(iv)
    });
}

export const randomWordArray = (length: number) => {
    return crypto.lib.WordArray.random(length);
}