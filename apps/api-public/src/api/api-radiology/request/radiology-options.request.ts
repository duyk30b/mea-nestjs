import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RadiologyRelationQuery {
  @Expose()
  @IsBoolean()
  radiologyGroup: boolean

  @Expose()
  @IsBoolean()
  printHtml: boolean
}

export class RadiologyFilterQuery {
  @Expose()
  @IsNumber()
  radiologyGroupId: number

  @Expose()
  @IsNumber()
  printHtmlId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class RadiologySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority: 'ASC' | 'DESC'
}
