import { IconArrowLeft } from "@tabler/icons-react";
import { useAccount } from "../../../context/zustand";

interface SideBarProps {
    close: () => void
}

export default function SideBar({ close }: SideBarProps) {

    const { accounts } = useAccount();

    return <div className="h-full w-full absolute z-50 top-0 left-0 backdrop-blur-xs flex justify-start items-center p-2 ">
        <div className="h-full w-16 bg-black rounded-md p-2 flex flex-col justify-between items-center ">
            <div
                className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer "
                onClick={close}
            >
                <IconArrowLeft className="" />
            </div>
            {
                accounts.map((acc, index) => (
                    <div
                        className="flex flex-col justify-center items-center "
                        key={index}
                    >
                        <div className="h-14 w-14 rounded-full bg-white flex justify-center items-center text-center " >
                            {acc.name.charAt(0)}
                        </div>
                        <div>
                            {acc.name}
                        </div>
                    </div>
                ))
            }
        </div>
    </div>
}