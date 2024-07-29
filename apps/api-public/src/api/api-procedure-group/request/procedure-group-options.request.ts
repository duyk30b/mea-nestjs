import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProcedureGroupRelationQuery { }
export class ProcedureGroupFilterQuery {

}

export class ProcedureGroupSortQuery extends SortQuery { }
