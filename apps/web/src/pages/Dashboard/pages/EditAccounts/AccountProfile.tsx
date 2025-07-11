
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import type { Account } from "../../../../types/AccountType";
import { GrayButton } from "../../../../components/ui/GrayButton";
import { IconChevronCompactRight } from "@tabler/icons-react";
import { Receive } from "../Receive";


interface ReceiveProps {
    type?: "seedAccount" | "importedAccount" | "watchAccount" // using this make the component to show profile buttons based on these
    close: () => void,
    data: Account
}

export const AccountProfile = ({ type = "seedAccount", close, data }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const [infoPanel, setInfoPanel] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string>("");

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

        const m = hashed.getMnemonic();
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

                <div className="h-20 w-20 bg-[#1e1e1e] rounded-full border border-neutral-600 flex justify-center items-center text-center text-lg ">
                    {data.name.charAt(0)}
                </div>

                <div className="w-full flex flex-col gap-y-[1px] rounded-xl overflow-hidden ">
                    {
                        contentArray(type, data, mnemonic).noPassContent.map((content, index) => (
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

                <div className="w-full flex flex-col gap-y-[1px] rounded-xl overflow-hidden ">
                    {
                        contentArray(type, data, mnemonic).passContent.map((content, index) => (
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

                <GrayButton>
                    <div className="text-red-500 justify-center ">
                        Remove Account
                    </div>
                </GrayButton>

            </div>

            <div className="w-full p-2 flex justify-center items-center gap-x-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
                <Button
                    content={"Create"}
                    onClick={() => { }}
                    colored
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
    type: "seedAccount" | "importedAccount" | "watchAccount",
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

    if (type === "importedAccount") {
        passContent.push({
            label: "Show Private Key",
            valueToLaterShow: data.privateKey
        });
    } else if (type === "seedAccount") {
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