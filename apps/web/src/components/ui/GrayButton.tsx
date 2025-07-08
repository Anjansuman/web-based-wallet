
interface GrayButtonProps {
    children: React.ReactNode,
    onClick?: () => void,
    ref?: React.Ref<HTMLDivElement>,
    className?: string
}

export const GrayButton = ({ children , onClick, ref, className}: GrayButtonProps) => {
    return <div
        className={`${className} w-full p-4 rounded-xl bg-[#1e1e1e] hover:bg-[#262626] transition-colors text-white text-base font-semibold flex justify-between items-center cursor-pointer `}
        onClick={onClick}
        ref={ref}
    >
        {children}
    </div>
}