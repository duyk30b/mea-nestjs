import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'

export class DiscountRelationQuery {
  @Expose()
  @IsBoolean()
  product?: boolean

  @Expose()
  @IsBoolean()
  regimen?: boolean

  @Expose()
  @IsBoolean()
  procedure?: boolean

  @Expose()
  @IsBoolean()
  laboratory?: boolean

  @Expose()
  @IsBoolean()
  radiology?: boolean
}

export class DiscountFilterQuery {
  @Expose()
  @IsNumber()
  discountInteractId: number
}

export class DiscountSortQuery extends SortQuery { }
