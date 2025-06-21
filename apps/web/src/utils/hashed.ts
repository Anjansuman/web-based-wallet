import crypto from "crypto-js";
import { usePopUp } from "../context/PopUpPanelContext";
import type { Account, AccountType2 } from "../types/AccountType";

export class hashed {
    private mnemonic: string = "";

    private salt: string;
    private iv: string;
    private key: crypto.lib.WordArray | null = null;

    private password: string = "";

    private totalAccounts: number = 0;

    constructor(salt: string, iv: string) {
        this.salt = salt;
        this.iv = iv;
    }

    public setKey(key: crypto.lib.WordArray) {
        this.key = key;
    }

    public PKBDF2(password: string) {
        this.password = password;
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

    public encryptString(str: string, key: crypto.lib.WordArray, iv: string) {
        return crypto.AES.encrypt(str, key, {
            iv: crypto.enc.Hex.parse(iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString();
    }

    public decryptString(cipherText: string, key: crypto.lib.WordArray, iv: string) {
        return crypto.AES.decrypt(cipherText, key, {
            iv: crypto.enc.Hex.parse(iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString(crypto.enc.Utf8);
    }

    public toHex(buffer: Uint8Array) {
        return Array.from(buffer).map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    public fetchChromeData(localName: string, password?: string) {
        switch (localName) {
            case "vault":
                return this.fetchAndDecryptAccounts();
            case "accounts":
                return this.fetchAndDecryptSeedPhrase(password!);
            default:
                break;
        }
    }

    public fetchAndDecryptAccounts(): Promise<Account[]> | void {

        const { showPanel } = usePopUp();

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("accounts", (data) => {
                        const accounts: AccountType2[] = data.accounts;

                        const decryptedAccounts = accounts.map((acc) => {
                            const account = this.decryptString(acc.account, this.key!, this.iv);
                            return JSON.parse(account);
                        });

                        const allAccounts: Account[] = decryptedAccounts.map((acc, i) => ({
                            name: accounts[i].name,
                            privateKey: acc.privateKey,
                            publicKey: acc.publicKey
                        }));

                        this.totalAccounts = allAccounts.length;

                        resolve(allAccounts);

                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            showPanel("Error occured while entering password", "error");
            return;
        }
    }

    public createAccount() {
        
    }

    public deleteAccount() {

    }

    public fetchAndDecryptSeedPhrase(password: string): Promise<string> | void {

        const { showPanel } = usePopUp();

        if(this.password ! == password) {
            showPanel("Wrong passwrd", "error");
            return;
        }

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("vault", (data) => {

                        const { ciphertext } = data.vault;

                        const key = this.PKBDF2(password);
                        const decryptedSeed = this.decryptMnemonic(ciphertext, key).toString();

                        resolve(decryptedSeed);
                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            showPanel("Failed to show seed phrase", "error");
            return;
        }
    }

}