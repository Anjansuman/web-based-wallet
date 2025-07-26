import { create } from "zustand";
import type { Hashed } from "../utils/hashed";


interface useHashedStore {
    hashed: Hashed | null,
    setHashed: (hashed: Hashed) => void,
    removeHashed: () => void
}

export const useHashedStore = create<useHashedStore>((set) => ({
    hashed: null,
    setHashed: (hashed) => {
        set((state) => {
            if (state.hashed) {
                return {};
            }
            return {
                hashed: hashed
            };
        })
    },
    removeHashed: () => set({
        hashed: null
    })
}));