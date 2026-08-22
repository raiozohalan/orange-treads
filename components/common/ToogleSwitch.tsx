import classNames from "@/utils/classNames"
import React from "react"

interface ToggleSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  error?: string
  containerClassName?: string
}

const ToggleSwitch = ({ label, error, containerClassName, className, ...props }: ToggleSwitchProps) => {
  return (
    <div className={classNames("flex flex-col gap-1 w-full", containerClassName)}>
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <label
        className={classNames(
          "relative inline-flex items-center w-11 h-6 cursor-pointer",
          props.disabled && "opacity-50 cursor-not-allowed pointer-events-none select-none"
        )}
      >
        <input {...props} type="checkbox" className="sr-only peer" />
        <div
          className={classNames(
            "w-11 h-6 rounded-full bg-gray-300 transition-all duration-300 ease-in-out",
            "peer-focus:outline-none peer-checked:bg-blue-500",
            "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
            "after:bg-white after:rounded-full after:h-5 after:w-5",
            "after:transition-all after:duration-300 after:ease-in-out",
            "peer-checked:after:translate-x-5",
            className
          )}
        />
      </label>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export default ToggleSwitch