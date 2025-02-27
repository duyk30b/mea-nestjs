import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator'
import {
  ConditionNumber,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'

const ConditionEnumInteractType = createConditionEnum(InteractType)

export class CommissionRelationQuery {
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

export class CommissionFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, InteractType))
  @IsOptional()
  interactType: InteractType | InstanceType<typeof ConditionEnumInteractType>

  @Expose()
  @IsNumber()
  roleId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  interactId: number | ConditionNumber
}

export class CommissionSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  interactType: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  roleId: 'ASC' | 'DESC'
}
