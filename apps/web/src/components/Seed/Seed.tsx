import { useState } from "react";
import ImportSeed from "./ImportSeed";

import image from "../../Images/logo.png";
import GenerateSeed from "./GenerateSeed";

interface SeedProps {
    onComplete: (privateKey: string) => void
}

type Choice = "noChoice" | "import" | "generate";

export default function Seed({ onComplete }: SeedProps) {

    const [choice, setChoice] = useState<Choice>("noChoice");

    if(choice === "import") {
        return <ImportSeed onComplete={onComplete} />
    }

    if(choice === "generate") {
        return <GenerateSeed />
    }

    return <div className="h-full w-full flex flex-col justify-around items-center py-10 px-4 ">
        <div className="flex flex-col justify-center items-center ">
            <img src={image} alt="logo" className="size-30 " />
            <div className="text-2xl font-semibold text-[#ff4d67] ">
                Hashed
            </div>
        </div>
        <div className="flex flex-col justify-center items-center ">
            <div className="text-[#ff4d67] text-[16px] font-semibold ">
                Get started!
            </div>
            <div className="text-sm ">
                Import/Generate a seed phrase
            </div>
        </div>
        <div className="w-full flex flex-col gap-y-3 text-sm font-semibold ">
            <div
                className="w-full rounded-lg p-3 flex justify-center items-center text-white bg-[#1e1e1e] hover:bg-[#262626] transition-colors cursor-pointer "
                onClick={() => setChoice("import")}
            >
                Import seed phrase
            </div>
            <div
                className="w-full rounded-lg p-3 flex justify-center items-center text-[#1e1e1e] bg-[#ff4d67] hover:bg-[#FF6D7D] transition-colors cursor-pointer "
                onClick={() => setChoice("generate")}
            >
                Generate seed phrase
            </div>
        </div>
    </div>
}