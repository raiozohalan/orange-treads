"use client"
import classNames from "@/utils/classNames"
import React, { KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react"

type MenuPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"

export interface MenuItem {
  label: string
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
  /** Styles the item in red, e.g. for Delete */
  danger?: boolean
}

export interface MenuProps {
  items: MenuItem[]
  /** Text shown on the default trigger button */
  label?: string | ReactNode
  /** Custom trigger content (e.g. an icon). Replaces the label and chevron */
  trigger?: ReactNode
  /** Where the menu opens. Default: "bottom-left" */
  position?: MenuPosition
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  menuClassName?: string
  containerClassName?: string
  /** This trigger everytime the items is clicked and don't want to attach onClick events on menu items */
  onSelect?: (item: MenuItem) => void
}

const positionClasses: Record<MenuPosition, string> = {
  "top-left": "bottom-full left-0",
  "top-right": "bottom-full right-0",
  "bottom-left": "top-full left-0",
  "bottom-right": "top-full right-0",
}

const Menu = ({
  items,
  label = "Menu",
  trigger,
  position = "bottom-left",
  disabled,
  onSelect,
  fullWidth,
  className,
  menuClassName,
  containerClassName,
}: MenuProps) => {
  const id = useId()
  const menuId = `${id}-menu`

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const openMenu = () => {
    if (disabled) return
    setActiveIndex(items.findIndex((i) => !i.disabled))
    setOpen(true)
  }

  const closeMenu = (returnFocus = false) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  const runItem = (item: MenuItem) => {
    if (item.disabled) return
    if(onSelect) onSelect(item)
    item.onClick?.()
    closeMenu(true)
  }

  const moveActive = (dir: 1 | -1) => {
    let i = activeIndex
    for (let n = 0; n < items.length; n++) {
      i = (i + dir + items.length) % items.length
      if (!items[i].disabled) {
        setActiveIndex(i)
        return
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault()
        if (!open) openMenu()
        else moveActive(e.key === "ArrowDown" ? 1 : -1)
        break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!open) openMenu()
        else if (activeIndex >= 0) runItem(items[activeIndex])
        break
      case "Escape":
        closeMenu(true)
        break
      case "Tab":
        closeMenu()
        break
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Keep active item visible during keyboard navigation
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [open, activeIndex])

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "relative inline-block",
        fullWidth && "w-full",
        containerClassName
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={classNames(
          "flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:select-none transition-all duration-300 ease-in-out",
          fullWidth && "w-full",
          className
        )}
      >
        {trigger ?? (
          <>
            <span className="truncate">{label}</span>
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
        <ul
          ref={listRef}
          id={menuId}
          role="menu"
          className={classNames(
            "absolute z-50 w-[200px] min-w-[200px] max-h-60 overflow-auto rounded-lg border border-[#3c3d40] bg-[#212122] text-white shadow-lg",
            positionClasses[position],
            menuClassName
          )}
        >
          {items.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              data-index={index}
              role="menuitem"
              aria-disabled={item.disabled}
              onMouseEnter={() => !item.disabled && setActiveIndex(index)}
              onClick={() => runItem(item)}
              className={classNames(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                index === activeIndex && "bg-[#3c3d40]",
                item.danger && "text-red-600",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Menu