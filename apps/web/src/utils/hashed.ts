import crypto from "crypto-js";
import { HDNodeWallet, Wallet, Mnemonic, parseEther, parseUnits, formatEther } from "ethers";

import type { Account, AccountType2, KeyPair } from "../types/AccountType";
import { Networks, RPC } from "./rpcURLs";
import { JsonRpcProvider } from "ethers";
import type { TransactionReceipt } from "ethers";
// import { usePopUp } from "../context/PopUpPanelContext";

export class Hashed {

    private mnemonic: string = "";

    private salt: string;
    private iv: string;
    private key: crypto.lib.WordArray | null = null;

    private password: string = "";

    private accounts: Account[] = [];

    private currentSeedAccount: number = 0;

    private selectedAccount: Account | null = null;
    private selectedNetwork: Networks | null = null;
    private selectedAccountBalance: { token: string, USD: string } = { token: "", USD: "" };

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

    public decryptMnemonic(cipherText: crypto.lib.CipherParams | string): string {
        if (!this.key || !this.iv) {
            this.showPanel("Unwanted error while decrypting seed phrase / mnemonic", "error");
            return "";
        }

        const bytes = crypto.AES.decrypt(cipherText, this.key, {
            iv: crypto.enc.Hex.parse(this.iv),
        });

        const decrypted = bytes.toString(crypto.enc.Utf8);

        if (!decrypted || decrypted.trim().split(" ").length < 12) {
            this.showPanel("Decryption failed: Invalid seed phrase", "error");
            return "";
        }

        return decrypted;
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
                            privateKey: acc.privateKey!,
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

    public getAccounts(): Account[] {
        return this.accounts;
    }

    public setSelectedAccount(acc: Account): void {

        if (!this.accounts) {
            this.showPanel("Unable to fetch accounts", "error");
            return;
        }

        if(!this.accounts.some((account) => account === acc)) {
            this.showPanel("Unable to set accounts", "error");
            return;
        }

        this.selectedAccount = acc;
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

                        console.log("salt: ", this.salt);
                        console.log("key: ", this.key);
                        console.log("iv: ", this.iv);
                        console.log("ciphertext: ", ciphertext);

                        const decryptedSeed = this.decryptMnemonic(ciphertext);

                        console.log("decrypted seed: ", decryptedSeed);

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

    public getPassword(): string {
        return this.password;
    }

    // <------------------ WALLET ------------------>

    public async unlockWallet(password: string): Promise<boolean> { // this will be used to unlock wallet

        if (!password) return false;

        this.password = password;

        this.mnemonic = await this.fetchAndDecryptSeedPhrase(password)!;
        console.log("mnemonic: ", this.mnemonic);

        this.accounts = await this.fetchAndDecryptAccounts()!;

        this.setSelectedAccount(this.accounts[0]);
        this.setCurrentSeedIndex();
        this.setSelectedNetwork();

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

            console.log("ciphertext: ", ciphertext);

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

            const network = Networks.Ethereum_Mainnet;

            chrome.storage.local.set({ network });

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
                derivedAccountNum: -1 // -1 means it is not derived from seed phrase and is imported
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

            console.log("current seed account: ", this.currentSeedAccount);

            const keypair = this.generateKeyPair();

            if (!keypair) {
                this.currentSeedAccount--;
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

    public addWatchAccount(name: string, publicKey: string): boolean {
        try {

            const newAccount: Account = {
                name: name,
                publicKey: publicKey,
                derivedAccountNum: -2
            }

            this.accounts.push(newAccount);

            // encrypting the new account
            const str = JSON.stringify({
                publicKey: publicKey,
                derivedAccountNum: -2
            });

            const hashedAccount = this.encryptString(str);

            chrome.storage.local.get("accounts", (data) => {

                const accounts: AccountType2[] = data.accounts;

                accounts.push({
                    account: hashedAccount,
                    name: name
                });

                chrome.storage.local.set({ accounts });

            });

            return true;

        } catch (error) {
            this.showPanel("failed to add watch address", "error");
            return false;
        }
    }

    public deleteAccount(name: string, publicKey: string): boolean {
        try {
            if (!this.accounts) {
                this.showPanel("Unable to fetch accounts", "error");
                return false;
            }

            // First check if theres only one account left or not
            if (this.accounts.length <= 1) {
                this.showPanel("Can't delete account", "error");
                return false;
            }

            const accountIndex = this.accounts.findIndex((acc) => (acc.name === name && acc.publicKey === publicKey));

            if (!accountIndex) {
                this.showPanel("Account doesn't exist", "error");
                return false;
            }

            let allAccounts: Account[] = [];

            // removed from the state
            this.accounts.map((acc) => {
                if (acc.name !== name && acc.publicKey !== publicKey) {
                    allAccounts.push(acc);
                }
            });

            if (!allAccounts || allAccounts.length === 0 || typeof allAccounts === undefined) {
                this.showPanel("No accounts left!", "error");
                return false;
            }

            // correct this
            this.accounts = allAccounts;

            // deleting from the local storage
            chrome.storage.local.get("accounts", (data) => {
                let accounts: AccountType2[] = data.accounts;

                // map over this accounts and remove the deleting account
                const updatedAccounts: AccountType2[] = accounts.filter((acc, index) => {
                    if (index !== accountIndex) {
                        return acc;
                    }
                })

                // can't directly push the accounts, first we have to encrypt it

                if (!updatedAccounts) {
                    return false;
                }

                // fix this [i think there's security issues]
                accounts = updatedAccounts;
                chrome.storage.local.set({ accounts });

            });

            // this will set the seed account index automatically, cause we don't user will delete which account
            this.setCurrentSeedIndex();

            return true;

        } catch (error) {
            this.showPanel("Can't delete account", "error");
            return false;
        }
    }

    public changePassword(password: string): boolean {
        try {

            this.password = password;

            return true;

        } catch (error) {
            this.showPanel("Failed to change password", "error");
            return false;
        }
    }

    public async signTransaction(to: string, amount: string): Promise<{ done: boolean, receipt?: TransactionReceipt | null }> {
        try {

            if (!this.selectedNetwork) return { done: false };

            if (!this.selectedAccount || !this.selectedAccount.privateKey) return { done: false };

            const RPC_URL = RPC[this.selectedNetwork];
            const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

            const provider = new JsonRpcProvider(`${RPC_URL}${API_KEY}`);

            const wallet = new Wallet(this.selectedAccount.privateKey, provider);

            const tx = {
                to: to,
                value: parseEther(amount),
                gasLimit: 21000,
                maxFeePerGas: parseUnits("30", "gwei"),
                maxPriorityFeePerGas: parseUnits("2", "gwei")
            };

            const response = await wallet.sendTransaction(tx);
            const receipt = await response.wait();

            return { done: true, receipt: receipt };

        } catch (error) {
            this.showPanel("Transaction failed!", "error");
            return { done: false };
        }
    }

    public changeNetwork(network: Networks): boolean {
        try {

            chrome.storage.local.set({ network });

            return true;

        } catch (error) {
            this.showPanel("Failed to change network", "error");
            return false;
        }
    }

    // <------------------ NETWORK ------------------>


    public setSelectedNetwork() {
        try {

            chrome.storage.local.get("network", (data) => {
                this.selectedNetwork = data.network;
                console.log("data.network: ", data.network);
                console.log("selected network: ", this.selectedNetwork);
            });

        } catch (error) {
            this.showPanel("failed to set network", "error");
            return;
        }
    }

    public getSelectedNetwork(): Networks | null {
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

        console.log(this.mnemonic);

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

    private setCurrentSeedIndex(): void { // this will be used to set current seed account number to derive accounts further
        let highestValue: number = 0;

        this.accounts.map((acc) => {
            if (acc.derivedAccountNum > highestValue) {
                highestValue = acc.derivedAccountNum;
            }
        });

        this.currentSeedAccount = highestValue + 1;

    }

    public async setBalanceOfCurrentAccount(): Promise<{ token: string, USD: string } | null> {
        try {

            console.log("selected account: ", this.selectedAccount);
            console.log("selected network: ", this.selectedNetwork);

            if (!this.selectedNetwork) return null;

            if (!this.selectedAccount || !this.selectedAccount.privateKey) return null;

            const RPC_URL = RPC[this.selectedNetwork];
            const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

            const provider = new JsonRpcProvider(`${RPC_URL}${API_KEY}`);

            console.log("provider: ", provider);

            const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
            const valueOfETHinUSD = (await res.json()).ethereum.usd;

            const balanceWEI = await provider.getBalance(this.selectedAccount.publicKey);
            const balanceETH = formatEther(balanceWEI);
            const balanceUSD = (Number(valueOfETHinUSD) * Number(valueOfETHinUSD)).toString();

            console.log("balance in WEI: ", balanceWEI);
            console.log("balance in ETH: ", balanceETH);

            this.selectedAccountBalance = {
                token: balanceETH,
                USD: balanceUSD
            };

            return { token: balanceETH, USD: balanceUSD };

        } catch (error) {
            this.showPanel("failed to fetch balance", "error");
            return null;
        }
    }

    public getBalanceofCurrentAccount(): { token: string, USD: string } {
        return this.selectedAccountBalance;
    }

}