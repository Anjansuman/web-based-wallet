import type { Account } from "../types/AccountType"

export interface MnemonicStore {
    mnemonic: string,
    setMnemonic: (mnemonic: string) => void,
    removeMnemonic: () => void
}

export interface AccountStore {
    accounts: Account[],
    setAccounts: (accounts: Account[]) => void,
    removeAccounts: () => void,
    addAccount: (account: Account) => void,
    deleteAccount: (publicKey: string) => void
}

export interface CurrentValues {
    network: string,
    account: Account | null,
    setNetwork: (network: string) => void,
    setAccount: (account: Account) => void
}

export type Pages = "loading" | "import" | "setPassword" | "unlock" | "dashboard";

export interface PageStore {
    page: Pages,
    setPage: (page: Pages) => void
}