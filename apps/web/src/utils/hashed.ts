import crypto from "crypto-js";
// import { usePopUp } from "../context/PopUpPanelContext";
import type { Account, AccountType2, KeyPair } from "../types/AccountType";
import type { NetworkType } from "../types/NetworkType";
// import { usePopUp } from "../context/PopUpPanelContext";
import axios from "axios";
import { HDNodeWallet, Wallet } from "ethers";
import { Mnemonic } from "ethers";

export class Hashed {

    private mnemonic: string = "";

    private salt: string;
    private iv: string;
    private key: crypto.lib.WordArray | null = null;

    private password: string = "";

    private accounts: Account[] = [];

    private currentSeedAccount: number = 0;

    private selectedAccount: Account | null = null;
    private selectedNetwork: NetworkType | null = null;
    private selectedAccountBalance: number = 0;

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

        console.log("key: ", this.key);
        console.log("iv: ", this.iv);

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

        const str = crypto.AES.decrypt(cipherText, this.key, {
            iv: crypto.enc.Hex.parse(this.iv),
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        }).toString(crypto.enc.Utf8);

        return str;
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

    private fetchAndDecryptAccounts(): Promise<Account[]> | null {

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("accounts", (data) => {
                        const accounts: AccountType2[] = data.accounts;

                        const decryptedAccounts = accounts.map((acc) => {
                            const account = this.decryptString(acc.account);

                            const parsed = JSON.parse(account);
                            return parsed;
                        });

                        const allAccounts: Account[] = decryptedAccounts.map((acc, i) => ({
                            name: accounts[i].name,
                            privateKey: acc.privateKey,
                            publicKey: acc.publicKey,
                            derivedAccountNum: acc.derivedAccountNum
                        }));


                        this.accounts = allAccounts;
                        console.log("this.accounts: ", this.accounts);

                        resolve(allAccounts);

                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            console.log(error);
            this.showPanel("Error occured while entering password", "error");
            return null;
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

    public getAccounts(): Account[] {
        return this.accounts;
    }

    public setSelectedAccount(index: number): void {

        if (!this.accounts) {
            this.showPanel("Unable to fetch accounts", "error");
            return;
        }

        this.selectedAccount = this.accounts[index];
    }

    public getSelectedAccount(): Account {
        return this.selectedAccount || this.accounts[0];
    }

    // <------------------ MNEMONICS ------------------>

    public async generateMnemonic(): Promise<string> {

        const entropy = new Uint8Array(16);
        window.crypto.getRandomValues(entropy);

        this.mnemonic = Mnemonic.entropyToPhrase(entropy);

        return this.mnemonic;
    }

    private fetchAndDecryptSeedPhrase(password: string): Promise<string> | null {

        if (this.password !== password) {
            this.showPanel("Wrong passwrd", "error");
            return null;
        }

        try {

            return new Promise((resolve, reject) => {
                try {
                    chrome.storage.local.get("vault", (data) => {

                        const { ciphertext, salt, iv } = data.vault;

                        // if (!this.salt) this.salt = salt;
                        // if (!this.iv) this.iv = iv;

                        this.iv = iv;
                        this.salt = salt;

                        this.key = this.PKBDF2(password);
                        const decryptedSeed = this.decryptMnemonic(ciphertext);

                        this.mnemonic = decryptedSeed;

                        resolve(decryptedSeed);
                    });
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            this.showPanel("Failed to show seed phrase", "error");
            return null;
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
        const wallet = new Wallet(privateKey);
        return wallet.address;
    }

    // <------------------ DETAILS ------------------>

    // <------------------ PASSWORD ------------------>

    public setPassword(password: string): void {
        this.password = password;
    }

    // <------------------ WALLET ------------------>

    public async unlockWallet(password: string): Promise<boolean> { // this will be used to unlock wallet

        if (!password) return false;

        this.password = password;

        this.mnemonic = await this.fetchAndDecryptSeedPhrase(password)!;

        this.accounts = await this.fetchAndDecryptAccounts()!;

        this.setSelectedAccount(0);

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

            console.log("password: ", password);
            console.log("mnemonic: ", this.mnemonic);
            console.log("salt: ", this.salt);
            console.log("key: ", this.key);
            console.log("iv: ", this.iv);

            const ciphertext = this.encryptMnemonic();

            const vault = {
                ciphertext: ciphertext,
                salt: this.salt,
                iv: this.iv
            };

            const keypair = this.generateKeyPair();

            if (!keypair) {
                this.showPanel("Key-pair generation failed!", "error");
                this.currentSeedAccount--;
                return false;
            }

            const { privateKey, publicKey } = keypair;

            console.log("privateKey: ", privateKey);
            console.log("publicKey: ", publicKey);

            const str = JSON.stringify({
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey),
                derivedAccountNum: 0
            });

            console.log(str);

            const accHash = this.encryptString(str);

            const accounts: AccountType2[] = [{
                name: "Account 1",
                account: accHash
            }];

            chrome.storage.local.set({ vault });

            chrome.storage.local.set({ accounts });

            return true;

        } catch (error) {
            console.log("error: ", error);
            this.showPanel("Setting password failed", "error");
            return false;
        }
    }

    public importAccount(name: string, privateKey: string): boolean {
        try {

            if (this.accounts.some(acc => acc.privateKey === privateKey)) return false;

            const publicKey = this.getPublicKey(privateKey);

            const str = JSON.stringify({
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey),
                derivedAccountNum: -1
            });

            this.accounts.push({
                name: name,
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey),
                derivedAccountNum: -1 // -1 means it is not derived from seed phrase
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

            return true;

        } catch (error) {
            this.showPanel("Unable to import account", "error");
            return false;
        }
    }

    public createAccountFromSeed(name: string): boolean {
        try {

            const keypair = this.generateKeyPair();

            if (!keypair) {
                console.log("keypair creation failed");
                this.showPanel("Account creation failed", "error");
                return false;
            }

            const { privateKey, publicKey } = keypair;

            const details = JSON.stringify({
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey),
                derivedAccountNum: this.currentSeedAccount
            });

            this.accounts.push({
                name: name,
                privateKey: privateKey.startsWith("0x") ? privateKey : ("0x" + privateKey),
                publicKey: publicKey.startsWith("0x") ? publicKey : ("0x" + publicKey),
                derivedAccountNum: this.currentSeedAccount
            });

            const hashedDetails = this.encryptString(details);

            const newAccount: AccountType2 = {
                name: name,
                account: hashedDetails
            };

            chrome.storage.local.get("accounts", (data) => {
                const accounts: AccountType2[] = data.accounts;
                accounts.push(newAccount);
                chrome.storage.local.set({ accounts });
            })

            return true;

        } catch (error) {
            console.log(error);
            this.showPanel("Account creation failed", "error");
            return false
        }
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
        // const { showPanel } = usePopUp();
        // showPanel(message, type);
        console.log("type: ", type);
        console.log("message: ", message);
    }

    public emptyHashedState(): void { // use it when required only
        // EmptyHashedState();
    }

    public changeWalletPassword() {

    }

    public generateKeyPair(): KeyPair | null {

        // const seed = this.mnemonicToSeed(this.mnemonic);

        const path = this.getPath();
        const mnemonicObject = Mnemonic.fromPhrase(this.mnemonic);
        const wallet = HDNodeWallet.fromMnemonic(mnemonicObject, path);

        this.currentSeedAccount++;

        const privateKey = wallet.privateKey.startsWith("0x") ? wallet.privateKey : "0x" + wallet.privateKey;
        const publicKey = wallet.address.startsWith("0x") ? wallet.address : "0x" + wallet.address;

        return {
            privateKey: privateKey,
            publicKey: publicKey
        };

    }

    private getPath(): string {
        return `m/44'/60'/0'/0/${this.currentSeedAccount}`;
    }

    public async setBalanceOfCurrentAccount() {

        const address = this.selectedAccount;

        const data = {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1
        };

        const res = await axios.post("https://cloudflare-eth.com", data, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        const weiHex = await res.data.result;
        const wei = BigInt(weiHex);
        const eth = Number(wei) / 1e18;

        this.selectedAccountBalance = eth;

        return eth;

    }

    public getBalanceofCurrentAccount() {
        return this.selectedAccountBalance;
    }

}