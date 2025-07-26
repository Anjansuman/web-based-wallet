
import { useEffect, useRef, useState } from "react";
import { useHashedStore } from '../../../../store/hashed-store';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import { Input } from "../../../../components/ui/Input";
import { TextArea } from "../../../../components/ui/TextArea";
import { isAddress } from "ethers";


interface ReceiveProps {
    close: () => void,

}

export const AddWatchAccount = ({ close }: ReceiveProps) => {

    const { hashed } = useHashedStore();
    const panelRef = useRef<HTMLDivElement>(null);

    const accountNameRef = useRef<HTMLInputElement>(null);
    const privateKeyRef = useRef<HTMLTextAreaElement>(null);

    const [accountName, setAccountName] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    const [wrongPublicKey, setWrongPublicKey] = useState<boolean>(false);

    const publicKeyCheck = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            setWrongPublicKey(false);
            if(!isAddress(e.target.value)) {
                setWrongPublicKey(true);
            } else {
                setPublicKey(e.target.value);
                setWrongPublicKey(false);
            }
        } catch (error) {
            setWrongPublicKey(true);
        }
    }

    const handleCreate = () => {
        if(!accountName || !publicKey || !hashed) return;

        const done = hashed.addWatchAccount(accountName, publicKey);

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
                Add a new watch account
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
                    placeholder="Public Key"
                    type="text"
                    ref={privateKeyRef}
                    onChange={(e) => publicKeyCheck(e)}
                    error={wrongPublicKey}
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
                    disabled={wrongPublicKey || !accountName || !publicKey}
                />
            </div>
        </div>
    </div>
}