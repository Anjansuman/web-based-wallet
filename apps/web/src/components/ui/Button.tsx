import { IconLoader } from "@tabler/icons-react"

interface ButtonProps {
    content: React.ReactNode,
    onClick: () => void,
    colored?: boolean,
    disabled?:boolean,
    loader?: boolean
}

export default function Button({ content, onClick, colored, disabled, loader }: ButtonProps) {
    return <button
        className={`w-full rounded-xl p-4 flex justify-center items-center ${colored ? "text-[#1e1e1e] bg-[#ff4d67] hover:bg-[#FF6D7D] disabled:bg-[#cc3e52]" : "text-white bg-[#1e1e1e] hover:bg-[#262626]"} disabled:cursor-not-allowed transition-colors cursor-pointer text-[16px] font-semibold `}
        onClick={onClick}
        disabled={disabled}
    >
        {
            loader ? <IconLoader className="animate-spin " /> : content
        }
    </button>
}