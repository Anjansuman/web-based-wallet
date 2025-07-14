import Button from "../../../../components/ui/Button"

interface ValueProps {
    amount: string,
    currency: String,
    USD: string
}

export default function Value({ amount, currency, USD }: ValueProps) {
    return <div className="h-60 w-full bg-[#1e1e1e] rounded-xl flex flex-col justify-between items-start p-3 ">
        <div className="flex flex-col justify-between items-start ">
            <div className="text-3xl text-white font-semibold flex gap-x-1 ">
                {amount}{currency}
            </div>
            <div>
                {USD} USD
            </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-2 ">
                <Button
                    content={"Buy ETH with cash"}
                    colored
                />
                <Button
                    content={"Transfer ETH"}
                />                
        </div>
    </div>
}