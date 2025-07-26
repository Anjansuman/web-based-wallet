
import { useEffect, useRef, useState } from "react";
import { useHashedStore } from '../../../store/hashed-store';
import Button from '../../../components/ui/Button';
import gsap from 'gsap';
import { EthereumLogo } from "../../../components/SVGs/EthereumLogo";
import { Input } from "../../../components/ui/Input";
import { isAddress } from "ethers";
import type { SavedAddress } from "../../../types/AccountType";
import { GrayButton } from "../../../components/ui/GrayButton";


interface ReceiveProps {
    close: () => void,

}

export const Send = ({ close }: ReceiveProps) => {

    const { hashed } = useHashedStore();
    const panelRef = useRef<HTMLDivElement>(null);

    const [balance, setBalance] = useState<string>("");

    const ethInputAddressRef = useRef<HTMLInputElement>(null);
    const [wrongPublicKey, setWrongPublicKey] = useState<boolean>(false);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);

    const amountInputRef = useRef<HTMLInputElement>(null);
    const [wrongAmount, setWrongAmount] = useState<boolean>(false);
    const [maxAmount, setMaxAmount] = useState<number | null>(null);

    const [showSavedAddresses, setShowSavedAddresses] = useState<boolean>(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[] | null>(null);

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

    const handleEthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setWrongPublicKey(false);
            if (!isAddress(e.target.value)) {
                setWrongPublicKey(true);
            } else {
                setWrongPublicKey(false);
            }
        } catch (error) {
            setWrongPublicKey(true);
        }
    }

    const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {

        setWrongAmount(false);
        if (e.target.value > balance) {
            setWrongAmount(true);
        } else {
            setWrongAmount(false);
        }
    }

    const handleSavedAddresses = () => {
        if (!hashed) return;

        setShowSavedAddresses(prev => !prev);
        const saved = hashed.getSavedAddress();
        setSavedAddresses(saved);
    }

    const handlePutAddress = (acc: SavedAddress) => {
        setSelectedSavedAddress(acc);
        setShowSavedAddresses(false);
    }

    const handlePutMaxAmount = () => {
        setMaxAmount(Number(balance));
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
                <div className={`relative w-full flex items-center justify-start bg-[#1e1e1e] rounded-xl pr-2 border ${wrongPublicKey ? "border-red-500" : "border-transparent"} `}>
                    <Input
                        placeholder="Recepient's Ethereum address"
                        ref={ethInputAddressRef}
                        onChange={(e) => handleEthInput(e)}
                        value={selectedSavedAddress?.publicKey}
                    />
                    <div
                        className="w-9 min-h-9 px-1 text-white text-base rounded-full flex justify-center items-center bg-[#262626] cursor-pointer "
                        onClick={handleSavedAddresses}
                    >
                        @
                    </div>

                    {/* saved addresses */}
                    {showSavedAddresses && (
                        <div className="absolute w-full top-14 left-0 bg-neutral-900 border border-neutral-800 rounded-xl p-1 shadow-md">
                            {savedAddresses === null || savedAddresses.length === 0 ? (
                                <GrayButton>
                                    no saved addresses found.
                                </GrayButton>
                            ) : (
                                <div className="flex flex-col justify-start items-start gap-y-1 max-h-56 overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">
                                    {savedAddresses.map((acc, index) => (
                                        <GrayButton
                                            className="flex justify-start items-center gap-x-3"
                                            key={index}
                                            onClick={() => handlePutAddress(acc)}
                                        >
                                            <div className="flex flex-col justify-center items-center cursor-pointer">
                                                <div className="h-10 w-10 rounded-full bg-white flex justify-center items-center text-black">
                                                    {acc.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="w-full flex flex-col items-start justify-between">
                                                <div>{acc.name}</div>
                                                <div className="w-full max-w-[274px] text-xs font-normal text-neutral-400 truncate">
                                                    {acc.publicKey}
                                                </div>
                                            </div>
                                        </GrayButton>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* amount */}
                <div className={`w-full flex items-center justify-start bg-[#1e1e1e] rounded-xl pr-2 border ${wrongAmount ? "border-red-500" : "border-transparent"} `}>
                    <Input
                        placeholder="Amount"
                        type={"number"}
                        ref={amountInputRef}
                        onChange={handleAmountInput}
                        errorText={wrongAmount}
                        value={maxAmount?.toString()}
                    />
                    <div className="flex items-center text-base gap-x-2 ">
                        <div>
                            ETH
                        </div>
                        <div
                            className="text-white text-sm rounded-full py-1 px-2 bg-[#262626] cursor-pointer "
                            onClick={handlePutMaxAmount}
                        >
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
                    disabled={wrongPublicKey}
                />
            </div>
        </div>
    </div>
}