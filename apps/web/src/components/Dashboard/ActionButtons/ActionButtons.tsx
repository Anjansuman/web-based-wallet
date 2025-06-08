import { IconBrandTelegram, IconCurrencyDollar, IconQrcode, IconTransfer } from "@tabler/icons-react";
import { Button } from "./Button";


export default function ActionButtons() {
    return <div className="w-full flex justify-between ">
        <Button icon={<IconQrcode className="text-[#ff4d67] size-[26px] " />} name={"Receive"} />
        <Button icon={<IconBrandTelegram className="text-[#ff4d67] size-[26px] " />} name={"Send"} />
        <Button icon={<IconTransfer className="text-[#ff4d67] size-[26px] " />} name={"Swap"} />
        <Button icon={<IconCurrencyDollar className="text-[#ff4d67] size-[26px] " />} name={"Buy"} />
    </div>
}