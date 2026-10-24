"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button, TextField, TextArea } from "../common"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import Dialog from "../common/Dialog"
import {
  Bank,
  EWalletProvider,
  OrderPayment,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@/types/orders"
import ProductsModal from "./ProductsModal"
import { FormAction } from "@/types/common"
import dayjs from "dayjs"
import Select from "../common/Select"
import { paymentsFirebase } from "@/firebase/firebase-payments"

interface OrderFormProps {
  onClose?: () => void
}

const INITIAL_DATA: OrderPayment = {
  id: "",
  amount: 0,
  date: new Date(),
  paymentMethod: PaymentMethod.Cash,
  note: "",
}

const MODAL_ID = "payment-form"
const dialogActions = getDialogActions(MODAL_ID)

const PAYMENT_METHODS = Object.values(PaymentMethod).map((method) => ({
  label: PAYMENT_METHOD_LABELS[method],
  value: method,
}))
const E_Wallet_Provider = Object.values(EWalletProvider)
const Bank_List = Object.values(Bank)

const AddPaymentForm = ({ onClose }: OrderFormProps) => {
  const payment = useAppStore((state) => state.payment)
  const setPayment = useAppStore((state) => state.setPayment)
  const updateOrder = useAppStore((state) => state.updateOrder)
  const [paymentDetails, setPaymentDetails] =
    useState<OrderPayment>(INITIAL_DATA)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (
      payment &&
      [FormAction.Create, FormAction.Update].includes(payment.type)
    ) {
      dialogActions.open()
      const { type, orderId, ...restPaymentdetails } = payment
      setPaymentDetails({ ...INITIAL_DATA, ...restPaymentdetails })
    }
  }, [payment])

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value } = e.target
    const field = name as keyof OrderPayment

    setPaymentDetails((prev) => {
      // switching method: drop everything that belongs to a method
      if (field === "paymentMethod" && value !== PaymentMethod.Cash) {
        if (value === PaymentMethod.BankTransfer) {
          return {
            id: "",
            bank: Bank.Other,
            amount: prev.amount,
            date: prev.date,
            noted: prev.note,
            referenceNo: "",
            paymentMethod: PaymentMethod.BankTransfer,
          }
        } else if (value === PaymentMethod.EWallet) {
          return {
            id: "",
            amount: prev.amount,
            date: prev.date,
            noted: prev.note,
            referenceNo: "",
            paymentMethod: PaymentMethod.EWallet,
            eWalletProvider: EWalletProvider.Other,
          }
        }
      }

      const parsed = type === "number" && +value > 0 ? Number(value) : value
      return { ...prev, [field]: parsed }
    })
  }

  const handleClose = () => {
    setPaymentDetails(INITIAL_DATA)
    setPayment(null)
    onClose?.()
    dialogActions.close()
  }

  const handleOnSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!payment) return

      try {
        setIsSaving(true)

        const { type, ...payload } = {
          ...payment,
          ...paymentDetails,
          id: payment.id || crypto.randomUUID(),
        }
        if (payload?.id && type === FormAction.Update) {
          const res = await paymentsFirebase.updatePayment(
            payload.orderId,
            payload
          )
          if (!res) {
            throw new Error("Failed to update order")
          }
          updateOrder({ id: payload.orderId, ...res })
          toast.success("Payment updated successfully", {
            toasterId: "bottom-right",
          })
        } else {
          const res = await paymentsFirebase.addPayment(
            payload.orderId,
            payload
          )
          if (!res) {
            throw new Error("Failed to add new order")
          }
          updateOrder({ id: payload.orderId, ...res })
          toast.success("Payment created successfully", {
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
    },
    [paymentDetails, payment]
  )

  return (
    <>
      <ProductsModal />
      <Dialog id={MODAL_ID} popover="manual">
        <div className="dialog-content flex flex-col items-start w-full max-w-xl min-h-0 max-h-full lg:min-0 lg:max-h-[94vh] rounded-lg">
          <h2 className="flex-none text-xl font-bold text-white px-4 lg:px-6 py-4">
            {payment?.id ? "Edit Payment" : "Add Payment"}
          </h2>
          <form
            onSubmit={handleOnSubmit}
            className="relative flex-1 flex flex-col gap-5 h-auto max-h-full w-full px-4 lg:px-6 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col gap-2 mt-2">
              <TextField
                type="number"
                label="Amount"
                name="amount"
                value={paymentDetails.amount > 0 ? paymentDetails.amount : ""}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Date of Payment"
                type="date"
                name="date"
                value={dayjs(paymentDetails.date).format("YYYY-MM-DD")}
                onChange={handleFormChange}
                required
              />
              <Select
                label="Payment Method"
                aria-label="Payment Method"
                className="capitalize py-1! h-10! text-gray-200"
                value={paymentDetails.paymentMethod}
                name="paymentMethod"
                onChange={handleFormChange}
              >
                {PAYMENT_METHODS.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {paymentDetails.paymentMethod === PaymentMethod.EWallet ? (
                <Select
                  label="E-Wallet Provider"
                  aria-label="E Wallet Provider"
                  className="capitalize py-1! h-10! text-gray-200"
                  value={paymentDetails.eWalletProvider}
                  name="eWalletProvider"
                  onChange={handleFormChange}
                >
                  {E_Wallet_Provider.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </Select>
              ) : paymentDetails.paymentMethod ===
                PaymentMethod.BankTransfer ? (
                <Select
                  label="Bank"
                  aria-label="bank"
                  className="uppercase py-1! h-10! text-gray-200"
                  value={paymentDetails.bank}
                  name="bank"
                  onChange={handleFormChange}
                >
                  {Bank_List.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </Select>
              ) : null}
              {(PaymentMethod.BankTransfer === paymentDetails.paymentMethod ||
                PaymentMethod.EWallet === paymentDetails.paymentMethod) && (
                <TextField
                  label="Reference No."
                  name="referenceNo"
                  value={paymentDetails.referenceNo}
                  onChange={handleFormChange}
                />
              )}
              <TextArea
                label="Note"
                name="note"
                value={paymentDetails.note}
                onChange={handleFormChange}
                className="flex-1 text-gray-300"
                containerClassName="h-full"
              />
            </div>
            <div className="sticky bottom-0 left-0 flex-none flex flex-col gap-3 py-3 bg-[#212122]">
              <div className="flex-none flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="xl"
                  fullWidth
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" size="xl" fullWidth disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
                      Saving...
                    </>
                  ) : payment?.id ? (
                    "Save Changes"
                  ) : (
                    "Add Payment"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  )
}

export default AddPaymentForm
