"use client"

import React, { useEffect, useId, useState } from "react"
import { Button, TextField } from "../common"
import getDialogActions from "@/utils/dialog"
import Dialog from "../common/Dialog"
import { TabList } from "./ShoeSizesTab"
import {
  PerfumeProduct,
  PerfumeConcentration,
  PerfumeScentFamily,
  ProductType,
} from "@/types/products"
import productsFirebase from "@/firebase/firebase-products"
import { toast } from "sonner"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"

const createInitialOrder = (): PerfumeProduct => ({
  type: ProductType.Perfume,
  name: "",
  supplierName: "",
  supplierPrice: "",
  sellingPrice: "",
  concentration: PerfumeConcentration.Parfum,
  scentFamily: PerfumeScentFamily.Woody,
})

const amountFields = [
  ["supplierPrice", "Supplier Price"],
  ["sellingPrice", "Selling Price"],
] as const

const concentration = Object.values(PerfumeConcentration).map((d) => ({
  id: d,
  label: d,
}))
const scentFamily = Object.values(PerfumeScentFamily).map((d) => ({
  id: d,
  label: d,
}))

export interface ShoesFormProps {
  data?: PerfumeProduct | null
  onClose?: () => void
}

const MODAL_ID = "perfume-form"
const dialogActions = getDialogActions(MODAL_ID)

const PerfumeForm = ({ data, onClose }: ShoesFormProps) => {
  const uid = useId()
  const addProduct = useAppStore((state) => state.addProduct)
  const updateProduct = useAppStore((state) => state.updateProduct)
  const setCurrentProduct = useAppStore((state) => state.setCurrentProduct)
  const concentrationId = `${uid}-concentration`
  const scentFamilyId = `${uid}-scent-family`
  const [product, setProduct] = useState<PerfumeProduct>(
    data ?? createInitialOrder
  )
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // This useEffect is for updating the product production only and will not handle the add shoe product
  useEffect(() => {
    if (data?.id) {
      dialogActions.open()
      setProduct(data)
    }
  }, [data?.id])

  const onChangeShoe = (newData: Partial<PerfumeProduct>) =>
    setProduct((previous) => ({ ...previous, ...newData }))

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target
    const field = target.name as keyof PerfumeProduct
    let value: PerfumeProduct[keyof PerfumeProduct] = target.value
    if (target instanceof HTMLInputElement && target.type === "number") {
      value = Number(target.value)
    }

    onChangeShoe({ [field]: value })
  }

  const handleClose = () => {
    setProduct(createInitialOrder())
    onClose?.()
    setCurrentProduct(null)
    dialogActions.close()
  }

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const { id: productId, ...payload } = product
      if (productId) {
        const res = await productsFirebase.updateProduct(productId, payload)
        if (!res) {
          throw new Error("Failed to update the product")
        }

        updateProduct({ id: productId, ...payload})
        // TODO: update the production list
        toast.success("Product updated successfully", {
          toasterId: "bottom-right",
        })
      } else {
        const res = await productsFirebase.addNewProduct(payload)

        if (!res) {
          throw new Error("Failed to add new product")
        }

        addProduct({ id: res, ...payload })
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
          {product.id ? "Edit Perfume" : "Add Perfume"}
        </h2>
        <form
          onSubmit={handleOnSubmit}
          className="flex-1 flex flex-col gap-4 w-full max-h-full px-6 pb-6 overflow-y-auto"
        >
          <fieldset disabled={isSaving} className="contents">
            <div className="grid grid-cols-2 gap-5 mt-2">
              <TextField
                label="Name"
                name="name"
                value={product.name}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Supplier Name"
                name="supplierName"
                value={product.supplierName}
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
                  value={product[field]}
                  onChange={handleFormChange}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Concentration:</label>
              <TabList
                label="concentration"
                baseId={concentrationId}
                tabs={concentration}
                selected={product.concentration}
                onSelect={(id) =>
                  setProduct((prev) => ({
                    ...prev,
                    concentration: id as PerfumeConcentration,
                  }))
                }
                className="w-fit! bg-gray-600/70!"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Scent Family:</label>
              <TabList
                label="scentFamily"
                baseId={scentFamilyId}
                tabs={scentFamily}
                selected={product.scentFamily}
                onSelect={(id) =>
                  setProduct((prev) => ({
                    ...prev,
                    scentFamily: id as PerfumeScentFamily,
                  }))
                }
                className="w-fit! bg-gray-600/70!"
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
                ) : product.id ? (
                  "Save Changes"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </Dialog>
  )
}

export default PerfumeForm
