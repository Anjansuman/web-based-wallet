import type { Hashed } from "../utils/hashed";


export type response =
    | { success: boolean }
    | { success: boolean, hashed: Hashed }
    | { success: boolean, address: string }