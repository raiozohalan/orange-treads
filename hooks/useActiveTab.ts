import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { OrderTabDefinition } from "@/components/orders/OrderForm/types"
import { ORDER_TABS } from "@/components/orders/OrderForm/index"

export function useActiveTab(isUpdateMode: boolean) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Tabs only exist in update mode; create mode is always the first tab.
  const requested = searchParams.get("tab")
  const activeTab: OrderTabDefinition =
    (isUpdateMode && ORDER_TABS.find((t) => t.id === requested)) ||
    ORDER_TABS[0]

  const setActiveTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`${pathname}?${params.toString()}`)
  }

  return { activeTab, setActiveTab }
}
