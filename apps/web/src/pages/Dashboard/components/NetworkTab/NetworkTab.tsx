import { IconPlus, IconX } from "@tabler/icons-react";
import { Networks, RPC } from "../../../../utils/rpcURLs";
import { useCurrent } from "../../../../context/Zustand";
import { usePopUp } from "../../../../context/PopUpPanelContext";
import { useEffect } from "react";

interface NetworkTabProps {
    close: () => void
}

export default function NetworkTab({ close }: NetworkTabProps) {

    const { setNetwork } = useCurrent();
    const { showPanel } = usePopUp();

    const networkHandler = (network: Networks) => {

        const rpc = RPC[network];
        if(!rpc) {
            showPanel("unable to access RPC url of: " + network, "error");
            return;
        }
        setNetwork(rpc);
    }

    // this is just for time being, cause of testing problem
    useEffect(() => {
        networkHandler(Networks.Ethereum_Mainnet);
    }, []);

    return <div className="h-screen w-full absolute z-50 top-0 left-0 backdrop-blur-[1px] flex justify-start items-center p-2">
        <div className="h-full w-full py-4 bg-black rounded-xl flex flex-col justify-start items-center ">
            <div className="w-full flex justify-between items-center border-b-[1px] sticky py-2 px-4 ">
                <div></div>
                <div className="text-lg text-white font-semibold ">
                    Select a network
                </div>
                <div onClick={close}>
                    <IconX className="p-1 hover:bg-gray-600 hover:text-red-500 transition-colors duration-200 rounded-sm cursor-pointer " />
                </div>
            </div>
            <div className="w-full flex flex-col justify-center items-start gap-y-2">
                {/* {
                    .map((network, index) => (
                        <div
                            className="w-full flex justify-between items-center rounded-md px-4 py-2 bg-black hover:bg-[#191919] transition-colors duration-200 ease-in-out "
                            key={index}
                            onClick={() => networkHandler(network)}
                        >
                            <div className="flex justify-start items-center gap-x-2 ">
                                <div className="h-6 w-6 text-xs text-white p-1 rounded-full bg-black border-[0.5px] border-white flex justify-center items-center ">
                                    {network.charAt(0)}
                                </div>
                                <div className="text-lg text-white ">
                                    {network}
                                </div>
                            </div>
                            <IconInfoSquareRounded className="size-4" />
                        </div>
                    ))
                } */}
                <div className="w-full flex justify-between items-center rounded-md py-2 bg-black hover:bg-[#191919] transition-colors duration-200 ease-in-out "                >
                    <div className="flex justify-start items-center gap-x-2 ">
                        <div className="h-6 w-6 text-xs text-white p-2 rounded-full bg-black border-[1px] border-white flex justify-center items-center ">
                            C
                        </div>
                        <div className="text-lg text-white">
                            Custom Network
                        </div>
                    </div>
                    <IconPlus className="size-4" />
                </div>
            </div>
        </div>
    </div>
}