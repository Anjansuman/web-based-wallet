
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import type { SavedAddress } from "../../../../types/AccountType";
import { GrayButton } from "../../../../components/ui/GrayButton";
import { Input } from "../../../../components/ui/Input";
import { IconPlus } from "@tabler/icons-react";
import { GeneralisedAddExistedAccount } from "./GeneralisedAddExistedAccount";


interface ReceiveProps {
    close: () => void,

}

export const SavedAddresses = ({ close }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[] | null>(null);
    const [newAddressPanel, setNewAddressPanel] = useState<boolean>(false);
    const [savedAddressDetails, SetSavedAddressDetails] = useState<{ name: string, publicKey: string } | null>(null);

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
        if (!hashed) return;

        const saved = hashed.getSavedAddress();
        setSavedAddresses(saved);
    }, [hashed]);

    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Saved Addresses
            </div>

            <div className="w-full h-full pt-2 flex flex-col justify-start items-center gap-y-2 inset-shadow-md overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">

                {savedAddresses?.map((detail, index) => (
                    <GrayButton
                        className={"flex justify-start items-center gap-x-3 "}
                        key={index}
                        onClick={() => SetSavedAddressDetails({ name: detail.name, publicKey: detail.publicKey })}
                    >
                        <div
                            key={index}
                            className="flex flex-col justify-center items-center cursor-pointer"
                        >
                            <div className="h-10 w-10 rounded-full bg-white flex justify-center items-center text-center text-black ">
                                {detail.name.charAt(0)}
                            </div>
                        </div>
                        <div className="w-full flex flex-col items-start justify-between ">
                            <div className="">
                                {detail.name}
                            </div>
                            <div className="w-full max-w-72 text-xs font-normal text-neutral-400 truncate overflow-hidden whitespace-nowrap ">
                                {detail.publicKey}
                            </div>
                        </div>
                    </GrayButton>
                ))}

                {(savedAddresses === null || savedAddresses?.length === 0) && <GrayButton
                    onClick={() => setNewAddressPanel(true)}
                >
                    <div className="w-full flex justify-center items-center gap-x-2 ">
                        <div>
                            Save a new address
                        </div>
                        <div>
                            <IconPlus />
                        </div>
                    </div>
                </GrayButton>}

            </div>

            <div className="w-full flex flex-col justify-start items-center gap-y-2 p-2 ">

                <Input
                    placeholder="Search..."

                />

                <div className="w-full flex justify-center items-center gap-x-2 ">
                    <Button
                        content={"Close"}
                        onClick={onClose}
                    />
                    <Button
                        content={"Save new"}
                        onClick={() => setNewAddressPanel(true)}
                        colored
                    />
                </div>
            </div>
        </div>

        {newAddressPanel && <GeneralisedAddExistedAccount type={"save"} close={() => setNewAddressPanel(false)} />}
        {savedAddressDetails && <GeneralisedAddExistedAccount
            type={"save"}
            close={() => SetSavedAddressDetails(null)}
            nameValue={savedAddressDetails.name}
            keyValue={savedAddressDetails.publicKey}
        />}

    </div>
}