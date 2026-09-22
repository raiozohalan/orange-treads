"use client"

import { WheelPrice } from "@/types/spin-wheel"
import classNames from "@/utils/classNames"
import { useMemo, useRef, useState, useCallback } from "react"

/**
 * SpinWheel
 * A reusable "spin the wheel" component for Next.js (App Router) + Tailwind.
 *
 * `percentage` values don't need to sum to 100 — they're treated as
 * relative weights and normalized automatically.
 *
 * Also exports `pickWeightedPrize(prizes)` — a standalone function that
 * randomly selects a prize based on its percentage weight, usable outside
 * the component (e.g. server-side, to decide the outcome before animating).
 */

export type Prize = Omit<WheelPrice, "isActive" | "groupId">

export interface SpinWheelProps {
  prizes: Prize[]
  onSpinEnd?: (prize: Prize) => void
  size?: number
  spinDurationMs?: number
  disabled?: boolean
  className?: string
}

interface Segment {
  prize: Prize
  color: string
  start: number
  end: number
  image: string
}

const DEFAULT_COLORS = [
  "#D85A30",
  "#378ADD",
  "#1D9E75",
  "#D4537E",
  "#EF9F27",
  "#7F77DD",
  "#639922",
  "#5DCAA5",
]

/**
 * Weighted random selection.
 * Given a list of prizes with `percentage` weights, returns one prize,
 * with probability proportional to its weight (weights need not sum to 100).
 */
export function pickWeightedPrize(prizes: Prize[]): Prize | null {
  if (!prizes || prizes.length === 0) return null

  const weights = prizes.map((p) => Math.max(0, p.percentage || 0))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  if (totalWeight <= 0) {
    // fall back to uniform random if no weights are set
    return prizes[Math.floor(Math.random() * prizes.length)]
  }

  const roll = Math.random() * totalWeight
  let cumulative = 0
  for (let i = 0; i < prizes.length; i++) {
    cumulative += weights[i]
    if (roll < cumulative) return prizes[i]
  }
  return prizes[prizes.length - 1] // safety net for float rounding
}

/** Builds the [startAngle, endAngle] (degrees, clockwise from top) for each prize. */
function buildSegments(prizes: Prize[]): Segment[] {
  const totalWeight =
    prizes.reduce((sum, p) => sum + Math.max(0, p.percentage), 0) || 1
  let cursor = 0
  return prizes.map((prize, i) => {
    const sweep = (Math.max(0, prize.percentage) / totalWeight) * 360
    const segment: Segment = {
      prize,
      color: prize.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      start: cursor,
      end: cursor + sweep,
      image: prize.image || "", // use the resolved image URL
    }
    cursor += sweep
    return segment
  })
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180 // -90 so 0deg points up
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

/** ---------------------------------------------------------------------
 * Example usage (in a page.tsx or any client component):
 * 
 * ```tsx
 * import SpinWheel, { Prize } from "@/components/SpinWheel";

 * const prizes: Prize[] = [
 *   { id: 1, name: "10% off",    percentage: 30 },
 *   { id: 2, name: "Free ship",  percentage: 25 },
 * ];
 *
 * export default function Page() {
 *   return (
 *     <SpinWheel
 *       prizes={prizes}
 *       onSpinEnd={(prize) => console.log("Winner:", prize)}
 *     />
 *   );
 * }
 * ```

 * pickWeightedPrize(prizes) can also be imported and called on its own,
 * e.g. to predetermine a result server-side before animating the wheel.
--------------------------------------------------------------------- */
export default function SpinWheel({
  prizes,
  onSpinEnd,
  size = 320,
  spinDurationMs = 4200,
  disabled = false,
  className,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Prize | null>(null)
  const spinCount = useRef(0)

  const segments = useMemo(() => buildSegments(prizes), [prizes])
  const radius = size / 2

  const handleSpin = useCallback(() => {
    if (spinning || disabled || prizes.length === 0) return

    const chosen = pickWeightedPrize(prizes)
    if (!chosen) return
    const segment = segments.find((s) => s.prize === chosen)
    if (!segment) return

    // Land the pointer (fixed at top / 0deg) in the middle of the winning slice.
    const midAngle = (segment.start + segment.end) / 2
    const extraSpins = 6 + Math.floor(Math.random() * 3) // 6-8 full spins for effect
    spinCount.current += 1

    // Small random jitter so it doesn't land on the exact same pixel every time.
    const jitter =
      (Math.random() - 0.5) * Math.min(6, segment.end - segment.start) * 0.5

    const target =
      spinCount.current * extraSpins * 360 + (360 - midAngle) + jitter

    setSpinning(true)
    setWinner(null)
    setRotation(target)

    window.setTimeout(() => {
      setSpinning(false)
      setWinner(chosen)
      onSpinEnd?.(chosen)
    }, spinDurationMs)
  }, [spinning, disabled, prizes, segments, spinDurationMs, onSpinEnd])

  return (
    <div
      className={classNames(
        "flex flex-col items-center gap-4 w-fit h-fit p-2",
        className
      )}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* pointer */}
        <div
          className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2 border-x-12 border-t-20 border-x-transparent border-t-white drop-shadow-2xl"
          aria-hidden="true"
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-full shadow-[0_0_0_6px_#2C2C2A,0_4px_14px_rgba(0,0,0,0.25)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${spinDurationMs}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : "none",
          }}
        >
          {segments.map((seg, i) => {
            const mid = (seg.start + seg.end) / 2
            const namePos = polarToCartesian(radius, radius, radius * 0.62, mid)
            return (
              <g key={seg.prize.id ?? i}>
                <path
                  d={describeSlice(
                    radius,
                    radius,
                    radius - 3,
                    seg.start,
                    seg.end
                  )}
                  fill={seg.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
                <g
                  transform={`translate(${namePos.x}, ${namePos.y}) rotate(${mid})`}
                >
                  {seg.image && (
                    <>
                      {/* Prize image */}
                      <image
                        href={seg.image}
                        x={-20}
                        y={-32}
                        width={40}
                        height={40}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </>
                  )}
                  {/* Prize name */}
                  <text
                    x={0}
                    y={25}
                    fill="#fff"
                    fontSize={Math.max(10, size * 0.035)}
                    fontWeight={500}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {seg.prize.name}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <button
            onClick={handleSpin}
            disabled={spinning || disabled || prizes.length === 0}
            className={classNames(
              "w-16 h-16 aspect-square text-sm rounded-full font-bold text-white transition-colors",
              "border-2 border-solid border-white",
              spinning
                ? "cursor-default bg-neutral-400"
                : "cursor-pointer bg-orange-600 hover:bg-orange-700"
            )}
          >
            SPIN
          </button>
        </div>
      </div>
    </div>
  )
}
