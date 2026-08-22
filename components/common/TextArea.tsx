import classNames from "@/utils/classNames"
import React from "react"

interface TextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  containerClassName?: string
}

const TextField = ({
  label,
  error,
  className,
  containerClassName,
  ...props
}: TextFieldProps) => {
  return (
    <div
      className={classNames("flex flex-col gap-1 w-full", containerClassName)}
    >
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <textarea
        {...props}
        className={classNames(
          "w-full min-h-11 max-h-44 px-3 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none",
          className
        )}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export default TextField
