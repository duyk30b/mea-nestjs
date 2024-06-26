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

export const arrayToKeyArray = <T>(array: T[], property: keyof T) => {
  const object: Record<string, T[]> = {}
  array.forEach((item: T) => {
    const key = (item[property] as any).toString()
    if (!object[key]) object[key] = []
    object[key].push(item)
  })
  return object
}

export const checkDuplicate = <T>(array: T[], property: keyof T) => {
  const arrayProperty = array.map((item) => item[property])
  const arrayPropertyUnique = Array.from(new Set(arrayProperty))
  return array.length !== arrayPropertyUnique.length
}
