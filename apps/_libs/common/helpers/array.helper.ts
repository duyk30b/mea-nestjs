export class ESArray {
  static arrayToKeyValue = <T>(array: T[], property: keyof T) => {
    const object: Record<string, T> = {}
    array.forEach((item: T) => {
      const key = (item[property] as any).toString()
      object[key] = item
    })
    return object
  }

  static arrayToKeyArray = <T>(array: T[], property: keyof T) => {
    const object: Record<string, T[]> = {}
    array.forEach((item: T) => {
      const key = (item[property] as any).toString()
      if (!object[key]) object[key] = []
      object[key].push(item)
    })
    return object
  }

  static checkDuplicate = <T>(array: T[], property: keyof T) => {
    const map = new Map<any, number[]>()
    array.forEach((item, index) => {
      const value = item[property]
      if (!map.has(value)) map.set(value, [])
      map.get(value)!.push(index)
    })
    const result: { value: any; indices: number[] }[] = []
    for (const [value, indices] of map.entries()) {
      if (indices.length > 1) {
        result.push({ value, indices })
      }
    }
    return result
  }

  static uniqueArray = <T>(array: T[]) => {
    return Array.from(new Set(array))
  }

  static max = <
    T,
    K extends { [P in keyof T]: T[P] extends number | string | Date ? P : never }[keyof T],
  >(
    array: T[],
    property: K
  ): T[K] | undefined => {
    if (array.length === 0) return undefined

    return array.reduce((maxValue, item) => {
      const currentValue = item[property]
      return maxValue < currentValue ? currentValue : maxValue
    }, array[0][property])
  }
}

export const uniqueArray = <T>(array: T[]) => {
  return Array.from(new Set(array))
}

export const arrayToKeyValue = <T>(array: T[], property: keyof T) => {
  const object: Record<string, T> = {}
  array.forEach((item: T) => {
    const key = (item[property] as any).toString()
    object[key] = item
  })
  return object
}
