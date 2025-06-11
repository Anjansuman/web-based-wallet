
interface ButtonProps {
    content: React.ReactNode,
    onClick: () => void,
    colored?: boolean,
    disabled?:boolean
}

export default function Button({ content, onClick, colored, disabled }: ButtonProps) {
    return <button
        className={`w-full rounded-lg p-3 flex justify-center items-center ${colored ? "text-[#1e1e1e] bg-[#ff4d67] hover:bg-[#FF6D7D] disabled:bg-[#cc3e52]" : "text-white bg-[#1e1e1e] hover:bg-[#262626]"} disabled:cursor-not-allowed transition-colors cursor-pointer text-sm font-semibold `}
        onClick={onClick}
        disabled={disabled}
    >
        {content}
    </button>
}