import classNames from "@/utils/classNames"
import React from "react"

const buttonVariants = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white",
}

const buttonSizes = {
  small: "px-2 py-1 text-sm",
  medium: "px-4 py-2 text-base",
  large: "px-6 py-3 text-lg",
}

const roundedSizes = {
  small: "rounded-sm",
  medium: "rounded-md",
  large: "rounded-lg",
}

// Built-in command keywords, plus support for custom "--foo" commands
type ButtonCommand =
  | "show-modal"
  | "close"
  | "request-close"
  | "show-popover"
  | "hide-popover"
  | "toggle-popover"
  | (string & {})

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  children?: React.ReactNode;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  roundedSize?: keyof typeof roundedSizes;
  fullWidth?: boolean;
  className?: string;
  command?: ButtonCommand;
  commandfor?: string; // ID of the target element for the command
}

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  roundedSize = "medium",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      {...props}
      className={classNames(
        "flex items-center justify-center gap-2 font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none",
        "cursor-pointer transition-opacity duration-300 ease-in-out",
        fullWidth ? "w-full" : "",
        buttonVariants[variant],
        buttonSizes[size],
        roundedSizes[roundedSize],
        className
      )}
    >
      {children}
    </button>
  )
}

export default Button