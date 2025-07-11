import { create } from "zustand";
import type { MnemonicStore, AccountStore, CurrentValues, PageStore } from "./ZustandTypes";


export const useMnemonic = create<MnemonicStore>((set) => ({
    mnemonic: "",
    setMnemonic: (mnemonic) => set({
        mnemonic: mnemonic
    }),
    removeMnemonic: () => set({
        mnemonic: ""
    })
}));

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

export const useCurrent = create<CurrentValues>((set) => ({
    network: "",
    account: null,
    setNetwork: (network) => set({
        network: network
    }),
    setAccount: (account) => set({
        account: account
    })
}));

export const usePage = create<PageStore>((set) => ({
    page: "loading",
    setPage: (page) => set({
        page: page
    })
}));