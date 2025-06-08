import { IconArrowLeft } from "@tabler/icons-react";

interface SideBarProps {
    close: () => void
}

export default function SideBar({ close }: SideBarProps) {
    return <div className="absolute z-60 h-[584px] w-14 bg-black rounded-md p-2 flex flex-col justify-between items-center ">
        <div
            className="hover:bg-white transition-colors p-1 rounded-sm cursor-pointer "
onClick={close}
        >
            <IconArrowLeft className="" />
        </div>
    </div>
}