import React, { useRef, useState } from "react";

interface InputProps {
  className?: string,
  type?: "text" | "password",
  placeholder: string,
  error?: boolean,
  ref?: React.Ref<HTMLTextAreaElement>
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
  value?: string
}

export const TextArea = ({
  className,
  type = "text",
  placeholder,
  error,
  ref,
  onChange,
  onKeyDown,
  value
}: InputProps) => {

  const [maskedValue, setMaskedValue] = useState("");
  const actualValue = useRef("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    const diff = input.length - maskedValue.length;

    if (diff > 0) {
      actualValue.current += input.slice(-diff);
    } else {
      actualValue.current = actualValue.current.slice(0, input.length);
    }

    setMaskedValue("•".repeat(actualValue.current.length));

    if (onChange) {
      e.target.value = actualValue.current;
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      <textarea
        placeholder={placeholder}
        ref={ref}
        onChange={type === "password" ? handleChange : onChange}
        onKeyDown={onKeyDown}
        value={type === "password" ? maskedValue : undefined}
        className={`
          ${className} 
          w-full h-32 resize-none outline-none focus:outline-none focus:ring-0 
          text-base text-white rounded-xl p-4 bg-[#1e1e1e] 
          border ${error ? "border-red-500" : "border-transparent"}
        `}
      >
        {value}
      </textarea>
    </div>
  );
};
