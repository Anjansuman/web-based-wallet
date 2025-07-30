import type { WALLET_EVENT } from "../enums/inject-wallet-event-enum"


export interface WalletRequest {
    type: WALLET_EVENT.WALLET_REQUEST,
    method: string,
    params: any[],
    id: number
};

export interface WalletResponse {
    type: WALLET_EVENT.WALLET_RESPONSE,
    id: number,
    result?: any,
    error?: string
};

export interface PendingRequest {
    resolve: (value: any) => void,
    reject: (reason: any) => void
}