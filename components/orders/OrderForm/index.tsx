import { OrderDetailsTab } from "./OrderDetailsTab"
import { PaymentsTab } from "./PaymentsTab"
import { FreebiesTab } from "./FreebiesTab"
import type { OrderTabDefinition } from "./types"

// First entry is the default tab.
export const ORDER_TABS: OrderTabDefinition[] = [
  OrderDetailsTab,
  PaymentsTab,
  FreebiesTab,
]
