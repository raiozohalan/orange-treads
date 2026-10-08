"use client"

import {
  AvailableSizes,
  SHOE_SIZES,
  ShoeCategory,
  ShoeRegion,
  Shoes,
  ShoesProduct,
} from "@/types/products"
import classNames from "@/utils/classNames"
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { ArrowRight } from "react-feather"

/* -------------------------------------------------------------------------- */
/* Reusable, accessible tab list (WAI-ARIA tabs pattern)                       */
/* -------------------------------------------------------------------------- */

type TabListProps = {
  label: string
  tabs: { id: string; label: string }[]
  selected: string
  onSelect: (id: string) => void
  baseId: string
  variant?: "primary" | "secondary"
}

function TabList({ label, tabs, selected, onSelect, baseId }: TabListProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index

    switch (e.key) {
      case "ArrowRight":
        next = (index + 1) % tabs.length
        break
      case "ArrowLeft":
        next = (index - 1 + tabs.length) % tabs.length
        break
      case "Home":
        next = 0
        break
      case "End":
        next = tabs.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    const nextId = tabs[next].id
    onSelect(nextId)
    refs.current[nextId]?.focus()
  }

  const base =
    "relative px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"

  const styles = {
    list: "inline-flex gap-1 rounded-[10px] p-1 dark:bg-[rgba(33,33,34,0.8)]",
    active:
      "rounded-md bg-white text-zinc-900 shadow-sm dark:bg-blue-500 dark:text-white",
    inactive:
      "rounded-md text-zinc-500 hover:text-zinc-800 dark:text-gray-400 dark:hover:text-zinc-200",
  }

  return (
    <div role="tablist" aria-label={label} className={styles.list}>
      {tabs.map((tab, i) => {
        const isSelected = tab.id === selected
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={isSelected ? `${baseId}-panel` : undefined}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`${base} ${isSelected ? styles.active : styles.inactive}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shoe size tabs: region (US / UK / EU) → category (men / women / kids …)    */
/* -------------------------------------------------------------------------- */

type ShoesSizes = Pick<Shoes, "region" | "category"> & {
  size: Shoes["size"] | null
}

interface ShoeSizeTabsProps {
  size: ShoesSizes
  availableSizes: AvailableSizes
  onSelect: (size: ShoesSizes) => void
  className?: string
}

export function ShoeSizeTabs({
  size: sizeData,
  availableSizes,
  onSelect,
  className,
}: ShoeSizeTabsProps) {
  const { category, region, size: shoeSize } = sizeData
  const uid = useId()
  const regionId = `${uid}-region`
  const categoryId = `${uid}-category`

  const availableRegions = Object.keys(availableSizes ?? {})
  const availableCategories = availableSizes
    ? Object.keys(availableSizes[region])
    : []
  const sizes = availableSizes?.[region]?.[category] ?? []
  // EU has "adult" instead of "men"/"women", so derive a valid category
  // instead of syncing state in an effect.
  const activeCategory = availableCategories.includes(category)
    ? category
    : availableCategories[0]

  const handleChange = (newData: Partial<ShoesSizes>) =>
    onSelect({
      ...sizeData,
      ...newData,
    })

  return (
    <div
      className={classNames(
        "w-full h-auto max-w-2xl space-y-4 bg-gray-600/70 p-4 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <TabList
          label="Sizing system"
          baseId={regionId}
          tabs={availableRegions.map((r) => ({ id: r, label: r }))}
          selected={region}
          onSelect={(id) =>
            handleChange({
              region: id as ShoeRegion,
            })
          }
        />
        <ArrowRight size={20} className="text-gray-400" />
        <TabList
          label={`${region} size categories`}
          baseId={categoryId}
          tabs={availableCategories.map((c) => ({
            id: c,
            label: CATEGORY_LABELS[c] ?? c,
          }))}
          selected={activeCategory}
          onSelect={(id) =>
            handleChange({
              category: id as ShoeCategory,
              size: availableSizes[0],
            })
          }
        />
      </div>
      <div
        role="tabpanel"
        id={`${regionId}-panel`}
        aria-labelledby={`${regionId}-tab-${region}`}
        className="space-y-4"
      >
        <div
          role="tabpanel"
          id={`${categoryId}-panel`}
          aria-labelledby={`${categoryId}-tab-${activeCategory}`}
          tabIndex={0}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2">
            {sizes.map((size) => (
              <li
                key={size}
                className={classNames(
                  "rounded-md border  px-2 py-2 text-center text-sm tabular-nums cursor-pointer hover:border-blue-500",
                  shoeSize && size === shoeSize
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                )}
                onClick={() =>
                  handleChange({ size: size as ShoesSizes["size"] })
                }
              >
                {size}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const REGIONS = Object.keys(SHOE_SIZES) as ShoeRegion[]

const CATEGORY_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  adult: "Adult",
}

interface ShoeSizeSelectorProps {
  availableSizes: AvailableSizes
  setAvailableSizes: (data: { region: ShoeRegion, category: ShoeCategory, size: Shoes["size"]}) => void
  className?: string
}

/**
 * Select Multiple Sizes
 * @param param0
 * @returns
 */
export function ShoeSizeSelector({
  availableSizes,
  setAvailableSizes,
  className,
}: ShoeSizeSelectorProps) {
  const uid = useId()
  const regionId = `${uid}-region`
  const categoryId = `${uid}-category`
  const [region, setRegion] = useState<ShoeRegion>("US")
  const [category, setCategory] = useState<ShoeCategory>("men")

  // EU has "adult" instead of "men"/"women", so derive a valid category
  // instead of syncing state in an effect.
  const categories = Object.keys(SHOE_SIZES[region])
  const activeCategory = categories.includes(category)
    ? category
    : categories[0]

  const sizes = useMemo(
    () => SHOE_SIZES[region][activeCategory],
    [region, activeCategory]
  )

  const currentSelectedSizes = availableSizes?.[region]?.[category] ?? []

  return (
    <div
      className={classNames(
        "w-full h-auto max-w-2xl space-y-4 bg-gray-600/70 p-4 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <TabList
          label="Sizing system"
          baseId={regionId}
          tabs={REGIONS.map((r) => ({ id: r, label: r }))}
          selected={region}
          onSelect={(id) => setRegion(id as ShoeRegion)}
        />
        <ArrowRight size={20} className="text-gray-400" />
        <TabList
          label={`${region} size categories`}
          baseId={categoryId}
          tabs={categories.map((c) => ({
            id: c,
            label: CATEGORY_LABELS[c] ?? c,
          }))}
          selected={activeCategory}
          onSelect={(id) => setCategory(id as ShoeCategory)}
        />
      </div>
      <div
        role="tabpanel"
        id={`${regionId}-panel`}
        aria-labelledby={`${regionId}-tab-${region}`}
        className="space-y-4"
      >
        <div
          role="tabpanel"
          id={`${categoryId}-panel`}
          aria-labelledby={`${categoryId}-tab-${activeCategory}`}
          tabIndex={0}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2">
            {sizes.map((size, index) => (
              <li
                key={`${size}-${index}`}
                className={classNames(
                  "rounded-md border  px-2 py-2 text-center text-sm tabular-nums cursor-pointer hover:border-blue-500",
                  currentSelectedSizes?.includes(size)
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                )}
                onClick={() => setAvailableSizes({ region, category, size})}
              >
                {size}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
