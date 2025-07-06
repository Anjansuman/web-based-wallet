import { IconBrandTelegram, IconHistoryToggle, IconHome, IconQrcode, IconTransfer } from "@tabler/icons-react";


export default function BottomBar() {
    return <div className="h-14 w-full fixed bottom-0 left-0 p-4 flex justify-around items-center z-20 border-t-[1px] border-neutral-500 ">
        <IconHome className="hover:text-[#ff4d67] transition-colors size-[30px] cursor-pointer " />
        <IconTransfer className="hover:text-[#ff4d67] transition-colors size-[30px] cursor-pointer "/>
        <IconHistoryToggle className="hover:text-[#ff4d67] transition-colors size-[30px] cursor-pointer "/>
        <IconBrandTelegram className="hover:text-[#ff4d67] transition-colors size-[30px] cursor-pointer "/>
        <IconQrcode className="hover:text-[#ff4d67] transition-colors size-[30px] cursor-pointer "/>
    </div>
}