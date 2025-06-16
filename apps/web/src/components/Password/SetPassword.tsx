import { useState, useRef, useEffect } from "react";
import crypto from "crypto-js";
import { Wallet } from "@ethereumjs/wallet";
import { HDKey } from "@scure/bip32";


import image from "../../../public/images/logo.png";
import Button from "../ui/Button";
import { usePopUp } from "../../context/PopUpPanelContext";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import type { AccountType } from "../../types/AccountType";
import { encrypt, PKBDF2, randomWordArray } from "../../utils/crypto";
import { mnemonicToSeedSync } from "@scure/bip39";


interface setPasswordProps {
    mnemonic: string,
    onComplete: () => void
}

export default function SetPassword({ mnemonic, onComplete }: setPasswordProps) {

    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [passwordNotMatch, setPasswordNotMatch] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { showPanel } = usePopUp();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleEncrypt = () => {
        try {
            if (password1 != password2) {
                showPanel("Password didn't match", "error");
                return;
            }

            const salt = randomWordArray(16).toString();

            const key = PKBDF2(password1, salt);

            const iv = randomWordArray(16).toString();

            const encrypted = encrypt(mnemonic, key, iv).toString();

            // creating vault
            const vault = {
                ciphertext: encrypted, // encrypted seed
                salt,
                iv
            };

            // now the part of creating the first wallet from the mnemonic for ethereum

            const seed = mnemonicToSeedSync(mnemonic);

            const path = `m/44'/60'/0'/0/0`;

            const hdNode = HDKey.fromMasterSeed(seed);
            const child = hdNode.derive(path);

            if(!child.privateKey) {
                throw new Error("child doesn't contain private key");
            }

            const wallet = Wallet.fromPrivateKey(child.privateKey);

            const jsonString = JSON.stringify({
               privateKey: "0x" + wallet.getPrivateKey(),// get private key from child,
               publicKey: "0x" + wallet.getPublicKey()
            });

            const hashAccount = crypto.AES.encrypt(jsonString, key.toString(), {
                iv: crypto.enc.Hex.parse(iv)
            });

            const accounts: AccountType[] = [{
                name: "account 1",
                account: hashAccount
            }];

            chrome.storage.local.set({ vault });
            chrome.storage.local.set({ accounts }, onComplete);
        } catch (error) {
            showPanel("Error occured while storing the password", "error");
            return;
        }
    }

    const handleReEnterPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword2 = e.target.value;
        setPassword2(newPassword2);
        // a new variable is made cause useState takes time to store variable in it so can't compare them directly
        setPasswordNotMatch(password1 !== newPassword2);
    }

    return <div className="h-full w-full flex flex-col justify-around items-center py-10 px-4 ">
        <div className="flex flex-col justify-center items-center ">
            <img src={image} alt="logo" className="size-30 " />
            <div className="text-2xl font-semibold text-[#ff4d67] ">
                Hashed
            </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-3 ">
            <Input placeholder="Create a password" onChange={(e) => setPassword1(e.target.value)} ref={inputRef} />
            <Input placeholder="Re-enter your password" onChange={handleReEnterPassword} error={passwordNotMatch} />
        </div>
        <Button content={"Secure Wallet"} onClick={handleEncrypt} disabled={passwordNotMatch || !password1 || !password2} colored />
    </div>
}

interface InputProps {
    placeholder: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error?: boolean,
    ref?: React.Ref<HTMLInputElement>
}

const Input = ({ placeholder, onChange, error, ref }: InputProps) => {

    const [type, setType] = useState<"text" | "password">("password");
    const [visible, setVisible] = useState<boolean>(false);

    const handleVisibility = () => {
        setType(() => (
            type === "text" ? "password" : "text"
        ));
        setVisible((prev) => !prev);
    }

    return <div className="w-full flex flex-col justify-center items-start gap-y-1 ">
        <div className="flex justify-center items-center gap-x-2 ">
            <div className="text-sm font-semibold text-white ">
                {placeholder}
            </div>
            <div>
                {
                    error && <div className="text-red-500 ">[Password didn't match]</div>
                }
            </div>
        </div>
        <div className={`w-full flex justify-between items-center bg-[#1e1e1e] text-white rounded-lg border ${error ? "border-red-500 " : "border-transparent"} `}>
            <input
                ref={ref}
                type={type}
                className={`w-full h-full outline-none focus:outline-none focus:ring-0 text-sm rounded-lg pl-3 py-3 `}
                placeholder="Password"
                onChange={onChange}
            />
            <div
                className="p-3 flex justify-center items-center "
                onClick={handleVisibility}
            >
                {
                    visible ? <IconEye className="size-4 " /> : <IconEyeOff className="size-4 " />
                }
            </div>
        </div>
    </div>
}