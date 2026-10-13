// Lowercase, strip accents/punctuation so "Piña  Colada!" -> "pina colada"
export const normalizeSearchTerm = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

export const tokenize = (text: string): string[] =>
  normalizeSearchTerm(text).split(" ").filter(Boolean)

// Reads "name", or nested paths like "category.name". Arrays are flattened.
const getValueByPath = (obj: any, path: string): unknown =>
  path.split(".").reduce((acc, key) => acc?.[key], obj)

const toStrings = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.flatMap(toStrings)
  if (typeof value === "string") return [value]
  if (typeof value === "number") return [String(value)]
  return []
}

/**
 * Builds searchKeywords from only the fields you list.
 * buildSearchKeywords(product, ["name", "sku", "category", "tags"])
 */
export const buildSearchKeywords = <T extends Record<string, any>>(
  item: T,
  fields: readonly string[]
): string[] => {
  const keywords = new Set<string>()

  fields.forEach((field) => {
    toStrings(getValueByPath(item, field)).forEach((text) => {
      tokenize(text).forEach((word) => {
        const maxLen = Math.min(word.length, 20)
        for (let i = 1; i <= maxLen; i++) keywords.add(word.slice(0, i))
      })
    })
  })

  return [...keywords]
}