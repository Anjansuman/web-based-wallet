
import { useEffect, useRef, useState } from "react";
import { useHashedStore } from '../../../../store/hashed-store';
import Button from '../../../../components/ui/Button';
import gsap from 'gsap';
import { GrayButton } from "../../../../components/ui/GrayButton";
import { EthereumLogo } from "../../../../components/SVGs/EthereumLogo";
import { SolanaLogo } from "../../../../components/SVGs/SolanaLogo";
import { Networks } from "../../../../utils/rpcURLs";


interface ReceiveProps {
    close: () => void,

}

export const NetworkTab = ({ close }: ReceiveProps) => {

    const { hashed } = useHashedStore();
    const panelRef = useRef<HTMLDivElement>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<Networks | null>(null);

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

    const handleSelectNetwork = (network: Networks) => {
        if (!hashed) return;

        hashed.changeNetwork(network);
        setSelectedNetwork(network);
        // onClose();
    }

    useEffect(() => {
        if (!hashed) return;

        const currNetwork = hashed.getSelectedNetwork();
        setSelectedNetwork(currNetwork);

    }, [hashed]);


    return <div className="h-full w-full absolute z-50 top-[0] left-0 flex justify-start items-start ">
        <div
            className="w-full h-[600px] bg-neutral-900 flex flex-col justify-between items-center p-3 "
            ref={panelRef}
        >
            <div className="w-full flex justify-center items-center p-3 shadow-md text-base font-semibold ">
                Networks
            </div>

            <div className="w-full h-full overflow-x-hidden overflow-y-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] ">

                <div className="w-full h-full flex flex-col justify-start items-center pt-2 gap-y-2">
                    {contentArray("mainnet")?.map((detail, index) => (
                        <GrayButton
                            className={"flex justify-start items-center gap-x-3 "}
                            key={index}
                            onClick={() => handleSelectNetwork(detail.network)}
                            selected={selectedNetwork === detail.network}
                        >
                            <div
                                className={`rounded-full p-2 `}
                                style={{
                                    background: detail.bg || "#2e2e2e"
                                }}
                            >
                                {detail.logo}
                            </div>
                            <div className="flex flex-col items-start justify-between ">
                                <div className="">
                                    {detail.title}
                                </div>
                                <div className="text-xs font-normal italic text-neutral-400 ">
                                    {detail.description}
                                </div>
                            </div>
                        </GrayButton>
                    ))}
                    {contentArray("devnet")?.map((detail, index) => (
                        <GrayButton
                            className={"flex justify-start items-center gap-x-3 "}
                            key={index}
                            onClick={() => handleSelectNetwork(detail.network)}
                            selected={selectedNetwork === detail.network}
                        >
                            <div
                                className={`rounded-full p-2 `}
                                style={{
                                    background: detail.bg || "#2e2e2e"
                                }}
                            >
                                {detail.logo}
                            </div>
                            <div className="flex flex-col items-start justify-between ">
                                <div className="">
                                    {detail.title}
                                </div>
                                <div className="text-xs font-normal italic text-neutral-400 ">
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
    bg?: string,
    title: string,
    description: string,
    network: Networks
}

export const contentArray = (network: "mainnet" | "devnet") => {
    const mainnet: contentType[] = [
        {
            logo: <EthereumLogo size={"24px"} />,
            bg: "#ffffff",
            title: "ETHEREUM",
            description: "[ Mainnet ]",
            network: Networks.Ethereum_Mainnet
        },
        {
            logo: <SolanaLogo size={'24px'} />,
            bg: "#000000",
            title: "SOLANA",
            description: "[ Mainnet ]",
            network: Networks.Solana_Mainnet
        }
    ];

    const devnet: contentType[] = [
        {
            logo: <EthereumLogo size={"24px"} />,
            bg: "#ffffff",
            title: "SEPOLIA",
            description: "[ Testnet ]",
            network: Networks.Sepolia_Testnet
        },
        {
            logo: <SolanaLogo size={'24px'} />,
            bg: "#000000",
            title: "SOLANA",
            description: "[ Devnet ]",
            network: Networks.Solana_Testnet
        }
    ]

    return network === "mainnet" ? mainnet : devnet;
}