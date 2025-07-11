
import { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import type { Account } from "../../../../types/AccountType";
import { IconDotsVertical } from "@tabler/icons-react";
import { GrayButton } from "../../../../components/ui/GrayButton";
import { AccountProfile } from "./AccountProfile";


interface ReceiveProps {
    close: () => void,

}

export const EditAccounts = ({ close }: ReceiveProps) => {

    const { hashed } = useHashed();
    const [accounts, setAccounts] = useState<Account[]>();
    const panelRef = useRef<HTMLDivElement>(null);

    const [accountProfile, setAccountProfile] = useState<Account | null>(null);

    const handleAccountProfile = (acc: Account) => {
        setAccountProfile(acc);
    }

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
                Manage accounts
            </div>

            <div className="w-full h-full overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">
                {/* make this a separate component like made for Button.tsx */}
                <div className="w-full h-full flex flex-col justify-start items-center p-2 gap-y-2">
                    {accounts?.map((acc, index) => (
                        <GrayButton
                            key={index}
                            onClick={() => handleAccountProfile(acc)}
                        >
                            <div className="">
                                {acc.name}
                            </div>
                            <div>
                                <IconDotsVertical />
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

        {accountProfile && <AccountProfile
            close={() => setAccountProfile(null)}
            data={accountProfile}
        />}

    </div>
}