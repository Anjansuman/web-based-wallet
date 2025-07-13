


export enum Networks {
    Ethereum_Mainnet = "Ethereum_Mainnet",
    Sepolia_Testnet = "Sepolia_Testnet",
    Solana_Mainnet = "Solana_Mainnet",
    Solana_Testnet = "Solana_Testnet",
}

export const RPC: Record<Networks, string> = {
    Ethereum_Mainnet: `https://eth-mainnet.g.alchemy.com/v2/`,
    Sepolia_Testnet: `https://eth-sepolia.g.alchemy.com/v2/`,
    Solana_Mainnet: `https://solana-mainnet.g.alchemy.com/v2/`,
    Solana_Testnet: `https://solana-devnet.g.alchemy.com/v2/`,
};