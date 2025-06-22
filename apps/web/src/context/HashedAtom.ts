import { create } from "zustand";
import type { Hashed } from "../utils/hashed";


interface HashedAtom {
    hashed: Hashed | null,
    setHashed: (hashed: Hashed) => void
}

export const HashedAtom = create<HashedAtom>((set) => ({
    hashed: null,
    setHashed: (hashed) => {
        if(hashed) return;
        set({
            hashed: hashed
        });
    }
}));