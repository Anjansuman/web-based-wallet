

interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress: string | null;
  chainId: string;
  enable(): Promise<string[]>;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on?(event: string, handler: (...args: any[]) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}
