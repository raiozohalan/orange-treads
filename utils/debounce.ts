type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void
}

const debounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number = 300
): DebouncedFunction<TArgs> => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = ((...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      callback(...args)
    }, delay)
  }) as DebouncedFunction<TArgs>

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

export default debounce