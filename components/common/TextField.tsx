import classNames from "@/utils/classNames"
import React from "react"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const TextField = ({ label, ...props }: TextFieldProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <input
        {...props}
        className={classNames(
          "w-full px-3 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none"
        )}
      />
    </div>
  )
}

export default TextField
