
import React, { useEffect, useRef, useState } from "react";
import { useHashed } from '../../../../context/HashedAtom';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import { Input } from "../../../../components/ui/Input";
import { IconAlertTriangle, IconEyeExclamation, IconLockPassword } from "@tabler/icons-react";


interface ReceiveProps {
    type: "privateKey" | "seedPhrase" | "passwordChange",
    close: () => void,
    done: (isDone: boolean, type: "privateKey" | "seedPhrase" | "passwordChange") => void
}

export const PassCheck = ({ type, close, done }: ReceiveProps) => {

    const { hashed } = useHashed();
    const panelRef = useRef<HTMLDivElement>(null);

    const [actualPassword, setActualpassword] = useState<string>("");
    const passwordRef = useRef<HTMLInputElement>(null);


    const handleNext = () => {
        if(!passwordRef.current) return;

        if(passwordRef.current.value === actualPassword) {
            done(true, type);
            onClose();
        } else {
            // do something with the wrong password
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
        if(!hashed) return;

        const pass = hashed.getPassword();
        setActualpassword(pass);

    }, [hashed]);

    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Verify
            </div>

            <div className="w-full h-full pt-6 flex flex-col justify-center items-center gap-y-8 overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">

                <div className="flex flex-col gap-y-2  ">
                    {
                        contentArray(type).map((detail, index) => (
                            <div className="flex justify-start items-center gap-x-3 p-4 " key={index} >
                                <div className="bg-[#ff4d67] rounded-md p-1 text-black flex justify-center items-center ">
                                    {detail.logo}
                                </div>
                                <div className="text-base text-white font-semibold ">
                                    {detail.text}
                                </div>
                            </div>
                        ))
                    }
                </div>

                <Input
                    placeholder="Password"
                    type={"password"}
                    ref={passwordRef}
                />

            </div>

            <div className="w-full p-2 flex justify-center items-center gap-x-2 ">
                <Button
                    content={"Close"}
                    onClick={onClose}
                />
                <Button
                    content={"Next"}
                    onClick={handleNext}
                    colored
                />
            </div>
        </div>
    </div>
}

interface contentType {
    logo: React.ReactNode,
    text: string
}

const contentArray = (type: "privateKey" | "seedPhrase" | "passwordChange") => {

    const privateKeyContent: contentType[] = [
        {
            logo: <IconLockPassword />,
            text: "Your private key is like a password for your account."
        },
        {
            logo: <IconAlertTriangle />,
            text: "If someone gets it, they will have full access to your wallet."
        },
        {
            logo: <IconEyeExclamation />,
            text: "Never share it with ANYONE."
        }
    ];

    const seedPhraseContent: contentType[] = [
        {
            logo: <IconLockPassword />,
            text: "Your secret seed phrase is the master key of your wallet"
        },
        {
            logo: <IconAlertTriangle />,
            text: "If someone gets it, they will have full access to all the wallets."
        },
        {
            logo: <IconEyeExclamation />,
            text: "Never share it with ANYONE."
        }
    ];

    const passwordContent: contentType[] = [];

    return type === "privateKey" ? privateKeyContent : type === "seedPhrase" ? seedPhraseContent : passwordContent;

}