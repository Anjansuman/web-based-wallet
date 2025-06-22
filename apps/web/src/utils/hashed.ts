import crypto from "crypto-js";
import { usePopUp } from "../context/PopUpPanelContext";
import type { Account, AccountType2 } from "../types/AccountType";
import { Wallet } from "@ethereumjs/wallet";

export class Hashed {

    private mnemonic: string = "";

    private salt: string;
    private iv: string;
    private key: crypto.lib.WordArray | null = null;

    private password: string = "";

    private accounts: Account[] | null = null;

    constructor(salt: string, iv: string, password?: string, key?: crypto.lib.WordArray, mnemonic?: string) {
        this.salt = salt;
        this.iv = iv;
        this.password = password!;
        this.key = key!;
        this.mnemonic = mnemonic!;
    }

    //  <------------------ MANAGERS ------------------>

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

    //  <------------------ ENCRYPTION/DECRYPTION ------------------>

    public encryptMnemonic(mnemonic: string, key: crypto.lib.WordArray): crypto.lib.CipherParams {
        this.mnemonic = mnemonic;
        return crypto.AES.encrypt(this.mnemonic, key, {
            iv: crypto.enc.Hex.parse(this.iv)
        });
    }

    public decryptMnemonic(cipherText: string, key: crypto.lib.WordArray): crypto.lib.WordArray {
        return crypto.AES.decrypt(cipherText, key.toString(), {
            iv: crypto.enc.Hex.parse(this.iv)
        });
    }

    public encryptString(str: string, key: crypto.lib.WordArray): string {
        return crypto.AES.encrypt(str, key, {
            iv: crypto.enc.Hex.parse(this.iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString();
    }

    public decryptString(cipherText: string, key: crypto.lib.WordArray): string {
        return crypto.AES.decrypt(cipherText, key, {
            iv: crypto.enc.Hex.parse(this.iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString(crypto.enc.Utf8);
    }

    // <------------------ TYPE CONVERSION ------------------>

    public toHex(buffer: Uint8Array): string {
        return Array.from(buffer).map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    public toBytes(hex: string): Uint8Array {
        if (hex.startsWith("0x")) hex.slice(2);
        const bytes = new Uint8Array(hex.length / 2);

        for (let i = 0; i < hex.length; i++) {
            bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return bytes;
    }

    // <------------------ ACCOUNTS ------------------>

    // todo
    public createAccount(): void {
        if (!this.mnemonic) {
            this.showPanel("Unable to fetch seed phrase for creation of account", "error");
            return;
        }
        // problem is ki account create to kr le but pehle fetch krna padega ki kitna account is seed se bana h kyunki wallet me imported accounts bhi rahenge

    }

    public importAccount(name: string, privateKey: string): void {
        try {

            const publicKey = this.getPublicKey(privateKey);

            const str = JSON.stringify({
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey)
            });

            this.accounts?.push({
                name: name,
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey)
            });

            const hashedKey = this.encryptString(str, this.key!);

            const newAccount: AccountType2 = {
                name: name,
                account: hashedKey
            };

            chrome.storage.local.get("accounts", (data) => {
                const accounts: AccountType2[] = data.accounts;

                accounts.push(newAccount);

                chrome.storage.local.set({ accounts });

            });

        } catch (error) {
            this.showPanel("Unable to import account", "error");
        }
    }

    public deleteAccount(name: string, publicKey: string): void {
        if (!this.accounts) {
            this.showPanel("Unable to fetch accounts", "error");
            return;
        }

        // const accountIndex: number | undefined = this.accounts.find((acc, index): number | undefined => {
        //     if(acc.name === name && acc.publicKey === publicKey) {
        //         return index;
        //     }
        // });

        let accountIndex = 0;

        for (let i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].name === name && this.accounts[i].publicKey === publicKey) {
                accountIndex = i;
                break;
            }
        }

        if (!accountIndex) {
            this.showPanel("Account doesn't exist", "error");
            return;
        }

        // removed from the state
        const allAccounts = this.accounts.map((acc) => {
            if (acc.name !== name && acc.publicKey !== publicKey) return acc;
        });

        if (!allAccounts || allAccounts.length === 0 || typeof allAccounts === undefined) {
            this.showPanel("No accounts left!", "error");
            return;
        }

        // correct this
        this.accounts = allAccounts as Account[];

        chrome.storage.local.get("accounts", (data) => {
            let accounts: AccountType2[] = data.accounts;

            // map over this accounts and remove the deleting account
            const updatedAccounts: (AccountType2 | undefined)[] = accounts.map((acc, index) => {
                if (index !== accountIndex) {
                    return acc;
                }
            });

            if (!updatedAccounts) {
                return;
            }

            // fix this [i think there's security issues]
            accounts = updatedAccounts as AccountType2[];
            chrome.storage.local.set({ accounts });

        })

    }

    public getAccounts(): Account[] | void {

        if (!this.accounts) {
            this.showPanel("Unable to fetch accounts", "error");
            return;
        }

        return this.accounts;
    }

    private fetchAndDecryptAccounts(): Promise<Account[]> | void {

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("accounts", (data) => {
                        const accounts: AccountType2[] = data.accounts;

                        const decryptedAccounts = accounts.map((acc) => {
                            const account = this.decryptString(acc.account, this.key!);
                            return JSON.parse(account);
                        });

                        const allAccounts: Account[] = decryptedAccounts.map((acc, i) => ({
                            name: accounts[i].name,
                            privateKey: acc.privateKey,
                            publicKey: acc.publicKey
                        }));

                        this.accounts = allAccounts;

                        resolve(allAccounts);

                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            this.showPanel("Error occured while entering password", "error");
            return;
        }
    }

    // <------------------ MNEMONICS ------------------>

    private fetchAndDecryptSeedPhrase(password: string): Promise<string> | void {

        if (this.password! == password) {
            this.showPanel("Wrong passwrd", "error");
            return;
        }

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("vault", (data) => {

                        const { ciphertext } = data.vault;

                        const key = this.PKBDF2(password);
                        const decryptedSeed = this.decryptMnemonic(ciphertext, key).toString();

                        this.mnemonic = decryptedSeed;
                        resolve(decryptedSeed);
                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            this.showPanel("Failed to show seed phrase", "error");
            return;
        }
    }

    public getMnemonic(): string {
        if(!this.mnemonic) {
            this.showPanel("Unable to fetch seed phrase / mnemonic", "error");
            return "";
        }
        return this.mnemonic;
    }

    // <------------------ ALGORITHMS ------------------>

    public PKBDF2(password: string): crypto.lib.WordArray {
        this.password = password;
        return crypto.PBKDF2(password, this.salt, {
            keySize: 256 / 32,
            iterations: 100000
        });
    }

    public randomWordArray(length: number): crypto.lib.WordArray {
        return crypto.lib.WordArray.random(length);
    }

    public getPublicKey(privateKey: string): string {
        const bufferedPrivateKey = this.toBytes(privateKey);
        const wallet = Wallet.fromPrivateKey(bufferedPrivateKey);
        const publicKey = "0x" + this.toHex(wallet.getPublicKey());

        return publicKey;
    }

    // <------------------ DETAILS ------------------>

    // <------------------ UTILS ------------------>

    public setKey(key: crypto.lib.WordArray): void {
        this.key = key;
    }

    public showPanel(message: string, type: "success" | "error") {
        const { showPanel } = usePopUp();
        showPanel(message, type);
    }

}