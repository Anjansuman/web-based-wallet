import crypto from "crypto-js";

export interface AccountType {
    name: string,
    account: crypto.lib.CipherParams
}

export interface AccountType2 {
    account: string,
    name: string
}

// Private key is set to optional cause of watch account
export interface Account {
    name: string,
    privateKey?: string,
    publicKey: string,
    derivedAccountNum: number // -1 for imported, -2 for watch, else greater than 0 for seed accounts
}

export interface KeyPair {
    privateKey: string,
    publicKey: string
}

export interface SavedAddress {
    name: string,
    publicKey: string
}