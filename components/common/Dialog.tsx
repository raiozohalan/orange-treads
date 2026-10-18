import classNames from "@/utils/classNames"
import { DialogHTMLAttributes, ReactNode } from "react"

interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  id: string
  children: ReactNode
  showBackdrop?: boolean
}

const Dialog = ({
  children,
  className,
  showBackdrop = true,
  ...res
}: DialogProps) => {
  return (
    <dialog
      {...res}
      className={classNames(
        "fixed inset-0 m-0 h-screen w-screen max-h-none max-w-none border-0 bg-transparent p-0",
        showBackdrop ? "show-backdrop" : "",
        className
      )}
    >
      <div className="flex items-center justify-center w-full h-full">
        {children}
      </div>
    </dialog>
  )
}

export default Dialog
