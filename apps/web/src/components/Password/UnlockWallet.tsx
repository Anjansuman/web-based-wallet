import Button from "../ui/Button";
import image from "../../../public/images/logo.png";
import { useState } from "react";
import { usePopUp } from "../../context/PopUpPanelContext";
import { useEffect } from "react";
import { useRef } from "react";
import { useAccount, useMnemonic } from "../../context/zustand";
import type { Account, AccountType2 } from "../../types/AccountType";
import { decryptMnemonic, decryptString, PKBDF2 } from "../../utils/crypto";

interface UnlockWalletProps {
    onUnlock: () => void
}

export default function UnlockWallet({ onUnlock }: UnlockWalletProps) {

    const [password, setPassword] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const { showPanel } = usePopUp();
    const { setMnemonic } = useMnemonic();
    const { setAccounts } = useAccount();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handlePassword = () => {
        try {

            if (!password) return;

            chrome.storage.local.get("vault", (data) => {
                const { ciphertext, salt, iv } = data.vault;

                console.log("ciphertext: ", ciphertext);
                console.log("salt: ", salt);
                console.log("iv: ", iv);

                console.log(password);

                const key = PKBDF2(password, salt); // was logging keys

                console.log("key: ", key);

                const decryptedSeed = decryptMnemonic(ciphertext, key, iv).toString();

                if (!decryptedSeed) {
                    setError(true);
                    return;
                }
                setError(false);

                console.log("seed: ", decryptedSeed);

                // store the decryptedSeed key in memory, use zustand or anything
                setMnemonic(decryptedSeed);

                chrome.storage.local.get("accounts", (data) => {
                    const accounts: AccountType2[] = data.accounts;

                    console.log("All accounts: ", accounts);

                    const decryptedAccounts = accounts.map((acc) => {
                        const account = decryptString(acc.account, key, iv);
                        console.log(account);
                        return JSON.parse(account);
                    });

                    console.log("decrypted accounts: ", decryptedAccounts);

                    const allAccounts: Account[] = decryptedAccounts.map((acc, i) => ({
                        name: accounts[i].name,
                        privateKey: acc.privateKey,
                        publicKey: acc.publicKey,
                    }));

                    console.log("all accounts: ", allAccounts);

                    setAccounts(allAccounts);
                    onUnlock();

                });

            });

            // if (!keyAndIv) throw new Error("Decoding failed!");
        } catch (error) {
            console.log(error);
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
            <input
                type={"password"}
                ref={inputRef}
                placeholder="Password"
                className={`w-full h-full outline-none focus:outline-none focus:ring-0 text-sm text-white rounded-lg pl-3 py-3 bg-[#1e1e1e] border ${error ? "border-red-500" : "border-transparent"} `}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleEnter(e)}
            />
        </div>
        <Button content={"Unlock"} onClick={handlePassword} disabled={!password} colored />
    </div>
}

/*

password:  123

salt:  930098e972adac38a84fc083a8a28097

key:  {$super: {…}, words: Array(8), sigBytes: 32, init: ƒ}$super: {init: ƒ, toString: ƒ, concat: ƒ, clamp: ƒ, clone: ƒ, …}init: ƒ ()sigBytes: 32words: (8) [-1078559376, 1463736671, -1974542652, 1472481191, -323766085, 1016456577, 572098416, -879939685][[Prototype]]: Object

iv:  37a7e388ffcc024e3d2a66c0296ee751

encrypt string:  ylwelNTpZHX6qZQ0W9k5TJ/0PIxt/iGZvE954z8kzuF368XC6oMqC5Y7DxZu37xLOXIMMx5W3JOai//oBN1meqh8//d3HN1RRlTMY92GKWD+RmkjYADQYhHkUIGnAziQRgfurgKGazSBI4MixGKfnfvUF5zH3z7GHc3HCGfS5nBpUg/rD2jdjsnjEVFlyS+EBgW3J30XJFfQEhKAxA7Dbs1Bb7TOkz7Zh2zn6S0+L7DP4Q3+gBspeEkZ0NDs8RllITEDkiXoYJSt3xD2BZJowTnZ61VxWWmLq4ovUpJ8zgOH6RlDHo0MDUKmTETcBjkT

*/