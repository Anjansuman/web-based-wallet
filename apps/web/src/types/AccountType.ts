import crypto from "crypto-js";

export interface AccountType {
    name: string,
    account: crypto.lib.CipherParams
}