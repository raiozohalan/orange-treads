import React, { ReactNode, useState } from "react"
import Button from "./Button"
import getDialogActions from "@/utils/dialog"
import { LoadingSpinner } from "../icons"

interface ConfirmationModalProps {
  onCancel?: () => void
  onSuccess?: () => void
  onSuccessAwait?: () => Promise<void>
  title?: string | ReactNode
  content?: string | ReactNode
}

const MODAL_ID = "confirmation-modal"
const dialogActions = getDialogActions(MODAL_ID)

const ConfirmationModal = ({
  onCancel,
  onSuccess,
  onSuccessAwait,
  title,
  content,
}: ConfirmationModalProps) => {
  const [loading, setLoading] = useState(false)
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
    <dialog id={MODAL_ID} className="bg-[rgba(0,0,0,0.4)] w-screen h-screen">
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex flex-col items-start gap-5 bg-[#212122] max-w-1/3 px-6 py-8 rounded-lg border border-[#3c3d40] shadow-2xl">
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
      </div>
    </dialog>
  )
}

export default ConfirmationModal
