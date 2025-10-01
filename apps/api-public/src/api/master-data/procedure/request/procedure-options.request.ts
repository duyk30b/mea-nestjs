import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../../_libs/common/dto/query'

export class ProcedureRelationQuery {
  @Expose()
  @IsBoolean()
  procedureGroup: boolean

  @Expose()
  @IsBoolean()
  positionList: boolean

  @Expose()
  @IsBoolean()
  discountList: boolean
}

export class ProcedureFilterQuery {
  @Expose()
  @IsNotEmpty()
  @IsString()
  searchText: string

  @Expose()
  @IsNumber()
  procedureGroupId: number

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
  code: 'ASC' | 'DESC'
}
