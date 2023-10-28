export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout> | null

  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, delay)
  }
}

export const debounceAsync = (func: (...args: any[]) => Promise<any>, delay: number) => {
  let state = 0

  return async (...args: any[]): Promise<any> => {
    state++
    const current: number = state
    await new Promise((resolve) => setTimeout(resolve, delay))
    if (current !== state) return null

    return await func(...args)
  }
}

export const throttle = (func: (...args: any[]) => void, delay: number) => {
  let lastCall = 0

  return function (...args: any[]) {
    const now = new Date().getTime()

    if (now - lastCall >= delay) {
      lastCall = now
      return func(...args)
    }
  }
}

export const sleep = async (time: number) => {
  await new Promise((resolve) => setTimeout(resolve, time))
}
