
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
            <div className="w-full bg-[#ff4d67] hover:bg-[#FF6D7D] transition-colors rounded-xl flex justify-center items-center text-center font-semibold text-lg text-[#1e1e1e] py-3 cursor-pointer ">
                Buy ETH with cash
            </div>
            <div className="w-full bg-[#242424] hover:bg-[#3A3A3A] transition-colors rounded-xl flex justify-center items-center text-center font-semibold text-lg text-white py-3 cursor-pointer ">
                Transfer ETH
            </div>
        </div>
    </div>
}