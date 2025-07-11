import crypto from "crypto-js";

export interface AccountType {
    name: string,
    account: crypto.lib.CipherParams
}

export interface AccountType2 {
    account: string,
    name: string
}

export interface Account {
    name: string,
    privateKey: string,
    publicKey: string,
    derivedAccountNum: number
}

export interface KeyPair {
    privateKey: string,
    publicKey: string
}