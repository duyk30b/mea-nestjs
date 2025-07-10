import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator'
import {
    ConditionNumber,
    createConditionEnum,
    transformConditionEnum,
    transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'

const ConditionEnumPositionInteractType = createConditionEnum(PositionInteractType)

export class PositionRelationQuery {
  @Expose()
  @IsBoolean()
  role?: boolean

  @Expose()
  @IsBoolean()
  product?: boolean

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

export class PositionFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PositionInteractType))
  @IsOptional()
  positionType: PositionInteractType | InstanceType<typeof ConditionEnumPositionInteractType>

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
