export const ComparisonType = [
  '>',
  'GT',
  '>=',
  'GTE',
  '<',
  'LT',
  '<=',
  'LTE',
  '==',
  'EQUAL',
  '!=',
  'NOT',
  'IS_NULL',
  'NOT_NULL',
  'LIKE',
  'IN',
  'BETWEEN',
] as const
export type ComparisonType = (typeof ComparisonType)[number]

export const transformComparisonQuery = (
  value: string,
  type?: 'Date' | 'Number',
  callback?: (value: [ComparisonType, any, any]) => void
) => {
  try {
    if (!value) return undefined // transform luôn chạy, vì thế nếu ko có thì để undefined dể ko validate
    const array: [ComparisonType, any, any] = JSON.parse(value)
    if (!Array.isArray(array) || !array.length || array.length > 3) {
      throw new Error(`${array} invalid format array`)
    }
    if (!ComparisonType.includes(array[0])) {
      throw new Error(`array[0] = ${array[0]}, not include in ${JSON.stringify(ComparisonType)}`)
    }
    if (type === 'Date') {
      if (array.length >= 2) {
        const date = new Date(array[1])
        if (array[1] == null || date.toString() === 'Invalid Date') {
          throw new Error(`array[1] = ${array[1]}, invalid date`)
        }
        array[1] = date
      }
      if (array.length == 3) {
        const date = new Date(array[2])
        if (array[2] == null || date.toString() === 'Invalid Date') {
          throw new Error(`array[2] = ${array[2]}, invalid date`)
        }
        array[2] = date
      }
    }
    if (type === 'Number') {
      if (array.length >= 2) {
        if (array[1] == null || typeof array[1] !== 'number') {
          throw new Error(`array[1] = ${array[1]}, invalid number`)
        }
      }
      if (array.length == 3) {
        if (array[2] == null || typeof array[2] !== 'number') {
          throw new Error(`array[2] = ${array[2]}, invalid number`)
        }
      }
    }
    if (callback && typeof callback === 'function') {
      callback(array)
    }
    return array
  } catch (error) {
    return `[ERROR]: ${error.message}`
  }
}
