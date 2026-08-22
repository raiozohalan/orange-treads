type classes = string | undefined | null | false

const classNames = (...classes: classes[]) => {
  return classes.filter(Boolean).join(" ")
}

export default classNames
