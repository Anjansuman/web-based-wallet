
interface GrayButtonProps {
    children: React.ReactNode,
    plain?: boolean,
    onClick?: () => void,
    ref?: React.Ref<HTMLDivElement>,
    className?: string,
    selected?: boolean
}

export const GrayButton = ({ children, plain, onClick, ref, className, selected}: GrayButtonProps) => {
    return <div
        className={`${className} w-full p-4 ${plain ? "rounded-none" : "rounded-xl"} bg-[#1e1e1e] hover:bg-[#262626] transition-colors ${selected ? "border border-[#ff4d67] " : ""} text-white text-base font-semibold flex justify-between items-center cursor-pointer `}
        onClick={onClick}
        ref={ref}
    >
        {children}
    </div>
}