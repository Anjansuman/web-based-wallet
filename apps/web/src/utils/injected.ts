// Injected into dApp
(function () {

    // Define the Ethereum provider interface
    interface EthereumProvider {
        isMetaMask?: boolean;
        selectedAddress: string | null;
        chainId: string;
        enable: () => Promise<string[]>;
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        on?: (event: string, handler: (...args: any[]) => void) => void;
    }

    class HashedProvider implements EthereumProvider {
        isMetaMask = true;
        selectedAddress: string | null = null;
        chainId = "0x1";

        enable(): Promise<string[]> {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ type: "ENABLE_WALLET" }, (res) => {
                    if (res?.success) {
                        this.selectedAddress = res.address;
                        resolve([res.address]);
                    } else {
                        reject("Wallet enable rejected");
                    }
                });
            });
        }

        request({ method, params }: { method: string; params?: any[] }): Promise<any> {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ type: "ETH_REQUEST", method, params }, (res) => {
                    if (res?.error) reject(res.error);
                    else resolve(res.result);
                });
            });
        }

        on(event: string, handler: (...args: any[]) => void): void {
            // Optional: Add support for 'accountsChanged', 'chainChanged', etc.
            console.log(`Event listener registered for: ${event}, ${handler}`);
        }
    }

    // Extend the Window interface to support 'ethereum'
    // interface Window {
    //     ethereum?: EthereumProvider;
    // }

    // Attach to window if not already present
    if (typeof window.ethereum === "undefined") {
        window.ethereum = new HashedProvider();
        window.dispatchEvent(new Event("ethereum#initialized"));
    }

})();
