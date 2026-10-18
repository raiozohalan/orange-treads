import classNames from "@/utils/classNames"

interface TableSkeletonProps {
  rows?: number
  columns: number
  /** Optional real header labels. If omitted, header cells are skeletons too. */
  headers?: string[]
  className?: string
}

// Varying widths so the skeleton looks more natural than uniform bars
const WIDTHS = ["w-3/4", "w-2/3", "w-1/2", "w-5/6"]

interface TableBodySkeletonProps {
  rows?: number
  columns: number
  className?: string // applied to each <td>
}

export const TableBodySkeleton = ({
  rows = 5,
  columns,
  className,
}: TableBodySkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td
              key={colIndex}
              className={classNames("h-11 border border-gray-600 p-2", className)}
            >
              <div
                className={classNames(
                  "h-4 animate-pulse rounded bg-gray-700",
                  colIndex === columns-1 ? "w-full" : WIDTHS[(rowIndex + colIndex) % WIDTHS.length]
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

const TableSkeleton = ({
  rows = 5,
  columns,
  headers,
  className,
}: TableSkeletonProps) => {
  return (
    <table
      aria-busy="true"
      aria-label="Loading table"
      className={classNames(
        "border-collapse border border-gray-600 w-full h-fit",
        className
      )}
    >
      <thead>
        <tr className="text-gray-400">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <th key={colIndex} className="border border-gray-600 p-2 text-left">
              {headers?.[colIndex] ?? (
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700" />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <TableBodySkeleton rows={rows} columns={columns}/>
      </tbody>
    </table>
  )
}

export default TableSkeleton
