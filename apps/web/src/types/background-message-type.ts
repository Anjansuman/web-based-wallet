import type { MESSAGE } from "../enums/message-enum";
import type { Hashed } from "../utils/hashed";


export type backgroundMessage =
    | { type: MESSAGE.UNLOCK_WALLET, hashed: Hashed }
    | { type: MESSAGE.IS_WALLET_UNLOCKED }
    | { type: MESSAGE.ENABLE_WALLET }
    | { type: MESSAGE.ETH_REQUEST, method: string, params: any[] }
    | { type: MESSAGE.WALLET_REQUEST, method: string, params: any[], id: number }; // Added for web3 provider