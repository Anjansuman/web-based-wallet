
import { generate } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';
import React, { useEffect, useRef, useState } from "react";
import { useHashedStore } from '../../../store/hashed-store';
import Button from '../../../components/ui/Button';
import gsap from 'gsap';

const QR = makeAsyncComponent(React, generate);

interface ReceiveProps {
    close: () => void,
    publicKey?: string // this is used for account profile to show address
}

export const Receive = ({ close, publicKey }: ReceiveProps) => {

    const { hashed } = useHashedStore();
    const [pubKey, setPubKey] = useState<string>();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!panelRef.current) return;

        if (publicKey) {
            // animation of right to left for showing public key of an account
            gsap.from(panelRef.current, {
                x: 360,
                duration: 0.4,
                ease: "power2.inOut"
            });
        } else {
            // animation of bottom to up, for independent page
            gsap.from(panelRef.current, {
                y: 530,
                duration: 0.4,
                ease: "power2.inOut"
            });
        }

    }, []);

    const onClose = () => {
        if (!panelRef.current) return;

        if (publicKey) {
            gsap.to(panelRef.current, {
                x: 360,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    close()
                }
            });
        } else {
            gsap.to(panelRef.current, {
                y: 530,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    close()
                }
            });
        }
    }

    useEffect(() => {
        if (!hashed) return;

        const selected = hashed.getSelectedAccount();
        if (selected) {
            const key = selected.publicKey.toString();
            setPubKey(key);
        }
    }, [hashed]);


    return <div className={`h-full w-full absolute z-30 ${publicKey ? "top-0" : "top-[70px]"} left-0 flex justify-start items-start `}>
        <div
            className={`w-full ${publicKey ? "h-full overflow-y-visible" : "h-[530px]"} bg-neutral-900 flex flex-col justify-between items-center p-3 `}
            ref={panelRef}
        >
            {
                publicKey ? <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                    Public Key
                </div> : ""
            }
            {
                publicKey ?
                    <div className="p-1 bg-neutral-100 rounded-md ">
                        <QR content={publicKey} className="qr-code size-40 " />
                    </div>
                    : pubKey && <div className="p-1 bg-neutral-100 rounded-md ">
                        <QR content={pubKey} className="qr-code size-40 " />
                    </div>
            }

            <div className="w-full border border-[#2c2c2c] rounded-xl bg-neutral-950 overflow-hidden ">
                <div className="w-full text-center text-white break-words font-mono text-sm border-b border-[#2c2c2c] p-3 ">
                    {
                        publicKey ? publicKey : pubKey
                    }
                </div>
                <div
                    className="w-full hover:bg-neutral-900 hover:text-white transition-colors ease-in-out text-base p-3 flex justify-center items-center cursor-pointer "
                    onClick={() => navigator.clipboard.writeText(publicKey || pubKey || "")}
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