import { useEffect, useRef, useState } from "react";
import { useHashed } from "../../../../context/HashedAtom";
import Button from "../../../../components/ui/Button";
import gsap from "gsap";
import { Input } from "../../../../components/ui/Input";
import { TextArea } from "../../../../components/ui/TextArea";
import { Wallet, isAddress } from "ethers";
import { GrayButton } from "../../../../components/ui/GrayButton";

interface AccountEditorProps {
    close: () => void;
    type: "import" | "watch" | "save";
    nameValue?: string,
    keyValue?: string
}

export const GeneralisedAddExistedAccount = ({ close, type, nameValue, keyValue }: AccountEditorProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const accountNameRef = useRef<HTMLInputElement>(null);
    const keyRef = useRef<HTMLTextAreaElement>(null);

    const [accountName, setAccountName] = useState<string | null>(null);
    const [key, setKey] = useState<string | null>(null);
    const [keyInvalid, setKeyInvalid] = useState<boolean>(false);


    const validateKey = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        try {
            setKeyInvalid(false);
            if (type === "watch" || type === "save") {
                if (!isAddress(value)) throw new Error("Invalid address");

            } else if (type === "import") {
                const wallet = new Wallet(value);
                if (!wallet) {
                    setKeyInvalid(true);
                }

            }
            setKey(value);
        } catch {
            setKeyInvalid(true);
        }
    };

    const handleCreate = () => {
        if (!accountName || !key || !hashed) return;

        let done: boolean = false;

        if (type === "watch") {
            done = hashed.addWatchAccount(accountName, key);
        } else if (type === "import") {
            done = hashed.importAccount(accountName, key);
        } else if (type === "save") {
            done = hashed.addSavedAddress(accountName, key);
        }

        if (done) {
            onClose();
        } else {
            // Show error or fallback
        }
    };

    const handleDeleteAccount = () => {
        if (!hashed) return;

        if (!nameValue || !keyValue) return;

        let done: boolean = false;

        if (type === "watch") {
            // delete button will not appear while creating watch account            
        } else if (type === "import") {
            // delete button will not appear while importing account
        } else if (type === "save") {
            console.log("delete save address called");
            done = hashed.deleteSavedAddress(nameValue, keyValue);
        }

        if (done) {
            onClose();
        } else {
            // Show error or fallback
        }
    }

    const onClose = () => {
        if (!panelRef.current) return;
        gsap.to(panelRef.current, {
            x: 360,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => close(),
        });
    };

    useEffect(() => {
        if (!panelRef.current) return;
        gsap.from(panelRef.current, {
            x: 360,
            duration: 0.4,
            ease: "power2.inOut",
        });
    }, []);

    return (
        <div className="h-full w-full absolute z-50 top-0 left-0 flex justify-start items-start">
            <div
                className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3"
                ref={panelRef}
            >
                <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold">
                    {type === "watch" ? "Add a Watch Account" : type === "import" ? "Import a wallet" : "Save an address"}
                </div>

                <div className="w-full h-full pt-6 flex flex-col justify-start items-center gap-y-4 overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div className="h-20 w-20 bg-[#1e1e1e] rounded-full border border-neutral-600 flex justify-center items-center text-center text-lg">
                        A
                    </div>

                    <Input
                        placeholder="Account Name"
                        ref={accountNameRef}
                        onChange={(e) => setAccountName(e.target.value)}
                        value={nameValue}
                    />

                    <TextArea
                        placeholder={(type === "watch" || type === "save") ? "Public Key (Address)" : "Private Key"}
                        type={(type === "watch" || type === "save") ? "text" : "password"}
                        ref={keyRef}
                        onChange={validateKey}
                        error={keyInvalid}
                        value={keyValue}
                    />

                    {keyValue && <GrayButton onClick={handleDeleteAccount}>
                        <div className="w-full text-red-500 flex justify-center ">
                            Remove Account
                        </div>
                    </GrayButton>}

                </div>

                <div className="w-full p-2 flex justify-center items-center gap-x-2">
                    <Button content="Close" onClick={onClose} />
                    <Button
                        content={keyValue ? "Save" : "Create"}
                        onClick={handleCreate}
                        colored
                        disabled={keyInvalid || !accountName || !key}
                    />
                </div>
            </div>
        </div>
    );
};
