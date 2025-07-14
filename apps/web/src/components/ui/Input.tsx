
interface InputProps {
    placeholder: string,
    className?: string
    ref?: React.Ref<HTMLInputElement>,
    type?: "text" | "password" | "number",
    error?: boolean,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    value?: string
}

export const Input = ({
    placeholder,
    className,
    ref,
    type = "text",
    error,
    onChange,
    onKeyDown,
    value
}: InputProps) => {
    return <div className="w-full " >
        <input
            type={type}
            ref={ref}
            placeholder={placeholder}
            className={`${className} w-full h-full outline-none focus:outline-none focus:ring-0 text-base text-white rounded-xl p-4 bg-[#1e1e1e] border ${error ? "border-red-500" : "border-transparent"} `}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value}
        />
    </div>
}