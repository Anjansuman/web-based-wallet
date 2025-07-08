import { IconBrandTelegram, IconCurrencyDollar, IconQrcode, IconTransfer } from "@tabler/icons-react";
import { Button } from "./Button";

interface ActionButtons {
    receive: () => void,
    send: () => void,
    swap: () => void,
    buy: () => void
}

export default function ActionButtons({ receive, send, swap, buy }: ActionButtons) {


    return <div className="w-full flex justify-between ">
        <Button
            icon={<IconQrcode className="text-[#ff4d67] " />}
            name={"Receive"}
            onClick={receive}
        />
        <Button
            icon={<IconBrandTelegram className="text-[#ff4d67] " />}
            name={"Send"}
            onClick={send}
        />
        <Button
            icon={<IconTransfer className="text-[#ff4d67] " />}
            name={"Swap"}
            onClick={swap}
        />
        <Button
            icon={<IconCurrencyDollar className="text-[#ff4d67] " />}
            name={"Buy"}
            onClick={buy}
        />
    </div>
}