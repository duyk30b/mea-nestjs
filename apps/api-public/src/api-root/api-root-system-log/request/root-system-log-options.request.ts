import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ConditionNumber, ConditionString, SortQuery } from '../../../../../_libs/common/dto'
import { ProductFilterQuery } from '../../../api/api-product/request'

export class RootSystemLogRelationQuery { }

export class RootSystemLogFilterQuery {
  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  uid: ConditionNumber

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  oid: ConditionNumber

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  clientId: ConditionString

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  apiMethod: ConditionString

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  prefixController: ConditionString

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  url: ConditionString

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  errorMessage: ConditionString

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  quantity: ConditionNumber

  @Expose()
  @Type(() => RootSystemLogFilterQuery)
  @ValidateNested({ each: true })
  $AND: ProductFilterQuery[]

  @Expose()
  @Type(() => RootSystemLogFilterQuery)
  @ValidateNested({ each: true })
  $OR: ProductFilterQuery[]
}

export class RootSystemLogSortQuery extends SortQuery { }
