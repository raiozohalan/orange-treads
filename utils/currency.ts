export const formatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "Php",
})

export const money = (value: number): string =>
  formatter.format(Number.isFinite(value) ? value : 0)
