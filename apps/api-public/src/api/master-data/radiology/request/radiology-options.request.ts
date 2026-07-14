import { ConditionTimestamp } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'

export class RadiologyRelationQuery {
  @Expose()
  @IsBoolean()
  radiologyGroup: boolean

  @Expose()
  @IsBoolean()
  templateHtml: boolean

  @Expose()
  @IsBoolean()
  positionList: boolean

  @Expose()
  @IsBoolean()
  discountList: boolean
}

export class RadiologyFilterQuery {
  @Expose()
  @IsNumber()
  radiologyGroupId: number

  @Expose()
  @IsNumber()
  templateHtmlId: number

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
  radiologyCode: 'ASC' | 'DESC'
}
