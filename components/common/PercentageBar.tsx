import classNames from "@/utils/classNames"

interface PercentageBarProps {
  percentage: number
  label?: string
  progressColor?: string
  containerColor?: string
  className?: string
}

const PercentageBar = ({
  percentage,
  label = "Chance",
  progressColor = "#16a34a",
  containerColor = "#374151",
  className,
}: PercentageBarProps) => {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedPercentage}
      aria-valuetext={`${percentage}% ${label}`}
      className={classNames(
        "relative flex flex-1 items-center justify-center w-full rounded-full overflow-hidden",
        className
      )}
      style={{ backgroundColor: containerColor }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${normalizedPercentage}%`,
          backgroundColor: progressColor,
        }}
      />
      <span className="relative px-2 overflow-hidden text-xs text-white text-shadow-2xs font-bold">
        {percentage}% {label}
      </span>
    </div>
  )
}

export default PercentageBar
