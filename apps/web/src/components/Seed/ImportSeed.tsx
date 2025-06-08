import { useState } from "react";
import * as bip39 from "bip39";
import { wordlist } from "@scure/bip39/wordlists/czech";
import { HDKey } from "@scure/bip32";
import { Wallet } from "@ethereumjs/wallet";

interface ImportSeedProps {
    onComplete: (privateKey: string) => void
}

export default function ImportSeed({ onComplete }: ImportSeedProps) {

    const [mnemonic, setMnemonic] = useState<string>("");

    const handleContinue = () => {

        if (!bip39.validateMnemonic(mnemonic, wordlist)) {
            // show invalid seed phrase
            return;
        }

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed);
        const childKey = hdkey.derive("m/44'/60'/0'/0/0");

        if (!childKey.privateKey) {
            // show private failed to crate
            return;
        }

        const wallet = Wallet.fromPrivateKey(childKey.privateKey);
        const privateKeyHex = Buffer.from(wallet.getPrivateKey()).toString("hex");

        onComplete(privateKeyHex);

    }

    return <div className="h-full w-full p-4 flex flex-col justify-between items-start ">
        <div className="text-[16px] font-semibold text-[#ff4d67] ">
            Generate a new Mnemonic Phrase
        </div>
        <div className="w-full grid grid-cols-3 gap-2 ">
            {Array.from({ length: 12 }).map((_, index) => (
                <div
                    className="px-3 py-3 rounded-md bg-[#1e1e1e] flex justify-start items-center gap-x-1 "
                    key={index}
                >
                    <div className="">
                        {index + 1 + "."}
                    </div>
                    <input
                        className="w-full outline-none focus:outline-none focus:ring-0 border-none bg-transparent text-white "
                        onChange={(e) => setMnemonic(e.target.value)}
                    />
                </div>
            ))}
        </div>
        <div
            className="w-full p-3 bg-[#ff4d67] hover:bg-[#FF6D7D] transition-colors flex justify-center items-center rounded-lg text-[#1e1e1e] text-sm font-semibold "
            onClick={handleContinue}
        >
            Continue
        </div>
    </div>
}

/*

<div className="h-full w-full ">
        <textarea
            placeholder="Enter your 12-word seed phrase"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
        />
    </div>

*/