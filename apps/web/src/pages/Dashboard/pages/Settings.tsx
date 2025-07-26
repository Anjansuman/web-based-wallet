
import { useEffect, useRef, useState } from "react";
import { useHashedStore } from '../../../store/hashed-store';
import Button from '../../../components/ui/Button';
import gsap from 'gsap';
import type { Account } from "../../../types/AccountType";
import { IconBracketsContain, IconDownload, IconEye, IconPlus } from "@tabler/icons-react";
import { GrayButton } from "../../../components/ui/GrayButton";


interface ReceiveProps {
    close: () => void,

}

export const Settings = ({ close }: ReceiveProps) => {

    const { hashed } = useHashedStore();
    const [accounts, setAccounts] = useState<Account[]>();
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

        const allAccounts = hashed.getAccounts();
        setAccounts(allAccounts);
        console.log(accounts);
    }, [hashed]);


    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Add a new wallet
            </div>

            <div className="w-full h-full overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">
                {/* make this a separate component like made for Button.tsx */}
                <div className="w-full h-full flex flex-col justify-start items-center p-2 gap-y-2">
                    {contentArray()?.map((detail, index) => (
                        <GrayButton
                            className={"flex justify-start items-center gap-x-2 "}
                            key={index}
                        >
                            <div className="rounded-full p-2 bg-[#2e2e2e] ">
                                {detail.logo}
                            </div>
                            <div className="flex flex-col items-start justify-between ">
                                <div className="">
                                    {detail.title}
                                </div>
                                <div className="text-xs font-normal text-neutral-400 ">
                                    {detail.description}
                                </div>
                            </div>
                        </GrayButton>
                    ))}
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


interface contentType {
    logo: React.ReactNode,
    title: string,
    description: string
}

export const contentArray = () => {
    const content: contentType[] = [
        {
            logo: <IconPlus />,
            title: "Create New Account",
            description: "Add a new account"
        },
        {
            logo: <IconBracketsContain />,
            title: "Import Recovery Phrase",
            description: "Import accounts from that phrase"
        },
        {
            logo: <IconDownload />,
            title: "Import Private Key",
            description: "Import a account using it's private key"
        },
        {
            logo: <IconEye />,
            title: "Watch Address",
            description: "Track any public wallet address"
        }
    ];

    return content;
}