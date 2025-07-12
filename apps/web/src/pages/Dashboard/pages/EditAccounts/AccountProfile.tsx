
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import type { Account } from "../../../../types/AccountType";
import { GrayButton } from "../../../../components/ui/GrayButton";
import { IconChevronCompactRight, IconPencil } from "@tabler/icons-react";
import { Receive } from "../Receive";


interface ReceiveProps {
    close: () => void,
    data: Account
}

export const AccountProfile = ({ close, data }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const [infoPanel, setInfoPanel] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string>("");
    const [numOfAccounts, setNumOfAccounts] = useState<number>(0);

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

    const handleDeleteAccount = () => {
        if (!hashed) return;

        const done = hashed.deleteAccount(data.name, data.publicKey);

        if (done) {
            onClose();
        } else {
            // handle the false statement
        }

    }

    useEffect(() => {
        if (!hashed) return;

        const m = hashed.getMnemonic();
        const totalAccounts = hashed.getAccounts().length;

        setNumOfAccounts(totalAccounts);
        setMnemonic(m);
    }, [hashed]);

    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Account details
            </div>

            <div className="w-full h-full pt-4 flex flex-col justify-start items-center gap-y-4 overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">

                <div className="h-20 w-20 relative bg-[#1e1e1e] rounded-full border border-neutral-600 flex justify-center items-center text-center text-lg ">
                    {data.name.charAt(0)}
                    {/* edit icon */}
                    <div
                        className="absolute group z-10 bottom-0.5 right-0.5 p-0.5 border border-neutral-600 bg-[#1e1e1e] hover:bg-[#ff4d67] transition-colors rounded-full flex justify-center items-center cursor-pointer "
                        onClick={() => {}}
                    >
                        <IconPencil className="size-4 fill-[#1e1e1e] stroke-neutral-600 group-hover:fill-white group-hover:stroke-black stroke-1 transition-colors " />
                    </div>
                </div>

                {/* These options will be directly accessed by unlocked wallet */}
                <div className="w-full flex flex-col gap-y-0.5 rounded-xl overflow-hidden ">
                    {
                        contentArray(data, mnemonic).noPassContent.map((content, index) => (
                            <GrayButton
                                key={index}
                                className="group"
                                plain
                                onClick={() => setInfoPanel(content.valueToLaterShow!)}
                            >
                                <div>
                                    {content.label}
                                </div>
                                <div className="flex items-center justify-between gap-x-2 ">
                                    <div className="text-neutral-600 ">
                                        {content.valueToShow}
                                    </div>
                                    <IconChevronCompactRight className="text-neutral-600 group-hover:text-white transition-colors " />
                                </div>
                            </GrayButton>
                        ))
                    }
                </div>
                {/* These options will require password to view */}
                <div className="w-full flex flex-col gap-y-0.5 rounded-xl overflow-hidden ">
                    {
                        contentArray(data, mnemonic).passContent.map((content, index) => (
                            <GrayButton
                                key={index}
                                className="group"
                                plain
                            >
                                <div>
                                    {content.label}
                                </div>
                                <div className="flex items-center justify-between gap-x-2 ">
                                    <div className="text-neutral-600 ">
                                        {content.valueToShow}
                                    </div>
                                    <IconChevronCompactRight className="text-neutral-600 group-hover:text-white transition-colors " />
                                </div>
                            </GrayButton>
                        ))
                    }
                </div>

                {
                    numOfAccounts > 1
                        ?
                        <GrayButton onClick={handleDeleteAccount}>
                            <div className="w-full text-red-500 justify-center ">
                                Remove Account
                            </div>
                        </GrayButton>
                        :
                        ""
                }

            </div>

            <div className="w-full p-2 flex justify-center items-center gap-x-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
            </div>
        </div>

        {infoPanel && <Receive close={() => setInfoPanel(null)} publicKey={infoPanel} />}

    </div>
}

interface contentType {
    label: string,
    valueToShow?: string,
    valueToLaterShow?: string
}

export const contentArray = (
    data: Account,
    mnemonic: string
) => {

    let noPassContent: contentType[] = [
        {
            label: "Account Name",
            valueToShow: data.name
        },
        {
            label: "Account Address",
            valueToLaterShow: data.publicKey
        }
    ];

    let passContent: contentType[] = [];

    if (data.derivedAccountNum === -1) {
        passContent.push({
            label: "Show Private Key",
            valueToLaterShow: data.privateKey
        });
    } else if (data.derivedAccountNum >= 0) {
        passContent.push({
            label: "Show Private Key",
            valueToLaterShow: data.privateKey
        });
        passContent.push({
            label: "Show Seed Phrase",
            valueToLaterShow: mnemonic
        });

    }

    return {
        noPassContent,
        passContent
    };

}