"use client"

import React, { useState } from "react"
import { Button, TextField } from "../common"
import ToggleSwitch from "../common/ToogleSwitch"
import { addWheelPrice } from "@/firebase/spinWheel"
import Alert, { AlertProps } from "../common/Alert"
import { LoadingSpinner } from "../icons"
import { WheelPriceInput } from "@/types/spin-wheel"
import { useAppStore } from "@/providers/app-store-provider"
import Select from "../common/Select"

const InitialGroup = {
  name: "",
  color: "#ff0000",
  percentage: "30",
  image: "",
  groupId: "",
  isActive: false,
}

const SpinWheelPriceForm = () => {
  const groups = useAppStore((state) => state.groupsWithPrices)
  const setGroupPrices = useAppStore((state) => state.setGroupPrices)
  const [price, setPrice] = useState<WheelPriceInput>(InitialGroup)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<Omit<AlertProps, "onClose">>({
    type: "error",
    message: "",
  })

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target
    setPrice((prev) => ({
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
      const res = await addWheelPrice({ ...price })
      if (res) {
        setPrice(InitialGroup)
        setGroupPrices(price.groupId, {
          id: res,
          ...price,
        })
        setError({
          type: "success",
          message: "New Spin Wheel price is added successfully",
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
      id="spin-wheel-price-form"
      popover="manual"
      className="bg-black/70 w-screen h-screen"
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center w-90 py-4 px-6 bg-gray-700 rounded-lg">
          <h2 className="text-2xl font-bold text-white">Add Price</h2>
          <Alert {...error} onClose={onCloseError} className="w-full my-1" />
          <form
            onSubmit={handleOnSubmit}
            method="dialog"
            encType="multipart/form-data"
            className="flex flex-col gap-4 w-full max-w-md"
          >
            {groups.length > 0 && (
              <div className="flex flex-col gap-1 w-full max-w-md">
                <label className="text-sm text-gray-100">Select Group</label>
                <Select
                  id="group-select"
                  required
                  value={price.groupId}
                  name="groupId"
                  className="border border-gray-300 rounded-md p-2 text-gray-200"
                  onChange={(e) => {
                    setPrice((prev) => ({
                      ...prev,
                      groupId: e.target.value,
                    }))
                  }}
                >
                  <option value="" className="text-gray-400">
                    Select a group
                  </option>
                  {groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                      className="text-gray-200"
                    >
                      {group.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <TextField
              label="Name"
              name="name"
              placeholder="Enter name"
              required
              onChange={handleFormChange}
              className="text-gray-200"
              containerClassName="[&_label]:text-gray-100"
            />
            <TextField
              label="Image URL"
              name="image"
              placeholder="Enter image URL"
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
                onChange={handleFormChange}
                containerClassName="[&_label]:text-gray-100"
                className="w-10! h-6! px-px py-0!"
                defaultValue={price.color}
              />
              <ToggleSwitch
                label="Is Active"
                name="isActive"
                checked={price.isActive}
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
                defaultValue={price.percentage}
                min={5}
                max={100}
                className="text-gray-200 -mt-2"
                containerClassName="[&_label]:text-gray-100"
              />
              <span className="w-full text-center font-bold -mt-2 text-white">
                {price.percentage}%
              </span>
            </div>
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
              popoverTarget="spin-wheel-price-form"
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

export default SpinWheelPriceForm
