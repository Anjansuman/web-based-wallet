import { create } from "zustand";
import { PAGE } from "../enums/page-enum";

export interface PageStore {
    page: PAGE,
    setPage: (page: PAGE) => void
}

export const usePageStore = create<PageStore>((set) => ({
    page: PAGE.LOADING,
    setPage: (page) => set({
        page: page
    })
}));