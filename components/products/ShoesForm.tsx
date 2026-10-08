"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button, TextField } from "../common"
import getDialogActions from "@/utils/dialog"
import Dialog from "../common/Dialog"
import { ShoeSizeSelector } from "../products/ShoeSizesTab"
import { AvailableSizes, Productype, ShoesProduct } from "@/types/products"
import productsFirebase from "@/firebase/firebase-products"
import { toast } from "sonner"
import { LoadingSpinner } from "../icons"

const createInitialOrder = (): ShoesProduct => ({
  type: Productype.Shoes,
  name: "",
  supplierName: "",
  supplierPrice: "",
  sellingPrice: "",
  availableSizes: {},
})

const amountFields = [
  ["supplierPrice", "Supplier Price"],
  ["sellingPrice", "Selling Price"],
] as const

export interface ShoesFormProps {
  data?: ShoesProduct
  onClose?: () => void
}

const MODAL_ID = "shoes-form"
const dialogActions = getDialogActions(MODAL_ID)

const ShoesForm = ({ data, onClose }: ShoesFormProps) => {
  const [shoes, setShoes] = useState<ShoesProduct>(data ?? createInitialOrder)
  const [availableSizes, setAvailableSizes] = useState<AvailableSizes>(
    data?.availableSizes ?? {}
  )
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // This useEffect is for updating the shoes production only and will not handle the add shoe product
  useEffect(() => {
    if (data?.id) {
      dialogActions.open()
    }
  }, [data?.id])

  const onChangeShoe = (newData: Partial<ShoesProduct>) =>
    setShoes((previous) => ({ ...previous, ...newData }))

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target
    const field = target.name as keyof ShoesProduct
    let value: ShoesProduct[keyof ShoesProduct] = target.value
    if (target instanceof HTMLInputElement && target.type === "number") {
      value = Number(target.value)
    }

    onChangeShoe({ [field]: value })
  }

  const handleClose = () => {
    setShoes(createInitialOrder())
    setAvailableSizes({})
    onClose?.()
    dialogActions.close()
  }

  const handleSetAvailableSize = useCallback(
    ({ region, category, size }) => {
      setAvailableSizes((prev) => {
        let newSizes = [...(prev?.[region]?.[category] ?? [])]
        const getSizeIndex = newSizes.findIndex((d) => d === size)

        if (getSizeIndex >= 0) {
          newSizes.splice(getSizeIndex, 1)
        } else {
          newSizes.push(size)
        }

        return {
          ...prev,
          [region]: {
            ...prev[region],
            [category]: newSizes,
          },
        }
      })
    },
    [setAvailableSizes]
  )

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const { id: shoeId, ...payload } = shoes
      if (shoeId) {
        const res = productsFirebase.updateProduct(shoeId, {
          ...payload,
          availableSizes,
        })
        if (!res) {
          throw new Error("Failed to update the product")
        }

        // TODO: update the production list
        toast.success("Product updated successfully", {
          toasterId: "bottom-right",
        })
      } else {
        const res = productsFirebase.addNewProduct({
          ...payload,
          availableSizes,
        })

        if (!res) {
          throw new Error("Failed to add new product")
        }

        // TODO: Add this product to product list state
        toast.success("Product created successfully", {
          toasterId: "bottom-right",
        })
      }
      handleClose()
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
      <div className="dialog-content flex flex-col items-start w-full max-w-2xl min-0 max-h-[94vh] rounded-lg">
        <h2 className="flex-none text-xl font-bold text-white px-6 py-4">
          {shoes.id ? "Edit Shoes" : "Add Shoes"}
        </h2>
        <form
          onSubmit={handleOnSubmit}
          className="flex-1 flex flex-col gap-4 w-full max-h-full px-6 pb-6 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-5 mt-2">
            <TextField
              label="Name"
              name="name"
              value={shoes.name}
              onChange={handleFormChange}
              required
            />
            <TextField
              label="Supplier Name"
              name="supplierName"
              value={shoes.supplierName}
              onChange={handleFormChange}
              required
            />
            {amountFields.map(([field, label]) => (
              <TextField
                key={field}
                label={label}
                name={field}
                type="number"
                min="0"
                step="0.01"
                value={shoes[field]}
                onChange={handleFormChange}
              />
            ))}
          </div>
          <div>
            <label className="inline-block text-sm text-gray-400">
              Available Sizes:
            </label>
            <ShoeSizeSelector
              availableSizes={availableSizes}
              setAvailableSizes={handleSetAvailableSize}
              className="flex-none mt-1.5"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="secondary"
              size="xl"
              fullWidth
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="xl" fullWidth>
              {isSaving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
                  Saving...
                </>
              ) : shoes.id ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

export default ShoesForm
