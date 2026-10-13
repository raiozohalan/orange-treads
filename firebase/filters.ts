import {
  where,
  Timestamp,
  QueryFieldFilterConstraint,
} from "firebase/firestore"

export type RangeFilter = { min?: number | Date; max?: number | Date }

const isRange = (v: unknown): v is RangeFilter =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  !(v instanceof Date) &&
  ("min" in v || "max" in v)

const toFirestoreValue = (v: unknown) =>
  v instanceof Date ? Timestamp.fromDate(v) : v

export const buildFilterConstraints = (
  filters: Record<string, unknown> = {}
): QueryFieldFilterConstraint[] => {
  const constraints: QueryFieldFilterConstraint[] = []

  Object.entries(filters).forEach(([field, value]) => {
    // Skip empty values so blank form inputs don't break the query
    if (value === undefined || value === null || value === "") return

    if (isRange(value)) {
      if (value.min !== undefined)
        constraints.push(where(field, ">=", toFirestoreValue(value.min)))
      if (value.max !== undefined)
        constraints.push(where(field, "<=", toFirestoreValue(value.max)))
    } else if (Array.isArray(value)) {
      if (value.length > 0) constraints.push(where(field, "in", value))
    } else {
      constraints.push(where(field, "==", toFirestoreValue(value)))
    }
  })

  return constraints
}
