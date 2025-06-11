import { useState } from "react";
import { wordlist } from "@scure/bip39/wordlists/english";
import { usePopUp } from "../../context/PopUpPanelContext";
import { useRef } from "react";
import { validateMnemonic } from "@scure/bip39";
import Button from "../ui/Button";
import { useEffect } from "react";
// import { HDKey } from "@scure/bip32";
// import { Wallet } from "@ethereumjs/wallet";

interface ImportSeedProps {
    onComplete: (privateKey: string) => void
}

export default function ImportSeed({ onComplete }: ImportSeedProps) {

    const { showPanel } = usePopUp();
    const [mnemonicArray, setMnemonicArray] = useState<string[]>(Array(12).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleContinue = () => {
        try {
            const mnemonic = mnemonicArray.join(" ").trim();
            if (!validateMnemonic(mnemonic, wordlist)) {
                showPanel("Invalid Seed Phrase", "error");
                return;
            }
            onComplete(mnemonic);
        } catch (error) {
            showPanel("Error occured while parsing mnemonics", "error");
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if(e.key === " " && index < 12) {
            e.preventDefault(); // prevent space to enter in the next input box
            const nextInput = inputRefs.current[index + 1];
            if(nextInput) nextInput.focus();

        } else if(e.key === "Backspace" && mnemonicArray[index] === "" && index > 0) {
            e.preventDefault();
            const prevInput = inputRefs.current[index - 1];
            if(prevInput) prevInput.focus();
        }
    }

    return <div className="h-full w-full py-10 px-4 flex flex-col justify-around items-start ">
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
                        type="text"
                        ref={(el) => {
                            inputRefs.current[index] = el
                        }}
                        className="w-full outline-none focus:outline-none focus:ring-0 border-none bg-transparent text-white "
                        onChange={(e) => {
                            setMnemonicArray((prev) => {
                                const updated = [...prev];
                                updated[index] = e.target.value;
                                return updated;
                            })
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                </div>
            ))}
        </div>
        <Button content={"Continue"} onClick={handleContinue} colored />
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