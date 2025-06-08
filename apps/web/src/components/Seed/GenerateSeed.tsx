import { useEffect, useState } from "react";
import * as bip39 from "bip39";



export default function GenerateSeed() {

    const [mnemonic, setMnemonic] = useState<string>("");

    useEffect(() => {

        const seed = bip39.generateMnemonic();
        setMnemonic(seed);
        alert(seed);

    }, []);

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
                    <div>
                        value
                    </div>
                </div>
            ))}
        </div>
        <div
            className="w-full p-3 bg-[#ff4d67] hover:bg-[#FF6D7D] transition-colors flex justify-center items-center rounded-lg text-[#1e1e1e] text-sm font-semibold "
        >
            Continue
        </div>
        <div>
            {mnemonic}
        </div>
    </div>
}