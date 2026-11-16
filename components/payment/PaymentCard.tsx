"use client"

import type { ReactNode } from "react"
import { DollarSign, Edit, Repeat, Smartphone, Trash } from "react-feather"
import {
  Bank,
  EWalletProvider,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  type OrderPayment,
} from "@/types/orders" // adjust to wherever your payment types live
import { money } from "@/utils/currency"
import { Button } from "../common"
import { FormAction } from "@/types/common"
import { useAppStore } from "@/providers/app-store-provider"
import dayjs from "dayjs"

const E_WALLET_LABELS: Record<EWalletProvider, string> = {
  [EWalletProvider.GCash]: "GCash",
  [EWalletProvider.Maya]: "Maya",
  [EWalletProvider.Other]: "Other",
}

const BANK_LABELS: Record<Bank, string> = {
  [Bank.BDO]: "BDO",
  [Bank.BPI]: "BPI",
  [Bank.Metrobank]: "Metrobank",
  [Bank.UnionBank]: "UnionBank",
  [Bank.Landbank]: "Landbank",
  [Bank.Other]: "Other",
}

const METHOD_ICONS: Record<PaymentMethod, ReactNode> = {
  [PaymentMethod.Cash]: <DollarSign size={18} />,
  [PaymentMethod.EWallet]: <Smartphone size={18} />,
  [PaymentMethod.BankTransfer]: <Repeat size={18} />,
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="mb-0.5 text-xs font-medium text-gray-400">{label}</p>
    <p className="break-all text-gray-200">{value || "—"}</p>
  </div>
)

/** Method-specific fields. The switch narrows the union on `paymentMethod`. */
const renderMethodDetails = (payment: OrderPayment): ReactNode => {
  switch (payment.paymentMethod) {
    case PaymentMethod.EWallet:
      return (
        <>
          <Detail
            label="Provider"
            value={E_WALLET_LABELS[payment.eWalletProvider]}
          />
          <Detail label="Reference No." value={payment.referenceNo} />
        </>
      )
    case PaymentMethod.BankTransfer:
      return (
        <>
          <Detail label="Bank" value={BANK_LABELS[payment.bank]} />
          <Detail label="Reference No." value={payment.referenceNo} />
        </>
      )
    case PaymentMethod.Cash:
    default:
      return null
  }
}

type PaymentCardProps = {
  payment: OrderPayment
}

/**
 * Mobile: stacked (method + amount, details, note, actions).
 * Desktop (lg+): one aligned row -> method | details | note | amount | actions,
 * so a list of payments reads like a table and columns line up across cards.
 */
const PaymentCard = ({ payment }: PaymentCardProps) => {
  const setCurrentPayment = useAppStore((state) => state.setPayment)
  const details = renderMethodDetails(payment)

  return (
    <section className="grid grid-cols-2 items-center gap-x-4 gap-y-3 rounded-lg border border-gray-700 bg-gray-900/40 p-3 text-sm transition-colors hover:border-gray-600 lg:grid-cols-[minmax(150px,1.1fr)_minmax(0,2fr)_minmax(0,2fr)_auto_auto] lg:gap-x-6 lg:px-4 lg:py-3">
      {/* Method + date */}
      <div className="order-1 flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
          {METHOD_ICONS[payment.paymentMethod]}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold leading-tight text-blue-400">
            {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
          </p>
          <p className="text-xs text-gray-400">{dayjs(payment.date).format("MMMM DD, YYYY")}</p>
        </div>
      </div>

      {/* Method-specific details (empty cell keeps columns aligned for cash) */}
      {details ? (
        <div className="order-3 col-span-2 grid grid-cols-2 gap-3 border-t border-gray-700 pt-3 lg:order-2 lg:col-span-1 lg:border-t-0 lg:pt-0">
          {details}
        </div>
      ) : (
        <div className="hidden lg:order-2 lg:block" />
      )}

      {/* Note */}
      {payment.note ? (
        <div className="order-4 col-span-2 min-w-0 rounded-md bg-gray-800 p-3 text-xs text-gray-300 lg:order-3 lg:col-span-1 lg:bg-transparent lg:p-0 lg:text-sm">
          <p className="mb-0.5 text-xs font-medium text-gray-400">Note</p>
          <p title={payment.note} className="break-words lg:line-clamp-2">
            {payment.note}
          </p>
        </div>
      ) : (
        <div className="hidden lg:order-3 lg:block" />
      )}

      {/* Amount */}
      <p className="order-2 text-right text-base font-bold leading-none m-0 text-green-600 lg:order-4 lg:min-w-28 lg:text-lg">
        {money(payment.amount)}
      </p>

      {/* Actions */}
      <div className="order-5 col-span-2 flex justify-end gap-1 lg:col-span-1 border-l border-gray-500 pl-3">
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentPayment({
              ...payment,
              type: FormAction.Update,
            })
          }}
        >
          <Edit size={14} />
        </Button>
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentPayment({
              ...payment,
              type: FormAction.Delete,
            })
          }}
        >
          <Trash size={14} />
        </Button>
      </div>
    </section>
  )
}

export default PaymentCard
