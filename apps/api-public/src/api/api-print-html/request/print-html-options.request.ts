import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PrintHtmlType } from '../../../../../_libs/database/entities/print-html.entity'

export class PrintHtmlRelationQuery {
  @Expose()
  @IsBoolean()
  radiology: boolean
}
export class PrintHtmlFilterQuery {
  @Expose()
  @IsIn(Object.keys(PrintHtmlType))
  key: keyof typeof PrintHtmlType

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class PrintHtmlSortQuery extends SortQuery { }
