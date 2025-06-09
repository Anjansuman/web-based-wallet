
type resultType = "success" | "error"

interface PopUpProps {
    content: String,
    ok: () => void,
    result: resultType
}

export default function PopUp({ content, ok, result }: PopUpProps) {
    return <div className="h-full w-full absolute z-50 top-0 left-0 backdrop-blur-xs flex justify-center items-center p-4 ">
        <div className={`w-full p-2 bg-[#1e1e1e] flex flex-col justify-center items-center gap-y-2 rounded-lg `}>
            <div className={`w-full flex justify-center items-center text-[16px] font-semibold ${result === "success" ? "text-green-500 " : "text-red-500"} border-b border-[#262626] `}>
                {
                    result === "success" ? "Success" : "Error"
                }
            </div>
            <div className="text-white text-sm ">
                {content}
            </div>
            <div
                className="w-full p-3 rounded-lg text-[#1e1e1e] bg-[#ff4d67] hover:bg-[#FF6D7D] transition-colors flex justify-center items-center text-sm font-semibold cursor-pointer "
                onClick={ok}
            >
                Okay
            </div>
        </div>
    </div>
}