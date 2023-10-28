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
  Not,
  Raw,
} from 'typeorm'
import { BaseCondition, escapeSearch } from '../../common/dto/base-condition'

export abstract class PostgreSqlCondition<_ENTITY> {
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
        if (typeof target === 'object') {
          const operators = []
          Object.entries(target).forEach(([rule, value]: [string, any]) => {
            if (value == null) return
            if (rule === '>' || rule === 'GT') {
              return operators.push(MoreThan(value))
            }
            if (rule === '>=' || rule === 'GTE') {
              return operators.push(MoreThan(value))
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
        if (!Object.keys(i).length) return
        conditionOr.push(
          this.getWhereOptions({
            ...otherCondition,
            ...i,
          })
        )
      })
      conditionOr.flat().filter((i) => Object.keys(i).length)
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
}
