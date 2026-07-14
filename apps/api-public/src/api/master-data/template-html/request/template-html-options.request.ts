import { ConditionTimestamp, SortQuery } from '@libs/common/dto'
import { Expose, Type } from 'class-transformer'
import { IsIn, ValidateNested } from 'class-validator'

export class TemplateHtmlRelationQuery { }
export class TemplateHtmlFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class TemplateHtmlSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority: 'ASC' | 'DESC'
}
