export class ESObject {
  static keyBy = <T>(array: T[], property: keyof T) => {
    const object: Record<string, T> = {}
    array.forEach((item: T) => {
      const key = (item[property] as any).toString()
      object[key] = item
    })
    return object
  }

  static getNestedValue(obj: object, keyPath: string) {
    return keyPath.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object') {
        return acc[key]
      }
      return undefined
    }, obj)
  }

  static mergeObject(...params: Record<string, any>[]) {
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
}
