import { doc, runTransaction } from "firebase/firestore"
import { Order, OrderPayment } from "@/types/orders"
import { ORDERS_COLLECTION } from "./firebase-orders"
import firebaseFunctions from "./firebase-functions"

type PaymentResult = Pick<Order, "paymentHistory" | "balance"> | null

const getTotalPaid = (payments: OrderPayment[]) =>
  payments.reduce((sum, p) => sum + p.amount, 0)

// balance is always derived, so it can't drift from the history
const computeBalance = (order: Order, payments: OrderPayment[]) =>
  order.total - order.downPayment - getTotalPaid(payments)

const getOrderRef = (orderId: string) =>
  firebaseFunctions.db
    ? doc(firebaseFunctions.db, ORDERS_COLLECTION, orderId)
    : null

const addPayment = async (
  orderId: string,
  payment: OrderPayment
): Promise<PaymentResult> => {
  if (!firebaseFunctions.db) return null

  return runTransaction(firebaseFunctions.db, async (tx) => {
    const ref = getOrderRef(orderId)

    if (!ref) return null

    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Order not found")

    const order = snap.data() as Order
    const paymentHistory = [...(order.paymentHistory ?? []), payment]
    const balance = computeBalance(order, paymentHistory)

    tx.update(ref, { paymentHistory, balance, dateUpdated: new Date() })
    return { paymentHistory, balance }
  })
}

const updatePayment = async (
  orderId: string,
  payment: OrderPayment // full payment, must keep the existing id
): Promise<PaymentResult> => {
  if (!firebaseFunctions.db) return null

  return runTransaction(firebaseFunctions.db, async (tx) => {
    const ref = getOrderRef(orderId)

    if (!ref) return null

    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Order not found")

    const order = snap.data() as Order
    const current = order.paymentHistory ?? []
    if (!current.some((p) => p.id === payment.id)) {
      throw new Error("Payment not found")
    }

    // replace the whole item, so fields from the old method don't linger
    const paymentHistory = current.map((p) =>
      p.id === payment.id ? payment : p
    )
    const balance = computeBalance(order, paymentHistory)

    tx.update(ref, { paymentHistory, balance, dateUpdated: new Date() })
    return { paymentHistory, balance }
  })
}

const deletePayment = async (
  orderId: string,
  paymentId: string
): Promise<PaymentResult> => {
  if (!firebaseFunctions.db) return null

  return runTransaction(firebaseFunctions.db, async (tx) => {
    const ref = getOrderRef(orderId)

    if (!ref) return null

    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Order not found")

    const order = snap.data() as Order
    const current = order.paymentHistory ?? []
    const paymentHistory = current.filter((p) => p.id !== paymentId)
    if (paymentHistory.length === current.length) {
      throw new Error("Payment not found")
    }

    const balance = computeBalance(order, paymentHistory)

    tx.update(ref, { paymentHistory, balance, dateUpdated: new Date() })
    return { paymentHistory, balance }
  })
}

export const paymentsFirebase = {
  addPayment,
  updatePayment,
  deletePayment,
}
