import React, { ReactNode, useEffect, useState } from "react"
import Button from "./Button"
import getDialogActions from "@/utils/dialog"
import { LoadingSpinner } from "../icons"
import Dialog from "./Dialog"
import { AlertCircle, DivideCircle } from "react-feather"

type ConfirmationVariant = "default" | "warning" | "danger"

interface ConfirmationModalProps {
  id?: string
  open?: boolean
  variant?: ConfirmationVariant
  onCancel?: () => void
  onSuccess?: () => void
  onSuccessAwait?: () => Promise<void>
  title?: string | ReactNode
  content?: string | ReactNode
  warning?: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
}

const MODAL_ID = "confirmation-modal"

const VARIANT_STYLES: Record<
  ConfirmationVariant,
  { border: string; iconWrap: string; icon: string; confirm: string }
> = {
  default: {
    border: "border border-gray-700",
    iconWrap: "bg-blue-500/10",
    icon: "text-blue-400",
    confirm: "",
  },
  warning: {
    border: "border border-amber-500/40",
    iconWrap: "bg-amber-500/10",
    icon: "text-amber-400",
    confirm: "!bg-amber-500 hover:!bg-amber-600 !text-black",
  },
  danger: {
    border: "border border-red-500/40",
    iconWrap: "bg-red-500/10",
    icon: "text-red-400",
    confirm: "!bg-red-600 hover:!bg-red-700 !text-white",
  },
}

const WarningIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ConfirmationModal = ({
  id = MODAL_ID,
  open,
  variant = "default",
  onCancel,
  onSuccess,
  onSuccessAwait,
  title,
  content,
  warning,
  confirmLabel = "Yes",
  cancelLabel = "No",
}: ConfirmationModalProps) => {
  const dialogActions = getDialogActions(id)
  const [loading, setLoading] = useState(false)
  const styles = VARIANT_STYLES[variant]
  const showIcon = variant !== "default"

  useEffect(() => {
    if (open) {
      dialogActions.open()
    }
  }, [open])

  const handleModalSuccess = async () => {
    if (onSuccess) {
      onSuccess()
      dialogActions.close()
    } else if (onSuccessAwait) {
      try {
        setLoading(true)
        await onSuccessAwait()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
        dialogActions.close()
      }
    }
  }

  const handleModalCancel = () => {
    dialogActions.close()
    onCancel?.()
  }

  return (
    <Dialog id={id} popover="manual">
      <div
        role="alertdialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-content`}
        className={`dialog-content flex flex-col items-start gap-5 max-w-md w-full px-6 py-8 shadow-2xl rounded-lg ${styles.border}`}
      >
        <div className="flex flex-col items-start gap-4">
          <div className={`flex items-center gap-3 ${styles.icon}`}>
            {showIcon && (
              <div
                className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${styles.iconWrap}`}
              >
                <WarningIcon className={`w-5 h-5`} />
              </div>
            )}
            <h2 id={`${id}-title`} className="font-bold text-base">
              {title}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div
              id={`${id}-content`}
              className="text-sm text-gray-300 [&>b]:text-white"
            >
              {content}
            </div>

            {warning && (
              <div className="flex items-center gap-2 w-full bg-orange-800/30 px-2 py-1.5 leading-none text-sm text-gray-300  rounded-md">
                <AlertCircle className="w-5 h-5 inline" />
                <p>{warning}</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleModalCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={styles.confirm}
            onClick={handleModalSuccess}
            disabled={loading}
          >
            {loading && <LoadingSpinner className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmationModal
