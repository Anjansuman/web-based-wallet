
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../context/HashedAtom';
import Button from '../../../components/ui/Button';
import gsap from 'gsap';
import { EthereumLogo } from "../../../components/SVGs/EthereumLogo";
import { Input } from "../../../components/ui/Input";


interface ReceiveProps {
    close: () => void,

}

export const Send = ({ close }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const [balance, setBalance] = useState<string>("");

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

        const value = hashed.getBalanceofCurrentAccount().token;
        setBalance(value);

    }, [hashed]);


    return <div className="h-full w-full absolute z-30 top-[70px] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[530px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex flex-col justify-start items-between gap-y-4 ">

                {/* title */}
                <div className="w-full flex justify-center items-center text-white text-center text-lg font-semibold ">
                    Send ETH
                </div>

                {/* logo of ethereum */}
                <div className="w-full flex justify-center items-center ">
                    <div className="p-3 rounded-full bg-white border-neutral-600 flex justify-center items-center ">
                        <EthereumLogo size={"40px"} />
                    </div>
                </div>

                {/* address */}
                <div className="w-full flex items-center justify-start bg-[#1e1e1e] rounded-xl pr-2 ">
                    <Input
                        placeholder="Recepient's Ethereum address"
                    />
                    <div
                        className="w-9 min-h-9 px-1 text-white text-base rounded-full flex justify-center items-center bg-[#262626] cursor-pointer "
                        onClick={() => {}}
                    >
                        @
                    </div>
                </div>

                {/* amount */}
                <div className="w-full flex items-center justify-start bg-[#1e1e1e] rounded-xl pr-2 ">
                    <Input
                        placeholder="Amount"
                        type={"number"}
                    />
                    <div className="flex items-center text-base gap-x-2 ">
                        <div>
                            ETH
                        </div>
                        <div className="text-white text-sm rounded-full py-2 px-2 bg-[#262626] cursor-pointer ">
                            Max
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-end items-center ">
                    <div className="text-sm ">
                        Available {balance} ETH
                    </div>
                </div>

            </div>

            <div className="w-full p-2 flex items-center justify-center gap-x-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
                <Button
                    content={"Send"}
                    onClick={() => { }}
                    colored
                />
            </div>
        </div>
    </div>
}