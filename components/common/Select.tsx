"use client"
import classNames from "@/utils/classNames"
import React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  containerClassName?: string
}

const Select = ({
  label,
  error,
  className,
  containerClassName,
  id,
  children,
  ...props
}: SelectProps) => {
  const generatedId = React.useId()
  const selectId = id ?? generatedId

  return (
    <div
      className={classNames("flex flex-col gap-1 w-full", containerClassName)}
    >
      {label && (
        <label htmlFor={selectId} className="text-sm text-gray-400">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          {...props}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={classNames(
            "w-full appearance-none px-3 py-2 pr-9 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none",
            className
          )}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}

export default Select
