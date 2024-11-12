import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ParaclinicalRelationQuery {
  @Expose()
  @IsBoolean()
  paraclinicalGroup: boolean

  @Expose()
  @IsBoolean()
  printHtml: boolean

  @Expose()
  @IsBoolean()
  paraclinicalAttributeList: boolean
}

export class ParaclinicalFilterQuery {
  @Expose()
  @IsNumber()
  paraclinicalGroupId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class ParaclinicalSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  price: 'ASC' | 'DESC'
}
