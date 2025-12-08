import React, { Activity } from "react"
import { Close } from "../icons"
import classNames from "@/utils/classNames"

export interface AlertProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onClose: () => void;
  className?: string;
}

const alertVariants = {
  error: "bg-red-500/80 text-white",
  success: "bg-green-500/80 text-white",
  warning: "bg-yellow-500/80 text-white",
  info: "bg-blue-500/80 text-white",
}

const Alert = ({ type, message, onClose, className = "" }: AlertProps) => {
  return (
    <Activity mode={message ? "visible" : "hidden"}>
      <div
        className={classNames(
          "flex items-center justify-between gap-2 p-4 rounded-lg",
          alertVariants[type],
          className
        )}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <p className="flex-1 text-sm text-current">{message}</p>
          <div className="flex-none w-5 h-5 cursor-pointer" onClick={onClose}>
            <Close className="w-5 h-5 text-current" />
          </div>
        </div>
      </div>
    </Activity>
  )
}

export default Alert
