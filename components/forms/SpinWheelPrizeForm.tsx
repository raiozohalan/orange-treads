"use client"

import React, { useEffect, useState } from "react"
import { Button, TextField } from "../common"
import ToggleSwitch from "../common/ToogleSwitch"
import { addWheelPrize, updateWheelPrize } from "@/firebase/spin-wheel"
import { LoadingSpinner } from "../icons"
import { WheelPrize } from "@/types/spin-wheel"
import firebaseStorageFunctions from "@/firebase/firebase-storage"
import getDialogActions from "@/utils/dialog"
import Dialog from "../common/Dialog"
import { toast } from "sonner"

export const InitialPrize = {
  id: "",
  name: "",
  color: "#ff0000",
  percentage: 30,
  image: "",
  isActive: false,
}

interface SpinWheelPrizeFormProps {
  open?: boolean
  onClose?: () => void
  data?: WheelPrize | null
}

const MODAL_ID = "spin-wheel-prize-form"
const dialogActions = getDialogActions(MODAL_ID)

const SpinWheelPrizeForm = ({
  open,
  data,
  onClose,
}: SpinWheelPrizeFormProps) => {
  const [prize, setPrize] = useState<WheelPrize>(data ?? InitialPrize)
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

    let newValue: string | boolean | File | number = target.value

    if ("files" in target && target?.files && target?.files?.length > 0) {
      newValue = target.files[0]
    } else if (target.type === "checkbox" && "checked" in target) {
      newValue = target.checked
    } else if (target.type === "range") {
      newValue = parseInt(target.value, 10)
    }

    setPrize((prev) => ({
      ...prev,
      [target.name]: newValue,
    }))
  }

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      let imageUrl: string = typeof prize.image === "string" ? prize.image : ""
      if (typeof prize.image !== "string" && prize.image instanceof File) {
        const imageId = crypto.randomUUID()
        const savedImage = await firebaseStorageFunctions.saveFile(
          `spin_wheel_prizes/${imageId}-${prize.image.name}`,
          prize.image
        )
        if (savedImage) {
          imageUrl = savedImage
        } else {
          toast.error("Failed to upload image", { toasterId: "bottom-right" })
          return
        }
      }

      const { id: prizeId, ...prizePayload } = prize

      if (prizeId !== "") {
        const res = await updateWheelPrize(prize.id, {
          ...prizePayload,
          image: imageUrl,
        })
        if (res) {
          setPrize(InitialPrize)
          toast.success("The prize is successfully updated", {
            toasterId: "bottom-right",
          })
        }
      } else {
        const res = await addWheelPrize({ ...prizePayload, image: imageUrl })
        if (res) {
          setPrize(InitialPrize)
          toast.success("New prize is added successfully", {
            toasterId: "bottom-right",
          })
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err), {
        toasterId: "bottom-right",
      })
    } finally {
      setIsSaving(false)
      onClose?.()
      dialogActions.close()
    }
  }

  const handleClose = () => {
    setPrize(InitialPrize)
    onClose?.()
    dialogActions.close()
  }

  return (
    <Dialog id={MODAL_ID} popover="manual">
      <div className="dialog-content flex flex-col items-center justify-center w-90 py-4 px-6">
        <h2 className="text-2xl font-bold text-white">Add Prize</h2>
        <form
          onSubmit={handleOnSubmit}
          method="dialog"
          encType="multipart/form-data"
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <TextField
            label="Name"
            name="name"
            placeholder="Enter name"
            required
            value={prize.name}
            onChange={handleFormChange}
            className="text-gray-200"
            containerClassName="[&_label]:text-gray-100"
          />
          <TextField
            type="file"
            label="Image URL"
            name="image"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            placeholder="Enter image URL"
            value=""
            onChange={handleFormChange}
            className="text-gray-200"
            containerClassName="[&_label]:text-gray-100"
          />
          <div className="flex items-baseline gap-2">
            <TextField
              type="color"
              label="Color"
              name="color"
              placeholder="Enter color"
              value={prize.color}
              onChange={handleFormChange}
              containerClassName="[&_label]:text-gray-100"
              className="w-10! h-6! px-px py-0!"
            />
            <ToggleSwitch
              label="Is Active"
              name="isActive"
              checked={prize.isActive}
              containerClassName="[&_label]:text-gray-100"
              onChange={handleFormChange}
            />
          </div>
          <div className="w-full flex flex-col">
            <TextField
              type="range"
              label="Percentage (5% - 100%)"
              name="percentage"
              placeholder="Enter percentage"
              onChange={handleFormChange}
              value={prize.percentage}
              min={5}
              max={100}
              className="text-gray-200 -mt-2"
              containerClassName="[&_label]:text-gray-100"
            />
            <span className="w-full text-center font-bold -mt-2 text-white">
              {prize.percentage}%
            </span>
          </div>
          <Button
            type="submit"
            size="large"
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
            size="large"
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

export default SpinWheelPrizeForm
