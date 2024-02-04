import { ConditionAnd, ConditionType } from '../common/dto'

export class BaseMongoCondition<T> {
  ruleForOneColumn(target: Record<string, any>) {
    const each = []
    Object.entries(target).forEach(([rule, value]: [string, any]) => {
      if (rule === '>' || rule === 'GT') {
        return each.push({ $gt: value })
      }
      if (rule === '>=' || rule === 'GTE') {
        return each.push({ $gte: value })
      }
      if (rule === '<=' || rule === 'LTE') {
        return each.push({ $lt: value })
      }
      if (rule === '<' || rule === 'LT') {
        return each.push({ $lte: value })
      }
      if (rule === '==' || rule === 'EQUAL') {
        return each.push({ $eq: value })
      }
      if (rule === '!=' || rule === 'NOT') {
        return each.push({ $ne: value })
      }
      if (rule === 'IS_NULL') {
        if (value === true) {
          return each.push({ $or: [{ $exists: false }, { $eq: null }] })
        }
        if (value === false) {
          return each.push({ $exists: true }, { $ne: null })
        }
      }
      if (rule === 'NOT_NULL') {
        if (value === false) {
          return each.push({ $or: [{ $exists: false }, { $eq: null }] })
        }
        if (value === true) {
          return each.push({ $exists: true }, { $ne: null })
        }
      }
      if (rule === 'BETWEEN') {
        return each.push({ $gte: value[0] }, { $lte: value[1] })
      }
      if (rule === 'IN') {
        if (value.length === 0) {
          return each.push({ $exists: true }, { $ne: null })
        }
        return each.push({ $in: value })
      }
    })

    if (each.length === 0) return { $exists: true, $ne: null }
    if (each.length === 1) return each[0]
    if (each.length > 1) return { $and: each }
  }

  getConditionsAnd(conditions: ConditionAnd<T> = {}) {
    const conditionAnd = []

    Object.entries(conditions).forEach(([column, target]: [string, any]) => {
      if (['number', 'string', 'boolean'].includes(typeof target)) {
        return conditionAnd.push({ [column]: target })
      }
      if (target === null) {
        return conditionAnd.push({
          $or: [{ [column]: null }, { [column]: { $exists: false } }],
        })
      }
      if (typeof target === 'object') {
        if (Object.keys(target).length === 0) return
        if (Array.isArray(target)) {
          if (target.length === 0) return
          if (target.length === 1) {
            return conditionAnd.push({
              [column]: this.ruleForOneColumn(target[0]),
            })
          }
          if (target.length > 1) {
            return conditionAnd.push({
              [column]: { $or: target.map((t) => this.ruleForOneColumn(t)) },
            })
          }
        } else {
          return conditionAnd.push({ [column]: this.ruleForOneColumn(target) })
        }
      }
    })

    if (conditionAnd.length === 0) return {}
    if (conditionAnd.length === 1) return conditionAnd[0]
    if (conditionAnd.length > 1) return { $and: conditionAnd }
  }

  getFilterOptions(conditions: ConditionType<T> = {}) {
    if (Array.isArray(conditions)) {
      if (conditions.length === 0) return {}
      if (conditions.length === 1) return this.getConditionsAnd(conditions[0])
      return { $or: conditions.map((c) => this.getConditionsAnd(c)) }
    }
    return this.getConditionsAnd(conditions)
  }
}
