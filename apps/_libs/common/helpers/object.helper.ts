export class ESObject {
  static keyBy = <T>(array: T[], property: keyof T) => {
    const object: Record<string, T> = {}
    array.forEach((item: T) => {
      const key = (item[property] as any).toString()
      object[key] = item
    })
    return object
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

export const mergeObject = (...params: Record<string, any>[]) => {
  const mergeTwoObject = (source: Record<string, any>, target: Record<string, any>) => {
    for (const key in target) {
      if (target[key] === undefined) continue

      if (
        typeof target[key] !== 'object'
        || Array.isArray(target[key])
        || target[key] instanceof Date
      ) {
        source[key] = target[key]
      } else {
        if (typeof source[key] !== 'object') {
          source[key] = {}
        }
        mergeTwoObject(source[key], target[key])
      }
    }
  }

  for (let i = 1; i < params.length; i++) {
    mergeTwoObject(params[0], params[i])
  }
}
