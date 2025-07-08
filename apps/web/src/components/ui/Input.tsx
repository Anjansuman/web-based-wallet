
interface InputProps {
    className?: string
    ref?: React.Ref<HTMLInputElement>,
    type?: "text" | "password" | "number",
    placeholder: string,
    error?: boolean,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const Input = ({ className, ref, type = "text", placeholder, error, onChange, onKeyDown }: InputProps) => {
    return <div className="w-full " >
        <input
            type={type}
            ref={ref}
            placeholder={placeholder}
            className={`${className} w-full h-full outline-none focus:outline-none focus:ring-0 text-base text-white rounded-xl p-4 bg-[#1e1e1e] border ${error ? "border-red-500" : "border-transparent"} `}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    </div>
}