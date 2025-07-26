import { IconArrowLeft, IconCircleCheckFilled, IconCopy, IconPencil, IconPlus, IconSettings } from "@tabler/icons-react";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { usePopUp } from "../../../../context/PopUpPanelContext";
import { useHashedStore } from "../../../../store/hashed-store";
import type { Account } from "../../../../types/AccountType";

interface SideBarProps {
    ref?: React.Ref<HTMLDivElement>
    close: () => void,
    addAccount: () => void,
    editAccounts: () => void,
    settings: () => void
}

export default function SideBar({ ref, close, addAccount, editAccounts, settings }: SideBarProps) {

    const { hashed } = useHashedStore();

    const barRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [accountData, setAccountData] = useState<{ name: string; publicKey: string } | null>(null);
    const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [hovering, setHovering] = useState(false);
    const [copied, setCopied] = useState(false);
    const { showPanel } = usePopUp();

    const handleHover = (e: React.MouseEvent, name: string, publicKey: string) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPopupPos({
            top: rect.top + window.scrollY,
            left: rect.right + 10
        });
        setAccountData({ name, publicKey });
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            if (!hovering) setAccountData(null);
        }, 100);
    };

    const handleCopy = async (publicKey: string) => {
        try {
            await navigator.clipboard.writeText(publicKey);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showPanel("Error occured while copying", "error");
            return;
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                barRef.current && !barRef.current.contains(target) &&
                popupRef.current && !popupRef.current.contains(target)
            ) {
                close(); // close sidebar
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [close]);

    useEffect(() => {
        if (barRef.current) {
            gsap.from(barRef.current, {
                x: -100,
                duration: 0.2,
                ease: "power2.inOut"
            });
        }
    }, []);

    const onClose = () => {
        if (!barRef.current) return;

        gsap.to(barRef.current, {
            x: -100,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                close()
            }
        });
    }

    const handleAccountClick = (acc: Account) => {
        if(!hashed) return;

        hashed.setSelectedAccount(acc);
        onClose();

    }

    if (hashed === null || hashed?.getAccounts === null) return null;

    return (
        <div className="h-full w-full absolute z-40 top-0 left-0 backdrop-blur-[1px] flex justify-start items-center py-2 px-2 ">
            <div
                ref={barRef || ref}
                className="h-full w-16 bg-black rounded-md py-4 px-2 flex flex-col justify-between items-center shadow-md "
            >
                <div className="flex flex-col justify-start items-center gap-y-3 ">
                    <div
                        className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer"
                        onClick={onClose}
                    >
                        <IconArrowLeft className="hover:text-black" />
                    </div>
                    {hashed.getAccounts().map((acc, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-center items-center cursor-pointer"
                            onMouseEnter={(e) => handleHover(e, acc.name, acc.publicKey)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleAccountClick(acc)}
                        >
                            <div className="h-10 w-10 rounded-full bg-white flex justify-center items-center text-center">
                                {acc.name.charAt(0)}
                            </div>
                            <div className="text-[10px]">{acc.name}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col justify-start items-center gap-y-3 pt-3 border-t border-neutral-600 ">
                    <div
                        className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer"
                        onClick={addAccount}
                    >
                        <IconPlus className="hover:text-black" />
                    </div>
                    <div
                        className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer"
                        onClick={editAccounts}
                    >
                        <IconPencil className="hover:text-black" />
                    </div>
                    <div
                        className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer"
                        onClick={settings}
                    >
                        <IconSettings className="hover:text-black" />
                    </div>
                </div>
            </div>

            {accountData && (
                <div
                    ref={popupRef}
                    className="bg-black p-4 rounded-xl absolute left-[80px] z-50 flex flex-col justify-center items-start shadow-lg"
                    style={{ top: popupPos.top, left: popupPos.left }}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => {
                        setHovering(false);
                        setAccountData(null);
                    }}
                >
                    <div className="text-[#ff4d67] text-sm">{accountData.name}</div>
                    <div
                        className="flex items-center cursor-pointer "
                        onClick={() => handleCopy(accountData?.publicKey)}
                    >
                        <div className="text-white truncate overflow-hidden whitespace-nowrap max-w-[200px]">
                            {accountData.publicKey}
                        </div>
                        {
                            copied ? <IconCircleCheckFilled className="size-4 text-green-500 " /> : <IconCopy className="size-4" />
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
