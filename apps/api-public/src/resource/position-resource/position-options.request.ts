import {
    ConditionNumber,
    createConditionEnum,
    transformConditionEnum,
    transformConditionNumber,
} from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { PositionType } from '@libs/database/entities/position.entity'
import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator'

const ConditionEnumPositionType = createConditionEnum(PositionType)

export class PositionRelationQuery {
  @Expose()
  @IsBoolean()
  role?: boolean

  @Expose()
  @IsBoolean()
  productRequest?: boolean

  @Expose()
  @IsBoolean()
  regimenRequest?: boolean

  @Expose()
  @IsBoolean()
  procedureRequest?: boolean

  @Expose()
  @IsBoolean()
  procedureResult?: boolean

  @Expose()
  @IsBoolean()
  laboratoryRequest?: boolean

  @Expose()
  @IsBoolean()
  laboratoryGroupRequest?: boolean

  @Expose()
  @IsBoolean()
  laboratoryGroupResult?: boolean

  @Expose()
  @IsBoolean()
  radiologyRequest?: boolean

  @Expose()
  @IsBoolean()
  radiologyResult?: boolean
}

export class PositionFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PositionType))
  @IsOptional()
  positionType: PositionType | InstanceType<typeof ConditionEnumPositionType>

  @Expose()
  @IsNumber()
  roleId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  positionInteractId: number | ConditionNumber
}

export class PositionSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  positionType: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  roleId: 'ASC' | 'DESC'
}
