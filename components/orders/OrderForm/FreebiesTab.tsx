"use client"

import { Gift } from "react-feather"
import AddTabButton from "./AddTabButton"
import type { OrderTabDefinition } from "./types"

// TODO: build the freebies list + form. Previously this tab fell through
// to <PaymentsList />, which looked like a bug.
const Content = () => (
  <p className="text-sm text-gray-400 py-6 text-center">No freebies yet.</p>
)

const Summary = () => null

const AddButton = () => (
  <AddTabButton label="Add Freebie" onClick={() => {}} disabled />
)

export const FreebiesTab: OrderTabDefinition = {
  id: "freebies",
  label: "Freebies",
  icon: <Gift size={16} />,
  Content,
  Summary,
  AddButton,
}
