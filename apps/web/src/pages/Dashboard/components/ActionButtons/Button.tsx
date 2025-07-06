
interface ButtonProps {
    icon: React.ReactNode,
    name: String,
    onClick?: () => void
}

export const Button = ({ icon, name, onClick }: ButtonProps) => {
    return <div className="w-[80px] flex flex-col justify-center items-center p-4 bg-[#1e1e1e] hover:bg-[#262626] transition-colors rounded-xl gap-y-2 cursor-pointer "
        onClick={onClick}
    >
        {icon}
        <div>
            {name}
        </div>
    </div>
}