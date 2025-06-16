import Button from "../ui/Button";
import image from "../../../public/images/logo.png";
import { useState } from "react";
import { usePopUp } from "../../context/PopUpPanelContext";
import crypto from "crypto-js";
import { useEffect } from "react";
import { useRef } from "react";
import { useAccount, useMnemonic } from "../../context/zustand";
import type { Account, AccountType } from "../../types/AccountType";

interface UnlockWalletProps {
    onUnlock: () => void
}

export default function UnlockWallet({ onUnlock }: UnlockWalletProps) {

    const [password, setPassword] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    const [keyAndIv, setKeyAndIv] = useState<{ key: crypto.lib.WordArray, iv: string }>();

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

                const key = crypto.PBKDF2(password, salt, {
                    keySize: 256 / 32,
                    iterations: 100000
                });

                setKeyAndIv({
                    key: key,
                    iv: iv
                });

                const decryptedSeed = crypto.AES.decrypt(ciphertext, key.toString(), {
                    iv: crypto.enc.Hex.parse(iv)
                }).toString(crypto.enc.Utf8);

                if (!decryptedSeed) {
                    setError(true);
                    return;
                }
                setError(false);

                // store the decryptedSeed key in memory, use zustand or anything
                setMnemonic(decryptedSeed);

            });

            if (!keyAndIv) throw new Error("Decoding failed!");

            chrome.storage.local.get("accounts", (data) => {
                const accounts: AccountType[] = data.accounts;

                const decryptedAccounts = accounts.map((acc) => {
                    const account = crypto.AES.decrypt(acc.account, keyAndIv.key.toString(), {
                        iv: crypto.enc.Hex.parse(keyAndIv.iv)
                    }).toString(crypto.enc.Utf8);
                    return JSON.parse(account);
                });

                const allAccounts: Account[] = decryptedAccounts.map((acc, i) => ({
                    name: accounts[i].name,
                    privateKey: acc.privateKey,
                    publicKey: acc.publicKey,
                }));

                setAccounts(allAccounts);

            });

            onUnlock();
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