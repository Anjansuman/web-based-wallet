
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import { Input } from "../../../../components/ui/Input";
import { TextArea } from "../../../../components/ui/TextArea";
import { Wallet } from "ethers";


interface ReceiveProps {
    close: () => void,

}

export const ImportAccount = ({ close }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const accountNameRef = useRef<HTMLInputElement>(null);
    const privateKeyRef = useRef<HTMLTextAreaElement>(null);

    const [accountName, setAccountName] = useState<string | null>(null);
    const [privateKey, setPrivateKey] = useState<string | null>(null);

    const [wrongPrivateKey, setWrongPrivateKey] = useState<boolean>(false);

    const privateKeyCheck = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            setWrongPrivateKey(false);
            const wallet = new Wallet(e.target.value);
            if(wallet) {
                setWrongPrivateKey(false);
                setPrivateKey(e.target.value);
            }
        } catch (error) {
            setWrongPrivateKey(true);
        }
    }

    const handleCreate = () => {
        if(!accountName || !privateKey || !hashed) return;

        const done = hashed.importAccount(accountName, privateKey);

        if(done) {
            onClose();
        } else {
            // show error
        }

    }

    useEffect(() => {

        if (!panelRef.current) return;

        gsap.from(panelRef.current, {
            x: 360,
            duration: 0.4,
            ease: "power2.inOut"
        });

    }, []);

    const onClose = () => {
        if (!panelRef.current) return;

        gsap.to(panelRef.current, {
            x: 360,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                close()
            }
        });
    }

    useEffect(() => {

    }, [hashed]);

    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Add a new wallet
            </div>

            <div className="w-full h-full pt-6 flex flex-col justify-start items-center gap-y-6 overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">

                <div className="h-20 w-20 bg-[#1e1e1e] rounded-full border border-neutral-600 flex justify-center items-center text-center text-lg ">
                    A
                </div>

                <Input
                    placeholder="Account Name"
                    ref={accountNameRef}
                    onChange={(e) => setAccountName(e.target.value)}
                />

                <TextArea
                    placeholder="Private Key"
                    type="password"
                    ref={privateKeyRef}
                    onChange={(e) => privateKeyCheck(e)}
                    error={wrongPrivateKey}
                />

            </div>

            <div className="w-full p-2 flex justify-center items-center gap-x-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
                <Button
                    content={"Create"}
                    onClick={handleCreate}
                    colored
                    disabled={wrongPrivateKey || !accountName || !privateKey}
                />
            </div>
        </div>
    </div>
}