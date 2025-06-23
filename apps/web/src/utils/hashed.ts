import crypto from "crypto-js";
import { usePopUp } from "../context/PopUpPanelContext";
import type { Account, AccountType2, KeyPair } from "../types/AccountType";
import { Wallet } from "@ethereumjs/wallet";
import { useHashed } from "../context/HashedAtom";
import { mnemonicToSeedSync } from "@scure/bip39";
import type { NetworkType } from "../types/NetworkType";
import { HDKey } from "@scure/bip32";

export class Hashed {

    private mnemonic: string = "";

    private salt: string;
    private iv: string;
    private key: crypto.lib.WordArray | null = null;

    private password: string = "";

    private accounts: Account[] | null = null;

    private currentSeedAccount: number = 0;

    private selectedAccount: Account | null = null;
    private selectedNetwork: NetworkType | null = null;

    constructor(salt?: string, iv?: string, password?: string, key?: crypto.lib.WordArray, mnemonic?: string) {
        this.salt = salt!;
        this.iv = iv!;
        this.password = password!;
        this.key = key!;
        this.mnemonic = mnemonic!;
    }

    //  <------------------ MANAGERS ------------------>

    public fetchChromeData(localName: string, password?: string) {
        switch (localName) {
            case "accounts":
                return this.fetchAndDecryptAccounts();
            case "vault":
                return this.fetchAndDecryptSeedPhrase(password!);
            default:
                break;
        }
    }

    //  <------------------ ENCRYPTION/DECRYPTION ------------------>

    public encryptMnemonic(): string {

        if (!this.key || !this.iv) {
            this.showPanel("Unwanted error while encrypting seed phrase / mnemonic", "error");
            return "";
        }

        return crypto.AES.encrypt(this.mnemonic, this.key, {
            iv: crypto.enc.Hex.parse(this.iv)
        }).toString();
    }

    public decryptMnemonic(cipherText: crypto.lib.CipherParams): string {

        if (!this.key || !this.iv) {
            this.showPanel("Unwanted error while encrypting seed phrase / mnemonic", "error");
            return "";
        }

        return crypto.AES.decrypt(cipherText, this.key.toString(), {
            iv: crypto.enc.Hex.parse(this.iv)
        }).toString();
    }

    public encryptString(str: string): string {

        if (!this.key || !this.iv) {
            this.showPanel("Unwanted error while encrypting seed phrase / mnemonic", "error");
            return "";
        }

        return crypto.AES.encrypt(str, this.key, {
            iv: crypto.enc.Hex.parse(this.iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString();
    }

    public decryptString(cipherText: string): string {

        if (!this.key || !this.iv) {
            this.showPanel("Unwanted error while encrypting seed phrase / mnemonic", "error");
            return "";
        }

        return crypto.AES.decrypt(cipherText, this.key, {
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

    public mnemonicToSeedSync(mnemonic: string): Uint8Array {
        return mnemonicToSeedSync(mnemonic);
    }

    // <------------------ ACCOUNTS ------------------>

    private fetchAndDecryptAccounts(): Promise<Account[]> | void {

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("accounts", (data) => {
                        const accounts: AccountType2[] = data.accounts;

                        const decryptedAccounts = accounts.map((acc) => {
                            const account = this.decryptString(acc.account);
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

    // todo
    public createAccountFromSeed(): void {
        if (!this.mnemonic) {
            this.showPanel("Unable to fetch seed phrase for creation of account", "error");
            return;
        }
        // problem is ki account create to kr le but pehle fetch krna padega ki kitna account is seed se bana h kyunki wallet me imported accounts bhi rahenge
        // increase the currentSeedAccount var here if a seed account gets created
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

            const hashedKey = this.encryptString(str);

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

    public setSelectedAccount(index: number): void {

        if (!this.accounts) {
            this.showPanel("Unable to fetch accounts", "error");
            return;
        }

        this.selectedAccount = this.accounts[index];
    }

    public getSelectedAccount(): Account | null {
        return this.selectedAccount;
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

                        // const key = this.PKBDF2(password);
                        const decryptedSeed = this.decryptMnemonic(ciphertext).toString();

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

    public setMnemonic(mnemonic: string): void {
        this.mnemonic = mnemonic;
    }

    public getMnemonic(): string {
        if (!this.mnemonic) {
            this.showPanel("Unable to fetch seed phrase / mnemonic", "error");
            return "";
        }
        return this.mnemonic;
    }

    // <------------------ ALGORITHMS ------------------>

    public PKBDF2(password: string): crypto.lib.WordArray {
        this.password = password;
        return crypto.PBKDF2(password, this.salt!, {
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

    // <------------------ PASSWORD ------------------>

    public setPassword(password: string): void {
        this.password = password;
    }

    // <------------------ WALLET ------------------>

    public unlockWallet(ciphertext: crypto.lib.CipherParams): boolean { // this will be used to unlock wallet

        // password should be set at initialization
        if (!this.password) {
            this.emptyHashedState();
            return false;
        }

        this.key = this.PKBDF2(this.password);
        this.mnemonic = this.decryptMnemonic(ciphertext);

        if (!this.mnemonic) {
            this.emptyHashedState();
            return false;
        }

        return true;
    }

    public lockWallet(): void {
        this.emptyHashedState();
    }

    public setWalletPassword(password: string, mnemonic: string): boolean { // This will be used to set password for the first time
        try {

            this.mnemonic = mnemonic;
            this.salt = this.randomWordArray(16).toString();
            this.key = this.PKBDF2(password);
            this.iv = this.randomWordArray(16).toString();

            const ciphertext = this.encryptMnemonic();

            const vault = {
                ciphertext: ciphertext,
                salt: this.salt,
                iv: this.salt
            };

            const seed = this.mnemonicToSeedSync(mnemonic);

            const keypair = this.generateKeyPair(seed);

            if(!keypair) {
                this.showPanel("Key-pair generation failed!", "error");
                this.currentSeedAccount--;
                return false;
            }

            const { privateKey, publicKey } = keypair;

            const str = JSON.stringify({
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey)
            });

            const accHash = this.encryptString(str);

            const accounts: AccountType2[] = [{
                name: "Account 1",
                account: accHash
            }];

            chrome.storage.local.set({ vault });

            chrome.storage.local.set({ accounts });

            return true;

        } catch (error) {

        }
    }

    private getPath(): string {
        return `m/44'/60'/0'/0/${this.currentSeedAccount}`;
    }

    // <------------------ NETWORK ------------------>

    public setSelectedNetwork(name: string, RPC: string): void {
        this.selectedNetwork = {
            name: name,
            RPC: RPC
        }
    }

    public getSelectedNetwork(): NetworkType | null {
        return this.selectedNetwork;
    }

    // <------------------ UTILS ------------------>

    public setKey(key: crypto.lib.WordArray): void {
        this.key = key;
    }

    public setSalt(salt: string): void {
        this.salt = salt;
    }

    public setIv(iv: string): void {
        this.iv = iv;
    }

    public showPanel(message: string, type: "success" | "error"): void {
        const { showPanel } = usePopUp();
        showPanel(message, type);
    }

    public emptyHashedState(): void { // use it when required only
        const { removeHashed } = useHashed();
        removeHashed();
    }

    public changeWalletPassword() {

    }

    public generateKeyPair(seed: Uint8Array): KeyPair | null {

        const path = this.getPath();

        const hdNode = HDKey.fromMasterSeed(seed);
        const child = hdNode.derive(path);

        if (!child || !child.privateKey) {
            this.showPanel("key-pair generation failed!", "error");
            return null;
        }

        this.currentSeedAccount++;

        const wallet = Wallet.fromPrivateKey(child.privateKey);

        const privateKey = "0x" + this.toHex(wallet.getPrivateKey());
        const publicKey = "0x" + this.toHex(wallet.getPublicKey());

        return {
            privateKey,
            publicKey
        };

    }

}