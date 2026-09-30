"use client"

import React, { useEffect, useState } from "react"
import { Button, TextField } from "../common"
import TextArea from "../common/TextArea"
import ToggleSwitch from "../common/ToogleSwitch"
import {
  addWheelGroup,
  getPrizesByGroupId,
  updateWheelGroup,
} from "@/firebase/spin-wheel"
import Alert, { AlertProps } from "../common/Alert"
import { LoadingSpinner } from "../icons"
import { WheelGroup } from "@/types/spin-wheel"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import Dialog from "../common/Dialog"

const InitialGroup: WheelGroup = {
  id: "",
  name: "",
  description: "",
  isActive: false,
}

interface SpinWheelGroupFormProps {
  open?: boolean
  onClose?: () => void
  data?: WheelGroup | null
}

const MODAL_ID = "spin-wheel-group-form"
const dialogActions = getDialogActions(MODAL_ID)

const SpinWheelGroupForm = ({
  open,
  onClose,
  data,
}: SpinWheelGroupFormProps) => {
  const setNewGroupsWithPrizes = useAppStore(
    (state) => state.setNewGroupsWithPrizes
  )
  const [group, setGroup] = useState<WheelGroup>(data ?? InitialGroup)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      dialogActions.open()
    }
  }, [open])

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target
    setGroup((prev) => ({
      ...prev,
      [target.name]:
        target.type === "checkbox" && "checked" in target
          ? target.checked
          : target.value,
    }))
  }

  const handleClose = () => {
    setGroup(InitialGroup)
    onClose?.()
    dialogActions.close()
  }

  const handleOnSubmit = async () => {
    try {
      setIsSaving(true)
      if (group?.id !== null) {
        const res = await updateWheelGroup(group.id, group)
        if (res) {
          const prize = await getPrizesByGroupId(group.id)
          setNewGroupsWithPrizes({
            ...group,
            prizes: prize ?? [],
          })

          toast.success(`The ${group.name} is successfully updated`, {
            toasterId: "bottom-right",
          })
          handleClose()
        }
      } else {
        const res = await addWheelGroup(group)
        if (res) {
          setNewGroupsWithPrizes({
            ...group,
            id: res,
            prizes: [],
          })
          toast.success("New Group is added successfully", {
            toasterId: "bottom-right",
          })
          handleClose()
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), {
        toasterId: "bottom-right",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog id={MODAL_ID} popover="manual">
      <div className="dialog-content flex flex-col items-center justify-center w-96 py-4 px-6 bg-gray-700 rounded-lg">
        <h2 className="text-2xl font-bold text-white">Add Group</h2>
        <form
          onSubmit={handleOnSubmit}
          method="dialog"
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <TextField
            label="Name"
            name="name"
            placeholder="Enter group name"
            value={group.name}
            required
            onChange={handleFormChange}
            className="text-gray-200"
            containerClassName="[&_label]:text-gray-100"
          />
          <TextArea
            label="Description"
            name="description"
            placeholder="Enter group description"
            value={group.description}
            onChange={handleFormChange}
            className="text-gray-200"
            containerClassName="[&_label]:text-gray-100"
          />
          <ToggleSwitch
            label="Is Active"
            name="isActive"
            checked={group.isActive}
            containerClassName="flex-row items-center gap-3 [&_label]:text-gray-100"
            onChange={handleFormChange}
          />
          <Button
            type="submit"
            size="medium"
            roundedSize="medium"
            fullWidth={true}
          >
            {isSaving ? (
              <>
                <LoadingSpinner className="w-4 h-4 text-white animate-spin" />
                Saving...
              </>
            ) : (
              "Add Group"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            roundedSize="medium"
            fullWidth={true}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </form>
      </div>
    </Dialog>
  )
}

export default SpinWheelGroupForm
