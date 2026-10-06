import { ReactNode } from "react"
import Menu, { MenuItem, MenuProps } from "../common/Menu"
import { OrderStatus } from "@/types/orders"
import { CheckCircle, Clock, Slash, Truck } from "react-feather"
import classNames from "@/utils/classNames"

const STATUS_ICON: Record<OrderStatus, ReactNode> = {
  processing: <Clock size={18} className="text-gray-400" />,
  shipped: <Truck size={18} className="text-orange-400" />,
  delivered: <CheckCircle size={18} className="text-green-600" />,
  cancelled: <Slash size={18} className="text-red-500" />,
}

interface StatusProps extends Omit<MenuProps, "label" | "items"> {
  label?: string
  status: OrderStatus
  onSelect: (item: MenuItem) => void
  className?: string
  containerClass?: string
}

const STATUS_LIST = Object.values(OrderStatus).map((stat) => ({
  label: stat,
  icon: STATUS_ICON[stat],
}))

const Status = ({
  status,
  label,
  className,
  containerClass,
  position = "top-left",
  ...rest
}: StatusProps) => {
  return (
    <div className={classNames("flex flex-col gap-1 w-full", containerClass)}>
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <Menu
        {...rest}
        label={
          <div className="flex items-center gap-2">
            {STATUS_ICON[status]} {status}
          </div>
        }
        className={classNames("w-full capitalize", className)}
        position={position}
        items={STATUS_LIST}
      />
    </div>
  )
}

export default Status
