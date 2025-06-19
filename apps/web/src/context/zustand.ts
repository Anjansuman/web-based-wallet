import { create } from "zustand";
import type { Account } from "../types/AccountType";

interface MnemonicStore {
    mnemonic: string,
    setMnemonic: (mnemonic: string) => void,
    removeMnemonic: () => void
}

export const useMnemonic = create<MnemonicStore>((set) => ({
    mnemonic: "",
    setMnemonic: (mnemonic) => set({
        mnemonic: mnemonic
    }),
    removeMnemonic: () => set({
        mnemonic: ""
    })
}));

interface AccountStore {
    accounts: Account[],
    setAccounts: (accounts: Account[]) => void,
    removeAccounts: () => void,
    addAccount: (account: Account) => void,
    deleteAccount: (publicKey: string) => void
}

export const useAccount = create<AccountStore>((set) => ({
    accounts: [],
    setAccounts: (accounts) => set({
        accounts: accounts
    }),
    removeAccounts: () => set({
        accounts: []
    }),
    addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, account]
    })),
    deleteAccount: (publicKey) => set((state) => ({
        accounts: state.accounts.filter((acc) => acc.publicKey !== publicKey)
    }))
}));

interface Network {
    network: string,
    setNetwork: (network: string) => void
}

export const useNetwork = create<Network>((set) => ({
    network: "",
    setNetwork: (network) => set({
        network: network
    })
}));