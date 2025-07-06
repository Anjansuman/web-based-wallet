import { useState } from "react";
import ImportSeed from "./ImportSeed";

import image from "../../../public/images/logo.png";
import GenerateSeed from "./GenerateSeed";
import Button from "../../components/ui/Button";

interface SeedProps {
    onComplete: (mnemonic: string) => void
}

type Choice = "noChoice" | "import" | "generate";

export default function Seed({ onComplete }: SeedProps) {

    const [choice, setChoice] = useState<Choice>("noChoice");

    if(choice === "import") {
        return <ImportSeed onComplete={onComplete} />
    }

    if(choice === "generate") {
        return <GenerateSeed onComplete={onComplete} />
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
            <Button content={"Import seed phrase"} onClick={() => setChoice("import")} />
            <Button content={"Generate seed phrase"} onClick={() => setChoice("generate")} colored />
        </div>
    </div>
}