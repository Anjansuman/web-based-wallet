import { create } from "zustand";
import type { Hashed } from "../utils/hashed";


interface useHashed {
    hashed: Hashed | null,
    setHashed: (hashed: Hashed) => void,
    removeHashed: () => void
}

export const useHashed = create<useHashed>((set) => ({
    hashed: null,
    setHashed: (hashed) => {
        // ye case isiliye hataye h kyunki hashed jo if me use kr rhe wo bheja ja rha
        // if(hashed !== null) return;
        set({
            hashed: hashed
        });
    },
    removeHashed: () => set({
        hashed: null
    })
}));