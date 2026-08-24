"use client"

import React, { useState } from "react"
import { Button, TextField } from "../common"
import TextArea from "../common/TextArea"
import ToggleSwitch from "../common/ToogleSwitch"
import { addWheelGroup } from "@/firebase/spinWheel"
import Alert, { AlertProps } from "../common/Alert"
import { LoadingSpinner } from "../icons"
import { WheelGroupInput } from "@/types/spin-wheel"
import { useAppStore } from "@/providers/app-store-provider"

const InitialGroup: WheelGroupInput = {
  name: "",
  description: "",
  isActive: false,
}

const SpinWheelGroupForm = () => {
  const setNewGroupsWithPrices = useAppStore(
    (state) => state.setNewGroupsWithPrices
  )
  const [group, setGroup] = useState<WheelGroupInput>(InitialGroup)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<Omit<AlertProps, "onClose">>({
    type: "error",
    message: "",
  })

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

  const handleOnSubmit = async () => {
    try {
      setIsSaving(true)
      const res = await addWheelGroup(group)
      if (res) {
        setNewGroupsWithPrices({
          id: res,
          ...group,
          prices: [],
        })
        setGroup(InitialGroup)
        setError({
          type: "success",
          message: "New Group is added successfully",
        })
        setTimeout(() => {
          setError({
            type: "error",
            message: "",
          })
        }, 5000)
      }
    } catch (err) {
      setError({
        type: "error",
        message: error.toString(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onCloseError = () => {
    setError({ type: "error", message: "" })
  }

  return (
    <dialog
      id="spin-wheel-group-form"
      popover="manual"
      className="bg-black/70 w-screen h-screen"
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center w-96 py-4 px-6 bg-gray-700 rounded-lg">
          <h2 className="text-2xl font-bold text-white">Add Group</h2>

          <Alert {...error} onClose={onCloseError} className="w-full my-1" />
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
              popoverTarget="spin-wheel-group-form"
              popoverTargetAction="hide"
            >
              Cancel
            </Button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default SpinWheelGroupForm
