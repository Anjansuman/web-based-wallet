import { useEffect, useState } from "react";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { IconCircleCheckFilled, IconCopy } from "@tabler/icons-react";
// import PopUp from "../ui/PopUp";
import { usePopUp } from "../../context/PopUpPanelContext";
import Button from "../ui/Button";

interface GenerateSeedProps {
    onComplete: (seed: string) => void
}

export default function GenerateSeed({ onComplete }: GenerateSeedProps) {

    const [mnemonic, setMnemonic] = useState<string>("");
    const [blur, setBlur] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const { showPanel } = usePopUp();


    useEffect(() => {
        try {
            const seed = generateMnemonic(wordlist);
            setMnemonic(seed);
        } catch (error) {
            showPanel("Error occured whle generating seed phrase", "error")
        }
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(mnemonic);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showPanel("Error occured while copying", "error");
            return;
        }
    }

    const handleContinue = () => {
        onComplete(mnemonic);
    }

    return <div className="h-full w-full py-10 px-4 flex flex-col justify-around items-start ">
        <div className="text-[16px] font-semibold text-[#ff4d67] ">
            Generate a new Mnemonic Phrase
        </div>
        <div
            className="w-full grid grid-cols-3 gap-2 relative "
            onMouseEnter={() => setBlur(false)}
            onMouseLeave={() => setBlur(true)}
        >
            {mnemonic.split(" ").map((word, index) => (
                <div
                    className="p-3 rounded-md bg-[#1e1e1e] flex justify-start items-center gap-x-1 "
                    key={index}
                >
                    <div className="">
                        {index + 1 + "."}
                    </div>
                    <div className="text-white">
                        {word}
                    </div>
                </div>
            ))}
            <div className="w-full h-full absolute z-10 top-0 left-0 bg-transparent rounded-md "></div>
            {
                blur && <div className="w-full h-full absolute z-20 top-0 left-0 bg-transparent backdrop-blur-xs rounded-md flex flex-col justify-center items-center ">
                    <div className="text-[16px] font-semibold text-white">
                        Make sure no one's looking
                    </div>
                    <div className="">
                        [hover to see your generated seed phrase]
                    </div>
                </div>

            }
        </div>
        <div className="w-full flex flex-col justify-center items-start gap-y-3 ">
            <Button
                content={
                    <div className="flex justify-center items-center gap-x-2">
                        <div>
                            {
                                copied ? "Copied to clipboard" : "Copy Seed"
                            }
                        </div>
                        {
                            copied ? <IconCircleCheckFilled className="size-3 text-green-500 " /> : <IconCopy className="size-3 " />
                        }
                    </div>
                }
                onClick={handleCopy}
            />

            <Button content={"Continue"} onClick={handleContinue} colored disabled={!isChecked} />

            {/* check-box */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white">
                <input
                    type="checkbox"
                    id="saved-seed"
                    checked={isChecked}
                    onChange={() => setIsChecked((prev) => !prev)}
                    className="peer hidden"
                />
                <div className="w-4 h-4 rounded border-2 border-[#ff4d67] flex items-center justify-center peer-checked:bg-[#ff4d67] transition-colors duration-200">
                    <svg
                        className="w-3 h-3 text-white hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span>I've saved the seed phrase</span>
            </label>

        </div>
        {/* {
            error && <PopUp content={"Error occured whle generating seed phrase"} ok={() => setError(false)} />

        } */}
    </div>
}