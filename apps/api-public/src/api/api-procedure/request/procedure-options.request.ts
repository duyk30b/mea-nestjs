import { Expose, Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProcedureRelationQuery {}

export class ProcedureFilterQuery {
  @Expose()
  @IsNotEmpty()
  @IsString()
  searchText: string

  @Expose()
  @IsString()
  group: string

  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class ProcedureSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  price: 'ASC' | 'DESC'
}
