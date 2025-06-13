import { Expose, Type } from 'class-transformer'
import { IsIn, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class PrintHtmlRelationQuery { }
export class PrintHtmlFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class PrintHtmlSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority: 'ASC' | 'DESC'
}
