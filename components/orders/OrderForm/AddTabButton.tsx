import { Plus } from "react-feather"
import { Button } from "../../common"

export default function AddTabButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="primary"
      size="small"
      onClick={onClick}
      disabled={disabled}
      className="gap-1! capitalize!"
    >
      <Plus className="w-4 h-4" />
      {label}
    </Button>
  )
}
