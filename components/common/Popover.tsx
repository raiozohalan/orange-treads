"use client"
import classNames from "@/utils/classNames"
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

type PopoverPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"

export interface PopoverProps {
  /** Content of the panel. Pass a function to get a `close` helper */
  children: ReactNode | ((helpers: { close: () => void }) => ReactNode)
  /** Text shown on the default trigger button */
  label?: string | ReactNode
  /** Custom trigger content (e.g. an icon). Replaces the label and chevron */
  trigger?: ReactNode
  /** Where the panel opens. Default: "bottom-left" */
  position?: PopoverPosition
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  panelClassName?: string
  containerClassName?: string
  /** Fires whenever the panel opens or closes */
  onOpenChange?: (open: boolean) => void
}

const positionClasses: Record<PopoverPosition, string> = {
  "top-left": "bottom-full left-0 mb-1",
  "top-right": "bottom-full right-0 mb-1",
  "bottom-left": "top-full left-0 mt-1",
  "bottom-right": "top-full right-0 mt-1",
}

const Popover = ({
  children,
  label = "Open",
  trigger,
  position = "bottom-left",
  disabled,
  fullWidth,
  className,
  panelClassName,
  containerClassName,
  onOpenChange,
}: PopoverProps) => {
  const id = useId()
  const panelId = `${id}-panel`

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const changeOpen = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const close = (returnFocus = false) => {
    changeOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation()
      close(true)
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      className={classNames(
        "relative inline-block",
        fullWidth && "w-full",
        containerClassName
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : changeOpen(true))}
        className={classNames(
          "flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none transition-all duration-300 ease-in-out cursor-pointer",
          fullWidth && "w-full",
          className
        )}
      >
        {trigger ?? (
          <>
            <span className="flex items-center gap-1.5 truncate">{label}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className={classNames(
                "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          className={classNames(
            "absolute z-50 min-w-[200px] max-h-80 overflow-auto rounded-lg border border-[#3c3d40] bg-[#212122] p-3 text-white shadow-lg",
            positionClasses[position],
            panelClassName
          )}
        >
          {typeof children === "function"
            ? children({ close: () => close(true) })
            : children}
        </div>
      )}
    </div>
  )
}

export default Popover
