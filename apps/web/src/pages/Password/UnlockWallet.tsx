import Button from "../../components/ui/Button";
import image from "../../../public/images/logo.png";
import { useState } from "react";
import { usePopUp } from "../../context/PopUpPanelContext";
import { useEffect } from "react";
import { useRef } from "react";
// import { useAccount } from "../../context/Zustand";
// import type { Account, AccountType2 } from "../../types/AccountType";
// import { decryptString, PKBDF2 } from "../../utils/crypto";
import { useHashed } from "../../context/HashedAtom";
import { Hashed } from "../../utils/hashed";
import { Input } from "../../components/ui/Input";

interface UnlockWalletProps {
    onUnlock: () => void
}

export default function UnlockWallet({ onUnlock }: UnlockWalletProps) {

    const [password, setPassword] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const { showPanel } = usePopUp();
    // const { setAccounts } = useAccount();
    const { setHashed } = useHashed();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handlePassword = async () => {
        try {

            if (!password) return;

            // setting up the class
            const hashedClass = new Hashed(password);
            setHashed(hashedClass);

            const unlockWallet: boolean = await hashedClass.unlockWallet(password);

            if (!unlockWallet) {
                setError(true);
                return;
            }
            setError(false);

            hashedClass.fetchChromeData("accounts");
            onUnlock();

            // set the background active for unlocking the wallet for 15 mins after closing
            chrome.runtime.sendMessage({ type: "UNLOCK_WALLET", hashed: hashedClass });

        } catch (error) {
            showPanel("Error occured while entering password", "error");
            return;
        }
    }

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handlePassword();
        }
    }

    return <div className="h-full w-full flex flex-col justify-around items-center py-10 px-4 ">
        <div className="flex flex-col justify-center items-center ">
            <img src={image} alt="logo" className="size-30 " />
            <div className="text-2xl font-semibold text-[#ff4d67] ">
                Hashed
            </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-3 ">
            <div className="w-full flex justify-start items-center gap-x-2 ">
                <div className="text-xl text-white font-semibold ">
                    Enter your password
                </div>
                {
                    error && <div className="text-red-500 ">
                        [Wrong password]
                    </div>
                }
            </div>
            {/* <input
                type={"password"}
                ref={inputRef}
                placeholder="Password"
                className={`w-full h-full outline-none focus:outline-none focus:ring-0 text-sm text-white rounded-lg pl-3 py-3 bg-[#1e1e1e] border ${error ? "border-red-500" : "border-transparent"} `}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleEnter(e)}
            /> */}
            <Input
                type={"password"}
                ref={inputRef}
                placeholder={"Password"}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleEnter(e)}
            />
        </div>
        <Button content={"Unlock"} onClick={handlePassword} disabled={!password} colored />
    </div>
}