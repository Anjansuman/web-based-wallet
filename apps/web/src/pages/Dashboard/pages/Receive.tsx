
import { generate } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';
import React, { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../context/HashedAtom';
import Button from '../../../components/ui/Button';
import gsap from 'gsap';

const QR = makeAsyncComponent(React, generate);

interface ReceiveProps {
    close: () => void,

}

export const Receive = ({ close }: ReceiveProps) => {

    const { hashed } = useHashed();
    const [pubKey, setPubKey] = useState<string>();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!panelRef.current) return;

        gsap.from(panelRef.current, {
            y: 530,
            duration: 0.4,
            ease: "power2.inOut"
        });

    }, []);

    const onClose = () => {
        if (!panelRef.current) return;

        gsap.to(panelRef.current, {
            y: 530,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                close()
            }
        });
    }

    useEffect(() => {
        if (!hashed) return;

        const selected = hashed.getSelectedAccount();
        if (selected) {
            const key = selected.publicKey.toString();
            setPubKey(key);
        }
    }, [hashed]);


    return <div className="h-full w-full absolute z-30 top-[70px] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[530px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            {
                pubKey && <div className="p-1 bg-neutral-100 rounded-md ">
                    <QR content={pubKey} className="qr-code size-40 " />
                </div>
            }

            <div className="w-full border border-[#2c2c2c] rounded-xl bg-neutral-950 overflow-hidden ">
                <div className="w-full text-center text-white break-words font-mono text-sm border-b border-[#2c2c2c] p-3 ">
                    {pubKey}
                </div>
                <div
                    className="w-full hover:bg-neutral-900 hover:text-white transition-colors ease-in-out text-base p-3 flex justify-center items-center cursor-pointer "
                    onClick={() => navigator.clipboard.writeText(pubKey || "")}
                >
                    Copy
                </div>
            </div>
            
            <div className="w-full p-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
            </div>
        </div>
    </div>
}