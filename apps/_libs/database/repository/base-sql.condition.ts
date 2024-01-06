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
import { ConditionAnd, ConditionType } from '../../common/dto/base-condition'

export abstract class BaseSqlCondition<_ENTITY> {
    getConditionsAnd(conditions: ConditionAnd<_ENTITY> = {}) {
        const where: FindOptionsWhere<_ENTITY> = {}
        Object.entries(conditions).forEach(([column, target]: [string, any]) => {
            if (['number', 'string', 'boolean'].includes(typeof target)) {
                return (where[column] = target)
            }
            if (target === null) {
                return (where[column] = IsNull())
            }

            if (typeof target === 'object') {
                if (Object.keys(target).length === 0) return
                if (Array.isArray(target)) {
                    return // TODO: trường hợp này typeORM chưa xử lý được, dùng RAW_QUERY thay thế
                }
                if (typeof target === 'object') {
                    const listOperator = Object.entries(target).map(([rule, value]: [string, any]) => {
                        if (rule === '>' || rule === 'GT') {
                            return MoreThan(value)
                        }
                        if (rule === '>=' || rule === 'GTE') {
                            return MoreThan(value)
                        }
                        if (rule === '<' || rule === 'LT') {
                            return LessThan(value)
                        }
                        if (rule === '<=' || rule === 'LTE') {
                            return LessThanOrEqual(value)
                        }
                        if (rule === '==' || rule === 'EQUAL') {
                            return Equal(value)
                        }
                        if (rule === '!=' || rule === 'NOT') {
                            return Not(value)
                        }
                        if (rule === 'IS_NULL') {
                            if (value === true) return IsNull()
                            if (value === false) return Not(IsNull())
                        }
                        if (rule === 'NOT_NULL') {
                            if (value === true) return Not(IsNull())
                            if (value === false) return IsNull()
                        }
                        if (rule === 'BETWEEN') {
                            return Between(value[0], value[1])
                        }
                        if (rule === 'IN') {
                            if (value.length === 0) return IsNull()
                            return In(value)
                        }
                        if (rule === 'LIKE') {
                            return Like(value)
                        }
                        if (rule === 'RAW_QUERY') {
                            return Raw((alias) => `(${value})`)
                        }
                    })
                    where[column] = And(...listOperator)
                }
            }
        })
        return where
    }

    getWhereOptions(conditions: ConditionType<_ENTITY> = {}) {
        if (Array.isArray(conditions)) {
            return conditions.map((c) => this.getConditionsAnd(c))
        }
        return this.getConditionsAnd(conditions)
    }
}
