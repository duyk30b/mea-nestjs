import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionNumber } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class LaboratoryRelationQuery {
  @Expose()
  @IsBoolean()
  laboratoryGroup: boolean

  @Expose()
  @IsBoolean()
  children: boolean

  @Expose()
  @IsBoolean()
  positionList: boolean

  @Expose()
  @IsBoolean()
  discountList: boolean
}

export class LaboratoryFilterQuery {
  @Expose()
  @IsNumber()
  laboratoryGroupId: number

  @Expose()
  @IsNumber()
  level: number

  @Expose()
  @IsNumber()
  parentId: number
}

export class LaboratorySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  laboratoryCode: 'ASC' | 'DESC'
}
