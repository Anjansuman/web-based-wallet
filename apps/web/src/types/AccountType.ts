import crypto from "crypto-js";

export interface AccountType {
    name: string,
    account: crypto.lib.CipherParams
}

export interface AccountType2 {
    name: string,
    account: string
}

export interface Account {
    name: string,
    privateKey: string,
    publicKey: string
}