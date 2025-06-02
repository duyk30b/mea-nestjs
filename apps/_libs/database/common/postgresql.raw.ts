import {
  And,
  Between,
  Equal,
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
} from 'typeorm'
import { BaseCondition, BaseOperator, escapeSearch } from '../../common/dto/base-condition'

const _CONVERT = (value: any) => {
  if (typeof value === 'boolean' && value) return `TRUE`
  if (typeof value === 'boolean' && !value) return `FALSE`
  if (typeof value === 'number') return `${value}`
  if (typeof value === 'string') return `'${value}'`
  return ''
}

export abstract class PostgreSqlRaw<_ENTITY> {
  getRawConditions(tableName: string, conditions: BaseCondition<_ENTITY> = {}) {
    const conditionArray = Object.entries(conditions).map(([column, target]: [string, any]) => {
      if (column === '$OR') {
        const conditionOr = target.map((i: any) => this.getRawConditions(i))
        return `(${conditionOr.join(' OR ')})`
      }

      if (target === undefined) return
      if (target == null) return `"${tableName}"."${column}" IS NULL`
      if (['number', 'string', 'boolean'].includes(typeof target)) {
        return `"${tableName}"."${column}" = ${_CONVERT(target)}`
      }

      if (typeof target === 'object') {
        if (Object.keys(target).length === 0) return
        const ruleArray = Object.entries(target).map(([rule, value]: [string, any]) => {
          if (value == null) return
          if (rule === '>' || rule === 'GT') {
            return `"${tableName}"."${column}" > ${_CONVERT(value)}`
          }
          if (rule === '>=' || rule === 'GTE') {
            return `"${tableName}"."${column}" >= ${_CONVERT(value)}`
          }
          if (rule === '<' || rule === 'LT') {
            return `"${tableName}"."${column}" < ${_CONVERT(value)}`
          }
          if (rule === '<=' || rule === 'LTE') {
            return `"${tableName}"."${column}" <= ${_CONVERT(value)}`
          }
          if (rule === '==' || rule === 'EQUAL') {
            return `"${tableName}"."${column}" = ${_CONVERT(value)}`
          }
          if (rule === '!=' || rule === 'NOT') {
            return `"${tableName}"."${column}" != ${_CONVERT(value)}`
          }
          if (rule === 'IS_NULL') {
            if (value === true) return `"${tableName}"."${column}" IS NULL`
            if (value === false) return `"${tableName}"."${column}" IS NOT NULL`
          }
          if (rule === 'NOT_NULL') {
            if (value === true) return `"${tableName}"."${column}" IS NOT NULL`
            if (value === false) return `"${tableName}"."${column}" IS NULL`
          }
          if (rule === 'BETWEEN') {
            return `"${tableName}"."${column}" BETWEEN ${_CONVERT(value[0])} AND ${_CONVERT(value[1])}`
          }
          if (rule === 'IN') {
            if (value.length === 0) return `"${tableName}"."${column}" IS NULL`
            const temp = value.map((i: any) => _CONVERT(i)).join(',')
            return `"${tableName}"."${column}" IN (${temp})`
          }
          if (rule === 'NOT_IN') {
            if (value.length === 0) return `"${tableName}"."${column}" IS NOT NULL`
            const temp = value.map((i: any) => _CONVERT(i)).join(',')
            return `"${tableName}"."${column}" NOT IN (${temp})`
          }
          if (rule === 'LIKE') {
            return `"${tableName}"."${column}" LIKE %${escapeSearch(value)}%`
          }
          if (rule === 'RAW_QUERY') {
            return value
          }
        })
        return `(${ruleArray.join(' AND ')})`
      }
    })
    return conditionArray.join(' AND ')
  }

  getConditions(conditions: BaseCondition<_ENTITY> = {}) {
    const where: FindOptionsWhere<_ENTITY> = {}
    Object.entries(conditions).forEach(([column, target]: [string, any]) => {
      if (target === undefined) return
      if (target == null) return (where[column] = IsNull())

      if (['number', 'string', 'boolean'].includes(typeof target)) {
        return (where[column] = target)
      }
      if (typeof target === 'object') {
        if (Object.keys(target).length === 0) return
        const operators = []
        Object.entries(target).forEach(([rule, value]: [string, any]) => {
          if (value == null) return
          if (rule === '>' || rule === 'GT') {
            return operators.push(MoreThan(value))
          }
          if (rule === '>=' || rule === 'GTE') {
            return operators.push(MoreThanOrEqual(value))
          }
          if (rule === '<' || rule === 'LT') {
            return operators.push(LessThan(value))
          }
          if (rule === '<=' || rule === 'LTE') {
            return operators.push(LessThanOrEqual(value))
          }
          if (rule === '==' || rule === 'EQUAL') {
            return operators.push(Equal(value))
          }
          if (rule === '!=' || rule === 'NOT') {
            return operators.push(Not(value))
          }
          if (rule === 'IS_NULL') {
            if (value === true) return operators.push(IsNull())
            if (value === false) return operators.push(Not(IsNull()))
          }
          if (rule === 'NOT_NULL') {
            if (value === true) return operators.push(Not(IsNull()))
            if (value === false) return operators.push(IsNull())
          }
          if (rule === 'BETWEEN') {
            return operators.push(Between(value[0], value[1]))
          }
          if (rule === 'IN') {
            if (value.length === 0) return operators.push(IsNull())
            return operators.push(In(value))
          }
          if (rule === 'NOT_IN') {
            if (value.length === 0) return operators.push(Not(IsNull()))
            return operators.push(Not(In(value)))
          }
          if (rule === 'LIKE') {
            const textLike = `%${escapeSearch(value)}%`
            return operators.push(Like(textLike))
          }
          if (rule === 'RAW_QUERY') {
            return operators.push(Raw((alias) => `(${value})`))
          }
        })
        if (operators.length === 1) {
          where[column] = operators[0]
        } else if (operators.length > 1) {
          where[column] = And(...operators)
        }
      }
    })
    return where
  }

  getWhereOptions(condition: BaseCondition<_ENTITY> = {}) {
    if (Object.keys(condition).length === 0) return {}
    const { $OR, ...otherCondition } = condition // xử lý riêng trường hợp $OR
    if ($OR && $OR.length) {
      const conditionOr = []
      $OR.forEach((i) => {
        if (!Object.keys(i).length) return // bỏ qua những trường hợp $OR có những object rỗng: [{},{}]
        conditionOr.push(
          this.getWhereOptions({
            ...otherCondition,
            ...i,
          })
        )
      })
      conditionOr.flat().filter((i) => Object.keys(i).length) // flat để giải quyết nhiều $OR lồng nhau
      if (conditionOr.length === 0) {
        return this.getConditions(otherCondition as any)
      } else if (conditionOr.length === 1) {
        return conditionOr[0]
      } else {
        return conditionOr
      }
    } else {
      return this.getConditions(otherCondition as any)
    }
  }

  getOperatorRaw(operator: BaseOperator<keyof _ENTITY>) {
    if (operator.ADD) {
      const str = operator.ADD.map((i) => {
        if (typeof i === 'string') return `"${i}"`
        if (typeof i === 'number') return `${i}`
        if (typeof i === 'object') {
          return this.getOperatorRaw(i)
        }
      }).join('+')
      return `(${str})`
    }
    if (operator.SUB) {
      const str = operator.SUB.map((i) => {
        if (typeof i === 'string') return `"${i}"`
        if (typeof i === 'number') return `${i}`
        if (typeof i === 'object') {
          return this.getOperatorRaw(i)
        }
      }).join('-')
      return `(${str})`
    }
    if (operator.MUL) {
      const str = operator.MUL.map((i) => {
        if (typeof i === 'string') return `"${i}"`
        if (typeof i === 'number') return `${i}`
        if (typeof i === 'object') {
          return this.getOperatorRaw(i)
        }
      }).join('*')
      return `(${str})`
    }
    if (operator.DIV) {
      const str = operator.DIV.map((i) => {
        if (typeof i === 'string') return `"${i}"`
        if (typeof i === 'number') return `${i}`
        if (typeof i === 'object') {
          return this.getOperatorRaw(i)
        }
      }).join('/')
      return `(${str})`
    }
  }
}
