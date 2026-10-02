import React, { ReactNode, useEffect, useState } from "react"
import Button from "./Button"
import getDialogActions from "@/utils/dialog"
import { LoadingSpinner } from "../icons"
import Dialog from "./Dialog"

interface ConfirmationModalProps {
  id?: string
  open?: boolean
  onCancel?: () => void
  onSuccess?: () => void
  onSuccessAwait?: () => Promise<void>
  title?: string | ReactNode
  content?: string | ReactNode
}

const MODAL_ID = "confirmation-modal"

const ConfirmationModal = ({
  id = MODAL_ID,
  open,
  onCancel,
  onSuccess,
  onSuccessAwait,
  title,
  content,
}: ConfirmationModalProps) => {
  const dialogActions = getDialogActions(id)
  const [loading, setLoading] = useState(false)

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
      <div className="dialog-content flex flex-col items-start gap-5 max-w-1/3 px-6 py-8 shadow-2xl">
        <label className="font-bold text-base text-white leading-0">
          {title}
        </label>
        <div className="text-gray-300">{content}</div>
        <div className="w-full flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleModalCancel}
            disabled={loading}
          >
            No
          </Button>
          <Button onClick={handleModalSuccess} disabled={loading}>
            {loading && <LoadingSpinner className="w-4 h-4 animate-spin" />}
            Yes
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmationModal
