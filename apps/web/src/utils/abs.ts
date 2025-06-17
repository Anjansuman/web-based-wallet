import crypto from "crypto-js";

export class hashed {
    private salt: string;
    private iv: string;
    private mnemonic: string = "";

    constructor(salt: string, iv: string) {
        this.salt = salt;
        this.iv = iv;
    }

    public PKBDF2(password: string) {
        return crypto.PBKDF2(password, this.salt, {
            keySize: 256 / 32,
            iterations: 100000
        });
    }

    public encryptMnemonic(mnemonic: string, key: crypto.lib.WordArray) {
        this.mnemonic = mnemonic;
        return crypto.AES.encrypt(this.mnemonic, key, {
            iv: crypto.enc.Hex.parse(this.iv)
        });
    }

    public decryptMnemonic(cipherText: string, key: crypto.lib.WordArray) {
        return crypto.AES.decrypt(cipherText, key.toString(), {
            iv: crypto.enc.Hex.parse(this.iv)
        });
    }

    public randomWordArray(length: number) {
        return crypto.lib.WordArray.random(length);
    }

    public toHex(buffer: Uint8Array) {
    return Array.from(buffer).map((b) => b.toString(16).padStart(2, "0")).join("");
}

}